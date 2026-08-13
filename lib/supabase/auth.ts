import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

let pendingUser: Promise<User> | undefined;

export function ensureAnonymousUser() {
  pendingUser ??= getOrCreateUser().finally(() => { pendingUser = undefined; });
  return pendingUser;
}

async function getOrCreateUser() {
  const supabase = getSupabaseBrowserClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session?.user) return sessionData.session.user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return an anonymous user.");
  return data.user;
}
