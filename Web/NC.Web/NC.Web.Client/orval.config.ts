import { defineConfig } from "orval";

export default defineConfig({
  noobzcord: {
    input: {
      target: "./openapi.json",
    },
    output: {
      workspace: "src/api",
      mode: "tags",
      clean: true,
      prettier: true,
      target: "./generated/api.ts",
      schemas: "./generated/models",
      client: "axios",
      override: {
        mutator: {
          path: "./axios-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
