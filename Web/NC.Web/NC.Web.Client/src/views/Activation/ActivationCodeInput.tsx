import { PinInput } from "@mantine/core";
import { getUser, type ServiceError } from "@noobz-cord/api";
import { PendingOverlay } from "@noobz-cord/components";
import type { AxiosError } from "axios";

import { useRef, useState } from "react";

const api = getUser();

interface IActivationCodeInputProps {
  token: string;
  tokenHash: string;
  onSuccess: () => void;
  onError: (error: AxiosError<ServiceError>) => void;
}

export const ActivationCodeInput: React.FunctionComponent<
  IActivationCodeInputProps
> = (props) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const activate = (pin: string) => {
    setLoading(true);
    api
      .postApiUserActivate({
        pin: pin,
        token: props.token,
        tokenHash: props.tokenHash,
      })
      .then(props.onSuccess)
      .catch(props.onError)
      .finally(() => {
        setValue("");
        setLoading(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      });
  };

  return (
    <>
      <PinInput
        ref={inputRef}
        autoFocus={true}
        type="number"
        inputMode="numeric"
        oneTimeCode={true}
        size="xl"
        radius="md"
        length={6}
        disabled={isLoading}
        value={value}
        placeholder="-"
        onChange={setValue}
        onComplete={(value) => activate(value)}
      />

      <PendingOverlay visible={isLoading} />
    </>
  );
};
