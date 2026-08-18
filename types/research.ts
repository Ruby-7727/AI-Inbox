import type { AnalysisAction, AnalysisField } from "@/types/analysis";

export const RESEARCH_TYPES = ["trip", "product", "general"] as const;

export type ResearchType = (typeof RESEARCH_TYPES)[number];

export type ResearchStructuredData = {
  fields: AnalysisField[];
  actions?: AnalysisAction[];
};

export type ResearchRequestInput = {
  researchType: ResearchType;
  sourceTitle: string;
  sourceSummary?: string | null;
  structuredData: ResearchStructuredData;
};

export type ResearchFinding = {
  title: string;
  detail: string;
};

export type ResearchResult = {
  title: string;
  overview: string;
  findings: ResearchFinding[];
  recommendations: string[];
  cautions?: string[];
};
