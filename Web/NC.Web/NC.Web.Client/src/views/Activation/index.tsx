import { Stack, Text, useMantineTheme } from "@mantine/core";
import type { ServiceError } from "@noobz-cord/api";
import { PreLogin } from "@noobz-cord/components";
import { IconExclamationCircle } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivationCodeInput } from "./ActivationCodeInput";

const ActivationView: React.FunctionComponent = () => {
  const routeApi = getRouteApi("/activation");
  const search = routeApi.useSearch();
  const nav = routeApi.useNavigate();
  const theme = useMantineTheme();
  const { t } = useTranslation();
  const [error, setError] = useState<string>();

  const onComplete = () => {
    nav({ to: "/login" });
  };

  const onError = (serviceError: AxiosError<ServiceError>) => {
    setError(t(serviceError.response?.data?.code ?? "ERROR.UNKNOWN"));
  };

  return (
    <PreLogin>
      <Stack gap={16} justify="center" align="center">
        <IconExclamationCircle size={64} color={theme.colors.orange[6]} />

        <Text c="dimmed" ta="center" size="sm">
          {t("VIEW.ACTIVATION.INFO")}
        </Text>

        <Text ta="center" size="sm">
          {t("VIEW.ACTIVATION.DIRECTIVE")}
        </Text>

        <ActivationCodeInput
          token={search.token}
          tokenHash={search.tokenHash}
          onSuccess={onComplete}
          onError={onError}
        />

        {error && (
          <Text c={theme.colors.red[6]} ta="center">
            {error}
          </Text>
        )}
      </Stack>
    </PreLogin>
  );
};

export default ActivationView;
