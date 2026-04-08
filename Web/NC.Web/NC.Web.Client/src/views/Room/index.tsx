import {
  Box,
  Flex,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getConference } from "@noobz-cord/api";
import { ConnectionState, type Room } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { connectVoiceRoom } from "./connectRoom";
import { PreJoinForm } from "./PreJoinForm";
import type { VoiceJoinChoices } from "./types";
import { VoiceSessionView } from "./VoiceSessionView";

const RoomView: React.FunctionComponent = () => {
  const [active, setActive] = useState<{
    room: Room;
    channelLabel?: string;
  } | null>(null);
  const [joining, setJoining] = useState(false);

  /** LiveKit room for tab-close only — do not disconnect from useEffect cleanup (Strict Mode simulates effect teardown and would drop the call). */
  const roomRef = useRef<Room | null>(null);
  roomRef.current = active?.room ?? null;

  useEffect(() => {
    const onPageHide = () => {
      const r = roomRef.current;
      if (r && r.state !== ConnectionState.Disconnected) {
        r.disconnect();
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  const handleLeave = useCallback(() => {
    setActive((prev) => {
      if (prev?.room && prev.room.state !== ConnectionState.Disconnected) {
        prev.room.disconnect();
      }
      return null;
    });
  }, []);

  const handlePreJoinSubmit = useCallback(async (choices: VoiceJoinChoices) => {
    setJoining(true);
    const api = getConference();
    try {
      const response = await api.postApiConferenceJoin();
      const token = response.token?.trim();
      const server = response.server?.trim();
      if (!token || !server) {
        notifications.show({
          title: "Could not join",
          message: "Server did not return a LiveKit token or URL.",
          color: "red",
        });
        return;
      }

      const connected = await connectVoiceRoom(server, token, choices);
      setActive({
        room: connected,
        channelLabel: response.room?.trim(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to join conference.";
      notifications.show({
        title: "Could not join",
        message,
        color: "red",
      });
    } finally {
      setJoining(false);
    }
  }, []);

  if (!active) {
    return (
      <Box
        h="100vh"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        bg="dark.9"
      >
        <Paper
          shadow="md"
          p="xl"
          radius="md"
          withBorder
          maw={520}
          w="100%"
          mx="md"
        >
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={3}>Join conference</Title>
              <Text size="sm" c="dimmed">
                Choose your camera, microphone, and display name, then connect
                to the voice channel.
              </Text>
            </Stack>
            <Box pos="relative">
              {joining ? (
                <Loader
                  pos="absolute"
                  style={{
                    zIndex: 2,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ) : null}
              <Box
                style={{
                  opacity: joining ? 0.4 : 1,
                  pointerEvents: joining ? "none" : undefined,
                }}
              >
                <PreJoinForm
                  joinLabel="Join voice channel"
                  submitting={joining}
                  onSubmit={(c) => {
                    void handlePreJoinSubmit(c);
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Flex direction="column" h="100vh" w="100%" style={{ minHeight: 0 }}>
      <VoiceSessionView
        room={active.room}
        channelLabel={active.channelLabel ?? "Voice"}
        onLeave={handleLeave}
      />
    </Flex>
  );
};

export default RoomView;
