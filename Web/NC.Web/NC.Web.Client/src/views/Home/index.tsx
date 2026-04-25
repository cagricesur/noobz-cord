import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Button,
  Drawer,
  Group,
  Modal,
  ScrollArea,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Tooltip,
  Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHeadphones,
  IconHeadphonesOff,
  IconLogout,
  IconMessage,
  IconMicrophone,
  IconMicrophoneOff,
  IconScreenShare,
  IconSettings,
  IconUsers,
  IconVideo,
  IconVideoOff,
} from "@tabler/icons-react";
import {
  ConnectionState,
  supportsAudioOutputSelection,
  Track,
  type LocalVideoTrack,
  type Participant,
  type RemoteVideoTrack,
} from "livekit-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";

import {
  conferenceDeviceCookieOptions,
  COOKIE_CONFERENCE_AUDIO_OUTPUT_DEVICE,
  COOKIE_CONFERENCE_CAM_DEVICE,
  COOKIE_CONFERENCE_MIC_DEVICE,
} from "./conferenceRoomCookies";

import { DeviceSelector } from "./DeviceSelector";
import { ParticipantGrid } from "./ParticipantGrid";
import { RemoteAudioPlayer } from "./RemoteAudioPlayer";
import {
  collectRemoteAudioTracks,
  defaultAudioPref,
  useLiveKitConference,
} from "./useLiveKitConference";
import { initials, sortParticipants, tileStatusFor } from "./utils";
import { VideoTile } from "./VideoTile";

import logo from "@noobz-cord/assets/logo.png";
import classes from "./index.module.scss";

const HomeView: React.FunctionComponent = () => {
  const {
    room,
    roomLabel,
    connecting,
    error,
    tick,
    connect,
    disconnect,
    sendChat,
    chatMessages,
    deafened,
    setDeafened,
    audioPrefs,
    setParticipantPref,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    switchMic,
    switchCamera,
    switchAudioOutput,
  } = useLiveKitConference();

  const [cookies, setCookie] = useCookies([
    COOKIE_CONFERENCE_MIC_DEVICE,
    COOKIE_CONFERENCE_CAM_DEVICE,
    COOKIE_CONFERENCE_AUDIO_OUTPUT_DEVICE,
  ]);
  const conferenceMicCookie = cookies[COOKIE_CONFERENCE_MIC_DEVICE] as
    | string
    | undefined;
  const conferenceCamCookie = cookies[COOKIE_CONFERENCE_CAM_DEVICE] as
    | string
    | undefined;
  const conferenceAudioOutCookie = cookies[
    COOKIE_CONFERENCE_AUDIO_OUTPUT_DEVICE
  ] as string | undefined;

  const [sideOpen, { open: openSide, close: closeSide }] = useDisclosure(false);
  const [sideTab, setSideTab] = useState<"participants" | "chat">(
    "participants",
  );
  const [chatDraft, setChatDraft] = useState("");
  const [settingsOpen, { open: openSettings, close: closeSettings }] =
    useDisclosure(false);
  const [devices, setDevices] = useState<{
    mics: MediaDeviceInfo[];
    cams: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ mics: [], cams: [], speakers: [] });
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [devicesReady, setDevicesReady] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  /** When true, apply selected speaker on join; when false, join deafened until undeafen. */
  const [customAudioOutputOn, setCustomAudioOutputOn] = useState(true);

  useEffect(() => {
    if (room) return;
    let cancelled = false;
    let permissionStream: MediaStream | null = null;
    void (async () => {
      try {
        permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      } catch {
        /* permission denied or no hardware */
      }
      if (cancelled) return;
      const all = await navigator.mediaDevices.enumerateDevices();
      const mics = all.filter((d) => d.kind === "audioinput");
      const cams = all.filter((d) => d.kind === "videoinput");
      const speakers = all.filter((d) => d.kind === "audiooutput");
      setDevices({ mics, cams, speakers });
      const micId = mics.some((d) => d.deviceId === conferenceMicCookie)
        ? conferenceMicCookie!
        : (mics[0]?.deviceId ?? null);
      const camId = cams.some((d) => d.deviceId === conferenceCamCookie)
        ? conferenceCamCookie!
        : (cams[0]?.deviceId ?? null);
      const outSupported = supportsAudioOutputSelection();
      const speakerId =
        outSupported &&
        conferenceAudioOutCookie &&
        speakers.some((d) => d.deviceId === conferenceAudioOutCookie)
          ? conferenceAudioOutCookie
          : outSupported
            ? (speakers[0]?.deviceId ?? "default")
            : null;
      setSelectedMic(micId);
      setSelectedCam(camId);
      setSelectedSpeaker(speakerId);
      setDevicesReady(true);
      permissionStream?.getTracks().forEach((t) => t.stop());
    })();
    return () => {
      cancelled = true;
      permissionStream?.getTracks().forEach((t) => t.stop());
    };
  }, [
    room,
    conferenceMicCookie,
    conferenceCamCookie,
    conferenceAudioOutCookie,
  ]);

  useEffect(() => {
    if (!settingsOpen || !room) return;
    void navigator.mediaDevices.enumerateDevices().then((all) => {
      setDevices({
        mics: all.filter((d) => d.kind === "audioinput"),
        cams: all.filter((d) => d.kind === "videoinput"),
        speakers: all.filter((d) => d.kind === "audiooutput"),
      });
      const m = room.getActiveDevice("audioinput");
      const v = room.getActiveDevice("videoinput");
      const o = room.getActiveDevice("audiooutput");
      if (m) setSelectedMic(m);
      if (v) setSelectedCam(v);
      if (o && supportsAudioOutputSelection()) setSelectedSpeaker(o);
    });
  }, [settingsOpen, room]);

  const participants = useMemo(
    () => {
      if (!room) return [];
      return sortParticipants([
        room.localParticipant,
        ...Array.from(room.remoteParticipants.values()),
      ]);
    },
    // `room` is stable across participant/track updates; `tick` bumps on room events.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- need tick for mute/camera updates
    [room, tick],
  );

  const screenShares = useMemo(() => {
    if (!room) return [];
    const out: {
      participant: Participant;
      track: LocalVideoTrack | RemoteVideoTrack;
    }[] = [];
    for (const p of participants) {
      const pub = p.getTrackPublication(Track.Source.ScreenShare);
      if (pub?.track && pub.track.kind === Track.Kind.Video) {
        out.push({
          participant: p,
          track: pub.track as LocalVideoTrack | RemoteVideoTrack,
        });
      }
    }
    return out;
  }, [room, participants]);

  const [mainTab, setMainTab] = useState("gallery");

  const speakerSelectData = useMemo(() => {
    if (!supportsAudioOutputSelection()) return [];
    if (devices.speakers.length > 0) {
      return devices.speakers.map((d) => ({
        value: d.deviceId,
        label: d.label || `Output ${d.deviceId.slice(0, 8)}`,
      }));
    }
    return [{ value: "default", label: "System default" }];
  }, [devices.speakers]);

  const resolvedMainTab = useMemo(() => {
    if (screenShares.length === 0) return "gallery";
    if (mainTab.startsWith("ss-")) {
      const suffix = mainTab.slice(3);
      const stillThere = screenShares.some(
        (s) => s.participant.identity === suffix,
      );
      if (!stillThere) return "gallery";
    }
    return mainTab;
  }, [screenShares, mainTab]);

  const openParticipants = useCallback(() => {
    setSideTab("participants");
    openSide();
  }, [openSide]);

  const openChat = useCallback(() => {
    setSideTab("chat");
    openSide();
  }, [openSide]);

  const prefFor = useCallback(
    (identity: string) => ({
      ...defaultAudioPref(),
      ...audioPrefs[identity],
    }),
    [audioPrefs],
  );

  const onApplyDevices = useCallback(async () => {
    if (!room) return;
    const prevMic = room.getActiveDevice("audioinput");
    const prevCam = room.getActiveDevice("videoinput");
    const prevOut = room.getActiveDevice("audiooutput");
    if (selectedMic && selectedMic !== prevMic) {
      await switchMic(selectedMic);
      setCookie(
        COOKIE_CONFERENCE_MIC_DEVICE,
        selectedMic,
        conferenceDeviceCookieOptions,
      );
    }
    if (selectedCam && selectedCam !== prevCam) {
      await switchCamera(selectedCam);
      setCookie(
        COOKIE_CONFERENCE_CAM_DEVICE,
        selectedCam,
        conferenceDeviceCookieOptions,
      );
    }
    if (
      supportsAudioOutputSelection() &&
      selectedSpeaker &&
      selectedSpeaker !== prevOut
    ) {
      await switchAudioOutput(selectedSpeaker);
      setCookie(
        COOKIE_CONFERENCE_AUDIO_OUTPUT_DEVICE,
        selectedSpeaker,
        conferenceDeviceCookieOptions,
      );
    }
    closeSettings();
  }, [
    room,
    selectedMic,
    selectedCam,
    selectedSpeaker,
    switchMic,
    switchCamera,
    switchAudioOutput,
    setCookie,
    closeSettings,
  ]);

  const sendChatMessage = useCallback(() => {
    sendChat(chatDraft);
    setChatDraft("");
  }, [chatDraft, sendChat]);

  const connLabel =
    room?.state === ConnectionState.Connected
      ? "Connected"
      : room?.state === ConnectionState.Connecting
        ? "Connecting"
        : room?.state === ConnectionState.Reconnecting
          ? "Reconnecting"
          : (room?.state ?? "");

  if (!room) {
    const canJoin =
      devicesReady &&
      !(micOn && !selectedMic) &&
      !(camOn && !selectedCam) &&
      !(
        supportsAudioOutputSelection() &&
        customAudioOutputOn &&
        !selectedSpeaker
      );

    return (
      <DeviceSelector
        mode="prejoin"
        devices={devices}
        devicesReady={devicesReady}
        selectedMic={selectedMic}
        onSelectedMicChange={setSelectedMic}
        selectedCam={selectedCam}
        onSelectedCamChange={setSelectedCam}
        selectedSpeaker={selectedSpeaker}
        onSelectedSpeakerChange={setSelectedSpeaker}
        micOn={micOn}
        onMicOnChange={setMicOn}
        camOn={camOn}
        onCamOnChange={setCamOn}
        customAudioOutputOn={customAudioOutputOn}
        onCustomAudioOutputOnChange={setCustomAudioOutputOn}
        speakerSelectData={speakerSelectData}
        canJoin={canJoin}
        connecting={connecting}
        error={error}
        onJoin={() =>
          void (async () => {
            try {
              await connect({
                micDeviceId: selectedMic ?? undefined,
                camDeviceId: selectedCam ?? undefined,
                audioOutputDeviceId:
                  supportsAudioOutputSelection() &&
                  customAudioOutputOn &&
                  selectedSpeaker
                    ? selectedSpeaker
                    : undefined,
                joinDeafened:
                  supportsAudioOutputSelection() && !customAudioOutputOn,
                micEnabled: micOn,
                camEnabled: camOn,
              });
              if (selectedMic) {
                setCookie(
                  COOKIE_CONFERENCE_MIC_DEVICE,
                  selectedMic,
                  conferenceDeviceCookieOptions,
                );
              }
              if (selectedCam) {
                setCookie(
                  COOKIE_CONFERENCE_CAM_DEVICE,
                  selectedCam,
                  conferenceDeviceCookieOptions,
                );
              }
              if (supportsAudioOutputSelection() && selectedSpeaker) {
                setCookie(
                  COOKIE_CONFERENCE_AUDIO_OUTPUT_DEVICE,
                  selectedSpeaker,
                  conferenceDeviceCookieOptions,
                );
              }
            } catch {
              /* error state from hook */
            }
          })()
        }
      />
    );
  }

  const remoteAudios = collectRemoteAudioTracks(room);

  return (
    <>
      {remoteAudios.map(({ key, track, participantIdentity }) => {
        const pref = prefFor(participantIdentity);
        const vol = deafened || pref.mutedForSelf ? 0 : pref.volume;
        return <RemoteAudioPlayer key={key} track={track} volume={vol} />;
      })}

      <AppShell
        className={classes.shellRoot}
        padding={0}
        header={{ height: 64 }}
        footer={{ height: { base: 120, sm: 88 } }}
      >
        <AppShell.Header className={classes.header}>
          <Group
            justify="space-between"
            wrap="nowrap"
            style={{ width: "100%" }}
          >
            <Group gap="sm">
              <Group>
                <Image src={logo} h={32} w={32} />
                <Text fw={600}>{roomLabel ?? "Meeting"}</Text>
              </Group>

              <Badge variant="light" color="gray" size="sm">
                {connLabel}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {participants.length} in call
            </Text>
          </Group>
        </AppShell.Header>

        <AppShell.Main className={classes.main}>
          {screenShares.length === 0 ? (
            <ParticipantGrid
              participants={participants}
              localDeafened={deafened}
            />
          ) : (
            <Tabs
              variant="pills"
              value={resolvedMainTab}
              onChange={(v) => v && setMainTab(v)}
              classNames={{
                root: classes.mainTabs,
                list: classes.mainTabsList,
              }}
              keepMounted={false}
              p={0}
              flex={1}
              style={{ minHeight: 0 }}
            >
              <Tabs.List>
                <Tabs.Tab value="gallery">
                  <Group>
                    <Image src={logo} h={32} w={32} />
                    <Text>Meeting</Text>
                  </Group>
                </Tabs.Tab>
                {screenShares.map(({ participant }) => (
                  <Tabs.Tab
                    key={`ss-tab-${participant.identity}`}
                    value={`ss-${participant.identity}`}
                  >
                    {`${participant.name || participant.identity}'s Screen`}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              <Tabs.Panel
                value="gallery"
                className={`${classes.mainTabsPanel} ${classes.galleryTabPanel}`}
              >
                <ParticipantGrid
                  participants={participants}
                  localDeafened={deafened}
                />
              </Tabs.Panel>

              {screenShares.map(({ participant, track }) => (
                <Tabs.Panel
                  key={`ss-panel-${participant.identity}`}
                  value={`ss-${participant.identity}`}
                  className={`${classes.mainTabsPanel} ${classes.screenShareTabPanel}`}
                >
                  <VideoTile
                    variant="fill"
                    objectFit="contain"
                    track={track}
                    label={participant.name || participant.identity}
                    subLabel="Screen share"
                    status={tileStatusFor(participant, deafened)}
                  />
                </Tabs.Panel>
              ))}
            </Tabs>
          )}
        </AppShell.Main>

        <AppShell.Footer className={classes.controlBar}>
          <Group justify="center" wrap="wrap" gap="xs">
            <Tooltip
              label={
                room.localParticipant.isMicrophoneEnabled ? "Mute" : "Unmute"
              }
            >
              <ActionIcon
                size={52}
                radius="xl"
                color={
                  room.localParticipant.isMicrophoneEnabled ? "dark" : "red"
                }
                onClick={() => void toggleMic()}
              >
                {room.localParticipant.isMicrophoneEnabled ? (
                  <IconMicrophone size={22} />
                ) : (
                  <IconMicrophoneOff size={22} />
                )}
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={
                deafened ? "Undeafen (hear others)" : "Deafen (hear no one)"
              }
            >
              <ActionIcon
                size={52}
                radius="xl"
                color={deafened ? "orange" : "dark"}
                onClick={() => setDeafened((d) => !d)}
              >
                {deafened ? (
                  <IconHeadphonesOff size={22} />
                ) : (
                  <IconHeadphones size={22} />
                )}
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={
                room.localParticipant.isCameraEnabled
                  ? "Stop video"
                  : "Start video"
              }
            >
              <ActionIcon
                size={52}
                radius="xl"
                color={room.localParticipant.isCameraEnabled ? "dark" : "red"}
                onClick={() => void toggleCamera()}
              >
                {room.localParticipant.isCameraEnabled ? (
                  <IconVideo size={22} />
                ) : (
                  <IconVideoOff size={22} />
                )}
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={
                room.localParticipant.isScreenShareEnabled
                  ? "Stop share"
                  : "Share screen"
              }
            >
              <ActionIcon
                size={52}
                radius="xl"
                color={
                  room.localParticipant.isScreenShareEnabled ? "teal" : "dark"
                }
                onClick={() => void toggleScreenShare()}
              >
                <IconScreenShare size={22} />
              </ActionIcon>
            </Tooltip>

            <div className={classes.controlDivider} />

            <Tooltip label="Participants">
              <ActionIcon
                size={52}
                radius="xl"
                variant="light"
                onClick={openParticipants}
              >
                <IconUsers size={22} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Chat">
              <ActionIcon
                size={52}
                radius="xl"
                variant="light"
                onClick={openChat}
              >
                <IconMessage size={22} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Microphone & camera">
              <ActionIcon
                size={52}
                radius="xl"
                variant="light"
                onClick={openSettings}
              >
                <IconSettings size={22} />
              </ActionIcon>
            </Tooltip>

            <div className={classes.controlDivider} />

            <Tooltip label="Leave">
              <ActionIcon
                className={classes.leaveBtn}
                size={52}
                radius="xl"
                variant="filled"
                color="red"
                onClick={() => disconnect()}
              >
                <IconLogout size={22} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Footer>
      </AppShell>

      <Drawer
        opened={sideOpen}
        onClose={closeSide}
        position="right"
        size="md"
        radius="md"
        offset={16}
        title="Meeting panel"
        styles={{
          body: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
      >
        <Tabs
          value={sideTab}
          onChange={(v) => v && setSideTab(v as "participants" | "chat")}
          keepMounted={false}
          className={classes.drawerBody}
        >
          <Tabs.List grow>
            <Tabs.Tab value="participants">Participants</Tabs.Tab>
            <Tabs.Tab value="chat">Chat</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel
            value="participants"
            p="md"
            pt="sm"
            style={{ flex: 1, minHeight: 0 }}
          >
            <ScrollArea h="calc(100vh - 140px)" type="never">
              <Stack gap={0}>
                {participants.map((p) => {
                  const name = p.name || p.identity;
                  const isLocal = p.isLocal;
                  const pref = prefFor(p.identity);
                  return (
                    <Stack
                      key={p.identity}
                      gap="xs"
                      className={classes.participantRow}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm">
                          <Avatar radius="md" size="sm" color="violet">
                            {initials(name)}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={600}>
                              {name}
                              {isLocal ? " (you)" : ""}
                            </Text>
                            <Group gap={6}>
                              {p.isMicrophoneEnabled ? (
                                <IconMicrophone size={14} />
                              ) : (
                                <IconMicrophoneOff size={14} />
                              )}
                              {p.isCameraEnabled ? (
                                <IconVideo size={14} />
                              ) : (
                                <IconVideoOff size={14} />
                              )}
                            </Group>
                          </div>
                        </Group>
                      </Group>
                      {!isLocal ? (
                        <>
                          <Switch
                            label="Mute for me"
                            checked={pref.mutedForSelf}
                            onChange={(e) =>
                              setParticipantPref(p.identity, {
                                mutedForSelf: e.currentTarget.checked,
                              })
                            }
                          />
                          <Stack gap={4}>
                            <Text size="xs" c="dimmed">
                              Volume for me
                            </Text>
                            <Slider
                              min={0}
                              max={100}
                              value={Math.round(pref.volume * 100)}
                              onChange={(v) =>
                                setParticipantPref(p.identity, {
                                  volume: v / 100,
                                })
                              }
                              disabled={pref.mutedForSelf || deafened}
                            />
                          </Stack>
                        </>
                      ) : (
                        <Text size="xs" c="dimmed">
                          Use the toolbar to change your mic, camera, or
                          devices.
                        </Text>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel
            value="chat"
            p="md"
            pt="sm"
            style={{ flex: 1, minHeight: 0 }}
          >
            <Stack gap="sm" className={classes.drawerBody}>
              <ScrollArea
                className={classes.chatScroll}
                type="never"
                flex={1}
                miw={0}
              >
                {chatMessages.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No messages yet. Say hello.
                  </Text>
                ) : (
                  chatMessages.map((m) => (
                    <div key={m.id} className={classes.chatRow}>
                      <div className={classes.chatMeta}>
                        {m.senderName} ·{" "}
                        {new Date(m.sentAt).toLocaleTimeString()}
                      </div>
                      <Text size="sm">{m.text}</Text>
                    </div>
                  ))
                )}
              </ScrollArea>
              <Group wrap="nowrap" align="flex-end">
                <TextInput
                  style={{ flex: 1 }}
                  placeholder="Type a message"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                />
                <Button onClick={sendChatMessage}>Send</Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Drawer>

      <Modal
        opened={settingsOpen}
        onClose={closeSettings}
        title="Audio & video devices"
        centered
      >
        <DeviceSelector
          mode="settings"
          devices={devices}
          selectedMic={selectedMic}
          onSelectedMicChange={setSelectedMic}
          selectedCam={selectedCam}
          onSelectedCamChange={setSelectedCam}
          selectedSpeaker={selectedSpeaker}
          onSelectedSpeakerChange={setSelectedSpeaker}
          speakerSelectData={speakerSelectData}
          onApply={onApplyDevices}
          onCancel={closeSettings}
        />
      </Modal>
    </>
  );
};

export default HomeView;
