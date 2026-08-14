import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InboxItemRow, SavedItemRow } from "@/types/database";

export type SavedInboxItem = {
  savedItem: SavedItemRow;
  inboxItem: InboxItemRow;
};

export async function saveItem(inboxItemId: string) {
  const accessToken = await getAccessToken();
  const response = await fetch("/api/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ inbox_item_id: inboxItemId }),
  });
  const payload = await response.json() as { saved_item?: SavedItemRow; error?: string };
  if (!response.ok || !payload.saved_item) throw new Error(payload.error ?? "Item could not be saved.");
  return payload.saved_item;
}

export async function getSavedItems(): Promise<SavedInboxItem[]> {
  await ensureAnonymousUser();
  const supabase = getSupabaseBrowserClient();
  const { data: savedItems, error: savedError } = await supabase
    .from("saved_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (savedError) throw savedError;
  if (!savedItems.length) return [];

  const { data: inboxItems, error: inboxError } = await supabase
    .from("inbox_items")
    .select("*")
    .in("id", savedItems.map((item) => item.inbox_item_id));
  if (inboxError) throw inboxError;
  const inboxById = new Map(inboxItems.map((item) => [item.id, item]));

  return savedItems.flatMap((savedItem) => {
    const inboxItem = inboxById.get(savedItem.inbox_item_id);
    return inboxItem ? [{ savedItem, inboxItem }] : [];
  });
}

export async function removeSavedItem(savedItemId: string) {
  const accessToken = await getAccessToken();
  const response = await fetch("/api/saved", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ saved_item_id: savedItemId }),
  });
  const payload = await response.json() as { removed?: boolean; error?: string };
  if (!response.ok || !payload.removed) throw new Error(payload.error ?? "Saved item could not be removed.");
}

async function getAccessToken() {
  await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient().auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error("Anonymous session is unavailable.");
  return data.session.access_token;
}
