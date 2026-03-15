import {
  TextInput as MantineTextInput,
  type TextInputProps,
} from "@mantine/core";
import classes from "./index.module.scss";

export const TextInput: React.FunctionComponent<TextInputProps> = (props) => {
  return (
    <MantineTextInput
      {...props}
      classNames={{
        ...classes,
        root: props.label ? classes["root"] : classes["root-no-label"],
      }}
    />
  );
};
