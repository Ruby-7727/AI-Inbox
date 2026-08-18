import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import { ActionResultCard } from "../components/actions/action-result-card";
import { ResearchResult } from "../components/actions/research-result";
import type { ResearchResult as ResearchResultData } from "../types/research";

const withCautions: ResearchResultData = {
  title: "Spain 7-Day Trip Research",
  overview: "Seven days across four destinations is possible but relatively intensive.",
  findings: [
    { title: "Route feasibility", detail: "Madrid to Seville is a coherent sequence based on the supplied itinerary." },
    { title: "Schedule intensity", detail: "Four destinations within seven days leaves limited buffer time." },
  ],
  recommendations: ["Reduce unnecessary transfers.", "Confirm transport time before finalizing the plan."],
  cautions: ["Current transport schedules and prices were not checked.", "External availability has not been verified."],
};

const report = renderToStaticMarkup(<ResearchResult result={withCautions} />);
assert.match(report, /Spain 7-Day Trip Research/);
assert.match(report, /Overall/);
assert.match(report, /Key findings/);
assert.match(report, /Route feasibility/);
assert.match(report, /Recommendations/);
assert.match(report, /Cautions/);
assert.match(report, /No live web data was used/);

const withoutCautions = renderToStaticMarkup(<ResearchResult result={{ ...withCautions, cautions: undefined }} />);
assert.doesNotMatch(withoutCautions, />Cautions</);

const completedResearch = renderToStaticMarkup(
  <ActionResultCard
    actionTitle="Research Trip"
    actionType="research"
    completedAt={new Date("2026-08-18T00:00:00.000Z")}
    message={withCautions.overview}
    researchResult={withCautions}
    resultTitle="Research complete"
    status="completed"
  />,
);
assert.match(completedResearch, /Research complete/);
assert.match(completedResearch, /Completed just now/);
assert.match(completedResearch, /Research report/);

const failedResearch = renderToStaticMarkup(
  <ActionResultCard
    actionTitle="Research Product"
    actionType="research"
    message="Unable to complete research."
    onRetry={() => undefined}
    resultTitle="Research failed"
    status="failed"
  />,
);
assert.match(failedResearch, /Research failed/);
assert.match(failedResearch, /Unable to complete research\./);
assert.match(failedResearch, /Retry/);

const mapResult = renderToStaticMarkup(
  <ActionResultCard
    actionTitle="Open Map"
    actionType="map"
    completedAt={new Date("2026-08-18T00:00:00.000Z")}
    message="Opened Barcelona in Google Maps"
    resultTitle="Location opened"
    status="completed"
  />,
);
assert.match(mapResult, /Location opened/);
assert.match(mapResult, /Opened Barcelona in Google Maps/);
assert.doesNotMatch(mapResult, /Research report|No live web data/);

console.log("Research result UI tests passed.");
