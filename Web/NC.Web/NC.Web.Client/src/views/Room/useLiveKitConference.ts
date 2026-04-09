import { getConference } from "@noobz-cord/api";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteAudioTrack,
  type RemoteParticipant,
} from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  playParticipantJoinSound,
  playParticipantLeaveSound,
} from "./conferenceSounds";

export interface ChatMessage {
  type: "chat";
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: number;
}

export interface ParticipantAudioPreference {
  /** 0–1 effective linear gain for this client's playback */
  volume: number;
  mutedForSelf: boolean;
}

export function defaultAudioPref(): ParticipantAudioPreference {
  return { volume: 1, mutedForSelf: false };
}

export interface ConnectOptions {
  micDeviceId?: string;
  camDeviceId?: string;
  micEnabled: boolean;
  camEnabled: boolean;
}

export function useLiveKitConference() {
  const roomRef = useRef<Room | null>(null);
  const allowJoinSoundsRef = useRef(false);
  const joinSoundDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localDisconnectRef = useRef(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [audioPrefs, setAudioPrefs] = useState<
    Record<string, ParticipantAudioPreference>
  >({});
  const [deafened, setDeafened] = useState(false);
  const [tick, setTick] = useState(0);
  const [roomLabel, setRoomLabel] = useState<string | null>(null);

  const bump = useCallback(() => setTick((n) => n + 1), []);

  const disconnect = useCallback(() => {
    const r = roomRef.current;
    if (r) {
      localDisconnectRef.current = true;
      if (joinSoundDelayTimerRef.current !== null) {
        clearTimeout(joinSoundDelayTimerRef.current);
        joinSoundDelayTimerRef.current = null;
      }
      allowJoinSoundsRef.current = false;
      r.disconnect();
      roomRef.current = null;
      setRoom(null);
      setChatMessages([]);
      setRoomLabel(null);
      window.setTimeout(() => {
        localDisconnectRef.current = false;
      }, 600);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (joinSoundDelayTimerRef.current !== null) {
        clearTimeout(joinSoundDelayTimerRef.current);
        joinSoundDelayTimerRef.current = null;
      }
      const r = roomRef.current;
      if (r) {
        r.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  const connect = useCallback(async (options: ConnectOptions) => {
    if (roomRef.current) {
      throw new Error("Already connected.");
    }
    setConnecting(true);
    setError(null);
    try {
      const res = await getConference().postApiConferenceJoin();
      if (!res?.token || !res.server || !res.room) {
        throw new Error("Could not join the conference (missing token or server).");
      }
      const r = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = r;

      allowJoinSoundsRef.current = false;
      if (joinSoundDelayTimerRef.current !== null) {
        clearTimeout(joinSoundDelayTimerRef.current);
        joinSoundDelayTimerRef.current = null;
      }

      const onActivity = () => bump();
      r.on(RoomEvent.ParticipantConnected, () => {
        onActivity();
        if (allowJoinSoundsRef.current) {
          playParticipantJoinSound();
        }
      });
      r.on(RoomEvent.ParticipantDisconnected, () => {
        onActivity();
        if (!localDisconnectRef.current) {
          playParticipantLeaveSound();
        }
      });
      r.on(RoomEvent.TrackSubscribed, onActivity);
      r.on(RoomEvent.TrackUnsubscribed, onActivity);
      r.on(RoomEvent.TrackPublished, onActivity);
      r.on(RoomEvent.TrackUnpublished, onActivity);
      r.on(RoomEvent.LocalTrackPublished, onActivity);
      r.on(RoomEvent.LocalTrackUnpublished, onActivity);
      r.on(RoomEvent.TrackMuted, onActivity);
      r.on(RoomEvent.TrackUnmuted, onActivity);
      r.on(RoomEvent.ConnectionStateChanged, onActivity);

      const onData = (payload: Uint8Array, participant?: RemoteParticipant) => {
        try {
          const text = new TextDecoder().decode(payload);
          const msg = JSON.parse(text) as ChatMessage;
          if (msg.type === "chat" && typeof msg.text === "string") {
            const senderName =
              msg.senderName ||
              participant?.name ||
              participant?.identity ||
              "Guest";
            setChatMessages((prev) => [
              ...prev,
              { ...msg, senderName, senderId: msg.senderId || participant?.identity || "" },
            ]);
          }
        } catch {
          /* ignore malformed payloads */
        }
      };
      r.on(RoomEvent.DataReceived, onData);

      await r.connect(res.server, res.token);
      setRoomLabel(res.room);
      await r.localParticipant.setMicrophoneEnabled(
        options.micEnabled,
        options.micDeviceId ? { deviceId: options.micDeviceId } : undefined,
      );
      await r.localParticipant.setCameraEnabled(
        options.camEnabled,
        options.camDeviceId ? { deviceId: options.camDeviceId } : undefined,
      );

      joinSoundDelayTimerRef.current = window.setTimeout(() => {
        allowJoinSoundsRef.current = true;
        joinSoundDelayTimerRef.current = null;
      }, 3000);

      setRoom(r);
      bump();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed.";
      setError(msg);
      if (joinSoundDelayTimerRef.current !== null) {
        clearTimeout(joinSoundDelayTimerRef.current);
        joinSoundDelayTimerRef.current = null;
      }
      allowJoinSoundsRef.current = false;
      const failed = roomRef.current;
      if (failed) {
        try {
          failed.disconnect();
        } catch {
          /* ignore */
        }
        roomRef.current = null;
      }
      throw e;
    } finally {
      setConnecting(false);
    }
  }, [bump]);

  const sendChat = useCallback(
    (text: string) => {
      const r = roomRef.current;
      if (!r || !text.trim()) return;
      const msg: ChatMessage = {
        type: "chat",
        id: crypto.randomUUID(),
        senderId: r.localParticipant.identity,
        senderName: r.localParticipant.name || r.localParticipant.identity || "You",
        text: text.trim(),
        sentAt: Date.now(),
      };
      const data = new TextEncoder().encode(JSON.stringify(msg));
      r.localParticipant.publishData(data, { reliable: true });
      setChatMessages((prev) => [...prev, msg]);
    },
    [],
  );

  const setParticipantPref = useCallback(
    (identity: string, patch: Partial<ParticipantAudioPreference>) => {
      setAudioPrefs((prev) => ({
        ...prev,
        [identity]: { ...defaultAudioPref(), ...prev[identity], ...patch },
      }));
    },
    [],
  );

  const toggleMic = useCallback(async () => {
    const r = roomRef.current;
    if (!r) return;
    const next = !r.localParticipant.isMicrophoneEnabled;
    await r.localParticipant.setMicrophoneEnabled(next);
    bump();
  }, [bump]);

  const toggleCamera = useCallback(async () => {
    const r = roomRef.current;
    if (!r) return;
    const next = !r.localParticipant.isCameraEnabled;
    await r.localParticipant.setCameraEnabled(next);
    bump();
  }, [bump]);

  const toggleScreenShare = useCallback(async () => {
    const r = roomRef.current;
    if (!r) return;
    await r.localParticipant.setScreenShareEnabled(!r.localParticipant.isScreenShareEnabled);
    bump();
  }, [bump]);

  const switchMic = useCallback(
    async (deviceId: string) => {
      const r = roomRef.current;
      if (!r) return;
      await r.switchActiveDevice("audioinput", deviceId);
      bump();
    },
    [bump],
  );

  const switchCamera = useCallback(
    async (deviceId: string) => {
      const r = roomRef.current;
      if (!r) return;
      await r.switchActiveDevice("videoinput", deviceId);
      bump();
    },
    [bump],
  );

  return {
    room,
    roomLabel,
    connecting,
    error,
    tick,
    connect,
    disconnect,
    sendChat,
    chatMessages,
    deafened,
    setDeafened,
    audioPrefs,
    setParticipantPref,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    switchMic,
    switchCamera,
  };
}

export function collectRemoteAudioTracks(
  room: Room,
): { participantIdentity: string; track: RemoteAudioTrack; key: string }[] {
  const out: { participantIdentity: string; track: RemoteAudioTrack; key: string }[] = [];
  for (const p of room.remoteParticipants.values()) {
    for (const pub of p.audioTrackPublications.values()) {
      if (pub.track && pub.kind === Track.Kind.Audio) {
        out.push({
          participantIdentity: p.identity,
          track: pub.track as RemoteAudioTrack,
          key: `${p.identity}-${pub.trackSid}`,
        });
      }
    }
  }
  return out;
}
