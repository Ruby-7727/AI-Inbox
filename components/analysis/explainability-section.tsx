import { Check, Sparkles } from "lucide-react";

import { getDetectedSignals } from "@/lib/analysis/explainability";
import type { AnalysisField, AnalysisIntent } from "@/types/analysis";

type ExplainabilitySectionProps = {
  intent: AnalysisIntent;
  title?: string | null;
  summary?: string | null;
  fields?: readonly AnalysisField[];
};

export function ExplainabilitySection(props: ExplainabilitySectionProps) {
  const signals = getDetectedSignals(props);
  return (
    <section className="mt-7 rounded-xl border border-blue-100 bg-blue-50/35 p-5" aria-labelledby="ai-explanation-title">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-primary shadow-sm"><Sparkles className="size-4.5" /></span>
        <div>
          <h2 className="font-semibold" id="ai-explanation-title">Why AI classified this as <span className="capitalize">{props.intent}</span></h2>
          <p className="mt-1 text-sm text-muted-foreground">Detected from the structured information in your screenshot:</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {signals.map((signal) => <li className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm text-slate-700" key={signal}><Check className="size-3.5 text-primary" />{signal}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
