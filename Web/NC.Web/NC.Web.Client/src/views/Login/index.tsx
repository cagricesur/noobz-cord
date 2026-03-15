import {
  Button,
  Divider,
  Flex,
  Group,
  Image,
  Paper,
  Stack,
  Tabs,
} from "@mantine/core";
import { isEmail, matchesField, useForm } from "@mantine/form";
import { PasswordInput, TextInput } from "@noobz-cord/components";
import FloatingLines from "./FloatingLines";
import GradientText from "./GradientText";

import logo from "@noobz-cord/assets/logo.png";
import classes from "./index.module.scss";

interface IAuthFormProps {
  registration?: boolean;
}

const AuthForm: React.FunctionComponent<IAuthFormProps> = (props) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      mail: "",
      name: "",
      password1: "",
      password2: "",
    },

    validate: {
      mail: isEmail("Invalid mail"),
      password1: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
      password2: matchesField("password1", "Passwords are not the same"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(() => {})}>
      <Stack>
        {props.registration && (
          <TextInput
            label="Name"
            placeholder="Your name"
            value={form.values.name}
            onChange={(event) =>
              form.setFieldValue("name", event.currentTarget.value)
            }
            radius="md"
          />
        )}

        <TextInput
          label="Email"
          placeholder="hello@mantine.dev"
          value={form.values.mail}
          onChange={(event) =>
            form.setFieldValue("mail", event.currentTarget.value)
          }
          error={form.errors.mail && "Invalid email"}
          radius="md"
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          value={form.values.password1}
          onChange={(event) =>
            form.setFieldValue("password1", event.currentTarget.value)
          }
          error={
            form.errors.password &&
            "Password should include at least 6 characters"
          }
          radius="md"
        />

        {props.registration && (
          <PasswordInput
            required
            label="Confirm Password"
            placeholder="Your password"
            value={form.values.password2}
            onChange={(event) =>
              form.setFieldValue("password2", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />
        )}

        <Button type="submit" radius="md">
          {props.registration ? "Register" : "Login"}
        </Button>
      </Stack>
    </form>
  );
};

const LoginView: React.FunctionComponent = () => {
  return (
    <>
      <FloatingLines
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={5}
        lineDistance={5}
        bendRadius={5}
        bendStrength={-0.5}
        interactive={false}
        parallax={false}
      />
      <Flex h="100vh" justify="center" align="center" p="md">
        <Paper radius="md" p="md" classNames={classes}>
          <Stack align="stretch" gap={0}>
            <Group justify="center">
              <Image src={logo} h={64} w={64} />
            </Group>
            <GradientText
              colors={["#70DC9F", "#3ECAE9"]}
              animationSpeed={8}
              yoyo
            >
              NoobzCord
            </GradientText>

            <Divider my={32} />

            <Tabs defaultValue="login">
              <Tabs.List grow>
                <Tabs.Tab value="login">LOGIN</Tabs.Tab>
                <Tabs.Tab value="register">REGISTER</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="login" mt="md">
                <AuthForm />
              </Tabs.Panel>
              <Tabs.Panel value="register" mt="md">
                <AuthForm registration />
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>
      </Flex>
    </>
  );
};

export default LoginView;
