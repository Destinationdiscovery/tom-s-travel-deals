/// <reference types="vite/client" />

// Declare the env vars this app reads so that strict
// noPropertyAccessFromIndexSignature allows dot access on import.meta.env.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
}
