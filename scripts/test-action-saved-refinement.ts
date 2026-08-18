import assert from "node:assert/strict";

import { inboxRowToCard } from "../lib/supabase/presenters";
import { normalizeSavedCategory, savedCategoryForIntent } from "../lib/supabase/savedCategories";
import type { InboxItemRow } from "../types/database";

function item(overrides: Partial<InboxItemRow>): InboxItemRow {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    user_id: "00000000-0000-4000-8000-000000000002",
    image_path: null,
    intent: "remember",
    title: "女性书单 | 女孩保持阅读",
    summary: "A reading list worth keeping.",
    confidence: 90,
    structured_data: {
      fields: [{ key: "books", label: "Books", value: "A grounded reading list" }],
      actions: ["save", "summarize"],
    },
    status: "new",
    reminder_at: null,
    created_at: "2026-08-18T00:00:00.000Z",
    updated_at: "2026-08-18T00:00:00.000Z",
    ...overrides,
  };
}

const remember = inboxRowToCard(item({}));
assert.deepEqual(remember.actions.map(({ label }) => label), ["Save", "Research"]);
assert.equal(remember.actions.some(({ actionType }) => actionType === "reminder"), false);
assert.equal(remember.actions.find(({ actionType }) => actionType === "research")?.researchType, "general");

const shop = inboxRowToCard(item({
  intent: "shop",
  title: "Sony WH-1000XM6",
  structured_data: { fields: [{ key: "price", label: "Price", value: "¥2,999" }], actions: ["save", "research"] },
}));
assert.deepEqual(shop.actions.map(({ label }) => label), ["Save", "Research Product"]);
assert.equal(shop.actions.find(({ actionType }) => actionType === "research")?.researchType, "product");

const go = inboxRowToCard(item({
  intent: "go",
  title: "Spain itinerary",
  structured_data: { fields: [{ key: "location", label: "Location", value: "Spain" }], actions: ["navigate", "add_to_plan"] },
}));
assert.deepEqual(go.actions.map(({ label }) => label), ["Open Map"]);

const restaurantNavigation = inboxRowToCard(item({
  intent: "go",
  title: "Tokyo Ramen",
  summary: "Navigate to this restaurant.",
  structured_data: {
    fields: [{ key: "restaurant", label: "Restaurant", value: "Tokyo Ramen" }],
    actions: ["navigate"],
  },
}));
assert.deepEqual(restaurantNavigation.actions.map(({ label }) => label), ["Open Map"]);

const recommendedPlace = inboxRowToCard(item({
  intent: "go",
  title: "Tokyo coffee shop recommendations",
  summary: "A curated coffee shop list for a future Tokyo trip.",
  structured_data: {
    fields: [{ key: "recommended_cafes", label: "Recommended cafés", value: "Koffee Mameya, Glitch Coffee" }],
    actions: ["navigate", "research", "save"],
  },
}));
assert.deepEqual(recommendedPlace.actions.map(({ label }) => label), ["Open Map", "Research Trip", "Save Place"]);
assert.equal(recommendedPlace.actions.find(({ actionType }) => actionType === "research")?.researchType, "trip");

const task = inboxRowToCard(item({ intent: "do", title: "Send PPT", structured_data: { fields: [], actions: ["remind"] } }));
assert.deepEqual(task.actions.map(({ label }) => label), ["Remind Me"]);

const event = inboxRowToCard(item({ intent: "attend", title: "Concert", structured_data: { fields: [], actions: ["add_calendar"] } }));
assert.deepEqual(event.actions.map(({ label }) => label), ["Add Calendar"]);

assert.equal(savedCategoryForIntent("shop"), "product");
assert.equal(savedCategoryForIntent("go"), "place");
assert.equal(savedCategoryForIntent("remember"), "note");
assert.equal(normalizeSavedCategory(undefined), "note");
assert.equal(normalizeSavedCategory("unexpected"), "note");

console.log("Action and Saved refinement tests passed.");
