"use client";

import { Upload } from "lucide-react";

import { useUpload } from "@/components/actions/upload-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { openUpload } = useUpload();

  return (
    <Button className={cn("h-12 text-base", className)} onClick={openUpload} type="button">
      <Upload className="size-5" aria-hidden="true" />
      {compact ? "Upload" : "Upload Screenshot"}
    </Button>
  );
}
