const demoVisuals: Record<string, string> = {
  "ChangYuan 毛毯照片墙": "/demo/shop-photo-wall.svg",
  "北京咖啡地图": "/demo/go-coffee-map.svg",
  "2026 广州超级草莓音乐节": "/demo/attend-festival.svg",
  "面试准备提醒": "/demo/do-interview.svg",
  "女性文学书单": "/demo/remember-books.svg",
};

export function getDemoVisual(title: string) {
  return demoVisuals[title];
}

type VisualIntent = "Attend" | "Shop" | "Go" | "Do" | "Remember" | "Other" | "attend" | "shop" | "go" | "do" | "remember" | "other";

export function shouldShowItemVisual({
  imagePath,
  intent,
  title,
  supportingText = "",
}: {
  imagePath?: string | null;
  intent: VisualIntent;
  title: string;
  supportingText?: string | null;
}) {
  const hasVisualSource = Boolean(imagePath || getDemoVisual(title));
  if (!hasVisualSource) return false;

  const normalizedIntent = intent.toLowerCase();
  if (normalizedIntent === "attend" || normalizedIntent === "go" || normalizedIntent === "shop") return true;
  if (normalizedIntent !== "remember") return false;

  const context = `${title} ${supportingText}`.toLowerCase();
  return /(book|books|reading|cover|article|magazine|书|书单|阅读|封面|文章|杂志)/i.test(context);
}
