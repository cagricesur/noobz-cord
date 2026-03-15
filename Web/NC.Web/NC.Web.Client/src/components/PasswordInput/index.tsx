import {
  PasswordInput as MantinePasswordInput,
  type PasswordInputProps,
} from "@mantine/core";
import classes from "./index.module.scss";

export const PasswordInput: React.FunctionComponent<PasswordInputProps> = (
  props,
) => {
  return (
    <MantinePasswordInput
      {...props}
      classNames={{
        ...classes,
        root: props.label ? classes["root"] : classes["root-no-label"],
      }}
    />
  );
};
