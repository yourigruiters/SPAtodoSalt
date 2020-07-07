// HTML element selectors
const blockHeaders = document.querySelectorAll('.block__header');
const blockAmounts = document.querySelectorAll('.block__title--amount');
const blockBodies = document.querySelectorAll('.block__body');

const form = document.querySelector('#form');
const todoInput = document.querySelector('#todo');
const todoInputLength = document.querySelector('#todo__length');

// Custom renderEvent for activating re-rendering
const renderEvent = new Event('renderEvent', { bubbles: true });

// Get the date of today in dd-mm-yyyy
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;

  return `${day}-${month}-${year}`;
};

// Get state from localStorage if available - else empty array
let state = localStorage.getItem('state')
  ? JSON.parse(localStorage.getItem('state'))
  : [];

// Provide amount of characters left for input field
todoInput.addEventListener('input', (e) => {
  const maxInput = todoInput.maxLength;
  todoInputLength.innerHTML = maxInput - e.target.value.length;
});

// Opening and closing todo sections
blockHeaders.forEach((blockHeader) => {
  blockHeader.addEventListener('click', function toggleActive() {
    const nextSibling = this.nextElementSibling;
    if (this.classList.contains('block__header--active')) {
      this.classList.remove('block__header--active');
      nextSibling.classList.remove('block__body--active');
    } else {
      this.classList.add('block__header--active');
      nextSibling.classList.add('block__body--active');
    }
  });
});

// Add a new todo to state
const addTodo = (todo) => {
  const newTodo = {
    id: state.length + 1,
    todo,
    added: getToday(),
    state: 'active',
  };

  state = [...state, newTodo];

  // Update storage and rerender
  localStorage.setItem('state', JSON.stringify(state));
  document.dispatchEvent(renderEvent);
};

// Update selected todo in state
const updateTodo = (id, newState) => {
  const todoIndex = state.findIndex(
    (todo) => todo.id.toString() === id.toString(),
  );

  state[todoIndex].state = newState;

  if (newState === 'deleted') {
    state[todoIndex].removed = getToday();
  }
  // Update storage and rerender
  localStorage.setItem('state', JSON.stringify(state));
  document.dispatchEvent(renderEvent);
};

// Formvalidation
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const todoValue = todoInput.value;

  if (!todoValue || todoValue.match(/^ *$/)) {
    todoInput.style.borderWidth = '3px';
    todoInput.style.borderColor = '#c0392b';
    return;
  }

  todoInput.style.borderWidth = '1px';
  todoInput.style.borderColor = '#ced4da';
  todoInput.value = '';
  todoInputLength.innerHTML = 30;
  // Add to list
  addTodo(todoValue);
});

// Generate HTML code for todo sections depending on section
const generateHTML = (type, todos) => {
  switch (type) {
    case 'active':
      return todos
        .map(
          (todo) => `<article class="item item--active" data-id="${todo.id}"><section class="item__circle"></section><section class="item__content"><p class="item__title">${todo.todo}</p><p class="item__desc">Added on: <span>${todo.added}</span></p></section></article>`,
        )
        .join('');
    case 'finished':
      return todos
        .map(
          (todo) => `<article class="item item--finished" data-id="${todo.id}"><section class="item__circle"></section><section class="item__content"><p class="item__title">${todo.todo}</p><p class="item__desc">Added on: <span>${todo.added}</span></p></section><section class="item__button"><button class="delete--todo" data-id="${todo.id}">Remove</button></section></article>`,
        )
        .join('');
    case 'deleted':
      return todos
        .map(
          (todo) => `<article class="item item--deleted"><section class="item__content"><p class="item__title">${todo.todo}</p><p class="item__desc">Added on: <span>${todo.added}</span> | Removed on: <span>${todo.removed}</span></p></section></article>`,
        )
        .join('');
    default:
      return '<article class="item"><section class="item__content"><p class="item__desc item__desc--none">No tasks to display here..</p></section></article>';
  }
};

// Generate onclick functions for correct classes
const generateFunctions = () => {
  document.querySelectorAll('.item--active').forEach((todo) => {
    const { id } = todo.dataset;
    todo.addEventListener('click', () => updateTodo(id, 'finished'));
  });

  document.querySelectorAll('.item--finished').forEach((todo) => {
    const { id } = todo.dataset;
    todo.addEventListener('click', () => updateTodo(id, 'active'));
  });

  // Ensure that clicking the button doesn't also active clicking content
  document.querySelectorAll('.delete--todo').forEach((todo) => {
    const { id } = todo.dataset;
    todo.addEventListener('click', (e) => {
      e.stopPropagation();
      updateTodo(id, 'deleted');
    });
  });
};

// Main render function for HTML content and functions
const render = (useState) => {
  const todosInNames = ['active', 'finished', 'deleted'];

  for (let index = 0; index < blockAmounts.length; index += 1) {
    const todos = useState.filter((todo) => todo.state === todosInNames[index]);

    const currentLength = todos.length;
    blockAmounts[index].innerHTML = currentLength;

    // Check if specific array has more than 0 todos
    if (!currentLength) {
      blockBodies[index].innerHTML = generateHTML('none');
    } else {
      blockBodies[index].innerHTML = generateHTML(
        todosInNames[index],
        todos,
      );
    }
  }

  generateFunctions();
};

// Render on loading of DOM and when RenderEvent is dispatched
document.addEventListener('DOMContentLoaded', () => document.dispatchEvent(renderEvent));
document.addEventListener('renderEvent', () => render(state));
