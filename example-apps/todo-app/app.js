(function () {
  'use strict';

  // ───── State ─────
  let todos = [];
  let filter = 'all';

  // ───── DOM refs ─────
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const itemCount = document.getElementById('item-count');
  const itemLabel = document.getElementById('item-label');
  const clearBtn = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ───── Helpers ─────
  function save() {
    localStorage.setItem('deputies-todos', JSON.stringify(todos));
  }

  function load() {
    try {
      const raw = localStorage.getItem('deputies-todos');
      if (raw) todos = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  function filtered() {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'completed') return todos.filter((t) => t.done);
    return todos;
  }

  function remaining() {
    return todos.filter((t) => !t.done).length;
  }

  // ───── Render ─────
  function render() {
    const items = filtered();

    if (items.length === 0) {
      list.innerHTML = `<li class="empty-state">
        ${filter === 'all' ? 'No todos yet. Add one above!' : filter === 'active' ? 'All done! 🎉' : 'No completed todos.'}
      </li>`;
    } else {
      list.innerHTML = items
        .map(
          (t) => `
          <li class="todo-item ${t.done ? 'completed' : ''}" data-id="${t.id}">
            <input type="checkbox" ${t.done ? 'checked' : ''} />
            <span class="todo-text">${escapeHtml(t.text)}</span>
            <button class="delete-btn" aria-label="Delete todo">✕</button>
          </li>
        `
        )
        .join('');
    }

    const left = remaining();
    itemCount.textContent = left;
    itemLabel.textContent = left === 1 ? 'item' : 'items';

    // Update filter button styles
    filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ───── Actions ─────
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: Date.now() + Math.random(), text: trimmed, done: false });
    save();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.done = !todo.done;
      save();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.done);
    save();
    render();
  }

  function setFilter(f) {
    filter = f;
    render();
  }

  // ───── Event listeners ─────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = Number(item.dataset.id);

    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
      deleteTodo(id);
      return;
    }

    if (e.target.type === 'checkbox') {
      toggleTodo(id);
      return;
    }

    // Clicking the text toggles too
    if (e.target.classList.contains('todo-text')) {
      toggleTodo(id);
    }
  });

  clearBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // ───── Init ─────
  load();
  render();
})();
