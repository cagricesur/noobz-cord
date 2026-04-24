import { Anchor, Button, Divider, Stack, Switch } from "@mantine/core";
import { isEmail, isNotEmpty, useForm, type FormErrors } from "@mantine/form";
import { getUser, type ServiceError } from "@noobz-cord/api";
import {
  PasswordInput,
  TextInput,
  type IAuthFormActions,
} from "@noobz-cord/components";
import { COOKIES } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import { getRouteApi } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";

const api = getUser();

export const AuthForm = forwardRef<IAuthFormActions, unknown>((_, ref) => {
  const { t } = useTranslation();
  const authenticated = useAuthStore((state) => state.authenticated);
  const login = useAuthStore((state) => state.login);
  const router = getRouteApi("/login");
  const nav = router.useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([
    COOKIES.AUTH_MAIL,
    COOKIES.AUTH_REMEMBER_ME,
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm({
    mode: "uncontrolled",
    validateInputOnChange: true,
    clearInputErrorOnChange: true,
    initialValues: {
      mail: cookies[COOKIES.AUTH_MAIL] ?? "",
      password: "",
      remember: cookies[COOKIES.AUTH_REMEMBER_ME] ?? false,
    },

    validate: {
      mail: isEmail(t("VIEW.LOGIN.FORM.VALIDATON.MAIL.FORMAT")),
      password: isNotEmpty(t("VIEW.LOGIN.FORM.VALIDATON.PASSWORD.REQUIRED")),
    },
  });

  useImperativeHandle(ref, () => {
    return {
      reset() {
        form.reset();
      },
    };
  }, [form]);

  useEffect(() => {
    if (authenticated) {
      nav({ to: "/" });
    }
  }, [authenticated, nav]);

  const submit = (values: {
    mail: string;
    password: string;
    remember: boolean;
  }) => {
    setLoading(true);
    api
      .postApiUserLogin({
        contact: values.mail,
        password: values.password,
      })
      .then((response) => {
        const authenticated = response && response.user && response.token;
        if (authenticated) {
          login(response);
          setCookie(COOKIES.AUTH_REMEMBER_ME, values.remember);
          if (values.remember) {
            setCookie(COOKIES.AUTH_MAIL, values.mail);
          } else {
            removeCookie(COOKIES.AUTH_MAIL);
          }
        }
      })
      .catch((error: AxiosError<ServiceError>) => {
        if (error.response?.data?.code) {
          form.resetField("password");
          form.setFieldError("password", t(error.response.data.code));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const error = (errors: FormErrors) => {
    const firstErrorPath = Object.keys(errors)[0];
    form.getInputNode(firstErrorPath)?.focus();
  };

  return (
    <form onSubmit={form.onSubmit(submit, error)}>
      <Stack>
        <TextInput
          label={t("VIEW.LOGIN.FORM.MAIL.LABEL")}
          placeholder={t("VIEW.LOGIN.FORM.MAIL.PLACEHOLDER")}
          value={form.values.mail}
          onChange={(event) =>
            form.setFieldValue("mail", event.currentTarget.value)
          }
          error={form.errors.mail}
          disabled={loading}
          radius="md"
        />

        <PasswordInput
          label={t("VIEW.LOGIN.FORM.PASSWORD.LABEL")}
          placeholder={t("VIEW.LOGIN.FORM.PASSWORD.PLACEHOLDER")}
          value={form.values.password}
          onChange={(event) =>
            form.setFieldValue("password", event.currentTarget.value)
          }
          error={form.errors.password}
          disabled={loading}
          radius="md"
        />

        <Switch
          label={t("VIEW.LOGIN.FORM.REMEMBERME")}
          checked={form.values.remember}
          disabled={loading}
          onChange={(event) => {
            form.setFieldValue("remember", event.currentTarget.checked);
            if (!event.currentTarget.checked) {
              removeCookie(COOKIES.AUTH_MAIL);
              form.setInitialValues({
                ...form.getInitialValues(),
                mail: "",
                remember: false,
              });
              form.reset();
            }
          }}
        />

        <Button type="submit" radius="md" loading={loading}>
          {t("VIEW.LOGIN.FORM.SUBMIT")}
        </Button>

        <Divider my={4} />

        <Anchor
          component="button"
          type="button"
          c="bright"
          opacity={0.85}
          onClick={() => nav({ to: "/register" })}
          size="xs"
          disabled={loading}
        >
          {t("VIEW.LOGIN.REDIRECT.TO.REGISTER")}
        </Anchor>
      </Stack>
    </form>
  );
});
