import assert from "node:assert/strict";

import { validateScreenshotAnalysis } from "../lib/ai/analysisContract";

const cases = [
  { intent: "shop", confidence: 88, title: "Sony WH-1000XM6", summary: "Noise-canceling headphones listed for ¥2,999.", fields: [{ key: "price", label: "Price", value: "¥2,999" }, { key: "seller", label: "Seller", value: null }], actions: ["save", "compare", "research"] },
  { intent: "go", confidence: 84, title: "Tokyo Ramen", summary: "A ramen restaurant in Shibuya.", fields: [{ key: "location", label: "Location", value: "Shibuya, Tokyo" }, { key: "address", label: "Address", value: null }], actions: ["want_to_go", "navigate", "add_to_plan"] },
  { intent: "do", confidence: 72, title: "Send PPT to Amy", summary: "A request to send a presentation to Amy.", fields: [{ key: "person", label: "Person", value: "Amy" }, { key: "deadline", label: "Deadline", value: "Tomorrow afternoon" }, { key: "exact_time", label: "Exact time", value: null }], actions: ["create_task", "remind", "schedule"] },
  { intent: "attend", confidence: 92, title: "Eason Chan Concert", summary: "A concert event on September 18.", fields: [{ key: "date", label: "Date", value: "Sep 18, 2026" }, { key: "time", label: "Time", value: "19:30" }, { key: "venue", label: "Venue", value: "Shenzhen Bay Sports Center" }], actions: ["add_calendar", "remind", "navigate"] },
  { intent: "remember", confidence: 80, title: "AI Product Reading List", summary: "A list of five AI product management books.", fields: [{ key: "item_count", label: "Item count", value: "5 books" }, { key: "topic", label: "Topic", value: "AI Product Management" }], actions: ["save", "summarize", "tag"] },
] as const;

const expectedKeys = ["intent", "confidence", "title", "summary", "fields", "actions"];

for (const sample of cases) {
  const result = validateScreenshotAnalysis(JSON.parse(JSON.stringify(sample)));
  assert.deepEqual(Object.keys(result), expectedKeys);
  assert.equal(result.intent, sample.intent);
  assert.ok(result.fields.every((field) => Object.keys(field).join(",") === "key,label,value"));
}

console.log(`Analysis contract stable across ${cases.length} representative intent cases.`);
