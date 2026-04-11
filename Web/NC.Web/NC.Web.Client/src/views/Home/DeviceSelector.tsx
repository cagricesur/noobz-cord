import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  rem,
  Select,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { supportsAudioOutputSelection } from "livekit-client";
import { useEffect, useRef } from "react";

import classes from "./index.module.scss";

export type ConferenceDevicesLists = {
  mics: MediaDeviceInfo[];
  cams: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
};

type DeviceSelectorShared = {
  devices: ConferenceDevicesLists;
  selectedMic: string | null;
  onSelectedMicChange: (value: string | null) => void;
  selectedCam: string | null;
  onSelectedCamChange: (value: string | null) => void;
  selectedSpeaker: string | null;
  onSelectedSpeakerChange: (value: string | null) => void;
  speakerSelectData: { value: string; label: string }[];
};

export type DeviceSelectorPrejoinProps = DeviceSelectorShared & {
  mode: "prejoin";
  devicesReady: boolean;
  micOn: boolean;
  onMicOnChange: (on: boolean) => void;
  camOn: boolean;
  onCamOnChange: (on: boolean) => void;
  customAudioOutputOn: boolean;
  onCustomAudioOutputOnChange: (on: boolean) => void;
  canJoin: boolean;
  connecting: boolean;
  error: string | null;
  onJoin: () => void;
};

export type DeviceSelectorSettingsProps = DeviceSelectorShared & {
  mode: "settings";
  onApply: () => void;
  onCancel: () => void;
};

export type DeviceSelectorProps =
  | DeviceSelectorPrejoinProps
  | DeviceSelectorSettingsProps;

function SpeakerOutputBlock({
  mode,
  speakerSelectData,
  selectedSpeaker,
  onSelectedSpeakerChange,
  customAudioOutputOn,
  onCustomAudioOutputOnChange,
}: {
  mode: "prejoin" | "settings";
  speakerSelectData: { value: string; label: string }[];
  selectedSpeaker: string | null;
  onSelectedSpeakerChange: (value: string | null) => void;
  customAudioOutputOn?: boolean;
  onCustomAudioOutputOnChange?: (on: boolean) => void;
}) {
  if (!supportsAudioOutputSelection()) {
    return (
      <Text size="sm" c="dimmed">
        {mode === "prejoin"
          ? "This browser does not support choosing a speaker output; audio uses the system default."
          : "Speaker selection is not available in this browser."}
      </Text>
    );
  }

  if (mode === "settings") {
    return (
      <Select
        label="Speakers / headphones"
        description="Meeting audio playback"
        placeholder="Choose output"
        data={speakerSelectData}
        value={selectedSpeaker}
        onChange={onSelectedSpeakerChange}
      />
    );
  }

  return (
    <>
      <Select
        label="Speakers / headphones"
        description="Where you hear everyone in the meeting"
        placeholder="Select output"
        data={speakerSelectData}
        value={selectedSpeaker}
        onChange={onSelectedSpeakerChange}
      />
      <Switch
        label="Use selected speaker when joining"
        description="Off joins deafened (hear no one) until you undeafen"
        checked={customAudioOutputOn!}
        onChange={(e) => onCustomAudioOutputOnChange!(e.currentTarget.checked)}
      />
    </>
  );
}

export const DeviceSelector: React.FunctionComponent<DeviceSelectorProps> = (
  props,
) => {
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const prejoin =
    props.mode === "prejoin" ? (props as DeviceSelectorPrejoinProps) : null;
  const previewDevicesReady = prejoin?.devicesReady ?? false;
  const previewCamOn = prejoin?.camOn ?? false;
  const previewCamId = prejoin?.selectedCam ?? null;

  useEffect(() => {
    if (props.mode !== "prejoin") {
      if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
      return;
    }
    if (!previewDevicesReady || !previewCamOn || !previewCamId) {
      if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
      return;
    }
    let stream: MediaStream | null = null;
    void navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { exact: previewCamId } },
        audio: false,
      })
      .then((s) => {
        stream = s;
        if (previewVideoRef.current) previewVideoRef.current.srcObject = s;
      })
      .catch(() => {
        if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
      });
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [props.mode, previewDevicesReady, previewCamOn, previewCamId]);

  if (props.mode === "settings") {
    const {
      devices,
      selectedMic,
      onSelectedMicChange,
      selectedCam,
      onSelectedCamChange,
      selectedSpeaker,
      onSelectedSpeakerChange,
      speakerSelectData,
      onApply,
      onCancel,
    } = props;

    return (
      <Stack gap="md">
        <Select
          label="Microphone"
          placeholder="Choose microphone"
          data={devices.mics.map((d) => ({
            value: d.deviceId,
            label: d.label || `Mic ${d.deviceId.slice(0, 8)}`,
          }))}
          value={selectedMic}
          onChange={onSelectedMicChange}
        />
        <Select
          label="Camera"
          placeholder="Choose camera"
          data={devices.cams.map((d) => ({
            value: d.deviceId,
            label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
          }))}
          value={selectedCam}
          onChange={onSelectedCamChange}
        />
        <SpeakerOutputBlock
          mode="settings"
          speakerSelectData={speakerSelectData}
          selectedSpeaker={selectedSpeaker}
          onSelectedSpeakerChange={onSelectedSpeakerChange}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => void onApply()}>Apply</Button>
        </Group>
      </Stack>
    );
  }

  const {
    devices,
    devicesReady,
    selectedMic,
    onSelectedMicChange,
    selectedCam,
    onSelectedCamChange,
    selectedSpeaker,
    onSelectedSpeakerChange,
    micOn,
    onMicOnChange,
    camOn,
    onCamOnChange,
    customAudioOutputOn,
    onCustomAudioOutputOnChange,
    speakerSelectData,
    canJoin,
    connecting,
    error,
    onJoin,
  } = props;

  return (
    <Box className={classes.root}>
      <Center className={classes.joinWrap}>
        <Paper className={classes.joinCard} p="xl" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Text size="xl" fw={700}>
                Video meeting
              </Text>
              <Text size="sm" c="dimmed">
                Choose your microphone, camera, and optional speaker output, set
                whether mic, camera, and hearing others start on or off, then
                join. Device choices are remembered for next time.
              </Text>
            </div>

            {!devicesReady ? (
              <Group justify="center" py="lg">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading devices…
                </Text>
              </Group>
            ) : (
              <>
                <Select
                  label="Microphone"
                  placeholder="Select microphone"
                  data={devices.mics.map((d) => ({
                    value: d.deviceId,
                    label: d.label || `Microphone ${d.deviceId.slice(0, 8)}…`,
                  }))}
                  value={selectedMic}
                  onChange={onSelectedMicChange}
                />
                <Switch
                  label="Microphone on when joining"
                  checked={micOn}
                  onChange={(e) => onMicOnChange(e.currentTarget.checked)}
                />

                <SpeakerOutputBlock
                  mode="prejoin"
                  speakerSelectData={speakerSelectData}
                  selectedSpeaker={selectedSpeaker}
                  onSelectedSpeakerChange={onSelectedSpeakerChange}
                  customAudioOutputOn={customAudioOutputOn}
                  onCustomAudioOutputOnChange={onCustomAudioOutputOnChange}
                />

                <Select
                  label="Camera"
                  placeholder="Select camera"
                  data={devices.cams.map((d) => ({
                    value: d.deviceId,
                    label: d.label || `Camera ${d.deviceId.slice(0, 8)}…`,
                  }))}
                  value={selectedCam}
                  onChange={onSelectedCamChange}
                />
                <Switch
                  label="Camera on when joining"
                  checked={camOn}
                  onChange={(e) => onCamOnChange(e.currentTarget.checked)}
                />

                <div className={classes.prejoinPreview}>
                  {camOn && selectedCam ? (
                    <video ref={previewVideoRef} playsInline muted autoPlay />
                  ) : (
                    <Center style={{ height: "100%", minHeight: rem(160) }}>
                      <Text size="sm" c="dimmed" ta="center" px="md">
                        Camera preview appears when camera is on and a device is
                        selected.
                      </Text>
                    </Center>
                  )}
                </div>
              </>
            )}

            {error ? (
              <Text size="sm" c="red">
                {error}
              </Text>
            ) : null}
            <Button
              fullWidth
              size="md"
              disabled={!canJoin}
              onClick={onJoin}
              loading={connecting}
            >
              Join meeting
            </Button>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
};
