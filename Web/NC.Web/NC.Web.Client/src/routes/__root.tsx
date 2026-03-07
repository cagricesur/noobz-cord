import { AppShell, MantineProvider } from "@mantine/core";
import type { IAppState } from "@noobz-cord/models";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useAuthStore } from "@noobz-cord/stores";
import { Logo } from "@noobz-cord/components";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/nprogress/styles.css";
import "@noobz-cord/theme/theme.scss";

const RootLayout: React.FunctionComponent = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        header={{ height: 64 }}
        navbar={{
          width: 256,
          breakpoint: "md",
          collapsed: { desktop: false, mobile: true },
        }}
        aside={{
          width: 256,
          breakpoint: "md",
          collapsed: { desktop: false, mobile: true },
        }}
        padding="md"
        disabled={!isAuthenticated}
        transitionDuration={0}
      >
        <AppShell.Header>
          <Logo layout="horizontal" />
        </AppShell.Header>
        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
        <AppShell.Aside p="md">Aside</AppShell.Aside>
      </AppShell>
      <TanStackRouterDevtools />
    </MantineProvider>
  );
};

export const Route = createRootRouteWithContext<IAppState>()({
  component: RootLayout,
});
