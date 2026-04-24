import { PreLogin } from "@noobz-cord/components";
import {
  useRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";

export interface IAuthFormActions {
  reset: () => void;
}

export type AuthFormComponent = ForwardRefExoticComponent<
  RefAttributes<IAuthFormActions>
>;

interface IAuthViewProps {
  form: AuthFormComponent;
}

export const AuthView: React.FunctionComponent<IAuthViewProps> = (props) => {
  const form = useRef<IAuthFormActions>(null);
  return (
    <PreLogin
      hasColorSchemeSwitcher={true}
      hasLanguageSwitcher={true}
      onLanguageSwitched={() => form.current?.reset()}
    >
      <props.form ref={form} />
    </PreLogin>
  );
};
