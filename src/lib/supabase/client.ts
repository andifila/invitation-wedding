import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// During prerender (build time) env vars may be unavailable — use a placeholder
// so the build doesn't fail. All actual API calls happen client-side in the browser
// where the real values are baked in by Next.js at build time.
const clientUrl = supabaseUrl.startsWith("http")
  ? supabaseUrl
  : "https://placeholder.supabase.co";
const clientKey = supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient<Database>(clientUrl, clientKey);
