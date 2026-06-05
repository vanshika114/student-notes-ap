let audits = JSON.parse(localStorage.getItem("audits")) || [];

/* Elements */

const auditInput = document.getElementById("auditInput");

const descriptionInput =
    document.getElementById("descriptionInput");

const addAuditBtn = document.getElementById("addAuditBtn");

const prioritySelect =
    document.getElementById("prioritySelect");

const dueDateInput =
    document.getElementById("dueDateInput");

const imageInput =
    document.getElementById("imageInput");

const imagePreview =
    document.getElementById("imagePreview");

const imagePreviewImg =
    document.getElementById("imagePreviewImg");

const imageValidationMessage =
    document.getElementById("imageValidationMessage");

const removeImageBtn =
    document.getElementById("removeImageBtn");

const auditList = document.getElementById("auditList");

const totalAudits = document.getElementById("totalAudits");

const pendingAudits = document.getElementById("pendingAudits");

const passedAudits = document.getElementById("passedAudits");

const failedAudits = document.getElementById("failedAudits");

const completionPercentage =
    document.getElementById("completionPercentage");

const statsContainer =
    document.querySelector(".stats-container");

const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");

const sortSelect = document.getElementById("sortSelect");

const exportAuditsBtn =
    document.getElementById("exportAuditsBtn");

const filterButtons = document.querySelectorAll(".filter-btn");

const registerForm = document.getElementById("registerForm");

const loginForm = document.getElementById("loginForm");

const logoutBtn = document.getElementById("logoutBtn");

const userGreeting = document.getElementById("userGreeting");

const roleBadge = document.getElementById("roleBadge");

let currentFilter = "all";

let editingAuditId = null;

let newAuditImageData = "";

let editImageCache = {};

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const allowedImageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
];

const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || null;

const currentUserRole = currentUser
    ? currentUser.role || "User"
    : "";

const isDashboardPage = Boolean(auditList);

const isAuthPage = Boolean(registerForm || loginForm);

/* Auth Helpers */

function getUsers(){

    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users){

    localStorage.setItem("users", JSON.stringify(users));
}

function setFormMessage(element, message, type){

    if(!element){

        return;
    }

    element.textContent = message;

    element.className = `form-message ${type}`;
}

function isValidEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAdmin(){

    return currentUserRole === "Admin";
}

function redirectToDashboard(){

    window.location.href = "index.html";
}

function redirectToLogin(){

    window.location.href = "login.html";
}

function protectRoutes(){

    if(isDashboardPage && !currentUser){

        redirectToLogin();
    }

    if(isAuthPage && currentUser){

        redirectToDashboard();
    }
}

protectRoutes();

/* Add Audit */

if(addAuditBtn){

    addAuditBtn.addEventListener("click", addAudit);
}

if(imageInput){

    imageInput.addEventListener("change", handleNewImageChange);
}

if(removeImageBtn){

    removeImageBtn.addEventListener("click", clearNewImageState);
}

if(searchInput){

    searchInput.addEventListener("input", renderAudits);
}

if(sortSelect){

    sortSelect.addEventListener("change", renderAudits);
}

if(exportAuditsBtn){

    exportAuditsBtn.addEventListener("click", exportAudits);
}

if(userGreeting && currentUser){

    userGreeting.textContent = `Welcome, ${currentUser.username}`;
}

if(roleBadge && currentUser){

    roleBadge.textContent = currentUserRole;

    roleBadge.classList.add(currentUserRole.toLowerCase());
}

if(statsContainer && currentUser && !isAdmin()){

    statsContainer.classList.add("hidden");
}

if(logoutBtn){

    logoutBtn.addEventListener("click", logoutUser);
}

if(registerForm){

    registerForm.addEventListener("submit", registerUser);
}

if(loginForm){

    loginForm.addEventListener("submit", loginUser);
}

filterButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        filterButtons.forEach((b) => b.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        renderAudits();
    });
});

function registerUser(event){

    event.preventDefault();

    const username =
        document.getElementById("registerUsername").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const role =
        document.getElementById("registerRole").value;

    const registerMessage =
        document.getElementById("registerMessage");

    if(!username || !email || !password || !confirmPassword){

        setFormMessage(
            registerMessage,
            "Please fill in all fields",
            "error"
        );

        return;
    }

    if(!isValidEmail(email)){

        setFormMessage(
            registerMessage,
            "Please enter a valid email address",
            "error"
        );

        return;
    }

    if(password !== confirmPassword){

        setFormMessage(
            registerMessage,
            "Passwords do not match",
            "error"
        );

        return;
    }

    const users = getUsers();

    const userExists = users.some((user)=>
        user.username.toLowerCase() === username.toLowerCase() ||
        user.email.toLowerCase() === email.toLowerCase()
    );

    if(userExists){

        setFormMessage(
            registerMessage,
            "Username or email already exists",
            "error"
        );

        return;
    }

    users.push({
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        role: role
    });

    saveUsers(users);

    setFormMessage(
        registerMessage,
        "Registration successful. Redirecting to login...",
        "success"
    );

    setTimeout(redirectToLogin, 700);
}

function loginUser(event){

    event.preventDefault();

    const identifier =
        document.getElementById("loginIdentifier").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const loginMessage =
        document.getElementById("loginMessage");

    if(!identifier || !password){

        setFormMessage(
            loginMessage,
            "Please enter your username or email and password",
            "error"
        );

        return;
    }

    const users = getUsers();

    const user = users.find((savedUser)=>
        (
            savedUser.username.toLowerCase() ===
                identifier.toLowerCase() ||
            savedUser.email.toLowerCase() ===
                identifier.toLowerCase()
        ) &&
        savedUser.password === password
    );

    if(!user){

        setFormMessage(
            loginMessage,
            "Invalid username, email, or password",
            "error"
        );

        return;
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || "User"
        })
    );

    redirectToDashboard();
}

function logoutUser(){

    localStorage.removeItem("currentUser");

    redirectToLogin();
}

function addAudit(){

    const task = auditInput.value.trim();

    const description = descriptionInput
        ? descriptionInput.value.trim()
        : "";

    if(task === ""){

        alert("Please enter an audit checkpoint");

        return;
    }

const audit = {

    id:Date.now(),

    task:task,

    description: description,

    status:"pending",

    priority: prioritySelect.value,

    dueDate: dueDateInput.value,

    createdAt:new Date().toLocaleString(),

    image: newAuditImageData
};

    audits.push(audit);

    saveAudits();

    auditInput.value = "";

    if(descriptionInput){

        descriptionInput.value = "";
    }

    renderAudits();

    clearNewImageState();
}

function setImageMessage(element, message, type){

    if(!element){

        return;
    }

    element.textContent = message;

    element.className = `image-message ${type || ""}`;
}

function isSupportedImageFile(file){

    if(!file){

        return false;
    }

    const typeIsValid =
        allowedImageTypes.includes(file.type);

    const name = file.name.toLowerCase();

    const extensionIsValid =
        allowedImageExtensions.some((ext)=> name.endsWith(ext));

    return typeIsValid || extensionIsValid;
}

function readImageFileAsDataUrl(file, callback){

    const reader = new FileReader();

    reader.onload = () => {

        callback(reader.result);
    };

    reader.readAsDataURL(file);
}

function updateNewImagePreview(imageData){

    if(imagePreview && imagePreviewImg){

        if(imageData){

            imagePreviewImg.src = imageData;

            imagePreview.classList.remove("hidden");
        } else {

            imagePreviewImg.removeAttribute("src");

            imagePreview.classList.add("hidden");
        }
    }
}

function clearNewImageState(){

    newAuditImageData = "";

    if(imageInput){

        imageInput.value = "";
    }

    updateNewImagePreview("");

    setImageMessage(imageValidationMessage, "", "");
}

function handleNewImageChange(event){

    const file = event.target.files[0];

    if(!file){

        clearNewImageState();

        return;
    }

    if(!isSupportedImageFile(file)){

        setImageMessage(
            imageValidationMessage,
            "Please upload a JPG, JPEG, PNG, or WEBP image.",
            "error"
        );

        event.target.value = "";

        updateNewImagePreview("");

        newAuditImageData = "";

        return;
    }

    readImageFileAsDataUrl(file, (imageData)=>{

        newAuditImageData = imageData;

        updateNewImagePreview(imageData);

        setImageMessage(
            imageValidationMessage,
            "Image ready to save.",
            "success"
        );
    });
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

/* Sorting Helpers */

function getPriorityValue(priority){

    const priorityValues = {
        High: 3,
        Medium: 2,
        Low: 1
    };

    return priorityValues[priority] || priorityValues.Low;
}

function sortAuditsByPriority(filteredAudits){

    if(!sortSelect || sortSelect.value === "default"){

        return filteredAudits;
    }

    return [...filteredAudits].sort((firstAudit, secondAudit)=>{

        const firstPriority =
            getPriorityValue(firstAudit.priority || "Low");

        const secondPriority =
            getPriorityValue(secondAudit.priority || "Low");

        if(sortSelect.value === "high-low"){

            return secondPriority - firstPriority;
        }

        return firstPriority - secondPriority;
    });
}

/* Render Audits */

function renderAudits(){

    auditList.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();

const filteredAudits = audits.filter((audit)=>{

    const matchesSearch =
        audit.task.toLowerCase().includes(searchValue) ||
        (audit.description || "")
            .toLowerCase()
            .includes(searchValue);

    const matchesFilter =
        currentFilter === "all" ||
        audit.status === currentFilter;

    return matchesSearch && matchesFilter;
});

const sortedAudits = sortAuditsByPriority(filteredAudits);

sortedAudits.forEach((audit)=>{

        const dueDateInfo = getDueDateInfo(audit);

        const isEditing = editingAuditId === audit.id;

        const cachedEditImage = editImageCache[audit.id];

        const previewImageSource = cachedEditImage
            ? cachedEditImage.dataUrl
            : audit.image || "";

        const hasPreviewImage = Boolean(previewImageSource);

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

                <textarea
                    id="editDescription-${audit.id}"
                    class="edit-input edit-textarea"
                    rows="3"
                    placeholder="Add description (optional)..."
                    aria-label="Edit audit description"
                >${escapeHTML(audit.description || "")}</textarea>

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

                <div class="image-field">

                    <label class="image-label" for="editImage-${audit.id}">
                        Audit image (optional)
                    </label>

                    <input
                        type="file"
                        id="editImage-${audit.id}"
                        class="edit-input image-input"
                        accept="image/jpeg,image/png,image/webp"
                        onchange="handleEditImageChange(${audit.id})"
                    >

                    <p
                        id="editImageMessage-${audit.id}"
                        class="image-message"
                    ></p>

                    <div
                        id="editImagePreview-${audit.id}"
                        class="image-preview ${hasPreviewImage ? "" : "hidden"}"
                    >
                        <img
                            id="editImagePreviewImg-${audit.id}"
                            src="${previewImageSource}"
                            alt="Selected audit image preview"
                        >
                        <div class="image-actions">
                            <button
                                type="button"
                                id="editImageRemove-${audit.id}"
                                class="remove-image-btn ${hasPreviewImage ? "" : "hidden"}"
                                onclick="removeEditImage(${audit.id})"
                            >
                                Remove Image
                            </button>
                        </div>
                    </div>
                </div>

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

            ${
                audit.description && audit.description.trim()
                ? `<p class="audit-description">
                    ${escapeHTML(audit.description)}
                   </p>`
                : ""
            }

            ${
                audit.image
                ? `<div class="audit-image">
                    <img
                        src="${audit.image}"
                        alt="Audit attachment for ${escapeHTML(audit.task)}"
                        loading="lazy"
                    >
                   </div>`
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

                ${getAuditActions(audit.id)}

            </div>
        `;
        }

        auditList.appendChild(card);
    });

    updateStats();
}

function getAuditActions(id){

    if(!isAdmin()){

        return `
            <span class="permission-note">
                View Only
            </span>
        `;
    }

    return `
        <button
            class="pass-btn"
            onclick="markPass(${id})"
        >
            Pass
        </button>

        <button
            class="fail-btn"
            onclick="markFail(${id})"
        >
            Fail
        </button>

        <button
            class="edit-btn"
            onclick="editAudit(${id})"
        >
            Edit
        </button>

        <button
            class="delete-btn"
            onclick="deleteAudit(${id})"
        >
            Delete
        </button>
    `;
}

/* Edit Audit */

function editAudit(id){

    if(!isAdmin()){

        alert("Only admins can edit audits");

        return;
    }

    editingAuditId = id;

    renderAudits();
}

function saveEditAudit(id){

    if(!isAdmin()){

        alert("Only admins can edit audits");

        return;
    }

    const editTaskInput =
        document.getElementById(`editTask-${id}`);

    const editPrioritySelect =
        document.getElementById(`editPriority-${id}`);

    const editDueDateInput =
        document.getElementById(`editDueDate-${id}`);

    const editDescriptionInput =
        document.getElementById(`editDescription-${id}`);

    const updatedTask = editTaskInput.value.trim();

    if(updatedTask === ""){

        alert("Please enter an audit checkpoint");

        return;
    }

    audits = audits.map((audit)=>{

        if(audit.id === id){

            const cachedImage = editImageCache[id];

            const updatedImage = cachedImage
                ? cachedImage.dataUrl
                : audit.image || "";

            return {
                ...audit,
                task: updatedTask,
                description: editDescriptionInput
                    ? editDescriptionInput.value.trim()
                    : "",
                priority: editPrioritySelect.value,
                dueDate: editDueDateInput.value,
                image: updatedImage
            };
        }

        return audit;
    });

    editingAuditId = null;

    delete editImageCache[id];

    saveAudits();

    renderAudits();
}

function cancelEditAudit(){

    editingAuditId = null;

    editImageCache = {};

    renderAudits();
}

function handleEditImageChange(id){

    const editImageInput =
        document.getElementById(`editImage-${id}`);

    const editImagePreview =
        document.getElementById(`editImagePreview-${id}`);

    const editImagePreviewImg =
        document.getElementById(`editImagePreviewImg-${id}`);

    const editImageMessage =
        document.getElementById(`editImageMessage-${id}`);

    const editImageRemove =
        document.getElementById(`editImageRemove-${id}`);

    const file = editImageInput.files[0];

    if(!file){

        return;
    }

    if(!isSupportedImageFile(file)){

        setImageMessage(
            editImageMessage,
            "Please upload a JPG, JPEG, PNG, or WEBP image.",
            "error"
        );

        editImageInput.value = "";

        return;
    }

    readImageFileAsDataUrl(file, (imageData)=>{

        editImageCache[id] = {
            dataUrl: imageData
        };

        if(editImagePreview && editImagePreviewImg){

            editImagePreviewImg.src = imageData;

            editImagePreview.classList.remove("hidden");
        }

        if(editImageRemove){

            editImageRemove.classList.remove("hidden");
        }

        setImageMessage(
            editImageMessage,
            "Image ready to save.",
            "success"
        );
    });
}

function removeEditImage(id){

    const editImagePreview =
        document.getElementById(`editImagePreview-${id}`);

    const editImagePreviewImg =
        document.getElementById(`editImagePreviewImg-${id}`);

    const editImageMessage =
        document.getElementById(`editImageMessage-${id}`);

    const editImageInput =
        document.getElementById(`editImage-${id}`);

    const editImageRemove =
        document.getElementById(`editImageRemove-${id}`);

    editImageCache[id] = {
        dataUrl: ""
    };

    if(editImageInput){

        editImageInput.value = "";
    }

    if(editImagePreview){

        editImagePreview.classList.add("hidden");
    }

    if(editImagePreviewImg){

        editImagePreviewImg.removeAttribute("src");
    }

    if(editImageRemove){

        editImageRemove.classList.add("hidden");
    }

    setImageMessage(
        editImageMessage,
        "Image will be removed after saving.",
        "success"
    );
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

/* Mark Pass */

function markPass(id){

    if(!isAdmin()){

        alert("Only admins can update audit status");

        return;
    }

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

    if(!isAdmin()){

        alert("Only admins can update audit status");

        return;
    }

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

    if(!isAdmin()){

        alert("Only admins can delete audits");

        return;
    }

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

    const pending = audits.filter(
        audit => audit.status === "pending"
    ).length;

    const completed = passed + failed;

    const completion = audits.length === 0
        ? 0
        : Math.round((completed / audits.length) * 100);

    passedAudits.textContent = passed;

    failedAudits.textContent = failed;

    pendingAudits.textContent = pending;

    completionPercentage.textContent = `${completion}%`;
}

/* Save Local Storage */

function saveAudits(){

    localStorage.setItem(
        "audits",
        JSON.stringify(audits)
    );
}

function getAuditsForExport(){

    const storedAuditsRaw = localStorage.getItem("audits");

    if(!storedAuditsRaw){

        return Array.isArray(audits) ? audits.slice() : [];
    }

    try {

        const parsed = JSON.parse(storedAuditsRaw);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        return Array.isArray(audits) ? audits.slice() : [];
    }
}

function getExportDateStamp(){

    return new Date().toISOString().split("T")[0];
}

function exportAudits(){

    const auditsToExport = getAuditsForExport();

    const exportPayload = {
        exportDate: new Date().toISOString(),
        auditCount: auditsToExport.length,
        audits: auditsToExport
    };

    const exportJson = JSON.stringify(exportPayload, null, 2);

    const exportBlob = new Blob([exportJson], {
        type: "application/json"
    });

    const exportUrl = URL.createObjectURL(exportBlob);

    const downloadLink = document.createElement("a");

    downloadLink.href = exportUrl;
    downloadLink.download =
        `audit-backup-${getExportDateStamp()}.json`;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(exportUrl);
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

if(isDashboardPage && currentUser){

    renderAudits();
}
