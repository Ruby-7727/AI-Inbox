"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { getDemoVisual } from "@/lib/demo/visuals";
import { getScreenshotPreviewUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import type { AnalysisIntent } from "@/types/analysis";
import type { Intent } from "@/types";

type ItemVisualProps = {
  imagePath?: string | null;
  intent: Intent | AnalysisIntent;
  title: string;
  variant?: "thumbnail" | "archive" | "collection" | "hero" | "saved";
  className?: string;
};

const visualStyles = {
  attend: { className: "from-[#dce8f5] to-[#edf3f8] text-[#5378a0]" },
  do: { className: "from-[#f7e5bd] to-[#fbf1db] text-[#b87927]" },
  go: { className: "from-[#e8ddf2] to-[#f3edf8] text-[#8260a5]" },
  shop: { className: "from-[#dfe8d5] to-[#eef2e8] text-[#607c48]" },
  remember: { className: "from-[#f4ddd2] to-[#faece4] text-[#b6654c]" },
  other: { className: "from-[#ebe2da] to-[#f5eee8] text-[#806f64]" },
};

const thumbnailPersonality = {
  attend: "sm:rotate-[1.25deg]",
  do: "",
  go: "sm:-rotate-[1deg]",
  shop: "sm:rotate-[0.75deg]",
  remember: "sm:-rotate-[0.75deg]",
  other: "",
};

export function ItemVisual({ imagePath, intent, title, variant = "thumbnail", className }: ItemVisualProps) {
  const demoVisual = getDemoVisual(title);
  const [source, setSource] = useState<string | undefined>(imagePath ? undefined : demoVisual);
  const normalizedIntent = intent.toLowerCase() as keyof typeof visualStyles;
  const style = visualStyles[normalizedIntent] ?? visualStyles.other;
  const rotation = variant === "thumbnail" || variant === "collection" ? (thumbnailPersonality[normalizedIntent] ?? "") : "";

  useEffect(() => {
    let active = true;
    if (!imagePath) {
      return () => { active = false; };
    }
    void getScreenshotPreviewUrl(imagePath)
      .then((url) => { if (active) setSource(url); })
      .catch(() => { if (active) setSource(undefined); });
    return () => { active = false; };
  }, [demoVisual, imagePath]);

  const sizes = variant === "hero"
    ? "h-64 w-full sm:h-80"
    : variant === "archive"
      ? "h-36 w-full md:w-52"
    : variant === "collection"
      ? "h-56 w-full sm:h-64"
    : variant === "saved"
      ? "h-44 w-full"
      : "h-28 w-full sm:w-40";

  if (!source) return null;

  return (
    <div className={cn("relative isolate shrink-0 overflow-hidden rounded-[1.15rem] border border-white/90 bg-gradient-to-br shadow-[0_10px_25px_rgb(104_68_45_/_0.13)]", style.className, sizes, rotation, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-40 blur-xl" src={source} />
      <span className="absolute inset-0 -z-10 bg-[#fffaf2]/18" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={`Preview for ${title}`} className="relative z-10 h-full w-full object-contain" onError={() => setSource(undefined)} src={source} />
      <span className="pointer-events-none absolute inset-2 rounded-xl border border-white/35" />
      {(variant === "thumbnail" || variant === "archive" || variant === "collection") ? <span className="pointer-events-none absolute -top-1 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[-2deg] bg-[#ead7bc]/80 shadow-sm" /> : null}
      {variant === "hero" ? <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-[#fffaf2]/90 px-3 py-1.5 text-xs font-medium text-[#6d5549] shadow-sm"><ImageIcon className="size-3.5" />Screenshot preview</span> : null}
    </div>
  );
}
