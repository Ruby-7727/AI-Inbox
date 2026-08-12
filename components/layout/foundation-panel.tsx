import type { LucideIcon } from "lucide-react";

type FoundationPanelProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FoundationPanel({ icon: Icon, title, description }: FoundationPanelProps) {
  return (
    <section className="mt-10 grid min-h-80 place-items-center rounded-xl border bg-card p-8 text-center shadow-card">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-xl bg-muted text-primary">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
