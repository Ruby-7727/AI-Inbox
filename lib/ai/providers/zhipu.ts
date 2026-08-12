import "server-only";

import { SCREENSHOT_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/analysisContract";

const DEFAULT_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/";
const DEFAULT_MODEL = "glm-4.5v";

export class ZhipuConfigurationError extends Error {}

export class ZhipuProviderError extends Error {
  constructor(
    message: string,
    readonly kind: "authentication" | "rate_limit" | "timeout" | "provider",
  ) {
    super(message);
  }
}

type ZhipuChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
  }>;
};

export async function analyzeScreenshotWithZhipu(imageUrl: string): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) throw new ZhipuConfigurationError("ZHIPU_API_KEY is not configured.");

  const baseUrl = process.env.ZHIPU_API_BASE_URL ?? DEFAULT_BASE_URL;
  const endpoint = new URL("chat/completions", ensureTrailingSlash(baseUrl));
  const controller = new AbortController();
  const configuredTimeout = Number(process.env.ZHIPU_API_TIMEOUT_MS ?? "60000");
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 60_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ZHIPU_VISION_MODEL ?? DEFAULT_MODEL,
        messages: [
          { role: "system", content: SCREENSHOT_ANALYSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              {
                type: "text",
                text: "Analyze this screenshot as the Screenshot Intent & Action Extraction Engine. Return only the final JSON object; do not include reasoning, markdown, or explanatory text.",
              },
            ],
          },
        ],
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        stream: false,
        max_tokens: 1200,
        temperature: 0.1,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new ZhipuProviderError("Zhipu authentication failed.", "authentication");
      if (response.status === 429) throw new ZhipuProviderError("Zhipu rate limit reached.", "rate_limit");
      throw new ZhipuProviderError("Zhipu request failed.", "provider");
    }

    const payload = await response.json() as ZhipuChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) throw new ZhipuProviderError("Zhipu returned no final content.", "provider");

    // reasoning_content is intentionally ignored. Only final assistant content crosses the provider boundary.
    return content;
  } catch (error) {
    if (error instanceof ZhipuProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new ZhipuProviderError("Zhipu request timed out.", "timeout");
    throw new ZhipuProviderError("Zhipu request failed.", "provider");
  } finally {
    clearTimeout(timeout);
  }
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}
