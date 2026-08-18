import assert from "node:assert/strict";

import { ResearchInputError, ResearchOutputError, validateResearchRequest } from "../lib/ai/researchContract";
import { researchGroundedContext } from "../lib/ai/research";
import { executeAction } from "../lib/actions/executor";
import { mapSuggestedActions } from "../lib/actions/mapper";
import { createAction } from "../lib/actions/registry";
import type { ResearchRequestInput, ResearchResult } from "../types/research";

const tripInput: ResearchRequestInput = {
  researchType: "trip",
  sourceTitle: "Barcelona itinerary",
  sourceSummary: "Three-day itinerary with museum and restaurant stops.",
  structuredData: {
    fields: [
      { key: "day_1", label: "Day 1", value: "Gothic Quarter and museum" },
      { key: "budget", label: "Budget", value: null },
    ],
    actions: ["navigate", "add_to_plan"],
  },
};

const productInput: ResearchRequestInput = {
  researchType: "product",
  sourceTitle: "Sony WH-1000XM6",
  sourceSummary: "Wireless noise-canceling headphones.",
  structuredData: {
    fields: [
      { key: "price", label: "Price", value: "¥2,999" },
      { key: "seller", label: "Seller", value: "Taobao" },
    ],
    actions: ["compare", "research"],
  },
};

const tripResult: ResearchResult = {
  title: "Barcelona itinerary assessment",
  overview: "The supplied plan groups several activities into three days.",
  findings: [{ title: "Schedule", detail: "Day 1 contains two explicitly listed stops." }],
  recommendations: ["Add travel time between the listed stops."],
  cautions: ["Opening hours and current availability were not supplied."],
};

async function run() {
  const promptKinds: string[] = [];
  const tripResearch = await researchGroundedContext(tripInput, async (systemPrompt, userPrompt) => {
    assert.match(systemPrompt, /no web search/i);
    assert.match(systemPrompt, /itinerary feasibility/i);
    assert.match(systemPrompt, /must not imply that you searched the web/i);
    assert.match(userPrompt, /Barcelona itinerary/);
    promptKinds.push("trip");
    return JSON.stringify(tripResult);
  });
  assert.deepEqual(tripResearch, tripResult);

  const productResult = await researchGroundedContext(productInput, async (systemPrompt, userPrompt) => {
    assert.match(systemPrompt, /purchase considerations/i);
    assert.match(systemPrompt, /Do not invent or assert current prices/i);
    assert.match(userPrompt, /Sony WH-1000XM6/);
    promptKinds.push("product");
    return JSON.stringify({
      title: "Headphone purchase review",
      overview: "The screenshot identifies a wireless noise-canceling headphone listing.",
      findings: [{ title: "Grounded price", detail: "The supplied listing shows ¥2,999." }],
      recommendations: ["Verify the comparison dimensions not shown in the screenshot."],
      cautions: ["Current availability and independent reviews were not supplied."],
    });
  });
  assert.equal(productResult.title, "Headphone purchase review");
  assert.deepEqual(promptKinds, ["trip", "product"]);

  assert.throws(() => validateResearchRequest({
    researchType: "trip",
    sourceTitle: "Empty trip",
    structuredData: { fields: [] },
  }), ResearchInputError);

  await assert.rejects(
    researchGroundedContext(tripInput, async () => JSON.stringify({ title: "Bad", overview: "Bad", findings: "invalid", recommendations: [] })),
    ResearchOutputError,
  );

  const tripAction = mapSuggestedActions("go", ["navigate", "add_to_plan"], {
    fields: tripInput.structuredData.fields,
    itemTitle: tripInput.sourceTitle,
    itemDescription: tripInput.sourceSummary,
    inboxItemId: "00000000-0000-4000-8000-000000000001",
  }).find((action) => action.type === "research");
  assert.ok(tripAction);
  assert.equal(tripAction.researchType, "trip");
  assert.equal(tripAction.sourceTitle, tripInput.sourceTitle);

  const executed = await executeAction(tripAction, { research: async (input) => {
    assert.equal(input.researchType, "trip");
    return tripResult;
  } });
  assert.equal(executed.success, true);
  assert.equal(executed.action.status, "completed");
  assert.deepEqual(executed.researchResult, tripResult);

  const productAction = mapSuggestedActions("shop", ["compare", "research"], {
    fields: productInput.structuredData.fields,
    itemTitle: productInput.sourceTitle,
    itemDescription: productInput.sourceSummary,
  }).find((action) => action.type === "research");
  assert.equal(productAction?.researchType, "product");

  let calls = 0;
  const missingContext = await executeAction({
    ...createAction("research"),
    researchType: "general",
    sourceTitle: "No grounded details",
    structuredData: { fields: [] },
  }, { research: async () => { calls += 1; return tripResult; } });
  assert.equal(missingContext.success, false);
  assert.equal(missingContext.message, "Unable to complete research.");
  assert.equal(calls, 0);

  const providerFailure = await executeAction(tripAction, {
    research: async () => { throw new Error("Mock provider failure"); },
  });
  assert.equal(providerFailure.success, false);
  assert.equal(providerFailure.message, "Unable to complete research.");

  console.log("Research action tests passed.");
}

void run();
