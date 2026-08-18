import type { ResearchResult, ResearchStructuredData, ResearchType } from "@/types/research";

export const ACTION_TYPES = ["calendar", "reminder", "map", "research", "compare"] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
export type ActionStatus = "available" | "completed" | "failed";

export interface AIAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  status: ActionStatus;
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
}

export type ActionExecutionResult = {
  success: boolean;
  title?: string;
  message: string;
  action: AIAction;
  researchResult?: ResearchResult;
};
