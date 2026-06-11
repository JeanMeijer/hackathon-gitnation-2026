import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables. Never exposed to the client.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  /**
   * Client-side environment variables. Must be prefixed with `NEXT_PUBLIC_`.
   */
  client: {},
  /**
   * Next.js bundles env vars statically, so they must be destructured
   * manually here for every key in the schemas above.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
