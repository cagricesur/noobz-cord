import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  type LiveKitRoomProps,
} from "@livekit/components-react";

interface IRoomProps {
  token: LiveKitRoomProps["token"];
  video: LiveKitRoomProps["video"];
  audio: LiveKitRoomProps["audio"];
  server: LiveKitRoomProps["serverUrl"];
  onDisconnected: LiveKitRoomProps["onDisconnected"];
}

const Room: React.FunctionComponent<IRoomProps> = (props) => {
  return (
    <LiveKitRoom
      connect
      serverUrl={props.server}
      token={props.token}
      video={props.video}
      audio={props.audio}
      data-lk-theme="default"
      onDisconnected={props.onDisconnected}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};
export default Room;
