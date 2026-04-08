import { Alert, Box, Button, Flex, SimpleGrid, Stack, Text } from "@mantine/core";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { MemberSidebar } from "./MemberSidebar";
import { ParticipantVoiceTile } from "./ParticipantVoiceTile";
import { RemoteAudioRenderer } from "./RemoteAudioRenderer";
import { sortParticipants } from "./participants";
import { useRoomEvents } from "./useRoomEvents";
import { VoiceControlBar } from "./VoiceControlBar";

export interface VoiceSessionViewProps {
  room: Room;
  channelLabel?: string;
  onLeave: () => void;
}

export const VoiceSessionView: React.FunctionComponent<VoiceSessionViewProps> = ({
  room,
  channelLabel,
  onLeave,
}) => {
  useRoomEvents(room);
  const [audioHint, setAudioHint] = useState(false);

  useEffect(() => {
    void room.startAudio().then(
      () => {
        setAudioHint(false);
      },
      () => {
        setAudioHint(true);
      },
    );
  }, [room]);

  useEffect(() => {
    const handleDisconnected = () => {
      onLeave();
    };
    room.on(RoomEvent.Disconnected, handleDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, onLeave]);

  const unlockAudio = useCallback(() => {
    void room.startAudio().then(
      () => {
        setAudioHint(false);
      },
      () => {
        setAudioHint(true);
      },
    );
  }, [room]);

  const participants = sortParticipants(room);
  const localId = room.localParticipant.identity;

  return (
    <Flex direction="column" style={{ flex: 1, minHeight: 0, minWidth: 0, background: "var(--mantine-color-dark-9)" }}>
      {audioHint ? (
        <Alert color="yellow" title="Enable audio" withCloseButton onClose={() => setAudioHint(false)}>
          <Text size="sm" mb="xs">
            Your browser may block sound until you interact with the page.
          </Text>
          <Button size="xs" onClick={unlockAudio}>
            Play voice audio
          </Button>
        </Alert>
      ) : null}

      <Flex style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <MemberSidebar
          participants={participants}
          localIdentity={localId}
          channelLabel={channelLabel}
        />
        <Stack gap="sm" style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 12 }}>
          <RemoteAudioRenderer room={room} />
          <Box style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
              {participants.map((p) => (
                <ParticipantVoiceTile
                  key={p.sid}
                  participant={p}
                  isLocal={p.identity === localId}
                />
              ))}
            </SimpleGrid>
          </Box>
        </Stack>
      </Flex>

      <VoiceControlBar room={room} onLeave={onLeave} />
    </Flex>
  );
};
