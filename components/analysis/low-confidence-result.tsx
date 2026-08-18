import { AlertTriangle } from "lucide-react";

import { SaveButton } from "@/components/actions/save-button";
import { UploadButton } from "@/components/actions/upload-button";
import { buildIntentPossibilities } from "@/lib/analysis/uncertainty";
import type { AnalysisIntent } from "@/types/analysis";

export function LowConfidenceResult({ inboxItemId, intent }: { inboxItemId: string; intent: AnalysisIntent }) {
  const possibilities = buildIntentPossibilities(intent);
  return (
    <section className="mt-6 rounded-xl border bg-white p-8 shadow-card" aria-labelledby="low-confidence-title">
      <span className="grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600"><AlertTriangle className="size-6" /></span>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em]" id="low-confidence-title">Low confidence result</h1>
      <p className="mt-3 text-lg text-slate-600">I&apos;m not fully sure what this screenshot is about.</p>

      <div className="mt-7 rounded-xl border bg-slate-50/60 p-5">
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
