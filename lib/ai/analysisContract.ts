import {
  ANALYSIS_ACTIONS,
  ANALYSIS_INTENTS,
  type AnalysisAction,
  type AnalysisField,
  type AnalysisIntent,
  type ScreenshotAnalysis,
} from "@/types/analysis";

export const SCREENSHOT_ANALYSIS_SYSTEM_PROMPT = `You are the Screenshot Intent & Action Extraction Engine for AI Inbox.

Analyze only information visibly present in the screenshot. Return structured data that helps a user decide what to do next.

Product rules:
1. Select exactly ONE primary intent: shop, go, do, attend, remember, or other.
2. Never invent, assume, complete, or "correct" information that is not visible. If an expected value is missing or ambiguous, return null for that field.
3. Confidence is a UX guidance score for extraction clarity, not a calibrated probability. Use an integer from 0 to 100. Do not describe it as likelihood or certainty.
4. The user remains in control. Actions are suggestions only. Never state or imply that an action has already been executed.
5. Preserve names, prices, dates, times, locations, and relative wording exactly enough to avoid changing their meaning.
6. Use "other" when no allowed intent clearly dominates.
7. Understand why the user may have saved the screenshot. Classify by the user's likely next action, never by the source app alone.
8. Keep the title short and the summary concise.
9. Recommend at most three actions, using only the allowed action names.

Intent guidance:
- shop: a product or purchase decision
- go: a restaurant, place, or destination
- do: a task, request, commitment, or follow-up
- attend: an event with attendance value
- remember: reference material, a list, or useful information to retain
- other: none of the above clearly applies

Ambiguity examples:
- A WeChat message asking the user to send a PPT before a deadline is do.
- A Xiaohongshu restaurant recommendation is go.
- A Xiaohongshu headphones recommendation is shop.
- A concert poster is attend.
- A reading list is remember.
- If only "tomorrow afternoon" is visible, preserve that date wording and return null for an exact time.
- If an exact address, price, or year is not visible or reasonably established, return null for that field.

Allowed suggested actions:
- shop: save, compare, research
- go: want_to_go, navigate, add_to_plan
- do: create_task, remind, schedule
- attend: add_calendar, remind, navigate
- remember: save, summarize, tag
- other: only suggest an allowed action when directly useful; otherwise return an empty array

Fields:
- Return a stable array of relevant key/label/value entries.
- Use short snake_case keys and human-readable labels.
- Include expected high-value fields for the selected intent even when their value is missing; use null rather than guessing.
- Do not include commentary, markdown, or facts outside the screenshot.

Return JSON only, matching this exact top-level shape:
{
  "intent": "shop | go | do | attend | remember | other",
  "confidence": 0,
  "title": "short title or null",
  "summary": "concise summary or null",
  "fields": [{ "key": "snake_case_key", "label": "Human label", "value": "visible value or null" }],
  "actions": ["up to three allowed action names"]
}`;

export const SCREENSHOT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    intent: { type: "string", enum: ANALYSIS_INTENTS },
    confidence: { type: "integer", minimum: 0, maximum: 100, description: "UX guidance score for extraction clarity; not a probability." },
    title: { type: ["string", "null"] },
    summary: { type: ["string", "null"] },
    fields: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          value: { type: ["string", "null"] },
        },
        required: ["key", "label", "value"],
        additionalProperties: false,
      },
    },
    actions: { type: "array", maxItems: 3, items: { type: "string", enum: ANALYSIS_ACTIONS } },
  },
  required: ["intent", "confidence", "title", "summary", "fields", "actions"],
  additionalProperties: false,
} as const;

export class AnalysisConfigurationError extends Error {}
export class AnalysisOutputError extends Error {}

export function validateScreenshotAnalysis(value: unknown): ScreenshotAnalysis {
  if (!isRecord(value)) throw new AnalysisOutputError("Analysis must be an object.");
  if (!ANALYSIS_INTENTS.includes(value.intent as AnalysisIntent)) throw new AnalysisOutputError("Analysis contains an invalid intent.");
  if (!Number.isInteger(value.confidence) || (value.confidence as number) < 0 || (value.confidence as number) > 100) throw new AnalysisOutputError("Analysis contains an invalid confidence score.");
  if (value.title !== null && typeof value.title !== "string") throw new AnalysisOutputError("Analysis contains an invalid title.");
  if (value.summary !== null && typeof value.summary !== "string") throw new AnalysisOutputError("Analysis contains an invalid summary.");
  if (!Array.isArray(value.fields) || !value.fields.every(isAnalysisField)) throw new AnalysisOutputError("Analysis contains invalid fields.");
  if (!Array.isArray(value.actions) || value.actions.length > 3 || !value.actions.every((action) => ANALYSIS_ACTIONS.includes(action as AnalysisAction))) throw new AnalysisOutputError("Analysis contains invalid actions.");

  return {
    intent: value.intent as AnalysisIntent,
    confidence: value.confidence as number,
    title: value.title as string | null,
    summary: value.summary as string | null,
    fields: value.fields as AnalysisField[],
    actions: Array.from(new Set(value.actions as AnalysisAction[])),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnalysisField(value: unknown): value is AnalysisField {
  return isRecord(value) && typeof value.key === "string" && value.key.length > 0 && typeof value.label === "string" && value.label.length > 0 && (typeof value.value === "string" || value.value === null);
}
