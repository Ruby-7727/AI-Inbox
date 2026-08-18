import type { AIAction, ActionExecutionResult } from "@/lib/actions/types";
import { buildCalendarIcs, calendarFilename, downloadCalendarIcs } from "@/lib/actions/calendar-ics";
import { requestResearch } from "@/lib/actions/research-request";
import { isReminderDatePast } from "@/lib/actions/reminder-time";
import { requestReminder, type ReminderRequestInput } from "@/lib/supabase/reminders";
import type { ResearchRequestInput, ResearchResult } from "@/types/research";

const completionMessages: Record<AIAction["type"], string> = {
  calendar: "Calendar event created",
  reminder: "Reminder created",
  map: "Location opened",
  research: "Research started",
  compare: "Comparison ready",
};

type ActionExecutorDependencies = {
  createReminder?: (input: ReminderRequestInput) => Promise<unknown>;
  downloadCalendar?: (contents: string, filename: string) => void;
  research?: (input: ResearchRequestInput) => Promise<ResearchResult>;
};

export async function executeAction(
  action: AIAction,
  dependencies: ActionExecutorDependencies = {},
): Promise<ActionExecutionResult> {
  if (action.type === "map") return executeMapAction(action);
  if (action.type === "reminder") return executeReminderAction(action, dependencies.createReminder ?? requestReminder);
  if (action.type === "calendar") return executeCalendarAction(action, dependencies.downloadCalendar ?? downloadCalendarIcs);
  if (action.type === "research") return executeResearchAction(action, dependencies.research ?? requestResearch);

  await Promise.resolve();
  return {
    success: true,
    message: completionMessages[action.type],
    action: { ...action, status: "completed" },
  };
}

async function executeResearchAction(
  action: AIAction,
  research: (input: ResearchRequestInput) => Promise<ResearchResult>,
): Promise<ActionExecutionResult> {
  const researchType = action.researchType;
  const sourceTitle = action.sourceTitle?.trim();
  const sourceSummary = action.sourceSummary?.trim();
  const structuredData = action.structuredData;
  const hasGroundedField = structuredData?.fields.some((field) => Boolean(field.value?.trim()));
  if (!researchType || !sourceTitle || !structuredData || (!sourceSummary && !hasGroundedField)) {
    return researchFailure(action);
  }

  try {
    const researchResult = await research({
      researchType,
      sourceTitle,
      sourceSummary,
      structuredData,
    });
    return {
      success: true,
      title: "Research complete",
      message: researchResult.overview,
      researchResult,
      action: { ...action, status: "completed" },
    };
  } catch {
    return researchFailure(action);
  }
}

function researchFailure(action: AIAction): ActionExecutionResult {
  return {
    success: false,
    message: "Unable to complete research.",
    action: { ...action, status: "failed" },
  };
}

function executeCalendarAction(
  action: AIAction,
  downloadCalendar: (contents: string, filename: string) => void,
): ActionExecutionResult {
  const eventTitle = action.eventTitle?.trim();
  if (!eventTitle) return calendarFailure(action, "Unable to create calendar event.");
  if (action.isAllDay) return executeAllDayCalendarAction(action, eventTitle, downloadCalendar);
  const startAt = action.startAt?.trim();
  if (!startAt) {
    if (!action.eventDate) return calendarFailure(action, "Calendar date could not be determined.");
    if (isReminderDatePast(action.eventDate)) return calendarFailure(action, "This event time has already passed.");
    return calendarFailure(action, "Calendar start time could not be determined.");
  }

  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) return calendarFailure(action, "Calendar date could not be determined.");
  if (startDate.getTime() <= Date.now()) return calendarFailure(action, "This event time has already passed.");

  const endDate = action.endAt ? new Date(action.endAt) : null;
  const validEndAt = endDate && !Number.isNaN(endDate.getTime()) && endDate.getTime() > startDate.getTime()
    ? endDate.toISOString()
    : undefined;

  try {
    const contents = buildCalendarIcs({
      title: eventTitle,
      startAt: startDate.toISOString(),
      endAt: validEndAt,
      description: action.description,
      location: action.location,
    });
    downloadCalendar(contents, calendarFilename(eventTitle));
    return {
      success: true,
      title: "Calendar event ready",
      message: `${eventTitle} · ${formatLocalDateTime(startDate)}`,
      action: { ...action, eventTitle, startAt: startDate.toISOString(), endAt: validEndAt, status: "completed" },
    };
  } catch {
    return calendarFailure(action, "Unable to create calendar event.");
  }
}

function executeAllDayCalendarAction(
  action: AIAction,
  eventTitle: string,
  downloadCalendar: (contents: string, filename: string) => void,
): ActionExecutionResult {
  const eventDate = action.eventDate?.trim();
  const endDate = action.endDate?.trim();
  if (!eventDate) return calendarFailure(action, "Calendar date could not be determined.");
  if (isReminderDatePast(endDate || eventDate)) return calendarFailure(action, "This event time has already passed.");

  try {
    const contents = buildCalendarIcs({
      title: eventTitle,
      eventDate,
      endDate,
      isAllDay: true,
      description: action.description,
      location: action.location,
    });
    downloadCalendar(contents, calendarFilename(eventTitle));
    return {
      success: true,
      title: "Calendar event ready",
      message: `${eventTitle} · ${formatAllDayRange(eventDate, endDate)}`,
      action: { ...action, eventTitle, eventDate, endDate, isAllDay: true, status: "completed" },
    };
  } catch {
    return calendarFailure(action, "Unable to create calendar event.");
  }
}

function calendarFailure(action: AIAction, message: string): ActionExecutionResult {
  return { success: false, message, action: { ...action, status: "failed" } };
}

function formatLocalDateTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatAllDayRange(eventDate: string, endDate?: string) {
  const format = (value: string) => new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
  return endDate ? `${format(eventDate)} – ${format(endDate)}` : format(eventDate);
}

async function executeReminderAction(
  action: AIAction,
  createReminder: (input: ReminderRequestInput) => Promise<unknown>,
): Promise<ActionExecutionResult> {
  const title = (action.reminderTitle ?? action.title).trim();
  const remindAt = action.remindAt?.trim();
  if (!title) return reminderFailure(action, "Unable to create reminder");
  if (!remindAt) {
    if (action.reminderDate && isReminderDatePast(action.reminderDate)) {
      return reminderFailure(action, "This reminder time has already passed.");
    }
    return reminderFailure(action, "Reminder time could not be determined.");
  }
  const remindDate = new Date(remindAt);
  if (Number.isNaN(remindDate.getTime())) return reminderFailure(action, "Reminder time could not be determined.");
  if (remindDate.getTime() <= Date.now()) return reminderFailure(action, "This reminder time has already passed.");

  try {
    await createReminder({
      title,
      remindAt: remindDate.toISOString(),
      ...(action.reminderDescription?.trim() ? { description: action.reminderDescription.trim() } : {}),
      ...(action.inboxItemId ? { inboxItemId: action.inboxItemId } : {}),
    });
    return {
      success: true,
      title: "Reminder created",
      message: `Reminder set for ${formatReminderDate(remindAt)}`,
      action: { ...action, reminderTitle: title, remindAt, status: "completed" },
    };
  } catch {
    return reminderFailure(action, "Unable to create reminder");
  }
}

function reminderFailure(action: AIAction, message: string): ActionExecutionResult {
  return {
    success: false,
    message,
    action: { ...action, status: "failed" },
  };
}

function formatReminderDate(remindAt: string) {
  const date = new Date(remindAt);
  if (Number.isNaN(date.getTime())) return remindAt;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function executeMapAction(action: AIAction): ActionExecutionResult {
  const location = action.location?.trim();
  if (!location || typeof window === "undefined") {
    return mapFailure(action);
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  try {
    window.open(url, "_blank", "noopener,noreferrer");
    return {
      success: true,
      title: "Location opened",
      message: `Opened ${location} in Google Maps`,
      action: { ...action, location, status: "completed" },
    };
  } catch {
    return mapFailure(action);
  }
}

function mapFailure(action: AIAction): ActionExecutionResult {
  return {
    success: false,
    message: "Unable to open map location",
    action: { ...action, status: "failed" },
  };
}
