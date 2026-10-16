/**
 * FlowTask — Modern Productivity & Task Manager Engine
 * High-performance vanilla JavaScript application with state persistence,
 * accessible dialogs, Web Audio API synthesis, and canvas confetti.
 */

(() => {
  'use strict';

  // --- Constants & Defaults ---
  const STORAGE_KEYS = {
    TASKS: 'flowtask_tasks',
    THEME: 'flowtask_theme',
    SOUND: 'flowtask_sound',
  };

  const SAMPLE_TASKS = [
    {
      id: 'task-sample-1',
      title: 'Launch FlowTask 2.0 release announcement 🚀',
      description: 'Prepare blog post, publish release notes, and notify newsletter subscribers.',
      category: 'Work',
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0], // Due Today
      completed: false,
      starred: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      subtasks: [
        { id: 'sub-1', title: 'Write changelog document', completed: true },
        { id: 'sub-2', title: 'Verify screenshot assets', completed: true },
        { id: 'sub-3', title: 'Publish release post', completed: false }
      ]
    },
    {
      id: 'task-sample-2',
      title: 'Review user design mockups & prototype interactions',
      description: 'Check navigation drawer responsiveness and micro-interactions.',
      category: 'Projects',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      completed: false,
      starred: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      subtasks: [
        { id: 'sub-4', title: 'Inspect contrast ratios', completed: false },
        { id: 'sub-5', title: 'Test keyboard tab navigation', completed: false }
      ]
    },
    {
      id: 'task-sample-3',
      title: 'Grocery run: organic greens, almond milk, coffee beans',
      description: 'Farmer’s market opens at 9:00 AM on Saturday.',
      category: 'Personal',
      priority: 'low',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      completed: false,
      starred: false,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      subtasks: []
    },
    {
      id: 'task-sample-4',
      title: 'Complete 30-minute cardio & stretch routine 🏃‍♂️',
      description: 'Daily habit goal: 10,000 steps minimum.',
      category: 'Health',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      completed: true,
      starred: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      subtasks: [
        { id: 'sub-6', title: '5-minute warm up', completed: true },
        { id: 'sub-7', title: '25-minute brisk jog', completed: true }
      ]
    }
  ];

  // --- App State ---
  const state = {
    tasks: [],
    currentView: 'all',          // 'all' | 'today' | 'starred' | 'upcoming' | 'completed'
    selectedCategory: 'all',     // 'all' | 'Work' | 'Personal' | 'Projects' | 'Health'
    selectedPriority: 'all',     // 'all' | 'high' | 'medium' | 'low'
    searchQuery: '',
    sortBy: 'due-asc',           // 'due-asc' | 'priority-desc' | 'created-desc' | 'title-asc'
    theme: 'dark',
    soundEnabled: true,
    editingTaskId: null,
    tempSubtasks: [],
    lastDeletedTask: null,
    undoTimeoutId: null
  };

  // --- DOM Elements Cache ---
  const DOM = {
    html: document.documentElement,
    body: document.body,
    sidebar: document.getElementById('sidebar'),
    mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    soundToggle: document.getElementById('sound-toggle'),
    shortcutsBtn: document.getElementById('shortcuts-btn'),
    settingsMenuBtn: document.getElementById('settings-menu-btn'),

    // Task Creation
    openNewTaskBtn: document.getElementById('open-new-task-btn'),
    mobileAddBtn: document.getElementById('mobile-add-btn'),
    quickAddForm: document.getElementById('quick-add-form'),
    quickTaskTitle: document.getElementById('quick-task-title'),
    quickTaskCategory: document.getElementById('quick-task-category'),
    quickTaskPriority: document.getElementById('quick-task-priority'),
    quickTaskDate: document.getElementById('quick-task-date'),

    // Search & Sort
    taskSearchInput: document.getElementById('task-search-input'),
    searchKbd: document.getElementById('search-kbd'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    taskSortSelect: document.getElementById('task-sort-select'),

    // View & Metrics
    currentViewTitle: document.getElementById('current-view-title'),
    currentViewSubtitle: document.getElementById('current-view-subtitle'),
    metricTotal: document.getElementById('metric-total'),
    metricPending: document.getElementById('metric-pending'),
    metricCompleted: document.getElementById('metric-completed'),

    // Nav Lists
    viewFilters: document.getElementById('view-filters'),
    categoryFilters: document.getElementById('category-filters'),
    priorityPills: document.getElementById('priority-filter-pills'),
    clearCompletedBtn: document.getElementById('clear-completed-btn'),

    // Productivity mini widget
    statsPercent: document.getElementById('stats-percent'),
    statsProgressFill: document.getElementById('stats-progress-fill'),
    statsHint: document.getElementById('stats-hint'),

    // Task List & Empty State
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateText: document.getElementById('empty-state-text'),
    emptyStateActionBtn: document.getElementById('empty-state-action-btn'),

    // Task Modal
    taskModal: document.getElementById('task-modal'),
    modalHeading: document.getElementById('modal-heading'),
    taskModalForm: document.getElementById('task-modal-form'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalTaskId: document.getElementById('modal-task-id'),
    modalTaskTitle: document.getElementById('modal-task-title'),
    modalTaskDesc: document.getElementById('modal-task-desc'),
    modalTaskCategory: document.getElementById('modal-task-category'),
    modalTaskPriority: document.getElementById('modal-task-priority'),
    modalTaskDate: document.getElementById('modal-task-date'),
    newSubtaskInput: document.getElementById('new-subtask-input'),
    addSubtaskBtn: document.getElementById('add-subtask-btn'),
    modalSubtaskList: document.getElementById('modal-subtask-list'),

    // Shortcuts Modal
    shortcutsModal: document.getElementById('shortcuts-modal'),
    shortcutsCloseBtn: document.getElementById('shortcuts-close-btn'),

    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    settingsCloseBtn: document.getElementById('settings-close-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    importJsonInput: document.getElementById('import-json-input'),
    loadSampleBtn: document.getElementById('load-sample-btn'),
    resetAllBtn: document.getElementById('reset-all-btn'),

    // Toasts & Canvas
    toastContainer: document.getElementById('toast-container'),
    confettiCanvas: document.getElementById('confetti-canvas'),
  };

  // ==========================================================================
  // Web Audio API Synthesizer (Chimes & Micro-clicks)
  // ==========================================================================
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSuccessChime() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Melodic major third arpeggio (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.0001, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } catch {
      // Audio context policy fallback
    }
  }

  function playClickSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio context policy fallback
    }
  }

  // ==========================================================================
  // Celebration Confetti Engine
  // ==========================================================================
  const confetti = (() => {
    const canvas = DOM.confettiCanvas;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 4;
        this.gravity = 0.35;
        this.opacity = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.opacity -= this.decay;
        this.rotation += this.rotationSpeed;
      }

      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate((this.rotation * Math.PI) / 180);
        c.fillStyle = this.color;
        c.globalAlpha = Math.max(0, this.opacity);
        c.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        c.restore();
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.opacity > 0);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    return {
      burst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 50) {
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(x, y));
        }
        if (!animationFrameId) {
          loop();
        }
      }
    };
  })();

  // ==========================================================================
  // Storage & Persistence
  // ==========================================================================
  function loadInitialState() {
    // Theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    state.theme = savedTheme;
    DOM.html.setAttribute('data-theme', savedTheme);

    // Sound
    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    state.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
    updateSoundUI();

    // Tasks
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        state.tasks = JSON.parse(stored);
      } else {
        state.tasks = SAMPLE_TASKS;
        saveTasks();
      }
    } catch {
      state.tasks = SAMPLE_TASKS;
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Could not save data to local storage', 'error');
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    DOM.html.setAttribute('data-theme', state.theme);
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    showToast(`Switched to ${state.theme} mode`);
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, state.soundEnabled);
    updateSoundUI();
    showToast(state.soundEnabled ? 'Completion sounds enabled' : 'Completion sounds muted');
  }

  function updateSoundUI() {
    if (state.soundEnabled) {
      DOM.body.classList.remove('sound-muted');
    } else {
      DOM.body.classList.add('sound-muted');
    }
  }

  // ==========================================================================
  // Filtering, Searching & Sorting
  // ==========================================================================
  function isDueToday(dateStr) {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  }

  function isUpcoming(dateStr) {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr > today;
  }

  function getFilteredTasks() {
    return state.tasks.filter(task => {
      // 1. Search Query
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description && task.description.toLowerCase().includes(q);
        const matchCat = task.category && task.category.toLowerCase().includes(q);
        const matchSubtasks = task.subtasks && task.subtasks.some(s => s.title.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchSubtasks) return false;
      }

      // 2. Navigation View filter
      if (state.currentView === 'today') {
        if (!isDueToday(task.dueDate)) return false;
      } else if (state.currentView === 'starred') {
        if (!task.starred) return false;
      } else if (state.currentView === 'upcoming') {
        if (!isUpcoming(task.dueDate) || task.completed) return false;
      } else if (state.currentView === 'completed') {
        if (!task.completed) return false;
      }

      // 3. Category Filter
      if (state.selectedCategory !== 'all') {
        if (task.category !== state.selectedCategory) return false;
      }

      // 4. Priority Filter
      if (state.selectedPriority !== 'all') {
        if (task.priority !== state.selectedPriority) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      if (state.sortBy === 'due-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (state.sortBy === 'priority-desc') {
        const weights = { high: 3, medium: 2, low: 1 };
        return (weights[b.priority] || 0) - (weights[a.priority] || 0);
      }
      if (state.sortBy === 'created-desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (state.sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }

  // ==========================================================================
  // Render Engine
  // ==========================================================================
  function updateCountsAndBadges() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const todayCount = state.tasks.filter(t => isDueToday(t.dueDate) && !t.completed).length;
    const starredCount = state.tasks.filter(t => t.starred).length;
    const upcomingCount = state.tasks.filter(t => isUpcoming(t.dueDate) && !t.completed).length;

    // View badges
    document.getElementById('count-all').textContent = total;
    document.getElementById('count-today').textContent = todayCount;
    document.getElementById('count-starred').textContent = starredCount;
    document.getElementById('count-upcoming').textContent = upcomingCount;
    document.getElementById('count-completed').textContent = completed;

    // Category badges
    const categories = ['Work', 'Personal', 'Projects', 'Health'];
    categories.forEach(cat => {
      const el = document.getElementById(`count-cat-${cat.toLowerCase()}`);
      if (el) {
        el.textContent = state.tasks.filter(t => t.category === cat && !t.completed).length;
      }
    });

    // Metrics Bar
    DOM.metricTotal.textContent = total;
    DOM.metricPending.textContent = pending;
    DOM.metricCompleted.textContent = completed;

    // Daily Progress Bar & Hint
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    DOM.statsPercent.textContent = `${percent}%`;
    DOM.statsProgressFill.style.width = `${percent}%`;

    if (total === 0) {
      DOM.statsHint.textContent = 'Add your first task to start your day!';
    } else if (percent === 100) {
      DOM.statsHint.textContent = 'Incredible job! All tasks completed today 🏆';
    } else if (percent >= 50) {
      DOM.statsHint.textContent = `Over halfway there! ${pending} remaining.`;
    } else {
      DOM.statsHint.textContent = `${pending} tasks pending. Let’s make it happen!`;
    }
  }

  function renderTaskList() {
    updateCountsAndBadges();
    const filtered = getFilteredTasks();

    DOM.taskList.innerHTML = '';

    if (filtered.length === 0) {
      DOM.emptyState.hidden = false;
      if (state.searchQuery) {
        DOM.emptyStateTitle.textContent = 'No matching tasks';
        DOM.emptyStateText.textContent = `No tasks found matching "${state.searchQuery}". Try a different keyword or clear search.`;
      } else if (state.currentView === 'completed') {
        DOM.emptyStateTitle.textContent = 'No completed tasks yet';
        DOM.emptyStateText.textContent = 'Check off tasks as you finish them to see them here!';
      } else {
        DOM.emptyStateTitle.textContent = 'All caught up!';
        DOM.emptyStateText.textContent = 'Enjoy your free time or add a new task to stay ahead.';
      }
      return;
    }

    DOM.emptyState.hidden = true;

    filtered.forEach(task => {
      const card = createTaskCardElement(task);
      DOM.taskList.appendChild(card);
    });
  }

  function createTaskCardElement(task) {
    const li = document.createElement('li');
    li.className = `task-card ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    // Format Due Date Badge
    let dateBadgeHtml = '';
    if (task.dueDate) {
      let dateClass = '';
      let dateLabel = task.dueDate;
      if (isDueToday(task.dueDate)) {
        dateClass = 'today';
        dateLabel = 'Due Today';
      } else if (isOverdue(task.dueDate) && !task.completed) {
        dateClass = 'overdue';
        dateLabel = `Overdue (${task.dueDate})`;
      }
      dateBadgeHtml = `
        <span class="task-badge badge-date ${dateClass}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
          </svg>
          ${dateLabel}
        </span>
      `;
    }

    // Subtasks progress and checklist preview
    let subtasksHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const totalSub = task.subtasks.length;
      const completedSub = task.subtasks.filter(s => s.completed).length;
      const itemsHtml = task.subtasks.map(s => `
        <label class="subtask-mini-item ${s.completed ? 'done' : ''}">
          <input type="checkbox" class="subtask-checkbox" data-sub-id="${s.id}" ${s.completed ? 'checked' : ''}>
          <span>${escapeHtml(s.title)}</span>
        </label>
      `).join('');

      subtasksHtml = `
        <div class="task-subtasks-preview">
          <div class="subtasks-header">
            <span>Checklist</span>
            <span>${completedSub}/${totalSub} (${Math.round((completedSub / totalSub) * 100)}%)</span>
          </div>
          <div class="subtasks-items">
            ${itemsHtml}
          </div>
        </div>
      `;
    }

    li.innerHTML = `
      <div class="task-main-row">
        <button 
          class="task-checkbox-btn" 
          aria-label="${task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}"
          title="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>

        <div class="task-details">
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-notes">${escapeHtml(task.description)}</p>` : ''}
          
          <div class="task-meta-row">
            <span class="task-badge badge-priority-${task.priority}">
              <span class="priority-indicator ${task.priority}"></span>
              ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            ${task.category ? `<span class="task-badge badge-category">${escapeHtml(task.category)}</span>` : ''}
            ${dateBadgeHtml}
          </div>

          ${subtasksHtml}
        </div>

        <div class="task-actions">
          <button class="icon-btn star-btn ${task.starred ? 'starred' : ''}" title="${task.starred ? 'Unstar task' : 'Star task'}" aria-label="Toggle star">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <button class="icon-btn edit-task-btn" title="Edit task" aria-label="Edit task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-btn duplicate-task-btn" title="Duplicate task" aria-label="Duplicate task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="icon-btn delete-task-btn" title="Delete task" aria-label="Delete task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Bind event handlers
    const checkboxBtn = li.querySelector('.task-checkbox-btn');
    checkboxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskCompletion(task.id, checkboxBtn);
    });

    const starBtn = li.querySelector('.star-btn');
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStarTask(task.id);
    });

    const editBtn = li.querySelector('.edit-task-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTaskModal(task.id);
    });

    const duplicateBtn = li.querySelector('.duplicate-task-btn');
    duplicateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateTask(task.id);
    });

    const deleteBtn = li.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    // Subtask checkbox click listeners
    const subCheckboxes = li.querySelectorAll('.subtask-checkbox');
    subCheckboxes.forEach(subCb => {
      subCb.addEventListener('change', (e) => {
        e.stopPropagation();
        const subId = subCb.getAttribute('data-sub-id');
        toggleSubtaskCompletion(task.id, subId, subCb.checked);
      });
    });

    return li;
  }

  // ==========================================================================
  // Task Operations
  // ==========================================================================
  function toggleTaskCompletion(taskId, buttonEl) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();

    if (task.completed) {
      playSuccessChime();
      const rect = buttonEl.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
      showToast('Task marked as completed! 🎉');
    } else {
      playClickSound();
    }

    renderTaskList();
  }

  function toggleStarTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.starred = !task.starred;
    saveTasks();
    playClickSound();
    renderTaskList();
  }

  function toggleSubtaskCompletion(taskId, subId, isChecked) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const sub = task.subtasks.find(s => s.id === subId);
    if (sub) {
      sub.completed = isChecked;
      saveTasks();
      playClickSound();
      renderTaskList();
    }
  }

  function duplicateTask(taskId) {
    const original = state.tasks.find(t => t.id === taskId);
    if (!original) return;

    const clone = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'task-' + Date.now(),
      title: `${original.title} (Copy)`,
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks.unshift(clone);
    saveTasks();
    playClickSound();
    renderTaskList();
    showToast('Task duplicated successfully');
  }

  function deleteTask(taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const [deleted] = state.tasks.splice(index, 1);
    saveTasks();
    renderTaskList();

    // Prepare Undo
    state.lastDeletedTask = { task: deleted, index };
    showToast(`Task "${deleted.title.slice(0, 24)}..." deleted`, 'info', true);
  }

  function undoLastDelete() {
    if (!state.lastDeletedTask) return;
    const { task, index } = state.lastDeletedTask;
    state.tasks.splice(index, 0, task);
    state.lastDeletedTask = null;
    saveTasks();
    renderTaskList();
    showToast('Task restored');
  }

  function clearCompletedTasks() {
    const count = state.tasks.filter(t => t.completed).length;
    if (count === 0) {
      showToast('No completed tasks to clear');
      return;
    }

    if (confirm(`Clear all ${count} completed task(s)?`)) {
      state.tasks = state.tasks.filter(t => !t.completed);
      saveTasks();
      renderTaskList();
      showToast(`Cleared ${count} completed task(s)`);
    }
  }

  // Quick Add from Top Form
  DOM.quickAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = DOM.quickTaskTitle.value.trim();
    if (!title) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title,
      description: '',
      category: DOM.quickTaskCategory.value || 'Work',
      priority: DOM.quickTaskPriority.value || 'medium',
      dueDate: DOM.quickTaskDate.value || '',
      completed: false,
      starred: false,
      createdAt: new Date().toISOString(),
      subtasks: []
    };

    state.tasks.unshift(newTask);
    saveTasks();
    playClickSound();
    renderTaskList();

    DOM.quickTaskTitle.value = '';
    DOM.quickTaskDate.value = '';
    showToast('New task added!');
  });

  // ==========================================================================
  // Modal Task Dialog (Create & Edit)
  // ==========================================================================
  function openNewTaskModal() {
    state.editingTaskId = null;
    state.tempSubtasks = [];

    DOM.modalHeading.textContent = 'Create New Task';
    DOM.modalTaskId.value = '';
    DOM.modalTaskTitle.value = '';
    DOM.modalTaskDesc.value = '';
    DOM.modalTaskCategory.value = 'Work';
    DOM.modalTaskPriority.value = 'medium';
    DOM.modalTaskDate.value = '';
    DOM.newSubtaskInput.value = '';

    renderModalSubtasks();
    DOM.taskModal.showModal();
    DOM.modalTaskTitle.focus();
  }

  function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.editingTaskId = taskId;
    state.tempSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));

    DOM.modalHeading.textContent = 'Edit Task';
    DOM.modalTaskId.value = task.id;
    DOM.modalTaskTitle.value = task.title;
    DOM.modalTaskDesc.value = task.description || '';
    DOM.modalTaskCategory.value = task.category || 'Work';
    DOM.modalTaskPriority.value = task.priority || 'medium';
    DOM.modalTaskDate.value = task.dueDate || '';
    DOM.newSubtaskInput.value = '';

    renderModalSubtasks();
    DOM.taskModal.showModal();
    DOM.modalTaskTitle.focus();
  }

  function renderModalSubtasks() {
    DOM.modalSubtaskList.innerHTML = '';
    state.tempSubtasks.forEach((sub, idx) => {
      const li = document.createElement('li');
      li.className = 'modal-subtask-item';
      li.innerHTML = `
        <span>${escapeHtml(sub.title)}</span>
        <button type="button" data-index="${idx}" aria-label="Remove subtask">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      li.querySelector('button').addEventListener('click', () => {
        state.tempSubtasks.splice(idx, 1);
        renderModalSubtasks();
      });
      DOM.modalSubtaskList.appendChild(li);
    });
  }

  function addSubtaskToModal() {
    const text = DOM.newSubtaskInput.value.trim();
    if (!text) return;

    state.tempSubtasks.push({
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: text,
      completed: false
    });

    DOM.newSubtaskInput.value = '';
    renderModalSubtasks();
  }

  DOM.addSubtaskBtn.addEventListener('click', addSubtaskToModal);
  DOM.newSubtaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtaskToModal();
    }
  });

  DOM.taskModalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = DOM.modalTaskTitle.value.trim();
    if (!title) return;

    if (state.editingTaskId) {
      // Update existing
      const task = state.tasks.find(t => t.id === state.editingTaskId);
      if (task) {
        task.title = title;
        task.description = DOM.modalTaskDesc.value.trim();
        task.category = DOM.modalTaskCategory.value;
        task.priority = DOM.modalTaskPriority.value;
        task.dueDate = DOM.modalTaskDate.value;
        task.subtasks = state.tempSubtasks;
      }
      showToast('Task updated');
    } else {
      // Create new
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        description: DOM.modalTaskDesc.value.trim(),
        category: DOM.modalTaskCategory.value,
        priority: DOM.modalTaskPriority.value,
        dueDate: DOM.modalTaskDate.value,
        completed: false,
        starred: false,
        createdAt: new Date().toISOString(),
        subtasks: state.tempSubtasks
      };
      state.tasks.unshift(newTask);
      showToast('New task created!');
    }

    saveTasks();
    renderTaskList();
    DOM.taskModal.close();
  });

  // Light dismiss on backdrop click for native dialogs
  [DOM.taskModal, DOM.shortcutsModal, DOM.settingsModal].forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  });

  DOM.modalCloseBtn.addEventListener('click', () => DOM.taskModal.close());
  DOM.modalCancelBtn.addEventListener('click', () => DOM.taskModal.close());
  DOM.shortcutsCloseBtn.addEventListener('click', () => DOM.shortcutsModal.close());
  DOM.settingsCloseBtn.addEventListener('click', () => DOM.settingsModal.close());

  // ==========================================================================
  // Navigation & View Switching
  // ==========================================================================
  const viewTitles = {
    all: { title: 'All Tasks', sub: 'Manage all your active and upcoming tasks in one place.' },
    today: { title: 'Due Today', sub: 'High-focus tasks scheduled to be completed by today.' },
    starred: { title: 'Starred Tasks', sub: 'Important and prioritized highlights.' },
    upcoming: { title: 'Upcoming Tasks', sub: 'Future scheduled projects and deadlines.' },
    completed: { title: 'Completed Tasks', sub: 'Look back at everything you accomplished!' }
  };

  DOM.viewFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;

    const view = btn.getAttribute('data-view');
    if (!view) return;

    state.currentView = view;
    DOM.viewFilters.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    if (viewTitles[view]) {
      DOM.currentViewTitle.textContent = viewTitles[view].title;
      DOM.currentViewSubtitle.textContent = viewTitles[view].sub;
    }

    // Close mobile drawer if open
    DOM.sidebar.classList.remove('open');
    renderTaskList();
  });

  DOM.categoryFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-item');
    if (!btn) return;

    const cat = btn.getAttribute('data-category');
    if (!cat) return;

    state.selectedCategory = cat;
    DOM.categoryFilters.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    DOM.sidebar.classList.remove('open');
    renderTaskList();
  });

  DOM.priorityPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    const priority = pill.getAttribute('data-priority');
    if (!priority) return;

    state.selectedPriority = priority;
    DOM.priorityPills.querySelectorAll('.filter-pill').forEach(el => el.classList.remove('active'));
    pill.classList.add('active');

    renderTaskList();
  });

  DOM.clearCompletedBtn.addEventListener('click', clearCompletedTasks);
  DOM.emptyStateActionBtn.addEventListener('click', openNewTaskModal);
  DOM.openNewTaskBtn.addEventListener('click', openNewTaskModal);
  DOM.mobileAddBtn.addEventListener('click', openNewTaskModal);

  // Search
  DOM.taskSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    if (state.searchQuery) {
      DOM.clearSearchBtn.hidden = false;
      DOM.searchKbd.hidden = true;
    } else {
      DOM.clearSearchBtn.hidden = true;
      DOM.searchKbd.hidden = false;
    }
    renderTaskList();
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.taskSearchInput.value = '';
    state.searchQuery = '';
    DOM.clearSearchBtn.hidden = true;
    DOM.searchKbd.hidden = false;
    renderTaskList();
    DOM.taskSearchInput.focus();
  });

  // Sort
  DOM.taskSortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderTaskList();
  });

  // Theme & Sound Toggle
  DOM.themeToggle.addEventListener('click', toggleTheme);
  DOM.soundToggle.addEventListener('click', toggleSound);

  // Mobile drawer
  DOM.mobileSidebarToggle.addEventListener('click', () => {
    DOM.sidebar.classList.toggle('open');
  });

  // Modals Triggers
  DOM.shortcutsBtn.addEventListener('click', () => {
    DOM.shortcutsModal.showModal();
  });

  DOM.settingsMenuBtn.addEventListener('click', () => {
    DOM.settingsModal.showModal();
  });

  // Export JSON
  DOM.exportJsonBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flowtask-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exported');
  });

  // Import JSON
  DOM.importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          state.tasks = imported;
          saveTasks();
          renderTaskList();
          DOM.settingsModal.close();
          showToast(`Successfully imported ${imported.length} tasks!`);
        } else {
          showToast('Invalid JSON task file', 'error');
        }
      } catch {
        showToast('Error parsing JSON backup', 'error');
      }
    };
    reader.readAsText(file);
  });

  // Load Starter Demo Tasks
  DOM.loadSampleBtn.addEventListener('click', () => {
    state.tasks = JSON.parse(JSON.stringify(SAMPLE_TASKS));
    saveTasks();
    renderTaskList();
    DOM.settingsModal.close();
    showToast('Starter demo tasks loaded!');
  });

  // Reset All
  DOM.resetAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to permanently delete ALL tasks?')) {
      state.tasks = [];
      saveTasks();
      renderTaskList();
      DOM.settingsModal.close();
      showToast('All tasks cleared', 'warning');
    }
  });

  // ==========================================================================
  // Keyboard Shortcuts
  // ==========================================================================
  window.addEventListener('keydown', (e) => {
    // If typing in input or textarea, ignore single-key shortcuts unless Esc
    const activeEl = document.activeElement;
    const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

    if (e.key === 'Escape') {
      if (DOM.taskModal.open) DOM.taskModal.close();
      if (DOM.shortcutsModal.open) DOM.shortcutsModal.close();
      if (DOM.settingsModal.open) DOM.settingsModal.close();
      if (DOM.sidebar.classList.contains('open')) DOM.sidebar.classList.remove('open');
      if (state.searchQuery && isInputActive) {
        DOM.taskSearchInput.value = '';
        state.searchQuery = '';
        DOM.clearSearchBtn.hidden = true;
        DOM.searchKbd.hidden = false;
        renderTaskList();
      }
      return;
    }

    if (isInputActive) return;

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openNewTaskModal();
    } else if (e.key === '/') {
      e.preventDefault();
      DOM.taskSearchInput.focus();
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      toggleTheme();
    } else if (e.key === '?') {
      e.preventDefault();
      DOM.shortcutsModal.showModal();
    }
  });

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  function showToast(message, type = 'info', allowUndo = false) {
    // Clear previous undo timeout if any
    if (state.undoTimeoutId) {
      clearTimeout(state.undoTimeoutId);
      state.undoTimeoutId = null;
    }

    DOM.toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    let undoBtnHtml = '';
    if (allowUndo) {
      undoBtnHtml = `<button class="toast-action-btn" id="toast-undo-btn">Undo</button>`;
    }

    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      ${undoBtnHtml}
    `;

    DOM.toastContainer.appendChild(toast);

    if (allowUndo) {
      const undoBtn = toast.querySelector('#toast-undo-btn');
      if (undoBtn) {
        undoBtn.addEventListener('click', () => {
          undoLastDelete();
          toast.remove();
        });
      }
    }

    state.undoTimeoutId = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
      state.lastDeletedTask = null;
    }, allowUndo ? 5000 : 3200);
  }

  // Helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  loadInitialState();
  renderTaskList();

  console.log('FlowTask initialized successfully.');
})();
