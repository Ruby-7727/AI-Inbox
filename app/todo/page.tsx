import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin, Pencil, Search, SquareCheckBig } from "lucide-react";

import { UploadButton } from "@/components/actions/upload-button";
import { Header } from "@/components/layout/header";

export const metadata = { title: "To Do" };

export default function TodoPage() {
  return (
    <>
      <Header title="To Do" description="Tasks and upcoming events extracted from your screenshots." actions={<><label className="hidden h-12 w-56 items-center gap-3 rounded-lg border bg-white px-4 text-sm text-muted-foreground lg:flex"><Search className="size-5" /><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search to do..." /></label><UploadButton /></>} />

      <TodoSection title="Today">
        <TodoRow title="Pick up package" meta="Today  ·  Before 20:00" detail="Pickup code: 4-2-6831" />
        <TodoRow title="Send PPT to Amy" meta="Today  ·  18:00" />
      </TodoSection>

      <TodoSection title="Upcoming">
        <div className="flex min-h-34 items-center gap-7 px-7 py-6">
          <span className="grid size-16 place-items-center rounded-xl bg-blue-50 text-primary"><CalendarDays className="size-8" /></span>
          <div className="flex-1"><h3 className="text-xl font-semibold">Eason Chan Concert</h3><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="size-4" />Sep 18  ·  19:30</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />Shenzhen Bay Sports Center</p></div>
          <span className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Added to Calendar</span>
          <Link className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-slate-600" href="/inbox/eason-chan-concert">View <ExternalLink className="size-4" /></Link>
        </div>
      </TodoSection>

      <TodoSection title="Done">
        <div className="flex min-h-28 items-center gap-7 px-7 py-5 text-slate-400"><span className="grid size-16 place-items-center rounded-xl bg-slate-50"><SquareCheckBig className="size-8" /></span><div><h3 className="text-lg line-through">Submit ID Scan to HR</h3><p className="mt-2 text-sm">Done yesterday</p></div></div>
      </TodoSection>
    </>
  );
}

function TodoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><div className="mt-5 divide-y rounded-xl border bg-white shadow-card">{children}</div></section>;
}

function TodoRow({ title, meta, detail }: { title: string; meta: string; detail?: string }) {
  return <div className="flex min-h-32 items-center gap-7 px-7 py-5"><span className="grid size-16 place-items-center rounded-xl bg-blue-50 text-primary"><SquareCheckBig className="size-8" /></span><div className="flex-1"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="size-4" />{meta}</p>{detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}</div><button className="flex items-center gap-2 rounded-lg border px-5 py-3 text-sm text-slate-600" type="button"><SquareCheckBig className="size-4 text-primary" />Mark Done</button><button className="flex items-center gap-2 rounded-lg border px-5 py-3 text-sm text-slate-600" type="button"><Pencil className="size-4" />Edit Reminder</button></div>;
}
