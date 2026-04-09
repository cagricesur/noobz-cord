import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";

import classes from "./index.module.scss";

export interface VideoTileProps {
  track: LocalVideoTrack | RemoteVideoTrack;
  label: string;
  mirror?: boolean;
  subLabel?: string;
  /** Fills parent height (e.g. screen-share tab); uses `objectFit` for the video element. */
  variant?: "default" | "fill";
  objectFit?: "cover" | "contain";
}

export const VideoTile: React.FunctionComponent<VideoTileProps> = ({
  track,
  label,
  mirror,
  subLabel,
  variant = "default",
  objectFit = "cover",
}) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  const tileClass = variant === "fill" ? classes.videoTileFill : classes.videoTile;
  const videoClass = variant === "fill" ? classes.videoElFill : classes.videoEl;

  return (
    <div className={tileClass}>
      <video
        ref={ref}
        className={videoClass}
        playsInline
        muted
        style={{
          objectFit,
          ...(mirror ? { transform: "scaleX(-1)" } : {}),
        }}
      />
      <div className={classes.videoOverlay}>
        <span className={classes.videoLabel}>{label}</span>
        {subLabel ? <span className={classes.videoSubLabel}>{subLabel}</span> : null}
      </div>
    </div>
  );
};
