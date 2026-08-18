import type { LucideIcon } from "lucide-react";
import type { ActionType } from "@/lib/actions/types";
import type { ResearchStructuredData, ResearchType } from "@/types/research";

export type InboxItemKind = "event" | "product" | "place" | "task" | "knowledge";

export type AnalysisStatus = "idle" | "processing" | "needs-review" | "complete";

export type Intent = "Attend" | "Shop" | "Go" | "Do" | "Remember" | "Other";

export type ItemAction = {
  label: string;
  icon: LucideIcon;
  primary?: boolean;
  actionType?: ActionType;
  location?: string | null;
  reminderTitle?: string | null;
  reminderDescription?: string | null;
  reminderDate?: string | null;
  remindAt?: string | null;
  eventTitle?: string | null;
  eventDate?: string | null;
  endDate?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  isAllDay?: boolean | null;
  researchType?: ResearchType | null;
  sourceTitle?: string | null;
  sourceSummary?: string | null;
  structuredData?: ResearchStructuredData | null;
  inboxItemId?: string | null;
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
