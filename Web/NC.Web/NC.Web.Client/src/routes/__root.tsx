import type { IAppState } from "@noobz-cord/models";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<IAppState>()({
  component: Outlet,
});
