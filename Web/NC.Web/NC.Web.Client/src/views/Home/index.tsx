import {
  AppShell,
  Box,
  Button,
  Combobox,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  useCombobox,
  useMantineTheme,
} from "@mantine/core";
import logo from "@noobz-cord/assets/logo.png";
import { ColorSchemeSwitcher, LanguageSwitcher } from "@noobz-cord/components";
import {
  IconHeadphones,
  IconHeadphonesOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconVideo,
  IconVideoOff,
  type IconProps,
} from "@tabler/icons-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";

interface IMediaDeviceOption {
  value: string;
  label: string;
}

interface IDeviceSelectProps {
  onChange?: (device: IMediaDeviceOption | null) => void;
  deviceKind: MediaDeviceKind;
  OnIcon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  OffIcon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
}

const DeviceSelect: React.FunctionComponent<IDeviceSelectProps> = ({
  onChange,
  deviceKind,
  OffIcon,
  OnIcon,
}) => {
  const disabled = useMemo(() => {
    return { value: "disabled", label: "Disabled" } as IMediaDeviceOption;
  }, []);

  const [options, setOptions] = useState<IMediaDeviceOption[]>([]);
  const [device, setDevice] = useState<IMediaDeviceOption>(disabled);
  const findDevice = useCallback(
    (value: string) => {
      return options.find((option) => option.value === value) ?? disabled;
    },
    [options, disabled],
  );
  const isDisabled = useCallback(() => device.value === "disabled", [device]);
  const theme = useMantineTheme();

  const combobox = useCombobox({});

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const audioDevices = devices
            .filter((device) => device.kind === deviceKind)
            .map((device) => ({
              value: device.deviceId,
              label: device.label || `${device.deviceId.slice(0, 8)}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          setOptions(audioDevices);
          setDevice(audioDevices[0] ?? disabled);
        });
      })
      .catch((err) => {
        console.error(`Error accessing ${deviceKind} devices.`, err);
      });
  }, [deviceKind, disabled]);

  useEffect(() => {
    onChange?.(isDisabled() ? null : device);
  }, [device, isDisabled, onChange]);

  return (
    <Combobox
      store={combobox}
      width={256}
      position="bottom-start"
      withArrow
      onOptionSubmit={(value) => {
        setDevice(findDevice(value));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Button
          variant="outline"
          justify="flex-start"
          w={256}
          leftSection={
            isDisabled() ? (
              <OffIcon size={16} color={theme.colors.red[6]} />
            ) : (
              <OnIcon size={16} />
            )
          }
          onClick={() => combobox.toggleDropdown()}
        >
          <Text fz={12} c={isDisabled() ? theme.colors.red[6] : undefined}>
            {device.label}
          </Text>
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {[
            { value: "disabled", label: "Disabled" } as IMediaDeviceOption,
            ...options,
          ].map((option) => (
            <Combobox.Option
              key={option.value}
              value={option.value}
              active={option.value === device.value}
            >
              <Text
                fz={12}
                c={
                  option.value === device.value
                    ? theme.colors.green[6]
                    : undefined
                }
              >
                {option.label}
              </Text>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

const PreJoinForm: React.FunctionComponent = () => {
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    };
  }, []);

  const startCameraPreview = (device: IMediaDeviceOption | null) => {
    debugger;
    const video = previewRef.current;
    if (!video) {
      return;
    }

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;

    if (device) {
      navigator.mediaDevices
        .getUserMedia({ video: { deviceId: { exact: device.value } } })
        .then((stream) => {
          debugger;
          streamRef.current = stream;
          video.srcObject = stream;
          video.play().catch(() => undefined);
        });
    }
  };

  return (
    <Paper radius="md" p="md" w={512}>
      <Stack align="center">
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
        <DeviceSelect
          OnIcon={IconVideo}
          OffIcon={IconVideoOff}
          deviceKind="videoinput"
          onChange={startCameraPreview}
        />
        <DeviceSelect
          OnIcon={IconMicrophone}
          OffIcon={IconMicrophoneOff}
          deviceKind="audioinput"
          onChange={(device) => {
            console.log(device);
          }}
        />
        <DeviceSelect
          OnIcon={IconHeadphones}
          OffIcon={IconHeadphonesOff}
          deviceKind="audiooutput"
          onChange={(device) => {
            console.log(device);
          }}
        />
      </Stack>
    </Paper>
  );
};

const HomeView: React.FunctionComponent = () => {
  const [joined, setJoined] = useState(false);

  return (
    <AppShell
      header={{ height: 64 }}
      aside={{
        collapsed: { desktop: !joined, mobile: !joined },
        width: 256,
        breakpoint: "sm",
      }}
      padding="md"
      transitionDuration={0}
    >
      <AppShell.Header>
        <Group h="100%" px="xs" justify="space-between">
          <Image src={logo} h={48} w={48} />
          <Group gap={0}>
            <LanguageSwitcher />
            <ColorSchemeSwitcher />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <PreJoinForm />
      </AppShell.Main>
      <AppShell.Aside></AppShell.Aside>
    </AppShell>
  );
};

export default HomeView;
