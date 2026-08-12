import { Bookmark, Eye, Heart, Navigation, Search, SlidersHorizontal, Trash2 } from "lucide-react";

import { IntentBadge } from "@/components/cards/intent-badge";
import { Header } from "@/components/layout/header";

export const metadata = { title: "Saved" };

export default function SavedPage() {
  const items = [
    { intent: "Shop" as const, title: "Sony WH-1000XM6", meta: "¥2,999  ·  Sony  ·  Taobao", detail: "Wireless noise-canceling headphones, latest model.", accent: "text-green-700", status: "Saved", right: "Remove" },
    { intent: "Go" as const, title: "Tokyo Ramen", meta: "Shibuya, Tokyo  ·  ¥120/person", detail: "Recommended: Shoyu Ramen", accent: "text-violet-600", status: "Want to Go", right: "Navigate" },
    { intent: "Remember" as const, title: "AI Product Reading List", meta: "5 saved books", detail: "AI Product Management", accent: "text-primary", status: "Saved", right: "Remove" },
    { intent: "Remember" as const, title: "Go-to Market Framework", meta: "Framework  ·  Strategy", detail: "A practical GTM framework for B2B SaaS products.", accent: "text-amber-600", status: "Saved", right: "Remove" },
  ];

  return (
    <>
      <Header title="Saved" description="Products, places, and useful information you saved from screenshots." actions={
        <><label className="flex h-12 w-72 items-center gap-3 rounded-lg border bg-white px-4 text-sm text-muted-foreground"><Search className="size-5" /><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search saved items..." /></label><button className="grid size-12 place-items-center rounded-lg border bg-white" type="button"><SlidersHorizontal className="size-5" /></button></>
      } />
      <div className="mt-12 flex gap-10 border-b text-base text-slate-600">
        {['All', 'Products', 'Places', 'Knowledge'].map((tab, index) => <button key={tab} className={index === 0 ? "border-b-2 border-primary px-5 pb-5 font-medium text-primary" : "px-2 pb-5"} type="button">{tab}</button>)}
      </div>
      <section className="mt-7 grid gap-7 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="flex min-h-80 flex-col rounded-xl border bg-white p-7 shadow-card">
            <div className="flex gap-7"><IntentBadge intent={item.intent} /><div className="min-w-0"><h2 className="text-xl font-semibold">{item.title}</h2><p className="mt-4 text-slate-600">{item.meta}</p><p className="mt-2 max-w-sm leading-6 text-slate-600">{item.detail}</p><span className={`mt-7 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${item.accent}`}>{item.status === 'Want to Go' ? <Heart className="size-4" /> : <Bookmark className="size-4" />}{item.status}</span></div></div>
            <div className="mt-auto flex border-t pt-5 text-slate-600"><button className="flex flex-1 items-center justify-center gap-3" type="button"><Eye className="size-5" />View</button><span className="border-l" /><button className="flex flex-1 items-center justify-center gap-3" type="button">{item.right === 'Navigate' ? <Navigation className="size-5" /> : <Trash2 className="size-5" />}{item.right}</button></div>
          </article>
        ))}
      </section>
    </>
  );
}
