import { createAction, resolveActionType } from "@/lib/actions/registry";
import { isPlaceRecommendation } from "@/lib/actions/place-recommendation";
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

type CalendarTiming = {
  eventDate?: string;
  endDate?: string;
  startAt?: string;
  endAt?: string;
  isAllDay?: boolean;
};

const intentActionMap: Partial<Record<AnalysisIntent, readonly IntentActionDefinition[]>> = {
  attend: [{ type: "calendar" }],
  remember: [{ type: "research" }],
  shop: [{ type: "research", title: "Research Product" }],
  do: [{ type: "reminder" }],
};

const goNavigationActions: readonly IntentActionDefinition[] = [{ type: "map" }];
const goRecommendationActions: readonly IntentActionDefinition[] = [
  { type: "map" },
  { type: "research", title: "Research Trip" },
];

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
  const intentActions = intent === "go"
    ? isPlaceRecommendation({ title: context.itemTitle, summary: context.itemDescription, fields: context.fields })
      ? goRecommendationActions
      : goNavigationActions
    : intentActionMap[intent];
  if (intentActions) {
    return intentActions.map(({ type, title }) => withActionContext(
      {
        ...createAction(type),
        id: `${intent}-${type}`,
        ...(title ? { title } : {}),
      },
      context,
      intent,
      suggestions,
    ));
  }

  const actionTypes = suggestions
    .map(resolveActionType)
    .filter((type): type is ActionType => Boolean(type));

  return [...new Set(actionTypes)].map((type) => withActionContext(createAction(type), context, intent, suggestions));
}

function withActionContext(
  action: AIAction,
  context: ActionMappingContext,
  intent: AnalysisIntent,
  suggestions: readonly AnalysisAction[],
): AIAction {
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
  if (action.type === "calendar") {
    const timing = findCalendarTiming(context.fields, [context.itemTitle, context.itemDescription]);
    return {
      ...action,
      eventTitle: findEventTitle(context.fields) ?? cleanValue(context.itemTitle),
      eventDate: timing.eventDate,
      endDate: timing.endDate,
      startAt: timing.startAt,
      endAt: timing.endAt,
      isAllDay: timing.isAllDay,
      location: findLocation(context.fields),
      description: cleanValue(context.itemDescription) ?? "",
      inboxItemId: cleanValue(context.inboxItemId),
    };
  }
  if (action.type === "research") {
    return {
      ...action,
      researchType: intent === "go" ? "trip" : intent === "shop" ? "product" : "general",
      sourceTitle: cleanValue(context.itemTitle),
      sourceSummary: cleanValue(context.itemDescription),
      structuredData: {
        fields: [...(context.fields ?? [])],
        actions: [...suggestions],
      },
      inboxItemId: cleanValue(context.inboxItemId),
    };
  }
  return action;
}

function findEventTitle(fields: readonly AnalysisField[] | undefined) {
  const exactKeys = new Set(["title", "event", "event_name", "activity", "meeting", "标题", "活动", "会议"]);
  const field = fields?.find(({ key, label, value }) => {
    if (!cleanValue(value)) return false;
    const normalizedKey = normalizeDescriptor(key);
    const normalizedLabel = normalizeDescriptor(label);
    return exactKeys.has(normalizedKey) || exactKeys.has(normalizedLabel);
  });
  return cleanValue(field?.value);
}

function findLocation(fields: readonly AnalysisField[] | undefined) {
  const locationKeys = ["address", "location", "venue", "place", "destination", "restaurant", "city", "地址", "地点", "场地"];
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

function findCalendarTiming(
  fields: readonly AnalysisField[] | undefined,
  contextValues: readonly (string | null | undefined)[],
): CalendarTiming {
  const timingFields = fields?.filter(isCalendarTimingField) ?? [];
  const groundedValues = [
    ...timingFields.map(({ value }) => cleanValue(value)),
    ...contextValues.map(cleanValue),
  ].filter((value): value is string => Boolean(value));
  const groundedYears = [...new Set(groundedValues.flatMap(extractYears))];
  const groundedYear = groundedYears.length === 1 ? groundedYears[0] : undefined;
  const startFields = timingFields.filter((field) => calendarDateRole(field) === "start");
  const endFields = timingFields.filter((field) => calendarDateRole(field) === "end");

  if (startFields.length > 0 || endFields.length > 0) {
    const startDates = uniqueDates(startFields, groundedYear);
    const endDates = uniqueDates(endFields, groundedYear);
    if (startDates.length !== 1 || (endFields.length > 0 && endDates.length !== 1)) return {};

    const eventDate = startDates[0];
    const endDate = endDates[0];
    if (endDate && endDate < eventDate) return {};
    const startAt = findCalendarDateTime(timingFields, eventDate, "start");
    const endAt = endDate ? findCalendarDateTime(timingFields, endDate, "end") : undefined;
    const isAllDay = Boolean(endDate && !startAt && !endAt);
    return {
      eventDate,
      ...(endDate ? { endDate } : {}),
      ...(startAt ? { startAt } : {}),
      ...(endAt ? { endAt } : {}),
      ...(isAllDay ? { isAllDay: true } : {}),
    };
  }

  const dates = [...new Set(timingFields.flatMap(({ value }) => {
    const cleaned = cleanValue(value);
    return cleaned ? extractAbsoluteDates(cleaned, groundedYear) : [];
  }))];

  // More than one grounded date is ambiguous. Preserve neither rather than
  // silently deciding which event date the user meant.
  if (dates.length !== 1) return {};

  const eventDate = dates[0];
  const startAt = findCalendarDateTime(timingFields, eventDate, "start");
  const endAt = findCalendarDateTime(timingFields, eventDate, "end");
  return {
    eventDate,
    ...(startAt ? { startAt } : {}),
    ...(endAt ? { endAt } : {}),
  };
}

function uniqueDates(fields: readonly AnalysisField[], groundedYear?: number) {
  return [...new Set(fields.flatMap(({ value }) => {
    const cleaned = cleanValue(value);
    return cleaned ? extractAbsoluteDates(cleaned, groundedYear) : [];
  }))];
}

function calendarDateRole(field: AnalysisField): "start" | "end" | undefined {
  const descriptors = [normalizeDescriptor(field.key), normalizeDescriptor(field.label)];
  if (descriptors.some((value) => matchesDateRole(value, ["start_date", "from", "开始日期", "起始日期"]))) return "start";
  if (descriptors.some((value) => matchesDateRole(value, ["end_date", "to", "结束日期", "截止日期"]))) return "end";
  return undefined;
}

function matchesDateRole(descriptor: string, aliases: readonly string[]) {
  return aliases.some((alias) => descriptor === alias
    || descriptor.startsWith(`${alias}_`)
    || descriptor.endsWith(`_${alias}`)
    || (/[\u3400-\u9fff]/u.test(alias) && descriptor.includes(alias)));
}

function findCalendarDateTime(
  fields: readonly AnalysisField[],
  eventDate: string,
  kind: "start" | "end",
) {
  const specificallyTyped = fields.filter((field) => {
    const descriptor = normalizeDescriptor(`${field.key} ${field.label}`);
    return kind === "start"
      ? descriptor.includes("start_time") || descriptor.includes("datetime") || descriptor.includes("开始时间") || descriptor.includes("日期时间") || calendarDateRole(field) === "start"
      : descriptor.includes("end_time") || descriptor.includes("结束时间") || calendarDateRole(field) === "end";
  });
  const candidates = specificallyTyped.length > 0
    ? specificallyTyped
    : kind === "start"
      ? fields.filter((field) => {
        const descriptor = normalizeDescriptor(`${field.key} ${field.label}`);
        return descriptor.includes("time") || descriptor.includes("时间");
      })
      : [];
  const values = candidates.map(({ value }) => cleanValue(value)).filter((value): value is string => Boolean(value));
  const times = [...new Set(values.flatMap(extractClockTimes))];
  if (times.length !== 1) return undefined;

  const directlyParseable = values.find((value) => extractAbsoluteDates(value).includes(eventDate) && !Number.isNaN(Date.parse(value)));
  return directlyParseable
    ? new Date(directlyParseable).toISOString()
    : combineReminderDateAndTime(eventDate, times[0]) ?? undefined;
}

function isCalendarTimingField({ key, label, value }: AnalysisField) {
  if (!cleanValue(value)) return false;
  if (calendarDateRole({ key, label, value })) return true;
  const descriptor = normalizeDescriptor(`${key} ${label}`);
  return ["date", "datetime", "time", "start_time", "end_time", "日期", "时间", "开始时间", "结束时间"].some((candidate) => descriptor.includes(candidate));
}

function extractAbsoluteDates(value: string, groundedYear?: number) {
  const matches = [
    ...value.matchAll(/(?<!\d)(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/g),
    ...value.matchAll(/(?<!\d)(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/g),
  ];
  const numericDates = matches.flatMap((match) => {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!isValidCalendarDate(year, month, day)) return [];
    return [`${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`];
  });
  const englishDates = [...value.matchAll(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/gi)]
    .flatMap((match) => {
      const month = englishMonthNumber(match[1]);
      const day = Number(match[2]);
      const year = Number(match[3]);
      if (!month || !isValidCalendarDate(year, month, day)) return [];
      return [`${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`];
    });
  const groundedDates = groundedYear ? [
    ...[...value.matchAll(/(?<![\d月])(\d{1,2})月\s*(\d{1,2})日/g)].flatMap((match) => normalizedDate(groundedYear, Number(match[1]), Number(match[2]))),
    ...[...value.matchAll(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?!\s*,?\s*\d{4})\b/gi)]
      .flatMap((match) => normalizedDate(groundedYear, englishMonthNumber(match[1]), Number(match[2]))),
  ] : [];
  return [...new Set([...numericDates, ...englishDates, ...groundedDates])];
}

function extractYears(value: string) {
  return [...value.matchAll(/(?<!\d)((?:19|20)\d{2})(?!\d)/g)].map((match) => Number(match[1]));
}

function normalizedDate(year: number, month: number, day: number) {
  if (!isValidCalendarDate(year, month, day)) return [];
  return [`${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`];
}

function englishMonthNumber(value: string) {
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    .indexOf(value.slice(0, 3).toLowerCase()) + 1;
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

function normalizeDescriptor(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
