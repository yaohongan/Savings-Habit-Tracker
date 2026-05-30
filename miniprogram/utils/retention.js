const BACKUP_PREFIX = "XJ3:";

function compactGoal(goal = {}) {
  return {
    i: goal.id,
    n: goal.name,
    t: goal.target,
    s: goal.saved,
    d: goal.deadline,
    c: goal.createdAt,
    m: goal.mode,
    o: goal.icon,
    co: goal.color,
    ac: goal.accentColor,
    sn: goal.scriptName,
    st: goal.scriptTip,
  };
}

function expandGoal(goal = {}) {
  if (goal.name || goal.target || goal.saved) return goal;
  return {
    id: goal.i,
    name: goal.n,
    target: goal.t,
    saved: goal.s,
    deadline: goal.d,
    createdAt: goal.c,
    mode: goal.m,
    icon: goal.o,
    color: goal.co,
    accentColor: goal.ac,
    scriptName: goal.sn,
    scriptTip: goal.st,
  };
}

function compactHistory(item = {}) {
  return {
    a: item.amount,
    g: item.goalId,
    d: item.date,
    n: item.note,
    mk: item.moodKey,
    ml: item.moodLabel,
    me: item.moodEmoji,
  };
}

function expandHistory(item = {}) {
  if (item.amount || item.goalId || item.date) return item;
  return {
    amount: item.a,
    goalId: item.g,
    date: item.d,
    note: item.n,
    moodKey: item.mk,
    moodLabel: item.ml,
    moodEmoji: item.me,
  };
}

function compactLocalData(localData = {}) {
  return {
    g: (localData.goals || []).map(compactGoal),
    h: (localData.history || []).map(compactHistory),
    s: localData.streak || 0,
    l: localData.lastCheckInDate || "",
    r: localData.reminderRequestedAt || "",
    a: localData.achievements || {},
  };
}

function expandCompactData(compact = {}) {
  return {
    goals: (compact.g || []).map(expandGoal),
    history: (compact.h || []).map(expandHistory),
    streak: compact.s || 0,
    lastCheckInDate: compact.l || "",
    reminderRequestedAt: compact.r || "",
    achievements: compact.a || {},
  };
}

function buildBackupPayload(localData, exportedAt = new Date().toISOString()) {
  return `${BACKUP_PREFIX}${JSON.stringify({
    v: 3,
    e: exportedAt,
    d: compactLocalData(localData),
  })}`;
}

function buildBackupSummary(localData = {}) {
  const goals = Array.isArray(localData.goals) ? localData.goals : [];
  const history = Array.isArray(localData.history) ? localData.history : [];
  const latestDate = localData.lastCheckInDate
    || history.reduce((latest, item) => item.date && item.date > latest ? item.date : latest, "");
  const dateText = latestDate || "还没有打卡";
  return `目标 ${goals.length} 个 · 记录 ${history.length} 条 · 最近 ${dateText} · 连续 ${localData.streak || 0} 天`;
}

function parseBackupPayload(input) {
  const text = String(input || "").trim();
  if (!text) {
    return { ok: false, error: "请先粘贴备份内容。" };
  }

  let parsed = null;
  try {
    parsed = text.startsWith(BACKUP_PREFIX)
      ? JSON.parse(text.slice(BACKUP_PREFIX.length))
      : JSON.parse(text);
  } catch (err) {
    return { ok: false, error: "备份内容不是有效格式，请确认复制的是完整备份码。" };
  }

  const restored = parsed && parsed.v === 3 && parsed.d
    ? expandCompactData(parsed.d)
    : (parsed && parsed.data && typeof parsed.data === "object"
      ? parsed.data
      : (parsed && Array.isArray(parsed.goals) && Array.isArray(parsed.history) ? parsed : null));

  if (!restored || !Array.isArray(restored.goals) || !Array.isArray(restored.history)) {
    return { ok: false, error: "没有识别到目标和打卡记录，不能恢复。" };
  }

  return {
    ok: true,
    data: restored,
    summary: buildBackupSummary(restored),
  };
}

function buildTomorrowActionText(goalName, suggestedAmountDisplay, hasCheckedInToday) {
  if (!goalName) return "";
  const amountText = suggestedAmountDisplay || "0.00";
  const amount = Number(String(amountText).replace(/,/g, ""));
  if (!amount || amount <= 0) {
    return `明天继续点亮「${goalName}」，也可以开一个新的小目标。`;
  }
  if (hasCheckedInToday) {
    return `明天先存 ¥${amountText}，继续点亮「${goalName}」。`;
  }
  return `今天完成后，明天先存 ¥${amountText}，节奏会更稳。`;
}

function buildShareRecallLine(goalName, suggestedAmountDisplay) {
  if (!goalName) return "明天继续点亮一格，把这个攒钱挑战接住。";
  const amount = Number(String(suggestedAmountDisplay || "0").replace(/,/g, ""));
  if (!amount || amount <= 0) {
    return `明天继续点亮「${goalName}」，也可以新开一个小目标。`;
  }
  return `明天继续点亮「${goalName}」，建议先存 ¥${suggestedAmountDisplay || "0.00"}。`;
}

module.exports = {
  BACKUP_PREFIX,
  buildBackupPayload,
  buildBackupSummary,
  parseBackupPayload,
  buildTomorrowActionText,
  buildShareRecallLine,
};
