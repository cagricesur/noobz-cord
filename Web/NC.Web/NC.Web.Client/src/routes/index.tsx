import { useAuthStore } from "@noobz-cord/stores";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const HomeView = React.lazy(() => import("@noobz-cord/views/Home"));
const LoginView = React.lazy(() => import("@noobz-cord/views/Login"));

const RouteComponent: React.FunctionComponent = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <HomeView /> : <LoginView />;
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
