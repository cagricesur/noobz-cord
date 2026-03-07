import { useAuthStore } from "@noobz-cord/stores";
import { createRouter, RouterProvider } from "@tanstack/react-router";
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
  return <RouterProvider router={router} context={{ authState }} />;
};

export default App;
