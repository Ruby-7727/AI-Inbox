import { createClient } from "@supabase/supabase-js";

import { createReminder } from "@/lib/supabase/reminders";
import type { Database, ReminderStatus } from "@/types/database";

export async function GET(request: Request) {
  const authenticated = await getAuthenticatedSupabase(request);
  if (authenticated instanceof Response) return authenticated;

  const { data, error } = await authenticated.supabase
    .from("reminders")
    .select("*")
    .eq("user_id", authenticated.userId)
    .order("status", { ascending: false })
    .order("remind_at", { ascending: true });

  if (error) return failure("Unable to load reminders", 500);
  return Response.json({ success: true, reminders: data });
}

export async function POST(request: Request) {
  const authenticated = await getAuthenticatedSupabase(request);
  if (authenticated instanceof Response) return authenticated;

  const body = await readJson(request);
  const title = cleanRequiredString(body?.title);
  const remindAt = parseReminderDate(body?.remindAt);
  const description = cleanOptionalString(body?.description);
  const inboxItemId = body?.inboxItemId;

  if (!title) return failure("A reminder title is required.", 400);
  if (!remindAt) return failure("A valid remindAt value is required.", 400);
  if (description === null) return failure("description must be a string.", 400);
  if (inboxItemId !== undefined && !isUuid(inboxItemId)) return failure("inboxItemId must be a valid UUID.", 400);

  try {
    if (inboxItemId) {
      const { data: inboxItem, error: inboxError } = await authenticated.supabase
        .from("inbox_items")
        .select("id")
        .eq("id", inboxItemId)
        .eq("user_id", authenticated.userId)
        .maybeSingle();
      if (inboxError) return failure("Unable to create reminder", 500);
      if (!inboxItem) return failure("Inbox item not found.", 404);
    }

    const reminder = await createReminder({
      userId: authenticated.userId,
      inboxItemId,
      title,
      ...(description ? { description } : {}),
      remindAt,
    }, authenticated.supabase);
    return Response.json({ success: true, reminder }, { status: 201 });
  } catch {
    return failure("Unable to create reminder", 500);
  }
}

export async function PATCH(request: Request) {
  const authenticated = await getAuthenticatedSupabase(request);
  if (authenticated instanceof Response) return authenticated;

  const body = await readJson(request);
  const id = body?.id;
  const status = body?.status;
  if (!isUuid(id)) return failure("A valid reminder id is required.", 400);
  if (!isReminderStatus(status)) return failure("status must be pending or completed.", 400);

  const { data, error } = await authenticated.supabase
    .from("reminders")
    .update({ status })
    .eq("id", id)
    .eq("user_id", authenticated.userId)
    .select()
    .maybeSingle();

  if (error) return failure("Unable to update reminder", 500);
  if (!data) return failure("Reminder not found.", 404);
  return Response.json({ success: true, reminder: data });
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

function failure(error: string, status: number) {
  return Response.json({ success: false, error }, { status });
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function cleanRequiredString(value: unknown) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

function cleanOptionalString(value: unknown) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  return value.trim() || undefined;
}

function parseReminderDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isReminderStatus(value: unknown): value is ReminderStatus {
  return value === "pending" || value === "completed";
}
