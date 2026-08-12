import { TrendingUp } from "lucide-react";

export function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm text-slate-600">
      <TrendingUp className="size-4" aria-hidden="true" />
      {value}% confidence
    </span>
  );
}
