import { Avatar, Badge, Paper, Stack, Text } from "@mantine/core";
import {
  type LocalVideoTrack,
  type Participant,
  type RemoteVideoTrack,
  Track,
} from "livekit-client";
import { VideoTile } from "./VideoTile";
import { ParticipantTileStatusBar } from "./ParticipantTileStatusBar";
import { initials, tileStatusFor } from "./utils";

import classes from "./index.module.scss";

export interface IParticipantGridProps {
  participants: Participant[];
  localDeafened: boolean;
}

export const ParticipantGrid: React.FunctionComponent<
  IParticipantGridProps
> = ({ participants, localDeafened }) => (
  <div className={classes.videoGrid}>
    {participants.map((p) => {
      const name = p.name || p.identity;
      const status = tileStatusFor(p, localDeafened);
      const camPub = p.getTrackPublication(Track.Source.Camera);
      const track = camPub?.track;
      const showCamera =
        p.isCameraEnabled &&
        track &&
        track.kind === Track.Kind.Video &&
        !(camPub?.isMuted ?? false);
      if (showCamera) {
        return (
          <VideoTile
            key={p.identity}
            track={track as LocalVideoTrack | RemoteVideoTrack}
            label={name}
            mirror={p.isLocal}
            status={status}
          />
        );
      }
      return (
        <Paper
          key={p.identity}
          className={classes.placeholderTile}
          p={0}
          radius="md"
        >
          <div className={classes.placeholderTileMain}>
            <Avatar size={72} radius="xl" color="indigo">
              {initials(name)}
            </Avatar>
            <Stack gap={8} align="center">
              <Text size="sm" fw={600}>
                {name}
              </Text>
              {p.isLocal ? (
                <Badge size="xs" variant="outline">
                  You
                </Badge>
              ) : null}
            </Stack>
          </div>
          <ParticipantTileStatusBar {...status} />
        </Paper>
      );
    })}
  </div>
);
