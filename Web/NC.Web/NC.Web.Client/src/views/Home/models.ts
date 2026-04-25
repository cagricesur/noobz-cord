import type { ConnectionQuality } from "livekit-client";

export interface IParticipantTileStatus {
  speaking: boolean;
  connectionQuality: ConnectionQuality;
  micOn: boolean;
  deafened: boolean;
  cameraOn: boolean;
  screenShareOn: boolean;
}
