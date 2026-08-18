"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Bookmark, Eye, LoaderCircle, Trash2 } from "lucide-react";

import { IntentBadge } from "@/components/cards/intent-badge";
import { inboxRowToCard } from "@/lib/supabase/presenters";
import { normalizeSavedCategory } from "@/lib/supabase/savedCategories";
import { getSavedItems, removeSavedItem, type SavedInboxItem } from "@/lib/supabase/savedItems";
import type { SavedItemCategory } from "@/types/database";

type SavedFilter = "all" | SavedItemCategory;

const tabs: Array<{ label: string; value: SavedFilter }> = [
  { label: "All", value: "all" },
  { label: "Products", value: "product" },
  { label: "Places", value: "place" },
  { label: "Notes", value: "note" },
];

export function SavedContent() {
  const [items, setItems] = useState<SavedInboxItem[] | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SavedFilter>("all");

  useEffect(() => {
    let active = true;
    void getSavedItems()
      .then((data) => { if (active) setItems(data); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "Saved items could not be loaded."); });
    return () => { active = false; };
  }, []);

  async function remove(id: string) {
    if (removingId) return;
    setRemovingId(id);
    setError(null);
    try {
      await removeSavedItem(id);
      setItems((current) => current?.filter(({ savedItem }) => savedItem.id !== id) ?? []);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Saved item could not be removed.");
    } finally {
      setRemovingId(null);
    }
  }

  const visibleItems = items?.filter(({ savedItem }) => activeFilter === "all" || normalizeSavedCategory(savedItem.category) === activeFilter);

  return (
    <>
      <nav className="mt-12 flex gap-6 border-b text-base text-slate-600" aria-label="Saved item categories">
        {tabs.map((tab) => (
          <button
            aria-current={activeFilter === tab.value ? "page" : undefined}
            className={activeFilter === tab.value ? "border-b-2 border-primary px-4 pb-5 font-medium text-primary" : "px-4 pb-5 transition-colors hover:text-slate-900"}
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {items === null && !error ? <div className="mt-7 grid gap-7 lg:grid-cols-2"><div className="h-80 animate-pulse rounded-xl border bg-white/60" /><div className="h-80 animate-pulse rounded-xl border bg-white/60" /></div> : null}
      {error ? <div className="mt-7 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="size-5" />{error}</div> : null}
      {items !== null && !visibleItems?.length ? (
        <SavedEmptyState filter={activeFilter} />
      ) : visibleItems?.length ? (
        <section className="mt-7 grid gap-7 lg:grid-cols-2">
          {visibleItems.map(({ savedItem, inboxItem }) => {
            const card = inboxRowToCard(inboxItem);
            return (
              <article key={savedItem.id} className="flex min-h-80 flex-col rounded-xl border bg-white p-7 shadow-card">
                <div className="flex gap-7"><IntentBadge intent={card.intent} /><div className="min-w-0"><h2 className="text-xl font-semibold">{card.title}</h2><p className="mt-4 text-slate-600">{card.meta}</p>{card.detail ? <p className="mt-2 max-w-sm leading-6 text-slate-600">{card.detail}</p> : null}<span className="mt-7 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-primary"><Bookmark className="size-4" />Saved</span></div></div>
                <div className="mt-auto flex border-t pt-5 text-slate-600"><Link className="flex flex-1 items-center justify-center gap-3" href={`/inbox/${inboxItem.id}`}><Eye className="size-5" />View</Link><span className="border-l" /><button className="flex flex-1 items-center justify-center gap-3 disabled:opacity-50" disabled={removingId === savedItem.id} onClick={() => remove(savedItem.id)} type="button">{removingId === savedItem.id ? <LoaderCircle className="size-5 animate-spin" /> : <Trash2 className="size-5" />}Remove</button></div>
              </article>
            );
          })}
        </section>
      ) : null}
    </>
  );
}

function SavedEmptyState({ filter }: { filter: SavedFilter }) {
  const title = filter === "product"
    ? "No saved products yet."
    : filter === "place"
      ? "No saved places yet."
      : filter === "note"
        ? "No saved notes yet."
        : "No saved items yet.";
  return (
    <section className="mt-7 grid min-h-80 place-items-center rounded-xl border bg-white text-center shadow-card">
      <div><Bookmark className="mx-auto size-9 text-primary" /><h2 className="mt-4 text-xl font-semibold">{title}</h2><p className="mt-2 text-muted-foreground">Save an Inbox item and it will appear here.</p></div>
    </section>
  );
}
