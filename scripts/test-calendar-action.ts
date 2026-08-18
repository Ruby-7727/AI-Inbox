import assert from "node:assert/strict";

import { mapSuggestedActions } from "../lib/actions/mapper";
import type { AnalysisField } from "../types/analysis";

function calendarAction(fields: readonly AnalysisField[], context: { title?: string; description?: string } = {}) {
  const [action] = mapSuggestedActions("attend", ["add_calendar"], {
    fields,
    itemTitle: context.title ?? "Eason Chan Concert",
    itemDescription: context.description ?? "A concert event in Shenzhen.",
    inboxItemId: "00000000-0000-4000-8000-000000000001",
  });
  return action;
}

function assertLocalDateTime(value: string | null | undefined, expected: number[]) {
  assert.ok(value);
  const date = new Date(value);
  assert.equal(Number.isNaN(date.getTime()), false);
  assert.deepEqual(
    [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
    expected,
  );
}

const fullFuture = calendarAction([
  { key: "event_name", label: "Event", value: "Eason Chan Concert" },
  { key: "date", label: "Date", value: "Sep 18, 2099" },
  { key: "start_time", label: "Start Time", value: "19:30" },
  { key: "end_time", label: "End Time", value: "22:00" },
  { key: "venue", label: "Venue", value: "Shenzhen Bay Sports Center" },
]);
assert.equal(fullFuture.eventTitle, "Eason Chan Concert");
assert.equal(fullFuture.eventDate, "2099-09-18");
assertLocalDateTime(fullFuture.startAt, [2099, 9, 18, 19, 30]);
assertLocalDateTime(fullFuture.endAt, [2099, 9, 18, 22, 0]);
assert.equal(fullFuture.location, "Shenzhen Bay Sports Center");
assert.equal(fullFuture.description, "A concert event in Shenzhen.");
assert.equal(fullFuture.inboxItemId, "00000000-0000-4000-8000-000000000001");

const futureDateOnly = calendarAction([
  { key: "date", label: "Date", value: "2099年8月20日" },
]);
assert.equal(futureDateOnly.eventDate, "2099-08-20");
assert.equal(futureDateOnly.startAt, undefined);
assert.equal(futureDateOnly.endAt, undefined);

const explicitRange = calendarAction([
  { key: "start_date", label: "Start date", value: "2099-09-25" },
  { key: "end_date", label: "End date", value: "2099-09-27" },
]);
assert.equal(explicitRange.eventDate, "2099-09-25");
assert.equal(explicitRange.endDate, "2099-09-27");
assert.equal(explicitRange.startAt, undefined);
assert.equal(explicitRange.endAt, undefined);
assert.equal(explicitRange.isAllDay, true);

const strawberryFestival = calendarAction([
  { key: "start_date", label: "开始日期", value: "9月25日" },
  { key: "end_date", label: "结束日期", value: "9月27日" },
  { key: "venue", label: "地点", value: "南沙音乐秀场" },
], {
  title: "2026广州超级草莓音乐节",
  description: "2026年9月25日至27日举行的音乐节。",
});
assert.equal(strawberryFestival.eventTitle, "2026广州超级草莓音乐节");
assert.equal(strawberryFestival.eventDate, "2026-09-25");
assert.equal(strawberryFestival.endDate, "2026-09-27");
assert.equal(strawberryFestival.startAt, undefined);
assert.equal(strawberryFestival.endAt, undefined);
assert.equal(strawberryFestival.isAllDay, true);
assert.equal(strawberryFestival.location, "南沙音乐秀场");

const yearFromSummary = calendarAction([
  { key: "from", label: "From", value: "9月25日" },
  { key: "to", label: "To", value: "9月27日" },
], {
  title: "广州超级草莓音乐节",
  description: "活动时间为2026年9月25日至27日。",
});
assert.equal(yearFromSummary.eventDate, "2026-09-25");
assert.equal(yearFromSummary.endDate, "2026-09-27");
assert.equal(yearFromSummary.isAllDay, true);

const ungroundedYear = calendarAction([
  { key: "start_date", label: "开始日期", value: "9月25日" },
  { key: "end_date", label: "结束日期", value: "9月27日" },
], { title: "草莓音乐节", description: "三日音乐节" });
assert.equal(ungroundedYear.eventDate, undefined);
assert.equal(ungroundedYear.endDate, undefined);
assert.equal(ungroundedYear.isAllDay, undefined);

const missingDate = calendarAction([
  { key: "venue", label: "Venue", value: "Shenzhen Bay Sports Center" },
]);
assert.equal(missingDate.eventDate, undefined);
assert.equal(missingDate.startAt, undefined);

const past = calendarAction([
  { key: "datetime", label: "Date and time", value: "2020-08-14T20:00:00+08:00" },
]);
assert.equal(past.eventDate, "2020-08-14");
assert.equal(past.startAt, "2020-08-14T12:00:00.000Z");

const ambiguous = calendarAction([
  { key: "primary_date", label: "Date", value: "2099-08-20" },
  { key: "alternate_date", label: "Alternate Date", value: "2099-08-21" },
  { key: "time", label: "Time", value: "09:00" },
]);
assert.equal(ambiguous.eventDate, undefined);
assert.equal(ambiguous.startAt, undefined);
assert.equal(ambiguous.endAt, undefined);
assert.equal(ambiguous.isAllDay, undefined);

console.log("Calendar action mapping tests passed.");
