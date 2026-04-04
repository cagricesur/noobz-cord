import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { routeTree } from "@noobz-cord/routeTree.gen";
import { useAuthStore } from "@noobz-cord/stores";
import { theme } from "@noobz-cord/theme";
import { useColorSchemeCookieManager } from "@noobz-cord/utils";
import { createRouter, RouterProvider } from "@tanstack/react-router";

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
import "mantine-datatable/styles.css";
import "@livekit/components-styles";
import "@noobz-cord/theme/theme.scss";

import "@noobz-cord/dayjs";
import "@noobz-cord/i18n";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const PendingComponent: React.FunctionComponent = () => {
  return (
    <LoadingOverlay
      visible
      overlayProps={{ fixed: true, blur: 5 }}
      loaderProps={{ type: "bars" }}
    />
  );
};

const router = createRouter({
  routeTree,
  context: {
    authState: undefined!,
  },
  defaultPendingComponent: PendingComponent,
});

const App: React.FunctionComponent = () => {
  const authState = useAuthStore();
  const colorSchemeCookieManager = useColorSchemeCookieManager();

  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={colorSchemeCookieManager}
      defaultColorScheme="dark"
    >
      <Notifications />
      <RouterProvider router={router} context={{ authState }} />
    </MantineProvider>
  );
};

export default App;
