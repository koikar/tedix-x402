import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),

    // Supabase - New API Key System
    SUPABASE_URL: z.string().url(),
    SUPABASE_PUBLISHABLE_KEY: z.string().startsWith("sb_publishable_"),
    SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),

    // API and External Services
    AI_GATEWAY_API_KEY: z.string(),
    OPENAI_API_KEY: z.string(),
    BACKEND_URL: z.string().url(),

    // Coinbase CDP (for x402 payments)
    CDP_API_KEY_ID: z.string(),
    CDP_API_KEY_SECRET: z.string(),
    CDP_WALLET_SECRET: z.string(),
    EVM_NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
    SOLANA_NETWORK: z
      .enum(["solana-devnet", "solana"])
      .default("solana-devnet"),
    KEYPAIR_SECRET: z.string().default(""),

    // Node environment
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    NEXT_PUBLIC_APP_TITLE: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
      .string()
      .startsWith("sb_publishable_"),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_FRONTEND_URL: z.string().url(),
    NEXT_PUBLIC_MCP_URL: z.string().url().optional(),
    NEXT_PUBLIC_EVM_NETWORK: z
      .enum(["base-sepolia", "base"])
      .default("base-sepolia"),
    NEXT_PUBLIC_SOLANA_NETWORK: z
      .enum(["solana-devnet", "solana"])
      .default("solana-devnet"),
    NEXT_PUBLIC_RECEIVER_ADDRESS: z.string(),
    NEXT_PUBLIC_FACILITATOR_URL: z.string().url(),
    NEXT_PUBLIC_CDP_CLIENT_KEY: z.string(),
  },

  // For Next.js >= 13.4.4, you only need to destructure client variables
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL,
    NEXT_PUBLIC_EVM_NETWORK: process.env.NEXT_PUBLIC_EVM_NETWORK,
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
    NEXT_PUBLIC_RECEIVER_ADDRESS: process.env.NEXT_PUBLIC_RECEIVER_ADDRESS,
    NEXT_PUBLIC_FACILITATOR_URL: process.env.NEXT_PUBLIC_FACILITATOR_URL,
    NEXT_PUBLIC_CDP_CLIENT_KEY: process.env.NEXT_PUBLIC_CDP_CLIENT_KEY,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
