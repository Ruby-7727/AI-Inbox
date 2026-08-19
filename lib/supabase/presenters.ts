import type { LucideIcon } from "lucide-react";
import { Bell, Bookmark, CalendarDays, ChartNoAxesColumnIncreasing, MapPin, Search } from "lucide-react";

import { mapSuggestedActions } from "@/lib/actions/mapper";
import { isPlaceRecommendation } from "@/lib/actions/place-recommendation";
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
  const frameworkActions: InboxItem["actions"] = mapSuggestedActions(item.intent, suggestions, {
    fields: item.structured_data.fields,
    locationFallback: item.title,
    itemTitle: item.title,
    itemDescription: item.summary,
    inboxItemId: item.id,
  }).map((action) => ({
    label: action.title,
    icon: actionIcons[action.type],
    actionType: action.type,
    location: action.location,
    reminderTitle: action.reminderTitle,
    reminderDescription: action.reminderDescription,
    reminderDate: action.reminderDate,
    remindAt: action.remindAt,
    eventTitle: action.eventTitle,
    eventDate: action.eventDate,
    endDate: action.endDate,
    startAt: action.startAt,
    endAt: action.endAt,
    isAllDay: action.isAllDay,
    researchType: action.researchType,
    sourceTitle: action.sourceTitle,
    sourceSummary: action.sourceSummary,
    structuredData: action.structuredData,
    inboxItemId: action.inboxItemId,
    primary: action.type === "calendar",
  }));
  const supportsPersistentSave = item.intent === "shop" || item.intent === "remember";
  const supportsPlaceSave = item.intent === "go" && isPlaceRecommendation({
    title: item.title,
    summary: item.summary,
    fields: item.structured_data.fields,
  });

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
      ...(supportsPlaceSave ? [{ label: "Save Place", icon: Bookmark }] : []),
    ],
    imagePath: item.image_path,
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
