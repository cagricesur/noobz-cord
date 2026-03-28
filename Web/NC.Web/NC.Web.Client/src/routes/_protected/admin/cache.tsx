import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/cache")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/admin/cache"!</div>;
}
