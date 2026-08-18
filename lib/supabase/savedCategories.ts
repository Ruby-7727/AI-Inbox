import type { AnalysisIntent } from "@/types/analysis";
import type { SavedItemCategory } from "@/types/database";

export function savedCategoryForIntent(intent: AnalysisIntent): SavedItemCategory {
  if (intent === "shop") return "product";
  if (intent === "go") return "place";
  return "note";
}

export function normalizeSavedCategory(category: unknown): SavedItemCategory {
  return category === "product" || category === "place" || category === "note" ? category : "note";
}
