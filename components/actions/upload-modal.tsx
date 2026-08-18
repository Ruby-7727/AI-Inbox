"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { ScreenshotUploader } from "@/components/screenshot-uploader";

export function UploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onOpenChange]);

  function finishUpload() {
    onOpenChange(false);
    if (window.location.pathname === "/analyze") window.location.reload();
    else router.push("/analyze");
  }

  function showAnalysisFailure() {
    onOpenChange(false);
    if (window.location.pathname === "/analyze") window.location.reload();
    else router.push("/analyze");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/24 p-5 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <button className="absolute inset-0 cursor-default" aria-label="Close upload dialog" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-[510px] overflow-hidden rounded-xl border bg-white shadow-[0_24px_80px_rgb(15_23_42_/_0.2)]">
        <div className="px-8 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="upload-title" className="text-xl font-semibold">Upload Screenshot</h2>
              <p className="mt-1 text-sm text-muted-foreground">Let AI Inbox understand what you saved.</p>
            </div>
            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-muted" onClick={() => onOpenChange(false)} type="button" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
        </div>
        <ScreenshotUploader onAnalysisFailed={showAnalysisFailure} onCancel={() => onOpenChange(false)} onComplete={finishUpload} />
      </div>
    </div>
  );
}
