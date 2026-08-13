import { Bell, Bookmark, CalendarDays, ChartNoAxesColumnIncreasing, Heart, ListPlus, Navigation, Search, Sparkles, SquareCheckBig, Tag } from "lucide-react";

import type { InboxItem } from "@/types";
import type { AnalysisAction } from "@/types/analysis";
import type { InboxItemRow } from "@/types/database";

const actionPresentation: Record<AnalysisAction, InboxItem["actions"][number]> = {
  save: { label: "Save", icon: Bookmark },
  compare: { label: "Compare", icon: ChartNoAxesColumnIncreasing },
  research: { label: "Research", icon: Search },
  want_to_go: { label: "Want to Go", icon: Heart },
  navigate: { label: "Navigate", icon: Navigation },
  add_to_plan: { label: "Add to Plan", icon: ListPlus },
  create_task: { label: "Create Task", icon: SquareCheckBig, primary: true },
  remind: { label: "Remind Me", icon: Bell },
  schedule: { label: "Schedule", icon: CalendarDays },
  add_calendar: { label: "Add Calendar", icon: CalendarDays, primary: true },
  summarize: { label: "Summarize", icon: Sparkles },
  tag: { label: "Tag", icon: Tag },
};

export function inboxRowToCard(item: InboxItemRow): InboxItem {
  const visibleFields = (item.structured_data.fields ?? []).filter((field) => field.value);
  return {
    id: item.id,
    intent: intentLabel(item.intent),
    title: item.title,
    meta: visibleFields.slice(0, 2).map((field) => field.value).join("  ·  ") || item.summary || "Analyzed screenshot",
    detail: visibleFields[2]?.value ?? undefined,
    isNew: item.status === "new",
    actions: (item.structured_data.actions ?? []).map((action) => actionPresentation[action]),
  };
}

function intentLabel(intent: InboxItemRow["intent"]): InboxItem["intent"] {
  if (intent === "shop") return "Shop";
  if (intent === "go") return "Go";
  if (intent === "do") return "Do";
  if (intent === "attend") return "Attend";
  if (intent === "remember") return "Remember";
  return "Other";
}
