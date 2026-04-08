import { Badge, Group, Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { IconMicrophone, IconMicrophoneOff, IconVideo, IconVideoOff } from "@tabler/icons-react";
import type { Participant } from "livekit-client";
import { Track } from "livekit-client";
import { Avatar } from "@mantine/core";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export interface MemberSidebarProps {
  participants: Participant[];
  localIdentity: string;
  channelLabel?: string;
}

export const MemberSidebar: React.FunctionComponent<MemberSidebarProps> = ({
  participants,
  localIdentity,
  channelLabel = "Voice channel",
}) => {
  return (
    <Stack
      gap={0}
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: "1px solid var(--mantine-color-dark-4)",
        background: "var(--mantine-color-dark-8)",
        minHeight: 0,
      }}
    >
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="md" py="sm">
        {channelLabel}
      </Text>
      <ScrollArea flex={1} type="auto" offsetScrollbars>
        <Stack gap={4} px="sm" pb="sm">
          {participants.map((p) => {
            const isLocal = p.identity === localIdentity;
            const name = p.name || p.identity;
            const micPub = p.getTrackPublication(Track.Source.Microphone);
            const camPub = p.getTrackPublication(Track.Source.Camera);
            const micOn = p.isMicrophoneEnabled && micPub && !micPub.isMuted;
            const camOn = p.isCameraEnabled && camPub && !camPub.isMuted;
            const speaking = p.isSpeaking;

            return (
              <Paper
                key={p.sid}
                p="xs"
                radius="sm"
                withBorder
                style={{
                  borderColor: speaking
                    ? "var(--mantine-color-green-7)"
                    : "var(--mantine-color-dark-4)",
                  background: speaking ? "var(--mantine-color-dark-6)" : "var(--mantine-color-dark-7)",
                }}
              >
                <Group justify="space-between" wrap="nowrap" gap="xs">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <Avatar size={32} radius="xl" color="gray">
                      {initials(name)}
                    </Avatar>
                    <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                      {name}
                    </Text>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    {isLocal ? (
                      <Badge size="xs" variant="light" color="gray">
                        You
                      </Badge>
                    ) : null}
                    {micOn ? (
                      <IconMicrophone size={16} opacity={0.9} />
                    ) : (
                      <IconMicrophoneOff size={16} opacity={0.45} />
                    )}
                    {camOn ? (
                      <IconVideo size={16} opacity={0.9} />
                    ) : (
                      <IconVideoOff size={16} opacity={0.45} />
                    )}
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};
