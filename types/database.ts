import type { AnalysisAction, AnalysisField, AnalysisIntent } from "@/types/analysis";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type InboxItemStatus = "new" | "saved" | "todo" | "done" | "archived";
export type StructuredInboxData = { fields?: AnalysisField[]; actions?: AnalysisAction[] };

export type InboxItemRow = {
  id: string;
  user_id: string;
  image_path: string | null;
  intent: AnalysisIntent;
  title: string;
  summary: string | null;
  confidence: number | null;
  structured_data: StructuredInboxData;
  status: InboxItemStatus;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InboxItemInsert = Omit<InboxItemRow, "created_at" | "updated_at" | "reminder_at" | "image_path" | "confidence" | "summary" | "structured_data" | "status"> & {
  image_path?: string | null;
  confidence?: number | null;
  summary?: string | null;
  structured_data?: StructuredInboxData;
  status?: InboxItemStatus;
  reminder_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InboxItemUpdate = Partial<Omit<InboxItemInsert, "id" | "user_id">>;

export type SavedItemCategory = "product" | "place" | "note";

export type SavedItemRow = {
  id: string;
  user_id: string;
  inbox_item_id: string;
  category: SavedItemCategory;
  created_at: string;
};

export type SavedItemInsert = Omit<SavedItemRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type ReminderStatus = "pending" | "completed";

export type ReminderRow = {
  id: string;
  user_id: string;
  inbox_item_id: string | null;
  title: string;
  description: string | null;
  remind_at: string;
  status: ReminderStatus;
  created_at: string;
};

export type ReminderInsert = Omit<ReminderRow, "id" | "inbox_item_id" | "description" | "status" | "created_at"> & {
  id?: string;
  inbox_item_id?: string | null;
  description?: string | null;
  status?: ReminderStatus;
  created_at?: string;
};

export type ReminderUpdate = Partial<Omit<ReminderRow, "id" | "user_id" | "created_at">>;

export type Database = {
  public: {
    Tables: {
      inbox_items: {
        Row: InboxItemRow;
        Insert: InboxItemInsert;
        Update: InboxItemUpdate;
        Relationships: [];
      };
      saved_items: {
        Row: SavedItemRow;
        Insert: SavedItemInsert;
        Update: never;
        Relationships: [];
      };
      reminders: {
        Row: ReminderRow;
        Insert: ReminderInsert;
        Update: ReminderUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
