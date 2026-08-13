import { Clipboard, Search } from "lucide-react";

import { UploadButton } from "@/components/actions/upload-button";
import { Header } from "@/components/layout/header";
import { InboxContent } from "@/components/inbox/inbox-content";

export const metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <>
      <Header title="Inbox" description="Turn screenshots into actions." actions={
        <>
          <label className="hidden h-12 w-72 items-center gap-3 rounded-lg border bg-white px-4 text-sm text-muted-foreground lg:flex">
            <Search className="size-5" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search inbox..." />
          </label>
          <UploadButton />
        </>
      } />

      <button className="mt-10 flex h-15 w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/25 px-5 text-left text-sm text-muted-foreground hover:bg-blue-50/60" type="button">
        <Clipboard className="size-5 text-primary" />
        Paste a screenshot with ⌘V / Ctrl+V
      </button>

      <InboxContent />
    </>
  );
}
