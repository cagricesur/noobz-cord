import { createFileRoute } from "@tanstack/react-router";
import CacheManagementView from "@noobz-cord/views/Admin/CacheManagement";

export const Route = createFileRoute("/_protected/admin/cache")({
  component: CacheManagementView,
});
