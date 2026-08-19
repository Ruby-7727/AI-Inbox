import { ArrowRight, CalendarDays, CheckSquare, Image as ImageIcon, MapPin, ShoppingBag, Sparkles, Upload } from "lucide-react";

import { UploadButton } from "@/components/actions/upload-button";

const examples = [
  { icon: ShoppingBag, label: "Product" },
  { icon: MapPin, label: "Restaurant" },
  { icon: CheckSquare, label: "Chat task" },
  { icon: CalendarDays, label: "Event" },
];

export function EmptyState() {
  return (
    <section className="mt-4 grid min-h-[620px] place-items-center rounded-[1.75rem] border border-[#e5d3c2] bg-card/75 px-6 text-center shadow-card">
      <div>
        <div className="flex items-center justify-center gap-5 text-primary">
          <Sparkles className="size-5 text-[#dba78e]" />
          <span className="grid size-20 rotate-[-2deg] place-items-center rounded-2xl border border-[#e3cbb8] bg-[#fffdf8] shadow-sm"><ImageIcon className="size-9" /></span>
          <ArrowRight className="size-8 text-[#aa9588]" />
          <span className="grid size-20 rotate-[2deg] place-items-center rounded-2xl border border-[#e3cbb8] bg-[#fffdf8] shadow-sm"><CheckSquare className="size-9" /></span>
        </div>
        <h2 className="mx-auto mt-10 max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-[#713b2b]">Collect ideas.<br />Save moments.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-muted-foreground">Turn screenshots into things you can use.</p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#826e62]">No screenshots yet. Upload your first screenshot and AI will organize it for you.</p>
        <UploadButton className="mt-8 min-w-72" />
        <p className="mt-4 text-sm text-muted-foreground">Or paste with ⌘V / Ctrl+V</p>
        <div className="mt-14 flex flex-wrap justify-center divide-x divide-[#e5d3c2]">
          {examples.map(({ icon: Icon, label }) => (
            <div key={label} className="w-36 px-5 text-sm">
              <Icon className="mx-auto size-7 text-primary" strokeWidth={1.7} />
              <p className="mt-3 font-medium">{label}</p>
            </div>
          ))}
        </div>
        <Upload className="sr-only" />
      </div>
    </section>
  );
}
