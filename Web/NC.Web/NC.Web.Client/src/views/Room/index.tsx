import { type LocalUserChoices } from "@livekit/components-react";
import { Box } from "@mantine/core";
import { getConference } from "@noobz-cord/api";
import { lazy, useState } from "react";

const PreJoin = lazy(() => import("./PreJoin"));
const Room = lazy(() => import("./Room"));

interface IRoomState {
  token?: string;
  server?: string;
  room?: string;
  choices: LocalUserChoices;
}

const RoomView: React.FunctionComponent = () => {
  const [state, dispatch] = useState<IRoomState | null>(null);

  const handlePreJoinSubmit = (choices: LocalUserChoices) => {
    const api = getConference();
    api.postApiConferenceJoin().then((response) => {
      dispatch({
        token: response.token,
        server: response.server,
        room: response.room,
        choices,
      });
    });
  };

  const video = () => {
    if (state?.choices?.videoEnabled && state.choices?.videoDeviceId) {
      return { deviceId: state.choices.videoDeviceId };
    }
    return state?.choices?.videoEnabled ?? false;
  };
  const audio = () => {
    if (state?.choices?.audioEnabled && state.choices?.audioDeviceId) {
      return { deviceId: state.choices.audioDeviceId };
    }
    return state?.choices?.audioEnabled ?? false;
  };

  return (
    <Box data-lk-theme="default">
      {state?.token ? (
        <Room
          server={state.server}
          token={state.token}
          video={video()}
          audio={audio()}
          onDisconnected={() => {
            dispatch(null);
          }}
        />
      ) : (
        <PreJoin onSubmit={handlePreJoinSubmit} />
      )}
    </Box>
  );
};

export default RoomView;
