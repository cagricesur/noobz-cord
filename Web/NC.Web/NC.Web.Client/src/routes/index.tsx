import { useAuthStore } from "@noobz-cord/stores";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const RoomView = React.lazy(() => import("@noobz-cord/views/Room"));
const LoginView = React.lazy(() => import("@noobz-cord/views/Login"));

const RouteComponent: React.FunctionComponent = () => {
  const authenticated = useAuthStore((s) => s.authenticated);
  return authenticated ? <RoomView /> : <LoginView />;
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
