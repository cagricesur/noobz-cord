import { Group, Tooltip } from "@mantine/core";
import {
  IconHeadphones,
  IconHeadphonesOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconScreenShare,
  IconVideo,
  IconVideoOff,
} from "@tabler/icons-react";
import type { IParticipantTileStatus } from "./models";

import classes from "./index.module.scss";

const iconSize = 16;

const networkQualityLabel = (quality: IParticipantTileStatus["connectionQuality"]) => {
  const normalized = String(quality).toLowerCase();
  if (normalized === "excellent") return "Excellent";
  if (normalized === "good") return "Good";
  if (normalized === "poor") return "Poor";
  return "Unknown";
};

const networkQualityClass = (
  quality: IParticipantTileStatus["connectionQuality"],
) => {
  const normalized = String(quality).toLowerCase();
  if (normalized === "excellent") return classes.tileNetworkExcellent;
  if (normalized === "good") return classes.tileNetworkGood;
  if (normalized === "poor") return classes.tileNetworkPoor;
  return classes.tileNetworkUnknown;
};

export const ParticipantTileStatusBar: React.FunctionComponent<
  IParticipantTileStatus
> = ({
  speaking,
  connectionQuality,
  micOn,
  deafened,
  cameraOn,
  screenShareOn,
}) => {
  const networkLabel = networkQualityLabel(connectionQuality);

  return (
    <div className={classes.tileStatusBar}>
      <Group gap="sm" justify="center" wrap="nowrap">
        <Tooltip label={speaking ? "Speaking" : "Not speaking"}>
          <span
            className={`${classes.tileSpeakingIndicator} ${
              speaking ? classes.tileSpeakingActive : ""
            }`}
            aria-label={speaking ? "Speaking" : "Not speaking"}
          />
        </Tooltip>
        <Tooltip label={`Network quality: ${networkLabel}`}>
          <span
            className={`${classes.tileNetworkIndicator} ${networkQualityClass(
              connectionQuality,
            )}`}
            aria-label={`Network quality: ${networkLabel}`}
          >
            <span />
            <span />
            <span />
          </span>
        </Tooltip>
        <Tooltip label={micOn ? "Microphone on" : "Microphone muted"}>
          <span className={classes.tileStatusIcon}>
            {micOn ? (
              <IconMicrophone size={iconSize} />
            ) : (
              <IconMicrophoneOff
                size={iconSize}
                className={classes.tileStatusWarn}
              />
            )}
          </span>
        </Tooltip>
        <Tooltip label={deafened ? "Deafened" : "Not deafened"}>
          <span className={classes.tileStatusIcon}>
            {deafened ? (
              <IconHeadphonesOff
                size={iconSize}
                className={classes.tileStatusDeafen}
              />
            ) : (
              <IconHeadphones size={iconSize} />
            )}
          </span>
        </Tooltip>
        <Tooltip label={cameraOn ? "Camera on" : "Camera off"}>
          <span className={classes.tileStatusIcon}>
            {cameraOn ? (
              <IconVideo size={iconSize} />
            ) : (
              <IconVideoOff
                size={iconSize}
                className={classes.tileStatusWarn}
              />
            )}
          </span>
        </Tooltip>
        <Tooltip
          label={screenShareOn ? "Sharing screen" : "Not sharing screen"}
        >
          <span className={classes.tileStatusIcon}>
            <IconScreenShare
              size={iconSize}
              className={
                screenShareOn ? classes.tileStatusShare : classes.tileStatusDim
              }
            />
          </span>
        </Tooltip>
      </Group>
    </div>
  );
};
