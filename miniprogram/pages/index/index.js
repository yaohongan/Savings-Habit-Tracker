const STORAGE_KEY = "xj_saving_data_v1";

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

const GOAL_MODES = [
  { key: "free", name: "自由攒", desc: "先开始，想到就存一笔" },
  { key: "daily", name: "365天", desc: "适合每天打卡一点点" },
  { key: "weekly", name: "52周", desc: "适合每周固定存一次" },
  { key: "monthly", name: "每月定存", desc: "适合发薪日固定存钱" },
];

const KEYBOARD_NUM = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];
const POSTER_WIDTH = 750;
const POSTER_HEIGHT = 1334;
const POSTER_MINI_CODE_SRC = "../../images/share-mini-code.jpg";

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

function calcDayDiff(from, to) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const fromUtc = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const toUtc = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.floor((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
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

Page({
  data: {
    statusBarHeight: 20,
    showCheckInPopup: false,
    showCreateGoalPopup: false,
    showEditGoalPopup: false,
    showHistoryPopup: false,
    showAchievementsPopup: false,
    inputAmount: "0",
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
    editGoalName: "",
    editGoalTarget: "",
    editGoalDeadline: "",
    currentGoalHistory: [],
    showCelebration: false,
    celebrationGoalName: "",
    keyboardNum: KEYBOARD_NUM,
    quickAmounts: QUICK_AMOUNTS,
    hotGoalTemplates: HOT_GOAL_TEMPLATES,
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

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      today: this.formatDateForPicker(new Date()),
    });
    this.loadLocalData();
  },

  loadLocalData() {
    const local = wx.getStorageSync(STORAGE_KEY);
    const base = {
      goals: [],
      history: [],
      streak: 0,
      lastCheckInDate: "",
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
    const data = local && typeof local === "object" ? { ...base, ...local } : base;

    this.localData = data;
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
      };
    });

    const rhythmBoard = buildRhythmDays(history);

    const focusGoal = mappedGoals.find((item) => !item.completed) || mappedGoals[0] || null;
    const selectedGoalId = mappedGoals.some((item) => item.id === this.data.selectedGoalId)
      ? this.data.selectedGoalId
      : (focusGoal ? focusGoal.id : 0);
    const selectedGoal = mappedGoals.find((item) => item.id === selectedGoalId) || focusGoal;

    this.checkAndUpdateAchievements();
    this.checkGoalCompletion();

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
      achievements: this.localData.achievements,
    });
  },

  saveLocalData() {
    wx.setStorageSync(STORAGE_KEY, this.localData);
  },

  onTapCheckIn() {
    const activeGoal = (this.data.goals || []).find((item) => !item.completed) || this.data.goals[0];
    this.setData({
      showCheckInPopup: true,
      inputAmount: "0",
      selectedGoalId: activeGoal ? activeGoal.id : this.data.selectedGoalId,
    });
  },

  onBottomPrimaryAction() {
    if ((this.data.goals || []).length > 0) {
      this.onTapCheckIn();
      return;
    }
    this.onTapCreateGoal();
  },

  onClosePopup() {
    this.setData({
      showCheckInPopup: false,
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
    };

    this.localData.goals.push(newGoal);
    this.saveLocalData();
    this.refreshDashboard();

    this.setData({
      showCreateGoalPopup: false,
      createGoalIcon: "",
      createGoalColor: "",
      createGoalAccentColor: "",
    });

    wx.showToast({
      title: "创建成功",
      icon: "success",
    });
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
    this.setData({
      showCheckInPopup: true,
      inputAmount: "0",
      selectedGoalId: id,
    });
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

    this.saveLocalData();
    this.refreshDashboard();

    this.setData({
      showCheckInPopup: false,
      inputAmount: "0",
    });

    wx.showToast({
      title: "打卡成功",
      icon: "success",
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

      // 1. 绘制极光水彩渐变背景 (中性冷暖交织)
      const bgGradient = ctx.createLinearGradient(0, 0, w, h);
      bgGradient.addColorStop(0, "#E8F8F5");
      bgGradient.addColorStop(0.4, "#EBF5FB");
      bgGradient.addColorStop(1, "#FDFBF7");
      ctx.setFillStyle(bgGradient);
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(100, 200, 300, 0, 2 * Math.PI);
      ctx.setFillStyle("rgba(163, 228, 215, 0.4)");
      ctx.fill();

      ctx.beginPath();
      ctx.arc(650, 900, 400, 0, 2 * Math.PI);
      ctx.setFillStyle("rgba(174, 214, 241, 0.4)");
      ctx.fill();

      // 2. 顶部装饰文字
      ctx.setFillStyle("#7F8C8D");
      ctx.setFontSize(28);
      ctx.setTextAlign("left");
      ctx.fillText("X I A O J I A N", 60, 100);
      ctx.setFontSize(24);
      ctx.fillText("RECORD YOUR SHINING MOMENTS", 60, 140);

      ctx.setTextAlign("right");
      ctx.setFontSize(40);
      ctx.setFillStyle("#2C3E50");
      ctx.fillText(dateText, w - 60, 100);
      ctx.setFontSize(24);
      ctx.setFillStyle("#7F8C8D");
      ctx.fillText(dayText, w - 60, 140);

      // 3. 绘制玻璃拟态卡片 (主体)
      ctx.save();
      ctx.setShadow(0, 20, 60, "rgba(72, 201, 176, 0.1)");
      drawRoundRect(ctx, 50, 220, w - 100, 780, 48);
      ctx.setFillStyle("rgba(255, 255, 255, 0.9)");
      ctx.fill();
      ctx.restore();

      drawRoundRect(ctx, 50, 220, w - 100, 780, 48);
      ctx.setLineWidth(2);
      ctx.setStrokeStyle("rgba(255, 255, 255, 1)");
      ctx.stroke();

      // 4. 卡片内部排版
      ctx.setFillStyle("rgba(72, 201, 176, 0.15)");
      ctx.setFontSize(180);
      ctx.setTextAlign("left");
      ctx.fillText("“", 80, 380);

      ctx.setFillStyle("#2C3E50");
      ctx.setFontSize(38);
      ctx.fillText("时间看得见你", 160, 360);
      ctx.fillText("的每一分努力。", 160, 420);

      ctx.setFillStyle("#7F8C8D");
      ctx.setFontSize(26);
      ctx.fillText("已连续打卡 (天)", 100, 540);

      ctx.setFillStyle("#48C9B0");
      ctx.setFontSize(96);
      ctx.fillText(this.data.streakDisplay, 100, 640);

      ctx.beginPath();
      ctx.moveTo(100, 700);
      ctx.lineTo(w - 100, 700);
      ctx.setStrokeStyle("rgba(0, 0, 0, 0.05)");
      ctx.setLineWidth(2);
      ctx.stroke();

      ctx.setFillStyle("#7F8C8D");
      ctx.setFontSize(26);
      ctx.fillText("金库总额 (元)", 100, 770);

      ctx.setFillStyle("#2C3E50");
      ctx.setFontSize(80);
      ctx.fillText(`¥ ${this.data.totalSavedDisplay}`, 100, 860);

      ctx.setFillStyle("#48C9B0");
      ctx.setFontSize(28);
      ctx.fillText(`距【${topGoal.name}】还差 ¥${topGoal.remainingDisplay}`, 100, 940);

      // 5. 底部品牌与小程序码
      ctx.setFillStyle("#2C3E50");
      ctx.setFontSize(32);
      ctx.fillText("今天也在认真变富 ✨", 60, 1140);
      ctx.setFillStyle("#7F8C8D");
      ctx.setFontSize(24);
      ctx.fillText("长按扫码，开启你的攒钱之旅", 60, 1190);

      const codeBoxX = w - 220;
      const codeBoxY = 1068;
      const codeBoxSize = 160;
      const codeImagePadding = 12;

      ctx.save();
      ctx.setShadow(0, 12, 30, "rgba(0, 0, 0, 0.06)");
      drawRoundRectPath(ctx, codeBoxX, codeBoxY, codeBoxSize, codeBoxSize, 36);
      ctx.setFillStyle("#FFFFFF");
      ctx.fill();
      ctx.restore();

      drawRoundRectPath(ctx, codeBoxX, codeBoxY, codeBoxSize, codeBoxSize, 36);
      ctx.setLineWidth(2);
      ctx.setStrokeStyle("rgba(72, 201, 176, 0.15)");
      ctx.stroke();

      ctx.save();
      drawRoundRectPath(
        ctx,
        codeBoxX + codeImagePadding,
        codeBoxY + codeImagePadding,
        codeBoxSize - codeImagePadding * 2,
        codeBoxSize - codeImagePadding * 2,
        28
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
