import ErrorView from "@noobz-cord/views/Error";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/error")({
  validateSearch: z.object({
    error: z
      .object({
        code: z.string(),
        title: z.string(),
        descripton: z.string(),
        buttonText: z.string().optional(),
        buttonClick: z.function().optional(),
      })
      .optional(),
  }),
  component: ErrorView,
});
