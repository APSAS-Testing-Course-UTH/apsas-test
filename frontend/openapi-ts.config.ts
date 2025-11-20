import { defineConfig } from "@hey-api/openapi-ts"

const services = ["identity-service", "content-service", "submission-service", "evaluation-service", "support-service", "notification-service"]

export default defineConfig({
  input: services.map((service) => `./openapi/${service}.json`),
  output: {
    path: "./src/api",
    lint: "eslint",
    format: "prettier",
  },
  plugins: [
    "@hey-api/client-fetch",
    "zod",
    {
      name: "@hey-api/transformers",
      dates: true,
      exportFromIndex: true,
    },
    {
      name: "@hey-api/typescript",
      enums: "javascript",
      exportFromIndex: true,
    },
    {
      name: "@hey-api/sdk",
      auth: true,
      transformer: true,
      exportFromIndex: true,
    },
    {
      name: "@tanstack/react-query",
      queries: true,
      mutations: true,
      transformer: true,
    },
  ],
})
