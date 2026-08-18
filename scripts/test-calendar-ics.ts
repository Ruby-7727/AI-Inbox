import assert from "node:assert/strict";

import { buildCalendarIcs, calendarFilename, escapeIcsText } from "../lib/actions/calendar-ics";
import { executeAction } from "../lib/actions/executor";
import { combineReminderDateAndTime } from "../lib/actions/reminder-time";
import { createAction } from "../lib/actions/registry";

async function run() {
  const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
  futureStart.setSeconds(0, 0);
  const futureEnd = new Date(futureStart.getTime() + 2 * 60 * 60 * 1000);
  const downloads: Array<{ contents: string; filename: string }> = [];
  const downloadCalendar = (contents: string, filename: string) => downloads.push({ contents, filename });

  const completed = await executeAction({
    ...createAction("calendar"),
    eventTitle: "Product meetup",
    startAt: futureStart.toISOString(),
    endAt: futureEnd.toISOString(),
    location: "Shenzhen, China",
    description: "Discuss roadmap; bring notes.",
  }, { downloadCalendar });

  assert.equal(completed.success, true);
  assert.equal(completed.title, "Calendar event ready");
  assert.match(completed.message, /^Product meetup · /);
  assert.equal(completed.action.status, "completed");
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].filename, "Product-meetup.ics");
  assert.match(downloads[0].contents, /\r\nDTEND:\d{8}T\d{6}Z\r\n/);
  assert.match(downloads[0].contents, /DESCRIPTION:Discuss roadmap\\; bring notes\./);
  assert.match(downloads[0].contents, /LOCATION:Shenzhen\\, China/);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const eventDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  const dateOnly = { ...createAction("calendar"), eventTitle: "Interview", eventDate };
  const requiresTime = await executeAction(dateOnly, { downloadCalendar });
  assert.equal(requiresTime.success, false);
  assert.equal(requiresTime.message, "Calendar start time could not be determined.");
  assert.equal(downloads.length, 1);

  const completedStart = combineReminderDateAndTime(eventDate, "09:00");
  assert.ok(completedStart);
  const completedDateOnly = await executeAction({ ...dateOnly, startAt: completedStart }, { downloadCalendar });
  assert.equal(completedDateOnly.success, true);
  assert.equal(downloads.length, 2);

  const missingDate = await executeAction({ ...createAction("calendar"), eventTitle: "Unknown event" }, { downloadCalendar });
  assert.equal(missingDate.success, false);
  assert.equal(missingDate.message, "Calendar date could not be determined.");

  const past = await executeAction({
    ...createAction("calendar"),
    eventTitle: "Past event",
    startAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }, { downloadCalendar });
  assert.equal(past.success, false);
  assert.equal(past.message, "This event time has already passed.");

  const withoutEnd = buildCalendarIcs({
    title: "Reading list",
    startAt: futureStart.toISOString(),
  }, {
    uid: "event-test@ai-inbox.local",
    now: new Date("2026-08-17T00:00:00.000Z"),
  });
  assert.match(withoutEnd, /UID:event-test@ai-inbox\.local/);
  assert.match(withoutEnd, /DTSTAMP:20260817T000000Z/);
  assert.match(withoutEnd, /DTSTART:\d{8}T\d{6}Z/);
  assert.doesNotMatch(withoutEnd, /DTEND:/);

  const strawberryFestival = buildCalendarIcs({
    title: "2026广州超级草莓音乐节",
    eventDate: "2026-09-25",
    endDate: "2026-09-27",
    isAllDay: true,
    location: "南沙音乐秀场",
    description: "2026年9月25日至27日举行的音乐节。",
  }, {
    uid: "strawberry-2026@ai-inbox.local",
    now: new Date("2026-08-17T00:00:00.000Z"),
  });
  assert.match(strawberryFestival, /DTSTART;VALUE=DATE:20260925/);
  assert.match(strawberryFestival, /DTEND;VALUE=DATE:20260928/);
  assert.match(strawberryFestival, /SUMMARY:2026广州超级草莓音乐节/);
  assert.match(strawberryFestival, /LOCATION:南沙音乐秀场/);

  const allDayDownloads: Array<{ contents: string; filename: string }> = [];
  const allDayCompleted = await executeAction({
    ...createAction("calendar"),
    eventTitle: "Future festival",
    eventDate: "2099-09-25",
    endDate: "2099-09-27",
    isAllDay: true,
  }, {
    downloadCalendar: (contents, filename) => allDayDownloads.push({ contents, filename }),
  });
  assert.equal(allDayCompleted.success, true);
  assert.equal(allDayDownloads.length, 1);
  assert.match(allDayDownloads[0].contents, /DTEND;VALUE=DATE:20990928/);

  assert.equal(escapeIcsText("A, B; C\\D\nNext"), "A\\, B\\; C\\\\D\\nNext");
  assert.equal(calendarFilename("  Product / Meetup?  "), "Product-Meetup.ics");

  console.log("Calendar ICS tests passed.");
}

void run();
