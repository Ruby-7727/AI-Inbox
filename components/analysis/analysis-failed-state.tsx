import { ImageOff } from "lucide-react";

import { UploadButton } from "@/components/actions/upload-button";

export function AnalysisFailedState() {
  return (
    <section className="grid min-h-[calc(100vh-8rem)] place-items-center py-8" aria-labelledby="analysis-failed-title">
      <div className="w-full max-w-lg rounded-xl border bg-white p-9 text-center shadow-card">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-600"><ImageOff className="size-6" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em]" id="analysis-failed-title">Unable to analyze this screenshot</h1>
        <p className="mt-3 text-slate-600">We couldn&apos;t understand the content.</p>
        <div className="mt-6 rounded-xl border bg-slate-50/70 p-5 text-left">
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
