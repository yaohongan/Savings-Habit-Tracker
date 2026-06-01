const XHS_TAGS = ["#存钱搭子", "#攒钱打卡", "#无痛攒钱", "#存钱挑战", "#低消费挑战"];

const POSTER_THEMES = [
  {
    key: "privacy",
    name: "隐私进度卡",
    desc: "晒坚持不晒金额",
    bgStart: "#E8F8F5",
    bgMid: "#FDFBF7",
    bgEnd: "#FFF1E7",
    accent: "#1E7F74",
    title: "#243A3A",
    sub: "#6F7D7A",
  },
  {
    key: "partner",
    name: "搭子招募卡",
    desc: "适合找人监督",
    bgStart: "#FFF1E7",
    bgMid: "#FFE2D0",
    bgEnd: "#FDFBF7",
    accent: "#F08A5D",
    title: "#5A3428",
    sub: "#9A6A55",
  },
  {
    key: "celebrate",
    name: "完成庆祝卡",
    desc: "适合达成时刻",
    bgStart: "#143D3A",
    bgMid: "#1D7369",
    bgEnd: "#F08A5D",
    accent: "#FFE2C5",
    title: "#FFFFFF",
    sub: "rgba(255,255,255,0.78)",
  },
  {
    key: "cream",
    name: "奶油日签",
    desc: "温柔复盘感",
    bgStart: "#E8F8F5",
    bgMid: "#EBF5FB",
    bgEnd: "#FDFBF7",
    accent: "#48C9B0",
    title: "#2C3E50",
    sub: "#7F8C8D",
  },
];

function formatAmount(value) {
  const num = Number(value) || 0;
  const fixed = (Math.round(num * 100) / 100).toFixed(2);
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function compactText(parts) {
  return parts.filter(Boolean).join("\n");
}

function makeMaterial(key, icon, name, title, body, tags) {
  const tagText = tags.join(" ");
  return {
    key,
    icon,
    name,
    title,
    body,
    tags,
    copyText: compactText([title, body, tagText]),
  };
}

function buildXhsMaterials({ focusGoal, challengeBoard = {}, weeklySummary = {}, monthlySummary = {} }) {
  const goalName = focusGoal ? focusGoal.name : "我的攒钱挑战";
  const percent = focusGoal ? focusGoal.percent : "0.0";
  const litDays = Number(challengeBoard.litDays || 0);
  const weeklyDays = Number(weeklySummary.activeDays || 0);
  const monthlyDays = Number(monthlySummary.activeDays || 0);
  const weeklyTotal = formatAmount(weeklySummary.weeklyTotal || 0);
  const monthlyTotal = formatAmount(monthlySummary.monthlyTotal || 0);
  const mood = weeklySummary.topMood
    ? `${weeklySummary.topMood.emoji || ""}${weeklySummary.topMood.label || ""}`
    : "稳稳存下";

  return [
    makeMaterial(
      "partner",
      "👀",
      "存钱搭子招募",
      `想找一个存钱搭子，一起打卡「${goalName}」`,
      compactText([
        `我现在在做「${goalName}」攒钱挑战，进度 ${percent}%。`,
        `不用比谁存得多，就互相提醒今天有没有点亮一格。`,
        "想一起无痛攒钱的话，可以从今天这一笔开始。",
      ]),
      XHS_TAGS
    ),
    makeMaterial(
      "progress",
      "✨",
      "挑战进度汇报",
      `我的攒钱挑战已经点亮 ${litDays} 格`,
      compactText([
        `今天继续记录「${goalName}」，目前目标进度 ${percent}%。`,
        challengeBoard.shareText || "每天先存一点点，点亮一格就算赢。",
        "把攒钱做成可视化挑战后，真的更容易坚持。",
      ]),
      ["#攒钱打卡", "#无痛攒钱", "#存钱挑战", "#存钱搭子"]
    ),
    makeMaterial(
      "monthly",
      "📝",
      "月度复盘小作文",
      `这个月我已经认真攒钱 ${monthlyDays} 天`,
      compactText([
        `本月累计打卡 ${monthlyDays} 天，记录攒下 ¥${monthlyTotal}。`,
        weeklyDays > 0 ? `这周打卡 ${weeklyDays} 天，状态是「${mood}」，本周累计 ¥${weeklyTotal}。` : "",
        monthlySummary.insight || "慢慢来，先把记录变连续。",
      ]),
      ["#攒钱打卡", "#存钱挑战", "#月度复盘", "#无痛攒钱"]
    ),
  ];
}

function getXhsMaterial(materials, key) {
  return (materials || []).find((item) => item.key === key) || (materials || [])[0] || null;
}

function getPosterThemeByKey(key) {
  return POSTER_THEMES.find((item) => item.key === key) || POSTER_THEMES[0];
}

function getPosterRenderModel(key, data = {}) {
  const topGoal = data.topGoal || {};
  const percent = topGoal.percent || "0.0";
  const litDays = data.challengeLitDaysDisplay || "0";
  const streak = data.streakDisplay || "0";
  const weeklyDays = data.weeklySummaryDaysDisplay || "0";
  const totalAmount = data.challengeTotalAmountDisplay || "0.00";
  const goalName = topGoal.name || "我的攒钱挑战";

  if (key === "partner") {
    return {
      layout: "partner-invite",
      headline: "找一个存钱搭子",
      subline: `一起打卡「${goalName}」`,
      heroMetric: `${litDays} 格`,
      heroLabel: "我已经点亮",
      cta: "找存钱搭子，一起提醒今天点亮了吗？",
      stats: [
        { label: "目标进度", value: `${percent}%` },
        { label: "连续打卡", value: `${streak} 天` },
        { label: "本周打卡", value: `${weeklyDays} 天` },
      ],
    };
  }

  if (key === "celebrate") {
    return {
      layout: "completion-celebration",
      headline: "攒钱挑战阶段达成",
      subline: `「${goalName}」已经完成 ${percent}%`,
      heroMetric: `${percent}%`,
      heroLabel: "目标进度",
      cta: "原来想要的生活，真的可以一格一格存出来。",
      stats: [
        { label: "已点亮", value: `${litDays} 格` },
        { label: "连续打卡", value: `${streak} 天` },
        { label: "本周打卡", value: `${weeklyDays} 天` },
      ],
    };
  }

  if (key === "cream") {
    return {
      layout: "amount-journal",
      headline: "今天也在认真变稳",
      subline: `正在记录「${goalName}」`,
      heroMetric: `¥${totalAmount}`,
      heroLabel: "挑战累计攒下",
      cta: "每一笔都算数，每一天都在靠近。",
      stats: [
        { label: "已点亮", value: `${litDays} 格` },
        { label: "连续打卡", value: `${streak} 天` },
        { label: "目标进度", value: `${percent}%` },
      ],
    };
  }

  return {
    layout: "privacy-progress",
    headline: "晒坚持，不晒金额",
    subline: `我的「${goalName}」攒钱进度`,
    heroMetric: `${litDays} 格`,
    heroLabel: "365 点亮挑战",
    cta: "不用公布存了多少钱，也能把坚持晒出来。",
    stats: [
      { label: "已点亮", value: `${litDays} 格` },
      { label: "连续打卡", value: `${streak} 天` },
      { label: "目标进度", value: `${percent}%` },
    ],
  };
}

function getSelectedGoalStatus({ mappedGoals = [], selectedGoalId, focusGoal }) {
  const selectedGoal = mappedGoals.find((item) => item.id === selectedGoalId) || focusGoal || null;
  return {
    selectedGoalId: selectedGoal ? selectedGoal.id : 0,
    selectedGoalSuggestedAmountDisplay: selectedGoal ? selectedGoal.suggestedAmountDisplay : "0.00",
    selectedGoalTodayAddedDisplay: selectedGoal ? selectedGoal.todayAddedDisplay : "0.00",
    selectedGoalHint: selectedGoal
      ? (Number(selectedGoal.todayAdded || 0) > 0
        ? `今天已为这个目标存入 ¥${selectedGoal.todayAddedDisplay}`
        : `建议先存 ¥${selectedGoal.suggestedAmountDisplay}`)
      : "",
  };
}

function reconcileGoalCompletion(goals = []) {
  const newlyCompletedNames = [];
  let changed = false;
  const reconciled = goals.map((goal) => {
    const saved = Number(goal.saved || 0);
    const target = Number(goal.target || 0);
    const nextCompleted = target > 0 && saved >= target;
    if (goal.completed !== nextCompleted) {
      changed = true;
      if (nextCompleted) newlyCompletedNames.push(goal.name);
      return { ...goal, completed: nextCompleted };
    }
    return goal;
  });

  return {
    goals: reconciled,
    changed,
    newlyCompletedNames,
  };
}

function getSharePrompt({ totalCheckIns = 0, streak = 0, beforePercent = 0, afterPercent = 0 }) {
  if (totalCheckIns === 1) {
    return {
      key: "first",
      title: "第一笔已经点亮",
      desc: "复制一段小红书开局文案，邀请朋友监督你继续攒。",
    };
  }
  if (streak === 7) {
    return {
      key: "streak7",
      title: "连续 7 天，很值得晒",
      desc: "这一周已经形成节奏，适合发一张挑战进度卡。",
    };
  }
  if (streak === 3) {
    return {
      key: "streak3",
      title: "连续 3 天，节奏起来了",
      desc: "现在分享出去，更容易找到一起坚持的存钱搭子。",
    };
  }

  const milestones = [25, 50, 75, 100];
  const reached = milestones.find((item) => beforePercent < item && afterPercent >= item);
  if (reached) {
    return {
      key: `milestone${reached}`,
      title: `目标进度到 ${reached}% 了`,
      desc: "阶段成果适合生成隐私进度卡，晒坚持不晒具体金额。",
    };
  }
  return null;
}

module.exports = {
  POSTER_THEMES,
  XHS_TAGS,
  buildXhsMaterials,
  getPosterThemeByKey,
  getPosterRenderModel,
  getSelectedGoalStatus,
  getSharePrompt,
  getXhsMaterial,
  reconcileGoalCompletion,
};
