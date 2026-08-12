import { Bookmark, Clock3, MoreHorizontal, Search, ShoppingBag } from "lucide-react";

import { Header } from "@/components/layout/header";

export const metadata = { title: "Search" };

export default function SearchPage() {
  const results = [
    { title: "Sony WH-1000XM6", price: "¥2,999", saved: "Saved 6 days ago" },
    { title: "Bose QuietComfort Ultra", price: "¥3,199", saved: "Saved 8 days ago" },
  ];

  return (
    <>
      <Header title="Search" description="Find information by what it means, not by where it came from." />
      <label className="mt-10 flex h-18 items-center gap-5 rounded-xl border border-primary/70 bg-white px-6 shadow-[0_8px_25px_rgb(18_104_243_/_0.07)]">
        <Search className="size-7 text-slate-600" />
        <input className="min-w-0 flex-1 bg-transparent text-xl outline-none" defaultValue="the headphones from last week" />
        <kbd className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-600">⌘K</kbd>
      </label>
      <div className="mt-7 flex flex-wrap gap-4">
        {["the restaurant I saved in Guangzhou", "the headphones from last week", "my September concert"].map((suggestion) => <button key={suggestion} className="flex items-center gap-3 rounded-lg border bg-white px-5 py-3 text-sm text-slate-600" type="button"><Search className="size-4" />{suggestion}</button>)}
      </div>
      <section className="mt-14"><h2 className="text-xl font-semibold">2 results</h2><div className="mt-5 space-y-4">{results.map((result) => <article key={result.title} className="flex min-h-40 items-center gap-8 rounded-xl border bg-white px-6 py-5 shadow-card"><span className="grid size-28 place-items-center rounded-xl bg-green-50 text-green-700"><span className="text-center"><ShoppingBag className="mx-auto size-9" /><span className="mt-2 block font-medium">Shop</span></span></span><div className="flex-1"><h3 className="text-xl font-semibold">{result.title}</h3><p className="mt-2 text-slate-600">{result.price}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Clock3 className="size-4" />{result.saved}</p></div><button className="grid size-11 place-items-center rounded-lg border" type="button" aria-label="Save"><Bookmark className="size-5" /></button><button className="grid size-11 place-items-center rounded-lg border" type="button" aria-label="More"><MoreHorizontal className="size-5" /></button></article>)}</div></section>
    </>
  );
}
