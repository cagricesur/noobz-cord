import { createFileRoute } from "@tanstack/react-router";
import TranslationManagementView from "@noobz-cord/views/Admin/TranslationManagement";

export const Route = createFileRoute("/_protected/admin/translations")({
  component: TranslationManagementView,
});
