import {
  ActionIcon,
  AppShell,
  Avatar,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import type { IAppState } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import {
  IconHeadphones,
  IconMicrophone,
  IconSettings,
} from "@tabler/icons-react";

const RootLayout: React.FunctionComponent = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 320,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      padding={isAuthenticated ? "md" : 0}
      disabled={!isAuthenticated}
      transitionDuration={0}
    >
      <AppShell.Header></AppShell.Header>
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
                <ActionIcon variant="transparent" color="white">
                  <IconSettings />
                </ActionIcon>
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
