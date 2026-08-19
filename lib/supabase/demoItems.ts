import { DEMO_INBOX_SCENARIOS } from "@/lib/demo/inbox-scenarios";
import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InboxItemRow } from "@/types/database";

let pendingSeed: Promise<InboxItemRow[]> | undefined;

const legacyDemoTitles = new Set([
  "ChangYuan 毛毯照片墙",
  "北京咖啡地图",
  "2026 广州超级草莓音乐节",
  "面试准备提醒",
  "女性文学书单",
]);
const currentDemoTitles = new Set(DEMO_INBOX_SCENARIOS.map(({ title }) => title));

/** Prepares the portfolio dataset without removing genuine uploaded items. */
export function ensureDemoInboxItems(existingItems: InboxItemRow[], { enabled = false }: { enabled?: boolean } = {}) {
  const genuineItems = existingItems.filter((item) => !isRecognizedDemo(item) && !isDevelopmentArtifact(item));
  if (!enabled) return Promise.resolve(sortNewestFirst(genuineItems));

  const currentDemoItems = existingItems.filter((item) => currentDemoTitles.has(item.title) && !item.image_path);
  if (currentDemoItems.length === DEMO_INBOX_SCENARIOS.length) return Promise.resolve(sortNewestFirst([...genuineItems, ...currentDemoItems]));

  const hasDemoOrArtifacts = existingItems.some((item) => isRecognizedDemo(item) || isDevelopmentArtifact(item));
  if (existingItems.length > 0 && !hasDemoOrArtifacts) return Promise.resolve(existingItems);

  pendingSeed ??= prepareDemoInboxItems(existingItems, genuineItems).finally(() => { pendingSeed = undefined; });
  return pendingSeed;
}

async function prepareDemoInboxItems(existingItems: InboxItemRow[], genuineItems: InboxItemRow[]) {
  const user = await ensureAnonymousUser();
  const now = Date.now();
  const rows = DEMO_INBOX_SCENARIOS.map(({ key: _key, ...scenario }, index) => {
    void _key;
    const existingDemo = existingItems.find((item) => isRecognizedDemo(item) && item.intent === scenario.intent);
    const timestamp = new Date(now - index * 60_000).toISOString();
    return {
      ...scenario,
      id: existingDemo?.id ?? crypto.randomUUID(),
      user_id: user.id,
      image_path: null,
      status: "new" as const,
      reminder_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    };
  });
  const { data, error } = await getSupabaseBrowserClient().from("inbox_items").upsert(rows, { onConflict: "id" }).select("*");
  if (error) throw new Error(`Demo Inbox could not be prepared: ${error.message}`);
  return sortNewestFirst([...genuineItems, ...data]);
}

function isRecognizedDemo(item: InboxItemRow) {
  return !item.image_path && (legacyDemoTitles.has(item.title) || currentDemoTitles.has(item.title));
}

function isDevelopmentArtifact(item: InboxItemRow) {
  if (item.image_path) return false;
  const title = item.title.trim().toLowerCase();
  const summary = item.summary?.trim().toLowerCase();
  return item.intent === "other"
    || title === "untitled screenshot"
    || title === "analyzed screenshot"
    || summary === "analyzed screenshot";
}

function sortNewestFirst(items: InboxItemRow[]) {
  return items.sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
}
