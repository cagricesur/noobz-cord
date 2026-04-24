import { Anchor, Button, Divider, Stack } from "@mantine/core";
import { isEmail, matchesField, useForm, type FormErrors } from "@mantine/form";
import { getUser, type ServiceError } from "@noobz-cord/api";
import {
  PasswordInput,
  TextInput,
  type IAuthFormActions,
} from "@noobz-cord/components";
import { getRouteApi } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";

const api = getUser();

export const AuthForm = forwardRef<IAuthFormActions, unknown>((_, ref) => {
  const { t } = useTranslation();
  const router = getRouteApi("/register");
  const nav = router.useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm({
    mode: "uncontrolled",
    validateInputOnChange: true,
    clearInputErrorOnChange: true,
    initialValues: {
      mail: "",
      name: "",
      password1: "",
      password2: "",
    },

    validate: {
      name: (value) => {
        if (!value) {
          return t("VIEW.REGISTER.FORM.VALIDATON.NAME.REQUIRED");
        }
        if (!new RegExp(/^[A-Za-z][A-Za-z0-9]*$/).test(value)) {
          return t("VIEW.REGISTER.FORM.VALIDATON.NAME.FORMAT");
        }
        if (value.length < 5 || value.length > 20) {
          return t("VIEW.REGISTER.FORM.VALIDATON.NAME.LENGTH");
        }

        return null;
      },
      mail: isEmail(t("VIEW.REGISTER.FORM.VALIDATON.MAIL.FORMAT")),
      password1: (value) => {
        if (!value) {
          return t("VIEW.REGISTER.FORM.VALIDATON.PASSWORD.REQUIRED");
        } else if (!new RegExp(/(?=.*\d)/).test(value)) {
          return t("VIEW.REGISTER.FORM.VALIDATON.PASSWORD.ATLEAST1DIGIT");
        } else if (!new RegExp(/(?=.*[a-z])/).test(value)) {
          return t(
            "VIEW.REGISTER.FORM.VALIDATON.PASSWORD.ATLEAST1LOWERCASELETTER",
          );
        } else if (!new RegExp(/(?=.*[A-Z])/).test(value)) {
          return t(
            "VIEW.REGISTER.FORM.VALIDATON.PASSWORD.ATLEAST1UPPERCASELETTER",
          );
        } else if (!new RegExp(/(?=.*[!@#$%^&*(),.?":{}|<>_-])/).test(value)) {
          return t("VIEW.REGISTER.FORM.VALIDATON.PASSWORD.ATLEAST1SPECIALCHAR");
        } else if (value.length < 8 || value.length > 16) {
          return t("VIEW.REGISTER.FORM.VALIDATON.PASSWORD.LENGTH");
        }

        return null;
      },
      password2: matchesField(
        "password1",
        t("VIEW.REGISTER.FORM.VALIDATON.PASSWORDCONFIRM.MATCH"),
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
  }) => {
    setLoading(true);
    api
      .postApiUserRegister({
        contact: values.mail,
        name: values.name,
        password: values.password1,
        passwordConfirm: values.password2,
      })
      .then((response) => {
        nav({
          to: "/activation",
          search: {
            token: response.token ?? "",
            tokenHash: response.tokenHash ?? "",
          },
        });
      })
      .catch((error: AxiosError<ServiceError>) => {
        if (error.response?.data?.code) {
          form.resetField("password2");
          form.setFieldError("password2", t(error.response.data.code));
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
          label={t("VIEW.REGISTER.FORM.NAME.LABEL")}
          placeholder={t("VIEW.REGISTER.FORM.NAME.PLACEHOLDER")}
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
          error={form.errors.name}
          disabled={loading}
          radius="md"
        />

        <TextInput
          label={t("VIEW.REGISTER.FORM.MAIL.LABEL")}
          placeholder={t("VIEW.REGISTER.FORM.MAIL.PLACEHOLDER")}
          value={form.values.mail}
          onChange={(event) =>
            form.setFieldValue("mail", event.currentTarget.value)
          }
          error={form.errors.mail}
          disabled={loading}
          radius="md"
        />

        <PasswordInput
          label={t("VIEW.REGISTER.FORM.PASSWORD.LABEL")}
          placeholder={t("VIEW.REGISTER.FORM.PASSWORD.PLACEHOLDER")}
          value={form.values.password1}
          onChange={(event) =>
            form.setFieldValue("password1", event.currentTarget.value)
          }
          error={form.errors.password1}
          disabled={loading}
          radius="md"
        />

        <PasswordInput
          label={t("VIEW.REGISTER.FORM.PASSWORD.CONFIRM.LABEL")}
          placeholder={t("VIEW.REGISTER.FORM.PASSWORD.CONFIRM.PLACEHOLDER")}
          value={form.values.password2}
          onChange={(event) =>
            form.setFieldValue("password2", event.currentTarget.value)
          }
          error={form.errors.password2}
          disabled={loading}
          radius="md"
        />

        <Button type="submit" radius="md" loading={loading}>
          {t("VIEW.REGISTER.FORM.SUBMIT")}
        </Button>

        <Divider my={4} />

        <Anchor
          component="button"
          type="button"
          c="bright"
          opacity={0.85}
          onClick={() => nav({ to: "/login" })}
          size="xs"
          disabled={loading}
        >
          {t("VIEW.REGISTER.REDIRECT.TO.LOGIN")}
        </Anchor>
      </Stack>
    </form>
  );
});
