import assert from "node:assert/strict";

import { DEMO_INBOX_SCENARIOS } from "../lib/demo/inbox-scenarios";
import { getDemoVisual, shouldShowItemVisual } from "../lib/demo/visuals";
import { getDetectedSignals } from "../lib/analysis/explainability";
import { inboxRowToCard } from "../lib/supabase/presenters";
import { savedCategoryForIntent } from "../lib/supabase/savedCategories";
import type { InboxItemRow } from "../types/database";

const expectedActions = {
  shop: ["Save", "Research Product"],
  go: ["Open Map", "Research Trip", "Save Place"],
  attend: ["Add Calendar"],
  do: ["Remind Me"],
  remember: ["Save", "Research"],
};

const expectedSignals = {
  shop: "Product information",
  go: "Location information",
  attend: "Schedule details",
  do: "Actionable task",
  remember: "Reading list",
};

assert.equal(DEMO_INBOX_SCENARIOS.length, 5);
assert.deepEqual(DEMO_INBOX_SCENARIOS.map(({ title }) => title), [
  "2026 广州超级草莓音乐节",
  "面试准备提醒",
  "北京意面封神榜",
  "ELLE 行李箱",
  "女性书单 | 女孩保持阅读",
]);
for (const [index, { key, ...scenario }] of DEMO_INBOX_SCENARIOS.entries()) {
  const timestamp = new Date(Date.UTC(2026, 7, 18, 12, index)).toISOString();
  const row: InboxItemRow = {
    ...scenario,
    summary: scenario.summary ?? null,
    confidence: scenario.confidence ?? null,
    structured_data: scenario.structured_data ?? {},
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
    user_id: "00000000-0000-4000-8000-000000000010",
    image_path: null,
    status: "new",
    reminder_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };
  assert.deepEqual(inboxRowToCard(row).actions.map(({ label }) => label), expectedActions[key]);
  assert.ok(getDetectedSignals({
    intent: row.intent,
    title: row.title,
    summary: row.summary,
    fields: row.structured_data.fields,
  }).includes(expectedSignals[key]));
  assert.equal(shouldShowItemVisual({ intent: row.intent, title: row.title, supportingText: row.summary }), key !== "do");
  if (key !== "do") assert.ok(getDemoVisual(row.title));
}

assert.equal(savedCategoryForIntent("shop"), "product");
assert.equal(savedCategoryForIntent("go"), "place");
assert.equal(savedCategoryForIntent("remember"), "note");

console.log("Demo scenario tests passed.");
