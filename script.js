const STORAGE_KEY = 'todo-app-items';

/** @type {{id:number, text:string, completed:boolean}[]} */
let todos = [];

const inputEl = document.getElementById('todo-input');
const addButtonEl = document.getElementById('add-button');
const listEl = document.getElementById('todo-list');
const emptyStateEl = document.getElementById('empty-state');
const templateEl = document.getElementById('todo-item-template');

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    todos = [];
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    todos = Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            item && typeof item.id === 'number' && typeof item.text === 'string' && typeof item.completed === 'boolean'
        )
      : [];
  } catch {
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
  listEl.innerHTML = '';

  if (todos.length === 0) {
    emptyStateEl.hidden = false;
    return;
  }

  emptyStateEl.hidden = true;

  todos.forEach((todo) => {
    const fragment = templateEl.content.cloneNode(true);
    const itemEl = fragment.querySelector('.todo-item');
    const toggleEl = fragment.querySelector('.todo-item__toggle');
    const textEl = fragment.querySelector('.todo-item__text');
    const deleteEl = fragment.querySelector('.todo-item__delete');

    itemEl.dataset.id = String(todo.id);
    textEl.textContent = todo.text;
    toggleEl.checked = todo.completed;

    if (todo.completed) {
      itemEl.classList.add('completed');
    }

    toggleEl.setAttribute('aria-label', `${todo.completed ? '标记为未完成' : '标记为已完成'}：${todo.text}`);
    deleteEl.setAttribute('aria-label', `删除任务：${todo.text}`);

    listEl.appendChild(fragment);
  });
}

function addTodo(text) {
  const cleanedText = text.trim();

  if (!cleanedText) {
    return;
  }

  const todo = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    text: cleanedText,
    completed: false,
  };

  todos.unshift(todo);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function handleAdd() {
  addTodo(inputEl.value);
  inputEl.value = '';
  inputEl.focus();
}

addButtonEl.addEventListener('click', handleAdd);

inputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleAdd();
  }
});

listEl.addEventListener('click', (event) => {
  const target = event.target;
  const itemEl = target.closest('.todo-item');

  if (!itemEl) {
    return;
  }

  const id = Number(itemEl.dataset.id);

  if (target.classList.contains('todo-item__delete')) {
    deleteTodo(id);
  }
});

listEl.addEventListener('change', (event) => {
  const target = event.target;

  if (!target.classList.contains('todo-item__toggle')) {
    return;
  }

  const itemEl = target.closest('.todo-item');

  if (!itemEl) {
    return;
  }

  const id = Number(itemEl.dataset.id);
  toggleTodo(id);
});

loadTodos();
renderTodos();
