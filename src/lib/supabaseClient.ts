import { createClient } from "@supabase/supabase-js";

// Publishable (anon) key is safe to embed in the frontend.
const SUPABASE_URL = "https://vpddinfafgbocwtiysoy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_px10Xlibsgkg8aTRxSEYtQ_-0YM_ieH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
