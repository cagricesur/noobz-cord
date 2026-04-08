import type { Participant, RemoteParticipant } from "livekit-client";
import { Track } from "livekit-client";

export function sortParticipants(room: {
  localParticipant: Participant;
  remoteParticipants: Map<string, RemoteParticipant>;
}): Participant[] {
  const remotes = Array.from(room.remoteParticipants.values());
  remotes.sort(
    (a, b) => (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0),
  );
  return [room.localParticipant, ...remotes];
}

export function getDisplayVideoPublication(participant: Participant) {
  const screen = participant.getTrackPublication(Track.Source.ScreenShare);
  if (screen?.track && screen.kind === Track.Kind.Video && !screen.isMuted) {
    return screen;
  }
  const camera = participant.getTrackPublication(Track.Source.Camera);
  if (camera?.track && camera.kind === Track.Kind.Video && !camera.isMuted) {
    return camera;
  }
  return undefined;
}
