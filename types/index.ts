import type { LucideIcon } from "lucide-react";

export type InboxItemKind = "event" | "product" | "place" | "task" | "knowledge";

export type AnalysisStatus = "idle" | "processing" | "needs-review" | "complete";

export type Intent = "Attend" | "Shop" | "Go" | "Do" | "Remember" | "Other";

export type ItemAction = {
  label: string;
  icon: LucideIcon;
  primary?: boolean;
};

export type InboxItem = {
  id: string;
  intent: Intent;
  title: string;
  meta: string;
  detail?: string;
  isNew?: boolean;
  actions: ItemAction[];
};
