import { LoadingOverlay } from "@mantine/core";

interface IPendingOverlayProps {
  visible: boolean;
}

export const PendingOverlay: React.FunctionComponent<IPendingOverlayProps> = (
  props,
) => {
  return (
    <LoadingOverlay
      visible={props.visible}
      overlayProps={{ fixed: true, blur: 5 }}
      loaderProps={{ type: "bars" }}
    />
  );
};
