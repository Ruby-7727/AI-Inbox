import type { AIAction } from "@/lib/actions/types";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function needsReminderTime(action: AIAction) {
  return action.type === "reminder"
    && Boolean(action.reminderDate)
    && !action.remindAt
    && !isReminderDatePast(action.reminderDate ?? "");
}

export function isReminderDatePast(date: string) {
  const endOfDay = combineReminderDateAndTime(date, "23:59");
  return endOfDay ? new Date(endOfDay).getTime() <= Date.now() : false;
}

export function combineReminderDateAndTime(date: string, time: string) {
  const dateMatch = DATE_PATTERN.exec(date);
  const timeMatch = TIME_PATTERN.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const combined = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (
    combined.getFullYear() !== year
    || combined.getMonth() !== month - 1
    || combined.getDate() !== day
    || combined.getHours() !== hours
    || combined.getMinutes() !== minutes
  ) return null;

  return combined.toISOString();
}
