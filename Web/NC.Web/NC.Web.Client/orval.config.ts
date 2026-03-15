import { defineConfig } from "orval";

export default defineConfig({
  noobzcord: {
    input: {
      target: "./openapi.json",
    },
    output: {
      target: "./src/api/generated/api.ts",
      schemas: "./src/api/generated/models",
      client: "axios",
      override: {
        mutator: {
          path: "./src/api/axios-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
