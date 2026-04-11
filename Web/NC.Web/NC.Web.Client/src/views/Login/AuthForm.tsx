import { Button, List, Modal, Stack, Switch, Text } from "@mantine/core";
import { isEmail, matchesField, useForm, type FormErrors } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { PasswordInput, TextInput } from "@noobz-cord/components";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

import { getAuth } from "@noobz-cord/api";
import { useAuthStore } from "@noobz-cord/stores";
import { getRouteApi } from "@tanstack/react-router";

interface IAuthFormProps {
  registration?: boolean;
}
export interface IAuthFormActions {
  reset: () => void;
}

const COOKIE_KEY_MAIL = "noobzcord-auth-mail";
const COOKIE_KEY_REMEMBER = "noobzcord-auth-remember";

const authApi = getAuth();

export const AuthForm = forwardRef<IAuthFormActions, IAuthFormProps>(
  (props, ref) => {
    const { t, i18n } = useTranslation();
    const authStore = useAuthStore();
    const [opened, { open, close }] = useDisclosure(false);
    const router = getRouteApi("/");
    const nav = router.useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies([
      COOKIE_KEY_MAIL,
      COOKIE_KEY_REMEMBER,
    ]);
    const [loading, setLoading] = useState<boolean>(false);
    const form = useForm({
      mode: "uncontrolled",
      validateInputOnChange: true,
      clearInputErrorOnChange: true,
      initialValues: {
        mail: props.registration ? "" : (cookies[COOKIE_KEY_MAIL] ?? ""),
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
              return t(
                "VIEW.LOGIN.FORM.VALIDATON.PASSWORD.ATLEAST1SPECIALCHAR",
              );
            }
          }
          if (value.length < 8 || value.length > 16) {
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

    const login = (values: {
      mail: string;
      name: string;
      password1: string;
      password2: string;
      remember: boolean;
    }) => {
      authApi
        .postApiAuthLogin({
          contact: values.mail,
          password: values.password1,
        })
        .then((response) => {
          const authenticated = response && response.name && response.token;
          if (authenticated) {
            authStore.login(response);
            setCookie(COOKIE_KEY_REMEMBER, values.remember);
            if (values.remember) {
              setCookie(COOKIE_KEY_MAIL, values.mail);
            } else {
              removeCookie(COOKIE_KEY_MAIL);
            }
            nav({ to: "/", replace: true });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };
    const register = (values: {
      mail: string;
      name: string;
      password1: string;
      password2: string;
      remember: boolean;
    }) => {
      authApi
        .postApiAuthRegister({
          contact: values.mail,
          name: values.name,
          password: values.password1,
          passwordConfirm: values.password2,
          language: i18n.language,
        })
        .then(() => {
          open();
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const submit = (values: {
      mail: string;
      name: string;
      password1: string;
      password2: string;
      remember: boolean;
    }) => {
      setLoading(true);
      if (props.registration) {
        register(values);
      } else {
        login(values);
      }
    };

    const error = (errors: FormErrors) => {
      const firstErrorPath = Object.keys(errors)[0];
      form.getInputNode(firstErrorPath)?.focus();
    };

    return (
      <>
        <Modal opened={opened} onClose={close} size="auto" centered>
          <Text>Your registration is completed, check your mail.</Text>
        </Modal>
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

            {!props.registration && (
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
            )}

            <Button type="submit" radius="md" loading={loading}>
              {props.registration
                ? t("VIEW.LOGIN.FORM.SUBMIT.REGISTER")
                : t("VIEW.LOGIN.FORM.SUBMIT.LOGIN")}
            </Button>
          </Stack>
        </form>
      </>
    );
  },
);
