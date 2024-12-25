const listContainer = document.getElementById("list-container");
const inputBox = document.getElementById("input-box");
const errorMessage = document.getElementById("error-message");
const sortOptions = document.getElementById("sort-options");

function addEntry() {
  const taskText = inputBox.value.trim();

  if (!taskText) {
    showError("Enter something to be accomplished!!");
    return;
  }

  const existingTasks = Array.from(listContainer.children).map((li) => li.firstChild.textContent.trim().toLowerCase());

  if (existingTasks.includes(taskText.toLowerCase())) {
    showError("Task already exists!! Is there anything else?");
    return;
  }

  errorMessage.style.display = "none";

  const li = document.createElement("li");
  li.draggable = true;
  li.textContent = taskText;

  li.dataset.dateAdded = new Date().toISOString();
  li.dataset.checked = "false";

  const span = document.createElement("span");
  span.innerHTML = "\u00d7";
  li.appendChild(span);

  listContainer.appendChild(li);
  inputBox.value = "";

  saveTask();
}

// The following code sorts the list using different criteria
function sortTasks(criteria) {
  const tasks = Array.from(listContainer.children);

  if (criteria === "alphabetical") {
    tasks.sort((a, b) => a.firstChild.textContent.localeCompare(b.firstChild.textContent));
  } else if (criteria === "checked") {
    tasks.sort((a, b) => a.dataset.checked.localeCompare(b.dataset.checked));
  } else if (criteria === "date") {
    tasks.sort((a, b) => new Date(a.dataset.dateAdded) - new Date(b.dataset.dateAdded));
  }

  listContainer.innerHTML = "";
  tasks.forEach((task) => listContainer.appendChild(task));
}

sortOptions.addEventListener("change", function () {
  sortTasks(sortOptions.value);
});

listContainer.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    e.target.dataset.checked = e.target.classList.contains("checked") ? "true" : "false";
    saveTask();
  } else if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveTask();
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  errorMessage.style.animation = "none";

  setTimeout(() => {
    errorMessage.style.animation = "vibrate 0.3s";
  }, 0);
}

function saveTask() {
  const tasks = Array.from(listContainer.children).map((li) => ({
    text: li.firstChild.textContent.trim(),
    checked: li.classList.contains("checked"),
    dateAdded: li.dataset.dateAdded,
  }));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showTask() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  listContainer.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.draggable = true;
    li.innerHTML = task.text;

    li.dataset.dateAdded = task.dateAdded || new Date().toISOString();
    li.dataset.checked = task.checked ? "true" : "false";

    if (task.checked) li.classList.add("checked");

    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    listContainer.appendChild(li);
  });
}

showTask();

inputBox.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addEntry();
  }
});

listContainer.addEventListener("dblclick", function (e) {
  if (e.target.tagName === "LI") {
    const originalText = e.target.firstChild.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = originalText.trim();
    e.target.firstChild.replaceWith(input);

    input.addEventListener("blur", function () {
      const updatedText = input.value.trim();
      e.target.innerHTML = updatedText || originalText;

      const span = document.createElement("span");
      span.innerHTML = "\u00d7";
      e.target.appendChild(span);

      saveTask();
    });

    input.addEventListener("keypress", function (eKey) {
      if (eKey.key === "Enter") {
        const updatedText = input.value.trim();
        e.target.innerHTML = updatedText || originalText;
        saveTask();
      }
    });

    input.focus();
  }
});

listContainer.addEventListener("dragstart", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.add("dragging");
  }
});

listContainer.addEventListener("dragover", function (e) {
  e.preventDefault();

  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(listContainer, e.clientY);

  if (!afterElement) {
    listContainer.appendChild(dragging);
  } else {
    listContainer.insertBefore(dragging, afterElement);
  }
});

listContainer.addEventListener("dragend", function (e) {
  e.target.classList.remove("dragging");
  saveTask();
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
