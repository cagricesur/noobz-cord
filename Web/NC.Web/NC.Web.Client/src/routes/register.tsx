import RegisterView from "@noobz-cord/views/Register";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterView,
});
