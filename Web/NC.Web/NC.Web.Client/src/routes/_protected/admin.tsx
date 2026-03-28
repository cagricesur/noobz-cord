import { createFileRoute } from "@tanstack/react-router";
import AdminView from "@noobz-cord/views/Admin";

export const Route = createFileRoute("/_protected/admin")({
  component: AdminView,
});
