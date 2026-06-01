const assert = require("assert");

const {
  buildXhsMaterials,
  getPosterRenderModel,
  getSharePrompt,
  getSelectedGoalStatus,
  reconcileGoalCompletion,
} = require("../miniprogram/utils/growth");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const focusGoal = {
  id: 1,
  name: "奶茶戒断基金",
  percent: "36.5",
  savedDisplay: "365.00",
  targetDisplay: "1000.00",
  remainingDisplay: "635.00",
};

test("buildXhsMaterials returns title body tags for partner, progress, and monthly shares", () => {
  const materials = buildXhsMaterials({
    focusGoal,
    challengeBoard: {
      litDays: 12,
      percent: 3.28,
      shareText: "我已经点亮 12 格，继续攒钱打卡。",
    },
    weeklySummary: {
      activeDays: 4,
      weeklyTotal: 280,
      topGoalName: "奶茶戒断基金",
      topMood: { emoji: "🌿", label: "稳稳存下" },
    },
    monthlySummary: {
      activeDays: 9,
      monthlyTotal: 880,
      topGoalName: "奶茶戒断基金",
      insight: "这个月已经形成一些节奏了。",
    },
  });

  assert.strictEqual(materials.length, 3);
  assert.deepStrictEqual(materials.map((item) => item.key), ["partner", "progress", "monthly"]);
  materials.forEach((item) => {
    assert.ok(item.title.length > 0);
    assert.ok(item.body.length > 0);
    assert.ok(item.tags.includes("#攒钱打卡"));
    assert.ok(item.copyText.includes(item.title));
    assert.ok(item.copyText.includes("#存钱挑战"));
  });
  assert.ok(materials[0].copyText.includes("#存钱搭子"));
});

test("reconcileGoalCompletion can complete and reopen goals after target changes", () => {
  const result = reconcileGoalCompletion([
    { id: 1, name: "旅行基金", saved: 1000, target: 1000, completed: false },
    { id: 2, name: "备用金", saved: 800, target: 1200, completed: true },
  ]);

  assert.strictEqual(result.goals[0].completed, true);
  assert.strictEqual(result.goals[1].completed, false);
  assert.deepStrictEqual(result.newlyCompletedNames, ["旅行基金"]);
  assert.strictEqual(result.changed, true);
});

test("getSelectedGoalStatus follows the selected goal instead of stale focus goal", () => {
  const selected = getSelectedGoalStatus({
    mappedGoals: [
      { id: 1, suggestedAmountDisplay: "10.00", todayAddedDisplay: "0.00", todayAdded: 0 },
      { id: 2, suggestedAmountDisplay: "50.00", todayAddedDisplay: "80.00", todayAdded: 80 },
    ],
    selectedGoalId: 2,
    focusGoal: { id: 1, suggestedAmountDisplay: "10.00", todayAddedDisplay: "0.00", todayAdded: 0 },
  });

  assert.strictEqual(selected.selectedGoalId, 2);
  assert.strictEqual(selected.selectedGoalSuggestedAmountDisplay, "50.00");
  assert.strictEqual(selected.selectedGoalTodayAddedDisplay, "80.00");
  assert.ok(selected.selectedGoalHint.includes("80.00"));
});

test("getSharePrompt triggers on first check-in, streaks, and milestones", () => {
  assert.strictEqual(getSharePrompt({ totalCheckIns: 1 }).key, "first");
  assert.strictEqual(getSharePrompt({ streak: 3 }).key, "streak3");
  assert.strictEqual(getSharePrompt({ streak: 7 }).key, "streak7");
  assert.strictEqual(getSharePrompt({ beforePercent: 24, afterPercent: 25 }).key, "milestone25");
  assert.strictEqual(getSharePrompt({ totalCheckIns: 2, streak: 2, beforePercent: 10, afterPercent: 12 }), null);
});

test("getPosterRenderModel gives each growth poster a distinct layout and primary message", () => {
  const base = {
    topGoal: focusGoal,
    challengeLitDaysDisplay: "12",
    challengePercentDisplay: "3.3%",
    streakDisplay: "7",
    weeklySummaryDaysDisplay: "4",
    challengeTotalAmountDisplay: "888.00",
  };
  const privacy = getPosterRenderModel("privacy", base);
  const partner = getPosterRenderModel("partner", base);
  const celebrate = getPosterRenderModel("celebrate", base);

  assert.strictEqual(privacy.layout, "privacy-progress");
  assert.strictEqual(partner.layout, "partner-invite");
  assert.strictEqual(celebrate.layout, "completion-celebration");
  assert.notStrictEqual(privacy.headline, partner.headline);
  assert.notStrictEqual(partner.headline, celebrate.headline);
  assert.deepStrictEqual(privacy.stats.map((item) => item.label), ["已点亮", "连续打卡", "目标进度"]);
  assert.ok(partner.cta.includes("搭子"));
  assert.ok(celebrate.heroMetric.includes("%"));
});
