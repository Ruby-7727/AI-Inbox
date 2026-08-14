"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

import { ConfidenceBadge } from "@/components/cards/confidence-badge";
import { ActionHistory } from "@/components/actions/action-history";
import { SuggestedActionButton } from "@/components/actions/suggested-action-button";
import { mapSuggestedActions } from "@/lib/actions/mapper";
import { getInboxItemById } from "@/lib/supabase/inboxItems";
import type { InboxItemRow } from "@/types/database";

export function PersistedItemDetail({ id }: { id: string }) {
  const [item, setItem] = useState<InboxItemRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getInboxItemById(id)
      .then((data) => { if (active) setItem(data); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "Item could not be loaded."); });
    return () => { active = false; };
  }, [id]);

  if (error) return <DetailMessage title="We couldn't load this item." detail={error} />;
  if (item === undefined) return <div className="h-96 animate-pulse rounded-xl border bg-white/60" aria-label="Loading item" />;
  if (item === null) return <DetailMessage title="Item not found" detail="This item does not exist or belongs to another user." />;

  const suggestedActions = mapSuggestedActions(item.intent, item.structured_data.actions ?? []);

  return (
    <div>
      <Link className="inline-flex items-center gap-3 text-slate-600 hover:text-primary" href="/inbox"><ArrowLeft className="size-5" />Back to Inbox</Link>
      <div className="mt-8 flex items-center justify-between">
        <span className="inline-flex h-11 items-center rounded-lg border border-blue-200 bg-blue-50/40 px-4 font-medium capitalize text-primary">{item.intent}</span>
        <ConfidenceBadge value={Number(item.confidence ?? 0)} />
      </div>
      <section className="mt-5 rounded-xl border bg-white p-7 shadow-card">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">{item.title}</h1>
        <p className="mt-2 text-slate-600">{item.summary ?? "No summary was available without guessing."}</p>
        <h2 className="mt-7 text-lg font-semibold">Extracted information</h2>
        <div className="mt-4 overflow-hidden rounded-xl border">
          {item.structured_data.fields?.length ? item.structured_data.fields.map((field) => (
            <div className="grid grid-cols-[180px_1fr] border-b px-5 py-4 last:border-b-0" key={field.key}><span className="text-sm text-muted-foreground">{field.label}</span><span className={field.value === null ? "text-slate-400" : "font-medium"}>{field.value ?? "Not found"}</span></div>
          )) : <p className="px-5 py-4 text-sm text-muted-foreground">No grounded fields were extracted.</p>}
        </div>
        <h2 className="mt-7 text-lg font-semibold">Suggested actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {suggestedActions.length ? suggestedActions.map((action) => <SuggestedActionButton key={action.id} action={action} />) : <p className="text-sm text-muted-foreground">No grounded actions suggested.</p>}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Suggestions only — AI Inbox has not executed any external action.</p>
        <ActionHistory />
      </section>
      <section className="mt-6 flex items-center gap-4 rounded-xl border bg-white px-7 py-5 shadow-card"><ImageIcon className="size-6" /><div><p className="font-medium">Original screenshot stored</p><p className="mt-1 text-sm text-muted-foreground">Private path: {item.image_path}</p></div></section>
    </div>
  );
}

function DetailMessage({ title, detail }: { title: string; detail: string }) {
  return <section className="rounded-xl border bg-white p-10 text-center shadow-card"><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-3 text-muted-foreground">{detail}</p><Link className="mt-7 inline-flex items-center gap-2 text-primary" href="/inbox"><ArrowLeft className="size-4" />Back to Inbox</Link></section>;
}
