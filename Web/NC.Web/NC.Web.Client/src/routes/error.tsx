import ErrorView from "@noobz-cord/views/Error";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/error")({
  component: ErrorView,
});
