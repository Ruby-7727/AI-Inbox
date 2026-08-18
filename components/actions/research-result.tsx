import { AlertTriangle, Lightbulb, SearchCheck } from "lucide-react";

import type { ResearchResult as ResearchResultData } from "@/types/research";

export function ResearchResult({ result }: { result: ResearchResultData }) {
  return (
    <article className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm" aria-labelledby="research-report-title">
      <header className="border-b bg-slate-50/70 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-primary">
            <SearchCheck className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Research report</p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em]" id="research-report-title">{result.title}</h3>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 py-4">
        <ReportSection title="Overall">
          <p className="text-sm leading-6 text-slate-600">{result.overview}</p>
        </ReportSection>

        <ReportSection title="Key findings">
          {result.findings.length ? (
            <ul className="space-y-3">
              {result.findings.map((finding, index) => (
                <li className="grid grid-cols-[auto_1fr] gap-3" key={`${finding.title}-${index}`}>
                  <span className="mt-2 size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{finding.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{finding.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No grounded findings were available.</p>}
        </ReportSection>

        <ReportSection icon={Lightbulb} title="Recommendations">
          {result.recommendations.length ? (
            <ol className="space-y-2 pl-5 text-sm leading-6 text-slate-600">
              {result.recommendations.map((recommendation, index) => <li className="list-decimal pl-1" key={`${recommendation}-${index}`}>{recommendation}</li>)}
            </ol>
          ) : <p className="text-sm text-muted-foreground">No recommendations were generated.</p>}
        </ReportSection>

        {result.cautions?.length ? (
          <ReportSection icon={AlertTriangle} title="Cautions">
            <ul className="space-y-2 text-sm leading-6 text-amber-800">
              {result.cautions.map((caution, index) => (
                <li className="flex gap-2" key={`${caution}-${index}`}><span aria-hidden="true">•</span><span>{caution}</span></li>
              ))}
            </ul>
          </ReportSection>
        ) : null}
      </div>

      <footer className="border-t bg-slate-50/60 px-5 py-3 text-xs leading-5 text-muted-foreground">
        Based on the information in your screenshot. No live web data was used.
      </footer>
    </article>
  );
}

function ReportSection({ title, icon: Icon, children }: { title: string; icon?: typeof Lightbulb; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
        {Icon ? <Icon className="size-4 text-primary" aria-hidden="true" /> : null}
        {title}
      </h4>
      {children}
    </section>
  );
}
