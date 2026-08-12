import type { ReactNode } from "react";

export function Header({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
      <div>
        <h1 className="text-[44px] font-semibold leading-none tracking-[-0.045em]">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
    </header>
  );
}
