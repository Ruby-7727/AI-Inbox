import "server-only";

import {
  buildResearchPrompts,
  ResearchOutputError,
  validateResearchRequest,
  validateResearchResult,
} from "@/lib/ai/researchContract";
import { researchWithZhipu } from "@/lib/ai/providers/zhipu";
import type { ResearchRequestInput, ResearchResult } from "@/types/research";

export type ResearchAiAdapter = (systemPrompt: string, userPrompt: string) => Promise<string>;

export async function researchGroundedContext(
  input: ResearchRequestInput,
  adapter: ResearchAiAdapter = researchWithZhipu,
): Promise<ResearchResult> {
  const validatedInput = validateResearchRequest(input);
  const { systemPrompt, userPrompt } = buildResearchPrompts(validatedInput);
  const finalContent = await adapter(systemPrompt, userPrompt);

  try {
    return validateResearchResult(JSON.parse(normalizeJsonContent(finalContent)));
  } catch (error) {
    if (error instanceof ResearchOutputError) throw error;
    throw new ResearchOutputError("Zhipu returned invalid research JSON.");
  }
}

function normalizeJsonContent(content: string) {
  const withoutThinking = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = withoutThinking.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? withoutThinking).trim();
}
