import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const require = createRequire(import.meta.url);

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

test("retention prompts stay honest and low friction", () => {
  const indexJs = read("./miniprogram/pages/index/index.js");
  const indexWxml = read("./miniprogram/pages/index/index.wxml");

  assert.match(indexJs, /const hasReminderTemplate = Boolean\(REMINDER_TEMPLATE_ID\)/);
  assert.match(indexJs, /reminderStatusText: hasReminderTemplate/);
  assert.match(indexJs, /buildCheckInRecoveryText\(/);
  assert.match(indexJs, /recoveryPromptText/);
  assert.match(indexWxml, /daily-focus-recovery/);
  assert.match(indexJs, /openCheckInForGoal\(activeGoal \? activeGoal\.id : this\.data\.selectedGoalId,\s*true\)/);
});

test("reminder request only stores successful user consent", () => {
  const indexJs = read("./miniprogram/pages/index/index.js");

  assert.match(indexJs, /function isReminderAccepted\(subscribeResult\)/);
  assert.match(indexJs, /subscribeResult\[REMINDER_TEMPLATE_ID\] === "accept"/);
  assert.match(indexJs, /success: \(res\) =>/);
  assert.match(indexJs, /if \(!isReminderAccepted\(res\)\)/);
});

test("lightweight retention stays local and shows tomorrow action", () => {
  const indexJs = read("./miniprogram/pages/index/index.js");
  const indexWxml = read("./miniprogram/pages/index/index.wxml");

  assert.match(indexJs, /buildTomorrowActionText/);
  assert.match(indexJs, /nextActionText/);
  assert.match(indexJs, /明天先存/);
  assert.match(indexWxml, /daily-focus-next-action/);
  assert.match(indexJs, /明天继续点亮/);
});

test("backup flow uses short local codes with preview and clear errors", () => {
  const retentionUtilPath = new URL("./miniprogram/utils/retention.js", import.meta.url);
  const indexJs = read("./miniprogram/pages/index/index.js");
  const indexWxml = read("./miniprogram/pages/index/index.wxml");
  const retentionUtil = existsSync(retentionUtilPath) ? read("./miniprogram/utils/retention.js") : "";

  assert.equal(existsSync(retentionUtilPath), true);
  assert.match(retentionUtil, /BACKUP_PREFIX = "XJ3:"/);
  assert.match(retentionUtil, /buildBackupPayload/);
  assert.match(retentionUtil, /parseBackupPayload/);
  assert.match(retentionUtil, /buildBackupSummary/);
  assert.match(indexJs, /restorePreviewText/);
  assert.match(indexJs, /restoreErrorText/);
  assert.match(indexWxml, /backup-preview/);
  assert.match(indexWxml, /backup-error/);
});

test("retention utilities round-trip short local backup codes", () => {
  const {
    buildBackupPayload,
    parseBackupPayload,
    buildTomorrowActionText,
    buildShareRecallLine,
  } = require("./miniprogram/utils/retention.js");
  const localData = {
    goals: [{ id: 1, name: "旅行基金", target: "5000", saved: 1200, deadline: "2026-12-31" }],
    history: [{ amount: 100, goalId: 1, date: "2026-05-30", note: "先存一笔", moodKey: "steady" }],
    streak: 3,
    lastCheckInDate: "2026-05-30",
    achievements: { firstDeposit: true },
  };

  const payload = buildBackupPayload(localData, "2026-05-30T00:00:00.000Z");
  const parsed = parseBackupPayload(payload);
  const broken = parseBackupPayload("not a backup");

  assert.match(payload, /^XJ3:/);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.goals[0].name, "旅行基金");
  assert.equal(parsed.data.history[0].note, "先存一笔");
  assert.match(parsed.summary, /目标 1 个 · 记录 1 条 · 最近 2026-05-30 · 连续 3 天/);
  assert.equal(broken.ok, false);
  assert.match(broken.error, /完整备份码/);
  assert.match(buildTomorrowActionText("旅行基金", "20.00", true), /明天先存 ¥20.00/);
  assert.doesNotMatch(buildTomorrowActionText("旅行基金", "0.00", true), /¥0.00/);
  assert.match(buildShareRecallLine("旅行基金", "20.00"), /明天继续点亮/);
  assert.doesNotMatch(buildShareRecallLine("旅行基金", "0.00"), /¥0.00/);
});

test("share surfaces include lightweight recall copy", () => {
  const indexJs = read("./miniprogram/pages/index/index.js");

  assert.match(indexJs, /buildShareRecallLine/);
  assert.match(indexJs, /明天继续点亮/);
  assert.match(indexJs, /明天你可以提醒我/);
  assert.match(indexJs, /明天建议/);
});

test("retention plan does not add account or cloud dependencies", () => {
  const appJs = read("./miniprogram/app.js");
  const appJson = read("./miniprogram/app.json");
  const projectConfig = read("./project.config.json");
  const indexJs = read("./miniprogram/pages/index/index.js");

  assert.equal(appJs.includes("wx.cloud"), false);
  assert.equal(projectConfig.includes("cloudfunctionRoot"), false);
  assert.equal(appJson.includes("pages/login"), false);
  assert.equal(indexJs.includes("getPhoneNumber"), false);
  assert.equal(indexJs.includes("云同步"), false);
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
