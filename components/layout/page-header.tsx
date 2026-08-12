import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    icon: LucideIcon;
  };
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const ActionIcon = action?.icon;

  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">{description}</p>
      </div>
      {action && ActionIcon ? (
        <Button className="self-start" size="lg" type="button">
          <ActionIcon className="size-5" aria-hidden="true" />
          {action.label}
        </Button>
      ) : null}
    </header>
  );
}
