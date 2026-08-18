import { createClient } from "@supabase/supabase-js";

import { researchGroundedContext } from "@/lib/ai/research";
import { ResearchInputError, ResearchOutputError, validateResearchRequest } from "@/lib/ai/researchContract";
import { ZhipuConfigurationError, ZhipuProviderError } from "@/lib/ai/providers/zhipu";
import type { Database } from "@/types/database";

export const maxDuration = 120;

export async function POST(request: Request) {
  const authenticated = await authenticateRequest(request);
  if (authenticated instanceof Response) return authenticated;

  try {
    const body: unknown = await request.json();
    const input = validateResearchRequest(body);
    const result = await researchGroundedContext(input);
    return Response.json({ success: true, result });
  } catch (error) {
    if (error instanceof ResearchInputError || error instanceof SyntaxError) return failure("Valid grounded research context is required.", 400);
    if (error instanceof ResearchOutputError) return failure("AI returned an invalid research result.", 502);
    if (error instanceof ZhipuConfigurationError) return failure("AI research is not configured.", 503);
    if (error instanceof ZhipuProviderError) {
      if (error.kind === "rate_limit") return failure("AI research is temporarily rate limited.", 429);
      if (error.kind === "timeout") return failure("AI research timed out.", 504);
      return failure("Unable to complete research.", 502);
    }
    console.error("Research failed", error instanceof Error ? error.name : "UnknownError");
    return failure("Unable to complete research.", 500);
  }
}

async function authenticateRequest(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return failure("Authentication is required.", 401);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return failure("Supabase is not configured.", 503);

  const supabase = createClient<Database>(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return failure("Authentication is invalid or expired.", 401);
  return { userId: data.user.id };
}

function failure(error: string, status: number) {
  return Response.json({ success: false, error }, { status });
}
