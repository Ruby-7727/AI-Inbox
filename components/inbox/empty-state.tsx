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
    <section className="grid min-h-[680px] place-items-center text-center">
      <div>
        <div className="flex items-center justify-center gap-5 text-primary">
          <Sparkles className="size-5 text-blue-200" />
          <span className="grid size-20 place-items-center rounded-xl border border-blue-200 bg-white"><ImageIcon className="size-9" /></span>
          <ArrowRight className="size-8 text-slate-400" />
          <span className="grid size-20 place-items-center rounded-xl border border-blue-200 bg-white"><CheckSquare className="size-9" /></span>
        </div>
        <h2 className="mt-10 text-3xl font-semibold tracking-[-0.03em]">Your screenshots can do more.</h2>
        <p className="mx-auto mt-3 max-w-lg text-lg leading-7 text-muted-foreground">Drop a screenshot here and AI Inbox will understand what it is and suggest what to do next.</p>
        <UploadButton className="mt-8 min-w-72" />
        <p className="mt-4 text-sm text-muted-foreground">Or paste with ⌘V / Ctrl+V</p>
        <div className="mt-16 flex justify-center divide-x">
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
