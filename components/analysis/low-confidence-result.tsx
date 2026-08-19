import { AlertTriangle } from "lucide-react";

import { SaveButton } from "@/components/actions/save-button";
import { UploadButton } from "@/components/actions/upload-button";
import { ItemVisual } from "@/components/cards/item-visual";
import { buildIntentPossibilities } from "@/lib/analysis/uncertainty";
import { shouldShowItemVisual } from "@/lib/demo/visuals";
import type { AnalysisIntent } from "@/types/analysis";

export function LowConfidenceResult({ inboxItemId, intent, imagePath, title }: { inboxItemId: string; intent: AnalysisIntent; imagePath?: string | null; title: string }) {
  const possibilities = buildIntentPossibilities(intent);
  const showVisual = shouldShowItemVisual({ imagePath, intent, title });
  return (
    <section className="mt-6 rounded-[1.75rem] border border-[#e5d3c2] bg-card/95 p-6 shadow-card sm:p-8" aria-labelledby="low-confidence-title">
      {showVisual ? <ItemVisual className="mb-7" imagePath={imagePath} intent={intent} title={title} variant="hero" /> : null}
      <span className="grid size-12 place-items-center rounded-full bg-[#f7e8c8] text-[#b87927]"><AlertTriangle className="size-6" /></span>
      <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-[#713b2b]" id="low-confidence-title">Low confidence result</h1>
      <p className="mt-3 text-lg text-slate-600">I&apos;m not fully sure what this screenshot is about.</p>

      <div className="mt-7 rounded-2xl border border-[#e7d7c7] bg-[#fffaf4] p-5">
        <h2 className="font-semibold">Possible categories</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">AI is not fully certain. These are possible categories based on the screenshot content.</p>
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Most likely</p>
          <p className="mt-2 text-lg font-semibold capitalize text-primary">{possibilities.mostLikely}</p>
        </div>
        <div className="mt-5 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Could also be</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {possibilities.alternatives.map((candidate) => <span className="rounded-full border bg-white px-3 py-1.5 text-sm font-medium capitalize text-slate-700" key={candidate}>{candidate}</span>)}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <SaveButton inboxItemId={inboxItemId} label="Save item" />
        <UploadButton className="h-11 text-sm" label="Upload another screenshot" />
      </div>
    </section>
  );
}
