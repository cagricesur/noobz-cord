import { AppShell, Group, Image } from "@mantine/core";
import type { IAppState } from "@noobz-cord/models";
import { useAuthStore } from "@noobz-cord/stores";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import logo from "@noobz-cord/assets/logo.png";
import { ColorSchemeSwitcher, LanguageSwitcher } from "@noobz-cord/components";

const RootLayout: React.FunctionComponent = () => {
  const authenticated = useAuthStore((state) => state.authenticated);

  return (
    <AppShell
      header={{ height: 64 }}
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
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export const Route = createRootRouteWithContext<IAppState>()({
  component: RootLayout,
});
