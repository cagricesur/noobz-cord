import { Avatar, Box, Group, Text } from "@mantine/core";
import { IconScreenShare, IconVideoOff } from "@tabler/icons-react";
import type { Participant, VideoTrack as LKVideoTrack } from "livekit-client";
import { Track } from "livekit-client";
import { getDisplayVideoPublication } from "./participants";
import { VideoTrackAttachment } from "./VideoTrackAttachment";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export interface ParticipantVoiceTileProps {
  participant: Participant;
  isLocal: boolean;
}

export const ParticipantVoiceTile: React.FunctionComponent<ParticipantVoiceTileProps> = ({
  participant,
  isLocal,
}) => {
  const displayName = participant.name || participant.identity;
  const pub = getDisplayVideoPublication(participant);
  const videoTrack =
    pub?.track && pub.kind === Track.Kind.Video ? (pub.track as LKVideoTrack) : undefined;
  const isScreenShare = pub?.source === Track.Source.ScreenShare;
  const speaking = participant.isSpeaking;

  return (
    <Box
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--mantine-color-dark-7)",
        border: speaking
          ? "2px solid var(--mantine-color-green-6)"
          : "1px solid var(--mantine-color-dark-4)",
        minHeight: 140,
        aspectRatio: "16 / 10",
      }}
    >
      {videoTrack ? (
        <VideoTrackAttachment
          track={videoTrack}
          muted={isLocal}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#0a0a0f",
          }}
        />
      ) : (
        <Box
          style={{
            width: "100%",
            height: "100%",
            minHeight: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, var(--mantine-color-dark-6), var(--mantine-color-dark-8))",
          }}
        >
          <Avatar
            size={72}
            radius="xl"
            color="gray"
            styles={{ placeholder: { fontSize: 28, fontWeight: 600 } }}
          >
            {initials(displayName)}
          </Avatar>
        </Box>
      )}

      <Box
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "8px 10px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      >
        <Group gap={6} justify="space-between" wrap="nowrap">
          <Text size="sm" fw={600} lineClamp={1} c="white" style={{ flex: 1, minWidth: 0 }}>
            {displayName}
            {isLocal ? " (you)" : ""}
          </Text>
          {isScreenShare ? (
            <IconScreenShare size={16} color="var(--mantine-color-green-4)" />
          ) : !videoTrack ? (
            <IconVideoOff size={16} opacity={0.7} />
          ) : null}
        </Group>
      </Box>
    </Box>
  );
};
