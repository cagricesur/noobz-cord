import type { RemoteAudioTrack } from "livekit-client";
import { useEffect, useRef } from "react";

export interface RemoteAudioPlayerProps {
  track: RemoteAudioTrack;
  /** Effective volume 0–1 */
  volume: number;
}

/**
 * Plays a remote audio track with client-side volume (and mute-for-self / deafen applied by parent).
 */
export const RemoteAudioPlayer: React.FunctionComponent<RemoteAudioPlayerProps> = ({
  track,
  volume,
}) => {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  return <audio ref={ref} />;
};
