const STORAGE_KEY = "xj_saving_data_v1";
const {
  buildBackupPayload,
  buildBackupSummary,
  parseBackupPayload,
  buildTomorrowActionText,
  buildShareRecallLine,
} = require("../../utils/retention");

const HOT_GOAL_TEMPLATES = [
  { name: "旅行基金", icon: "✈️", color: "#EBF5FB", accentColor: "#5DADE2" },
  { name: "买房首付", icon: "🏠", color: "#E8F8F5", accentColor: "#48C9B0" },
  { name: "应急备用金", icon: "🛡️", color: "#FDEDEC", accentColor: "#FF7E79" },
  { name: "买车基金", icon: "🚗", color: "#E8F5E9", accentColor: "#66BB6A" },
  { name: "365天攒钱", icon: "📅", color: "#FFF3E0", accentColor: "#FFA726" },
  { name: "52周攒钱", icon: "📊", color: "#E3F2FD", accentColor: "#42A5F5" },
  { name: "生日基金", icon: "🎂", color: "#FCE4EC", accentColor: "#EC407A" },
  { name: "退休养老", icon: "🌴", color: "#EFEBE9", accentColor: "#8D6E63" },
];

const CHALLENGE_SCRIPTS = [
  {
    name: "100天无痛攒钱",
    subtitle: "每天少花一点，100 天看见结果",
    icon: "🌱",
    target: "3000",
    days: 100,
    mode: "daily",
    color: "#EAF7EF",
    accentColor: "#4FAF7B",
    tip: "每天先存一小笔，不追求大额，只追求不断。",
  },
  {
    name: "奶茶戒断基金",
    subtitle: "少喝一杯，就给自己存一杯",
    icon: "🥤",
    target: "1800",
    days: 90,
    mode: "daily",
    color: "#FFF1E7",
    accentColor: "#F08A5D",
    tip: "把想买奶茶的那一刻，变成点亮挑战墙的一格。",
  },
  {
    name: "旅行出发基金",
    subtitle: "为下一次出发提前攒路费",
    icon: "🧳",
    target: "5000",
    days: 180,
    mode: "daily",
    color: "#EBF5FB",
    accentColor: "#5DADE2",
    tip: "每一笔都是离出发更近一点，适合截图分享进度。",
  },
  {
    name: "发薪日先存",
    subtitle: "工资到账，先把未来留出来",
    icon: "💼",
    target: "12000",
    days: 365,
    mode: "monthly",
    color: "#E8F8F5",
    accentColor: "#48C9B0",
    tip: "每次发薪先存一笔，比月底剩多少再存更稳。",
  },
  {
    name: "情侣旅行基金",
    subtitle: "两个人一起攒一个目的地",
    icon: "💑",
    target: "8000",
    days: 240,
    mode: "weekly",
    color: "#FCE4EC",
    accentColor: "#EC407A",
    tip: "适合互相提醒、一起截图复盘，但不用做复杂社交。",
  },
  {
    name: "30天应急金",
    subtitle: "先攒出一笔让自己安心的钱",
    icon: "🛟",
    target: "3000",
    days: 30,
    mode: "daily",
    color: "#FDEDEC",
    accentColor: "#FF7E79",
    tip: "目标短、反馈快，适合第一次打开小程序的新用户。",
  },
];

const GOAL_MODES = [
  { key: "free", name: "自由攒", desc: "先开始，想到就存一笔" },
  { key: "daily", name: "365天", desc: "适合每天打卡一点点" },
  { key: "weekly", name: "52周", desc: "适合每周固定存一次" },
  { key: "monthly", name: "每月定存", desc: "适合发薪日固定存钱" },
];
const CALENDAR_WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const NOTE_TEMPLATES = ["今天忍住没乱花", "先为目标存一点", "发工资先存起来", "给未来的自己留一笔"];
const MOOD_TAGS = [
  { key: "steady", label: "稳稳存下", emoji: "🌿" },
  { key: "restrain", label: "忍住乱花", emoji: "🙌" },
  { key: "salary", label: "发薪先存", emoji: "💼" },
  { key: "happy", label: "开心奖励", emoji: "✨" },
  { key: "stress", label: "给点安全感", emoji: "🛟" },
];

const POSTER_THEMES = [
  { key: "cream", name: "奶油日签", desc: "温柔复盘感", bgStart: "#E8F8F5", bgMid: "#EBF5FB", bgEnd: "#FDFBF7", accent: "#48C9B0", title: "#2C3E50", sub: "#7F8C8D" },
  { key: "challenge", name: "深绿挑战", desc: "适合晒进度", bgStart: "#143D3A", bgMid: "#1D7369", bgEnd: "#F08A5D", accent: "#FFE2C5", title: "#FFFFFF", sub: "rgba(255,255,255,0.78)" },
  { key: "sunset", name: "暖橙成就", desc: "适合达成时刻", bgStart: "#FFF1E7", bgMid: "#FFD7BF", bgEnd: "#FDFBF7", accent: "#F08A5D", title: "#5A3428", sub: "#9A6A55" },
];

const KEYBOARD_NUM = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];
const POSTER_WIDTH = 750;
const POSTER_HEIGHT = 1334;
const POSTER_MINI_CODE_SRC = "../../images/share-mini-code.jpg";
const REMINDER_TEMPLATE_ID = "";

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.closePath();
}

function formatAmount(value) {
  const num = Number(value) || 0;
  const fixed = (Math.round(num * 100) / 100).toFixed(2);
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMoodTagByKey(key) {
  return MOOD_TAGS.find((item) => item.key === key) || MOOD_TAGS[0];
}

function getPosterThemeByKey(key) {
  return POSTER_THEMES.find((item) => item.key === key) || POSTER_THEMES[0];
}

function parseDateKey(dateKey) {
  if (!dateKey || typeof dateKey !== "string") return null;
  const parts = dateKey.split("-").map(Number);
  if (parts.length !== 3 || parts.some((item) => Number.isNaN(item))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function calcDayDiff(from, to) {
  const fromDate = parseDateKey(from) || new Date(from);
  const toDate = parseDateKey(to) || new Date(to);
  const fromUtc = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const toUtc = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.floor((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

function buildCheckInRecoveryText(lastCheckInDate, todayKey = toDateKey()) {
  if (!lastCheckInDate) return "";
  const dayDiff = calcDayDiff(lastCheckInDate, todayKey);
  if (dayDiff <= 1) return "";
  if (dayDiff === 2) {
    return "昨天断了一下没关系，今天补一笔就把节奏接回来。";
  }
  return `已经 ${dayDiff} 天没记录了，今天先存一小笔，当作重新开始。`;
}

function isReminderAccepted(subscribeResult) {
  return subscribeResult && subscribeResult[REMINDER_TEMPLATE_ID] === "accept";
}

function calcRemainingDays(deadline) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffMs = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getWeekStart(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getModeDefaults(modeKey) {
  const today = new Date();
  switch (modeKey) {
    case "daily":
      return {
        target: "3650",
        deadline: addDays(today, 365),
      };
    case "weekly":
      return {
        target: "5200",
        deadline: addDays(today, 364),
      };
    case "monthly":
      return {
        target: "12000",
        deadline: addDays(today, 365),
      };
    default:
      return {
        target: "",
        deadline: addDays(today, 365),
      };
  }
}

function normalizeSuggestedAmount(amount) {
  if (!amount || amount <= 0) return 0;
  if (amount < 20) return Math.ceil(amount);
  if (amount < 100) return Math.ceil(amount / 5) * 5;
  if (amount < 500) return Math.ceil(amount / 10) * 10;
  if (amount < 1000) return Math.ceil(amount / 50) * 50;
  return Math.ceil(amount / 100) * 100;
}

function calcSuggestedAmount(goal) {
  const target = Number(goal.target || 0);
  const saved = Number(goal.saved || 0);
  const remaining = Math.max(target - saved, 0);
  if (!remaining) return 0;

  const remainingDays = calcRemainingDays(goal.deadline);
  if (remainingDays && remainingDays > 0) {
    return normalizeSuggestedAmount(remaining / remainingDays);
  }

  if (goal.mode === "weekly") {
    return normalizeSuggestedAmount(remaining / 4);
  }
  if (goal.mode === "monthly") {
    return normalizeSuggestedAmount(remaining / 3);
  }

  return normalizeSuggestedAmount(Math.max(remaining / 30, 10));
}

function getNextMilestonePercent(percent) {
  const milestones = [25, 50, 75, 100];
  return milestones.find((value) => percent < value) || null;
}

function buildRhythmDays(history = []) {
  const grouped = history.reduce((acc, item) => {
    const key = item.date;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const days = [];
  for (let offset = 27; offset >= 0; offset -= 1) {
    const date = addDays(new Date(), -offset);
    const key = toDateKey(date);
    const amount = grouped[key] || 0;
    let level = 0;
    if (amount >= 200) {
      level = 3;
    } else if (amount >= 50) {
      level = 2;
    } else if (amount > 0) {
      level = 1;
    }

    days.push({
      key,
      label: String(date.getDate()).padStart(2, "0"),
      amountDisplay: formatAmount(amount),
      amount,
      level,
      levelClass: `rhythm-level-${level}`,
      isToday: offset === 0,
    });
  }

  const activeDays = days.filter((item) => item.amount > 0).length;
  const recentTotal = days.reduce((sum, item) => sum + item.amount, 0);
  const weekCheckIns = days.slice(-7).filter((item) => item.amount > 0).length;

  return {
    days,
    activeDays,
    recentTotal,
    weekCheckIns,
  };
}

function calcLongestActiveStreak(days = []) {
  let longest = 0;
  let current = 0;
  days.forEach((item) => {
    if (item.amount > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
}

function buildMonthlyCalendar(history = [], date = new Date()) {
  const grouped = history.reduce((acc, item) => {
    const key = item.date;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = (firstDay.getDay() + 6) % 7;
  const totalSlots = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7;
  const todayKey = toDateKey();
  const monthDays = [];

  for (let index = 0; index < totalSlots; index += 1) {
    const day = index - leadingEmpty + 1;
    if (day < 1 || day > daysInMonth) {
      monthDays.push({
        key: `empty-${index}`,
        dayLabel: "",
        amountDisplay: "0.00",
        isCurrentMonth: false,
        isToday: false,
        levelClass: "calendar-level-empty",
      });
      continue;
    }

    const currentDate = new Date(year, month, day);
    const key = toDateKey(currentDate);
    const amount = grouped[key] || 0;
    let level = 0;
    if (amount >= 200) {
      level = 3;
    } else if (amount >= 50) {
      level = 2;
    } else if (amount > 0) {
      level = 1;
    }

    monthDays.push({
      key,
      dayLabel: String(day),
      amountDisplay: formatAmount(amount),
      amount,
      isCurrentMonth: true,
      isToday: key === todayKey,
      levelClass: `calendar-level-${level}`,
    });
  }

  const activeDays = monthDays.filter((item) => item.isCurrentMonth && item.amount > 0).length;
  const monthlyTotal = monthDays
    .filter((item) => item.isCurrentMonth)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const longestStreak = calcLongestActiveStreak(monthDays.filter((item) => item.isCurrentMonth));

  return {
    monthTitle: `${year} 年 ${month + 1} 月`,
    days: monthDays,
    activeDays,
    monthlyTotal,
    longestStreak,
  };
}

function buildMonthlySummary(goals = [], history = [], achievements = {}, date = new Date()) {
  const monthKey = toMonthKey(date);
  const monthlyHistory = history.filter((item) => typeof item.date === "string" && item.date.startsWith(monthKey));
  const activeDays = new Set(monthlyHistory.map((item) => item.date)).size;
  const monthlyTotal = monthlyHistory.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const averagePerCheckIn = monthlyHistory.length > 0 ? monthlyTotal / monthlyHistory.length : 0;
  const unlockedCount = Object.values(achievements || {}).filter(Boolean).length;
  const daysSoFar = date.getDate();
  const activeRate = daysSoFar > 0 ? (activeDays / daysSoFar) * 100 : 0;

  const goalTotals = monthlyHistory.reduce((acc, item) => {
    acc[item.goalId] = (acc[item.goalId] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  let topGoalName = "还没有主力目标";
  let topGoalAmount = 0;
  Object.keys(goalTotals).forEach((goalId) => {
    const amount = goalTotals[goalId];
    if (amount <= topGoalAmount) return;
    const goal = goals.find((item) => item.id === Number(goalId));
    topGoalAmount = amount;
    topGoalName = goal ? goal.name : "我的目标";
  });

  let insight = "这个月还没开始记一笔，今天先完成第一格。";
  if (monthlyHistory.length > 0) {
    if (activeRate >= 70) {
      insight = "你这个月的攒钱节奏很稳，已经进入“看得见进步”的状态。";
    } else if (activeRate >= 35) {
      insight = "这个月已经形成一些节奏了，再把空白天填满一点会很漂亮。";
    } else {
      insight = "已经开了个好头，接下来更重要的是把记录变得连续。";
    }
  }

  const reportText = [
    `${date.getFullYear()} 年 ${date.getMonth() + 1} 月，我在小简攒钱打卡里已经打卡 ${activeDays} 天。`,
    `本月累计攒下 ¥${formatAmount(monthlyTotal)}，单次平均 ¥${formatAmount(averagePerCheckIn)}。`,
    topGoalAmount > 0 ? `这个月最投入的目标是「${topGoalName}」，已经存入 ¥${formatAmount(topGoalAmount)}。` : "这个月还没有形成主力目标，先从最想完成的一件事开始。",
    `目前已解锁 ${unlockedCount} 个成就。`,
  ].join("");

  return {
    activeDays,
    monthlyTotal,
    averagePerCheckIn,
    unlockedCount,
    topGoalName,
    topGoalAmount,
    insight,
    reportText,
    activeRate,
  };
}

function buildWeeklySummary(goals = [], history = [], date = new Date()) {
  const weekStart = getWeekStart(date);
  const weekEnd = addDays(weekStart, 6);
  const weekStartKey = toDateKey(weekStart);
  const weekEndKey = toDateKey(weekEnd);
  const weeklyHistory = history.filter((item) => (
    typeof item.date === "string" && item.date >= weekStartKey && item.date <= weekEndKey
  ));
  const activeDays = new Set(weeklyHistory.map((item) => item.date)).size;
  const weeklyTotal = weeklyHistory.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const averagePerDay = activeDays > 0 ? weeklyTotal / activeDays : 0;

  const goalTotals = weeklyHistory.reduce((acc, item) => {
    acc[item.goalId] = (acc[item.goalId] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  let topGoalName = "还没有主力目标";
  let topGoalAmount = 0;
  Object.keys(goalTotals).forEach((goalId) => {
    const amount = goalTotals[goalId];
    if (amount <= topGoalAmount) return;
    const goal = goals.find((item) => item.id === Number(goalId));
    topGoalAmount = amount;
    topGoalName = goal ? goal.name : "我的目标";
  });

  const moodCounts = weeklyHistory.reduce((acc, item) => {
    const key = item.moodKey || "steady";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topMoodKey = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || "steady";
  const topMood = getMoodTagByKey(topMoodKey);

  let insight = "这周还没开始，先点亮今天这一格就够了。";
  if (activeDays >= 5) {
    insight = "这周节奏很稳，已经是一个值得晒出来的攒钱周了。";
  } else if (activeDays >= 3) {
    insight = "这周已经形成节奏，再补两天就会很好看。";
  } else if (activeDays > 0) {
    insight = "这周已经开局，接下来优先把打卡变连续。";
  }

  const reportText = [
    `这周我在小简攒钱打卡里打卡 ${activeDays} 天，累计攒下 ¥${formatAmount(weeklyTotal)}。`,
    topGoalAmount > 0 ? `本周最投入的是「${topGoalName}」，存入 ¥${formatAmount(topGoalAmount)}。` : "这周还没有主力目标，先从最想完成的一件事开始。",
    `最常见的记录状态是「${topMood.emoji} ${topMood.label}」。`,
    insight,
  ].join("\n");

  return {
    activeDays,
    weeklyTotal,
    averagePerDay,
    topGoalName,
    topGoalAmount,
    topMood,
    insight,
    reportText,
    rangeText: `${weekStart.getMonth() + 1}.${weekStart.getDate()} - ${weekEnd.getMonth() + 1}.${weekEnd.getDate()}`,
  };
}

function buildChallengeBoard(goals = [], history = [], date = new Date()) {
  const todayKey = toDateKey(date);
  const sortedHistory = [...history]
    .filter((item) => item.date && parseDateKey(item.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const primaryGoal = goals.find((item) => item.mode === "daily" && !item.completed)
    || goals.find((item) => !item.completed)
    || goals[0]
    || null;
  const firstHistoryDate = sortedHistory[0] ? sortedHistory[0].date : "";
  const inferredStart = primaryGoal && primaryGoal.createdAt
    ? primaryGoal.createdAt
    : (firstHistoryDate || todayKey);
  const startDate = parseDateKey(inferredStart) || parseDateKey(todayKey) || new Date();
  startDate.setHours(0, 0, 0, 0);

  const grouped = sortedHistory.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const days = [];
  let litDays = 0;
  let totalAmount = 0;
  const todayDiff = calcDayDiff(toDateKey(startDate), todayKey);
  const elapsedDays = Math.max(1, Math.min(365, todayDiff + 1));

  for (let index = 0; index < 365; index += 1) {
    const currentDate = addDays(startDate, index);
    const key = toDateKey(currentDate);
    const amount = grouped[key] || 0;
    const isLit = amount > 0;
    const isToday = key === todayKey;
    const isFuture = index >= elapsedDays;

    if (isLit) {
      litDays += 1;
      totalAmount += amount;
    }

    let level = 0;
    if (amount >= 200) {
      level = 3;
    } else if (amount >= 50) {
      level = 2;
    } else if (amount > 0) {
      level = 1;
    }

    days.push({
      key,
      index: index + 1,
      amount,
      isLit,
      isToday,
      isFuture,
      levelClass: `challenge-level-${level}`,
    });
  }

  const percent = Math.min(100, (litDays / 365) * 100);
  const leftDays = Math.max(365 - litDays, 0);
  const todayAmount = grouped[todayKey] || 0;
  const challengeName = primaryGoal ? primaryGoal.name : "我的 365 天攒钱挑战";
  const startText = `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, "0")}.${String(startDate.getDate()).padStart(2, "0")}`;

  let statusText = "先点亮第一格，长期坚持就有了一个看得见的开头。";
  if (litDays >= 100) {
    statusText = "已经点亮 100 格以上，这面墙很适合拿去晒一下。";
  } else if (litDays >= 30) {
    statusText = "已经坚持过一个月了，接下来要做的是让点亮墙越来越密。";
  } else if (litDays >= 7) {
    statusText = "一周节奏已经建立，继续把空格一点点补上。";
  } else if (todayAmount > 0) {
    statusText = "今天已经点亮，明天再来，这个挑战就开始变厚了。";
  }

  const shareText = [
    `我正在小简攒钱打卡完成「${challengeName}」。`,
    `365 天挑战已经点亮 ${litDays} 格，累计攒下 ¥${formatAmount(totalAmount)}。`,
    buildShareRecallLine(challengeName, primaryGoal ? formatAmount(calcSuggestedAmount(primaryGoal)) : "0.00"),
    `从 ${startText} 开始，把想要的生活一格一格存出来。`,
  ].join("\n");

  return {
    days,
    litDays,
    totalAmount,
    percent,
    leftDays,
    elapsedDays,
    todayAmount,
    todayLit: todayAmount > 0,
    startText,
    statusText,
    shareText,
    challengeName,
  };
}

function getProgressColor(percent) {
  if (percent >= 100) return "#FFD700";
  if (percent >= 80) return "#4CAF50";
  if (percent >= 30) return "#FF9800";
  return "#2196F3";
}

function drawRoundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + width, y + height - r);
  ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + height);
  ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, (Math.PI * 3) / 2);
  ctx.closePath();
}

function getBaseLocalData() {
  return {
    goals: [],
    history: [],
    streak: 0,
    lastCheckInDate: "",
    reminderRequestedAt: "",
    achievements: {
      firstDeposit: false,
      thousandTotal: false,
      tenThousandTotal: false,
      sevenDaysStreak: false,
      thirtyDaysStreak: false,
      oneGoalDone: false,
      fiveGoalsDone: false,
    },
  };
}

function normalizeLocalData(local) {
  const base = getBaseLocalData();
  const source = local && typeof local === "object" ? local : {};
  return {
    ...base,
    ...source,
    achievements: {
      ...base.achievements,
      ...(source.achievements || {}),
    },
  };
}

Page({
  data: {
    statusBarHeight: 20,
    showCheckInPopup: false,
    showCreateGoalPopup: false,
    showEditGoalPopup: false,
    showHistoryPopup: false,
    showAchievementsPopup: false,
    showBackupPopup: false,
    showReviewPanel: false,
    pendingCheckInGoalId: 0,
    inputAmount: "0",
    inputNote: "",
    selectedMoodKey: "steady",
    selectedGoalId: 1,
    editingGoalId: null,
    today: "",
    createGoalName: "",
    createGoalTarget: "",
    createGoalDeadline: "",
    createGoalMode: "free",
    createGoalIcon: "",
    createGoalColor: "",
    createGoalAccentColor: "",
    createGoalScriptTip: "",
    createGoalScriptName: "",
    editGoalName: "",
    editGoalTarget: "",
    editGoalDeadline: "",
    currentGoalHistory: [],
    showCelebration: false,
    celebrationGoalName: "",
    keyboardNum: KEYBOARD_NUM,
    quickAmounts: QUICK_AMOUNTS,
    noteTemplates: NOTE_TEMPLATES,
    moodTags: MOOD_TAGS,
    posterThemes: POSTER_THEMES,
    hotGoalTemplates: HOT_GOAL_TEMPLATES,
    challengeScripts: CHALLENGE_SCRIPTS,
    goalModes: GOAL_MODES,
    goals: [],
    totalSavedDisplay: "0.00",
    totalGoalDisplay: "0.00",
    overallPercent: 0,
    overallPercentDisplay: "0.0%",
    monthlyAddedDisplay: "0",
    streakDisplay: "0",
    totalCheckInsDisplay: "0",
    doneGoalsCountDisplay: "0",
    dailyAvgDisplay: "0",
    todaySavedDisplay: "0.00",
    rhythmDays: [],
    rhythmActiveDaysDisplay: "0",
    rhythmRecentAddedDisplay: "0.00",
    rhythmWeekCheckInsDisplay: "0",
    rhythmStatusText: "",
    calendarWeekdays: CALENDAR_WEEKDAYS,
    calendarMonthTitle: "",
    calendarDays: [],
    calendarActiveDaysDisplay: "0",
    calendarMonthlyAddedDisplay: "0.00",
    calendarLongestStreakDisplay: "0",
    calendarStatusText: "",
    monthlySummaryDaysDisplay: "0",
    monthlySummaryAmountDisplay: "0.00",
    monthlySummaryAverageDisplay: "0.00",
    monthlySummaryUnlockedDisplay: "0",
    monthlySummaryTopGoalName: "",
    monthlySummaryTopGoalAmountDisplay: "0.00",
    monthlySummaryInsight: "",
    monthlySummaryReportText: "",
    weeklySummaryRangeText: "",
    weeklySummaryDaysDisplay: "0",
    weeklySummaryAmountDisplay: "0.00",
    weeklySummaryAverageDisplay: "0.00",
    weeklySummaryTopGoalName: "",
    weeklySummaryTopGoalAmountDisplay: "0.00",
    weeklySummaryMoodText: "",
    weeklySummaryInsight: "",
    weeklySummaryReportText: "",
    supervisionShareText: "",
    challengeDays: [],
    challengeLitDaysDisplay: "0",
    challengePercent: 0,
    challengePercentDisplay: "0.0%",
    challengeTotalAmountDisplay: "0.00",
    challengeLeftDaysDisplay: "365",
    challengeElapsedDaysDisplay: "1",
    challengeTodayStateText: "",
    challengeTodayDone: false,
    challengeStartText: "",
    challengeStatusText: "",
    challengeShareText: "",
    challengeName: "",
    backupPayload: "",
    backupSummaryText: "",
    backupInput: "",
    restorePreviewText: "",
    restoreErrorText: "",
    focusGoalName: "",
    focusGoalId: 0,
    focusGoalPercentDisplay: "0.0%",
    focusGoalSavedDisplay: "0.00",
    focusGoalTargetDisplay: "0.00",
    focusGoalRemainingDisplay: "0.00",
    focusGoalRemainingDaysText: "",
    focusGoalSuggestedAmountDisplay: "0.00",
    focusGoalTodayAddedDisplay: "0.00",
    focusGoalHint: "",
    focusGoalMilestoneText: "",
    selectedGoalSuggestedAmountDisplay: "0.00",
    selectedGoalTodayAddedDisplay: "0.00",
    selectedGoalHint: "",
    posterWidth: 750,
    posterHeight: 1334,
    isGeneratingPoster: false,
    posterThemeKey: "challenge",
    nextActionText: "",
    reminderStatusText: "开启提醒，明天继续点亮一格",
    recoveryPromptText: "",
    achievements: {
      firstDeposit: false,
      thousandTotal: false,
      tenThousandTotal: false,
      sevenDaysStreak: false,
      thirtyDaysStreak: false,
      oneGoalDone: false,
      fiveGoalsDone: false,
    },
    achievementList: [
      { key: "firstDeposit", name: "第一桶金", desc: "完成第一笔攒钱记录", icon: "🥇" },
      { key: "thousandTotal", name: "日积月累", desc: "累计攒钱满 1000 元", icon: "💰" },
      { key: "tenThousandTotal", name: "小有积蓄", desc: "累计攒钱满 10000 元", icon: "💎" },
      { key: "sevenDaysStreak", name: "持之以恒", desc: "连续打卡 7 天", icon: "🔥" },
      { key: "thirtyDaysStreak", name: "坚持不懈", desc: "连续打卡 30 天", icon: "⭐" },
      { key: "oneGoalDone", name: "目标达成", desc: "完成 1 个攒钱目标", icon: "✅" },
      { key: "fiveGoalsDone", name: "攒钱达人", desc: "完成 5 个攒钱目标", icon: "👑" },
    ],
  },

  onLoad(options = {}) {
    this.launchOptions = options;
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      today: this.formatDateForPicker(new Date()),
    });
    this.loadLocalData();
  },

  loadLocalData() {
    const local = wx.getStorageSync(STORAGE_KEY);
    this.localData = normalizeLocalData(local);
    this.refreshDashboard();
  },

  checkAndUpdateAchievements() {
    const goals = this.localData.goals || [];
    const history = this.localData.history || [];
    const totalSaved = goals.reduce((sum, item) => sum + Number(item.saved || 0), 0);
    const streak = this.localData.streak || 0;
    const doneGoals = goals.filter(g => Number(g.saved || 0) >= Number(g.target || 0)).length;

    const achievements = { ...this.localData.achievements };

    if (history.length > 0 && !achievements.firstDeposit) {
      achievements.firstDeposit = true;
      wx.showToast({ title: "解锁成就: 第一桶金 🥇", icon: "none" });
    }
    if (totalSaved >= 1000 && !achievements.thousandTotal) {
      achievements.thousandTotal = true;
      wx.showToast({ title: "解锁成就: 日积月累 💰", icon: "none" });
    }
    if (totalSaved >= 10000 && !achievements.tenThousandTotal) {
      achievements.tenThousandTotal = true;
      wx.showToast({ title: "解锁成就: 小有积蓄 💎", icon: "none" });
    }
    if (streak >= 7 && !achievements.sevenDaysStreak) {
      achievements.sevenDaysStreak = true;
      wx.showToast({ title: "解锁成就: 持之以恒 🔥", icon: "none" });
    }
    if (streak >= 30 && !achievements.thirtyDaysStreak) {
      achievements.thirtyDaysStreak = true;
      wx.showToast({ title: "解锁成就: 坚持不懈 ⭐", icon: "none" });
    }
    if (doneGoals >= 1 && !achievements.oneGoalDone) {
      achievements.oneGoalDone = true;
      wx.showToast({ title: "解锁成就: 目标达成 ✅", icon: "none" });
    }
    if (doneGoals >= 5 && !achievements.fiveGoalsDone) {
      achievements.fiveGoalsDone = true;
      wx.showToast({ title: "解锁成就: 攒钱达人 👑", icon: "none" });
    }

    this.localData.achievements = achievements;
    this.setData({ achievements });
  },

  checkGoalCompletion() {
    const goals = this.localData.goals || [];
    let newlyCompleted = null;
    goals.forEach(item => {
      const saved = Number(item.saved || 0);
      const target = Number(item.target || 0);
      if (saved >= target && !item.completed) {
        item.completed = true;
        newlyCompleted = item.name;
      }
    });

    if (newlyCompleted) {
      this.saveLocalData();
      this.setData({
        showCelebration: true,
        celebrationGoalName: newlyCompleted,
      });
    }
  },

  closeCelebration() {
    this.setData({
      showCelebration: false,
      celebrationGoalName: "",
    });
  },

  refreshDashboard() {
    const goals = this.localData.goals || [];
    const history = this.localData.history || [];
    this.checkGoalCompletion();
    this.checkAndUpdateAchievements();

    const totalSaved = goals.reduce((sum, item) => sum + Number(item.saved || 0), 0);
    const totalGoal = goals.reduce((sum, item) => sum + Number(item.target || 0), 0);
    const overallPercent = totalGoal > 0 ? Math.min(100, (totalSaved / totalGoal) * 100) : 0;
    const todayKey = toDateKey();

    const monthKey = toMonthKey();
    const monthlyAdded = history
      .filter((item) => typeof item.date === "string" && item.date.startsWith(monthKey))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const todaySaved = history
      .filter((item) => item.date === todayKey)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const days = new Date().getDate();
    const dailyAvg = days > 0 ? monthlyAdded / days : 0;

    const totalCheckIns = history.length;
    const doneGoals = goals.filter(g => g.completed).length;

    const sortedGoals = [...goals].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    const mappedGoals = sortedGoals.map((item) => {
      const target = Number(item.target || 0);
      const saved = Number(item.saved || 0);
      const percent = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
      const remaining = Math.max(target - saved, 0);
      const remainingDays = calcRemainingDays(item.deadline);
      const progressColor = getProgressColor(percent);
      const suggestedAmount = calcSuggestedAmount(item);
      const todayAdded = history
        .filter((record) => record.goalId === item.id && record.date === todayKey)
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
      const nextMilestonePercent = getNextMilestonePercent(percent);
      const nextMilestoneAmount = nextMilestonePercent
        ? Math.max(target * (nextMilestonePercent / 100) - saved, 0)
        : 0;
      const modeName = GOAL_MODES.find((mode) => mode.key === item.mode)?.name || "自由攒";
      const scriptStatusText = item.scriptName
        ? (percent >= 100
          ? "剧本已完成，可以复制一段达成文案去晒成果。"
          : `剧本进度 ${percent.toFixed(1)}%，继续把这个场景坚持到底。`)
        : "";
      return {
        ...item,
        percent: percent.toFixed(1),
        remaining,
        progressColor,
        remainingDays,
        suggestedAmount,
        todayAdded,
        todayAddedDisplay: formatAmount(todayAdded),
        suggestedAmountDisplay: formatAmount(suggestedAmount),
        nextMilestonePercent,
        nextMilestoneAmountDisplay: formatAmount(nextMilestoneAmount),
        modeName,
        actionText: todayAdded > 0
          ? `今天已攒 ¥${formatAmount(todayAdded)}`
          : `今天建议 ¥${formatAmount(suggestedAmount)}`,
        milestoneText: nextMilestonePercent
          ? `再存 ¥${formatAmount(nextMilestoneAmount)} 到 ${nextMilestonePercent}%`
          : "继续记录，目标会越来越近",
        targetDisplay: formatAmount(target),
        remainingDisplay: formatAmount(remaining),
        savedDisplay: formatAmount(saved),
        scriptStatusText,
      };
    });

    const rhythmBoard = buildRhythmDays(history);
    const monthlyCalendar = buildMonthlyCalendar(history);
    const monthlySummary = buildMonthlySummary(goals, history, this.localData.achievements, new Date());
    const weeklySummary = buildWeeklySummary(goals, history, new Date());
    const challengeBoard = buildChallengeBoard(goals, history, new Date());

    const focusGoal = mappedGoals.find((item) => !item.completed) || mappedGoals[0] || null;
    const selectedGoalId = mappedGoals.some((item) => item.id === this.data.selectedGoalId)
      ? this.data.selectedGoalId
      : (focusGoal ? focusGoal.id : 0);
    const selectedGoal = mappedGoals.find((item) => item.id === selectedGoalId) || focusGoal;
    const hasReminderTemplate = Boolean(REMINDER_TEMPLATE_ID);
    const recoveryPromptText = buildCheckInRecoveryText(this.localData.lastCheckInDate, todayKey);
    const nextActionText = focusGoal
      ? buildTomorrowActionText(
        focusGoal.name,
        focusGoal.suggestedAmountDisplay,
        Number(focusGoal.todayAdded || 0) > 0
      )
      : "";
    const shareRecallLine = focusGoal
      ? buildShareRecallLine(focusGoal.name, focusGoal.suggestedAmountDisplay)
      : "";
    const supervisionShareText = focusGoal
      ? [
        `我正在小简攒钱打卡坚持「${focusGoal.name}」。`,
        `现在进度 ${focusGoal.percent}%，365 点亮挑战已点亮 ${challengeBoard.litDays} 格。`,
        shareRecallLine,
        `明天你可以提醒我一句：今天点亮了吗？`,
      ].join("\n")
      : "";

    this.setData({
      goals: mappedGoals,
      totalSavedDisplay: formatAmount(totalSaved),
      totalGoalDisplay: formatAmount(totalGoal),
      overallPercent: Number(overallPercent.toFixed(2)),
      overallPercentDisplay: `${overallPercent.toFixed(1)}%`,
      monthlyAddedDisplay: formatAmount(monthlyAdded),
      streakDisplay: String(this.localData.streak || 0),
      totalCheckInsDisplay: String(totalCheckIns),
      doneGoalsCountDisplay: String(doneGoals),
      dailyAvgDisplay: formatAmount(dailyAvg),
      todaySavedDisplay: formatAmount(todaySaved),
      rhythmDays: rhythmBoard.days,
      rhythmActiveDaysDisplay: String(rhythmBoard.activeDays),
      rhythmRecentAddedDisplay: formatAmount(rhythmBoard.recentTotal),
      rhythmWeekCheckInsDisplay: String(rhythmBoard.weekCheckIns),
      rhythmStatusText: rhythmBoard.weekCheckIns >= 5
        ? "这周节奏很好，继续保持这股劲头。"
        : (todaySaved > 0
          ? "今天已经打卡，别让这条连续线断掉。"
          : "今天补一笔，最近 28 天的记录会更漂亮。"),
      calendarMonthTitle: monthlyCalendar.monthTitle,
      calendarDays: monthlyCalendar.days,
      calendarActiveDaysDisplay: String(monthlyCalendar.activeDays),
      calendarMonthlyAddedDisplay: formatAmount(monthlyCalendar.monthlyTotal),
      calendarLongestStreakDisplay: String(monthlyCalendar.longestStreak),
      calendarStatusText: monthlyCalendar.activeDays >= 10
        ? "这个月已经进入稳定节奏了，继续把空白格子慢慢点亮。"
        : (monthlyCalendar.activeDays > 0
          ? "这个月已经开始了，尽量把打卡分布得更均匀一点。"
          : "这个月还没留下记录，今天就是一个很好的开始。"),
      monthlySummaryDaysDisplay: String(monthlySummary.activeDays),
      monthlySummaryAmountDisplay: formatAmount(monthlySummary.monthlyTotal),
      monthlySummaryAverageDisplay: formatAmount(monthlySummary.averagePerCheckIn),
      monthlySummaryUnlockedDisplay: String(monthlySummary.unlockedCount),
      monthlySummaryTopGoalName: monthlySummary.topGoalName,
      monthlySummaryTopGoalAmountDisplay: formatAmount(monthlySummary.topGoalAmount),
      monthlySummaryInsight: monthlySummary.insight,
      monthlySummaryReportText: monthlySummary.reportText,
      weeklySummaryRangeText: weeklySummary.rangeText,
      weeklySummaryDaysDisplay: String(weeklySummary.activeDays),
      weeklySummaryAmountDisplay: formatAmount(weeklySummary.weeklyTotal),
      weeklySummaryAverageDisplay: formatAmount(weeklySummary.averagePerDay),
      weeklySummaryTopGoalName: weeklySummary.topGoalName,
      weeklySummaryTopGoalAmountDisplay: formatAmount(weeklySummary.topGoalAmount),
      weeklySummaryMoodText: `${weeklySummary.topMood.emoji} ${weeklySummary.topMood.label}`,
      weeklySummaryInsight: weeklySummary.insight,
      weeklySummaryReportText: weeklySummary.reportText,
      supervisionShareText,
      challengeDays: challengeBoard.days,
      challengeLitDaysDisplay: String(challengeBoard.litDays),
      challengePercent: Number(challengeBoard.percent.toFixed(2)),
      challengePercentDisplay: `${challengeBoard.percent.toFixed(1)}%`,
      challengeTotalAmountDisplay: formatAmount(challengeBoard.totalAmount),
      challengeLeftDaysDisplay: String(challengeBoard.leftDays),
      challengeElapsedDaysDisplay: String(challengeBoard.elapsedDays),
      challengeTodayStateText: challengeBoard.todayLit ? "今日已点亮" : "今日待点亮",
      challengeTodayDone: challengeBoard.todayLit,
      challengeStartText: challengeBoard.startText,
      challengeStatusText: challengeBoard.statusText,
      challengeShareText: challengeBoard.shareText,
      challengeName: challengeBoard.challengeName,
      focusGoalName: focusGoal ? focusGoal.name : "",
      focusGoalId: focusGoal ? focusGoal.id : 0,
      focusGoalPercentDisplay: focusGoal ? `${focusGoal.percent}%` : "0.0%",
      focusGoalSavedDisplay: focusGoal ? focusGoal.savedDisplay : "0.00",
      focusGoalTargetDisplay: focusGoal ? focusGoal.targetDisplay : "0.00",
      focusGoalRemainingDisplay: focusGoal ? focusGoal.remainingDisplay : "0.00",
      focusGoalRemainingDaysText: focusGoal
        ? (focusGoal.remainingDays === null
          ? "没设截止日，也建议给自己一个时间点"
          : (focusGoal.remainingDays >= 0
            ? `剩余 ${focusGoal.remainingDays} 天`
            : "已经超过截止日，今天补一笔会更安心"))
        : "",
      focusGoalSuggestedAmountDisplay: focusGoal ? focusGoal.suggestedAmountDisplay : "0.00",
      focusGoalTodayAddedDisplay: focusGoal ? focusGoal.todayAddedDisplay : "0.00",
      focusGoalHint: focusGoal
        ? (Number(focusGoal.todayAdded || 0) > 0
          ? `今天已经为「${focusGoal.name}」存入 ¥${focusGoal.todayAddedDisplay}，继续保持这个节奏就很好。`
          : `今天先存 ¥${focusGoal.suggestedAmountDisplay}，更容易按计划完成「${focusGoal.name}」。`)
        : "",
      focusGoalMilestoneText: focusGoal && focusGoal.nextMilestonePercent
        ? `再存 ¥${focusGoal.nextMilestoneAmountDisplay}，就能到 ${focusGoal.nextMilestonePercent}%`
        : "目标完成后会自动点亮勋章和庆祝动画",
      selectedGoalId,
      selectedGoalSuggestedAmountDisplay: selectedGoal ? selectedGoal.suggestedAmountDisplay : "0.00",
      selectedGoalTodayAddedDisplay: selectedGoal ? selectedGoal.todayAddedDisplay : "0.00",
      selectedGoalHint: selectedGoal
        ? (Number(selectedGoal.todayAdded || 0) > 0
          ? `今天已为这个目标存入 ¥${selectedGoal.todayAddedDisplay}`
          : `建议先存 ¥${selectedGoal.suggestedAmountDisplay}`)
        : "",
      reminderStatusText: hasReminderTemplate
        ? (this.localData.reminderRequestedAt
          ? "已尝试开启提醒，明天记得回来点亮"
          : "开启提醒，明天继续点亮一格")
        : "配置提醒模板后可开启",
      nextActionText,
      recoveryPromptText,
      achievements: this.localData.achievements,
    });
  },

  saveLocalData() {
    wx.setStorageSync(STORAGE_KEY, this.localData);
  },

  buildShareTitle() {
    const focusName = this.data.focusGoalName || "我的攒钱目标";
    if ((this.data.goals || []).length > 0) {
      return `我正在点亮「${focusName}」，明天继续点亮`;
    }
    return "和我一起开始小简攒钱打卡";
  },

  buildSharePath() {
    const focusGoalId = this.data.focusGoalId || "";
    const query = focusGoalId ? `?from=share&goalId=${focusGoalId}` : "?from=share";
    return `/pages/index/index${query}`;
  },

  onShareAppMessage() {
    return {
      title: this.buildShareTitle(),
      path: this.buildSharePath(),
    };
  },

  onShareTimeline() {
    return {
      title: this.buildShareTitle(),
      query: this.buildSharePath().split("?")[1] || "from=timeline",
    };
  },

  openCheckInForGoal(goalId, useSuggestedAmount = false) {
    const id = Number(goalId);
    const goals = this.localData.goals || [];
    const activeGoal = goals.find((item) => item.id === id)
      || goals.find((item) => !item.completed)
      || goals[0];
    const suggestedAmount = activeGoal && useSuggestedAmount
      ? calcSuggestedAmount(activeGoal)
      : 0;

    this.setData({
      showCheckInPopup: true,
      showCreateGoalPopup: false,
      inputAmount: suggestedAmount > 0 ? String(suggestedAmount) : "0",
      inputNote: "",
      selectedMoodKey: "steady",
      selectedGoalId: activeGoal ? activeGoal.id : this.data.selectedGoalId,
    });
  },

  onTapCheckIn() {
    const activeGoal = (this.data.goals || []).find((item) => !item.completed) || this.data.goals[0];
    this.openCheckInForGoal(activeGoal ? activeGoal.id : this.data.selectedGoalId);
  },

  onBottomPrimaryAction() {
    if ((this.data.goals || []).length > 0) {
      const activeGoal = (this.data.goals || []).find((item) => !item.completed) || this.data.goals[0];
      this.openCheckInForGoal(activeGoal ? activeGoal.id : this.data.selectedGoalId, true);
      return;
    }
    this.onTapCreateGoal();
  },

  onClosePopup() {
    this.setData({
      showCheckInPopup: false,
      inputNote: "",
      selectedMoodKey: "steady",
    });
  },

  onSelectGoal(e) {
    const id = Number(e.currentTarget.dataset.id);
    this.setData({
      selectedGoalId: id,
    });
  },

  onQuickAmount(e) {
    const amount = Number(e.currentTarget.dataset.amount);
    this.setData({
      inputAmount: String(amount),
    });
  },

  onInputNote(e) {
    this.setData({
      inputNote: e.detail.value,
    });
  },

  onUseNoteTemplate(e) {
    const note = String(e.currentTarget.dataset.note || "");
    this.setData({
      inputNote: note,
    });
  },

  onSelectMoodTag(e) {
    const key = String(e.currentTarget.dataset.key || "steady");
    this.setData({
      selectedMoodKey: key,
    });
  },

  onTapCreateGoal() {
    const defaults = getModeDefaults("free");
    this.setData({
      showCreateGoalPopup: true,
      createGoalName: "",
      createGoalTarget: defaults.target,
      createGoalDeadline: this.formatDateForPicker(defaults.deadline),
      createGoalMode: "free",
      createGoalIcon: "",
      createGoalColor: "",
      createGoalAccentColor: "",
      createGoalScriptTip: "",
      createGoalScriptName: "",
    });
  },

  formatDateForPicker(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  onCloseCreateGoal() {
    this.setData({
      showCreateGoalPopup: false,
      createGoalIcon: "",
      createGoalColor: "",
      createGoalAccentColor: "",
      createGoalScriptTip: "",
      createGoalScriptName: "",
    });
  },

  onInputGoalName(e) {
    this.setData({
      createGoalName: e.detail.value,
    });
  },

  onInputGoalTarget(e) {
    this.setData({
      createGoalTarget: e.detail.value,
    });
  },

  onDateChange(e) {
    this.setData({
      createGoalDeadline: e.detail.value,
    });
  },

  onSelectCreateGoalMode(e) {
    const modeKey = String(e.currentTarget.dataset.mode || "free");
    const defaults = getModeDefaults(modeKey);
    this.setData({
      createGoalMode: modeKey,
      createGoalScriptTip: "",
      createGoalScriptName: "",
      createGoalTarget: modeKey === "free" ? this.data.createGoalTarget : defaults.target,
      createGoalDeadline: this.formatDateForPicker(defaults.deadline),
    });
  },

  onAddHotGoal(e) {
    const template = HOT_GOAL_TEMPLATES[e.currentTarget.dataset.index];
    const modeKey = template.name.includes("365") ? "daily" : (template.name.includes("52") ? "weekly" : "free");
    const defaults = getModeDefaults(modeKey);
    this.setData({
      showCreateGoalPopup: true,
      createGoalName: template.name,
      createGoalTarget: defaults.target,
      createGoalDeadline: this.formatDateForPicker(defaults.deadline),
      createGoalMode: modeKey,
      createGoalIcon: template.icon,
      createGoalColor: template.color,
      createGoalAccentColor: template.accentColor,
      createGoalScriptTip: "",
      createGoalScriptName: "",
    });
  },

  onUseChallengeScript(e) {
    const script = CHALLENGE_SCRIPTS[e.currentTarget.dataset.index];
    if (!script) return;

    this.setData({
      showCreateGoalPopup: true,
      createGoalName: script.name,
      createGoalTarget: script.target,
      createGoalDeadline: this.formatDateForPicker(addDays(new Date(), script.days)),
      createGoalMode: script.mode,
      createGoalIcon: script.icon,
      createGoalColor: script.color,
      createGoalAccentColor: script.accentColor,
      createGoalScriptTip: script.tip,
      createGoalScriptName: script.name,
    });
  },

  onConfirmCreateGoal() {
    const name = this.data.createGoalName.trim();
    const target = Number(this.data.createGoalTarget);
    const deadline = this.data.createGoalDeadline;
    const mode = this.data.createGoalMode;

    if (!name) {
      wx.showToast({
        title: "请输入目标名称",
        icon: "none",
      });
      return;
    }
    if (!target || target <= 0) {
      wx.showToast({
        title: "请输入有效目标金额",
        icon: "none",
      });
      return;
    }

    const icons = ["💰", "🏠", "✈️", "🚗", "🎁", "🏝️", "📚", "💍"];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const colors = [
      { color: "#EBF5FB", accentColor: "#5DADE2" },
      { color: "#E8F8F5", accentColor: "#48C9B0" },
      { color: "#FDEDEC", accentColor: "#FF7E79" },
      { color: "#E8F5E9", accentColor: "#66BB6A" },
      { color: "#FFF3E0", accentColor: "#FFA726" },
      { color: "#E3F2FD", accentColor: "#42A5F5" },
      { color: "#FCE4EC", accentColor: "#EC407A" },
      { color: "#EFEBE9", accentColor: "#8D6E63" },
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const maxId = this.localData.goals.length > 0
      ? Math.max(...this.localData.goals.map(g => g.id)) + 1
      : 1;

    const newGoal = {
      id: maxId,
      name,
      icon: this.data.createGoalIcon || randomIcon,
      ...(this.data.createGoalColor && this.data.createGoalAccentColor
        ? {
          color: this.data.createGoalColor,
          accentColor: this.data.createGoalAccentColor,
        }
        : randomColor),
      target,
      saved: 0,
      deadline,
      completed: false,
      mode,
      createdAt: toDateKey(),
      scriptName: this.data.createGoalScriptName,
      scriptTip: this.data.createGoalScriptTip,
    };

    this.localData.goals.push(newGoal);
    this.saveLocalData();
    this.refreshDashboard();

    this.setData({
      showCreateGoalPopup: false,
      pendingCheckInGoalId: newGoal.id,
      createGoalIcon: "",
      createGoalColor: "",
      createGoalAccentColor: "",
      createGoalScriptTip: "",
      createGoalScriptName: "",
    });

    wx.showToast({
      title: "目标已创建，先存第一笔",
      icon: "success",
    });
    this.openCheckInForGoal(newGoal.id, true);
  },

  onTapAchievements() {
    this.setData({
      showAchievementsPopup: true,
    });
  },

  onCloseAchievements() {
    this.setData({
      showAchievementsPopup: false,
    });
  },

  onOpenBackup() {
    const payload = buildBackupPayload(this.localData);
    this.setData({
      showBackupPopup: true,
      backupPayload: payload,
      backupSummaryText: buildBackupSummary(this.localData),
      backupInput: "",
      restorePreviewText: "",
      restoreErrorText: "",
    });
  },

  onCloseBackup() {
    this.setData({
      showBackupPopup: false,
      backupInput: "",
      restorePreviewText: "",
      restoreErrorText: "",
    });
  },

  onInputBackupRestore(e) {
    const input = e.detail.value;
    const parsed = parseBackupPayload(input);
    this.setData({
      backupInput: input,
      restorePreviewText: parsed.ok ? `将恢复：${parsed.summary}` : "",
      restoreErrorText: input.trim() && !parsed.ok ? parsed.error : "",
    });
  },

  onCopyBackup() {
    wx.setClipboardData({
      data: this.data.backupPayload,
      success: () => {
        wx.showToast({
          title: "备份内容已复制",
          icon: "success",
        });
      },
    });
  },

  onRestoreBackup() {
    const parsed = parseBackupPayload(this.data.backupInput);
    if (!parsed.ok) {
      this.setData({
        restorePreviewText: "",
        restoreErrorText: parsed.error,
      });
      wx.showModal({
        title: "恢复失败",
        content: parsed.error,
        confirmText: "知道了",
        showCancel: false,
      });
      return;
    }

    wx.showModal({
      title: "确认恢复",
      content: `${parsed.summary}\n恢复会覆盖当前本地数据，请确认已经备份。`,
      success: (res) => {
        if (!res.confirm) return;
        this.localData = normalizeLocalData(parsed.data);
        this.saveLocalData();
        this.refreshDashboard();
        this.setData({
          showBackupPopup: false,
          backupInput: "",
          restorePreviewText: "",
          restoreErrorText: "",
        });
        wx.showToast({
          title: "恢复成功",
          icon: "success",
        });
      },
    });
  },

  onDeleteGoal(e) {
    const id = Number(e.currentTarget.dataset.id);
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这个目标吗？删除后无法恢复。",
      success: (res) => {
        if (res.confirm) {
          this.localData.goals = this.localData.goals.filter(g => g.id !== id);
          this.localData.history = (this.localData.history || []).filter(record => record.goalId !== id);
          this.saveLocalData();
          this.refreshDashboard();
          wx.showToast({
            title: "删除成功",
            icon: "success",
          });
        }
      },
    });
  },

  onOpenEditGoal(e) {
    const id = Number(e.currentTarget.dataset.id);
    const goal = this.localData.goals.find(g => g.id === id);
    if (!goal) return;

    this.setData({
      showEditGoalPopup: true,
      editingGoalId: id,
      editGoalName: goal.name,
      editGoalTarget: String(goal.target),
      editGoalDeadline: goal.deadline || this.formatDateForPicker(new Date()),
    });
  },

  onCloseEditGoal() {
    this.setData({
      showEditGoalPopup: false,
      editingGoalId: null,
    });
  },

  onInputEditName(e) {
    this.setData({
      editGoalName: e.detail.value,
    });
  },

  onInputEditTarget(e) {
    this.setData({
      editGoalTarget: e.detail.value,
    });
  },

  onEditDateChange(e) {
    this.setData({
      editGoalDeadline: e.detail.value,
    });
  },

  onConfirmEditGoal() {
    const name = this.data.editGoalName.trim();
    const target = Number(this.data.editGoalTarget);
    const deadline = this.data.editGoalDeadline;
    const id = this.data.editingGoalId;

    if (!name) {
      wx.showToast({
        title: "请输入目标名称",
        icon: "none",
      });
      return;
    }
    if (!target || target <= 0) {
      wx.showToast({
        title: "请输入有效目标金额",
        icon: "none",
      });
      return;
    }

    const index = this.localData.goals.findIndex(g => g.id === id);
    if (index < 0) return;

    this.localData.goals[index].name = name;
    this.localData.goals[index].target = target;
    this.localData.goals[index].deadline = deadline;

    this.saveLocalData();
    this.refreshDashboard();

    this.setData({
      showEditGoalPopup: false,
      editingGoalId: null,
    });

    wx.showToast({
      title: "修改成功",
      icon: "success",
    });
  },

  onOpenHistory(e) {
    const id = Number(e.currentTarget.dataset.id);
    const goal = this.localData.goals.find(g => g.id === id);
    if (!goal) return;

    const history = (this.localData.history || []).filter(h => h.goalId === id);
    history.sort((a, b) => b.date.localeCompare(a.date));

    this.setData({
      showHistoryPopup: true,
      currentGoalHistory: history,
    });
  },

  onCloseHistory() {
    this.setData({
      showHistoryPopup: false,
    });
  },

  onTapCheckInWithGoal(e) {
    const id = Number(e.currentTarget.dataset.id);
    this.openCheckInForGoal(id);
  },

  onUseSuggestedAmount() {
    const amount = Number(this.data.selectedGoalSuggestedAmountDisplay.replace(/,/g, ""));
    if (!amount) return;
    this.setData({
      inputAmount: String(amount),
    });
  },

  onTapKey(e) {
    const key = String(e.currentTarget.dataset.key);
    let value = this.data.inputAmount;

    if (key === "⌫") {
      if (value.length <= 1) {
        value = "0";
      } else {
        value = value.slice(0, -1);
        if (value === "-" || value === "") {
          value = "0";
        }
      }
    } else if (key === ".") {
      if (!value.includes(".")) {
        value = value === "0" ? "0." : `${value}.`;
      }
    } else {
      if (value === "0") {
        value = key;
      } else {
        const dotIndex = value.indexOf(".");
        if (dotIndex >= 0) {
          const decimalLength = value.slice(dotIndex + 1).length;
          if (decimalLength < 2) {
            value += key;
          }
        } else if (value.length < 8) {
          value += key;
        }
      }
    }

    this.setData({
      inputAmount: value,
    });
  },

  onConfirmCheckIn() {
    const amount = Number(this.data.inputAmount);
    const note = (this.data.inputNote || "").trim();
    const mood = getMoodTagByKey(this.data.selectedMoodKey);
    if (!amount || amount <= 0) {
      wx.showToast({
        title: "请输入有效金额",
        icon: "none",
      });
      return;
    }

    const goalId = Number(this.data.selectedGoalId);
    const goalIndex = this.localData.goals.findIndex((item) => item.id === goalId);
    if (goalIndex < 0) {
      wx.showToast({
        title: "请选择目标",
        icon: "none",
      });
      return;
    }

    this.localData.goals[goalIndex].saved = Number(this.localData.goals[goalIndex].saved || 0) + amount;
    this.localData.history.push({
      amount,
      goalId,
      date: toDateKey(),
      note,
      moodKey: mood.key,
      moodLabel: mood.label,
      moodEmoji: mood.emoji,
    });

    const today = toDateKey();
    const last = this.localData.lastCheckInDate;
    if (!last) {
      this.localData.streak = 1;
    } else {
      const dayDiff = calcDayDiff(last, today);
      if (dayDiff === 1) {
        this.localData.streak += 1;
      } else if (dayDiff > 1) {
        this.localData.streak = 1;
      }
    }
    this.localData.lastCheckInDate = today;
    const nextSuggestedAmount = calcSuggestedAmount(this.localData.goals[goalIndex]);
    const checkInToastTitle = nextSuggestedAmount > 0
      ? `明天先存 ¥${formatAmount(nextSuggestedAmount)}`
      : "目标已点亮，明天继续";

    this.saveLocalData();
    this.refreshDashboard();

    this.setData({
      showCheckInPopup: false,
      inputAmount: "0",
      inputNote: "",
      selectedMoodKey: "steady",
    });

    wx.showToast({
      title: checkInToastTitle,
      icon: "success",
    });
    this.promptSavingReminderAfterCheckIn();
  },

  promptSavingReminderAfterCheckIn() {
    if (!REMINDER_TEMPLATE_ID || this.localData.reminderRequestedAt === toDateKey()) {
      return;
    }
    wx.showModal({
      title: "明天提醒你继续点亮吗？",
      content: "开启后，小简会用微信订阅消息提醒你回来打卡。",
      confirmText: "开启提醒",
      cancelText: "暂时不用",
      success: (res) => {
        if (res.confirm) {
          this.onRequestSavingReminder();
        }
      },
    });
  },

  onRequestSavingReminder() {
    if (!REMINDER_TEMPLATE_ID) {
      wx.showModal({
        title: "提醒模板待配置",
        content: "在微信公众平台配置订阅消息模板 ID 后，填入 REMINDER_TEMPLATE_ID 即可唤起每日打卡提醒。",
        confirmText: "知道了",
        showCancel: false,
      });
      return;
    }

    if (!wx.requestSubscribeMessage) {
      wx.showToast({
        title: "当前微信版本暂不支持订阅提醒",
        icon: "none",
      });
      return;
    }

    wx.requestSubscribeMessage({
      tmplIds: [REMINDER_TEMPLATE_ID],
      success: (res) => {
        if (!isReminderAccepted(res)) {
          wx.showToast({
            title: "提醒未开启",
            icon: "none",
          });
          return;
        }
        this.localData.reminderRequestedAt = toDateKey();
        this.saveLocalData();
        this.refreshDashboard();
        wx.showToast({
          title: "提醒已开启",
          icon: "success",
        });
      },
      fail: () => {
        wx.showToast({
          title: "提醒开启失败，可稍后再试",
          icon: "none",
        });
      },
    });
  },

  onCopyMonthlySummary() {
    if (!this.data.monthlySummaryReportText) {
      wx.showToast({
        title: "本月还没有可复制的小结",
        icon: "none",
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.monthlySummaryReportText,
      success: () => {
        wx.showToast({
          title: "本月小结已复制",
          icon: "success",
        });
      },
    });
  },

  onCopyWeeklyReport() {
    if (!this.data.weeklySummaryReportText) {
      wx.showToast({
        title: "这周还没有可复制的周报",
        icon: "none",
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.weeklySummaryReportText,
      success: () => {
        wx.showToast({
          title: "本周周报已复制",
          icon: "success",
        });
      },
    });
  },

  onCopyChallengeShare() {
    if (!this.data.challengeShareText) {
      wx.showToast({
        title: "还没有挑战文案",
        icon: "none",
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.challengeShareText,
      success: () => {
        wx.showToast({
          title: "挑战文案已复制",
          icon: "success",
        });
      },
    });
  },

  onCopySupervisionShare() {
    if (!this.data.supervisionShareText) {
      wx.showToast({
        title: "先创建一个目标",
        icon: "none",
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.supervisionShareText,
      success: () => {
        wx.showToast({
          title: "监督文案已复制",
          icon: "success",
        });
      },
    });
  },

  onCopyGoalScriptShare(e) {
    const id = Number(e.currentTarget.dataset.id);
    const goal = (this.data.goals || []).find((item) => item.id === id);
    if (!goal) return;

    const text = goal.completed
      ? [
        `我完成了「${goal.scriptName || goal.name}」攒钱挑战。`,
        `目标 ¥${goal.targetDisplay}，已经攒下 ¥${goal.savedDisplay}。`,
        "原来想要的生活，真的可以一格一格存出来。",
      ].join("\n")
      : [
        `我正在完成「${goal.scriptName || goal.name}」攒钱挑战。`,
        `目前进度 ${goal.percent}%，已攒 ¥${goal.savedDisplay} / ¥${goal.targetDisplay}。`,
        goal.scriptTip || "今天也先存一点，把目标慢慢点亮。",
      ].join("\n");

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: goal.completed ? "达成文案已复制" : "进度文案已复制",
          icon: "success",
        });
      },
    });
  },

  onSelectPosterTheme(e) {
    const key = String(e.currentTarget.dataset.key || "cream");
    this.setData({
      posterThemeKey: key,
    });
  },

  onToggleReviewPanel() {
    this.setData({
      showReviewPanel: !this.data.showReviewPanel,
    });
  },

  exportPosterCanvas(ctx, width, height) {
    return new Promise((resolve, reject) => {
      ctx.draw(false, () => {
        setTimeout(() => {
          wx.canvasToTempFilePath(
            {
              canvasId: "posterCanvas",
              x: 0,
              y: 0,
              width,
              height,
              destWidth: width * 2,
              destHeight: height * 2,
              success: (res) => {
                resolve(res.tempFilePath);
              },
              fail: reject,
            },
            this
          );
        }, 300);
      });
    });
  },

  async onGeneratePoster() {
    if (this.data.isGeneratingPoster) return;
    this.setData({ isGeneratingPoster: true });
    wx.showLoading({ title: "生成海报中..." });

    try {
      const posterTheme = getPosterThemeByKey(this.data.posterThemeKey);
      const now = new Date();
      const monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateText = `${String(now.getDate()).padStart(2, "0")} ${monthArr[now.getMonth()]} ${now.getFullYear()}`;
      const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayText = weekDays[now.getDay()];

      const topGoal = (this.data.goals || [])[0] || {
        name: "我的攒钱目标",
        percent: "0.0",
        targetDisplay: "0.00",
        remainingDisplay: "0.00",
      };

      const ctx = wx.createCanvasContext("posterCanvas", this);
      const w = POSTER_WIDTH;
      const h = POSTER_HEIGHT;

      const bgGradient = ctx.createLinearGradient(0, 0, w, h);
      bgGradient.addColorStop(0, posterTheme.bgStart);
      bgGradient.addColorStop(0.46, posterTheme.bgMid);
      bgGradient.addColorStop(1, posterTheme.bgEnd);
      ctx.setFillStyle(bgGradient);
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(80, 210, 320, 0, 2 * Math.PI);
      ctx.setFillStyle(posterTheme.key === "challenge" ? "rgba(255, 226, 197, 0.18)" : "rgba(255, 255, 255, 0.46)");
      ctx.fill();

      ctx.beginPath();
      ctx.arc(720, 980, 460, 0, 2 * Math.PI);
      ctx.setFillStyle(posterTheme.key === "challenge" ? "rgba(255, 255, 255, 0.12)" : "rgba(30, 127, 116, 0.10)");
      ctx.fill();

      const isDarkPoster = posterTheme.key === "challenge";
      const heroTextColor = isDarkPoster ? "#FFFFFF" : posterTheme.title;
      const heroSubColor = isDarkPoster ? "rgba(255,255,255,0.76)" : posterTheme.sub;
      const cardBg = isDarkPoster ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.88)";
      const cardText = "#22313F";

      ctx.setTextAlign("left");
      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(24);
      ctx.fillText("小简攒钱打卡", 56, 76);
      ctx.setFillStyle(heroTextColor);
      ctx.setFontSize(50);
      ctx.fillText("我的 365 点亮墙", 56, 142);
      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(24);
      ctx.fillText(`${dateText} · ${posterTheme.name}`, 56, 184);

      ctx.setTextAlign("right");
      ctx.setFillStyle(heroTextColor);
      ctx.setFontSize(28);
      ctx.fillText(dayText, w - 56, 82);
      drawRoundRectPath(ctx, w - 218, 108, 162, 58, 29);
      ctx.setFillStyle(isDarkPoster ? "rgba(255,255,255,0.16)" : "rgba(30,127,116,0.12)");
      ctx.fill();
      ctx.setTextAlign("center");
      ctx.setFillStyle(heroTextColor);
      ctx.setFontSize(24);
      ctx.fillText("攒钱挑战中", w - 137, 146);

      ctx.setTextAlign("left");
      ctx.setFillStyle(heroTextColor);
      ctx.setFontSize(106);
      ctx.fillText(this.data.challengeLitDaysDisplay, 56, 300);
      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(34);
      ctx.fillText("/ 365 格已点亮", 250, 292);

      drawRoundRectPath(ctx, 56, 328, w - 112, 18, 9);
      ctx.setFillStyle(isDarkPoster ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.56)");
      ctx.fill();
      drawRoundRectPath(ctx, 56, 328, Math.max(18, (w - 112) * (Number(this.data.challengePercent || 0) / 100)), 18, 9);
      const progressGradient = ctx.createLinearGradient(56, 328, w - 56, 346);
      progressGradient.addColorStop(0, posterTheme.accent);
      progressGradient.addColorStop(1, "#FFFFFF");
      ctx.setFillStyle(progressGradient);
      ctx.fill();

      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(26);
      ctx.fillText(`从 ${this.data.challengeStartText || "今天"} 开始，把想要的生活一格一格存出来`, 56, 392);

      ctx.save();
      ctx.setShadow(0, 22, 66, isDarkPoster ? "rgba(0,0,0,0.18)" : "rgba(31,71,85,0.12)");
      drawRoundRectPath(ctx, 48, 430, w - 96, 410, 44);
      ctx.setFillStyle(cardBg);
      ctx.fill();
      ctx.restore();

      ctx.setFillStyle(cardText);
      ctx.setFontSize(30);
      ctx.fillText("365 DAY SAVING WALL", 88, 494);
      ctx.setFillStyle("#6D7A86");
      ctx.setFontSize(22);
      ctx.fillText("每一个亮点，都是一次认真存下来的选择", 88, 532);

      const challengeDaysForPoster = (this.data.challengeDays || []).slice(0, 365);
      const cols = 25;
      const dotSize = 12;
      const dotGap = 10;
      const gridX = 88;
      const gridY = 570;
      challengeDaysForPoster.forEach((day, index) => {
        const x = gridX + (index % cols) * (dotSize + dotGap);
        const y = gridY + Math.floor(index / cols) * (dotSize + dotGap);
        if (day.isLit) {
          ctx.setFillStyle(day.amount >= 200 ? "#14554E" : (day.amount >= 50 ? "#2FAE98" : posterTheme.accent));
        } else if (day.isFuture) {
          ctx.setFillStyle("#EEF2F4");
        } else {
          ctx.setFillStyle("#DDE5E7");
        }
        drawRoundRectPath(ctx, x, y, dotSize, dotSize, 4);
        ctx.fill();
      });

      const statY = 880;
      const statWidth = 196;
      const statGap = 24;
      const stats = [
        { label: "累计攒下", value: `¥${this.data.challengeTotalAmountDisplay}` },
        { label: "连续打卡", value: `${this.data.streakDisplay} 天` },
        { label: "本周打卡", value: `${this.data.weeklySummaryDaysDisplay} 天` },
      ];
      stats.forEach((item, index) => {
        const x = 48 + index * (statWidth + statGap);
        drawRoundRectPath(ctx, x, statY, statWidth, 138, 30);
        ctx.setFillStyle(isDarkPoster ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.76)");
        ctx.fill();
        ctx.setTextAlign("center");
        ctx.setFillStyle(heroTextColor);
        ctx.setFontSize(34);
        ctx.fillText(item.value, x + statWidth / 2, statY + 56);
        ctx.setFillStyle(heroSubColor);
        ctx.setFontSize(22);
        ctx.fillText(item.label, x + statWidth / 2, statY + 98);
      });

      ctx.setTextAlign("left");
      drawRoundRectPath(ctx, 48, 1050, w - 276, 142, 34);
      ctx.setFillStyle(isDarkPoster ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.72)");
      ctx.fill();
      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(22);
      ctx.fillText("当前目标", 78, 1092);
      ctx.setFillStyle(heroTextColor);
      ctx.setFontSize(34);
      ctx.fillText(topGoal.name || "我的攒钱目标", 78, 1140);
      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(22);
      ctx.fillText(`已完成 ${topGoal.percent || "0.0"}% · 距目标还差 ¥${topGoal.remainingDisplay || "0.00"}`, 78, 1176);
      ctx.fillText(`明天建议 ¥${this.data.focusGoalSuggestedAmountDisplay || "0.00"}，继续点亮一格`, 78, 1212);

      const codeBoxX = w - 196;
      const codeBoxY = 1050;
      const codeBoxSize = 148;
      const codeImagePadding = 12;

      ctx.save();
      ctx.setShadow(0, 12, 30, "rgba(0, 0, 0, 0.08)");
      drawRoundRectPath(ctx, codeBoxX, codeBoxY, codeBoxSize, codeBoxSize, 32);
      ctx.setFillStyle("#FFFFFF");
      ctx.fill();
      ctx.restore();

      ctx.save();
      drawRoundRectPath(
        ctx,
        codeBoxX + codeImagePadding,
        codeBoxY + codeImagePadding,
        codeBoxSize - codeImagePadding * 2,
        codeBoxSize - codeImagePadding * 2,
        24
      );
      ctx.clip();
      ctx.drawImage(
        POSTER_MINI_CODE_SRC,
        codeBoxX + codeImagePadding,
        codeBoxY + codeImagePadding,
        codeBoxSize - codeImagePadding * 2,
        codeBoxSize - codeImagePadding * 2
      );
      ctx.restore();

      ctx.setTextAlign("left");
      ctx.setFillStyle(heroTextColor);
      ctx.setFontSize(32);
      ctx.fillText("今天也在认真变富", 56, 1260);
      ctx.setFillStyle(heroSubColor);
      ctx.setFontSize(22);
      ctx.fillText("长按扫码，开启你的攒钱挑战", 56, 1298);

      const posterTempFilePath = await this.exportPosterCanvas(ctx, w, h);

      wx.hideLoading();
      this.setData({ isGeneratingPoster: false });
      wx.previewImage({
        urls: [posterTempFilePath],
      current: posterTempFilePath,
      });
    } catch (err) {
      wx.hideLoading();
      this.setData({ isGeneratingPoster: false });
      wx.showToast({
        title: "生成失败",
        icon: "none",
      });
    }
  },
});
