import type { RemoteAudioTrack } from "livekit-client";
import { Track } from "livekit-client";
import type { Room } from "livekit-client";
import { AudioTrackAttachment } from "./AudioTrackAttachment";

export const RemoteAudioRenderer: React.FunctionComponent<{ room: Room }> = ({ room }) => {
  const items: { key: string; track: RemoteAudioTrack }[] = [];

  room.remoteParticipants.forEach((participant) => {
    participant.audioTrackPublications.forEach((pub) => {
      if (pub.track && pub.kind === Track.Kind.Audio) {
        items.push({
          key: `${participant.identity}-${pub.trackSid}`,
          track: pub.track as RemoteAudioTrack,
        });
      }
    });
  });

  return (
    <>
      {items.map(({ key, track }) => (
        <AudioTrackAttachment key={key} track={track} />
      ))}
    </>
  );
};
