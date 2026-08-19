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
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e5d2bf] bg-[#fffaf3]/92 px-5 py-8 shadow-[8px_0_28px_rgb(104_68_45_/_0.035)] backdrop-blur md:flex">
      <div className="px-2">
        <Brand />
      </div>

      <nav className="mt-10 space-y-2" aria-label="Primary navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-13 items-center gap-3.5 rounded-xl px-4 text-[15px] font-medium text-[#594840] transition-colors hover:bg-[#f5e9de]",
                active && "bg-[#f3dfd2] text-[#9b4e37] shadow-[inset_0_0_0_1px_rgb(180_93_67_/_0.08)]",
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
        <Link className="flex h-14 items-center gap-4 border-b border-[#ead9c9] px-4 text-sm font-medium text-[#594840] hover:text-primary" href="#settings">
          <Settings className="size-5" aria-hidden="true" />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="grid size-10 place-items-center rounded-full bg-[#dca657] text-sm font-semibold text-white shadow-sm">AC</span>
          <span className="text-sm font-medium text-[#594840]">Alex Chen</span>
          <ChevronDown className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}
