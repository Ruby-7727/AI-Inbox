import type { AnalysisIntent } from "@/types/analysis";

export const LOW_CONFIDENCE_THRESHOLD = 60;

const candidateIntents = ["remember", "shop", "go", "attend", "do"] as const;

export type IntentPossibilities = {
  mostLikely: AnalysisIntent;
  alternatives: Array<(typeof candidateIntents)[number]>;
};

/** The provider supplies one primary intent, so alternatives are labels only. */
export function buildIntentPossibilities(primaryIntent: AnalysisIntent): IntentPossibilities {
  return {
    mostLikely: primaryIntent,
    alternatives: candidateIntents.filter((intent) => intent !== primaryIntent).slice(0, 3),
  };
}
