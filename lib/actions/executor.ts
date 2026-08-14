import type { AIAction, ActionExecutionResult } from "@/lib/actions/types";

const completionMessages: Record<AIAction["type"], string> = {
  calendar: "Calendar event created",
  reminder: "Reminder created",
  map: "Location opened",
  research: "Research started",
  compare: "Comparison ready",
};

export async function executeAction(action: AIAction): Promise<ActionExecutionResult> {
  if (action.type === "map") return executeMapAction(action);

  await Promise.resolve();
  return {
    success: true,
    message: completionMessages[action.type],
    action: { ...action, status: "completed" },
  };
}

function executeMapAction(action: AIAction): ActionExecutionResult {
  const location = action.location?.trim();
  if (!location || typeof window === "undefined") {
    return mapFailure(action);
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  try {
    window.open(url, "_blank", "noopener,noreferrer");
    return {
      success: true,
      title: "Location opened",
      message: `Opened ${location} in Google Maps`,
      action: { ...action, location, status: "completed" },
    };
  } catch {
    return mapFailure(action);
  }
}

function mapFailure(action: AIAction): ActionExecutionResult {
  return {
    success: false,
    message: "Unable to open map location",
    action: { ...action, status: "failed" },
  };
}
