import {
  PreJoin as LiveKitPreJoin,
  type PreJoinProps,
} from "@livekit/components-react";
import { useAuthStore } from "@noobz-cord/stores/authStore";
import { useTranslation } from "react-i18next";

interface IPreJoinProps {
  onSubmit?: PreJoinProps["onSubmit"];
  onError?: PreJoinProps["onError"];
}

const PreJoin: React.FunctionComponent<IPreJoinProps> = (props) => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  return (
    <LiveKitPreJoin
      debug
      defaults={{ username: user?.name }}
      persistUserChoices
      camLabel={t("VIEW.ROOM.PREJOIN.CAMLABEL")}
      joinLabel={t("VIEW.ROOM.PREJOIN.JOINLABEL")}
      micLabel={t("VIEW.ROOM.PREJOIN.MICLABEL")}
      onError={(error) => {
        props.onError?.(error);
      }}
      onSubmit={(values) => {
        props.onSubmit?.(values);
      }}
    />
  );
};

export default PreJoin;
