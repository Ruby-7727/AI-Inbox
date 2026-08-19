import type { ReactNode } from "react";

export function Header({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-[#ead8c5] bg-[#fffaf2]/88 px-7 py-9 shadow-card sm:px-10 sm:py-11 lg:flex lg:min-h-48 lg:items-center lg:justify-between lg:gap-10">
      <span className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full border border-[#e8cbb7]/60 bg-[#f6dfd2]/40" />
      <span className="pointer-events-none absolute right-16 top-9 size-3 rotate-45 rounded-sm border border-primary/35" />
      <span className="pointer-events-none absolute bottom-7 right-36 h-px w-20 bg-[#dfbfa8]/55" />
      <div className="relative">
        <h1 className="font-display text-[48px] font-semibold leading-[0.95] tracking-[-0.04em] text-[#713b2b] sm:text-[60px]">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
      </div>
      {actions ? <div className="relative mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:justify-end">{actions}</div> : null}
    </header>
  );
}
