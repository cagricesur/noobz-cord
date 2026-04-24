import HomeView from "@noobz-cord/views/Home";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeView,
  beforeLoad: ({ context }) => {
    if (!context.authState.authenticated) {
      throw redirect({ to: "/login" });
    }
  },
});
