"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { ActionCard } from "@/components/cards/action-card";
import { EmptyState } from "@/components/inbox/empty-state";
import { getInboxItems } from "@/lib/supabase/inboxItems";
import { inboxRowToCard } from "@/lib/supabase/presenters";
import type { InboxItemRow } from "@/types/database";

export function InboxContent() {
  const [items, setItems] = useState<InboxItemRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getInboxItems()
      .then((data) => { if (active) setItems(data); })
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
  if (items.length === 0) return <EmptyState />;

  return (
    <section className="mt-9">
      <h2 className="text-xl font-semibold">Recent items</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => <ActionCard key={item.id} item={inboxRowToCard(item)} />)}
      </div>
    </section>
  );
}
