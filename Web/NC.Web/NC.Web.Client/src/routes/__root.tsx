import {
  ActionIcon,
  AppShell,
  Avatar,
  Divider,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import type { IAppState } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";

import {
  IconHeadphones,
  IconMicrophone,
  IconSettings,
} from "@tabler/icons-react";

import logo from "@noobz-cord/assets/logo.png";
import { ColorSchemeSwitcher, LanguageSwitcher } from "@noobz-cord/components";

const RootLayout: React.FunctionComponent = () => {
  const role = useAuthStore((state) => state.user?.role);
  const authenticated = useAuthStore((state) => state.authenticated);
  const nav = useNavigate();

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 320,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      padding={authenticated ? "md" : 0}
      disabled={!authenticated}
      transitionDuration={0}
    >
      <AppShell.Header>
        <Group h="100%" px="xs" justify="space-between">
          <Image src={logo} h={48} w={48} />
          <Group gap={0}>
            <LanguageSwitcher />
            <ColorSchemeSwitcher />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs" pr={0}>
        <AppShell.Section grow component={ScrollArea}></AppShell.Section>
        <AppShell.Section p="xs">
          <Stack>
            <Divider />
            <Group justify="space-between">
              <Group>
                <Avatar name="unsignedinteger" color="initials" />
                <Text maw={128} truncate="end">
                  unsignedinteger
                </Text>
              </Group>
              <Group gap={4}>
                <ActionIcon variant="transparent" color="white">
                  <IconMicrophone />
                </ActionIcon>
                <ActionIcon variant="transparent" color="white">
                  <IconHeadphones />
                </ActionIcon>
                {role === "Admin" && (
                  <ActionIcon
                    variant="transparent"
                    color="white"
                    onClick={() => {
                      nav({ to: "/admin" });
                    }}
                  >
                    <IconSettings />
                  </ActionIcon>
                )}
              </Group>
            </Group>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export const Route = createRootRouteWithContext<IAppState>()({
  component: RootLayout,
});
