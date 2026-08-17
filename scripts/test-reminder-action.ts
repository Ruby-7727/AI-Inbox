import assert from "node:assert/strict";

import { executeAction } from "../lib/actions/executor";
import { mapSuggestedActions } from "../lib/actions/mapper";
import { combineReminderDateAndTime, needsReminderTime } from "../lib/actions/reminder-time";
import { createAction } from "../lib/actions/registry";

async function run() {
  let requestCount = 0;
  const createReminder = async () => {
    requestCount += 1;
    return { id: "reminder-test-id" };
  };

  const futureRemindAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const completed = await executeAction({
    ...createAction("reminder"),
    title: "Interview",
    remindAt: futureRemindAt,
  }, { createReminder });

  assert.equal(completed.success, true);
  assert.equal(completed.action.status, "completed");
  assert.equal(completed.title, "Reminder created");
  assert.match(completed.message, /^Reminder set for /);
  assert.equal(requestCount, 1);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const futureDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  const chineseFutureDate = `${tomorrow.getFullYear()}年${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日`;
  const [dateOnly] = mapSuggestedActions("do", ["remind"], {
    fields: [{ key: "date", label: "Date", value: chineseFutureDate }],
    itemTitle: "准备面试",
  });

  assert.equal(dateOnly.reminderDate, futureDate);
  assert.equal(dateOnly.remindAt, undefined);
  assert.equal(needsReminderTime(dateOnly), true);
  const completedRemindAt = combineReminderDateAndTime(dateOnly.reminderDate ?? "", "09:00");
  assert.ok(completedRemindAt);

  const completedDateOnly = await executeAction({ ...dateOnly, remindAt: completedRemindAt }, { createReminder });
  assert.equal(completedDateOnly.success, true);
  assert.equal(completedDateOnly.action.status, "completed");
  assert.equal(requestCount, 2);

  const failed = await executeAction({
    ...createAction("reminder"),
    title: "Interview",
  }, { createReminder });

  assert.equal(failed.success, false);
  assert.equal(failed.action.status, "failed");
  assert.equal(failed.message, "Reminder time could not be determined.");
  assert.equal(requestCount, 2);

  const past = await executeAction({
    ...createAction("reminder"),
    title: "Interview",
    remindAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }, { createReminder });

  assert.equal(past.success, false);
  assert.equal(past.action.status, "failed");
  assert.equal(past.message, "This reminder time has already passed.");
  assert.equal(requestCount, 2);

  const [chineseSchedule] = mapSuggestedActions("do", ["remind"], {
    fields: [
      { key: "apus_interview", label: "Apus 一面", value: "8.14周五 20:00" },
      { key: "lingyi_interview", label: "零一万物", value: "8.13周四 11:00" },
      { key: "arknights_interview", label: "明日方舟星悠二面", value: "8.12周三 14:00" },
    ],
    itemTitle: "面试日程",
    inboxItemId: "00000000-0000-4000-8000-000000000001",
  });

  assert.equal(chineseSchedule.title, "Remind Me");
  assert.equal(chineseSchedule.reminderTitle, "面试日程");
  assert.equal(chineseSchedule.remindAt, undefined);
  const ambiguous = await executeAction(chineseSchedule, { createReminder });
  assert.equal(ambiguous.success, false);
  assert.equal(ambiguous.message, "Reminder time could not be determined.");
  assert.equal(requestCount, 2);

  console.log("Reminder action tests passed.");
}

void run();
