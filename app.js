/**
 * AetherBoard - Premium Kanban Workspace
 * Core Application Logic, Drag & Drop, Synthesized SFX, and Analytics
 */

// ==========================================================================
// Web Audio API Synthesized SFX Module
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft sci-fi whoosh / sweep when dragging starts
  playDragStart() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      // Sweep frequency down
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  }

  // Clean soft thud / click when card drops
  playDrop() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.setValueAtTime(70, this.ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Sparkling retro chime for task completion
  playCompletion() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      
      // Chime note 1
      this.playTone(523.25, 0.12, now); // C5
      // Chime note 2
      this.playTone(659.25, 0.12, now + 0.08); // E5
      // Chime note 3
      this.playTone(783.99, 0.15, now + 0.16); // G5
      // Chime note 4 (highest)
      this.playTone(1046.50, 0.3, now + 0.24); // C6
    } catch (e) {}
  }

  playTone(freq, duration, startTime) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

const sfx = new SoundFX();

// ==========================================================================
// Application State Management
// ==========================================================================
let state = {
  columns: [],
  tasks: [],
  activityLog: [],
  theme: 'dark'
};

// Default setup if no localStorage exists
const DEFAULT_STATE = {
  columns: [
    { id: 'col-backlog', title: 'Backlog', color: 'var(--accent-purple)' },
    { id: 'col-todo', title: 'To Do', color: 'var(--accent-blue)' },
    { id: 'col-inprogress', title: 'In Progress', color: 'var(--accent-yellow)' },
    { id: 'col-done', title: 'Done', color: 'var(--accent-green)' }
  ],
  tasks: [
    {
      id: 'task-1',
      columnId: 'col-backlog',
      title: 'Design Logo & Branding Assets',
      desc: 'Create scalable visual identity elements (SVG icon sets, color palette, dark-mode variations) for the Aether project.',
      priority: 'low',
      date: '2026-06-25',
      tags: ['Design', 'Assets'],
      subtasks: [
        { id: 'sub-1-1', title: 'Draft concepts in vector editor', completed: true },
        { id: 'sub-1-2', title: 'Select premium color palette variables', completed: false },
        { id: 'sub-1-3', title: 'Export SVG sets for app wrapper', completed: false }
      ]
    },
    {
      id: 'task-2',
      columnId: 'col-todo',
      title: 'Build Glassmorphic CSS Theme',
      desc: 'Configure backdrop-filter blurs, radial glowing backgrounds, and dark/light variables in index.css.',
      priority: 'high',
      date: '2026-06-18',
      tags: ['Frontend', 'CSS'],
      subtasks: [
        { id: 'sub-2-1', title: 'Define premium theme variable sets', completed: true },
        { id: 'sub-2-2', title: 'Write layout grids for boards & scrollers', completed: true },
        { id: 'sub-2-3', title: 'Implement glow blur keyframes', completed: false }
      ]
    },
    {
      id: 'task-3',
      columnId: 'col-inprogress',
      title: 'Integrate Web Audio Synthesizer',
      desc: 'Code custom sound effects triggers using Web Audio API to create retro feedback sounds for card dragging.',
      priority: 'medium',
      date: '2026-06-17',
      tags: ['Logic', 'Audio'],
      subtasks: [
        { id: 'sub-3-1', title: 'Write Oscillator controller wrapper', completed: true },
        { id: 'sub-3-2', title: 'Trigger whoosh sounds on drag start', completed: true },
        { id: 'sub-3-3', title: 'Synthesize chime on task completion', completed: false }
      ]
    },
    {
      id: 'task-4',
      columnId: 'col-done',
      title: 'Configure Base Project Layout',
      desc: 'Write structural index.html scaffolding including head configurations, drawers, and modal containers.',
      priority: 'high',
      date: '2026-06-15',
      tags: ['HTML', 'Structure'],
      subtasks: [
        { id: 'sub-4-1', title: 'Research Outfit & Inter fonts', completed: true },
        { id: 'sub-4-2', title: 'Build clean side drawers overlay layout', completed: true }
      ]
    }
  ],
  activityLog: [
    { id: 'act-1', text: 'Project workspace initialized', time: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: 'act-2', text: 'Created task "Configure Base Project Layout"', time: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'act-3', text: 'Moved "Configure Base Project Layout" to Done', time: new Date(Date.now() - 3600000).toISOString() }
  ],
  theme: 'dark'
};

function showLoginOverlay() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) {
    overlay.classList.add('open');
  }
  const container = document.querySelector('.app-container');
  if (container) {
    container.style.filter = 'blur(10px) saturate(50%)';
    container.style.pointerEvents = 'none';
  }
}

function hideLoginOverlay() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
  const container = document.querySelector('.app-container');
  if (container) {
    container.style.filter = '';
    container.style.pointerEvents = 'auto';
  }
}

function handleUnauthorized() {
  localStorage.removeItem('aetherboard_token');
  showLoginOverlay();
  showToast('Authentication session expired or invalid', 'danger');
}

async function saveState() {
  const token = localStorage.getItem('aetherboard_token');
  if (!token) return;
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(state)
    });
    if (res.status === 401) {
      handleUnauthorized();
    }
  } catch (e) {
    console.error('Failed to save state to server:', e);
  }
}

async function loadState() {
  const token = localStorage.getItem('aetherboard_token');
  if (!token) {
    showLoginOverlay();
    return;
  }
  try {
    const res = await fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    const data = await res.json();
    if (data && data.columns) {
      state = data;
    } else {
      state = { ...DEFAULT_STATE };
      await saveState(); // Save initial defaults to disk
    }
  } catch (e) {
    console.warn('Failed to load state from server, using local defaults:', e);
    state = { ...DEFAULT_STATE };
  }
}

function logActivity(text) {
  const newActivity = {
    id: 'act-' + Date.now(),
    text,
    time: new Date().toISOString()
  };
  state.activityLog.unshift(newActivity);
  // Cap history at 50 logs
  if (state.activityLog.length > 50) {
    state.activityLog.pop();
  }
  saveState();
  renderActivityTimeline();
}

// ==========================================================================
// Toast Alerts Module
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon picker based on alert type
  let iconSVG = '';
  if (type === 'success') {
    iconSVG = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'danger') {
    iconSVG = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSVG = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSVG}<span>${message}</span>`;
  container.appendChild(toast);

  // Self destruct
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==========================================================================
// Board Rendering Module
// ==========================================================================
let activeFilters = {
  search: '',
  priority: 'all'
};

function renderBoard() {
  const canvas = document.getElementById('board-canvas');
  if (!canvas) return;

  canvas.innerHTML = '';

  state.columns.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'board-column';
    colEl.id = col.id;
    colEl.style.setProperty('--column-accent', col.color);

    // Filter tasks belonging to this column
    const colTasks = state.tasks.filter(task => {
      if (task.columnId !== col.id) return false;
      
      // Filter search
      const matchesSearch = task.title.toLowerCase().includes(activeFilters.search.toLowerCase()) || 
                            task.desc.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
                            task.tags.some(tag => tag.toLowerCase().includes(activeFilters.search.toLowerCase()));
      
      // Filter priority
      const matchesPriority = activeFilters.priority === 'all' || task.priority === activeFilters.priority;

      return matchesSearch && matchesPriority;
    });

    // Generate HTML for column structure
    colEl.innerHTML = `
      <div class="column-header">
        <div class="column-title-container">
          <span class="column-indicator" style="color: ${col.color}"></span>
          <h3 class="column-title" title="${col.title}">${col.title}</h3>
          <span class="column-badge">${colTasks.length}</span>
        </div>
        <div class="column-actions">
          <button class="column-action-btn btn-col-edit" data-id="${col.id}" title="Edit Column">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="column-action-btn btn-col-delete" data-id="${col.id}" title="Delete Column">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="cards-container" data-col-id="${col.id}">
        <!-- Tasks will go here -->
      </div>
    `;

    const cardsContainer = colEl.querySelector('.cards-container');

    if (colTasks.length === 0) {
      cardsContainer.innerHTML = `
        <div class="column-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <span>No matching tasks</span>
        </div>
      `;
    } else {
      colTasks.forEach(task => {
        const cardEl = createTaskCard(task);
        cardsContainer.appendChild(cardEl);
      });
    }

    canvas.appendChild(colEl);
  });

  setupDragAndDrop();
  updateAnalytics();
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.id = task.id;
  card.setAttribute('draggable', 'true');

  // Subtask calculation
  const totalSub = task.subtasks ? task.subtasks.length : 0;
  const completedSub = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const subPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

  // Due Date checks
  let dateClass = '';
  let dateText = task.date || '';
  if (task.date) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0,0,0,0);
    
    if (taskDate < today && task.columnId !== 'col-done') {
      dateClass = 'overdue';
      dateText = `Overdue: ${task.date}`;
    } else {
      dateText = task.date;
    }
  }

  // Build Tags layout
  let tagsHTML = '';
  if (task.tags && task.tags.length > 0) {
    tagsHTML = `<div class="card-tags">` + 
      task.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('') + 
      `</div>`;
  }

  // Render Subtask Progress section
  let subtaskHTML = '';
  if (totalSub > 0) {
    subtaskHTML = `
      <div class="card-checklist-progress">
        <div class="checklist-text">
          <span>Subtasks</span>
          <span>${completedSub}/${totalSub} (${subPercent}%)</span>
        </div>
        <div class="checklist-progress-track">
          <div class="checklist-progress-bar" style="width: ${subPercent}%"></div>
        </div>
      </div>
    `;
  }

  // Generate unique visual avatar initials from title
  const initials = task.title.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  card.innerHTML = `
    <div class="card-header-tags">
      <span class="priority-pill ${task.priority}">${task.priority}</span>
      ${task.date ? `
        <span class="date-pill ${dateClass}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${dateText}</span>
        </span>
      ` : ''}
    </div>
    <h4 class="card-title">${escapeHTML(task.title)}</h4>
    ${task.desc ? `<p class="card-desc">${escapeHTML(task.desc)}</p>` : ''}
    
    ${subtaskHTML}
    ${tagsHTML}

    <div class="card-footer">
      <div class="card-assignee">
        <div class="avatar-circle" title="Task Owner">${initials}</div>
      </div>
      <div class="card-actions">
        <button class="column-action-btn btn-card-edit" data-id="${task.id}" title="Edit Task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px; height:13px;">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="column-action-btn btn-card-delete" data-id="${task.id}" title="Delete Task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px; height:13px;">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Attach Details Viewer click listener
  card.addEventListener('click', (e) => {
    // Avoid triggering details screen when action buttons are clicked
    if (e.target.closest('.card-actions') || e.target.closest('.column-action-btn')) {
      return;
    }
    openDetailsModal(task.id);
  });

  return card;
}

// Helper to escape HTML tags
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// ==========================================================================
// Drag & Drop Mechanics
// ==========================================================================
let draggedCardId = null;

function setupDragAndDrop() {
  const cards = document.querySelectorAll('.task-card');
  const containers = document.querySelectorAll('.cards-container');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCardId = card.id;
      card.classList.add('dragging');
      sfx.playDragStart();
      e.dataTransfer.setData('text/plain', card.id);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      // Clear indicators
      removeDragIndicators();
      draggedCardId = null;
    });
  });

  containers.forEach(container => {
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      
      const afterElement = getDragAfterElement(container, e.clientY);
      
      // Clear old indicators in this container
      removeDragIndicators();

      if (afterElement == null) {
        // Drop indicator at bottom
        const indicator = createDropIndicator();
        container.appendChild(indicator);
      } else {
        // Drop indicator before target card
        const indicator = createDropIndicator();
        container.insertBefore(indicator, afterElement);
      }
    });

    container.addEventListener('dragleave', (e) => {
      const rect = container.getBoundingClientRect();
      // Ensure we actually left the container boundary, not just crossed into a card
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        removeDragIndicators();
      }
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      removeDragIndicators();

      const task = state.tasks.find(t => t.id === draggedCardId);
      if (!task) return;

      const oldColId = task.columnId;
      const newColId = container.getAttribute('data-col-id');
      
      const afterElement = getDragAfterElement(container, e.clientY);

      // Extract new index of task
      let newTasks = state.tasks.filter(t => t.id !== draggedCardId);
      
      task.columnId = newColId;
      
      let insertIndex = newTasks.length; // Default to append
      if (afterElement) {
        // Find index of the card we are placing before in filtered array
        const targetId = afterElement.id;
        const mainIndex = newTasks.findIndex(t => t.id === targetId);
        if (mainIndex !== -1) {
          insertIndex = mainIndex;
        }
      }

      // Re-insert task
      newTasks.splice(insertIndex, 0, task);
      state.tasks = newTasks;

      // SFX feedback & activities
      sfx.playDrop();

      if (oldColId !== newColId) {
        const oldCol = state.columns.find(c => c.id === oldColId);
        const newCol = state.columns.find(c => c.id === newColId);
        
        logActivity(`Moved "${task.title}" from ${oldCol ? oldCol.title : 'Unknown'} to ${newCol ? newCol.title : 'Unknown'}`);
        showToast(`Task moved to ${newCol ? newCol.title : 'column'}`, 'info');

        // Did we finish a task?
        if (newColId === 'col-done' || newColId.toLowerCase().includes('done')) {
          sfx.playCompletion();
          showToast(`Task completed! 🎉`, 'success');
        }
      } else {
        saveState();
      }

      renderBoard();
    });
  });
}

function createDropIndicator() {
  const ind = document.createElement('div');
  ind.className = 'drop-indicator';
  return ind;
}

function removeDragIndicators() {
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
}

// Finds the element immediately below the cursor relative to y height
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ==========================================================================
// Analytics & Dashboards Module
// ==========================================================================
function updateAnalytics() {
  const totalCount = state.tasks.length;
  
  // Completed column (by default the last one, or id containing 'done')
  const doneCol = state.columns.find(c => c.id === 'col-done' || c.id.toLowerCase().includes('done')) || state.columns[state.columns.length - 1];
  const doneCount = doneCol ? state.tasks.filter(t => t.columnId === doneCol.id).length : 0;
  const compPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Overdue count
  const today = new Date();
  today.setHours(0,0,0,0);
  const overdueTasks = state.tasks.filter(t => {
    if (!t.date || t.columnId === (doneCol ? doneCol.id : '')) return false;
    return new Date(t.date) < today;
  });

  // 1. Update Header Counters
  const elTotalVal = document.querySelector('#quick-stat-total .stat-value');
  const elCompVal = document.querySelector('#quick-stat-completed .stat-value');
  const elOverdueVal = document.querySelector('#quick-stat-overdue .stat-value');

  if (elTotalVal) elTotalVal.innerText = totalCount;
  if (elCompVal) elCompVal.innerText = `${compPercent}%`;
  if (elOverdueVal) {
    elOverdueVal.innerText = overdueTasks.length;
    if (overdueTasks.length > 0) {
      elOverdueVal.classList.add('text-danger');
    } else {
      elOverdueVal.classList.remove('text-danger');
    }
  }

  // 2. Update Drawer Dashboard Widgets
  const dbCompPercent = document.getElementById('dashboard-completion-percent');
  if (dbCompPercent) dbCompPercent.innerText = `${compPercent}%`;

  // Radial Ring calculation
  const radialBar = document.getElementById('radial-bar-completed');
  if (radialBar) {
    // 251.2 is max stroke dash offset. Offset represents remaining value
    const offset = 251.2 - (compPercent / 100) * 251.2;
    radialBar.style.strokeDashoffset = offset;
  }

  // Priority Stats
  const highTasks = state.tasks.filter(t => t.priority === 'high');
  const medTasks = state.tasks.filter(t => t.priority === 'medium');
  const lowTasks = state.tasks.filter(t => t.priority === 'low');

  updateBarGauge('stat-high', highTasks.length, totalCount);
  updateBarGauge('stat-medium', medTasks.length, totalCount);
  updateBarGauge('stat-low', lowTasks.length, totalCount);

  // Columns breakdown distribution list
  const colStatsContainer = document.getElementById('column-stats-container');
  if (colStatsContainer) {
    colStatsContainer.innerHTML = '';
    state.columns.forEach(col => {
      const count = state.tasks.filter(t => t.columnId === col.id).length;
      const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      
      const statItem = document.createElement('div');
      statItem.className = 'bar-stat-item';
      statItem.innerHTML = `
        <div class="bar-header">
          <span class="dot" style="background-color: ${col.color}"></span>
          <span class="label">${escapeHTML(col.title)}</span>
          <span class="val">${count}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${percent}%; background: ${col.color}"></div>
        </div>
      `;
      colStatsContainer.appendChild(statItem);
    });
  }

  // Overdue Details Box
  const overdueBox = document.getElementById('overdue-tasks-list');
  if (overdueBox) {
    if (overdueTasks.length === 0) {
      overdueBox.innerHTML = `<div class="empty-state-sm">No tasks are overdue! Great job.</div>`;
    } else {
      overdueBox.innerHTML = overdueTasks.map(t => `
        <div class="overdue-item" onclick="openDetailsModal('${t.id}')" style="cursor: pointer;">
          <span class="overdue-item-title">${escapeHTML(t.title)}</span>
          <span class="overdue-item-date">${t.date}</span>
        </div>
      `).join('');
    }
  }
}

function updateBarGauge(prefix, count, total) {
  const txtVal = document.getElementById(`${prefix}-count`);
  const barFill = document.getElementById(`${prefix}-bar`);
  
  if (txtVal) txtVal.innerText = count;
  if (barFill) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    barFill.style.width = `${pct}%`;
  }
}

// ==========================================================================
// Drawers Toggling
// ==========================================================================
function toggleDrawer(drawerId, open = true) {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;

  if (open) {
    // Close other drawers first
    document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
    drawer.classList.add('open');
    sfx.init(); // Warm up audio context
  } else {
    drawer.classList.remove('open');
  }
}

function renderActivityTimeline() {
  const tl = document.getElementById('activity-timeline');
  if (!tl) return;

  if (state.activityLog.length === 0) {
    tl.innerHTML = `<div class="empty-state-sm">No activities recorded yet.</div>`;
    return;
  }

  tl.innerHTML = state.activityLog.map(act => {
    // Format timestamp nicely
    const date = new Date(act.time);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    return `
      <div class="timeline-item">
        <p class="timeline-text">${escapeHTML(act.text)}</p>
        <span class="timeline-time">${timeStr}</span>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// Modals Handlers & Subtask Checklist Builders
// ==========================================================================
let activeSubtasks = []; // Temporary holder for task creation modal

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
  }
}

// TASK FORM
function openTaskFormModal(taskId = null) {
  const titleHeader = document.getElementById('task-modal-title');
  const formId = document.getElementById('task-form-id');
  const inputTitle = document.getElementById('task-form-title');
  const inputDesc = document.getElementById('task-form-desc');
  const selectPriority = document.getElementById('task-form-priority');
  const selectColumn = document.getElementById('task-form-column');
  const inputDate = document.getElementById('task-form-date');
  const inputTags = document.getElementById('task-form-tags');
  
  // Populate column selectors dynamically
  selectColumn.innerHTML = state.columns.map(c => `<option value="${c.id}">${escapeHTML(c.title)}</option>`).join('');

  // Reset Subtasks builder
  activeSubtasks = [];
  renderSubtaskBuilderList();
  document.getElementById('subtask-builder-input').value = '';

  if (taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    titleHeader.innerText = 'Edit Task Details';
    formId.value = task.id;
    inputTitle.value = task.title;
    inputDesc.value = task.desc || '';
    selectPriority.value = task.priority;
    selectColumn.value = task.columnId;
    inputDate.value = task.date || '';
    inputTags.value = task.tags ? task.tags.join(', ') : '';
    
    activeSubtasks = task.subtasks ? [...task.subtasks] : [];
    renderSubtaskBuilderList();
  } else {
    titleHeader.innerText = 'Create New Task';
    document.getElementById('task-form').reset();
    formId.value = '';
    // Select default column if present
    if (state.columns.length > 0) {
      selectColumn.value = state.columns[0].id;
    }
  }

  openModal('modal-task-form');
}

function renderSubtaskBuilderList() {
  const list = document.getElementById('subtask-builder-list');
  if (!list) return;

  list.innerHTML = '';
  activeSubtasks.forEach((sub, index) => {
    const li = document.createElement('li');
    li.className = 'subtask-builder-item';
    li.innerHTML = `
      <span style="${sub.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${escapeHTML(sub.title)}</span>
      <button type="button" class="btn-remove-subtask" data-index="${index}" title="Remove Item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    li.querySelector('.btn-remove-subtask').addEventListener('click', () => {
      activeSubtasks.splice(index, 1);
      renderSubtaskBuilderList();
    });

    list.appendChild(li);
  });
}

// COLUMN FORM
function openColumnFormModal(colId = null) {
  const titleHeader = document.getElementById('column-modal-title');
  const formId = document.getElementById('column-form-id');
  const inputTitle = document.getElementById('column-form-title');
  const pickerRadios = document.querySelectorAll('input[name="col-color"]');

  if (colId) {
    const col = state.columns.find(c => c.id === colId);
    if (!col) return;

    titleHeader.innerText = 'Edit Column Theme';
    formId.value = col.id;
    inputTitle.value = col.title;

    // Check correct radio button matching the color
    pickerRadios.forEach(r => {
      if (r.value === col.color) {
        r.checked = true;
      }
    });
  } else {
    titleHeader.innerText = 'Add New Column';
    document.getElementById('column-form').reset();
    formId.value = '';
    if (pickerRadios.length > 0) pickerRadios[0].checked = true;
  }

  openModal('modal-column-form');
}

// DETAIL VIEWER MODAL
let activeDetailTaskId = null;

function openDetailsModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  activeDetailTaskId = taskId;

  // Title, Priority, Col
  document.getElementById('detail-title').innerText = task.title;
  
  const prioEl = document.getElementById('detail-priority');
  prioEl.innerText = task.priority;
  prioEl.className = `detail-priority-badge priority-pill ${task.priority}`;

  const col = state.columns.find(c => c.id === task.columnId);
  const colEl = document.getElementById('detail-column');
  colEl.innerText = col ? col.title : 'Task Board';
  if (col) {
    colEl.style.borderColor = col.color;
    colEl.style.color = col.color;
  }

  // Date
  const dateEl = document.getElementById('detail-date');
  if (task.date) {
    dateEl.innerText = task.date;
    // Check if overdue
    const today = new Date();
    today.setHours(0,0,0,0);
    const taskDate = new Date(task.date);
    if (taskDate < today && task.columnId !== 'col-done') {
      dateEl.innerHTML = `<span class="text-danger font-semibold">${task.date} (OVERDUE)</span>`;
    }
  } else {
    dateEl.innerText = 'No deadline';
  }

  // Tags
  const tagsContainer = document.getElementById('detail-tags');
  tagsContainer.innerHTML = '';
  if (task.tags && task.tags.length > 0) {
    task.tags.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerText = t;
      tagsContainer.appendChild(chip);
    });
  } else {
    tagsContainer.innerHTML = '<span class="text-muted text-xs">No labels</span>';
  }

  // Description
  const descEl = document.getElementById('detail-description');
  descEl.innerText = task.desc || 'No description provided for this task.';

  // Render subtasks checkboxes checklist
  renderDetailsSubtaskChecklist(task);

  openModal('modal-task-details');
}

function renderDetailsSubtaskChecklist(task) {
  const counter = document.getElementById('detail-subtask-counter');
  const progBar = document.getElementById('detail-subtask-progressbar');
  const list = document.getElementById('detail-subtask-list');

  const total = task.subtasks ? task.subtasks.length : 0;
  const completed = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  counter.innerText = `${completed}/${total} Completed (${percent}%)`;
  progBar.style.width = `${percent}%`;

  list.innerHTML = '';
  if (total === 0) {
    list.innerHTML = `<li class="empty-state-sm">No checklist subtasks. Add them in editing panel.</li>`;
    return;
  }

  task.subtasks.forEach((sub) => {
    const li = document.createElement('li');
    li.className = `subtask-checkbox-item ${sub.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <input type="checkbox" ${sub.completed ? 'checked' : ''}>
      <span>${escapeHTML(sub.title)}</span>
    `;

    // Toggle interactive checks direct from details overlay
    li.querySelector('input').addEventListener('change', (e) => {
      const checked = e.target.checked;
      sub.completed = checked;

      // Update styles
      if (checked) {
        li.classList.add('completed');
        sfx.playTone(660, 0.1, this.ctx ? this.ctx.currentTime : 0);
      } else {
        li.classList.remove('completed');
      }

      // Re-trigger checklist counters and save state
      const newCompleted = task.subtasks.filter(s => s.completed).length;
      const newPercent = Math.round((newCompleted / total) * 100);
      counter.innerText = `${newCompleted}/${total} Completed (${newPercent}%)`;
      progBar.style.width = `${newPercent}%`;

      // Did checklist just finish?
      if (newCompleted === total && total > 0) {
        sfx.playCompletion();
        showToast('All checklist items completed! 🎯', 'success');
      }

      saveState();
      renderBoard(); // Keep background board visually synced
    });

    list.appendChild(li);
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth status
  const token = localStorage.getItem('aetherboard_token');
  if (!token) {
    showLoginOverlay();
  } else {
    hideLoginOverlay();
    // Load state from local server
    await loadState();
  }

  // Apply Theme
  const savedTheme = state.theme || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Render initial panels
  renderBoard();
  renderActivityTimeline();

  // Handle Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const errorMsg = document.getElementById('login-error-msg');
      const submitBtn = loginForm.querySelector('.btn-login');
      
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      
      if (errorMsg) {
        errorMsg.innerText = '';
        errorMsg.classList.remove('shake');
      }
      
      try {
        if (submitBtn) submitBtn.disabled = true;
        
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          localStorage.setItem('aetherboard_token', data.token);
          
          // Clear form inputs
          usernameInput.value = '';
          passwordInput.value = '';
          
          // Success sequence
          hideLoginOverlay();
          showToast('Access Granted. Welcome to your Workspace! 🌟', 'success');
          sfx.playCompletion();
          
          // Load state and render board
          await loadState();
          renderBoard();
          renderActivityTimeline();
        } else {
          throw new Error(data.error || 'Authentication failed');
        }
      } catch (err) {
        sfx.playTone(150, 0.15, sfx.ctx ? sfx.ctx.currentTime : 0);
        if (errorMsg) {
          errorMsg.innerText = err.message || 'Invalid username or password';
          // Trigger shake animation
          errorMsg.classList.remove('shake');
          void errorMsg.offsetWidth; // Trigger reflow to restart animation
          errorMsg.classList.add('shake');
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Handle Logout Button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out of this workspace?')) {
        localStorage.removeItem('aetherboard_token');
        
        // Play click/thud SFX
        sfx.playDrop();
        
        // Reset state so data is not exposed in DOM after logout
        state = { columns: [], tasks: [], activityLog: [] };
        renderBoard();
        renderActivityTimeline();
        
        showLoginOverlay();
        showToast('Successfully logged out', 'info');
      }
    });
  }

  // Search filter
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeFilters.search = e.target.value;
      renderBoard();
    });
  }

  // Priority filter
  const priorityFilter = document.getElementById('priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      activeFilters.priority = e.target.value;
      renderBoard();
    });
  }

  // App Toggles (Theme, drawers, modals)
  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    saveState();
    
    showToast(`Switched to ${newTheme} mode`, 'info');
  });

  // Drawer buttons
  document.getElementById('btn-dashboard').addEventListener('click', () => toggleDrawer('drawer-dashboard', true));
  document.getElementById('btn-close-dashboard').addEventListener('click', () => toggleDrawer('drawer-dashboard', false));
  
  document.getElementById('btn-activity').addEventListener('click', () => toggleDrawer('drawer-activity', true));
  document.getElementById('btn-close-activity').addEventListener('click', () => toggleDrawer('drawer-activity', false));
  
  document.getElementById('btn-clear-activity').addEventListener('click', () => {
    state.activityLog = [];
    saveState();
    renderActivityTimeline();
    showToast('Activity history cleared', 'warning');
  });

  // Modals buttons
  document.getElementById('btn-add-task').addEventListener('click', () => openTaskFormModal());
  document.getElementById('btn-add-column').addEventListener('click', () => openColumnFormModal());

  // Universal close modal handles
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('modal-task-form');
      closeModal('modal-column-form');
      closeModal('modal-task-details');
    });
  });

  // Subtask Builder row handle
  document.getElementById('btn-add-subtask').addEventListener('click', () => {
    const input = document.getElementById('subtask-builder-input');
    const val = input.value.trim();
    if (!val) return;

    activeSubtasks.push({
      id: 'sub-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      title: val,
      completed: false
    });

    input.value = '';
    renderSubtaskBuilderList();
  });

  // Prevent submit/enter inside subtask builder from closing form
  document.getElementById('subtask-builder-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btn-add-subtask').click();
    }
  });

  // SUBMIT TASK FORM
  document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formId = document.getElementById('task-form-id').value;
    const inputTitle = document.getElementById('task-form-title').value.trim();
    const inputDesc = document.getElementById('task-form-desc').value.trim();
    const selectPriority = document.getElementById('task-form-priority').value;
    const selectColumn = document.getElementById('task-form-column').value;
    const inputDate = document.getElementById('task-form-date').value;
    const inputTags = document.getElementById('task-form-tags').value;

    // Process tag strings
    const tagsArr = inputTags.split(',')
                             .map(t => t.trim())
                             .filter(t => t.length > 0);

    if (formId) {
      // EDIT MODE
      const taskIndex = state.tasks.findIndex(t => t.id === formId);
      if (taskIndex !== -1) {
        const originalTask = state.tasks[taskIndex];
        const oldColId = originalTask.columnId;

        originalTask.title = inputTitle;
        originalTask.desc = inputDesc;
        originalTask.priority = selectPriority;
        originalTask.columnId = selectColumn;
        originalTask.date = inputDate;
        originalTask.tags = tagsArr;
        originalTask.subtasks = [...activeSubtasks];

        logActivity(`Updated task "${inputTitle}"`);
        showToast('Task details updated', 'success');

        // Check if moved to Done
        if (oldColId !== selectColumn && (selectColumn === 'col-done' || selectColumn.toLowerCase().includes('done'))) {
          sfx.playCompletion();
          showToast('Task completed! 🎉', 'success');
        }
      }
    } else {
      // CREATE MODE
      const newTask = {
        id: 'task-' + Date.now(),
        columnId: selectColumn,
        title: inputTitle,
        desc: inputDesc,
        priority: selectPriority,
        date: inputDate,
        tags: tagsArr,
        subtasks: [...activeSubtasks]
      };
      state.tasks.push(newTask);
      logActivity(`Created task "${inputTitle}"`);
      showToast('New task added successfully', 'success');
    }

    saveState();
    closeModal('modal-task-form');
    renderBoard();
  });

  // SUBMIT COLUMN FORM
  document.getElementById('column-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const formId = document.getElementById('column-form-id').value;
    const inputTitle = document.getElementById('column-form-title').value.trim();
    const selectedColor = document.querySelector('input[name="col-color"]:checked').value;

    if (formId) {
      // EDIT MODE
      const col = state.columns.find(c => c.id === formId);
      if (col) {
        col.title = inputTitle;
        col.color = selectedColor;
        logActivity(`Updated column theme for "${inputTitle}"`);
        showToast('Column settings saved', 'success');
      }
    } else {
      // CREATE MODE
      const newColId = 'col-' + Date.now();
      const newCol = {
        id: newColId,
        title: inputTitle,
        color: selectedColor
      };
      state.columns.push(newCol);
      logActivity(`Created column "${inputTitle}"`);
      showToast('New column created', 'success');
    }

    saveState();
    closeModal('modal-column-form');
    renderBoard();
  });

  // DETAILS MODAL BUTTON HANDLES (EDIT / DELETE)
  document.getElementById('btn-detail-edit').addEventListener('click', () => {
    if (!activeDetailTaskId) return;
    const targetId = activeDetailTaskId;
    closeModal('modal-task-details');
    // Open Form builder
    setTimeout(() => {
      openTaskFormModal(targetId);
    }, 150);
  });

  document.getElementById('btn-detail-delete').addEventListener('click', () => {
    if (!activeDetailTaskId) return;
    const targetId = activeDetailTaskId;
    
    const task = state.tasks.find(t => t.id === targetId);
    if (!task) return;

    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      state.tasks = state.tasks.filter(t => t.id !== targetId);
      logActivity(`Deleted task "${task.title}"`);
      saveState();
      
      closeModal('modal-task-details');
      renderBoard();
      showToast('Task deleted successfully', 'danger');
    }
  });

  // DYNAMIC BUTTON EVENT DELEGATIONS (COLUMN ACTIONS & CARD EDIT/DELETE)
  document.addEventListener('click', (e) => {
    // Delete column
    const deleteColBtn = e.target.closest('.btn-col-delete');
    if (deleteColBtn) {
      const colId = deleteColBtn.getAttribute('data-id');
      const col = state.columns.find(c => c.id === colId);
      if (!col) return;

      // Check tasks count in column
      const tasksInCol = state.tasks.filter(t => t.columnId === colId);
      if (tasksInCol.length > 0) {
        alert(`Cannot delete column "${col.title}" while it contains active tasks. Please relocate tasks first.`);
        return;
      }

      if (confirm(`Remove column "${col.title}"?`)) {
        state.columns = state.columns.filter(c => c.id !== colId);
        logActivity(`Deleted column "${col.title}"`);
        saveState();
        renderBoard();
        showToast('Column deleted', 'danger');
      }
      return;
    }

    // Edit column
    const editColBtn = e.target.closest('.btn-col-edit');
    if (editColBtn) {
      const colId = editColBtn.getAttribute('data-id');
      openColumnFormModal(colId);
      return;
    }

    // Edit task card
    const editCardBtn = e.target.closest('.btn-card-edit');
    if (editCardBtn) {
      const taskId = editCardBtn.getAttribute('data-id');
      openTaskFormModal(taskId);
      return;
    }

    // Delete task card
    const deleteCardBtn = e.target.closest('.btn-card-delete');
    if (deleteCardBtn) {
      const taskId = deleteCardBtn.getAttribute('data-id');
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        logActivity(`Deleted task "${task.title}"`);
        saveState();
        renderBoard();
        showToast('Task deleted', 'danger');
      }
      return;
    }
  });

  // Warm up audio context on first click or touch
  const handleAudioWarmup = () => {
    sfx.init();
    window.removeEventListener('click', handleAudioWarmup);
    window.removeEventListener('touchstart', handleAudioWarmup);
  };
  window.addEventListener('click', handleAudioWarmup);
  window.addEventListener('touchstart', handleAudioWarmup);
});
