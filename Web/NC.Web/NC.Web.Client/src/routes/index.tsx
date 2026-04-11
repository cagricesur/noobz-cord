import { useAuthStore } from "@noobz-cord/stores";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

const HomeView = React.lazy(() => import("@noobz-cord/views/Home"));
const LoginView = React.lazy(() => import("@noobz-cord/views/Login"));

const RouteComponent: React.FunctionComponent = () => {
  const authenticated = useAuthStore((s) => s.authenticated);
  return authenticated ? <HomeView /> : <LoginView />;
};

export const Route = createFileRoute("/")({
  validateSearch: z.object({
    activation: z.boolean().optional(),
  }),
  component: RouteComponent,
});
