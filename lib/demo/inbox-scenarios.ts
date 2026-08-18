import type { InboxItemInsert } from "@/types/database";

export type DemoInboxScenario = Omit<InboxItemInsert, "id" | "user_id" | "created_at" | "updated_at"> & {
  key: "shop" | "go" | "attend" | "do" | "remember";
};

export const DEMO_INBOX_SCENARIOS: readonly DemoInboxScenario[] = [
  {
    key: "shop",
    intent: "shop",
    title: "ChangYuan 毛毯照片墙",
    summary: "一款适合作为照片墙背景的装饰毛毯产品推荐。",
    confidence: 91,
    structured_data: {
      fields: [
        { key: "product", label: "Product", value: "ChangYuan 毛毯照片墙" },
        { key: "category", label: "Category", value: "家居装饰" },
        { key: "use_case", label: "Use", value: "照片墙背景" },
      ],
      actions: ["save", "research"],
    },
  },
  {
    key: "go",
    intent: "go",
    title: "北京咖啡地图",
    summary: "一份小红书风格的北京咖啡店推荐清单，适合安排探店路线。",
    confidence: 94,
    structured_data: {
      fields: [
        { key: "location", label: "Location", value: "北京" },
        { key: "recommended_cafes", label: "Recommended cafés", value: "胡同咖啡、亮马桥咖啡、国贸咖啡" },
        { key: "content_type", label: "Content", value: "咖啡店推荐清单" },
      ],
      actions: ["navigate", "research", "save"],
    },
  },
  {
    key: "attend",
    intent: "attend",
    title: "2026 广州超级草莓音乐节",
    summary: "2026 年 9 月 25 日至 27 日在南沙音乐秀场举行的音乐节。",
    confidence: 96,
    structured_data: {
      fields: [
        { key: "start_date", label: "Start date", value: "9月25日" },
        { key: "end_date", label: "End date", value: "9月27日" },
        { key: "venue", label: "Venue", value: "南沙音乐秀场" },
      ],
      actions: ["add_calendar"],
    },
  },
  {
    key: "do",
    intent: "do",
    title: "面试准备提醒",
    summary: "在面试前完成岗位研究、案例复盘和自我介绍练习。",
    confidence: 92,
    structured_data: {
      fields: [
        { key: "task", label: "Task", value: "准备面试" },
        { key: "remind_at", label: "Reminder time", value: "2026-08-20T09:00:00+08:00" },
        { key: "checklist", label: "Checklist", value: "岗位研究、案例复盘、自我介绍" },
      ],
      actions: ["remind"],
    },
  },
  {
    key: "remember",
    intent: "remember",
    title: "女性文学书单",
    summary: "一份值得保存和进一步研究的女性文学阅读清单。",
    confidence: 93,
    structured_data: {
      fields: [
        { key: "topic", label: "Topic", value: "女性文学" },
        { key: "books", label: "Books", value: "《房思琪的初恋乐园》《使女的故事》《第二性》" },
        { key: "content_type", label: "Content", value: "阅读书单" },
      ],
      actions: ["save", "summarize"],
    },
  },
];

export const isDemoModeEnabled = process.env.NEXT_PUBLIC_AI_INBOX_DEMO_MODE === "true";
