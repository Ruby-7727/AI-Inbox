import {
  Bell,
  Bookmark,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Heart,
  ListPlus,
  Map,
  Navigation,
  Search,
  Sparkles,
  SquareCheckBig,
  Tag,
} from "lucide-react";

import type { InboxItem } from "@/types";

export const inboxItems: InboxItem[] = [
  {
    id: "eason-chan-concert",
    intent: "Attend",
    title: "Eason Chan Concert",
    meta: "Sep 18  ·  19:30",
    detail: "Shenzhen Bay Sports Center",
    isNew: true,
    actions: [
      { label: "Add Calendar", icon: CalendarDays, primary: true, actionType: "calendar" },
      { label: "Remind Me", icon: Bell, actionType: "reminder" },
      { label: "Open Map", icon: Map, actionType: "map" },
    ],
  },
  {
    id: "sony-wh-1000xm6",
    intent: "Shop",
    title: "Sony WH-1000XM6",
    meta: "¥2,999  ·  Sony  ·  Taobao",
    detail: "Wireless noise-canceling headphones, latest model.",
    actions: [
      { label: "Save", icon: Bookmark },
      { label: "Compare", icon: ChartNoAxesColumnIncreasing, actionType: "compare" },
      { label: "Research", icon: Search, actionType: "research" },
    ],
  },
  {
    id: "tokyo-ramen",
    intent: "Go",
    title: "Tokyo Ramen",
    meta: "Tokyo  ·  Shibuya  ·  ¥120/person",
    detail: "Recommended: Shoyu Ramen",
    actions: [
      { label: "Want to Go", icon: Heart },
      { label: "Navigate", icon: Navigation, actionType: "map" },
      { label: "Add to Plan", icon: ListPlus },
    ],
  },
  {
    id: "send-ppt-to-amy",
    intent: "Do",
    title: "Send PPT to Amy",
    meta: "Tomorrow  ·  Due 18:00",
    actions: [
      { label: "Create Task", icon: SquareCheckBig, primary: true },
      { label: "Remind Me", icon: Bell, actionType: "reminder" },
      { label: "Schedule", icon: CalendarDays, actionType: "calendar" },
    ],
  },
  {
    id: "ai-product-reading-list",
    intent: "Remember",
    title: "AI Product Reading List",
    meta: "5 books  ·  Topic: AI Product Management",
    actions: [
      { label: "Save", icon: Bookmark },
      { label: "Summarize", icon: Sparkles },
      { label: "Tag", icon: Tag },
    ],
  },
];
