"use client";

import { CalendarClock, Check, LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReminderRow, ReminderStatus } from "@/types/database";

type ReminderCardProps = {
  reminder: ReminderRow;
  updating: boolean;
  onStatusChange: (id: string, status: ReminderStatus) => void;
};

export function ReminderCard({ reminder, updating, onStatusChange }: ReminderCardProps) {
  const completed = reminder.status === "completed";
  const nextStatus: ReminderStatus = completed ? "pending" : "completed";

  return (
    <article className="flex min-h-32 flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
      <span className={`grid size-14 shrink-0 place-items-center rounded-xl ${completed ? "bg-green-50 text-green-600" : "bg-blue-50 text-primary"}`}>
        {completed ? <Check className="size-7" aria-hidden="true" /> : <CalendarClock className="size-7" aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className={`text-lg font-semibold ${completed ? "text-slate-500" : "text-slate-900"}`}>{reminder.title}</h3>
          <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${completed ? "bg-green-50 text-green-700" : "bg-blue-50 text-primary"}`}>
            {completed ? "Completed" : "Pending"}
          </span>
        </div>
        {reminder.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{reminder.description}</p> : null}
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="size-4" aria-hidden="true" />
          <time dateTime={reminder.remind_at}>{formatLocalReminderTime(reminder.remind_at)}</time>
        </p>
      </div>
      <Button
        className="self-start sm:self-auto"
        disabled={updating}
        onClick={() => onStatusChange(reminder.id, nextStatus)}
        type="button"
        variant="outline"
      >
        {updating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : completed ? <RotateCcw className="size-4" aria-hidden="true" /> : <Check className="size-4 text-primary" aria-hidden="true" />}
        {updating ? "Updating..." : completed ? "Mark pending" : "Mark complete"}
      </Button>
    </article>
  );
}

function formatLocalReminderTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid reminder date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
