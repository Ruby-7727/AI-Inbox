"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ReminderTimeDialogProps = {
  date: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (time: string) => void;
};

export function ReminderTimeDialog({ date, open, onCancel, onConfirm }: ReminderTimeDialogProps) {
  const [time, setTime] = useState("09:00");
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    timeInputRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-6 backdrop-blur-[2px]">
      <form
        aria-labelledby="reminder-time-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (time) onConfirm(time);
        }}
        role="dialog"
      >
        <h2 className="text-xl font-semibold tracking-[-0.02em]" id="reminder-time-title">Set reminder time</h2>
        <div className="mt-5 space-y-4">
          <div>
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"><CalendarDays className="size-4 text-primary" />Date</span>
            <time className="flex h-11 items-center rounded-lg border bg-slate-50 px-3 text-sm" dateTime={date}>{date}</time>
          </div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="reminder-time">
            <span className="mb-2 flex items-center gap-2"><Clock3 className="size-4 text-primary" />Time</span>
            <input
              className="h-11 w-full rounded-lg border bg-white px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="reminder-time"
              onChange={(event) => setTime(event.target.value)}
              ref={timeInputRef}
              required
              type="time"
              value={time}
            />
          </label>
          <p className="text-xs leading-5 text-muted-foreground">09:00 is an editable suggestion. No reminder is created until you confirm.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
          <Button disabled={!time} type="submit">Create Reminder</Button>
        </div>
      </form>
    </div>
  );
}
