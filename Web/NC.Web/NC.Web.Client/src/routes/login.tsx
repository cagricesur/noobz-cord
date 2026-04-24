import LoginView from "@noobz-cord/views/Login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginView,
});
