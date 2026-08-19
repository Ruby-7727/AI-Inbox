import { TrendingUp } from "lucide-react";

export function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dfd0c2] bg-[#fffdf8] px-4 text-sm text-[#6d5b51]">
      <TrendingUp className="size-4" aria-hidden="true" />
      {value}% confidence
    </span>
  );
}
