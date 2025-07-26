import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path:
    process.env.NODE_ENV === "development"
      ? ".env.development"
      : ".env.production",
});

export default defineConfig({
  schema: "../../packages/db/src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
