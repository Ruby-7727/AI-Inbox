"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Circle, Sparkles } from "lucide-react";

import { SuggestedActionButton } from "@/components/actions/suggested-action-button";
import { ActionHistory } from "@/components/actions/action-history";
import { SaveButton } from "@/components/actions/save-button";
import { ExplainabilitySection } from "@/components/analysis/explainability-section";
import { AnalysisFailedState } from "@/components/analysis/analysis-failed-state";
import { LowConfidenceResult } from "@/components/analysis/low-confidence-result";
import { ItemVisual } from "@/components/cards/item-visual";
import { IntentBadge, intentLabel } from "@/components/cards/intent-badge";
import { DeleteItemButton } from "@/components/inbox/item-management-menu";
import { mapSuggestedActions } from "@/lib/actions/mapper";
import { isUserExecutableAction } from "@/lib/actions/capabilities";
import { isPlaceRecommendation } from "@/lib/actions/place-recommendation";
import { LOW_CONFIDENCE_THRESHOLD } from "@/lib/analysis/uncertainty";
import { shouldShowItemVisual } from "@/lib/demo/visuals";
import type { AnalyzeApiResponse } from "@/types/analysis";

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<AnalyzeApiResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [analysisFailed, setAnalysisFailed] = useState(false);

  useEffect(() => {
    const failed = sessionStorage.getItem("ai-inbox:analysis-error") === "true";
    const stored = failed ? null : sessionStorage.getItem("ai-inbox:analysis");
    let frame = 0;
    if (failed) {
      frame = window.requestAnimationFrame(() => setAnalysisFailed(true));
    } else if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnalyzeApiResponse;
        frame = window.requestAnimationFrame(() => setAnalysis(parsed));
      } catch {
        sessionStorage.removeItem("ai-inbox:analysis");
      }
    }
    const stageTimers = [
      window.setTimeout(() => setProcessingStage(1), 700),
      window.setTimeout(() => setProcessingStage(2), 1400),
    ];
    const timer = window.setTimeout(() => setReady(true), 2200);
    return () => {
      window.cancelAnimationFrame(frame);
      stageTimers.forEach((stageTimer) => window.clearTimeout(stageTimer));
      window.clearTimeout(timer);
    };
  }, []);

  if (analysisFailed) return <AnalysisFailedState />;
  if (ready) return <AnalysisResultCard analysis={analysis} />;

  return (
    <section className="grid min-h-[calc(100vh-8rem)] place-items-center py-8">
      <div className="w-full max-w-[590px] rounded-[1.75rem] border border-[#e5d2c0] bg-card/95 px-9 py-10 shadow-card sm:px-12">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#f4dfd2] text-primary shadow-[0_8px_24px_rgb(104_68_45_/_0.08)]"><Sparkles className="size-7" aria-hidden="true" /></span>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-[#713b2b]">Analyzing screenshot...</h1>
          <p className="mt-2 text-muted-foreground">AI Inbox is turning your screenshot into structured information.</p>
        </div>
        <div className="mt-8 flex h-24 items-center gap-4 rounded-2xl border border-[#e7d8ca] bg-[#fbf4eb] px-5 opacity-70 blur-[1px]">
          <span className="grid size-14 place-items-center rounded-xl bg-[#f2ded1] text-primary"><span className="text-xs font-medium capitalize">{analysis?.result.intent ?? "Analyzing"}</span></span><div><p className="font-medium">{analysis?.result.title ?? "Reading screenshot"}</p><p className="mt-2 text-xs text-muted-foreground">Preparing grounded fields and suggested actions</p></div>
        </div>
        <div className="mt-8 space-y-0 pl-4">
          <ProcessStep label="Understanding content" detail="Reading visible details and context" index={0} stage={processingStage} />
          <ProcessStep label="Detecting user intent" detail="Identifying what you may want to do next" index={1} stage={processingStage} />
          <ProcessStep label="Preparing actions" detail="Turning extracted information into useful next steps" index={2} stage={processingStage} last />
        </div>
      </div>
    </section>
  );
}

function AnalysisResultCard({ analysis }: { analysis: AnalyzeApiResponse | null }) {
  if (!analysis) {
    return <section className="grid min-h-[calc(100vh-8rem)] place-items-center"><div className="w-full max-w-lg rounded-xl border bg-white p-10 text-center shadow-card"><h1 className="text-2xl font-semibold">No analysis found</h1><p className="mt-3 text-muted-foreground">Upload a screenshot to start a new analysis.</p><Link className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white" href="/inbox"><ArrowLeft className="size-4" />Back to Inbox</Link></div></section>;
  }

  const { result } = analysis;
  if (result.confidence < LOW_CONFIDENCE_THRESHOLD) {
    return <div className="py-2"><DetailTopBar itemId={analysis.id} /><LowConfidenceResult imagePath={analysis.imagePath} inboxItemId={analysis.id} intent={result.intent} title={result.title ?? "Unclear screenshot"} /></div>;
  }
  const suggestedActions = mapSuggestedActions(result.intent, result.actions, {
    fields: result.fields,
    locationFallback: result.title,
    itemTitle: result.title,
    itemDescription: result.summary,
    inboxItemId: analysis.id,
  }).filter(isUserExecutableAction);
  const supportsSave = result.intent === "shop" || result.intent === "remember";
  const supportsPlaceSave = result.intent === "go" && isPlaceRecommendation({
    title: result.title,
    summary: result.summary,
    fields: result.fields,
  });
  const showVisual = shouldShowItemVisual({ imagePath: analysis.imagePath, intent: result.intent, title: result.title ?? "Untitled screenshot", supportingText: result.summary });
  return (
    <div className="py-2">
      <DetailTopBar itemId={analysis.id} />
      <section className="mt-6 rounded-[1.75rem] border border-[#e5d3c2] bg-card/95 p-6 shadow-card sm:p-8">
        {showVisual ? <ItemVisual className="mb-8" imagePath={analysis.imagePath} intent={result.intent} title={result.title ?? "Untitled screenshot"} variant="hero" /> : null}
        <div className="flex items-center justify-between gap-5">
          <IntentBadge compact intent={intentLabel(result.intent)} />
          <span className="rounded-full border border-[#dfd0c2] bg-[#fffdf8] px-4 py-2 text-sm text-[#6d5b51]">Confidence guidance: {result.confidence}/100</span>
        </div>
        <h1 className="mt-7 font-display text-4xl font-semibold tracking-[-0.03em] text-[#643929]">{result.title ?? "Untitled screenshot"}</h1>
        <p className="mt-3 max-w-3xl leading-7 text-[#66564d]">{result.summary ?? "No summary could be extracted without guessing."}</p>

        <h2 className="mt-9 font-display text-2xl font-semibold text-[#633d30]">What was saved</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e7d7c7] bg-[#fffdf8]">
          {result.fields.map((field) => <div key={field.key} className="grid grid-cols-[minmax(120px,180px)_1fr] border-b border-[#eadccf] px-5 py-4 last:border-b-0"><span className="text-sm text-muted-foreground">{field.label}</span><span className={field.value === null ? "text-[#a6978f]" : "font-medium text-[#47372f]"}>{field.value ?? "Not found"}</span></div>)}
        </div>

        <ExplainabilitySection intent={result.intent} title={result.title} summary={result.summary} fields={result.fields} />

        <h2 className="mt-9 font-display text-2xl font-semibold text-[#633d30]">Suggested actions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {supportsSave ? <SaveButton inboxItemId={analysis.id} showDescription /> : null}
          {suggestedActions.map((action) => <SuggestedActionButton key={action.id} action={action} />)}
          {supportsPlaceSave ? <SaveButton inboxItemId={analysis.id} label="Save Place" showDescription /> : null}
          {!supportsSave && !supportsPlaceSave && !suggestedActions.length ? <p className="text-sm text-muted-foreground">No grounded actions suggested.</p> : null}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Suggestions only — AI Inbox has not executed any external action.</p>
        <ActionHistory />
      </section>
    </div>
  );
}

function DetailTopBar({ itemId }: { itemId: string }) {
  return <div className="flex items-center justify-between gap-4"><Link className="inline-flex items-center gap-2 text-[#6d5b51] hover:text-primary" href="/inbox"><ArrowLeft className="size-5" />Back to Inbox</Link><DeleteItemButton itemId={itemId} /></div>;
}

function ProcessStep({ label, detail, index, stage, last }: { label: string; detail: string; index: number; stage: number; last?: boolean }) {
  const done = index < stage;
  const active = index === stage;
  return <div className="relative flex min-h-16 gap-4"><span className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full ${done ? 'bg-primary text-white' : active ? 'border-[3px] border-primary bg-blue-50 text-primary' : 'border-2 border-slate-300 bg-white text-slate-300'}`}>{done ? <Check className="size-4" /> : <Circle className={`size-2 fill-current ${active ? "animate-pulse" : ""}`} />}</span>{!last ? <span className="absolute left-[13px] top-7 h-10 border-l-2 border-blue-100" /> : null}<div><p className={active ? "font-semibold" : "font-medium"}>{label}</p><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div></div>;
}
