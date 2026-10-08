// ==========================================================================
// State Management & Local Storage Initialization[cite: 2]
// ==========================================================================
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// DOM Element References
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

// Save State to window.localStorage[cite: 2]
function saveState() {
  localStorage.setItem('todos', JSON.stringify(todos));
  render();
}

// ==========================================================================
// CRUD Operations[cite: 2]
// ==========================================================================

// 1. CREATE: Add Task[cite: 2]
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    completed: false
  };

  todos.push(newTodo);
  todoInput.value = '';
  saveState();
});

// 2. READ & RENDER: Create Dynamic DOM Elements[cite: 2]
function render() {
  // Filter todos based on current active tab
  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // Clear list container
  todoList.innerHTML = '';

  // Render elements
  filteredTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="todo-left">
        <input 
          type="checkbox" 
          class="toggle-checkbox" 
          ${todo.completed ? 'checked' : ''} 
        />
        <span class="todo-text">${escapeHTML(todo.text)}</span>
      </div>
      <div class="todo-actions">
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete action-btn delete-btn">Delete</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  // Update Item Count Footer
  const activeCount = todos.filter((t) => !t.completed).length;
  taskCount.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
}

// Helper to prevent XSS in DOM Injection
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==========================================================================
// Delegated Event Listeners for Dynamic DOM Elements[cite: 2]
// ==========================================================================
todoList.addEventListener('click', (e) => {
  const target = e.target;
  const li = target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;

  // 3. UPDATE: Toggle Complete Status[cite: 2]
  if (target.classList.contains('toggle-checkbox')) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: target.checked } : todo
    );
    saveState();
  }

  // 4. DELETE: Remove Single Item[cite: 2]
  if (target.classList.contains('delete-btn')) {
    todos = todos.filter((todo) => todo.id !== id);
    saveState();
  }

  // 5. UPDATE: Inline Edit Task[cite: 2]
  if (target.classList.contains('edit-btn')) {
    startEdit(li, id);
  }
});

// Inline Editing Functionality
function startEdit(li, id) {
  const textSpan = li.querySelector('.todo-text');
  const currentText = textSpan.textContent;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = currentText;

  li.querySelector('.todo-left').replaceChild(input, textSpan);
  input.focus();

  const commitEdit = () => {
    const updatedText = input.value.trim();
    if (updatedText) {
      todos = todos.map((t) => (t.id === id ? { ...t, text: updatedText } : t));
    }
    saveState();
  };

  input.addEventListener('blur', commitEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commitEdit();
  });
}

// ==========================================================================
// Advanced Filtering & Batch Actions[cite: 2]
// ==========================================================================
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  saveState();
});

// Initial Render on Load
render();