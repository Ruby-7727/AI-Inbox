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
  inboxItemId?: string | null;
}

export type ActionExecutionResult = {
  success: boolean;
  title?: string;
  message: string;
  action: AIAction;
};
