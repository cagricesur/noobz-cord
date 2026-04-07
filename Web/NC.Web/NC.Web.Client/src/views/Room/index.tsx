import {
  Chat,
  ConnectionQualityIndicator,
  ConnectionState,
  ConnectionStateToast,
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  LiveKitRoom,
  MediaDeviceMenu,
  ParticipantLoop,
  ParticipantName,
  ParticipantTile,
  PreJoin,
  RoomAudioRenderer,
  RoomName,
  StartAudio,
  TrackMutedIndicator,
  useChat,
  useConnectionState,
  useCreateLayoutContext,
  useIsSpeaking,
  useLocalParticipant,
  useParticipantContext,
  useParticipantTracks,
  useParticipants,
  useRemoteParticipants,
  useRoomContext,
  useRoomInfo,
  useSortedParticipants,
  useSpeakingParticipants,
  useTracks,
  type LocalUserChoices,
} from "@livekit/components-react";
import {
  Badge,
  Box,
  Divider,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getConference } from "@noobz-cord/api";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconVideo,
  IconVideoOff,
  IconVolume,
} from "@tabler/icons-react";
import { Track } from "livekit-client";
import { useCallback, useMemo, useState } from "react";

interface IRoomState {
  token: string;
  server: string;
  room?: string;
  choices: LocalUserChoices;
}

function normalizeDeviceId(deviceId: string | undefined): string | undefined {
  if (!deviceId || deviceId === "default") {
    return undefined;
  }
  return deviceId;
}

const ParticipantSidebarRow: React.FunctionComponent = () => {
  const participant = useParticipantContext();
  const speaking = useIsSpeaking(participant);
  const micTracks = useParticipantTracks([Track.Source.Microphone]);
  const camTracks = useParticipantTracks([Track.Source.Camera]);
  const micRef = micTracks[0];
  const camRef = camTracks[0];

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      gap="xs"
      py={6}
      px={8}
      style={{
        borderRadius: 8,
        background: speaking ? "var(--mantine-color-dark-5)" : "transparent",
        border: speaking
          ? "1px solid var(--mantine-color-blue-6)"
          : "1px solid transparent",
      }}
    >
      <Group gap={6} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
        <ParticipantName
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        />
        {speaking ? (
          <Badge size="xs" variant="light" color="green">
            Speaking
          </Badge>
        ) : null}
      </Group>
      <Group gap={4} wrap="nowrap">
        {micRef ? (
          <TrackMutedIndicator trackRef={micRef} />
        ) : participant.isMicrophoneEnabled ? (
          <IconMicrophone size={16} opacity={0.85} />
        ) : (
          <IconMicrophoneOff size={16} opacity={0.5} />
        )}
        {camRef ? (
          <TrackMutedIndicator trackRef={camRef} />
        ) : participant.isCameraEnabled ? (
          <IconVideo size={16} opacity={0.85} />
        ) : (
          <IconVideoOff size={16} opacity={0.5} />
        )}
        <ConnectionQualityIndicator style={{ width: 20, height: 20 }} />
      </Group>
    </Group>
  );
};

const ConferenceRoomChrome: React.FunctionComponent<{
  displayRoomName?: string;
}> = ({ displayRoomName }) => {
  const layoutContext = useCreateLayoutContext();
  const { name: liveKitRoomName } = useRoomInfo();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const remoteParticipants = useRemoteParticipants();
  const sortedRemoteParticipants = useSortedParticipants(remoteParticipants);
  const speakers = useSpeakingParticipants();
  const { localParticipant } = useLocalParticipant();
  const { chatMessages } = useChat();
  const room = useRoomContext();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  const roomTitle = displayRoomName ?? liveKitRoomName ?? "Conference";

  const speakerLabel = useMemo(() => {
    if (speakers.length === 0) {
      return "No active speakers";
    }
    return speakers
      .map((p) => p.name || p.identity)
      .slice(0, 4)
      .join(", ");
  }, [speakers]);

  return (
    <LayoutContextProvider value={layoutContext}>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        <ConnectionStateToast />
        <RoomAudioRenderer />
        <StartAudio label="Enable room audio" />

        <Group
          justify="space-between"
          px="md"
          py="sm"
          style={{
            borderBottom: "1px solid var(--mantine-color-dark-4)",
            flexShrink: 0,
          }}
        >
          <Stack gap={2}>
            <Group gap="sm">
              <Title order={4}>{roomTitle}</Title>
              <ConnectionState />
            </Group>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {speakerLabel}
            </Text>
          </Stack>
          <Group gap="xs">
            <Badge variant="light" color="gray">
              {connectionState}
            </Badge>
            <Badge
              variant="outline"
              color="blue"
              leftSection={<IconVolume size={12} />}
            >
              {participants.length} in room
            </Badge>
            <Badge variant="dot" color="teal">
              {chatMessages.length} chat messages
            </Badge>
            <MediaDeviceMenu kind="audioinput" />
            <MediaDeviceMenu kind="videoinput" />
          </Group>
        </Group>

        <Box
          style={{
            flex: 1,
            display: "flex",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Stack
            gap={0}
            style={{
              width: 280,
              flexShrink: 0,
              borderRight: "1px solid var(--mantine-color-dark-4)",
              background: "var(--mantine-color-dark-8)",
            }}
          >
            <Text size="sm" fw={600} px="md" py="sm">
              Members
            </Text>
            <Divider />
            <ScrollArea flex={1} type="auto" offsetScrollbars>
              <Stack gap={4} px="sm" py="sm">
                <Text size="xs" c="dimmed" tt="uppercase" px={8}>
                  You
                </Text>
                <Paper p="xs" radius="sm" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                      {localParticipant.name || localParticipant.identity}
                    </Text>
                    <Badge size="xs" variant="light">
                      You
                    </Badge>
                  </Group>
                </Paper>
                <Text size="xs" c="dimmed" tt="uppercase" px={8} pt="md">
                  Participants
                </Text>
                <ParticipantLoop participants={sortedRemoteParticipants}>
                  <ParticipantSidebarRow />
                </ParticipantLoop>
              </Stack>
            </ScrollArea>
          </Stack>

          <Stack
            gap={0}
            style={{
              flex: 1,
              minWidth: 0,
              background: "var(--mantine-color-dark-9)",
            }}
          >
            <Box style={{ flex: 1, minHeight: 0, position: "relative" }}>
              <GridLayout tracks={tracks} style={{ height: "100%" }}>
                <ParticipantTile />
              </GridLayout>
            </Box>
            <Box
              px="md"
              py="sm"
              style={{
                borderTop: "1px solid var(--mantine-color-dark-4)",
                background: "var(--mantine-color-dark-8)",
              }}
            >
              <ControlBar
                variation="verbose"
                controls={{
                  microphone: true,
                  camera: true,
                  screenShare: true,

                  leave: true,
                  settings: true,
                }}
                saveUserChoices
                onDeviceError={({ source, error }) => {
                  notifications.show({
                    title: "Device error",
                    message: `${source}: ${error.message}`,
                    color: "red",
                  });
                }}
              />
            </Box>
          </Stack>

          <Stack
            gap={0}
            style={{
              width: 340,
              flexShrink: 0,
              borderLeft: "1px solid var(--mantine-color-dark-4)",
              minHeight: 0,
            }}
          >
            <Group justify="space-between" px="md" py="sm">
              <Text size="sm" fw={600}>
                Text chat
              </Text>
              <RoomName style={{ fontSize: 12, opacity: 0.7 }} />
            </Group>
            <Divider />
            <Box style={{ flex: 1, minHeight: 0, display: "flex" }}>
              <Chat
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              />
            </Box>
            <Divider />
            <Text size="xs" c="dimmed" px="md" py={8}>
              Session: {room?.name ?? "—"}
            </Text>
          </Stack>
        </Box>
      </Box>
    </LayoutContextProvider>
  );
};

const RoomView: React.FunctionComponent = () => {
  const [state, setState] = useState<IRoomState | null>(null);
  const [joining, setJoining] = useState(false);

  const handlePreJoinSubmit = useCallback((choices: LocalUserChoices) => {
    setJoining(true);
    const api = getConference();
    api
      .postApiConferenceJoin()
      .then((response) => {
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
        setState({
          token,
          server,
          room: response.room?.trim(),
          choices,
        });
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to join conference.";
        notifications.show({
          title: "Could not join",
          message,
          color: "red",
        });
      })
      .finally(() => {
        setJoining(false);
      });
  }, []);

  if (!state) {
    return (
      <Box
        h="100vh"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        bg="dark.9"
        data-lk-theme="default"
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
                to the voice and video channel.
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
              <PreJoin
                persistUserChoices
                joinLabel="Join voice channel"
                onSubmit={handlePreJoinSubmit}
                onError={(err) => {
                  notifications.show({
                    title: "Preview error",
                    message: err.message,
                    color: "red",
                  });
                }}
                style={{
                  opacity: joining ? 0.4 : 1,
                  pointerEvents: joining ? "none" : undefined,
                }}
              />
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const audioOpts = state.choices.audioEnabled
    ? { deviceId: normalizeDeviceId(state.choices.audioDeviceId) }
    : false;
  const videoOpts = state.choices.videoEnabled
    ? { deviceId: normalizeDeviceId(state.choices.videoDeviceId) }
    : false;

  return (
    <Box
      data-lk-theme="default"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <LiveKitRoom
        token={state.token}
        serverUrl={state.server}
        connect
        audio={audioOpts}
        video={videoOpts}
        onDisconnected={() => {
          setState(null);
        }}
        onError={(error) => {
          notifications.show({
            title: "Room error",
            message: error.message,
            color: "red",
          });
        }}
      >
        <ConferenceRoomChrome displayRoomName={state.room} />
      </LiveKitRoom>
    </Box>
  );
};

export default RoomView;
