import type { AIAction, ActionExecutionResult } from "@/lib/actions/types";

const completionMessages: Record<AIAction["type"], string> = {
  calendar: "Calendar event created",
  reminder: "Reminder created",
  map: "Location opened",
  research: "Research started",
  compare: "Comparison ready",
};

export async function executeAction(action: AIAction): Promise<ActionExecutionResult> {
  await Promise.resolve();
  return {
    success: true,
    message: completionMessages[action.type],
    action: { ...action, status: "completed" },
  };
}
