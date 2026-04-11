import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import classnames from "./index.module.scss";

const ErrorView: React.FunctionComponent = () => {
  const routeApi = getRouteApi("/error");
  const nav = routeApi.useNavigate();
  const search = routeApi.useSearch();

  const { t } = useTranslation();

  return (
    <Center w="100dvw" className={classnames.root}>
      <Text className={classnames.code}>{search.error?.code ?? 503}</Text>

      <Stack className={classnames.stack}>
        <Title className={classnames.title}>
          {search.error?.title ?? t("VIEW.ERROR.TITLE")}
        </Title>
        <Text c="dimmed" ta="center" className={classnames.description}>
          {search.error?.descripton ?? t("VIEW.ERROR.DESC")}
        </Text>

        <Group justify="center">
          <Button
            size="md"
            onClick={() => {
              if (search.error?.buttonClick) {
                search.error.buttonClick();
              } else {
                nav({ to: "/" });
              }
            }}
          >
            {search.error?.buttonText ?? t("VIEW.ERROR.BUTTONTEXT")}
          </Button>
        </Group>
      </Stack>
    </Center>
  );
};

export default ErrorView;
