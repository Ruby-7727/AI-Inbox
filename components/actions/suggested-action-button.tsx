"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, ChartNoAxesColumnIncreasing, LoaderCircle, MapPin, Search } from "lucide-react";

import { ActionConfirmDialog } from "@/components/actions/action-confirm-dialog";
import { useActionHistory } from "@/components/actions/action-provider";
import { ActionResultCard } from "@/components/actions/action-result-card";
import { Button } from "@/components/ui/button";
import { executeAction } from "@/lib/actions/executor";
import { actionRegistry, type ActionIconIdentifier } from "@/lib/actions/registry";
import type { AIAction } from "@/lib/actions/types";

const actionIcons: Record<ActionIconIdentifier, LucideIcon> = {
  "calendar-days": CalendarDays,
  bell: Bell,
  "map-pin": MapPin,
  search: Search,
  chart: ChartNoAxesColumnIncreasing,
};

type ActionUiState = "idle" | "confirming" | "executing" | "completed" | "failed";

export function SuggestedActionButton({ action: initialAction }: { action: AIAction }) {
  const { addAction } = useActionHistory();
  const [action, setAction] = useState(initialAction);
  const [state, setState] = useState<ActionUiState>(() => {
    if (initialAction.status === "completed") return "completed";
    if (initialAction.status === "failed") return "failed";
    return "idle";
  });
  const [message, setMessage] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const definition = actionRegistry[action.type];
  const Icon = actionIcons[definition.icon];

  function requestConfirmation() {
    if (state === "executing" || state === "completed" || state === "confirming") return;
    setState("confirming");
  }

  function cancelConfirmation() {
    setState(action.status === "failed" ? "failed" : "idle");
  }

  async function confirmAction() {
    setState("executing");
    try {
      const result = await executeAction(action);
      setAction({ ...result.action, status: result.success ? "completed" : "failed" });
      setMessage(result.message);
      setCompletedAt(result.success ? new Date() : null);
      setState(result.success ? "completed" : "failed");
      addAction({
        title: result.action.title,
        type: result.action.type,
        status: result.success ? "completed" : "failed",
        message: result.message,
      });
    } catch {
      const errorMessage = "Action could not be completed";
      setAction((currentAction) => ({ ...currentAction, status: "failed" }));
      setMessage(errorMessage);
      setCompletedAt(null);
      setState("failed");
      addAction({ title: action.title, type: action.type, status: "failed", message: errorMessage });
    }
  }

  if (state === "completed" || state === "failed") {
    return (
      <ActionResultCard
        actionTitle={action.title}
        completedAt={completedAt}
        message={message ?? (state === "completed" ? "Action completed" : "Action could not be completed")}
        onRetry={state === "failed" ? requestConfirmation : undefined}
        status={state}
      />
    );
  }

  return (
    <>
      <Button
        className="h-11 min-w-36"
        disabled={state === "executing" || state === "confirming"}
        onClick={requestConfirmation}
        title={action.description}
        variant={state === "idle" ? "default" : "outline"}
        type="button"
      >
        {state === "executing" ? <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" /> : <Icon className="size-4.5" strokeWidth={1.8} aria-hidden="true" />}
        {state === "executing" ? "Working..." : action.title}
      </Button>
      <ActionConfirmDialog
        action={action}
        onCancel={cancelConfirmation}
        onConfirm={confirmAction}
        open={state === "confirming"}
      />
    </>
  );
}
