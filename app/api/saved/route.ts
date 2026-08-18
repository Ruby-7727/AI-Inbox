import { createClient } from "@supabase/supabase-js";

import { savedCategoryForIntent } from "@/lib/supabase/savedCategories";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const authenticated = await getAuthenticatedSupabase(request);
  if (authenticated instanceof Response) return authenticated;

  const body = await readJson(request);
  const inboxItemId = body?.inbox_item_id;
  if (!isUuid(inboxItemId)) return Response.json({ error: "A valid inbox_item_id is required." }, { status: 400 });

  const { supabase, userId } = authenticated;
  const { data: inboxItem, error: inboxError } = await supabase
    .from("inbox_items")
    .select("id, intent")
    .eq("id", inboxItemId)
    .eq("user_id", userId)
    .maybeSingle();
  if (inboxError) return Response.json({ error: "Saved item could not be created." }, { status: 500 });
  if (!inboxItem) return Response.json({ error: "Inbox item not found." }, { status: 404 });

  const existing = await findSavedItem(supabase, userId, inboxItemId);
  if (existing.error) return Response.json({ error: "Saved item could not be created." }, { status: 500 });
  if (existing.data) return Response.json({ saved_item: existing.data, already_saved: true });

  const { data, error } = await supabase.from("saved_items").insert({
    user_id: userId,
    inbox_item_id: inboxItemId,
    category: savedCategoryForIntent(inboxItem.intent),
  }).select().single();

  if (error?.code === "23505") {
    const duplicate = await findSavedItem(supabase, userId, inboxItemId);
    if (duplicate.data) return Response.json({ saved_item: duplicate.data, already_saved: true });
  }
  if (error || !data) return Response.json({ error: "Saved item could not be created." }, { status: 500 });
  return Response.json({ saved_item: data, already_saved: false }, { status: 201 });
}

export async function DELETE(request: Request) {
  const authenticated = await getAuthenticatedSupabase(request);
  if (authenticated instanceof Response) return authenticated;

  const body = await readJson(request);
  const savedItemId = body?.saved_item_id;
  if (!isUuid(savedItemId)) return Response.json({ error: "A valid saved_item_id is required." }, { status: 400 });

  const { data, error } = await authenticated.supabase
    .from("saved_items")
    .delete()
    .eq("id", savedItemId)
    .eq("user_id", authenticated.userId)
    .select("id")
    .maybeSingle();
  if (error) return Response.json({ error: "Saved item could not be removed." }, { status: 500 });
  if (!data) return Response.json({ error: "Saved item not found." }, { status: 404 });
  return Response.json({ removed: true });
}

async function getAuthenticatedSupabase(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return Response.json({ error: "Authentication is required." }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return Response.json({ error: "Supabase is not configured." }, { status: 503 });

  const supabase = createClient<Database>(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: "Authentication is invalid or expired." }, { status: 401 });
  return { supabase, userId: data.user.id };
}

function findSavedItem(supabase: ReturnType<typeof createClient<Database>>, userId: string, inboxItemId: string) {
  return supabase.from("saved_items").select("*").eq("user_id", userId).eq("inbox_item_id", inboxItemId).maybeSingle();
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
