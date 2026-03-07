import { AuthForm, HomePage } from "@noobz-cord/components";
import { useAuthStore } from "@noobz-cord/stores";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <HomePage />;
  }

  return <AuthForm />;
}
