import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env["VITE_SUPABASE_URL"],
  import.meta.env["VITE_SUPABASE_ANON_KEY"],
);

export const OWNER_EMAIL = "ravibist103@gmail.com";
export const HANDLER_EMAIL = "ambitech58@gmail.com";
export const ALLOWED_EMAILS = [OWNER_EMAIL, HANDLER_EMAIL];
