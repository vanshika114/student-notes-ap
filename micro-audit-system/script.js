let audits = JSON.parse(localStorage.getItem("audits")) || [];

/* Elements */

const auditInput = document.getElementById("auditInput");

const addAuditBtn = document.getElementById("addAuditBtn");

const prioritySelect =
    document.getElementById("prioritySelect");

const dueDateInput =
    document.getElementById("dueDateInput");

const auditList = document.getElementById("auditList");

const totalAudits = document.getElementById("totalAudits");

const passedAudits = document.getElementById("passedAudits");

const failedAudits = document.getElementById("failedAudits");

const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "all";

let editingAuditId = null;

/* Add Audit */

addAuditBtn.addEventListener("click", addAudit);

searchInput.addEventListener("input", renderAudits);

filterButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        filterButtons.forEach((b) => b.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        renderAudits();
    });
});

function addAudit(){

    const task = auditInput.value.trim();

    if(task === ""){

        alert("Please enter an audit checkpoint");

        return;
    }

const audit = {

    id:Date.now(),

    task:task,

    status:"pending",

    priority: prioritySelect.value,

    dueDate: dueDateInput.value,

    createdAt:new Date().toLocaleString()
};

    audits.push(audit);

    saveAudits();

    auditInput.value = "";

    renderAudits();
}

/* Due Date Helpers */

function parseLocalDate(dateValue){

    if(!dateValue){

        return null;
    }

    const dateParts = dateValue.split("-");

    return new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
    );
}

function getTodayDate(){

    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}

function getDueDateInfo(audit){

    if(!audit.dueDate){

        return {
            badge: "",
            badgeClass: "",
            dueClass: "",
            message: ""
        };
    }

    const dueDate = parseLocalDate(audit.dueDate);

    const today = getTodayDate();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const daysDifference = Math.round(
        (dueDate - today) / millisecondsPerDay
    );

    if(daysDifference === 0){

        return {
            badge: "DUE TODAY",
            badgeClass: "today-badge",
            dueClass: "due-today-text",
            message: "Due today"
        };
    }

    if(audit.status !== "pending"){

        return {
            badge: "",
            badgeClass: "",
            dueClass: "",
            message: ""
        };
    }

    if(daysDifference < 0){

        const overdueDays = Math.abs(daysDifference);

        return {
            badge: "OVERDUE",
            badgeClass: "overdue-badge",
            dueClass: "overdue-text",
            message:
                overdueDays === 1
                    ? "1 day overdue"
                    : `${overdueDays} days overdue`
        };
    }

    if(daysDifference <= 3){

        return {
            badge: "DUE SOON",
            badgeClass: "soon-badge",
            dueClass: "due-soon-text",
            message:
                daysDifference === 1
                    ? "Due in 1 day"
                    : `Due in ${daysDifference} days`
        };
    }

    return {
        badge: "",
        badgeClass: "",
        dueClass: "future-due-text",
        message: `Due in ${daysDifference} days`
    };
}

/* Render Audits */

function renderAudits(){

    auditList.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();

const filteredAudits = audits.filter((audit)=>{

    const matchesSearch =
        audit.task.toLowerCase().includes(searchValue);

    const matchesFilter =
        currentFilter === "all" ||
        audit.status === currentFilter;

    return matchesSearch && matchesFilter;
});

filteredAudits.forEach((audit)=>{

        const dueDateInfo = getDueDateInfo(audit);

        const isEditing = editingAuditId === audit.id;

        const card = document.createElement("div");

        card.className = [
            "audit-card",
            dueDateInfo.badge === "OVERDUE" ? "overdue-card" : "",
            isEditing ? "editing-card" : ""
        ].filter(Boolean).join(" ");

        if(isEditing){

            card.innerHTML = `

            <div class="audit-info edit-audit-info">

                <span class="edit-mode-badge">
                    Editing Audit
                </span>

                <input
                    type="text"
                    id="editTask-${audit.id}"
                    class="edit-input"
                    value="${escapeHTML(audit.task)}"
                    aria-label="Edit audit task name"
                >

                <select
                    id="editPriority-${audit.id}"
                    class="edit-input"
                    aria-label="Edit priority level"
                >
                    <option value="Low" ${audit.priority === "Low" ? "selected" : ""}>
                        Low Priority
                    </option>
                    <option value="Medium" ${audit.priority === "Medium" ? "selected" : ""}>
                        Medium Priority
                    </option>
                    <option value="High" ${audit.priority === "High" ? "selected" : ""}>
                        High Priority
                    </option>
                </select>

                <input
                    type="date"
                    id="editDueDate-${audit.id}"
                    class="edit-input"
                    value="${audit.dueDate || ""}"
                    aria-label="Edit due date"
                >

            </div>

            <div class="audit-actions">

                <button
                    class="save-btn"
                    onclick="saveEditAudit(${audit.id})"
                >
                    Save
                </button>

                <button
                    class="cancel-btn"
                    onclick="cancelEditAudit()"
                >
                    Cancel
                </button>

            </div>
        `;

        } else {

            card.innerHTML = `

        <div class="audit-info">

            <h3>${escapeHTML(audit.task)}</h3>

            <div class="audit-meta">

            <span class="
            priority-badge
            ${(audit.priority || "Low").toLowerCase()}
            ">
            ${audit.priority || "Low"}
             </span>

             <span class="due-date ${dueDateInfo.dueClass}">

            ${
                audit.dueDate
                ? audit.dueDate
                : "No Due Date"
            }

            </span>

            ${
                dueDateInfo.badge
                ? `<span class="status-badge ${dueDateInfo.badgeClass}">
                    ${dueDateInfo.badge}
                   </span>`
                : ""
            }

            </div>

            ${
                dueDateInfo.message
                ? `<p class="due-message ${dueDateInfo.dueClass}">
                    ${dueDateInfo.message}
                   </p>`
                : ""
            }

            <p>
            Status:
             ${audit.status.toUpperCase()}
            </p>

             <p>
            ${audit.createdAt}
             </p>

            </div>

            <div class="audit-actions">

                <button 
                    class="pass-btn"
                    onclick="markPass(${audit.id})"
                >
                    Pass
                </button>

                <button 
                    class="fail-btn"
                    onclick="markFail(${audit.id})"
                >
                    Fail
                </button>

                <button 
                    class="edit-btn"
                    onclick="editAudit(${audit.id})"
                >
                    Edit
                </button>

                <button 
                    class="delete-btn"
                    onclick="deleteAudit(${audit.id})"
                >
                    Delete
                </button>

            </div>
        `;
        }

        auditList.appendChild(card);
    });

    updateStats();
}

/* Edit Audit */

function editAudit(id){

    editingAuditId = id;

    renderAudits();
}

function saveEditAudit(id){

    const editTaskInput =
        document.getElementById(`editTask-${id}`);

    const editPrioritySelect =
        document.getElementById(`editPriority-${id}`);

    const editDueDateInput =
        document.getElementById(`editDueDate-${id}`);

    const updatedTask = editTaskInput.value.trim();

    if(updatedTask === ""){

        alert("Please enter an audit checkpoint");

        return;
    }

    audits = audits.map((audit)=>{

        if(audit.id === id){

            return {
                ...audit,
                task: updatedTask,
                priority: editPrioritySelect.value,
                dueDate: editDueDateInput.value
            };
        }

        return audit;
    });

    editingAuditId = null;

    saveAudits();

    renderAudits();
}

function cancelEditAudit(){

    editingAuditId = null;

    renderAudits();
}

function escapeHTML(value){

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* Mark Pass */

function markPass(id){

    audits = audits.map((audit)=>{

        if(audit.id === id){

            audit.status = "pass";
        }

        return audit;
    });

    saveAudits();

    renderAudits();
}

/* Mark Fail */

function markFail(id){

    audits = audits.map((audit)=>{

        if(audit.id === id){

            audit.status = "fail";
        }

        return audit;
    });

    saveAudits();

    renderAudits();
}

/* Delete Audit */

function deleteAudit(id){

    audits = audits.filter((audit)=> audit.id !== id);

    saveAudits();

    renderAudits();
}

/* Update Stats */

function updateStats(){

    totalAudits.textContent = audits.length;

    const passed = audits.filter(
        audit => audit.status === "pass"
    ).length;

    const failed = audits.filter(
        audit => audit.status === "fail"
    ).length;

    passedAudits.textContent = passed;

    failedAudits.textContent = failed;
}

/* Save Local Storage */

function saveAudits(){

    localStorage.setItem(
        "audits",
        JSON.stringify(audits)
    );
}

/* Theme Toggle */

themeToggle.addEventListener("click", ()=>{

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){

        localStorage.setItem("theme","dark");

        themeToggle.textContent = "☀️";

    } else {

        localStorage.setItem("theme","light");

        themeToggle.textContent = "🌙";
    }
});

/* Load Theme */

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){

    document.body.classList.add("dark-mode");

    themeToggle.textContent = "☀️";
}

/* Initial Render */

renderAudits();
