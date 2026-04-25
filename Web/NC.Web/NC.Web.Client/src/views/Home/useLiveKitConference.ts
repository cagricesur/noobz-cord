import { getConference } from "@noobz-cord/api";
import { getAccessToken } from "@noobz-cord/api/axios-instance";
import * as signalR from "@microsoft/signalr";
import {
  Room,
  RoomEvent,
  Track,
  supportsAudioOutputSelection,
  type RemoteAudioTrack,
  type RemoteParticipant,
} from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

import { playParticipantJoinSound, playParticipantLeaveSound } from "./utils";

export interface ChatMessage {
  type: "chat";
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: number;
}

export interface IParticipantAudioPreference {
  /** 0–1 effective linear gain for this client's playback */
  volume: number;
  mutedForSelf: boolean;
}

export function defaultAudioPref(): IParticipantAudioPreference {
  return { volume: 1, mutedForSelf: false };
}

export interface IConnectOptions {
  micDeviceId?: string;
  camDeviceId?: string;
  /** When supported (e.g. Chromium), routes remote audio to this output device. */
  audioOutputDeviceId?: string;
  /** Start with remote audio muted for you (e.g. pre-join “speaker off”). */
  joinDeafened?: boolean;
  micEnabled: boolean;
  camEnabled: boolean;
}

interface ConferenceJoinStatus {
  hasDuplicate: boolean;
  message?: string | null;
}

interface ConferenceJoinDecision {
  accepted: boolean;
  message?: string | null;
}

export function useLiveKitConference() {
  const roomRef = useRef<Room | null>(null);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  const hubStartPromiseRef = useRef<Promise<signalR.HubConnection> | null>(
    null,
  );
  const conferenceRegisteredRef = useRef(false);
  const allowJoinSoundsRef = useRef(false);
  const joinSoundDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const localDisconnectRef = useRef(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [audioPrefs, setAudioPrefs] = useState<
    Record<string, IParticipantAudioPreference>
  >({});
  const [deafened, setDeafened] = useState(false);
  const [tick, setTick] = useState(0);

  /** Synced so other clients can show deafen on your tile (requires canUpdateOwnMetadata on token). */
  useEffect(() => {
    const r = roomRef.current;
    if (!r) return;
    void r.localParticipant
      .setAttributes({ nc_deafened: deafened ? "1" : "0" })
      .catch(() => {
        /* permission or transient failure */
      });
  }, [deafened, room]);
  const [roomLabel, setRoomLabel] = useState<string | null>(null);

  const bump = useCallback(() => setTick((n) => n + 1), []);

  const unregisterConferenceSession = useCallback(async () => {
    const connection = hubConnectionRef.current;

    if (
      !conferenceRegisteredRef.current ||
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      conferenceRegisteredRef.current = false;
      return;
    }

    conferenceRegisteredRef.current = false;
    await connection.invoke("EndConferenceSession");
  }, []);

  const stopHubConnection = useCallback(async () => {
    const connection = hubConnectionRef.current;
    hubStartPromiseRef.current = null;
    hubConnectionRef.current = null;

    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      await connection.stop();
    }
  }, []);

  const disconnect = useCallback((notifyHub = true, message?: string) => {
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
      setDeafened(false);
      window.setTimeout(() => {
        localDisconnectRef.current = false;
      }, 600);
    }

    if (message) {
      setError(message);
    }

    if (notifyHub) {
      void unregisterConferenceSession().finally(() => {
        void stopHubConnection();
      });
    } else {
      conferenceRegisteredRef.current = false;
      void stopHubConnection();
    }
  }, [stopHubConnection, unregisterConferenceSession]);

  const ensureHubConnection = useCallback(async () => {
    const existingConnection = hubConnectionRef.current;
    if (
      existingConnection?.state === signalR.HubConnectionState.Connected
    ) {
      return existingConnection;
    }

    if (hubStartPromiseRef.current) {
      return hubStartPromiseRef.current;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/noobzcord", {
        accessTokenFactory: async () => (await getAccessToken()) ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ConferenceInstanceKicked", (message?: string) => {
      disconnect(
        false,
        message ??
          "You were signed off because this user joined the conference from another instance.",
      );
    });

    connection.onreconnecting(() => {
      conferenceRegisteredRef.current = false;
    });

    connection.onreconnected(() => {
      if (!roomRef.current) return;

      void connection
        .invoke<ConferenceJoinStatus>("BeginConferenceJoin")
        .then((status) => {
          if (status.hasDuplicate) {
            disconnect(
              false,
              "You were signed off because this user joined the conference from another instance.",
            );
            return;
          }

          conferenceRegisteredRef.current = true;
        })
        .catch(() => {
          disconnect(false, "Conference session synchronization failed.");
        });
    });

    connection.onclose(() => {
      conferenceRegisteredRef.current = false;
      if (hubConnectionRef.current === connection) {
        hubConnectionRef.current = null;
      }
      hubStartPromiseRef.current = null;
    });

    hubConnectionRef.current = connection;
    hubStartPromiseRef.current = connection.start().then(() => connection);

    try {
      return await hubStartPromiseRef.current;
    } finally {
      hubStartPromiseRef.current = null;
    }
  }, [disconnect]);

  const confirmSingleConferenceInstance = useCallback(async () => {
    const connection = await ensureHubConnection();
    const status = await connection.invoke<ConferenceJoinStatus>(
      "BeginConferenceJoin",
    );

    if (!status.hasDuplicate) {
      conferenceRegisteredRef.current = true;
      return;
    }

    const replaceExisting = window.confirm(
      status.message ??
        "Only one instance of the same user can be in the conference room. Do you want to sign off the currently joined instance and continue here?",
    );

    const decision = await connection.invoke<ConferenceJoinDecision>(
      "ResolveDuplicateConferenceInstance",
      replaceExisting,
    );

    if (!decision.accepted) {
      conferenceRegisteredRef.current = false;
      void stopHubConnection();
      throw new Error(decision.message ?? "Conference join cancelled.");
    }

    conferenceRegisteredRef.current = true;
  }, [ensureHubConnection, stopHubConnection]);

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
      void unregisterConferenceSession().finally(() => {
        void stopHubConnection();
      });
    };
  }, [stopHubConnection, unregisterConferenceSession]);

  const connect = useCallback(
    async (options: IConnectOptions) => {
      if (roomRef.current) {
        throw new Error("Already connected.");
      }
      setConnecting(true);
      setError(null);
      try {
        await confirmSingleConferenceInstance();
        const res = await getConference().getApiConferenceJoin();
        if (!res?.token || !res.server || !res.room) {
          throw new Error(
            "Could not join the conference (missing token or server).",
          );
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
        r.on(RoomEvent.ActiveSpeakersChanged, onActivity);
        r.on(RoomEvent.ConnectionQualityChanged, onActivity);
        r.on(RoomEvent.ConnectionStateChanged, onActivity);
        r.on(RoomEvent.ParticipantAttributesChanged, onActivity);

        const onData = (
          payload: Uint8Array,
          participant?: RemoteParticipant,
        ) => {
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
                {
                  ...msg,
                  senderName,
                  senderId: msg.senderId || participant?.identity || "",
                },
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

        if (options.audioOutputDeviceId && supportsAudioOutputSelection()) {
          try {
            await r.switchActiveDevice(
              "audiooutput",
              options.audioOutputDeviceId,
            );
          } catch {
            /* unsupported or device gone */
          }
        }

        joinSoundDelayTimerRef.current = window.setTimeout(() => {
          allowJoinSoundsRef.current = true;
          joinSoundDelayTimerRef.current = null;
        }, 3000);

        setDeafened(options.joinDeafened === true);
        setRoom(r);
        bump();
      } catch (e) {
        setDeafened(false);
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
        await unregisterConferenceSession().finally(() => {
          void stopHubConnection();
        });
        throw e;
      } finally {
        setConnecting(false);
      }
    },
    [
      bump,
      confirmSingleConferenceInstance,
      stopHubConnection,
      unregisterConferenceSession,
    ],
  );

  const sendChat = useCallback((text: string) => {
    const r = roomRef.current;
    if (!r || !text.trim()) return;
    const msg: ChatMessage = {
      type: "chat",
      id: crypto.randomUUID(),
      senderId: r.localParticipant.identity,
      senderName:
        r.localParticipant.name || r.localParticipant.identity || "You",
      text: text.trim(),
      sentAt: Date.now(),
    };
    const data = new TextEncoder().encode(JSON.stringify(msg));
    r.localParticipant.publishData(data, { reliable: true });
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  const setParticipantPref = useCallback(
    (identity: string, patch: Partial<IParticipantAudioPreference>) => {
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
    await r.localParticipant.setScreenShareEnabled(
      !r.localParticipant.isScreenShareEnabled,
    );
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

  const switchAudioOutput = useCallback(
    async (deviceId: string) => {
      const r = roomRef.current;
      if (!r || !supportsAudioOutputSelection()) return;
      try {
        await r.switchActiveDevice("audiooutput", deviceId);
        bump();
      } catch {
        /* device invalid or blocked */
      }
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
    switchAudioOutput,
  };
}

export function collectRemoteAudioTracks(
  room: Room,
): { participantIdentity: string; track: RemoteAudioTrack; key: string }[] {
  const out: {
    participantIdentity: string;
    track: RemoteAudioTrack;
    key: string;
  }[] = [];
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
