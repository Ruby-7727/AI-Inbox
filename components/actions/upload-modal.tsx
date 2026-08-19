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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#4a3329]/28 p-5 backdrop-blur-[4px]" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <button className="absolute inset-0 cursor-default" aria-label="Close upload dialog" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-[530px] overflow-hidden rounded-[1.75rem] border border-[#dfc8b4] bg-[#fffaf3] shadow-[0_28px_90px_rgb(74_51_41_/_0.24)]">
        <div className="px-8 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="upload-title" className="font-display text-3xl font-semibold text-[#713b2b]">Upload Screenshot</h2>
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
