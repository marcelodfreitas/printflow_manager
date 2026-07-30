import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase envs ausentes. URL: ${url ? "OK" : "MISSING"} | KEY: ${key ? "OK" : "MISSING"}`
    );
  }

  return createBrowserClient(url, key);
}