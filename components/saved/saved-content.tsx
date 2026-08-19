"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Bookmark, Eye, LoaderCircle, Trash2 } from "lucide-react";

import { IntentBadge } from "@/components/cards/intent-badge";
import { ItemVisual } from "@/components/cards/item-visual";
import { shouldShowItemVisual } from "@/lib/demo/visuals";
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
      <nav className="mt-7 flex gap-2 overflow-x-auto border-b border-[#e3d1c0] text-sm text-[#6d5b51]" aria-label="Saved item categories">
        {tabs.map((tab) => (
          <button
            aria-current={activeFilter === tab.value ? "page" : undefined}
            className={activeFilter === tab.value ? "border-b-2 border-primary px-4 pb-4 font-semibold text-primary" : "px-4 pb-4 transition-colors hover:text-[#3f302a]"}
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {items === null && !error ? <div className="mt-7 grid gap-7 lg:grid-cols-3"><div className="h-80 animate-pulse rounded-xl border bg-white/60" /><div className="h-64 animate-pulse rounded-xl border bg-white/60" /><div className="h-72 animate-pulse rounded-xl border bg-white/60" /></div> : null}
      {error ? <div className="mt-7 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="size-5" />{error}</div> : null}
      {items !== null && !visibleItems?.length ? (
        <SavedEmptyState filter={activeFilter} />
      ) : visibleItems?.length ? (
        <section className="mt-7 columns-1 gap-6 md:columns-2 xl:columns-3">
          {visibleItems.map(({ savedItem, inboxItem }) => {
            const card = inboxRowToCard(inboxItem);
            const showVisual = shouldShowItemVisual({ imagePath: inboxItem.image_path, intent: card.intent, title: card.title, supportingText: `${card.meta} ${card.detail ?? ""}` });
            return (
              <article key={savedItem.id} className="mb-6 inline-flex min-h-64 w-full break-inside-avoid flex-col overflow-hidden rounded-[1.6rem] border border-[#e6d5c5]/80 bg-card/92 shadow-[0_12px_32px_rgb(104_68_45_/_0.09)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(104_68_45_/_0.13)]">
                {showVisual ? <ItemVisual className="rounded-none border-0 shadow-none" imagePath={inboxItem.image_path} intent={card.intent} title={card.title} variant="saved" /> : null}
                <div className="flex flex-1 gap-5 p-6"><IntentBadge compact intent={card.intent} /><div className="min-w-0"><h2 className="text-xl font-semibold text-[#3f302a]">{card.title}</h2><p className="mt-3 text-sm leading-6 text-[#66564d]">{card.meta}</p>{card.detail ? <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{card.detail}</p> : null}<span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d6c4b4] bg-[#fffdf8] px-3 py-1.5 text-sm text-primary"><Bookmark className="size-4" />Saved</span></div></div>
                <div className="mx-6 flex border-t border-[#eadccf] py-4 text-sm font-medium text-[#6d5b51]"><Link className="flex flex-1 items-center justify-center gap-3 hover:text-primary" href={`/inbox/${inboxItem.id}`}><Eye className="size-5" />View</Link><span className="border-l border-[#eadccf]" /><button className="flex flex-1 items-center justify-center gap-3 hover:text-primary disabled:opacity-50" disabled={removingId === savedItem.id} onClick={() => remove(savedItem.id)} type="button">{removingId === savedItem.id ? <LoaderCircle className="size-5 animate-spin" /> : <Trash2 className="size-5" />}Remove</button></div>
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
