import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { ActionButton } from "@/components/actions/action-button";
import { SaveButton } from "@/components/actions/save-button";
import { IntentBadge } from "@/components/cards/intent-badge";
import { ItemVisual } from "@/components/cards/item-visual";
import { shouldShowItemVisual } from "@/lib/demo/visuals";
import { cn } from "@/lib/utils";
import type { InboxItem } from "@/types";

export function ActionCard({ item, savedItemId }: { item: InboxItem; savedItemId?: string }) {
  const showVisual = shouldShowItemVisual({
    imagePath: item.imagePath,
    intent: item.intent,
    title: item.title,
    supportingText: `${item.meta} ${item.detail ?? ""}`,
  });
  const personality = {
    Attend: "bg-[linear-gradient(105deg,rgb(255_252_247_/_0.98),rgb(238_246_252_/_0.72))]",
    Do: "bg-[linear-gradient(145deg,#fff8dc,#f9e9b8)]",
    Go: "bg-[linear-gradient(105deg,rgb(255_252_247_/_0.98),rgb(246_239_251_/_0.72))]",
    Shop: "bg-[linear-gradient(105deg,rgb(255_252_247_/_0.98),rgb(240_246_235_/_0.72))]",
    Remember: "bg-[linear-gradient(105deg,rgb(255_252_247_/_0.98),rgb(252_238_232_/_0.72))]",
    Other: "bg-card/95",
  }[item.intent];
  const primaryAction = item.actions.find((action) => {
    if (item.intent === "Attend") return action.actionType === "calendar";
    if (item.intent === "Go") return action.actionType === "map";
    if (item.intent === "Shop") return action.actionType === "research";
    if (item.intent === "Remember") return action.label === "Save";
    if (item.intent === "Do") return action.actionType === "reminder";
    return false;
  }) ?? item.actions[0];
  const secondaryActions = item.actions.filter((action) => action !== primaryAction);

  const renderAction = (action: InboxItem["actions"][number], primary = false) => action.label === "Save" || action.label === "Save Place"
    ? <SaveButton key={action.label} inboxItemId={item.id} initialSavedItemId={savedItemId} label={action.label} />
    : <ActionButton className={primary ? "shadow-sm" : "min-w-0 md:w-full"} key={action.label} {...action} primary={primary} />;

  if (item.intent === "Do") {
    return (
      <article className={cn("group relative w-full overflow-hidden rounded-[1.45rem] border border-[#ead49e]/75 px-6 py-6 shadow-[0_9px_25px_rgb(125_91_38_/_0.10)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgb(125_91_38_/_0.14)]", personality)}>
        <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/25" />
        <div className="flex max-w-3xl items-start gap-5">
          <IntentBadge intent={item.intent} compact />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3"><Link className="text-[1.3rem] font-semibold tracking-[-0.025em] text-[#3c3026] hover:text-primary" href={`/inbox/${item.id}`}>{item.title}</Link>{item.isNew ? <span className="rounded-full bg-white/65 px-2 py-1 text-[11px] font-medium text-[#8b6d5d]">New</span> : null}</div>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#6a563b]"><CalendarDays className="mt-1 size-4 shrink-0" /><span>{item.meta}</span></p>
            {item.detail ? <p className="mt-1.5 text-sm leading-6 text-[#806f58]">{item.detail}</p> : null}
            <div className="mt-5 flex flex-wrap gap-2">{primaryAction ? renderAction(primaryAction, true) : null}{secondaryActions.length ? <div className="flex flex-wrap gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">{secondaryActions.map((action) => renderAction(action))}</div> : null}</div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group relative grid w-full items-center gap-5 overflow-hidden rounded-[1.55rem] border border-[#e9dacb]/75 px-5 py-5 shadow-[0_9px_28px_rgb(104_68_45_/_0.085)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_15px_36px_rgb(104_68_45_/_0.12)] md:px-6", showVisual ? "md:grid-cols-[4.5rem_minmax(0,1fr)_13rem_10.5rem]" : "md:grid-cols-[4.5rem_minmax(0,1fr)_10.5rem]", personality)}>
      <IntentBadge intent={item.intent} compact />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <Link className="text-[1.3rem] font-semibold leading-tight tracking-[-0.025em] text-[#342a26] hover:text-primary" href={`/inbox/${item.id}`}>{item.title}</Link>
          {item.isNew ? <span className="rounded-full bg-white/75 px-2 py-1 text-[11px] font-medium text-[#8b6d5d] shadow-sm">New</span> : null}
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#66564d]">
          {item.intent === "Attend" ? <CalendarDays className="mt-1 size-4 shrink-0" /> : null}
          <span>{item.meta}</span>
        </p>
        {item.detail ? <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground">{item.intent === "Attend" ? <MapPin className="mt-1 size-4 shrink-0" /> : null}<span>{item.detail}</span></p> : null}
      </div>
      {showVisual ? <ItemVisual imagePath={item.imagePath} intent={item.intent} title={item.title} variant="archive" /> : null}
      <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
        {primaryAction ? renderAction(primaryAction, true) : null}
        {secondaryActions.length ? <div className="flex flex-wrap gap-2 transition-all duration-200 md:invisible md:max-h-0 md:flex-col md:overflow-hidden md:opacity-0 md:group-hover:visible md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-focus-within:visible md:group-focus-within:max-h-40 md:group-focus-within:opacity-100">{secondaryActions.map((action) => renderAction(action))}</div> : null}
      </div>
    </article>
  );
}
