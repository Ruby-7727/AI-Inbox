import { Search, SlidersHorizontal } from "lucide-react";

import { Header } from "@/components/layout/header";
import { SavedContent } from "@/components/saved/saved-content";

export const metadata = { title: "Saved" };

export default function SavedPage() {
  return (
    <>
      <Header title="Saved" description="Products, places, and useful information you saved from screenshots." actions={
        <><label className="flex h-12 w-72 items-center gap-3 rounded-lg border bg-white px-4 text-sm text-muted-foreground"><Search className="size-5" /><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search saved items..." /></label><button className="grid size-12 place-items-center rounded-lg border bg-white" type="button"><SlidersHorizontal className="size-5" /></button></>
      } />
      <div className="mt-12 flex gap-10 border-b text-base text-slate-600">
        {["All", "Products", "Places", "Knowledge"].map((tab, index) => <button key={tab} className={index === 0 ? "border-b-2 border-primary px-5 pb-5 font-medium text-primary" : "px-2 pb-5"} type="button">{tab}</button>)}
      </div>
      <SavedContent />
    </>
  );
}
