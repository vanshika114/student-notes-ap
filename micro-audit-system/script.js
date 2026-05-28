let audits = JSON.parse(localStorage.getItem("audits")) || [];

/* Elements */

const auditInput = document.getElementById("auditInput");

const addAuditBtn = document.getElementById("addAuditBtn");

const auditList = document.getElementById("auditList");

const totalAudits = document.getElementById("totalAudits");

const passedAudits = document.getElementById("passedAudits");

const failedAudits = document.getElementById("failedAudits");

const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "all";

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

        createdAt:new Date().toLocaleString()
    };

    audits.push(audit);

    saveAudits();

    auditInput.value = "";

    renderAudits();
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

        const card = document.createElement("div");

        card.className = "audit-card";

        card.innerHTML = `

            <div class="audit-info">

                <h3>${audit.task}</h3>

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
                    class="delete-btn"
                    onclick="deleteAudit(${audit.id})"
                >
                    Delete
                </button>

            </div>
        `;

        auditList.appendChild(card);
    });

    updateStats();
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