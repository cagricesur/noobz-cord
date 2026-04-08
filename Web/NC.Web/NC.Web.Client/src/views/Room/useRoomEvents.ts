import { Room, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";

const ROOM_BUMP_EVENTS: RoomEvent[] = [
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.TrackSubscribed,
  RoomEvent.TrackUnsubscribed,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.ActiveSpeakersChanged,
  RoomEvent.ConnectionStateChanged,
  RoomEvent.Reconnecting,
  RoomEvent.Reconnected,
];

/**
 * Forces React re-renders when the LiveKit room model changes.
 */
export function useRoomEvents(room: Room | null): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!room) {
      return;
    }
    const bump = () => {
      setVersion((v) => v + 1);
    };
    ROOM_BUMP_EVENTS.forEach((ev) => {
      room.on(ev, bump);
    });
    return () => {
      ROOM_BUMP_EVENTS.forEach((ev) => {
        room.off(ev, bump);
      });
    };
  }, [room]);

  return version;
}
