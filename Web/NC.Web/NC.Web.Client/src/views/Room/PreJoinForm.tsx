import { Box, Button, Group, Loader, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VoiceJoinChoices } from "./types";

export interface PreJoinFormProps {
  joinLabel?: string;
  submitting?: boolean;
  onSubmit: (choices: VoiceJoinChoices) => void;
}

export const PreJoinForm: React.FunctionComponent<PreJoinFormProps> = ({
  joinLabel = "Join voice channel",
  submitting = false,
  onSubmit,
}) => {
  const [username, setUsername] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
  const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>();
  const [audioOptions, setAudioOptions] = useState<{ value: string; label: string }[]>([]);
  const [videoOptions, setVideoOptions] = useState<{ value: string; label: string }[]>([]);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch {
          /* no devices yet */
        }
      }
    }
    const list = await navigator.mediaDevices.enumerateDevices();
    const audioIn = list
      .filter((d) => d.kind === "audioinput")
      .map((d) => ({
        value: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
      }));
    const videoIn = list
      .filter((d) => d.kind === "videoinput")
      .map((d) => ({
        value: d.deviceId,
        label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
      }));
    setAudioOptions(audioIn);
    setVideoOptions(videoIn);
    setAudioDeviceId((prev) => prev ?? audioIn[0]?.value);
    setVideoDeviceId((prev) => prev ?? videoIn[0]?.value);
  }, []);

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  const previewConstraints = useMemo(() => {
    const v = videoEnabled && videoDeviceId
      ? { deviceId: { exact: videoDeviceId } }
      : videoEnabled
        ? true
        : false;
    const a = audioEnabled && audioDeviceId
      ? { deviceId: { exact: audioDeviceId } }
      : audioEnabled
        ? true
        : false;
    return { video: v, audio: a };
  }, [audioEnabled, audioDeviceId, videoEnabled, videoDeviceId]);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) {
      return;
    }

    const start = async () => {
      streamRef.current?.getTracks().forEach((t) => {
        t.stop();
      });
      streamRef.current = null;

      if (!previewConstraints.video && !previewConstraints.audio) {
        video.srcObject = null;
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(previewConstraints);
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      } catch {
        video.srcObject = null;
      }
    };

    void start();

    return () => {
      streamRef.current?.getTracks().forEach((t) => {
        t.stop();
      });
      streamRef.current = null;
    };
  }, [previewConstraints]);

  const handleSubmit = () => {
    const name = username.trim();
    if (!name) {
      return;
    }
    onSubmit({
      username: name,
      audioEnabled,
      videoEnabled,
      audioDeviceId,
      videoDeviceId,
    });
  };

  return (
    <Stack gap="md">
      <Box
        style={{
          aspectRatio: "16 / 9",
          maxHeight: 220,
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--mantine-color-dark-7)",
          border: "1px solid var(--mantine-color-dark-4)",
        }}
      >
        <video
          ref={previewRef}
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      <TextInput
        label="Display name"
        placeholder="Your name"
        value={username}
        onChange={(e) => {
          setUsername(e.currentTarget.value);
        }}
        required
      />

      <Select
        label="Microphone"
        data={audioOptions}
        value={audioDeviceId ?? null}
        onChange={(v) => {
          setAudioDeviceId(v ?? undefined);
        }}
        disabled={!audioEnabled}
        searchable
      />

      <Select
        label="Camera"
        data={videoOptions}
        value={videoDeviceId ?? null}
        onChange={(v) => {
          setVideoDeviceId(v ?? undefined);
        }}
        disabled={!videoEnabled}
        searchable
      />

      <Group justify="space-between">
        <Switch
          label="Enable microphone"
          checked={audioEnabled}
          onChange={(e) => {
            setAudioEnabled(e.currentTarget.checked);
          }}
        />
        <Switch
          label="Enable camera"
          checked={videoEnabled}
          onChange={(e) => {
            setVideoEnabled(e.currentTarget.checked);
          }}
        />
      </Group>

      <Button
        fullWidth
        onClick={handleSubmit}
        disabled={!username.trim() || submitting}
        leftSection={submitting ? <Loader size="xs" /> : undefined}
      >
        {joinLabel}
      </Button>
    </Stack>
  );
};
