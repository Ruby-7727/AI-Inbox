import { DEMO_INBOX_SCENARIOS, isDemoModeEnabled } from "@/lib/demo/inbox-scenarios";
import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InboxItemRow } from "@/types/database";

let pendingSeed: Promise<InboxItemRow[]> | undefined;

/** Seeds only a fresh anonymous Inbox when the explicit portfolio demo mode is enabled. */
export function ensureDemoInboxItems(existingItems: InboxItemRow[]) {
  if (!isDemoModeEnabled || existingItems.length > 0) return Promise.resolve(existingItems);
  pendingSeed ??= seedDemoInboxItems().finally(() => { pendingSeed = undefined; });
  return pendingSeed;
}

async function seedDemoInboxItems() {
  const user = await ensureAnonymousUser();
  const now = Date.now();
  const rows = DEMO_INBOX_SCENARIOS.map(({ key: _key, ...scenario }, index) => {
    void _key;
    const timestamp = new Date(now - index * 60_000).toISOString();
    return {
      ...scenario,
      id: crypto.randomUUID(),
      user_id: user.id,
      image_path: null,
      status: "new" as const,
      reminder_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    };
  });
  const { data, error } = await getSupabaseBrowserClient().from("inbox_items").insert(rows).select("*");
  if (error) throw new Error(`Demo Inbox could not be prepared: ${error.message}`);
  return data.sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
}
