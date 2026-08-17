import { createAction, resolveActionType } from "@/lib/actions/registry";
import { combineReminderDateAndTime } from "@/lib/actions/reminder-time";
import type { AIAction, ActionType } from "@/lib/actions/types";
import type { AnalysisAction, AnalysisField, AnalysisIntent } from "@/types/analysis";

type IntentActionDefinition = {
  type: ActionType;
  title?: string;
};

type ActionMappingContext = {
  fields?: readonly AnalysisField[];
  locationFallback?: string | null;
  itemTitle?: string | null;
  itemDescription?: string | null;
  inboxItemId?: string | null;
};

const intentActionMap: Partial<Record<AnalysisIntent, readonly IntentActionDefinition[]>> = {
  go: [
    { type: "map" },
    { type: "research", title: "Research Trip" },
  ],
  attend: [{ type: "calendar" }],
  remember: [{ type: "reminder" }],
  shop: [
    { type: "compare" },
    { type: "research", title: "Research Product" },
  ],
  do: [{ type: "reminder" }],
};

/**
 * Normalizes provider suggestions into the small set of actions the product can
 * currently execute. Intent owns the product recommendation; provider labels
 * are only used as a safe fallback for the `other` intent.
 */
export function mapSuggestedActions(
  intent: AnalysisIntent,
  suggestions: readonly AnalysisAction[],
  context: ActionMappingContext = {},
): AIAction[] {
  const intentActions = intentActionMap[intent];
  if (intentActions) {
    return intentActions.map(({ type, title }) => withActionContext(
      {
        ...createAction(type),
        id: `${intent}-${type}`,
        ...(title ? { title } : {}),
      },
      context,
    ));
  }

  const actionTypes = suggestions
    .map(resolveActionType)
    .filter((type): type is ActionType => Boolean(type));

  return [...new Set(actionTypes)].map((type) => withActionContext(createAction(type), context));
}

function withActionContext(action: AIAction, context: ActionMappingContext): AIAction {
  if (action.type === "map") {
    return { ...action, location: findLocation(context.fields) ?? cleanValue(context.locationFallback) };
  }
  if (action.type === "reminder") {
    const timing = findReminderTiming(context.fields);
    return {
      ...action,
      reminderTitle: cleanValue(context.itemTitle) ?? action.title,
      reminderDescription: cleanValue(context.itemDescription),
      reminderDate: timing.reminderDate,
      remindAt: timing.remindAt,
      inboxItemId: cleanValue(context.inboxItemId),
    };
  }
  return action;
}

function findLocation(fields: readonly AnalysisField[] | undefined) {
  const locationKeys = ["address", "location", "venue", "place", "destination", "restaurant", "city"];
  const field = fields?.find(({ key, label, value }) => {
    if (!cleanValue(value)) return false;
    const descriptor = `${key} ${label}`.toLowerCase();
    return locationKeys.some((locationKey) => descriptor.includes(locationKey));
  });
  return cleanValue(field?.value);
}

function findReminderTiming(fields: readonly AnalysisField[] | undefined) {
  const values = fields?.map((field) => cleanValue(field.value)).filter((value): value is string => Boolean(value)) ?? [];
  const dates = [...new Set(values.flatMap(extractAbsoluteDates))];
  if (dates.length !== 1) return {};

  const reminderDate = dates[0];
  const times = [...new Set(values.flatMap(extractClockTimes))];
  if (times.length !== 1) return { reminderDate };

  const directlyParseable = values.find((value) => value.includes(reminderDate) && !Number.isNaN(Date.parse(value)));
  const remindAt = directlyParseable
    ? new Date(directlyParseable).toISOString()
    : combineReminderDateAndTime(reminderDate, times[0]);
  return remindAt ? { reminderDate, remindAt } : { reminderDate };
}

function extractAbsoluteDates(value: string) {
  const matches = [
    ...value.matchAll(/(?<!\d)(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/g),
    ...value.matchAll(/(?<!\d)(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/g),
  ];
  return matches.flatMap((match) => {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!isValidCalendarDate(year, month, day)) return [];
    return [`${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`];
  });
}

function extractClockTimes(value: string) {
  const valueWithoutTimezone = value.replace(/(?:Z|[+-]\d{2}:\d{2})$/i, "");
  return [...valueWithoutTimezone.matchAll(/(?<!\d)([01]?\d|2[0-3]):([0-5]\d)(?!\d)/g)]
    .map((match) => `${match[1].padStart(2, "0")}:${match[2]}`);
}

function isValidCalendarDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function cleanValue(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}
