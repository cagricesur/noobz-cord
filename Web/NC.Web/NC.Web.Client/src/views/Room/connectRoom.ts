import { Room } from "livekit-client";
import type { VoiceJoinChoices } from "./types";
import { normalizeDeviceId } from "./deviceUtils";

export async function connectVoiceRoom(
  serverUrl: string,
  token: string,
  choices: VoiceJoinChoices,
): Promise<Room> {
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });

  try {
    await room.connect(serverUrl, token);

    const name = choices.username?.trim();
    if (name) {
      await room.localParticipant.setName(name);
    }

    const audioOpts = choices.audioEnabled
      ? { deviceId: normalizeDeviceId(choices.audioDeviceId) }
      : false;
    const videoOpts = choices.videoEnabled
      ? { deviceId: normalizeDeviceId(choices.videoDeviceId) }
      : false;

    const lp = room.localParticipant;

    if (audioOpts !== false) {
      await lp.setMicrophoneEnabled(true, audioOpts);
    } else {
      await lp.setMicrophoneEnabled(false);
    }

    if (videoOpts !== false) {
      await lp.setCameraEnabled(true, videoOpts);
    } else {
      await lp.setCameraEnabled(false);
    }

    return room;
  } catch (err) {
    await room.disconnect();
    throw err;
  }
}
