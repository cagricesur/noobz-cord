import type { RemoteAudioTrack } from "livekit-client";
import { useEffect, useRef } from "react";

export interface AudioTrackAttachmentProps
  extends React.AudioHTMLAttributes<HTMLAudioElement> {
  track: RemoteAudioTrack;
}

/**
 * Plays a remote {@link RemoteAudioTrack} in a hidden {@link HTMLAudioElement}.
 */
export const AudioTrackAttachment: React.FunctionComponent<AudioTrackAttachmentProps> = ({
  track,
  ...rest
}) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  return (
    <audio
      ref={ref}
      style={{ display: "none" }}
      {...rest}
    />
  );
};
