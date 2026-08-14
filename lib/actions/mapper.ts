import { createAction, resolveActionType } from "@/lib/actions/registry";
import type { AIAction, ActionType } from "@/lib/actions/types";
import type { AnalysisAction, AnalysisField, AnalysisIntent } from "@/types/analysis";

type IntentActionDefinition = {
  type: ActionType;
  title?: string;
};

type ActionMappingContext = {
  fields?: readonly AnalysisField[];
  locationFallback?: string | null;
};

const intentActionMap: Partial<Record<AnalysisIntent, readonly IntentActionDefinition[]>> = {
  go: [
    { type: "map" },
    { type: "research", title: "Research Trip" },
  ],
  attend: [{ type: "calendar" }],
  remember: [{ type: "reminder" }],
  shop: [
    { type: "compare" },
    { type: "research", title: "Research Product" },
  ],
  do: [{ type: "reminder" }],
};

/**
 * Normalizes provider suggestions into the small set of actions the product can
 * currently execute. Intent owns the product recommendation; provider labels
 * are only used as a safe fallback for the `other` intent.
 */
export function mapSuggestedActions(
  intent: AnalysisIntent,
  suggestions: readonly AnalysisAction[],
  context: ActionMappingContext = {},
): AIAction[] {
  const intentActions = intentActionMap[intent];
  if (intentActions) {
    return intentActions.map(({ type, title }) => withMapLocation(
      {
        ...createAction(type),
        id: `${intent}-${type}`,
        ...(title ? { title } : {}),
      },
      context,
    ));
  }

  const actionTypes = suggestions
    .map(resolveActionType)
    .filter((type): type is ActionType => Boolean(type));

  return [...new Set(actionTypes)].map((type) => withMapLocation(createAction(type), context));
}

function withMapLocation(action: AIAction, context: ActionMappingContext): AIAction {
  if (action.type !== "map") return action;
  return { ...action, location: findLocation(context.fields) ?? cleanValue(context.locationFallback) };
}

function findLocation(fields: readonly AnalysisField[] | undefined) {
  const locationKeys = ["address", "location", "venue", "place", "destination", "restaurant", "city"];
  const field = fields?.find(({ key, label, value }) => {
    if (!cleanValue(value)) return false;
    const descriptor = `${key} ${label}`.toLowerCase();
    return locationKeys.some((locationKey) => descriptor.includes(locationKey));
  });
  return cleanValue(field?.value);
}

function cleanValue(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}
