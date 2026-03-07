import {
  ActionIcon,
  AppShell,
  Avatar,
  Divider,
  Group,
  MantineProvider,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import type { IAppState } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import "@mantine/carousel/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";
import { Channels } from "@noobz-cord/components";
import "@noobz-cord/theme/theme.scss";
import {
  IconHeadphones,
  IconMicrophone,
  IconSettings,
} from "@tabler/icons-react";

const RootLayout: React.FunctionComponent = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        header={{ height: 64 }}
        navbar={{
          width: 320,
          breakpoint: "md",
          collapsed: { desktop: false, mobile: true },
        }}
        padding="md"
        disabled={!isAuthenticated}
        transitionDuration={0}
      >
        <AppShell.Header></AppShell.Header>
        <AppShell.Navbar p="xs" pr={0}>
          <AppShell.Section grow component={ScrollArea}>
            <Channels />
          </AppShell.Section>
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
    </MantineProvider>
  );
};

export const Route = createRootRouteWithContext<IAppState>()({
  component: RootLayout,
});
