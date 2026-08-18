export type CalendarIcsEvent = {
  title: string;
  startAt?: string | null;
  endAt?: string | null;
  eventDate?: string | null;
  endDate?: string | null;
  isAllDay?: boolean;
  description?: string | null;
  location?: string | null;
};

type CalendarIcsOptions = {
  uid?: string;
  now?: Date;
};

export function buildCalendarIcs(event: CalendarIcsEvent, options: CalendarIcsOptions = {}) {
  const title = event.title.trim();
  if (!title) throw new Error("Calendar event title is required.");

  const timingLines = event.isAllDay
    ? buildAllDayTimingLines(event.eventDate, event.endDate)
    : buildDateTimeTimingLines(event.startAt, event.endAt);
  const generatedId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const uid = options.uid?.trim() || `${generatedId}@ai-inbox.local`;
  const now = options.now ?? new Date();
  if (Number.isNaN(now.getTime())) throw new Error("Calendar timestamp is invalid.");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Inbox//Calendar Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${formatUtcTimestamp(now)}`,
    ...timingLines,
    `SUMMARY:${escapeIcsText(title)}`,
    ...(event.description?.trim() ? [`DESCRIPTION:${escapeIcsText(event.description.trim())}`] : []),
    ...(event.location?.trim() ? [`LOCATION:${escapeIcsText(event.location.trim())}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function buildDateTimeTimingLines(startAt: string | null | undefined, endAt: string | null | undefined) {
  if (!startAt) throw new Error("Calendar start time is required.");
  const start = parseValidDate(startAt, "Calendar start time is invalid.");
  const end = endAt ? parseValidDate(endAt, "Calendar end time is invalid.") : null;
  return [
    `DTSTART:${formatUtcTimestamp(start)}`,
    ...(end ? [`DTEND:${formatUtcTimestamp(end)}`] : []),
  ];
}

function buildAllDayTimingLines(eventDate: string | null | undefined, endDate: string | null | undefined) {
  const start = parseDateValue(eventDate, "Calendar event date is invalid.");
  const inclusiveEnd = parseDateValue(endDate ?? eventDate, "Calendar event end date is invalid.");
  if (inclusiveEnd.getTime() < start.getTime()) throw new Error("Calendar event date range is invalid.");
  const exclusiveEnd = new Date(inclusiveEnd);
  exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
  return [
    `DTSTART;VALUE=DATE:${formatDateValue(start)}`,
    `DTEND;VALUE=DATE:${formatDateValue(exclusiveEnd)}`,
  ];
}

export function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function formatUtcTimestamp(value: Date | string) {
  const date = typeof value === "string" ? parseValidDate(value, "Calendar timestamp is invalid.") : value;
  if (Number.isNaN(date.getTime())) throw new Error("Calendar timestamp is invalid.");
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function parseDateValue(value: string | null | undefined, message: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) throw new Error(message);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (
    date.getUTCFullYear() !== Number(match[1])
    || date.getUTCMonth() !== Number(match[2]) - 1
    || date.getUTCDate() !== Number(match[3])
  ) throw new Error(message);
  return date;
}

function formatDateValue(date: Date) {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function calendarFilename(title: string) {
  const safeTitle = title
    .normalize("NFKC")
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return `${safeTitle || "calendar-event"}.ics`;
}

export function downloadCalendarIcs(contents: string, filename: string) {
  if (typeof document === "undefined") throw new Error("Calendar download requires a browser.");

  const objectUrl = URL.createObjectURL(new Blob([contents], { type: "text/calendar;charset=utf-8" }));
  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function parseValidDate(value: string, message: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(message);
  return date;
}

function foldIcsLine(line: string) {
  const encoder = new TextEncoder();
  const segments: string[] = [];
  let segment = "";
  let bytes = 0;

  for (const character of line) {
    const characterBytes = encoder.encode(character).length;
    const limit = segments.length === 0 ? 75 : 74;
    if (segment && bytes + characterBytes > limit) {
      segments.push(segment);
      segment = character;
      bytes = characterBytes;
    } else {
      segment += character;
      bytes += characterBytes;
    }
  }
  if (segment || line === "") segments.push(segment);
  return segments.map((value, index) => index === 0 ? value : ` ${value}`).join("\r\n");
}
