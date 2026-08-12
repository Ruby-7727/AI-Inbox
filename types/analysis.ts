export const ANALYSIS_INTENTS = ["shop", "go", "do", "attend", "remember", "other"] as const;
export const ANALYSIS_ACTIONS = [
  "save",
  "compare",
  "research",
  "want_to_go",
  "navigate",
  "add_to_plan",
  "create_task",
  "remind",
  "schedule",
  "add_calendar",
  "summarize",
  "tag",
] as const;

export type AnalysisIntent = (typeof ANALYSIS_INTENTS)[number];
export type AnalysisAction = (typeof ANALYSIS_ACTIONS)[number];

export type AnalysisField = {
  key: string;
  label: string;
  value: string | null;
};

export type ScreenshotAnalysis = {
  intent: AnalysisIntent;
  confidence: number;
  title: string | null;
  summary: string | null;
  fields: AnalysisField[];
  actions: AnalysisAction[];
};

export type AnalyzeApiResponse = {
  id: string;
  status: "complete";
  upload: {
    name: string;
    size: number;
    type: string;
  };
  result: ScreenshotAnalysis;
};
