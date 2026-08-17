import type { AIAction, ActionExecutionResult } from "@/lib/actions/types";
import { isReminderDatePast } from "@/lib/actions/reminder-time";
import { requestReminder, type ReminderRequestInput } from "@/lib/supabase/reminders";

const completionMessages: Record<AIAction["type"], string> = {
  calendar: "Calendar event created",
  reminder: "Reminder created",
  map: "Location opened",
  research: "Research started",
  compare: "Comparison ready",
};

type ActionExecutorDependencies = {
  createReminder?: (input: ReminderRequestInput) => Promise<unknown>;
};

export async function executeAction(
  action: AIAction,
  dependencies: ActionExecutorDependencies = {},
): Promise<ActionExecutionResult> {
  if (action.type === "map") return executeMapAction(action);
  if (action.type === "reminder") return executeReminderAction(action, dependencies.createReminder ?? requestReminder);

  await Promise.resolve();
  return {
    success: true,
    message: completionMessages[action.type],
    action: { ...action, status: "completed" },
  };
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
