"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Circle, Clipboard, FileImage, LoaderCircle, RefreshCw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createInboxItem } from "@/lib/supabase/inboxItems";
import type { AnalyzeApiResponse } from "@/types/analysis";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const analysisStages = ["Understanding content", "Detecting user intent", "Preparing actions"];

export function ScreenshotUploader({ onAnalysisFailed, onCancel, onComplete }: { onAnalysisFailed: () => void; onCancel: () => void; onComplete: (result: AnalyzeApiResponse) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeStage = progress === 100 ? analysisStages.length : progress < 35 ? 0 : progress < 70 ? 1 : 2;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const pastedFile = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith("image/"));
      if (pastedFile) selectFile(pastedFile);
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  });

  function selectFile(nextFile?: File) {
    setError(null);
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Unsupported file type. Choose a PNG, JPG, or WEBP image.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError("Image is too large. The maximum file size is 10 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setProgress(0);
  }

  function resetFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function confirmUpload() {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    setProgress(8);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.max(3, Math.round((90 - current) / 5)), 90));
    }, 140);

    let analysisCompleted = false;
    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const payload = (await response.json()) as AnalyzeApiResponse | { error?: string };
      if (!response.ok) {
        window.clearInterval(progressTimer);
        sessionStorage.removeItem("ai-inbox:analysis");
        sessionStorage.setItem("ai-inbox:analysis-error", "true");
        onAnalysisFailed();
        return;
      }
      analysisCompleted = true;
      const analyzed = payload as AnalyzeApiResponse;
      const item = await createInboxItem(file, analyzed.result);
      const persistedPayload: AnalyzeApiResponse = { ...analyzed, id: item.id, imagePath: item.image_path };
      window.clearInterval(progressTimer);
      setProgress(100);
      sessionStorage.removeItem("ai-inbox:analysis-error");
      sessionStorage.setItem("ai-inbox:analysis", JSON.stringify(persistedPayload));
      window.setTimeout(() => onComplete(persistedPayload), 350);
    } catch (uploadError) {
      window.clearInterval(progressTimer);
      if (!analysisCompleted) {
        sessionStorage.removeItem("ai-inbox:analysis");
        sessionStorage.setItem("ai-inbox:analysis-error", "true");
        onAnalysisFailed();
        return;
      }
      setUploading(false);
      setProgress(0);
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    }
  }

  return (
    <>
      <div className="p-8 pb-6">
        {!file || !previewUrl ? (
          <button
            className={cn(
              "grid h-64 w-full place-items-center rounded-2xl border border-dashed border-primary/55 bg-[#fffdf8] text-center transition-colors hover:bg-[#f8ebe1]",
              dragging && "border-primary bg-[#f6e4d8]",
            )}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}
            type="button"
          >
            <span>
              <Upload className="mx-auto size-12 text-primary" strokeWidth={1.8} />
              <strong className="mt-4 block text-lg font-semibold">Drop screenshot here</strong>
              <span className="mt-1 block text-muted-foreground">or click to upload</span>
              <span className="mt-6 block text-sm text-[#9a887d]">PNG, JPG, WEBP · Max 10 MB</span>
            </span>
          </button>
        ) : (
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#e2cfbd] bg-[#f7eee5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="h-52 w-full object-contain" src={previewUrl} alt={`Preview of ${file.name}`} />
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#e2cfbd] bg-[#fffdf8] px-4 py-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#f3dfd2] text-primary"><FileImage className="size-5" /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="mt-1 text-xs text-muted-foreground">{formatFileSize(file.size)} · Ready to upload</p></div>
              {!uploading ? <button className="flex items-center gap-2 text-sm font-medium text-primary" onClick={resetFile} type="button"><RefreshCw className="size-4" />Change</button> : null}
            </div>
            {uploading ? (
              <div className="mt-5" aria-live="polite">
                <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium"><LoaderCircle className="size-4 animate-spin text-primary" />Analyzing screenshot...</span><span className="text-muted-foreground">{progress}%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ead8ca]"><div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
                <ol className="mt-4 grid gap-2 rounded-xl bg-[#f8eee5] px-4 py-3">
                  {analysisStages.map((stage, index) => {
                    const done = index < activeStage;
                    const active = index === activeStage;
                    return <li className={active ? "flex items-center gap-2 text-sm font-medium text-slate-900" : "flex items-center gap-2 text-sm text-muted-foreground"} key={stage}>{done ? <Check className="size-4 text-green-600" /> : active ? <LoaderCircle className="size-4 animate-spin text-primary" /> : <Circle className="size-4" />}{stage}</li>;
                  })}
                </ol>
              </div>
            ) : null}
          </div>
        )}

        <input ref={inputRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectFile(event.target.files?.[0])} />
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p> : null}
        {!file ? <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#e2cfbd] bg-[#fffdf8] px-4 py-3 text-sm text-muted-foreground"><Clipboard className="size-4 text-primary" />You can also paste a screenshot with ⌘V / Ctrl+V</div> : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-[#e5d3c2] bg-[#faf0e7] p-5">
        <Button variant="outline" onClick={onCancel} disabled={uploading} type="button">Cancel</Button>
        {file ? <Button className="min-w-36" onClick={confirmUpload} disabled={uploading} type="button">{uploading ? <><LoaderCircle className="size-4 animate-spin" />Analyzing</> : "Confirm Upload"}</Button> : null}
      </div>
    </>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
