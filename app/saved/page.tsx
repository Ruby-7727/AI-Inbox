import { Search, SlidersHorizontal } from "lucide-react";

import { Header } from "@/components/layout/header";
import { SavedContent } from "@/components/saved/saved-content";

export const metadata = { title: "Saved" };

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <Header title="Saved" description="Your personal archive of products, places, and ideas worth keeping." actions={
        <><label className="flex h-12 w-72 items-center gap-3 rounded-xl border border-[#dec9b6] bg-[#fffdf8] px-4 text-sm text-muted-foreground"><Search className="size-5" /><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search saved items..." /></label><button className="grid size-12 place-items-center rounded-xl border border-[#dec9b6] bg-[#fffdf8]" type="button"><SlidersHorizontal className="size-5" /></button></>
      } />
      <SavedContent />
    </div>
  );
}
