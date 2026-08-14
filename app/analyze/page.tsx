"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Circle, Sparkles } from "lucide-react";

import { SuggestedActionButton } from "@/components/actions/suggested-action-button";
import { ActionHistory } from "@/components/actions/action-history";
import { mapSuggestedActions } from "@/lib/actions/mapper";
import type { AnalyzeApiResponse } from "@/types/analysis";

export default function AnalyzePage() {
  const [analysis, setAnalysis] = useState<AnalyzeApiResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("ai-inbox:analysis");
    let frame = 0;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnalyzeApiResponse;
        frame = window.requestAnimationFrame(() => setAnalysis(parsed));
      } catch {
        sessionStorage.removeItem("ai-inbox:analysis");
      }
    }
    const timer = window.setTimeout(() => setReady(true), 2200);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  if (ready) return <AnalysisResultCard analysis={analysis} />;

  return (
    <section className="grid min-h-[calc(100vh-8rem)] place-items-center py-8">
      <div className="w-full max-w-[570px] rounded-xl border bg-card px-12 py-10 shadow-card">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-blue-50 text-primary"><Sparkles className="size-7" aria-hidden="true" /></span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Understanding your screenshot...</h1>
          <p className="mt-2 text-muted-foreground">AI Inbox is turning your screenshot into structured information.</p>
        </div>
        <div className="mt-8 flex h-24 items-center gap-4 rounded-xl border bg-slate-50/50 px-5 opacity-60 blur-[1px]">
          <span className="grid size-14 place-items-center rounded-lg bg-blue-50 text-primary"><span className="text-xs font-medium capitalize">{analysis?.result.intent ?? "Analyzing"}</span></span><div><p className="font-medium">{analysis?.result.title ?? "Reading screenshot"}</p><p className="mt-2 text-xs text-muted-foreground">Preparing grounded fields and suggested actions</p></div>
        </div>
        <div className="mt-8 space-y-0 pl-4">
          <ProcessStep label="Reading content" done />
          <ProcessStep label="Identifying intent" done />
          <ProcessStep label="Extracting information" active detail="Pulling out key details and context..." />
          <ProcessStep label="Preparing actions" last />
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
  const suggestedActions = mapSuggestedActions(result.intent, result.actions);
  return (
    <div className="py-2">
      <Link className="inline-flex items-center gap-2 text-slate-600 hover:text-primary" href="/inbox"><ArrowLeft className="size-5" />Back to Inbox</Link>
      <section className="mt-6 rounded-xl border bg-white p-8 shadow-card">
        <div className="flex items-center justify-between gap-5">
          <span className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-medium capitalize text-primary">{result.intent}</span>
          <span className="rounded-lg border px-4 py-2 text-sm text-slate-600">Confidence guidance: {result.confidence}/100</span>
        </div>
        <h1 className="mt-7 text-3xl font-semibold tracking-[-0.03em]">{result.title ?? "Untitled screenshot"}</h1>
        <p className="mt-3 leading-7 text-slate-600">{result.summary ?? "No summary could be extracted without guessing."}</p>

        <h2 className="mt-8 text-lg font-semibold">Extracted information</h2>
        <div className="mt-4 overflow-hidden rounded-xl border">
          {result.fields.map((field) => <div key={field.key} className="grid grid-cols-[180px_1fr] border-b px-5 py-4 last:border-b-0"><span className="text-sm text-muted-foreground">{field.label}</span><span className={field.value === null ? "text-slate-400" : "font-medium"}>{field.value ?? "Not found"}</span></div>)}
        </div>

        <h2 className="mt-8 text-lg font-semibold">Suggested actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {suggestedActions.length ? suggestedActions.map((action) => <SuggestedActionButton key={action.id} action={action} />) : <p className="text-sm text-muted-foreground">No grounded actions suggested.</p>}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Suggestions only — AI Inbox has not executed any external action.</p>
        <ActionHistory />
      </section>
    </div>
  );
}

function ProcessStep({ label, detail, done, active, last }: { label: string; detail?: string; done?: boolean; active?: boolean; last?: boolean }) {
  return <div className="relative flex min-h-14 gap-4"><span className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full ${done ? 'bg-primary text-white' : active ? 'border-[3px] border-primary bg-blue-50 text-primary' : 'border-2 border-slate-300 bg-white text-slate-300'}`}>{done ? <Check className="size-4" /> : <Circle className="size-2 fill-current" />}</span>{!last ? <span className="absolute left-[13px] top-7 h-8 border-l-2 border-blue-100" /> : null}<div><p className={active ? "font-semibold" : "font-medium"}>{label}</p>{detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}</div></div>;
}
