import {
  Button,
  Divider,
  Flex,
  Group,
  Image,
  List,
  Paper,
  Stack,
  Switch,
  Tabs,
} from "@mantine/core";
import { isEmail, matchesField, useForm, type FormErrors } from "@mantine/form";
import {
  ColorSchemeSwitcher,
  LanguageSwitcher,
  PasswordInput,
  TextInput,
} from "@noobz-cord/components";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import FloatingLines from "./FloatingLines";
import GradientText from "./GradientText";

import logo from "@noobz-cord/assets/logo.png";
import classes from "./index.module.scss";

interface IAuthFormProps {
  registration?: boolean;
}
interface IAuthFormActions {
  reset: () => void;
}

const COOKIE_KEY_MAIL = "noobzcord-auth-mail";
const COOKIE_KEY_REMEMBER = "noobzcord-auth-remember";

const AuthForm = forwardRef<IAuthFormActions, IAuthFormProps>((props, ref) => {
  const { t } = useTranslation();
  const [cookies, setCookie, removeCookie] = useCookies([
    COOKIE_KEY_MAIL,
    COOKIE_KEY_REMEMBER,
  ]);
  const form = useForm({
    mode: "uncontrolled",
    validateInputOnChange: true,
    clearInputErrorOnChange: true,
    initialValues: {
      mail: cookies[COOKIE_KEY_MAIL] ?? "",
      name: "",
      password1: "",
      password2: "",
      remember: cookies[COOKIE_KEY_REMEMBER] ?? true,
    },

    validate: {
      mail: isEmail(t("VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")),
      name: (value) => {
        if (props.registration) {
          if (!value) {
            return t("VIEW.LOGIN.FORM.VALIDATON.NAME.REQUIRED");
          }
          if (!new RegExp(/^[A-Za-z][A-Za-z0-9]*$/).test(value)) {
            const rules = t("VIEW.LOGIN.FORM.VALIDATON.NAME.FORMAT");
            return (
              <List size="xs">
                {rules.split("|").map((rule) => {
                  return <List.Item>{rule}</List.Item>;
                })}
              </List>
            );
          }
          if (value.length < 5 || value.length > 20) {
            return t("VIEW.LOGIN.FORM.VALIDATON.NAME.LENGTH");
          }
        }
        return null;
      },
      password1: (value) => {
        if (!value) {
          return t("VIEW.LOGIN.FORM.VALIDATON.PASSWORD.REQUIRED");
        }
        if (props.registration) {
          if (!new RegExp(/(?=.*\d)/).test(value)) {
            return t("VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1DIGIT");
          } else if (!new RegExp(/(?=.*[a-z])/).test(value)) {
            return t(
              "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1LOWERCASELETTER",
            );
          } else if (!new RegExp(/(?=.*[A-Z])/).test(value)) {
            return t(
              "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1UPPERCASELETTER",
            );
          } else if (
            !new RegExp(/(?=.*[!@#$%^&*(),.?":{}|<>_-])/).test(value)
          ) {
            return t("VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1SPECIALCHAR");
          }
        }
        if (value.length < 8 || value.length > 10) {
          return t("VIEW.LOGIN.FORM.VALIDATON.PASSWORD.LENGTH");
        }

        return null;
      },
      password2: !props.registration
        ? () => null
        : matchesField(
            "password1",
            t("VIEW.LOGIN.FORM.VALIDATON.PASSWORDCONFIRM.MATCH"),
          ),
    },
  });

  useImperativeHandle(ref, () => {
    return {
      reset() {
        form.reset();
      },
    };
  }, [form]);

  const submit = (values: {
    mail: string;
    name: string;
    password1: string;
    password2: string;
    remember: boolean;
  }) => {
    console.log(values);

    setCookie(COOKIE_KEY_REMEMBER, values.remember);
    if (values.remember) {
      setCookie(COOKIE_KEY_MAIL, values.mail);
    } else {
      removeCookie(COOKIE_KEY_MAIL);
    }
  };

  const error = (errors: FormErrors) => {
    const firstErrorPath = Object.keys(errors)[0];
    form.getInputNode(firstErrorPath)?.focus();
  };

  return (
    <form onSubmit={form.onSubmit(submit, error)}>
      <Stack>
        {props.registration && (
          <TextInput
            label={t("VIEW.LOGIN.FORM.NAME.LABEL")}
            placeholder={t("VIEW.LOGIN.FORM.NAME.PLACEHOLDER")}
            value={form.values.name}
            onChange={(event) =>
              form.setFieldValue("name", event.currentTarget.value)
            }
            error={form.errors.name}
            radius="md"
          />
        )}

        <TextInput
          label={t("VIEW.LOGIN.FORM.MAIL.LABEL")}
          placeholder={t("VIEW.LOGIN.FORM.MAIL.PLACEHOLDER")}
          value={form.values.mail}
          onChange={(event) =>
            form.setFieldValue("mail", event.currentTarget.value)
          }
          error={form.errors.mail}
          radius="md"
        />

        <PasswordInput
          label={t("VIEW.LOGIN.FORM.PASSWORD.LABEL")}
          placeholder={t("VIEW.LOGIN.FORM.PASSWORD.PLACEHOLDER")}
          value={form.values.password1}
          onChange={(event) =>
            form.setFieldValue("password1", event.currentTarget.value)
          }
          error={form.errors.password1}
          radius="md"
        />

        {props.registration && (
          <PasswordInput
            label={t("VIEW.LOGIN.FORM.PASSWORD.CONFIRM.LABEL")}
            placeholder={t("VIEW.LOGIN.FORM.PASSWORD.CONFIRM.PLACEHOLDER")}
            value={form.values.password2}
            onChange={(event) =>
              form.setFieldValue("password2", event.currentTarget.value)
            }
            error={form.errors.password2}
            radius="md"
          />
        )}

        <Switch
          label={t("VIEW.LOGIN.FORM.REMEMBERME")}
          checked={form.values.remember}
          onChange={(event) => {
            form.setFieldValue("remember", event.currentTarget.checked);
            if (!event.currentTarget.checked) {
              removeCookie(COOKIE_KEY_MAIL);
              form.setInitialValues({
                ...form.getInitialValues(),
                mail: "",
                remember: false,
              });
              form.reset();
            }
          }}
        />

        <Button type="submit" radius="md">
          {props.registration
            ? t("VIEW.LOGIN.FORM.SUBMIT.REGISTER")
            : t("VIEW.LOGIN.FORM.SUBMIT.LOGIN")}
        </Button>
      </Stack>
    </form>
  );
});

const LoginView: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const form = useRef<IAuthFormActions>(null);

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
        <Paper radius="md" p="xl" classNames={classes}>
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

            <Divider
              my={32}
              label={
                <Group justify="center">
                  <LanguageSwitcher onChange={() => form.current?.reset()} />
                  <ColorSchemeSwitcher />
                </Group>
              }
            />

            <Tabs defaultValue="login">
              <Tabs.List grow>
                <Tabs.Tab value="login">{t("VIEW.LOGIN.TABS.LOGIN")}</Tabs.Tab>
                <Tabs.Tab value="register">
                  {t("VIEW.LOGIN.TABS.REGISTER")}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="login" mt="md">
                <AuthForm ref={form} />
              </Tabs.Panel>
              <Tabs.Panel value="register" mt="md">
                <AuthForm ref={form} registration />
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>
      </Flex>
    </>
  );
};

export default LoginView;
