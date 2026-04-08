import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconScreenShare,
  IconScreenShareOff,
  IconSettings,
  IconVideo,
  IconVideoOff,
} from "@tabler/icons-react";
import type { Room } from "livekit-client";

export interface VoiceControlBarProps {
  room: Room;
  onLeave: () => void;
}

export const VoiceControlBar: React.FunctionComponent<VoiceControlBarProps> = ({
  room,
  onLeave,
}) => {
  const lp = room.localParticipant;
  const mic = lp.isMicrophoneEnabled;
  const cam = lp.isCameraEnabled;
  const share = lp.isScreenShareEnabled;

  const toggleMic = () => {
    void lp.setMicrophoneEnabled(!mic).catch((e: unknown) => {
      notifications.show({
        title: "Microphone",
        message: e instanceof Error ? e.message : "Could not toggle microphone",
        color: "red",
      });
    });
  };

  const toggleCam = () => {
    void lp.setCameraEnabled(!cam).catch((e: unknown) => {
      notifications.show({
        title: "Camera",
        message: e instanceof Error ? e.message : "Could not toggle camera",
        color: "red",
      });
    });
  };

  const toggleShare = () => {
    void lp.setScreenShareEnabled(!share).catch((e: unknown) => {
      notifications.show({
        title: "Screen share",
        message: e instanceof Error ? e.message : "Could not toggle screen share",
        color: "red",
      });
    });
  };

  const leave = () => {
    room.disconnect();
    onLeave();
  };

  const baseStyle = {
    border: "1px solid var(--mantine-color-dark-3)",
    background: "var(--mantine-color-dark-6)",
  };

  return (
    <Group
      justify="center"
      gap="lg"
      py="sm"
      px="md"
      style={{
        borderTop: "1px solid var(--mantine-color-dark-4)",
        background: "var(--mantine-color-dark-8)",
      }}
    >
      <Tooltip label={mic ? "Mute" : "Unmute"} position="top">
        <ActionIcon
          size={48}
          radius="xl"
          aria-label="Toggle microphone"
          onClick={toggleMic}
          color={mic ? "dark" : "red"}
          variant={mic ? "light" : "filled"}
          style={baseStyle}
        >
          {mic ? <IconMicrophone size={22} /> : <IconMicrophoneOff size={22} />}
        </ActionIcon>
      </Tooltip>

      <Tooltip label={cam ? "Turn off camera" : "Turn on camera"} position="top">
        <ActionIcon
          size={48}
          radius="xl"
          aria-label="Toggle camera"
          onClick={toggleCam}
          color={cam ? "dark" : "gray"}
          variant={cam ? "light" : "filled"}
          style={baseStyle}
        >
          {cam ? <IconVideo size={22} /> : <IconVideoOff size={22} />}
        </ActionIcon>
      </Tooltip>

      <Tooltip label={share ? "Stop sharing" : "Share screen"} position="top">
        <ActionIcon
          size={48}
          radius="xl"
          aria-label="Toggle screen share"
          onClick={toggleShare}
          color={share ? "green" : "dark"}
          variant={share ? "light" : "filled"}
          style={baseStyle}
        >
          {share ? <IconScreenShareOff size={22} /> : <IconScreenShare size={22} />}
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Voice settings" position="top">
        <ActionIcon
          size={48}
          radius="xl"
          variant="default"
          aria-label="Settings"
          style={baseStyle}
          onClick={() => {
            void navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          }}
        >
          <IconSettings size={22} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Disconnect" position="top">
        <ActionIcon
          size={48}
          radius="xl"
          color="red"
          variant="filled"
          aria-label="Leave voice channel"
          onClick={leave}
        >
          <IconPhoneOff size={22} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};
