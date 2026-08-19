import { Clipboard, Flower2, Heart } from "lucide-react";

import { Header } from "@/components/layout/header";
import { InboxContent } from "@/components/inbox/inbox-content";

export const metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <Header title="Welcome back" description="Your ideas, plans, and inspo — all in one cozy place." actions={
        <div className="relative flex flex-wrap items-center gap-3 pr-12">
          <div className="hidden h-12 items-center gap-3 rounded-2xl border border-[#dec9b6] bg-[#fffdf8]/90 px-5 text-sm text-[#725b4e] shadow-sm lg:flex"><Clipboard className="size-4.5 text-primary" />Paste with ⌘V / Ctrl+V</div>
          <Flower2 className="absolute -right-2 -top-7 size-12 rotate-12 text-[#bf7656]" strokeWidth={1.35} />
          <Heart className="absolute -right-1 bottom-0 size-4 rotate-12 fill-[#f4ddd2] text-[#bf7656]" />
        </div>
      } />
      <InboxContent />
    </div>
  );
}
