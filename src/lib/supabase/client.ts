import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./config";

export function createSupabaseBrowserClient() {
  const config = getPublicSupabaseConfig();

  if (!config.isConfigured) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createBrowserClient(config.url, config.publishableKey);
}
