import { readFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

const baseUrl = process.env.AI_INBOX_URL ?? "http://localhost:3000";
const fixtureDirectory = process.env.AI_INBOX_FIXTURE_DIR ?? resolve("tests", "fixtures");
const fixtures = [
  ["product", "shop"],
  ["restaurant", "go"],
  ["chat-task", "do"],
  ["concert", "attend"],
  ["book-list", "remember"],
  ["unclear", "other"],
];
const allowedIntents = new Set(["shop", "go", "do", "attend", "remember", "other"]);
const allowedActions = new Set(["save", "compare", "research", "want_to_go", "navigate", "add_to_plan", "create_task", "remind", "schedule", "add_calendar", "summarize", "tag"]);

let failures = 0;
for (const [name, expectedIntent] of fixtures) {
  const filePath = resolve(fixtureDirectory, `${name}.png`);
  try {
    const bytes = await readFile(filePath);
    const formData = new FormData();
    formData.append("screenshot", new Blob([bytes], { type: mimeType(filePath) }), basename(filePath));
    const response = await fetch(`${baseUrl}/api/analyze`, { method: "POST", body: formData });
    const payload = await response.json();
    if (!response.ok) throw new Error(`${response.status}: ${payload.error ?? "Unknown API error"}`);
    const result = payload.result;
    const keys = Object.keys(result).join(",");
    if (keys !== "intent,confidence,title,summary,fields,actions") throw new Error(`unstable keys: ${keys}`);
    if (!allowedIntents.has(result.intent)) throw new Error(`invalid intent: ${result.intent}`);
    if (result.intent !== expectedIntent) throw new Error(`expected ${expectedIntent}, received ${result.intent}`);
    if (name !== "unclear" && (typeof result.title !== "string" || !result.title.trim())) throw new Error("missing title");
    if (result.summary !== null && (typeof result.summary !== "string" || result.summary.length > 240)) throw new Error("invalid or overly long summary");
    if (!Array.isArray(result.fields)) throw new Error("fields must be an array");
    if (!Array.isArray(result.actions) || result.actions.length > 3 || result.actions.some((action) => !allowedActions.has(action))) throw new Error("invalid actions");
    console.log(`PASS ${name}: ${result.intent} - ${result.title ?? "untitled"}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

if (failures) process.exit(1);
console.log("All six live screenshot analyses returned a stable JSON contract.");

function mimeType(filePath) {
  const extension = extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}
