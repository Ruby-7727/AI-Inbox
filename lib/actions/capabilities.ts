import type { AIAction } from "@/lib/actions/types";

const userExecutableActionTypes = new Set<AIAction["type"]>(["calendar", "reminder", "map", "research"]);

export function isUserExecutableAction(action: AIAction) {
  return userExecutableActionTypes.has(action.type);
}
