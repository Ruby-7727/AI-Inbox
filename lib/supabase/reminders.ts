import type { SupabaseClient } from "@supabase/supabase-js";

import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database, ReminderRow, ReminderStatus } from "@/types/database";

export type CreateReminderInput = {
  userId: string;
  inboxItemId?: string;
  title: string;
  description?: string;
  remindAt: string;
};

export type ReminderRequestInput = Omit<CreateReminderInput, "userId">;

export async function createReminder(
  input: CreateReminderInput,
  supabase: SupabaseClient<Database>,
): Promise<ReminderRow> {
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: input.userId,
      inbox_item_id: input.inboxItemId ?? null,
      title: input.title,
      description: input.description ?? null,
      remind_at: input.remindAt,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) throw new Error("Reminder could not be created.");
  return data;
}

export async function requestReminder(input: ReminderRequestInput): Promise<ReminderRow> {
  const accessToken = await getAccessToken();
  const response = await fetch("/api/reminders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  const payload = await response.json() as { success?: boolean; reminder?: ReminderRow; error?: string };
  if (!response.ok || !payload.success || !payload.reminder) {
    throw new Error(payload.error ?? "Reminder could not be created.");
  }
  return payload.reminder;
}

export async function getReminders(): Promise<ReminderRow[]> {
  const accessToken = await getAccessToken();
  const response = await fetch("/api/reminders", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json() as { success?: boolean; reminders?: ReminderRow[]; error?: string };
  if (!response.ok || !payload.success || !payload.reminders) {
    throw new Error(payload.error ?? "Reminders could not be loaded.");
  }
  return payload.reminders;
}

export async function updateReminderStatus(reminderId: string, status: ReminderStatus): Promise<ReminderRow> {
  const accessToken = await getAccessToken();
  const response = await fetch("/api/reminders", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id: reminderId, status }),
  });
  const payload = await response.json() as { success?: boolean; reminder?: ReminderRow; error?: string };
  if (!response.ok || !payload.success || !payload.reminder) {
    throw new Error(payload.error ?? "Reminder status could not be updated.");
  }
  return payload.reminder;
}

async function getAccessToken() {
  await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient().auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Anonymous session is unavailable.");
  return data.session.access_token;
}
