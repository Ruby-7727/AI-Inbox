import assert from "node:assert/strict";

import { executeAction } from "../lib/actions/executor";
import { createAction } from "../lib/actions/registry";

const openedUrls: string[] = [];
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    open(url: string) {
      openedUrls.push(url);
      return null;
    },
  },
});

async function run() {
  const completed = await executeAction({ ...createAction("map"), location: "Barcelona" });
  assert.equal(completed.success, true);
  assert.equal(completed.action.status, "completed");
  assert.equal(completed.title, "Location opened");
  assert.equal(completed.message, "Opened Barcelona in Google Maps");
  assert.equal(openedUrls[0], "https://www.google.com/maps/search/?api=1&query=Barcelona");

  const failed = await executeAction({ ...createAction("map"), location: "" });
  assert.equal(failed.success, false);
  assert.equal(failed.action.status, "failed");
  assert.equal(failed.message, "Unable to open map location");
  assert.equal(openedUrls.length, 1);

  console.log("Map action tests passed.");
}

void run();
