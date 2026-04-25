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

export const ParticipantTileStatusBar: React.FunctionComponent<
  IParticipantTileStatus
> = ({ speaking, micOn, deafened, cameraOn, screenShareOn }) => {
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
