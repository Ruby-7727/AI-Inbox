import type { InboxItemInsert } from "@/types/database";

export type DemoInboxScenario = Omit<InboxItemInsert, "id" | "user_id" | "created_at" | "updated_at"> & {
  key: "shop" | "go" | "attend" | "do" | "remember";
};

export const DEMO_INBOX_SCENARIOS: readonly DemoInboxScenario[] = [
  {
    key: "attend",
    intent: "attend",
    title: "2026 广州超级草莓音乐节",
    summary: "广州超级草莓音乐节活动信息，包括时间、地点和活动安排。",
    confidence: 96,
    structured_data: {
      fields: [
        { key: "start_date", label: "Start date", value: "2026年9月25日" },
        { key: "end_date", label: "End date", value: "2026年9月27日" },
        { key: "venue", label: "Location", value: "长隆度假区音乐节广场" },
      ],
      actions: ["add_calendar"],
    },
  },
  {
    key: "do",
    intent: "do",
    title: "面试准备提醒",
    summary: "准备即将到来的产品运营面试。",
    confidence: 92,
    structured_data: {
      fields: [
        { key: "date", label: "Date", value: "2026年8月20日" },
        { key: "checklist", label: "Checklist", value: "✓ 了解公司背景 · ✓ 准备项目案例 · ✓ 整理面试问题" },
      ],
      actions: ["remind"],
    },
  },
  {
    key: "go",
    intent: "go",
    title: "北京意面封神榜",
    summary: "北京值得收藏的意面餐厅推荐。",
    confidence: 94,
    structured_data: {
      fields: [
        { key: "location", label: "Location", value: "北京" },
        { key: "places", label: "Places", value: "turbo · yum yummy · Papa Danilo" },
        { key: "content_type", label: "Content", value: "意面餐厅推荐" },
      ],
      actions: ["navigate", "research", "save"],
    },
  },
  {
    key: "shop",
    intent: "shop",
    title: "ELLE 行李箱",
    summary: "适合商务旅行使用的小型登机箱。",
    confidence: 91,
    structured_data: {
      fields: [
        { key: "product", label: "Product", value: "ELLE 行李箱" },
        { key: "description", label: "Description", value: "商务旅行小型登机箱" },
        { key: "price", label: "Price", value: "¥242.76 起" },
      ],
      actions: ["save", "research"],
    },
  },
  {
    key: "remember",
    intent: "remember",
    title: "女性书单 | 女孩保持阅读",
    summary: "收藏的女性成长与阅读书单。",
    confidence: 93,
    structured_data: {
      fields: [
        { key: "topic", label: "Topic", value: "女性成长与阅读" },
        { key: "books", label: "Books", value: "《岛屿书》 · 《离开的季节》 · 《熊从山那边来》 · 《四十个房间》" },
        { key: "content_type", label: "Content", value: "阅读书单" },
      ],
      actions: ["save", "research"],
    },
  },
];

export const isDemoModeEnabled = process.env.NEXT_PUBLIC_AI_INBOX_DEMO_MODE === "true";
