import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ResearchRequestInput, ResearchResult } from "@/types/research";

export async function requestResearch(input: ResearchRequestInput): Promise<ResearchResult> {
  await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient().auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Anonymous session is unavailable.");

  const response = await fetch("/api/research", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await response.json() as { success?: boolean; result?: ResearchResult; error?: string };
  if (!response.ok || !payload.success || !payload.result) throw new Error(payload.error ?? "Research could not be completed.");
  return payload.result;
}
