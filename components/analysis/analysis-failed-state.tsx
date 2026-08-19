import { ImageOff } from "lucide-react";

import { UploadButton } from "@/components/actions/upload-button";

export function AnalysisFailedState() {
  return (
    <section className="grid min-h-[calc(100vh-8rem)] place-items-center py-8" aria-labelledby="analysis-failed-title">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-[#e5d3c2] bg-card/95 p-9 text-center shadow-card">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f4ded8] text-[#a94f48]"><ImageOff className="size-6" /></span>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-[#713b2b]" id="analysis-failed-title">Unable to analyze this screenshot</h1>
        <p className="mt-3 text-slate-600">We couldn&apos;t understand the content.</p>
        <div className="mt-6 rounded-2xl border border-[#e5d3c2] bg-[#fffaf4] p-5 text-left">
          <p className="text-sm font-medium">This can happen when:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Image quality is too low</li>
            <li>Screenshot contains limited information</li>
          </ul>
        </div>
        <UploadButton className="mt-7" label="Upload another screenshot" />
      </div>
    </section>
  );
}
