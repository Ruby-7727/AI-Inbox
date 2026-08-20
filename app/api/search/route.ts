import { createClient } from "@supabase/supabase-js";

import type { Database, InboxItemRow } from "@/types/database";

const MAX_QUERY_LENGTH = 200;

export async function POST(request: Request) {
  const authenticated = await getAuthenticatedSupabase(request);
  if (authenticated instanceof Response) return authenticated;

  const body = await readJson(request);
  const query = cleanQuery(body?.query);
  if (!query) return failure("A search query is required.", 400);

  const { data, error } = await authenticated.supabase
    .from("inbox_items")
    .select("*")
    .eq("user_id", authenticated.userId)
    .order("created_at", { ascending: false });

  if (error) return failure("Unable to search your collection.", 500);

  const results = data.filter((item) => matchesQuery(item, query));
  return Response.json({ results });
}

function matchesQuery(item: InboxItemRow, query: string) {
  const searchableText = [
    item.title,
    item.summary,
    item.intent,
    intentCategory(item.intent),
    ...(item.structured_data.fields ?? []).flatMap((field) => [field.key, field.label, field.value]),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .toLocaleLowerCase();

  return query
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchableText.includes(term));
}

function intentCategory(intent: InboxItemRow["intent"]) {
  if (intent === "attend") return "event calendar attend";
  if (intent === "do") return "task reminder do";
  if (intent === "go") return "place places travel restaurant go";
  if (intent === "shop") return "product products shopping shop";
  if (intent === "remember") return "note notes knowledge reading remember";
  return "other";
}

async function getAuthenticatedSupabase(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
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
  return { supabase, userId: data.user.id };
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function cleanQuery(value: unknown) {
  if (typeof value !== "string") return null;
  const query = value.trim();
  return query && query.length <= MAX_QUERY_LENGTH ? query : null;
}

function failure(error: string, status: number) {
  return Response.json({ error }, { status });
}
