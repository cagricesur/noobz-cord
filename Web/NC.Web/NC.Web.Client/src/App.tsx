import { useAuthStore } from "@noobz-cord/stores";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { CookiesProvider } from "react-cookie";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  context: {
    authState: undefined!,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App: React.FunctionComponent = () => {
  const authState = useAuthStore();
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <CookiesProvider>
      <RouterProvider router={router} context={{ authState }} />
    </CookiesProvider>
  );
};

export default App;
