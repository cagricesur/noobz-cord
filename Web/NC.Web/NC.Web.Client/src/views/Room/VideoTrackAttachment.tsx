import type { VideoTrack as LKVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";

export interface VideoTrackAttachmentProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  track: LKVideoTrack;
}

/**
 * Binds a LiveKit {@link LKVideoTrack} to a {@link HTMLVideoElement} via {@link LKVideoTrack.attach}.
 */
export const VideoTrackAttachment: React.FunctionComponent<VideoTrackAttachmentProps> = ({
  track,
  muted,
  ...rest
}) => {
  const ref = useRef<HTMLVideoElement>(null);

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

  return <video ref={ref} playsInline muted={muted} {...rest} />;
};
