"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Inbox as InboxIcon } from "lucide-react";

import { ActionCard } from "@/components/cards/action-card";
import { EmptyState } from "@/components/inbox/empty-state";
import { ensureDemoInboxItems } from "@/lib/supabase/demoItems";
import { getInboxItems } from "@/lib/supabase/inboxItems";
import { inboxRowToCard } from "@/lib/supabase/presenters";
import { getSavedItems } from "@/lib/supabase/savedItems";
import type { InboxItemRow } from "@/types/database";

type InboxFilter = "all" | "attend" | "do" | "go" | "shop" | "remember";

const tabs: Array<{ label: string; value: InboxFilter }> = [
  { label: "All", value: "all" },
  { label: "Attend", value: "attend" },
  { label: "Do", value: "do" },
  { label: "Go", value: "go" },
  { label: "Shop", value: "shop" },
  { label: "Remember", value: "remember" },
];

export function InboxContent() {
  const [items, setItems] = useState<InboxItemRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<InboxFilter>("all");

  useEffect(() => {
    let active = true;
    void Promise.all([getInboxItems().then(ensureDemoInboxItems), getSavedItems()])
      .then(([inboxData, savedData]) => {
        if (!active) return;
        setItems(inboxData);
        setSavedItemIds(Object.fromEntries(savedData.map(({ savedItem }) => [savedItem.inbox_item_id, savedItem.id])));
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Inbox could not be loaded.");
      });
    return () => { active = false; };
  }, []);

  if (error) {
    return <div className="mt-10 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="font-medium">We couldn&apos;t load your Inbox.</p><p className="mt-1">{error}</p></div></div>;
  }
  if (items === null) return <div className="mt-10 h-40 animate-pulse rounded-xl border bg-white/60" aria-label="Loading Inbox" />;
  const visibleItems = items.filter((item) => activeFilter === "all" || item.intent === activeFilter);

  return (
    <>
      <nav className="mt-9 flex gap-2 overflow-x-auto border-b text-sm text-slate-600 sm:gap-5" aria-label="Inbox categories">
        {tabs.map((tab) => (
          <button
            aria-pressed={activeFilter === tab.value}
            className={activeFilter === tab.value
              ? "shrink-0 border-b-2 border-primary px-3 pb-4 font-medium text-primary"
              : "shrink-0 px-3 pb-4 transition-colors hover:text-slate-900"}
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section className="mt-7">
        <h2 className="text-xl font-semibold">Recent items</h2>
        {items.length === 0 ? <EmptyState /> : visibleItems.length === 0 ? (
          <InboxCategoryEmptyState filter={activeFilter} />
        ) : (
          <div className="mt-4 space-y-3">
            {visibleItems.map((item) => <ActionCard key={item.id} item={inboxRowToCard(item)} savedItemId={savedItemIds[item.id]} />)}
          </div>
        )}
      </section>
    </>
  );
}

function InboxCategoryEmptyState({ filter }: { filter: InboxFilter }) {
  const label = tabs.find((tab) => tab.value === filter)?.label ?? "Inbox";
  return (
    <div className="mt-4 grid min-h-64 place-items-center rounded-xl border bg-white text-center shadow-card">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-blue-50 text-primary"><InboxIcon className="size-6" /></span>
        <h3 className="mt-4 text-lg font-semibold">No {label} items yet.</h3>
        <p className="mt-2 text-sm text-muted-foreground">Upload a screenshot to get started.</p>
      </div>
    </div>
  );
}
