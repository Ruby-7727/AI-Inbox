"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AIAction } from "@/lib/actions/types";

type CalendarConfirmDialogProps = {
  action: AIAction;
  open: boolean;
  onCancel: () => void;
  onConfirm: (time?: string) => void;
};

export function CalendarConfirmDialog({ action, open, onCancel, onConfirm }: CalendarConfirmDialogProps) {
  const [time, setTime] = useState("09:00");
  const timeInputRef = useRef<HTMLInputElement>(null);
  const needsTime = Boolean(action.eventDate) && !action.startAt && !action.isAllDay;

  useEffect(() => {
    if (!open) return;
    if (needsTime) timeInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [needsTime, onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#4a3329]/32 p-6 backdrop-blur-[3px]">
      <form
        aria-labelledby="calendar-confirm-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-[1.5rem] border border-[#dfc8b4] bg-[#fffaf3] p-6 shadow-[0_24px_70px_rgb(74_51_41_/_0.22)]"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(needsTime ? time : undefined);
        }}
        role="dialog"
      >
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#713b2b]" id="calendar-confirm-title">Add to calendar</h2>
        <dl className="mt-5 overflow-hidden rounded-xl border border-[#e4d1c0] bg-[#fffaf4]">
          <CalendarField label="Event" value={action.eventTitle?.trim() || "Untitled event"} />
          <CalendarField icon={CalendarDays} label="Date" value={formatCalendarDate(action) || "Not determined"} />
          {action.isAllDay ? <CalendarField label="All-day" value="Yes" /> : needsTime ? (
            <div className="grid grid-cols-[120px_1fr] items-center gap-4 border-t px-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-medium text-slate-600"><Clock3 className="size-4 text-primary" />Start time</dt>
              <dd>
                <input
                  className="h-10 w-full rounded-xl border border-[#dcc7b5] bg-[#fffdf8] px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  onChange={(event) => setTime(event.target.value)}
                  ref={timeInputRef}
                  required
                  type="time"
                  value={time}
                />
              </dd>
            </div>
          ) : <CalendarField icon={Clock3} label="Start time" value={formatLocal(action.startAt, { timeStyle: "short" }) || "Not determined"} />}
          {!action.isAllDay && action.endAt ? <CalendarField label="End time" value={formatLocal(action.endAt, { timeStyle: "short" }) || "Invalid time"} /> : null}
          {action.location?.trim() ? <CalendarField icon={MapPin} label="Location" value={action.location.trim()} /> : null}
        </dl>
        {needsTime ? <p className="mt-3 text-xs leading-5 text-muted-foreground">09:00 is an editable suggestion. The event file is not created until you confirm.</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
          <Button disabled={needsTime && !time} type="submit">Add to Calendar</Button>
        </div>
      </form>
    </div>
  );
}

function CalendarField({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof CalendarDays }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 border-t px-4 py-3 first:border-t-0">
      <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">{Icon ? <Icon className="size-4 text-primary" /> : null}{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function formatLocal(value: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function formatCalendarDate(action: AIAction) {
  if (!action.eventDate) return formatLocal(action.startAt, { dateStyle: "medium" });
  const format = (value: string) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(date);
  };
  const start = format(action.eventDate);
  const end = action.endDate ? format(action.endDate) : null;
  if (!start || (action.endDate && !end)) return null;
  return end ? `${start} – ${end}` : start;
}
