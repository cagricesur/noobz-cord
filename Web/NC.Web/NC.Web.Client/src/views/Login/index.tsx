import {
  Button,
  Divider,
  Flex,
  FocusTrap,
  Group,
  Image,
  Modal,
  Paper,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import logo from "@noobz-cord/assets/logo.png";
import { ColorSchemeSwitcher, LanguageSwitcher } from "@noobz-cord/components";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthForm, type IAuthFormActions } from "./AuthForm";
import FloatingLines from "./FloatingLines";
import GradientText from "./GradientText";

import { getRouteApi } from "@tanstack/react-router";
import classes from "./index.module.scss";
import { useMediaQuery } from "@mantine/hooks";

const LoginView: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const routeApi = getRouteApi("/");
  const search = routeApi.useSearch();
  const [activation, setActivation] = useState<boolean>(
    search.activation === true,
  );
  const form = useRef<IAuthFormActions>(null);
  const isMobile = useMediaQuery("(max-width: 48em)");

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

      <Modal
        centered
        size="auto"
        padding="xl"
        radius="md"
        withCloseButton={false}
        opened={activation}
        fullScreen={isMobile}
        overlayProps={{
          fixed: true,
          blur: 5,
        }}
        transitionProps={{
          transition: "fade",
          duration: 500,
          timingFunction: "linear",
        }}
        onClose={() => setActivation(false)}
      >
        <FocusTrap.InitialFocus />
        <Stack gap={32}>
          <Text>{t("VIEW.LOGIN.ACTIVATION.MESSAGE")}</Text>
          <Button onClick={() => setActivation(false)}>
            {t("VIEW.LOGIN.ACTIVATION.BUTTON")}
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default LoginView;
