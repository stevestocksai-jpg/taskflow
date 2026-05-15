// ===========================
// ALL OUR TASKS ARE STORED HERE
// ===========================

let tasks = [];
let filter = 'all';

// ===========================
// SAVE & LOAD FROM BROWSER MEMORY
// ===========================

function save() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

function load() {
  try {
    const stored = localStorage.getItem('taskflow_tasks');
    if (stored) tasks = JSON.parse(stored);
  } catch(e) {
    tasks = [];
  }
}

// ===========================
// FORMAT THE DATE/TIME
// ===========================

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ===========================
// ADD A NEW TASK
// ===========================

function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }

  const priority = document.getElementById('sel-priority').value;
  const category = document.getElementById('sel-category').value;

  tasks.unshift({
    id: Date.now(),
    text,
    done: false,
    priority,
    category,
    created: Date.now()
  });

  input.value = '';
  input.focus();
  save();
  render();
}

// ===========================
// TICK A TASK AS DONE
// ===========================

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

// ===========================
// DELETE A TASK
// ===========================

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ===========================
// CLEAR ALL COMPLETED TASKS
// ===========================

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

// ===========================
// FILTER BUTTONS
// ===========================

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function getFiltered() {
  if (filter === 'all') return tasks;
  if (filter === 'active') return tasks.filter(t => !t.done);
  if (filter === 'done') return tasks.filter(t => t.done);
  return tasks.filter(t => t.priority === filter);
}

// ===========================
// BUILD EACH TASK CARD
// ===========================

function taskHTML(t) {
  const prioLabel = { high: 'High', medium: 'Medium', low: 'Low' };
  return `
    <div class="task-item ${t.done ? 'done' : ''}">
      <div class="task-check" onclick="toggleTask(${t.id})">
        ${t.done ? '✓' : ''}
      </div>
      <div class="task-body">
        <div class="task-text">${escHtml(t.text)}</div>
        <div class="task-meta">
          <span class="tag-priority ${t.priority}">${prioLabel[t.priority]}</span>
          ${t.category ? `<span class="tag-category">${escHtml(t.category)}</span>` : ''}
          <span class="task-date">${formatDate(t.created)}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn" onclick="deleteTask(${t.id})" title="Delete">🗑</button>
      </div>
    </div>
  `;
}

// ===========================
// SAFETY: CLEAN UP TEXT
// ===========================

function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===========================
// DRAW EVERYTHING ON SCREEN
// ===========================

function render() {
  const visible = getFiltered();
  const active = visible.filter(t => !t.done);
  const done = visible.filter(t => t.done);

  const allDone = tasks.filter(t => t.done);
  const allActive = tasks.filter(t => !t.done);
  const total = tasks.length;
  const pct = total ? Math.round((allDone.length / total) * 100) : 0;

  // Update top bar numbers
  document.getElementById('h-total').textContent = total;
  document.getElementById('h-done').textContent = allDone.length;
  document.getElementById('h-pending').textContent = allActive.length;

  // Update progress card
  document.getElementById('stat-done').textContent = allDone.length;
  document.getElementById('stat-pending').textContent = allActive.length;
  document.getElementById('stat-pct').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';

  // Draw active tasks
  const la = document.getElementById('list-active');
  if (active.length) {
    la.innerHTML = `
      <div class="list-group">
        <div class="list-group-header">
          <span class="list-group-title">To Do</span>
          <div class="list-group-line"></div>
          <span class="list-group-count">${active.length}</span>
        </div>
        ${active.map(taskHTML).join('')}
      </div>`;
  } else {
    la.innerHTML = '';
  }

  // Draw completed tasks
  const ld = document.getElementById('list-done');
  if (done.length) {
    ld.innerHTML = `
      <div class="list-group">
        <div class="list-group-header">
          <span class="list-group-title">Completed</span>
          <div class="list-group-line"></div>
          <span class="list-group-count">${done.length}</span>
          <button class="clear-done" onclick="clearDone()">Clear all</button>
        </div>
        ${done.map(taskHTML).join('')}
      </div>`;
  } else {
    ld.innerHTML = '';
  }

  // Show empty message if no tasks
  const empty = document.getElementById('empty-state');
  empty.style.display = visible.length === 0 ? 'block' : 'none';
}

// ===========================
// PRESS ENTER TO ADD TASK
// ===========================

document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ===========================
// START THE APP
// ===========================

load();
render();