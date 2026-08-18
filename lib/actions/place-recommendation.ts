import type { AnalysisField } from "@/types/analysis";

type PlaceRecommendationContext = {
  title?: string | null;
  summary?: string | null;
  fields?: readonly AnalysisField[];
};

const recommendationSignals = [
  "recommendation",
  "recommended",
  "recommendations",
  "must visit",
  "must-visit",
  "travel guide",
  "food guide",
  "places to visit",
  "restaurant list",
  "coffee shop list",
  "cafe list",
  "attraction list",
  "best restaurants",
  "best cafes",
  "top restaurants",
  "top cafes",
  "favorite restaurants",
  "favourite restaurants",
  "推荐",
  "必去",
  "攻略",
  "清单",
  "探店",
  "打卡",
  "好去处",
  "餐厅合集",
  "咖啡店合集",
  "景点合集",
];

const recommendationFieldSignals = [
  "recommend",
  "restaurant_list",
  "cafe_list",
  "coffee_shop_list",
  "attraction_list",
  "sightseeing_list",
  "place_list",
  "destination_list",
  "poi_list",
  "推荐",
  "清单",
  "攻略",
  "合集",
];

/**
 * Separates content that recommends places from a plain destination or
 * navigation target. Generic location/address fields intentionally do not
 * count as recommendation evidence.
 */
export function isPlaceRecommendation({ title, summary, fields }: PlaceRecommendationContext) {
  const visibleText = [title, summary, ...(fields ?? []).map(({ value }) => value)]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .toLowerCase();
  if (recommendationSignals.some((signal) => visibleText.includes(signal))) return true;

  return (fields ?? []).some(({ key, label, value }) => {
    if (!value?.trim()) return false;
    const descriptor = `${key} ${label}`.trim().toLowerCase().replace(/[\s-]+/g, "_");
    return recommendationFieldSignals.some((signal) => descriptor.includes(signal));
  });
}
