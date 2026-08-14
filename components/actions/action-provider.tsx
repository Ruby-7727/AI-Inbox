"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { ActionStatus, ActionType } from "@/lib/actions/types";

export type ActionHistoryItem = {
  id: string;
  title: string;
  type: ActionType;
  status: Extract<ActionStatus, "completed" | "failed">;
  message: string;
  timestamp: Date;
};

type NewActionHistoryItem = Omit<ActionHistoryItem, "id" | "timestamp">;

type ActionContextValue = {
  actions: ActionHistoryItem[];
  addAction: (action: NewActionHistoryItem) => void;
  clearHistory: () => void;
};

const ActionContext = createContext<ActionContextValue | null>(null);

export function ActionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [actions, setActions] = useState<ActionHistoryItem[]>([]);

  const addAction = useCallback((action: NewActionHistoryItem) => {
    setActions((currentActions) => [
      {
        ...action,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
      ...currentActions,
    ]);
  }, []);

  const clearHistory = useCallback(() => setActions([]), []);
  const value = useMemo(() => ({ actions, addAction, clearHistory }), [actions, addAction, clearHistory]);

  return <ActionContext.Provider value={value}>{children}</ActionContext.Provider>;
}

export function useActionHistory() {
  const context = useContext(ActionContext);
  if (!context) throw new Error("useActionHistory must be used within ActionProvider.");
  return context;
}
