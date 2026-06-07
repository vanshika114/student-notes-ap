const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterTasks = document.getElementById("filterTasks");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const themeToggle = document.getElementById("themeToggle");
const emptyState = document.getElementById("emptyState");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

renderTasks();

addTaskBtn.addEventListener("click", addTask);

searchInput.addEventListener("input", renderTasks);
filterTasks.addEventListener("change", renderTasks);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
});

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
}

function addTask(){

    const text = taskInput.value.trim();

    if(!text){
        alert("Enter a task");
        return;
    }

    const task = {
        id: Date.now(),
        text,
        priority: priorityInput.value,
        dueDate: dueDateInput.value,
        completed:false
    };

    tasks.push(task);

    saveTasks();

    taskInput.value="";
    dueDateInput.value="";

    renderTasks();
}

function renderTasks(){

    taskList.innerHTML="";

    let filtered = [...tasks];

    const search = searchInput.value.toLowerCase();

    filtered = filtered.filter(task =>
        task.text.toLowerCase().includes(search)
    );

    if(filterTasks.value === "completed"){
        filtered = filtered.filter(task => task.completed);
    }

    if(filterTasks.value === "pending"){
        filtered = filtered.filter(task => !task.completed);
    }

    filtered.forEach(task => {

        const li = document.createElement("li");

        li.className =
            `task-item ${task.completed ? "completed" : ""}`;

        li.innerHTML = `
            <div class="task-left">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <div class="task-content">

                    <h4>${task.text}</h4>

                    <div class="task-meta">

                        <span class="badge ${task.priority.toLowerCase()}">
                            ${task.priority}
                        </span>

                        ${
                            task.dueDate
                            ? `<span class="date">📅 ${task.dueDate}</span>`
                            : ""
                        }

                    </div>

                </div>

            </div>

            <div class="actions">

                <button
                    class="edit-btn"
                    onclick="editTask(${task.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(li);
    });

    updateStats();

    emptyState.style.display =
        filtered.length === 0 ? "block" : "none";
}

function toggleTask(id){

    tasks = tasks.map(task => {

        if(task.id === id){
            task.completed = !task.completed;
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

function deleteTask(id){

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

function editTask(id){

    const task = tasks.find(task => task.id === id);

    const updated = prompt(
        "Edit Task",
        task.text
    );

    if(updated && updated.trim()){

        task.text = updated.trim();

        saveTasks();
        renderTasks();
    }
}

function updateStats(){

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    const progress =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressFill.style.width = progress + "%";
    progressText.textContent = progress + "%";
}

function saveTasks(){

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}