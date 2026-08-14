export const ACTION_TYPES = ["calendar", "reminder", "map", "research", "compare"] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
export type ActionStatus = "available" | "completed" | "failed";

export interface AIAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  status: ActionStatus;
}

export type ActionExecutionResult = {
  success: boolean;
  message: string;
  action: AIAction;
};
