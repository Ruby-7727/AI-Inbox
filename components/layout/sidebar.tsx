"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, ChevronDown, Inbox, Search, Settings, SquareCheckBig } from "lucide-react";

import { UploadButton } from "@/components/actions/upload-button";
import { Brand } from "@/components/layout/brand";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/todo", label: "To Do", icon: SquareCheckBig },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r bg-white px-5 py-9 md:flex">
      <div className="px-2">
        <Brand />
      </div>

      <nav className="mt-11 space-y-2" aria-label="Primary navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-14 items-center gap-4 rounded-xl px-4 text-base text-slate-700 transition-colors hover:bg-muted",
                active && "bg-[#edf4ff] font-medium text-primary",
              )}
            >
              <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <UploadButton className="mt-5 w-full" />

      <div className="mt-auto space-y-4">
        <Link className="flex h-14 items-center gap-4 border-b px-4 text-slate-700 hover:text-foreground" href="#settings">
          <Settings className="size-5" aria-hidden="true" />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="grid size-10 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">AC</span>
          <span className="font-medium">Alex Chen</span>
          <ChevronDown className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}
