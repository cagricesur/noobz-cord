import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";
import type { IParticipantTileStatus } from "./models";
import { ParticipantTileStatusBar } from "./ParticipantTileStatusBar";

import classes from "./index.module.scss";

export interface IVideoTileProps {
  track: LocalVideoTrack | RemoteVideoTrack;
  label: string;
  mirror?: boolean;
  subLabel?: string;
  /** Fills parent height (e.g. screen-share tab); uses `objectFit` for the video element. */
  variant?: "default" | "fill";
  objectFit?: "cover" | "contain";
  /** Bottom status strip (mic, deafen, camera, screen share). */
  status?: IParticipantTileStatus;
}

export const VideoTile: React.FunctionComponent<IVideoTileProps> = ({
  track,
  label,
  mirror,
  subLabel,
  variant = "default",
  objectFit = "cover",
  status,
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

  const rootClass =
    variant === "fill" ? classes.videoTileFill : classes.videoTile;
  const tileClass = `${rootClass} ${status?.speaking ? classes.participantTileSpeaking : ""}`;
  const mediaClass =
    variant === "fill" ? classes.videoTileMediaFill : classes.videoTileMedia;
  const videoClass = variant === "fill" ? classes.videoElFill : classes.videoEl;

  return (
    <div className={tileClass}>
      <div className={mediaClass}>
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
          {subLabel ? (
            <span className={classes.videoSubLabel}>{subLabel}</span>
          ) : null}
        </div>
      </div>
      {status ? <ParticipantTileStatusBar {...status} /> : null}
    </div>
  );
};
