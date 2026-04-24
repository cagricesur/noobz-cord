import { AuthView } from "@noobz-cord/components";
import { AuthForm } from "./AuthForm";

const LoginView: React.FunctionComponent = () => {
  return <AuthView form={AuthForm} />;
};

export default LoginView;
