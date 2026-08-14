import { createAction, resolveActionType } from "@/lib/actions/registry";
import type { AIAction, ActionType } from "@/lib/actions/types";
import type { AnalysisAction, AnalysisIntent } from "@/types/analysis";

type IntentActionDefinition = {
  type: ActionType;
  title?: string;
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
): AIAction[] {
  const intentActions = intentActionMap[intent];
  if (intentActions) {
    return intentActions.map(({ type, title }) => ({
      ...createAction(type),
      id: `${intent}-${type}`,
      ...(title ? { title } : {}),
    }));
  }

  const actionTypes = suggestions
    .map(resolveActionType)
    .filter((type): type is ActionType => Boolean(type));

  return [...new Set(actionTypes)].map(createAction);
}
