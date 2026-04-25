import { Select, Switch, Text } from "@mantine/core";
import { supportsAudioOutputSelection } from "livekit-client";

export const SpeakerOutputBlock: React.FunctionComponent<{
  mode: "prejoin" | "settings";
  speakerSelectData: { value: string; label: string }[];
  selectedSpeaker: string | null;
  onSelectedSpeakerChange: (value: string | null) => void;
  customAudioOutputOn?: boolean;
  onCustomAudioOutputOnChange?: (on: boolean) => void;
}> = ({
  mode,
  speakerSelectData,
  selectedSpeaker,
  onSelectedSpeakerChange,
  customAudioOutputOn,
  onCustomAudioOutputOnChange,
}) => {
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
        nothingFoundMessage="No speaker outputs found"
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
        placeholder="Select output"
        nothingFoundMessage="No speaker outputs found"
        data={speakerSelectData}
        value={selectedSpeaker}
        onChange={onSelectedSpeakerChange}
      />
      <Switch
        label="Use selected speaker when joining"
        checked={customAudioOutputOn!}
        onChange={(e) => onCustomAudioOutputOnChange!(e.currentTarget.checked)}
      />
    </>
  );
};
