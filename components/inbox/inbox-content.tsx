"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Bookmark, CalendarDays, Inbox as InboxIcon, MapPin, ShoppingBag, SquareCheckBig } from "lucide-react";

import { ActionCard } from "@/components/cards/action-card";
import { EmptyState } from "@/components/inbox/empty-state";
import { ensureDemoInboxItems } from "@/lib/supabase/demoItems";
import { getInboxItems } from "@/lib/supabase/inboxItems";
import { inboxRowToCard } from "@/lib/supabase/presenters";
import { getSavedItems } from "@/lib/supabase/savedItems";
import type { InboxItemRow } from "@/types/database";

type InboxFilter = "all" | "attend" | "do" | "go" | "shop" | "remember";

const tabs: Array<{ label: string; value: InboxFilter; icon: typeof InboxIcon }> = [
  { label: "All", value: "all", icon: InboxIcon },
  { label: "Attend", value: "attend", icon: CalendarDays },
  { label: "Do", value: "do", icon: SquareCheckBig },
  { label: "Go", value: "go", icon: MapPin },
  { label: "Shop", value: "shop", icon: ShoppingBag },
  { label: "Remember", value: "remember", icon: Bookmark },
];

export function InboxContent() {
  const [items, setItems] = useState<InboxItemRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<InboxFilter>("all");

  useEffect(() => {
    let active = true;
    const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
    void Promise.all([getInboxItems().then((inboxItems) => ensureDemoInboxItems(inboxItems, { enabled: demoMode })), getSavedItems()])
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
      <nav className="mt-7 flex gap-2 overflow-x-auto rounded-[1.35rem] bg-[#f4e8db]/55 p-2 text-sm text-[#6d5b51] shadow-[inset_0_0_0_1px_rgb(222_200_181_/_0.55)]" aria-label="Inbox categories">
        {tabs.map((tab) => (
          <button
            aria-pressed={activeFilter === tab.value}
            className={activeFilter === tab.value
              ? "flex shrink-0 items-center gap-2 rounded-2xl bg-[#fffaf3] px-4 py-3 font-semibold text-primary shadow-[0_6px_18px_rgb(104_68_45_/_0.08)]"
              : "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 transition-colors hover:bg-[#fffaf2]/65"}
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            type="button"
          >
            <tab.icon className="size-4" />
            {tab.label}
            <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">{tab.value === "all" ? items.length : items.filter((item) => item.intent === tab.value).length}</span>
          </button>
        ))}
      </nav>
      <section className="mt-8">
        <div className="flex items-end justify-between border-b border-[#e6d5c5] pb-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">{items.length === 0 ? "Start here" : "Your collection"}</p><h2 className="mt-1 font-display text-3xl font-semibold text-[#684334]">{items.length === 0 ? "Your collection" : "Recent moments"}</h2></div><p className="hidden text-sm text-muted-foreground sm:block">{items.length === 0 ? "No screenshots yet. Upload your first screenshot and AI will organize it for you." : "A visual archive of things worth keeping."}</p></div>
        {items.length === 0 ? <EmptyState /> : visibleItems.length === 0 ? (
          <InboxCategoryEmptyState filter={activeFilter} />
        ) : (
          <div className="mt-6 space-y-4">
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
    <div className="mt-4 grid min-h-64 place-items-center rounded-2xl border bg-card/85 text-center shadow-card">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-blue-50 text-primary"><InboxIcon className="size-6" /></span>
        <h3 className="mt-4 text-lg font-semibold">No {label} items yet.</h3>
        <p className="mt-2 text-sm text-muted-foreground">Upload a screenshot to get started.</p>
      </div>
    </div>
  );
}
