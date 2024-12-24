const listContainer = document.getElementById("list-container");
const inputBox = document.getElementById("input-box");
const errorMessage = document.getElementById("error-message");

function addEntry() {
  const taskText = inputBox.value.trim();
  if (!taskText) {
    showError("Enter something to be accomplished!!");
  } else if (Array.from(listContainer.children).some((li) => li.textContent.replace("\u00d7", "").trim() === taskText)) {
    showError("Task already exists!! Is there anything else?");
  } else {
    errorMessage.style.display = "none";
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);

    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    saveTask();
  }

  inputBox.value = "";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  errorMessage.style.animation = "none";
  setTimeout(() => {
    errorMessage.style.animation = "vibrate 0.3s";
  }, 0);
}

listContainer.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveTask();
  } else if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveTask();
  }
});

// The following code saves the user's input into
function saveTask() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  listContainer.innerHTML = localStorage.getItem("data");
}

showTask();

// The following code allows users to add tasks using the enter key
inputBox.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addEntry();
  }
});

// The following code allows users to edit a task in-place
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
      saveTask();
    });

    input.focus();
  }
});
