import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Clock3,
  Image as ImageIcon,
  Map,
  MapPin,
  Navigation,
  Pencil,
  Sparkles,
  SquareCheckBig,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { ActionButton } from "@/components/actions/action-button";
import { ConfidenceBadge } from "@/components/cards/confidence-badge";
import { PersistedItemDetail } from "@/components/inbox/persisted-item-detail";

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "send-ppt-to-amy") return <LowConfidenceDetail />;
  if (id === "eason-chan-concert") return <EventDetail />;
  return <PersistedItemDetail id={id} />;
}

function EventDetail() {
  return (
    <div>
      <Link className="inline-flex items-center gap-3 text-slate-600 hover:text-primary" href="/inbox"><ArrowLeft className="size-5" />Back</Link>
      <div className="mt-8 flex items-center justify-between"><span className="inline-flex h-11 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/40 px-4 font-medium text-primary"><CalendarDays className="size-5" />Attend</span><ConfidenceBadge value={94} /></div>
      <section className="mt-5 rounded-xl border bg-white p-7 shadow-card">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Eason Chan Concert</h1>
        <p className="mt-2 text-slate-600">A concert event recognized from your screenshot.</p>
        <div className="mt-6 grid grid-cols-2 rounded-xl border px-5">
          <DetailCell icon={CalendarDays} label="Date" value="Sep 18, 2026" />
          <DetailCell icon={Clock3} label="Time" value="19:30" borderLeft />
          <DetailCell icon={MapPin} label="Venue" value="Shenzhen Bay Sports Center" borderTop />
          <DetailCell icon={Map} label="Address" value="Shenzhen, Guangdong" borderLeft borderTop />
        </div>
        <div className="mt-5 flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50/60 px-5 py-4 text-sm"><TriangleAlert className="size-5 text-amber-500" />Exact address not detected. Please review this information.</div>
        <h2 className="mt-7 text-lg font-semibold">Suggested actions</h2>
        <div className="mt-4 grid grid-cols-3 gap-5"><ActionButton actionType="calendar" className="w-full" icon={CalendarDays} label="Add Calendar" primary /><ActionButton actionType="reminder" className="w-full" icon={Bell} label="Remind Me" /><ActionButton actionType="map" className="w-full" icon={Navigation} label="Open Map" location="Shenzhen Bay Sports Center" /></div>
      </section>
      <section className="mt-6 overflow-hidden rounded-xl border bg-white shadow-card"><div className="flex gap-5 border-b border-blue-200 bg-blue-50/35 px-7 py-5"><Sparkles className="size-6 text-primary" /><div><h2 className="font-semibold">AI found</h2><p className="mt-2 text-sm text-slate-600">This appears to be a concert in Shenzhen on September 18 at 19:30.</p></div></div><div className="flex items-center gap-5 px-7 py-5"><ImageIcon className="size-6" /><span className="font-medium">Original Screenshot</span><div className="ml-auto flex h-16 w-48 items-center gap-3 rounded-lg border p-2"><span className="h-12 w-8 rounded bg-slate-900" /><span className="text-xs"><strong className="block">Eason Chan Concert</strong><span className="text-slate-500">Sep 18 · 19:30</span></span></div></div></section>
      <section className="mt-6 flex items-center rounded-xl border bg-white px-7 py-5 shadow-card"><p className="font-medium">Did AI get this right?</p><div className="ml-auto flex gap-3"><ActionButton icon={ThumbsUp} label="Yes" /><ActionButton icon={Pencil} label="Edit" /><ActionButton icon={ThumbsDown} label="Incorrect" /></div></section>
    </div>
  );
}

function LowConfidenceDetail() {
  return <div><Link className="inline-flex items-center gap-3 text-primary" href="/inbox"><ArrowLeft className="size-5" />Back to Inbox</Link><div className="mt-9 flex gap-6"><span className="inline-flex h-13 items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 text-lg text-amber-600"><SquareCheckBig className="size-6" />Do</span><ConfidenceBadge value={68} /></div><section className="mt-6 rounded-xl border bg-white p-10 shadow-card"><h1 className="text-4xl font-semibold tracking-[-0.04em]">Send PPT to Amy</h1><p className="mt-3 text-lg text-slate-600">A task recognized from your screenshot.</p><hr className="my-7" /><h2 className="text-xl font-semibold">Extracted information</h2><div className="mt-5 grid grid-cols-[64px_170px_1fr] items-center gap-y-5"><span className="grid size-14 place-items-center rounded-xl bg-blue-50 text-primary"><CalendarDays /></span><strong>Deadline</strong><span className="text-slate-600">Tomorrow afternoon</span><span className="grid size-14 place-items-center rounded-xl bg-blue-50 text-primary"><UserRound /></span><strong>Person</strong><span className="text-slate-600">Amy</span></div><div className="mt-7 rounded-xl border border-amber-200 bg-amber-50/60 p-6"><div className="flex items-center gap-5"><TriangleAlert className="size-8 shrink-0 text-amber-500" /><p className="text-lg font-medium">Exact time not specified. Please confirm the time before creating a reminder.</p></div><div className="mt-5 flex gap-4"><div className="flex h-14 flex-1 items-center gap-4 rounded-lg border bg-white px-5"><Clock3 className="size-5" />14:00</div><button className="rounded-lg bg-primary px-9 font-medium text-white" type="button">Confirm</button></div></div></section><h2 className="mt-7 text-2xl font-semibold">Suggested actions</h2><section className="mt-4 flex gap-7 rounded-xl border bg-white p-7 shadow-card"><ActionButton className="min-w-52" icon={Check} label="Create Task" primary /><ActionButton actionType="reminder" className="min-w-52" icon={Bell} label="Remind Me" /><ActionButton actionType="calendar" className="min-w-52" icon={CalendarDays} label="Schedule" /></section></div>;
}

function DetailCell({ icon: Icon, label, value, borderLeft, borderTop }: { icon: typeof CalendarDays; label: string; value: string; borderLeft?: boolean; borderTop?: boolean }) {
  return <div className={`flex gap-4 py-5 ${borderLeft ? 'border-l pl-6' : ''} ${borderTop ? 'border-t' : ''}`}><Icon className="size-5 text-slate-600" /><div><p className="text-sm text-slate-600">{label}</p><p className="mt-2 font-medium">{value}</p></div></div>;
}
