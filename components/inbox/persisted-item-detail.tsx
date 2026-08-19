"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

import { ConfidenceBadge } from "@/components/cards/confidence-badge";
import { IntentBadge, intentLabel } from "@/components/cards/intent-badge";
import { ActionHistory } from "@/components/actions/action-history";
import { SuggestedActionButton } from "@/components/actions/suggested-action-button";
import { SaveButton } from "@/components/actions/save-button";
import { ExplainabilitySection } from "@/components/analysis/explainability-section";
import { LowConfidenceResult } from "@/components/analysis/low-confidence-result";
import { ItemVisual } from "@/components/cards/item-visual";
import { DeleteItemButton } from "@/components/inbox/item-management-menu";
import { mapSuggestedActions } from "@/lib/actions/mapper";
import { isPlaceRecommendation } from "@/lib/actions/place-recommendation";
import { LOW_CONFIDENCE_THRESHOLD } from "@/lib/analysis/uncertainty";
import { shouldShowItemVisual } from "@/lib/demo/visuals";
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
  if (Number(item.confidence ?? 0) < LOW_CONFIDENCE_THRESHOLD) {
    return <div><DetailTopBar itemId={item.id} /><LowConfidenceResult imagePath={item.image_path} inboxItemId={item.id} intent={item.intent} title={item.title} /></div>;
  }

  const suggestedActions = mapSuggestedActions(item.intent, item.structured_data.actions ?? [], {
    fields: item.structured_data.fields,
    locationFallback: item.title,
    itemTitle: item.title,
    itemDescription: item.summary,
    inboxItemId: item.id,
  });
  const supportsSave = item.intent === "shop" || item.intent === "remember";
  const supportsPlaceSave = item.intent === "go" && isPlaceRecommendation({
    title: item.title,
    summary: item.summary,
    fields: item.structured_data.fields,
  });
  const showVisual = shouldShowItemVisual({ imagePath: item.image_path, intent: item.intent, title: item.title, supportingText: item.summary });

  return (
    <div>
      <DetailTopBar itemId={item.id} />
      <div className="mt-8 flex items-center justify-between">
        <IntentBadge compact intent={intentLabel(item.intent)} />
        <ConfidenceBadge value={Number(item.confidence ?? 0)} />
      </div>
      <section className="mt-5 rounded-[1.75rem] border border-[#e5d3c2] bg-card/95 p-6 shadow-card sm:p-8">
        {showVisual ? <ItemVisual className="mb-8" imagePath={item.image_path} intent={item.intent} title={item.title} variant="hero" /> : null}
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#643929]">{item.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#66564d]">{item.summary ?? "No summary was available without guessing."}</p>
        <h2 className="mt-9 font-display text-2xl font-semibold text-[#633d30]">What was saved</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e7d7c7] bg-[#fffdf8]">
          {item.structured_data.fields?.length ? item.structured_data.fields.map((field) => (
            <div className="grid grid-cols-[minmax(120px,180px)_1fr] border-b border-[#eadccf] px-5 py-4 last:border-b-0" key={field.key}><span className="text-sm text-muted-foreground">{field.label}</span><span className={field.value === null ? "text-[#a6978f]" : "font-medium text-[#47372f]"}>{field.value ?? "Not found"}</span></div>
          )) : <p className="px-5 py-4 text-sm text-muted-foreground">No grounded fields were extracted.</p>}
        </div>
        <ExplainabilitySection intent={item.intent} title={item.title} summary={item.summary} fields={item.structured_data.fields} />
        <h2 className="mt-9 font-display text-2xl font-semibold text-[#633d30]">Suggested actions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {supportsSave ? <SaveButton inboxItemId={item.id} showDescription /> : null}
          {suggestedActions.map((action) => <SuggestedActionButton key={action.id} action={action} />)}
          {supportsPlaceSave ? <SaveButton inboxItemId={item.id} label="Save Place" showDescription /> : null}
          {!supportsSave && !supportsPlaceSave && !suggestedActions.length ? <p className="text-sm text-muted-foreground">No grounded actions suggested.</p> : null}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Suggestions only — AI Inbox has not executed any external action.</p>
        <ActionHistory />
      </section>
      <section className="mt-6 flex items-center gap-4 rounded-2xl border border-[#e5d3c2] bg-card/85 px-7 py-5 shadow-card"><span className="grid size-10 place-items-center rounded-xl bg-[#f1e4d9] text-primary"><ImageIcon className="size-5" /></span><div><p className="font-medium">{item.image_path ? "Original screenshot stored" : "Portfolio demo scenario"}</p><p className="mt-1 text-sm text-muted-foreground">{item.image_path ? "Private screenshot preview is available above." : "Representative data for demonstrating the AI Inbox workflow."}</p></div></section>
    </div>
  );
}

function DetailTopBar({ itemId }: { itemId: string }) {
  return <div className="flex items-center justify-between gap-4"><Link className="inline-flex items-center gap-3 text-[#6d5b51] hover:text-primary" href="/inbox"><ArrowLeft className="size-5" />Back to Inbox</Link><DeleteItemButton itemId={itemId} /></div>;
}

function DetailMessage({ title, detail }: { title: string; detail: string }) {
  return <section className="rounded-xl border bg-white p-10 text-center shadow-card"><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-3 text-muted-foreground">{detail}</p><Link className="mt-7 inline-flex items-center gap-2 text-primary" href="/inbox"><ArrowLeft className="size-4" />Back to Inbox</Link></section>;
}
