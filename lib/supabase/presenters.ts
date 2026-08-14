import type { LucideIcon } from "lucide-react";
import { Bell, Bookmark, CalendarDays, ChartNoAxesColumnIncreasing, MapPin, Search } from "lucide-react";

import { mapSuggestedActions } from "@/lib/actions/mapper";
import type { ActionType } from "@/lib/actions/types";
import type { InboxItem } from "@/types";
import type { InboxItemRow } from "@/types/database";

const actionIcons: Record<ActionType, LucideIcon> = {
  calendar: CalendarDays,
  reminder: Bell,
  map: MapPin,
  research: Search,
  compare: ChartNoAxesColumnIncreasing,
};

export function inboxRowToCard(item: InboxItemRow): InboxItem {
  const visibleFields = (item.structured_data.fields ?? []).filter((field) => field.value);
  const suggestions = item.structured_data.actions ?? [];
  const frameworkActions: InboxItem["actions"] = mapSuggestedActions(item.intent, suggestions).map((action) => ({
    label: action.title,
    icon: actionIcons[action.type],
    actionType: action.type,
    primary: action.type === "calendar",
  }));
  const supportsPersistentSave = (item.intent === "shop" || item.intent === "remember") && suggestions.includes("save");

  return {
    id: item.id,
    intent: intentLabel(item.intent),
    title: item.title,
    meta: visibleFields.slice(0, 2).map((field) => field.value).join("  ·  ") || item.summary || "Analyzed screenshot",
    detail: visibleFields[2]?.value ?? undefined,
    isNew: item.status === "new",
    actions: [
      ...(supportsPersistentSave ? [{ label: "Save", icon: Bookmark }] : []),
      ...frameworkActions,
    ],
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
