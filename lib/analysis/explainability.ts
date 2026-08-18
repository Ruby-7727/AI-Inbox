import type { AnalysisField, AnalysisIntent } from "@/types/analysis";

type ExplanationInput = {
  intent: AnalysisIntent;
  title?: string | null;
  summary?: string | null;
  fields?: readonly AnalysisField[];
};

export function getDetectedSignals({ intent, title, summary, fields = [] }: ExplanationInput) {
  const descriptors = fields.map(({ key, label }) => `${key} ${label}`).join(" ").toLowerCase();
  const context = [title, summary, ...fields.map(({ value }) => value)]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .toLowerCase();
  const signals: string[] = [];
  const add = (condition: boolean, label: string) => {
    if (condition && !signals.includes(label)) signals.push(label);
  };

  if (intent === "shop") {
    add(matches(descriptors, ["product", "item", "商品", "产品"]), "Product information");
    add(matches(descriptors, ["price", "cost", "价格", "售价"]), "Price");
    add(matches(descriptors, ["brand", "maker", "品牌"]), "Brand");
    add(matches(descriptors, ["category", "type", "类别", "分类"]), "Product category");
  } else if (intent === "go") {
    add(matches(descriptors, ["location", "place", "address", "city", "venue", "地点", "地址", "城市"]), "Location information");
    add(matches(`${descriptors} ${context}`, ["recommend", "list", "推荐", "清单", "攻略", "合集"]), "Recommendation list");
    add(matches(context, ["trip", "travel", "itinerary", "route", "旅行", "行程", "路线", "探店"]), "Travel context");
  } else if (intent === "attend") {
    add(matches(descriptors, ["event", "activity", "concert", "festival", "活动", "演出", "音乐节"]), "Event information");
    add(matches(descriptors, ["date", "time", "start", "end", "日期", "时间"]), "Schedule details");
    add(matches(descriptors, ["location", "venue", "address", "地点", "场地", "地址"]), "Event location");
  } else if (intent === "do") {
    add(matches(descriptors, ["task", "todo", "action", "checklist", "任务", "待办", "清单"]), "Actionable task");
    add(matches(descriptors, ["deadline", "date", "time", "remind", "日期", "时间", "截止", "提醒"]), "Timing information");
    add(matches(descriptors, ["person", "owner", "assignee", "联系人", "负责人"]), "People involved");
  } else if (intent === "remember") {
    add(matches(`${descriptors} ${context}`, ["knowledge", "article", "topic", "information", "知识", "文章", "主题", "资料"]), "Knowledge content");
    add(matches(`${descriptors} ${context}`, ["book", "reading", "书单", "阅读", "书籍"]), "Reading list");
    add(matches(descriptors, ["recommend", "collection", "list", "推荐", "合集", "清单"]), "Curated information");
  }

  if (signals.length === 0) signals.push(defaultSignal(intent));
  return signals.slice(0, 3);
}

function matches(value: string, candidates: readonly string[]) {
  return candidates.some((candidate) => value.includes(candidate));
}

function defaultSignal(intent: AnalysisIntent) {
  if (intent === "shop") return "Product-focused content";
  if (intent === "go") return "Place-focused content";
  if (intent === "attend") return "Scheduled event content";
  if (intent === "do") return "Actionable content";
  if (intent === "remember") return "Information worth keeping";
  return "General screenshot content";
}
