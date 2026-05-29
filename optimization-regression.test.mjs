import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("production manifest only registers the savings tracker page", () => {
  const appJson = JSON.parse(read("./miniprogram/app.json"));

  assert.deepEqual(appJson.pages, ["pages/index/index"]);
  assert.equal(existsSync(new URL("./miniprogram/pages/example/index.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("./miniprogram/components/cloudTipModal/index.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("./cloudfunctions/quickstartFunctions/index.js", import.meta.url)), false);
});

test("app launch does not initialize cloud capabilities", () => {
  const appJs = read("./miniprogram/app.js");
  const projectConfig = read("./project.config.json");

  assert.equal(appJs.includes("wx.cloud"), false);
  assert.equal(appJs.includes("traceUser"), false);
  assert.equal(projectConfig.includes("cloudfunction"), false);
  assert.equal(projectConfig.includes("quickstart-wx-cloud"), false);
});

test("index page exposes native sharing and reminder entry points", () => {
  const indexJs = read("./miniprogram/pages/index/index.js");
  const indexWxml = read("./miniprogram/pages/index/index.wxml");

  assert.match(indexJs, /onShareAppMessage\(\)/);
  assert.match(indexJs, /onShareTimeline\(\)/);
  assert.match(indexJs, /requestSubscribeMessage/);
  assert.match(indexJs, /onRequestSavingReminder\(\)/);
  assert.match(indexWxml, /bindtap="onRequestSavingReminder"/);
});

test("new goal creation can continue directly into first check-in", () => {
  const indexJs = read("./miniprogram/pages/index/index.js");

  assert.match(indexJs, /pendingCheckInGoalId/);
  assert.match(indexJs, /openCheckInForGoal\(/);
  assert.match(indexJs, /showCheckInPopup:\s*true/);
});

test("README describes the local-only production shape", () => {
  const readme = read("./README.md");

  assert.equal(readme.includes("cloudfunctions/"), false);
  assert.match(readme, /REMINDER_TEMPLATE_ID/);
});

test("production images only keep referenced savings tracker assets", () => {
  const imageDir = new URL("./miniprogram/images/", import.meta.url);
  const imageFiles = readdirSync(imageDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(imageFiles, ["share-mini-code.jpg"]);
});
