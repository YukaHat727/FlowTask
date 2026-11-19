
(function () {
  'use strict';

  // Hằng số lưu trữ localStorage
  const STORAGE_KEY_TASKS = 'taskflow_tasks_vi_v2';
  const STORAGE_KEY_THEME = 'taskflow_theme_vi_v1';
  const STORAGE_KEY_VIEW = 'taskflow_view_vi_v1';
  const STORAGE_KEY_TAB = 'taskflow_active_tab_vi_v1';

  // Cấu hình nhãn & màu sắc hiển thị tiếng Việt
  const PRIORITY_META = {
    high: {
      label: 'Cao',
      weight: 3,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
      dotClass: 'bg-rose-500',
      spineClass: 'border-l-rose-500 dark:border-l-rose-500',
      pillClass: 'bg-rose-100/90 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200 border-l-2 border-rose-500',
      barColor: 'bg-rose-500',
    },
    medium: {
      label: 'Trung bình',
      weight: 2,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
      dotClass: 'bg-amber-500',
      spineClass: 'border-l-amber-500 dark:border-l-amber-500',
      pillClass: 'bg-amber-100/90 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border-l-2 border-amber-500',
      barColor: 'bg-amber-500',
    },
    low: {
      label: 'Thấp',
      weight: 1,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
      dotClass: 'bg-emerald-500',
      spineClass: 'border-l-emerald-500 dark:border-l-emerald-500',
      pillClass: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border-l-2 border-emerald-500',
      barColor: 'bg-emerald-500',
    },
  };

  const CATEGORY_META = {
    work: {
      label: 'Công việc',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
      barColor: 'bg-indigo-500',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    personal: {
      label: 'Cá nhân',
      badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
      barColor: 'bg-purple-500',
      iconBg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    study: {
      label: 'Học tập',
      badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
      barColor: 'bg-sky-500',
      iconBg: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    health: {
      label: 'Sức khỏe',
      badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
      barColor: 'bg-teal-500',
      iconBg: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
    other: {
      label: 'Khác',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      barColor: 'bg-slate-500',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    },
  };

  const STATUS_META = {
    todo: { label: 'Cần làm' },
    in_progress: { label: 'Đang thực hiện' },
    done: { label: 'Đã hoàn thành' },
  };

  const PRODUCTIVITY_TIPS = [
    {
      title: 'Quy tắc 2 phút',
      body: 'Nếu một tác vụ chỉ mất dưới 2 phút để hoàn thành, hãy làm ngay lập tức thay vì đưa vào danh sách chờ.',
    },
    {
      title: 'Phương pháp Pomodoro (25/5)',
      body: 'Tập trung cao độ vào một tác vụ duy nhất trong 25 phút, sau đó nghỉ ngơi 5 phút để tái tạo năng lượng trí não.',
    },
    {
      title: 'Ưu tiên việc quan trọng nhất (Eat That Frog)',
      body: 'Giải quyết tác vụ khó khăn và có giá trị cao nhất vào đầu buổi sáng khi sự tập trung của bạn đạt đỉnh.',
    },
    {
      title: 'Chia nhỏ mục tiêu lớn',
      body: 'Biến các dự án phức tạp thành những bước hành động cụ thể kéo dài 30–60 phút để dễ dàng bắt đầu và theo dõi.',
    },
    {
      title: 'Tổng kết 5 phút cuối ngày',
      body: 'Dành 5 phút cuối buổi tối rà soát tác vụ đã xong và chọn sẵn 3 mục tiêu trọng tâm cho ngày mai.',
    },
  ];

  // Trạng thái ứng dụng
  let tasks = [];
  let taskPendingDeleteId = null;
  let draggedTaskId = null;
  let lastFocusedBeforeModal = null;
  let activeTab = 'home'; // 'home' | 'tasks' | 'calendar' | 'stats'
  let currentTipIndex = 0;

  // Trạng thái Lịch
  const nowDate = new Date();
  const calendarState = {
    year: nowDate.getFullYear(),
    month: nowDate.getMonth(), // 0-11
    selectedDate: getTodayString(),
  };

  // Trạng thái lọc Tác vụ
  const filterState = {
    search: '',
    priority: 'all',
    category: 'all',
    status: 'all',
    sort: 'dueDate',
    view: 'list', // 'list' | 'kanban'
  };

  // Tham chiếu DOM
  const dom = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    sunIcon: document.getElementById('sunIcon'),
    moonIcon: document.getElementById('moonIcon'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    // Home
    homeCurrentDateText: document.getElementById('homeCurrentDateText'),
    homeDayNumber: document.getElementById('homeDayNumber'),
    homeGreetingTitle: document.getElementById('homeGreetingTitle'),
    homeGreetingSubtitle: document.getElementById('homeGreetingSubtitle'),
    homeQuickAddBtn: document.getElementById('homeQuickAddBtn'),
    homeKpiTotal: document.getElementById('homeKpiTotal'),
    homeKpiTodo: document.getElementById('homeKpiTodo'),
    homeKpiInProgress: document.getElementById('homeKpiInProgress'),
    homeKpiDone: document.getElementById('homeKpiDone'),
    homeProgressPercentText: document.getElementById('homeProgressPercentText'),
    homeProgressBarFill: document.getElementById('homeProgressBarFill'),
    homeUpcomingCountBadge: document.getElementById('homeUpcomingCountBadge'),
    homeUpcomingList: document.getElementById('homeUpcomingList'),
    homeOverdueCountBadge: document.getElementById('homeOverdueCountBadge'),
    homeOverdueList: document.getElementById('homeOverdueList'),
    homeWeekSummarySubtitle: document.getElementById('homeWeekSummarySubtitle'),
    homeWeekStrip: document.getElementById('homeWeekStrip'),
    nextTipBtn: document.getElementById('nextTipBtn'),
    productivityTipTitle: document.getElementById('productivityTipTitle'),
    productivityTipBody: document.getElementById('productivityTipBody'),
    productivityTipIndex: document.getElementById('productivityTipIndex'),
    // Tasks
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterPriority: document.getElementById('filterPriority'),
    filterCategory: document.getElementById('filterCategory'),
    filterStatus: document.getElementById('filterStatus'),
    sortSelect: document.getElementById('sortSelect'),
    viewListBtn: document.getElementById('viewListBtn'),
    viewKanbanBtn: document.getElementById('viewKanbanBtn'),
    listViewContainer: document.getElementById('listViewContainer'),
    kanbanViewContainer: document.getElementById('kanbanViewContainer'),
    kanbanListTodo: document.getElementById('kanbanListTodo'),
    kanbanListInProgress: document.getElementById('kanbanListInProgress'),
    kanbanListDone: document.getElementById('kanbanListDone'),
    kanbanCountTodo: document.getElementById('kanbanCountTodo'),
    kanbanCountInProgress: document.getElementById('kanbanCountInProgress'),
    kanbanCountDone: document.getElementById('kanbanCountDone'),
    // Calendar
    calendarMonthTitle: document.getElementById('calendarMonthTitle'),
    calPrevMonthBtn: document.getElementById('calPrevMonthBtn'),
    calTodayBtn: document.getElementById('calTodayBtn'),
    calNextMonthBtn: document.getElementById('calNextMonthBtn'),
    calendarGrid: document.getElementById('calendarGrid'),
    selectedDayTitle: document.getElementById('selectedDayTitle'),
    selectedDayTaskCount: document.getElementById('selectedDayTaskCount'),
    addTaskForSelectedDateBtn: document.getElementById('addTaskForSelectedDateBtn'),
    selectedDayTasksList: document.getElementById('selectedDayTasksList'),
    // Stats
    statsResetDemoBtn: document.getElementById('statsResetDemoBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonBtn: document.getElementById('importJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    statCompletionRate: document.getElementById('statCompletionRate'),
    statCompletionSub: document.getElementById('statCompletionSub'),
    statOnTimeCount: document.getElementById('statOnTimeCount'),
    statOverdueCount: document.getElementById('statOverdueCount'),
    statHighOpenCount: document.getElementById('statHighOpenCount'),
    donutSegDone: document.getElementById('donutSegDone'),
    donutSegInProgress: document.getElementById('donutSegInProgress'),
    donutSegTodo: document.getElementById('donutSegTodo'),
    donutCenterTotal: document.getElementById('donutCenterTotal'),
    donutLegend: document.getElementById('donutLegend'),
    priorityChartContainer: document.getElementById('priorityChartContainer'),
    categoryChartGrid: document.getElementById('categoryChartGrid'),
    statsDetailTableBody: document.getElementById('statsDetailTableBody'),
    statsDetailTableFoot: document.getElementById('statsDetailTableFoot'),
    resetDemoDataBtn: document.getElementById('resetDemoDataBtn'),
    // Modal Thêm/Sửa
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
    cancelTaskModalBtn: document.getElementById('cancelTaskModalBtn'),
    taskForm: document.getElementById('taskForm'),
    taskIdInput: document.getElementById('taskIdInput'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    titleErrorMsg: document.getElementById('titleErrorMsg'),
    taskDescInput: document.getElementById('taskDescInput'),
    taskPriorityInput: document.getElementById('taskPriorityInput'),
    taskCategoryInput: document.getElementById('taskCategoryInput'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    taskStatusInput: document.getElementById('taskStatusInput'),
    // Modal Xóa
    deleteModal: document.getElementById('deleteModal'),
    deleteTaskName: document.getElementById('deleteTaskName'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    // Toast
    toastContainer: document.getElementById('toastContainer'),
  };

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ==================== TIỆN ÍCH NGÀY THÁNG & CHUỖI ====================
  function formatDateObjToISO(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseISOToLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return formatDateObjToISO(d);
  }

  function getTodayString() {
    return getOffsetDateString(0);
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return 'Không có hạn';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatVietnameseFullDate(dateObj) {
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekday = weekdays[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `${weekday}, ngày ${day} tháng ${month}, ${year}`;
  }

  function getDaysDiffFromToday(dateStr) {
    if (!dateStr) return null;
    const today = parseISOToLocalDate(getTodayString());
    const target = parseISOToLocalDate(dateStr);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((target - today) / msPerDay);
  }

  function getDueDateStatus(dateStr, status) {
    if (!dateStr || status === 'done') return 'normal';
    const today = getTodayString();
    if (dateStr < today) return 'overdue';
    if (dateStr === today) return 'today';
    return 'normal';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==================== 8 DỮ LIỆU MẪU THÔNG MINH ====================
  function createSampleTasks() {
    const now = Date.now();
    return [
      {
        id: 'task_demo_1',
        title: 'Gửi báo cáo tổng kết ngân sách tháng trước',
        description: 'Đối chiếu số liệu chi tiêu thực tế với kế hoạch và gửi file PDF cho trưởng bộ phận.',
        priority: 'high',
        category: 'work',
        dueDate: getOffsetDateString(-2), // Quá hạn 2 ngày
        status: 'todo',
        createdAt: now - 1000 * 60 * 60 * 72,
      },
      {
        id: 'task_demo_2',
        title: 'Khám sức khỏe định kỳ & xét nghiệm tổng quát',
        description: 'Nhịn ăn sáng trước 8 tiếng, mang theo thẻ bảo hiểm và hồ sơ khám lần trước.',
        priority: 'medium',
        category: 'health',
        dueDate: getOffsetDateString(-1), // Hôm qua - Đã hoàn thành
        status: 'done',
        createdAt: now - 1000 * 60 * 60 * 48,
      },
      {
        id: 'task_demo_3',
        title: 'Hoàn thiện slide thuyết trình lộ trình sản phẩm Q4',
        description: 'Bổ sung biểu đồ tăng trưởng người dùng, kế hoạch ra mắt tính năng mới và phần hỏi đáp.',
        priority: 'high',
        category: 'work',
        dueDate: getOffsetDateString(0), // Hôm nay
        status: 'in_progress',
        createdAt: now - 1000 * 60 * 60 * 10,
      },
      {
        id: 'task_demo_4',
        title: 'Thanh toán hóa đơn điện, nước & internet gia đình',
        description: 'Kiểm tra chỉ số tiêu thụ tháng này và thanh toán qua ứng dụng ngân hàng trước 20h.',
        priority: 'medium',
        category: 'personal',
        dueDate: getOffsetDateString(0), // Hôm nay
        status: 'todo',
        createdAt: now - 1000 * 60 * 60 * 6,
      },
      {
        id: 'task_demo_5',
        title: 'Hoàn thành bài thực hành JavaScript ES6 & Async/Await',
        description: 'Xây dựng ứng dụng gọi API thời tiết và xử lý lỗi bất đồng bộ.',
        priority: 'high',
        category: 'study',
        dueDate: getOffsetDateString(1), // Ngày mai
        status: 'todo',
        createdAt: now - 1000 * 60 * 60 * 4,
      },
      {
        id: 'task_demo_6',
        title: 'Chạy bộ 5km công viên & tập giãn cơ buổi chiều',
        description: 'Duy trì nhịp tim ổn định và uống đủ 2 lít nước trong ngày.',
        priority: 'medium',
        category: 'health',
        dueDate: getOffsetDateString(2), // 2 ngày tới
        status: 'in_progress',
        createdAt: now - 1000 * 60 * 60 * 3,
      },
      {
        id: 'task_demo_7',
        title: 'Dọn dẹp thư mục Google Drive & sao lưu ảnh cá nhân',
        description: 'Phân loại tài liệu theo năm 2026 và xóa các bản sao trùng lặp.',
        priority: 'low',
        category: 'other',
        dueDate: getOffsetDateString(4), // 4 ngày tới
        status: 'todo',
        createdAt: now - 1000 * 60 * 60 * 2,
      },
      {
        id: 'task_demo_8',
        title: 'Đọc xong chương 3 sách Tư duy Nhanh và Chậm',
        description: 'Tóm tắt 5 ý chính vào sổ tay ghi chú học tập.',
        priority: 'low',
        category: 'study',
        dueDate: getOffsetDateString(6), // 6 ngày tới - Đã xong sớm
        status: 'done',
        createdAt: now - 1000 * 60 * 30,
      },
    ];
  }

  // ==================== LƯU TRỮ LOCALSTORAGE ====================
  // Chuẩn hóa một tác vụ đọc từ localStorage / file nhập (loại bỏ dữ liệu hỏng)
  function normalizeTask(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const title = String(raw.title ?? '').trim();
    if (!title) return null;
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title,
      description: String(raw.description ?? ''),
      priority: PRIORITY_META[raw.priority] ? raw.priority : 'medium',
      category: CATEGORY_META[raw.category] ? raw.category : 'other',
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.dueDate || '') ? raw.dueDate : '',
      status: STATUS_META[raw.status] ? raw.status : 'todo',
      createdAt: Number(raw.createdAt) || Date.now(),
    };
  }

  function normalizeTaskList(list) {
    return (Array.isArray(list) ? list : []).map(normalizeTask).filter(Boolean);
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASKS);
      if (raw === null) {
        tasks = createSampleTasks();
        saveTasks();
      } else {
        tasks = normalizeTaskList(JSON.parse(raw));
      }
    } catch (err) {
      console.error('Lỗi đọc dữ liệu localStorage:', err);
      tasks = createSampleTasks();
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
      return true;
    } catch (err) {
      console.error('Lỗi lưu dữ liệu localStorage:', err);
      showToast('Không thể lưu dữ liệu! Hãy xuất file sao lưu JSON để tránh mất việc.', 'warning', 6000);
      return false;
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    applyTheme(isDark);
  }

  function applyTheme(isDark) {
    const htmlEl = document.documentElement;
    if (isDark) {
      htmlEl.classList.add('dark');
      dom.sunIcon.classList.remove('hidden');
      dom.moonIcon.classList.add('hidden');
    } else {
      htmlEl.classList.remove('dark');
      dom.sunIcon.classList.add('hidden');
      dom.moonIcon.classList.remove('hidden');
    }
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  }

  // ==================== ĐIỀU HƯỚNG 4 PHÂN HỆ ====================
  function switchTab(tabName) {
    const validTabs = ['home', 'tasks', 'calendar', 'stats'];
    if (!validTabs.includes(tabName)) tabName = 'home';
    activeTab = tabName;
    localStorage.setItem(STORAGE_KEY_TAB, tabName);

    // Ẩn/hiện section
    document.querySelectorAll('.page-section').forEach((sec) => {
      sec.classList.toggle('hidden', sec.id !== `section-${tabName}`);
    });

    // Cập nhật trạng thái nút Top Nav
    document.querySelectorAll('.top-nav-btn').forEach((btn) => {
      const isActive = btn.dataset.nav === tabName;
      btn.className = isActive
        ? 'top-nav-btn is-active inline-flex items-center gap-2 px-3 text-sm font-semibold text-slate-900 dark:text-white'
        : 'top-nav-btn inline-flex items-center gap-2 px-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors';
      if (isActive) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    // Cập nhật trạng thái nút Mobile Bottom Nav
    document.querySelectorAll('.bottom-nav-btn').forEach((btn) => {
      const isActive = btn.dataset.nav === tabName;
      btn.className = isActive
        ? 'bottom-nav-btn is-active flex flex-col items-center justify-center py-1.5 px-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300'
        : 'bottom-nav-btn flex flex-col items-center justify-center py-1.5 px-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors';
      if (isActive) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== THÔNG BÁO TOAST ====================
  function showToast(message, type = 'success', duration = 3000, action = null) {
    const colors = {
      success: 'bg-emerald-600 text-white border-emerald-500',
      info: 'bg-indigo-600 text-white border-indigo-500',
      warning: 'bg-amber-600 text-white border-amber-500',
      danger: 'bg-rose-600 text-white border-rose-500',
    };

    const iconNames = {
      success: 'check-circle-2',
      info: 'info',
      warning: 'alert-triangle',
      danger: 'trash-2',
    };

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${colors[type] || colors.info} text-sm font-medium transform translate-y-3 opacity-0 transition-all duration-300`;
    toast.innerHTML = `
      <i data-lucide="${iconNames[type] || 'info'}" class="w-5 h-5 shrink-0"></i>
      <span class="flex-1">${escapeHTML(message)}</span>
    `;

    const dismiss = () => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    };

    if (action && typeof action.onClick === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = action.label;
      btn.className = 'shrink-0 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-semibold underline-offset-2 focus:outline-none focus:ring-2 focus:ring-white';
      btn.addEventListener('click', () => {
        action.onClick();
        dismiss();
      });
      toast.appendChild(btn);
    }

    dom.toastContainer.appendChild(toast);
    refreshIcons();

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    setTimeout(dismiss, duration);
  }

  // ==================== PHÂN HỆ 1: RENDER TRANG CHỦ (HOME) ====================
  function renderProductivityTip() {
    const tip = PRODUCTIVITY_TIPS[currentTipIndex % PRODUCTIVITY_TIPS.length];
    dom.productivityTipTitle.textContent = tip.title;
    dom.productivityTipBody.textContent = tip.body;
    dom.productivityTipIndex.textContent = `${(currentTipIndex % PRODUCTIVITY_TIPS.length) + 1} / ${PRODUCTIVITY_TIPS.length}`;
  }

  function renderHomeSection() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Chào buổi tối';
    if (hour < 12) greeting = 'Chào buổi sáng';
    else if (hour < 18) greeting = 'Chào buổi chiều';

    dom.homeGreetingTitle.textContent = greeting;
    dom.homeCurrentDateText.textContent = formatVietnameseFullDate(now);
    dom.homeDayNumber.textContent = now.getDate();

    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    dom.homeKpiTotal.textContent = total;
    dom.homeKpiTodo.textContent = todo;
    dom.homeKpiInProgress.textContent = inProgress;
    dom.homeKpiDone.textContent = done;
    dom.homeProgressPercentText.textContent = `${percent}% (${done}/${total})`;
    dom.homeProgressBarFill.style.width = `${percent}%`;
    dom.homeProgressBarFill.parentElement.setAttribute('aria-valuenow', String(percent));

    {
      const todayIso = getTodayString();
      const dueToday = tasks.filter((t) => t.status !== 'done' && t.dueDate === todayIso).length;
      const overdueCount = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < todayIso).length;
      const bits = [];
      if (dueToday > 0) bits.push(`${dueToday} việc đến hạn hôm nay`);
      if (overdueCount > 0) bits.push(`${overdueCount} việc đã quá hạn`);
      let sub;
      if (total === 0) sub = 'Chưa có tác vụ nào. Thêm việc đầu tiên để bắt đầu.';
      else if (bits.length === 0) sub = 'Không có việc nào đến hạn hôm nay.';
      else sub = bits.join(', ') + '.';
      dom.homeGreetingSubtitle.textContent = sub.charAt(0).toUpperCase() + sub.slice(1);
    }

    const todayStr = getTodayString();
    const threeDaysLaterStr = getOffsetDateString(3);

    // 1. Tác vụ hôm nay & Sắp tới (trong 3 ngày tới, chưa hoàn thành)
    const upcomingTasks = tasks
      .filter((t) => t.status !== 'done' && t.dueDate && t.dueDate >= todayStr && t.dueDate <= threeDaysLaterStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || (PRIORITY_META[b.priority]?.weight || 0) - (PRIORITY_META[a.priority]?.weight || 0));

    dom.homeUpcomingCountBadge.textContent = `${upcomingTasks.length} tác vụ`;

    if (upcomingTasks.length === 0) {
      dom.homeUpcomingList.innerHTML = `
        <div class="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center my-auto">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Không có tác vụ nào đến hạn trong 3 ngày tới</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Bạn có thể thêm tác vụ mới hoặc kiểm tra lịch trình tuần này.</p>
        </div>
      `;
    } else {
      dom.homeUpcomingList.innerHTML = upcomingTasks
        .map((task) => {
          const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
          const cMeta = CATEGORY_META[task.category] || CATEGORY_META.other;
          const diff = getDaysDiffFromToday(task.dueDate);
          const dueLabel = diff === 0 ? 'Hôm nay' : diff === 1 ? 'Ngày mai' : `Còn ${diff} ngày (${formatDisplayDate(task.dueDate)})`;

          return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl border border-l-4 ${pMeta.spineClass} border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  data-action="toggle-done"
                  data-id="${task.id}"
                  title="Đánh dấu hoàn thành"
                  class="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors"
                ></button>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">${escapeHTML(task.title)}</p>
                  <div class="flex flex-wrap items-center gap-1.5 mt-1">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${pMeta.badgeClass}">
                      <span class="w-1.5 h-1.5 rounded-full ${pMeta.dotClass}"></span>${pMeta.label}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-medium ${cMeta.badgeClass}">${cMeta.label}</span>
                    <span class="text-[11px] font-medium ${diff === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}">
                      • ${dueLabel}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                data-action="edit"
                data-id="${task.id}"
                title="Chỉnh sửa"
                class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
              >
                <i data-lucide="pencil" class="w-4 h-4"></i>
              </button>
            </div>
          `;
        })
        .join('');
    }

    // 2. Cần chú ý / Quá hạn
    const overdueTasks = tasks
      .filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    dom.homeOverdueCountBadge.textContent = `${overdueTasks.length} quá hạn`;

    if (overdueTasks.length === 0) {
      dom.homeOverdueList.innerHTML = `
        <div class="rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 p-6 text-center my-auto">
          <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
          </div>
          <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Tuyệt vời! Không có tác vụ quá hạn</p>
          <p class="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">Bạn đang kiểm soát tiến độ công việc rất tốt.</p>
        </div>
      `;
    } else {
      dom.homeOverdueList.innerHTML = overdueTasks
        .map((task) => {
          const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
          const daysLate = Math.abs(getDaysDiffFromToday(task.dueDate));
          return `
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl border border-l-4 ${pMeta.spineClass} border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/20">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  data-action="toggle-done"
                  data-id="${task.id}"
                  title="Hoàn thành ngay"
                  class="mt-0.5 w-5 h-5 rounded-md border-2 border-rose-400 hover:bg-emerald-500 hover:border-emerald-500 shrink-0 transition-colors"
                ></button>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">${escapeHTML(task.title)}</p>
                  <p class="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
                    Trễ ${daysLate} ngày (Hạn: ${formatDisplayDate(task.dueDate)})
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-action="edit"
                data-id="${task.id}"
                title="Dời hạn / Sửa"
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/30 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 shrink-0"
              >
                Xử lý
              </button>
            </div>
          `;
        })
        .join('');
    }

    // 3. Tóm tắt lịch trình tuần này (Thứ 2 -> Chủ Nhật)
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Thứ 2, 6 = Chủ Nhật
    const mondayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek);
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    let weekTotalTasks = 0;

    const weekCellsHTML = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayOfWeek.getFullYear(), mondayOfWeek.getMonth(), mondayOfWeek.getDate() + i);
      const iso = formatDateObjToISO(d);
      const dayTasks = tasks.filter((t) => t.dueDate === iso);
      weekTotalTasks += dayTasks.length;
      const isToday = iso === todayStr;

      weekCellsHTML.push(`
        <button
          type="button"
          data-jump-date="${iso}"
          class="flex flex-col items-center p-2 sm:p-3 rounded-xl border transition-all ${
            isToday
              ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-sm'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
          }"
        >
          <span class="text-[11px] font-semibold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}">${dayNames[i]}</span>
          <span class="text-sm sm:text-base font-bold mt-0.5 ${isToday ? 'text-indigo-700 dark:text-white' : 'text-slate-800 dark:text-slate-200'}">${d.getDate()}</span>
          <div class="mt-1.5 h-4 flex items-center justify-center">
            ${
              dayTasks.length > 0
                ? `<span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }">${dayTasks.length}</span>`
                : `<span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>`
            }
          </div>
        </button>
      `);
    }

    dom.homeWeekStrip.innerHTML = weekCellsHTML.join('');
    dom.homeWeekSummarySubtitle.textContent = `Tuần này có ${weekTotalTasks} tác vụ được lên lịch • Nhấp vào một ngày để xem trên Lịch`;
    renderProductivityTip();
  }

  // ==================== PHÂN HỆ 2: TÁC VỤ (LIST & KANBAN) ====================
  function getFilteredAndSortedTasks() {
    const query = filterState.search.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query));

      const matchesPriority = filterState.priority === 'all' || task.priority === filterState.priority;
      const matchesCategory = filterState.category === 'all' || task.category === filterState.category;
      const matchesStatus = filterState.status === 'all' || task.status === filterState.status;

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (filterState.sort === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (filterState.sort === 'priority') {
        const diff = (PRIORITY_META[b.priority]?.weight || 0) - (PRIORITY_META[a.priority]?.weight || 0);
        return diff !== 0 ? diff : b.createdAt - a.createdAt;
      }
      return b.createdAt - a.createdAt;
    });
  }

  function renderDueDateBadge(task) {
    if (!task.dueDate) return '';
    const status = getDueDateStatus(task.dueDate, task.status);
    const formatted = formatDisplayDate(task.dueDate);

    if (status === 'overdue') {
      return `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30" title="Tác vụ đã quá hạn!">
          <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i>
          Quá hạn (${formatted})
        </span>
      `;
    }

    if (status === 'today') {
      return `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
          <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
          Hôm nay (${formatted})
        </span>
      `;
    }

    return `
      <span class="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
        ${formatted}
      </span>
    `;
  }

  function renderListView(filteredTasks) {
    if (filteredTasks.length === 0) {
      dom.listViewContainer.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <i data-lucide="clipboard-list" class="w-7 h-7"></i>
          </div>
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-200">Không tìm thấy tác vụ nào</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm, điều chỉnh bộ lọc hoặc nhấn "+ Thêm tác vụ" để tạo mới.
          </p>
        </div>
      `;
      return;
    }

    dom.listViewContainer.innerHTML = filteredTasks
      .map((task) => {
        const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
        const cMeta = CATEGORY_META[task.category] || CATEGORY_META.other;
        const isDone = task.status === 'done';
        const isOverdue = getDueDateStatus(task.dueDate, task.status) === 'overdue';

        return `
          <article
            class="group bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-l-4 ${isDone ? 'border-l-slate-300 dark:border-l-slate-600' : pMeta.spineClass} ${
              isOverdue
                ? 'border-rose-300 dark:border-rose-500/40'
                : 'border-slate-200/80 dark:border-slate-800'
            } shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDone ? 'opacity-75' : ''
        }"
          >
            <div class="flex items-start gap-3.5 flex-1 min-w-0">
              <button
                type="button"
                data-action="toggle-done"
                data-id="${task.id}"
                aria-label="${isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}"
                class="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400'
                }"
              >
                ${isDone ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
              </button>

              <div class="flex-1 min-w-0 space-y-1.5">
                <h3 class="text-base font-semibold text-slate-900 dark:text-white break-words ${
                  isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }">
                  ${escapeHTML(task.title)}
                </h3>

                ${
                  task.description
                    ? `<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 break-words">${escapeHTML(
                        task.description
                      )}</p>`
                    : ''
                }

                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${pMeta.badgeClass}">
                    <span class="w-1.5 h-1.5 rounded-full ${pMeta.dotClass}"></span>
                    ${pMeta.label}
                  </span>

                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${cMeta.badgeClass}">
                    ${cMeta.label}
                  </span>

                  ${renderDueDateBadge(task)}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
              <select
                data-action="change-status"
                data-id="${task.id}"
                aria-label="Đổi trạng thái tác vụ"
                class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Cần làm</option>
                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>Đang thực hiện</option>
                <option value="done" ${task.status === 'done' ? 'selected' : ''}>Đã hoàn thành</option>
              </select>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  data-action="edit"
                  data-id="${task.id}"
                  title="Chỉnh sửa tác vụ"
                  class="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                >
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>

                <button
                  type="button"
                  data-action="delete"
                  data-id="${task.id}"
                  title="Xóa tác vụ"
                  class="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderKanbanCard(task) {
    const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
    const cMeta = CATEGORY_META[task.category] || CATEGORY_META.other;
    const isDone = task.status === 'done';
    const isOverdue = getDueDateStatus(task.dueDate, task.status) === 'overdue';

    const quickMoveButtons = [];
    if (task.status !== 'todo') {
      quickMoveButtons.push(`
        <button type="button" data-action="quick-move" data-id="${task.id}" data-target="todo"
          class="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
          ← Cần làm
        </button>
      `);
    }
    if (task.status !== 'in_progress') {
      quickMoveButtons.push(`
        <button type="button" data-action="quick-move" data-id="${task.id}" data-target="in_progress"
          class="px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 transition-colors">
          Đang làm
        </button>
      `);
    }
    if (task.status !== 'done') {
      quickMoveButtons.push(`
        <button type="button" data-action="quick-move" data-id="${task.id}" data-target="done"
          class="px-2 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 transition-colors">
          Hoàn thành ✓
        </button>
      `);
    }

    return `
      <div
        draggable="true"
        data-task-id="${task.id}"
        class="kanban-card cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-l-4 ${isDone ? 'border-l-slate-300 dark:border-l-slate-600' : pMeta.spineClass} ${
          isOverdue
            ? 'border-rose-300 dark:border-rose-500/40'
            : 'border-slate-200/80 dark:border-slate-800'
        } shadow-sm hover:shadow-md transition-all space-y-2.5"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${pMeta.badgeClass}">
              <span class="w-1.5 h-1.5 rounded-full ${pMeta.dotClass}"></span>
              ${pMeta.label}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cMeta.badgeClass}">
              ${cMeta.label}
            </span>
          </div>

          <div class="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              data-action="edit"
              data-id="${task.id}"
              title="Chỉnh sửa"
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button
              type="button"
              data-action="delete"
              data-id="${task.id}"
              title="Xóa"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white leading-snug ${
            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }">
            ${escapeHTML(task.title)}
          </h4>
          ${
            task.description
              ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${escapeHTML(task.description)}</p>`
              : ''
          }
        </div>

        <div>${renderDueDateBadge(task)}</div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
          ${quickMoveButtons.join('')}
        </div>
      </div>
    `;
  }

  function renderKanbanView(filteredTasks) {
    const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
    const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
    const doneTasks = filteredTasks.filter((t) => t.status === 'done');

    dom.kanbanCountTodo.textContent = todoTasks.length;
    dom.kanbanCountInProgress.textContent = inProgressTasks.length;
    dom.kanbanCountDone.textContent = doneTasks.length;

    const emptyColumnHTML = `
      <div class="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 dark:text-slate-500">
        Kéo thả tác vụ vào cột này
      </div>
    `;

    dom.kanbanListTodo.innerHTML = todoTasks.length ? todoTasks.map(renderKanbanCard).join('') : emptyColumnHTML;
    dom.kanbanListInProgress.innerHTML = inProgressTasks.length
      ? inProgressTasks.map(renderKanbanCard).join('')
      : emptyColumnHTML;
    dom.kanbanListDone.innerHTML = doneTasks.length ? doneTasks.map(renderKanbanCard).join('') : emptyColumnHTML;

    bindKanbanDragEvents();
  }

  function renderTasksSection() {
    const filteredTasks = getFilteredAndSortedTasks();
    if (filterState.view === 'list') {
      dom.listViewContainer.classList.remove('hidden');
      dom.kanbanViewContainer.classList.add('hidden');
      renderListView(filteredTasks);
    } else {
      dom.listViewContainer.classList.add('hidden');
      dom.kanbanViewContainer.classList.remove('hidden');
      renderKanbanView(filteredTasks);
    }
  }

  // ==================== PHÂN HỆ 3: LỊCH (CALENDAR) ====================
  function renderCalendarSection() {
    const { year, month, selectedDate } = calendarState;
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
    ];
    dom.calendarMonthTitle.textContent = `${monthNames[month]}, ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Thứ 2 = 0 ... Chủ Nhật = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const todayStr = getTodayString();

    const cellsHTML = [];
    for (let idx = 0; idx < totalCells; idx++) {
      const dayNum = idx - startOffset + 1;
      const cellDate = new Date(year, month, dayNum);
      const iso = formatDateObjToISO(cellDate);
      const isCurrentMonth = cellDate.getMonth() === month;
      const isToday = iso === todayStr;
      const isSelected = iso === selectedDate;

      const dayTasks = tasks
        .filter((t) => t.dueDate === iso)
        .sort((a, b) => (PRIORITY_META[b.priority]?.weight || 0) - (PRIORITY_META[a.priority]?.weight || 0));

      const visiblePills = dayTasks.slice(0, 2).map((t) => {
        const pMeta = PRIORITY_META[t.priority] || PRIORITY_META.medium;
        const isDone = t.status === 'done';
        return `
          <div class="truncate px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium ${pMeta.pillClass} ${
          isDone ? 'line-through opacity-55' : ''
        }">
            ${escapeHTML(t.title)}
          </div>
        `;
      });

      const extraBadge =
        dayTasks.length > 2
          ? `<div class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 px-1">+${dayTasks.length - 2} khác</div>`
          : '';

      cellsHTML.push(`
        <button
          type="button"
          data-cal-date="${iso}"
          class="min-h-[76px] sm:min-h-[104px] p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
            isSelected
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
              : isCurrentMonth
              ? 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-slate-700'
              : 'border-slate-100 dark:border-slate-800/50 bg-slate-50/60 dark:bg-slate-950/40 opacity-50 hover:opacity-80'
          }"
        >
          <div class="w-full flex items-center justify-between mb-1">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isToday
                ? 'bg-indigo-600 text-white shadow-sm'
                : isSelected
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-slate-700 dark:text-slate-300'
            }">
              ${cellDate.getDate()}
            </span>
            ${
              dayTasks.length > 0
                ? `<span class="sm:hidden w-2 h-2 rounded-full bg-indigo-500"></span>`
                : ''
            }
          </div>

          <div class="w-full space-y-1 overflow-hidden">
            ${visiblePills.join('')}
            ${extraBadge}
          </div>
        </button>
      `);
    }

    dom.calendarGrid.innerHTML = cellsHTML.join('');
    renderSelectedDayPanel();
  }

  function renderSelectedDayPanel() {
    const { selectedDate } = calendarState;
    const dateObj = parseISOToLocalDate(selectedDate);
    const isToday = selectedDate === getTodayString();

    dom.selectedDayTitle.textContent = isToday
      ? `Hôm nay (${formatDisplayDate(selectedDate)})`
      : formatVietnameseFullDate(dateObj);

    const dayTasks = tasks
      .filter((t) => t.dueDate === selectedDate)
      .sort((a, b) => (PRIORITY_META[b.priority]?.weight || 0) - (PRIORITY_META[a.priority]?.weight || 0));

    dom.selectedDayTaskCount.textContent = `${dayTasks.length} tác vụ`;

    if (dayTasks.length === 0) {
      dom.selectedDayTasksList.innerHTML = `
        <div class="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Chưa có tác vụ vào ngày này</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Nhấn nút "+ Thêm tác vụ vào ngày này" ở trên để tạo lịch trình.</p>
        </div>
      `;
      return;
    }

    dom.selectedDayTasksList.innerHTML = dayTasks
      .map((task) => {
        const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
        const cMeta = CATEGORY_META[task.category] || CATEGORY_META.other;
        const isDone = task.status === 'done';

        return `
          <div class="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2 ${
            isDone ? 'opacity-70' : ''
          }">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  data-action="toggle-done"
                  data-id="${task.id}"
                  title="${isDone ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}"
                  class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                  }"
                >
                  ${isDone ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}
                </button>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white break-words ${
                    isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }">
                    ${escapeHTML(task.title)}
                  </p>
                  ${
                    task.description
                      ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${escapeHTML(task.description)}</p>`
                      : ''
                  }
                </div>
              </div>

              <div class="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  data-action="edit"
                  data-id="${task.id}"
                  title="Chỉnh sửa"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700"
                >
                  <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
                <button
                  type="button"
                  data-action="delete"
                  data-id="${task.id}"
                  title="Xóa"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700"
                >
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-1.5 pl-7">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${pMeta.badgeClass}">
                <span class="w-1.5 h-1.5 rounded-full ${pMeta.dotClass}"></span>${pMeta.label}
              </span>
              <span class="px-2 py-0.5 rounded-md text-[11px] font-medium ${cMeta.badgeClass}">
                ${cMeta.label}
              </span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // ==================== PHÂN HỆ 4: BẢNG THỐNG KÊ (STATS & ANALYTICS) ====================
  function renderStatsSection() {
    const todayStr = getTodayString();
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;

    const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);
    const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr).length;
    const onTime = total - overdue;
    const highOpen = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;

    // 4 thẻ KPI
    dom.statCompletionRate.textContent = `${completionRate}%`;
    dom.statCompletionSub.textContent = `${done} / ${total} tác vụ hoàn thành`;
    dom.statOnTimeCount.textContent = onTime;
    dom.statOverdueCount.textContent = overdue;
    dom.statHighOpenCount.textContent = highOpen;

    // 1. SVG Donut Chart (r = 42 => C = 2 * pi * 42 = 263.89)
    const circumference = 2 * Math.PI * 42;
    dom.donutCenterTotal.textContent = total;

    if (total === 0) {
      dom.donutSegDone.setAttribute('stroke-dasharray', `0 ${circumference}`);
      dom.donutSegInProgress.setAttribute('stroke-dasharray', `0 ${circumference}`);
      dom.donutSegTodo.setAttribute('stroke-dasharray', `0 ${circumference}`);
    } else {
      const doneLen = (done / total) * circumference;
      const inProgLen = (inProgress / total) * circumference;
      const todoLen = (todo / total) * circumference;

      dom.donutSegDone.setAttribute('stroke-dasharray', `${doneLen} ${circumference}`);
      dom.donutSegDone.setAttribute('stroke-dashoffset', '0');

      dom.donutSegInProgress.setAttribute('stroke-dasharray', `${inProgLen} ${circumference}`);
      dom.donutSegInProgress.setAttribute('stroke-dashoffset', `${-doneLen}`);

      dom.donutSegTodo.setAttribute('stroke-dasharray', `${todoLen} ${circumference}`);
      dom.donutSegTodo.setAttribute('stroke-dashoffset', `${-(doneLen + inProgLen)}`);
    }

    const legendItems = [
      { label: 'Đã hoàn thành', count: done, colorClass: 'bg-emerald-500' },
      { label: 'Đang thực hiện', count: inProgress, colorClass: 'bg-amber-500' },
      { label: 'Cần làm', count: todo, colorClass: 'bg-slate-400' },
    ];

    dom.donutLegend.innerHTML = legendItems
      .map((item) => {
        const pct = total === 0 ? 0 : Math.round((item.count / total) * 100);
        return `
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${item.colorClass} shrink-0"></span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">${item.label}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 dark:text-white">${item.count}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">(${pct}%)</span>
            </div>
          </div>
        `;
      })
      .join('');

    // 2. Biểu đồ cột ngang theo Mức độ ưu tiên
    const priorities = ['high', 'medium', 'low'];
    const maxPriorityTotal = Math.max(1, ...priorities.map((p) => tasks.filter((t) => t.priority === p).length));

    dom.priorityChartContainer.innerHTML = priorities
      .map((pKey) => {
        const pMeta = PRIORITY_META[pKey];
        const pTasks = tasks.filter((t) => t.priority === pKey);
        const pTotal = pTasks.length;
        const pDone = pTasks.filter((t) => t.status === 'done').length;
        const pRate = pTotal === 0 ? 0 : Math.round((pDone / pTotal) * 100);
        const widthTotalPct = Math.round((pTotal / maxPriorityTotal) * 100);
        const widthDonePct = Math.round((pDone / maxPriorityTotal) * 100);

        return `
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${pMeta.dotClass}"></span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">Ưu tiên ${pMeta.label}</span>
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Hoàn thành: <strong class="text-slate-800 dark:text-slate-200">${pDone}/${pTotal}</strong> (${pRate}%)
              </div>
            </div>
            <div class="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
              <!-- Thanh tổng số lượng -->
              <div
                class="h-full bg-slate-300/80 dark:bg-slate-700 rounded-lg transition-all duration-500"
                style="width: ${widthTotalPct}%"
              ></div>
              <!-- Thanh số đã hoàn thành chồng lên -->
              <div
                class="h-full bg-emerald-500 rounded-lg absolute top-0 left-0 transition-all duration-500"
                style="width: ${widthDonePct}%"
              ></div>
            </div>
          </div>
        `;
      })
      .join('');

    // 3. Biểu đồ theo Danh mục (5 danh mục)
    const categoryKeys = ['work', 'personal', 'study', 'health', 'other'];
    dom.categoryChartGrid.innerHTML = categoryKeys
      .map((cKey) => {
        const cMeta = CATEGORY_META[cKey];
        const cTasks = tasks.filter((t) => t.category === cKey);
        const cTotal = cTasks.length;
        const cDone = cTasks.filter((t) => t.status === 'done').length;
        const cRate = cTotal === 0 ? 0 : Math.round((cDone / cTotal) * 100);

        return `
          <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-lg text-xs font-semibold ${cMeta.badgeClass}">${cMeta.label}</span>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${cRate}%</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-xl font-bold text-slate-900 dark:text-white">${cDone}/${cTotal}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">hoàn thành</span>
            </div>
            <div class="w-full h-2 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full ${cMeta.barColor} rounded-full transition-all duration-500" style="width: ${cRate}%"></div>
            </div>
          </div>
        `;
      })
      .join('');

    // 4. Bảng thống kê chi tiết theo danh mục
    let sumTotal = 0,
      sumTodo = 0,
      sumInProg = 0,
      sumDone = 0,
      sumOverdue = 0;

    dom.statsDetailTableBody.innerHTML = categoryKeys
      .map((cKey) => {
        const cMeta = CATEGORY_META[cKey];
        const cTasks = tasks.filter((t) => t.category === cKey);
        const cTotal = cTasks.length;
        const cTodo = cTasks.filter((t) => t.status === 'todo').length;
        const cInProg = cTasks.filter((t) => t.status === 'in_progress').length;
        const cDone = cTasks.filter((t) => t.status === 'done').length;
        const cOverdue = cTasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr).length;
        const cRate = cTotal === 0 ? 0 : Math.round((cDone / cTotal) * 100);

        sumTotal += cTotal;
        sumTodo += cTodo;
        sumInProg += cInProg;
        sumDone += cDone;
        sumOverdue += cOverdue;

        return `
          <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
            <td class="py-3.5 px-4 sm:px-6 font-medium text-slate-900 dark:text-white">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${cMeta.badgeClass}">
                ${cMeta.label}
              </span>
            </td>
            <td class="py-3.5 px-3 text-center font-semibold text-slate-800 dark:text-slate-200">${cTotal}</td>
            <td class="py-3.5 px-3 text-center text-slate-600 dark:text-slate-400">${cTodo}</td>
            <td class="py-3.5 px-3 text-center text-amber-600 dark:text-amber-400 font-medium">${cInProg}</td>
            <td class="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">${cDone}</td>
            <td class="py-3.5 px-3 text-center ${cOverdue > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}">${cOverdue}</td>
            <td class="py-3.5 px-4 sm:px-6 text-right font-bold text-indigo-600 dark:text-indigo-400">${cRate}%</td>
          </tr>
        `;
      })
      .join('');

    const totalRate = sumTotal === 0 ? 0 : Math.round((sumDone / sumTotal) * 100);
    dom.statsDetailTableFoot.innerHTML = `
      <tr>
        <td class="py-3.5 px-4 sm:px-6 text-slate-900 dark:text-white">Tổng cộng</td>
        <td class="py-3.5 px-3 text-center text-slate-900 dark:text-white">${sumTotal}</td>
        <td class="py-3.5 px-3 text-center text-slate-700 dark:text-slate-300">${sumTodo}</td>
        <td class="py-3.5 px-3 text-center text-amber-600 dark:text-amber-400">${sumInProg}</td>
        <td class="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-400">${sumDone}</td>
        <td class="py-3.5 px-3 text-center text-rose-600 dark:text-rose-400">${sumOverdue}</td>
        <td class="py-3.5 px-4 sm:px-6 text-right text-indigo-600 dark:text-indigo-400">${totalRate}%</td>
      </tr>
    `;
  }

  // Xuất báo cáo CSV tiếng Việt (hỗ trợ UTF-8 BOM mở chuẩn trong Excel)
  function exportStatsCSV() {
    const todayStr = getTodayString();
    const escapeCSV = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const lines = [];
    lines.push(['BÁO CÁO THỐNG KÊ TÁC VỤ - TASKFLOW'].map(escapeCSV).join(','));
    lines.push(['Ngày xuất báo cáo', formatDisplayDate(todayStr)].map(escapeCSV).join(','));
    lines.push('');

    // Phần 1: Bảng tổng hợp theo danh mục
    lines.push(['THỐNG KÊ THEO DANH MỤC'].map(escapeCSV).join(','));
    lines.push(['Danh mục', 'Tổng số', 'Cần làm', 'Đang thực hiện', 'Đã hoàn thành', 'Quá hạn', 'Tỷ lệ hoàn thành (%)'].map(escapeCSV).join(','));

    const categoryKeys = ['work', 'personal', 'study', 'health', 'other'];
    categoryKeys.forEach((cKey) => {
      const cMeta = CATEGORY_META[cKey];
      const cTasks = tasks.filter((t) => t.category === cKey);
      const cTotal = cTasks.length;
      const cTodo = cTasks.filter((t) => t.status === 'todo').length;
      const cInProg = cTasks.filter((t) => t.status === 'in_progress').length;
      const cDone = cTasks.filter((t) => t.status === 'done').length;
      const cOverdue = cTasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr).length;
      const cRate = cTotal === 0 ? 0 : Math.round((cDone / cTotal) * 100);

      lines.push([cMeta.label, cTotal, cTodo, cInProg, cDone, cOverdue, `${cRate}%`].map(escapeCSV).join(','));
    });

    lines.push('');
    // Phần 2: Danh sách chi tiết tác vụ
    lines.push(['DANH SÁCH CHI TIẾT TÁC VỤ'].map(escapeCSV).join(','));
    lines.push(['Tiêu đề', 'Mô tả', 'Danh mục', 'Mức ưu tiên', 'Trạng thái', 'Ngày hết hạn'].map(escapeCSV).join(','));

    tasks.forEach((t) => {
      lines.push(
        [
          t.title,
          t.description || '',
          CATEGORY_META[t.category]?.label || t.category,
          PRIORITY_META[t.priority]?.label || t.priority,
          STATUS_META[t.status]?.label || t.status,
          t.dueDate ? formatDisplayDate(t.dueDate) : 'Không có hạn',
        ]
          .map(escapeCSV)
          .join(',')
      );
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_TaskFlow_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Đã xuất báo cáo thống kê CSV thành công!', 'success');
  }

  // ==================== HÀM RENDER TỔNG ====================
  function renderApp() {
    renderHomeSection();
    renderTasksSection();
    renderCalendarSection();
    renderStatsSection();
    refreshIcons();
  }

  // ==================== KÉO THẢ KANBAN (DRAG & DROP) ====================
  function bindKanbanDragEvents() {
    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        draggedTaskId = card.dataset.taskId;
        card.classList.add('opacity-50', 'scale-[0.98]');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', draggedTaskId);
        }
      });

      card.addEventListener('dragend', () => {
        draggedTaskId = null;
        card.classList.remove('opacity-50', 'scale-[0.98]');
      });
    });
  }

  function setupKanbanColumnDropZones() {
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach((col) => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
      });

      col.addEventListener('dragleave', (e) => {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50/40', 'dark:bg-indigo-950/30');
        const targetStatus = col.dataset.status;
        const id = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
        if (id && targetStatus) {
          updateTaskStatus(id, targetStatus);
        }
      });
    });
  }

  // ==================== THAO TÁC CRUD TÁC VỤ ====================
  function openTaskModal(taskToEdit = null, presetDueDate = '') {
    dom.titleErrorMsg.classList.add('hidden');
    dom.taskTitleInput.classList.remove('border-rose-500');

    if (taskToEdit) {
      dom.taskModalTitle.textContent = 'Chỉnh sửa tác vụ';
      dom.taskIdInput.value = taskToEdit.id;
      dom.taskTitleInput.value = taskToEdit.title;
      dom.taskDescInput.value = taskToEdit.description || '';
      dom.taskPriorityInput.value = taskToEdit.priority;
      dom.taskCategoryInput.value = taskToEdit.category;
      dom.taskDueDateInput.value = taskToEdit.dueDate || '';
      dom.taskStatusInput.value = taskToEdit.status;
    } else {
      dom.taskModalTitle.textContent = 'Thêm tác vụ mới';
      dom.taskForm.reset();
      dom.taskIdInput.value = '';
      dom.taskPriorityInput.value = 'medium';
      dom.taskCategoryInput.value = 'work';
      dom.taskStatusInput.value = 'todo';
      dom.taskDueDateInput.value = presetDueDate || '';
    }

    lastFocusedBeforeModal = document.activeElement;
    dom.taskModal.classList.remove('hidden');
    dom.taskModal.classList.add('flex');
    setTimeout(() => dom.taskTitleInput.focus(), 50);
  }

  function closeTaskModal() {
    dom.taskModal.classList.add('hidden');
    dom.taskModal.classList.remove('flex');
    if (lastFocusedBeforeModal && document.body.contains(lastFocusedBeforeModal)) {
      lastFocusedBeforeModal.focus();
    }
    lastFocusedBeforeModal = null;
  }

  function handleSaveTask(e) {
    e.preventDefault();
    const title = dom.taskTitleInput.value.trim();

    if (!title) {
      dom.titleErrorMsg.classList.remove('hidden');
      dom.taskTitleInput.classList.add('border-rose-500');
      dom.taskTitleInput.focus();
      return;
    }

    const existingId = dom.taskIdInput.value;
    const payload = {
      title,
      description: dom.taskDescInput.value.trim(),
      priority: dom.taskPriorityInput.value,
      category: dom.taskCategoryInput.value,
      dueDate: dom.taskDueDateInput.value,
      status: dom.taskStatusInput.value,
    };

    if (existingId) {
      const idx = tasks.findIndex((t) => t.id === existingId);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...payload };
        showToast('Đã cập nhật tác vụ thành công!', 'info');
      }
    } else {
      const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        ...payload,
        createdAt: Date.now(),
      };
      tasks.unshift(newTask);
      showToast('Đã thêm tác vụ mới!', 'success');
    }

    saveTasks();
    closeTaskModal();
    renderApp();
  }

  function toggleTaskDone(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.status === 'done') {
      task.status = 'todo';
      showToast('Đã chuyển tác vụ về trạng thái Cần làm.', 'info');
    } else {
      task.status = 'done';
      showToast('Chúc mừng! Bạn đã hoàn thành tác vụ.', 'success');
    }

    saveTasks();
    renderApp();
  }

  function updateTaskStatus(id, newStatus) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === newStatus) return;

    task.status = newStatus;
    saveTasks();
    renderApp();

    if (newStatus === 'done') {
      showToast('Đã hoàn thành tác vụ!', 'success');
    } else {
      showToast(`Đã chuyển sang "${STATUS_META[newStatus]?.label || newStatus}".`, 'info');
    }
  }

  function openDeleteModal(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    taskPendingDeleteId = id;
    dom.deleteTaskName.textContent = `"${task.title}"`;
    dom.deleteModal.classList.remove('hidden');
    dom.deleteModal.classList.add('flex');
  }

  function closeDeleteModal() {
    taskPendingDeleteId = null;
    dom.deleteModal.classList.add('hidden');
    dom.deleteModal.classList.remove('flex');
  }

  function confirmDeleteTask() {
    if (!taskPendingDeleteId) return;
    const index = tasks.findIndex((t) => t.id === taskPendingDeleteId);
    if (index === -1) return closeDeleteModal();
    const removed = tasks[index];

    tasks = tasks.filter((t) => t.id !== taskPendingDeleteId);
    saveTasks();
    closeDeleteModal();
    renderApp();

    showToast('Đã xóa tác vụ.', 'danger', 6000, {
      label: 'Hoàn tác',
      onClick: () => {
        if (tasks.some((t) => t.id === removed.id)) return;
        tasks.splice(Math.min(index, tasks.length), 0, removed);
        saveTasks();
        renderApp();
        showToast('Đã khôi phục tác vụ.', 'success');
      },
    });
  }

  // ==================== SAO LƯU / KHÔI PHỤC JSON ====================
  function exportTasksJSON() {
    const payload = { app: 'TaskFlow', version: 2, exportedAt: new Date().toISOString(), tasks };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TaskFlow_sao_luu_${getTodayString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu JSON!', 'success');
  }

  function importTasksJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const list = Array.isArray(data) ? data : data.tasks;
        const imported = normalizeTaskList(list);
        if (imported.length === 0) {
          showToast('File không có tác vụ hợp lệ nào.', 'warning', 4500);
          return;
        }
        const replaceAll = window.confirm(
          `Tìm thấy ${imported.length} tác vụ.\n\nOK = THAY THẾ toàn bộ dữ liệu hiện tại\nHủy = GỘP thêm vào dữ liệu hiện tại`
        );
        if (replaceAll) {
          tasks = imported;
        } else {
          const existingIds = new Set(tasks.map((t) => t.id));
          imported.forEach((t) => {
            if (existingIds.has(t.id)) t.id = 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          });
          tasks = [...imported, ...tasks];
        }
        saveTasks();
        renderApp();
        showToast(`Đã nhập ${imported.length} tác vụ.`, 'success');
      } catch (err) {
        console.error('Lỗi nhập JSON:', err);
        showToast('File JSON không hợp lệ.', 'danger', 4500);
      }
    };
    reader.onerror = () => showToast('Không đọc được file.', 'danger');
    reader.readAsText(file);
  }

  function setViewMode(mode) {
    filterState.view = mode;
    localStorage.setItem(STORAGE_KEY_VIEW, mode);

    const activeBtnClasses = ['bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-indigo-300', 'shadow-sm'];
    const inactiveBtnClasses = ['text-slate-600', 'dark:text-slate-400', 'hover:text-slate-900', 'dark:hover:text-white'];

    if (mode === 'list') {
      dom.viewListBtn.classList.add(...activeBtnClasses);
      dom.viewListBtn.classList.remove(...inactiveBtnClasses);
      dom.viewKanbanBtn.classList.remove(...activeBtnClasses);
      dom.viewKanbanBtn.classList.add(...inactiveBtnClasses);
    } else {
      dom.viewKanbanBtn.classList.add(...activeBtnClasses);
      dom.viewKanbanBtn.classList.remove(...inactiveBtnClasses);
      dom.viewListBtn.classList.remove(...activeBtnClasses);
      dom.viewListBtn.classList.add(...inactiveBtnClasses);
    }

    renderTasksSection();
    refreshIcons();
  }

  function handleResetDemoData() {
    tasks = createSampleTasks();
    saveTasks();
    renderApp();
    showToast('Đã khôi phục 8 tác vụ mẫu thông minh!', 'info');
  }

  // ==================== ĐĂNG KÝ SỰ KIỆN ====================
  function bindEvents() {
    // Điều hướng 4 phân hệ (Top nav, Bottom nav, nút chuyển nhanh)
    document.addEventListener('click', (e) => {
      const navTrigger = e.target.closest('[data-nav]');
      if (navTrigger) {
        switchTab(navTrigger.dataset.nav);
      }

      const jumpDateBtn = e.target.closest('[data-jump-date]');
      if (jumpDateBtn) {
        const targetIso = jumpDateBtn.dataset.jumpDate;
        const dObj = parseISOToLocalDate(targetIso);
        calendarState.year = dObj.getFullYear();
        calendarState.month = dObj.getMonth();
        calendarState.selectedDate = targetIso;
        switchTab('calendar');
      }
    });

    // Theme toggle
    dom.themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      applyTheme(!isCurrentlyDark);
    });

    // Mở modal thêm mới
    dom.openAddModalBtn.addEventListener('click', () => openTaskModal(null));
    if (dom.homeQuickAddBtn) dom.homeQuickAddBtn.addEventListener('click', () => openTaskModal(null));
    dom.addTaskForSelectedDateBtn.addEventListener('click', () => {
      openTaskModal(null, calendarState.selectedDate);
    });

    dom.closeTaskModalBtn.addEventListener('click', closeTaskModal);
    dom.cancelTaskModalBtn.addEventListener('click', closeTaskModal);
    dom.taskForm.addEventListener('submit', handleSaveTask);

    // Đóng modal khi click ra ngoài backdrop
    dom.taskModal.addEventListener('click', (e) => {
      if (e.target === dom.taskModal) closeTaskModal();
    });
    dom.deleteModal.addEventListener('click', (e) => {
      if (e.target === dom.deleteModal) closeDeleteModal();
    });

    // Phím Escape đóng modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const openModal = [dom.taskModal, dom.deleteModal].find((m) => !m.classList.contains('hidden'));
        if (openModal) {
          const focusables = openModal.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusables.length) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      }
      if (e.key === 'Escape') {
        if (!dom.taskModal.classList.contains('hidden')) closeTaskModal();
        if (!dom.deleteModal.classList.contains('hidden')) closeDeleteModal();
      }
    });

    // Modal xóa
    dom.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    dom.confirmDeleteBtn.addEventListener('click', confirmDeleteTask);

    // Mẹo năng suất
    dom.nextTipBtn.addEventListener('click', () => {
      currentTipIndex = (currentTipIndex + 1) % PRODUCTIVITY_TIPS.length;
      renderProductivityTip();
    });

    // Tìm kiếm & Bộ lọc
    dom.searchInput.addEventListener('input', (e) => {
      filterState.search = e.target.value;
      dom.clearSearchBtn.classList.toggle('hidden', !filterState.search);
      renderTasksSection();
      refreshIcons();
    });

    dom.clearSearchBtn.addEventListener('click', () => {
      filterState.search = '';
      dom.searchInput.value = '';
      dom.clearSearchBtn.classList.add('hidden');
      dom.searchInput.focus();
      renderTasksSection();
      refreshIcons();
    });

    dom.filterPriority.addEventListener('change', (e) => {
      filterState.priority = e.target.value;
      renderTasksSection();
      refreshIcons();
    });

    dom.filterCategory.addEventListener('change', (e) => {
      filterState.category = e.target.value;
      renderTasksSection();
      refreshIcons();
    });

    dom.filterStatus.addEventListener('change', (e) => {
      filterState.status = e.target.value;
      renderTasksSection();
      refreshIcons();
    });

    dom.sortSelect.addEventListener('change', (e) => {
      filterState.sort = e.target.value;
      renderTasksSection();
      refreshIcons();
    });

    // Chuyển đổi List / Kanban
    dom.viewListBtn.addEventListener('click', () => setViewMode('list'));
    dom.viewKanbanBtn.addEventListener('click', () => setViewMode('kanban'));

    // Điều khiển Lịch
    dom.calPrevMonthBtn.addEventListener('click', () => {
      calendarState.month -= 1;
      if (calendarState.month < 0) {
        calendarState.month = 11;
        calendarState.year -= 1;
      }
      renderCalendarSection();
      refreshIcons();
    });

    dom.calNextMonthBtn.addEventListener('click', () => {
      calendarState.month += 1;
      if (calendarState.month > 11) {
        calendarState.month = 0;
        calendarState.year += 1;
      }
      renderCalendarSection();
      refreshIcons();
    });

    dom.calTodayBtn.addEventListener('click', () => {
      const today = new Date();
      calendarState.year = today.getFullYear();
      calendarState.month = today.getMonth();
      calendarState.selectedDate = getTodayString();
      renderCalendarSection();
      refreshIcons();
    });

    dom.calendarGrid.addEventListener('click', (e) => {
      const cellBtn = e.target.closest('[data-cal-date]');
      if (!cellBtn) return;
      const clickedIso = cellBtn.dataset.calDate;
      const clickedDateObj = parseISOToLocalDate(clickedIso);
      calendarState.selectedDate = clickedIso;
      calendarState.year = clickedDateObj.getFullYear();
      calendarState.month = clickedDateObj.getMonth();
      renderCalendarSection();
      refreshIcons();
    });

    // Xuất CSV & Khôi phục dữ liệu mẫu
    dom.exportCsvBtn.addEventListener('click', exportStatsCSV);
    dom.exportJsonBtn.addEventListener('click', exportTasksJSON);
    dom.importJsonBtn.addEventListener('click', () => dom.importJsonInput.click());
    dom.importJsonInput.addEventListener('change', (e) => {
      importTasksJSON(e.target.files && e.target.files[0]);
      e.target.value = '';
    });
    dom.statsResetDemoBtn.addEventListener('click', handleResetDemoData);
    dom.resetDemoDataBtn.addEventListener('click', handleResetDemoData);

    // Ủy quyền sự kiện (Event Delegation) cho các hành động trên tác vụ
    document.querySelector('main').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'toggle-done') {
        toggleTaskDone(id);
      } else if (action === 'edit') {
        const task = tasks.find((t) => t.id === id);
        if (task) openTaskModal(task);
      } else if (action === 'delete') {
        openDeleteModal(id);
      } else if (action === 'quick-move') {
        updateTaskStatus(id, btn.dataset.target);
      }
    });

    document.querySelector('main').addEventListener('change', (e) => {
      const select = e.target.closest('[data-action="change-status"]');
      if (!select) return;
      updateTaskStatus(select.dataset.id, select.value);
    });
  }

  // ==================== KHỞI CHẠY ỨNG DỤNG ====================
  function init() {
    initTheme();
    loadTasks();
    setupKanbanColumnDropZones();
    bindEvents();

    const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
    if (savedView === 'kanban' || savedView === 'list') {
      filterState.view = savedView;
      setViewMode(savedView);
    }

    const savedTab = localStorage.getItem(STORAGE_KEY_TAB);
    switchTab(savedTab || 'home');
  }

  init();
})();
  