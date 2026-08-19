"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CalendarClock } from "lucide-react";

import { ReminderCard } from "@/components/todo/reminder-card";
import { getReminders, updateReminderStatus } from "@/lib/supabase/reminders";
import type { ReminderRow, ReminderStatus } from "@/types/database";

export function ReminderList() {
  const [reminders, setReminders] = useState<ReminderRow[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getReminders()
      .then((data) => { if (active) setReminders(sortReminders(data)); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "Reminders could not be loaded."); });
    return () => { active = false; };
  }, []);

  async function changeStatus(id: string, status: ReminderStatus) {
    if (updatingId) return;
    setUpdatingId(id);
    setError(null);
    try {
      const updated = await updateReminderStatus(id, status);
      setReminders((current) => sortReminders((current ?? []).map((reminder) => reminder.id === updated.id ? updated : reminder)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Reminder status could not be updated.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (reminders === null && !error) {
    return <div className="mt-10 space-y-8"><div className="h-48 animate-pulse rounded-xl border bg-white/60" /><div className="h-48 animate-pulse rounded-xl border bg-white/60" /></div>;
  }

  const pending = reminders?.filter((reminder) => reminder.status === "pending") ?? [];
  const completed = reminders?.filter((reminder) => reminder.status === "completed") ?? [];

  return (
    <div className="mt-8">
      {error ? <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><AlertCircle className="size-5 shrink-0" />{error}</div> : null}
      <ReminderSection emptyMessage="No upcoming reminders." reminders={pending} title="Upcoming" updatingId={updatingId} onStatusChange={changeStatus} />
      <ReminderSection emptyMessage="No completed reminders yet." reminders={completed} title="Completed" updatingId={updatingId} onStatusChange={changeStatus} />
    </div>
  );
}

function ReminderSection({ title, emptyMessage, reminders, updatingId, onStatusChange }: { title: string; emptyMessage: string; reminders: ReminderRow[]; updatingId: string | null; onStatusChange: (id: string, status: ReminderStatus) => void }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-[#684334]">{title}</h2>
      <div className="mt-5 divide-y divide-[#eadccf] overflow-hidden rounded-[1.4rem] border border-[#e5d3c2] bg-card/90 shadow-card">
        {reminders.length ? reminders.map((reminder) => (
          <ReminderCard key={reminder.id} reminder={reminder} updating={updatingId === reminder.id} onStatusChange={onStatusChange} />
        )) : (
          <div className="grid min-h-36 place-items-center px-6 py-8 text-center">
            <div><CalendarClock className="mx-auto size-7 text-[#cbb8aa]" aria-hidden="true" /><p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p></div>
          </div>
        )}
      </div>
    </section>
  );
}

function sortReminders(reminders: ReminderRow[]) {
  return [...reminders].sort((left, right) => {
    if (left.status !== right.status) return left.status === "pending" ? -1 : 1;
    return new Date(left.remind_at).getTime() - new Date(right.remind_at).getTime();
  });
}
