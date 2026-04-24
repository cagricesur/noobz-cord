import ActivationView from "@noobz-cord/views/Activation";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/activation")({
  validateSearch: z.object({
    token: z.string(),
    tokenHash: z.string(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/" });
    }
  },
  component: ActivationView,
});
