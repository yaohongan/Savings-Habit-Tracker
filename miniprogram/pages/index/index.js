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
    createGoalName: "",
    createGoalTarget: "",
    createGoalDeadline: "",
    editGoalName: "",
    editGoalTarget: "",
    editGoalDeadline: "",
    currentGoalHistory: [],
    showCelebration: false,
    celebrationGoalName: "",
    keyboardNum: KEYBOARD_NUM,
    quickAmounts: QUICK_AMOUNTS,
    hotGoalTemplates: HOT_GOAL_TEMPLATES,
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

    const monthKey = toMonthKey();
    const monthlyAdded = history
      .filter((item) => typeof item.date === "string" && item.date.startsWith(monthKey))
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
      return {
        ...item,
        percent: percent.toFixed(1),
        remaining,
        progressColor,
        remainingDays,
        targetDisplay: formatAmount(target),
        remainingDisplay: formatAmount(remaining),
        savedDisplay: formatAmount(saved),
      };
    });

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
      achievements: this.localData.achievements,
    });
  },

  saveLocalData() {
    wx.setStorageSync(STORAGE_KEY, this.localData);
  },

  onTapCheckIn() {
    this.setData({
      showCheckInPopup: true,
      inputAmount: "0",
    });
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
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    const formattedDate = this.formatDateForPicker(nextYear);
    this.setData({
      showCreateGoalPopup: true,
      createGoalName: "",
      createGoalTarget: "",
      createGoalDeadline: formattedDate,
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

  onAddHotGoal(e) {
    const template = HOT_GOAL_TEMPLATES[e.currentTarget.dataset.index];
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    const deadline = this.formatDateForPicker(nextYear);

    const maxId = this.localData.goals.length > 0
      ? Math.max(...this.localData.goals.map(g => g.id)) + 1
      : 1;

    const newGoal = {
      id: maxId,
      name: template.name,
      icon: template.icon,
      color: template.color,
      accentColor: template.accentColor,
      target: 0,
      saved: 0,
      deadline,
      completed: false,
    };

    this.localData.goals.push(newGoal);
    this.saveLocalData();
    this.refreshDashboard();

    wx.showToast({
      title: "添加成功",
      icon: "success",
    });
  },

  onConfirmCreateGoal() {
    const name = this.data.createGoalName.trim();
    const target = Number(this.data.createGoalTarget);
    const deadline = this.data.createGoalDeadline;

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
      icon: randomIcon,
      ...randomColor,
      target,
      saved: 0,
      deadline,
      completed: false,
    };

    this.localData.goals.push(newGoal);
    this.saveLocalData();
    this.refreshDashboard();

    this.setData({
      showCreateGoalPopup: false,
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
