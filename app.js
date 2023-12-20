document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    setInterval(updateTimers, 1000); // Update timers every second
});

function loadTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        addTaskToDOM(task);
    });
}

function addTask() {
    const newTaskInput = document.getElementById("new-task-input");
    const dueDateInput = document.getElementById("due-date-input");
    const dueTimeInput = document.getElementById("due-time-input");
    const prioritizeCheckbox = document.getElementById("prioritize-checkbox");

    const taskText = newTaskInput.value.trim();
    const dueDate = dueDateInput.value;
    const dueTime = dueTimeInput.value;
    const prioritize = prioritizeCheckbox.checked;

    if (taskText !== "") {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            dueDate: dueDate || null,
            dueTime: dueTime || null,
            prioritize: prioritize
        };

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));

        addTaskToDOM(task);

        const addMore = window.confirm("Task added successfully!");
        
        if (!addMore) {
            newTaskInput.value = "";
            dueDateInput.value = "";
            dueTimeInput.value = "";
            prioritizeCheckbox.checked = false;
        }
    }
}

function addTaskToDOM(task) {
    const taskList = document.getElementById("task-list");

    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "completed" : ""} ${task.prioritize ? "prioritize" : ""}`;
    taskItem.setAttribute("data-id", task.id);

    const taskText = document.createElement("span");
    taskText.textContent = task.text;

    const dueDateTimeSpan = document.createElement("span");
    dueDateTimeSpan.textContent = getFormattedDateTime(task.dueDate, task.dueTime);

    const timerSpan = document.createElement("span");
    timerSpan.textContent = task.dueDate ? `Time left: ${getRemainingTime(task.dueDate)}` : "";

    const prioritizeSpan = document.createElement("span");
    prioritizeSpan.textContent = task.prioritize ? " (Priority)" : "";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });

    const completeButton = document.createElement("button");
    completeButton.textContent = task.completed ? "Undo" : "Complete";
    completeButton.addEventListener("click", function () {
        toggleTaskCompletion(task.id);
    });

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
        editTask(task.id);
    });

    taskItem.appendChild(taskText);
    taskItem.appendChild(dueDateTimeSpan);
    taskItem.appendChild(timerSpan);
    taskItem.appendChild(prioritizeSpan);
    taskItem.appendChild(completeButton);
    taskItem.appendChild(editButton);
    taskItem.appendChild(deleteButton);

    taskList.appendChild(taskItem);
}

function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            const newTaskName = prompt("Edit task:", task.text);
            if (newTaskName !== null) {
                task.text = newTaskName;
                task.completed = false; // Reset completion status when editing
            }
        }
        return task;
    });

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    loadTasks();
}

function deleteTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const updatedTasks = tasks.filter(task => task.id !== taskId);

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    loadTasks();
}

function toggleTaskCompletion(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            task.completed = !task.completed;
        }
        return task;
    });

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    loadTasks();
}

function clearTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const updatedTasks = tasks.filter(task => !task.completed);

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    loadTasks();
}

function toggleDarkMode() {
    const appContainer = document.getElementById("app-container");
    const modeToggle = document.getElementById("mode-toggle");

    appContainer.classList.toggle("dark-mode");
    modeToggle.checked = appContainer.classList.contains("dark-mode");
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatDateTime(dateTimeString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
}

function getFormattedDateTime(date, time) {
    if (date && time) {
        const dateTime = new Date(`${date} ${time}`);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return dateTime.toLocaleDateString('en-US', options);
    } else if (date) {
        return `Due: ${formatDate(date)}`;
    } else {
        return "No due date";
    }
}

function getRemainingTime(dueDate) {
    const now = new Date();
    const dueDateTime = new Date(dueDate);
    const timeDifference = dueDateTime - now;

    if (timeDifference > 0) {
        const seconds = Math.floor((timeDifference / 1000) % 60);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
        return "Time expired";
    }
}

function updateTimers() {
    const taskItems = document.querySelectorAll(".task-item");

    taskItems.forEach(taskItem => {
        const taskId = taskItem.getAttribute("data-id");
        const dueDate = taskItem.querySelector("span[data-type='due-date']").textContent.split(": ")[1];
        const timerSpan = taskItem.querySelector("span[data-type='timer']");

        if (dueDate && timerSpan) {
            const remainingTime = getRemainingTime(dueDate);
            
            if (remainingTime !== "Time expired") {
                timerSpan.textContent = `Time left: ${remainingTime}`;
            } else {
                timerSpan.textContent = remainingTime;
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    loadHistory();
    setInterval(updateTimers, 1000); // Update timers every second
    setInterval(updateContent, 10000); // Update content every 10 seconds
});

function updateContent() {
    // Simulate fetching data from a server
    const newData = getUpdatedData(); // You should replace this with actual data fetching logic

    // Check if the data has changed
    if (dataHasChanged(newData)) {
        localStorage.setItem("tasks", JSON.stringify(newData.tasks));
        localStorage.setItem("completedTasks", JSON.stringify(newData.completedTasks));
        loadTasks();
        loadHistory();
    }
}

function toggleTaskCompletion(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];

    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            task.completed = !task.completed;
            if (task.completed) {
                completedTasks.push(task);
            } else {
                // Remove from completedTasks if uncompleted
                const index = completedTasks.findIndex(completedTask => completedTask.id === taskId);
                if (index !== -1) {
                    completedTasks.splice(index, 1);
                }
            }
        }
        return task;
    });

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    loadTasks();
    loadHistory();
}

function loadHistory() {
    const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
    const completedList = document.getElementById("completed-list");

    // Clear existing content
    completedList.innerHTML = "";

    completedTasks.forEach(task => {
        const historyItem = document.createElement("li");
        historyItem.textContent = task.text;
        completedList.appendChild(historyItem);
    });
}

// ... (existing code)
function clearHistory() {
    const completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
    const notCompletedTasks = JSON.parse(localStorage.getItem("notCompletedTasks")) || [];
    const lateTasks = JSON.parse(localStorage.getItem("lateTasks")) || [];

    // Combine all history tasks into one array
    const allHistoryTasks = [...completedTasks, ...notCompletedTasks, ...lateTasks];

    // Clear all history tasks
    localStorage.setItem("completedTasks", JSON.stringify([]));
    localStorage.setItem("notCompletedTasks", JSON.stringify([]));
    localStorage.setItem("lateTasks", JSON.stringify([]));

    // Reload tasks and history
    loadTasks();
    loadHistory();
}