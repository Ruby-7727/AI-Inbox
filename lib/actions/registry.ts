import type { AIAction, ActionType } from "@/lib/actions/types";

export type ActionIconIdentifier = "calendar-days" | "bell" | "map-pin" | "search" | "chart";

export type ActionDefinition = {
  id: string;
  title: string;
  description: string;
  icon: ActionIconIdentifier;
};

export const actionRegistry: Record<ActionType, ActionDefinition> = {
  calendar: {
    id: "calendar",
    title: "Add Calendar",
    description: "Create a calendar-ready event from the extracted details.",
    icon: "calendar-days",
  },
  reminder: {
    id: "reminder",
    title: "Remind Me",
    description: "Prepare a reminder from the extracted date and time.",
    icon: "bell",
  },
  map: {
    id: "map",
    title: "Open Map",
    description: "Open the extracted location in a map experience.",
    icon: "map-pin",
  },
  research: {
    id: "research",
    title: "Research",
    description: "Start researching the recognized subject.",
    icon: "search",
  },
  compare: {
    id: "compare",
    title: "Compare",
    description: "Prepare a comparison for the recognized product.",
    icon: "chart",
  },
};

const suggestionTypeMap: Record<string, ActionType | undefined> = {
  add_calendar: "calendar",
  schedule: "calendar",
  remind: "reminder",
  navigate: "map",
  research: "research",
  compare: "compare",
};

export function createAction(type: ActionType): AIAction {
  const definition = actionRegistry[type];
  return { ...definition, type, status: "available" };
}

export function resolveActionType(suggestionId: string) {
  return suggestionTypeMap[suggestionId];
}
