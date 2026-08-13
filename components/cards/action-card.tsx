import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { ActionButton } from "@/components/actions/action-button";
import { IntentBadge } from "@/components/cards/intent-badge";
import type { InboxItem } from "@/types";

export function ActionCard({ item }: { item: InboxItem }) {
  return (
    <article className="flex min-h-34 items-center gap-7 rounded-xl border bg-white px-6 py-5 shadow-card">
      <IntentBadge intent={item.intent} compact />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <Link className="truncate text-xl font-semibold tracking-[-0.02em] hover:text-primary" href={`/inbox/${item.id}`}>{item.title}</Link>
          {item.isNew ? <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-primary">New</span> : null}
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          {item.intent === "Attend" || item.intent === "Do" ? <CalendarDays className="size-4" /> : null}
          {item.meta}
        </p>
        {item.detail ? (
          <p className="mt-2 flex items-center gap-2 truncate text-sm text-muted-foreground">
            {item.intent === "Attend" ? <MapPin className="size-4" /> : null}
            {item.detail}
          </p>
        ) : null}
      </div>
      <div className="hidden items-center gap-3 xl:flex">
        {item.actions.map((action) => <ActionButton key={action.label} {...action} />)}
      </div>
    </article>
  );
}
