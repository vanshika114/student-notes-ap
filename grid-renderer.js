document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("project-grid");
    if (!grid) return;
    try {
        const response = await fetch("projects.json");
        const projects = await response.json();
        
        let currentPage = 1;
        const itemsPerPage = 8;
        let filteredProjects = [...projects];

        // Create filter controls container
        const filterContainer = document.createElement("div");
        filterContainer.style.marginBottom = "20px";
        filterContainer.style.display = "flex";
        filterContainer.style.gap = "10px";
        filterContainer.style.flexWrap = "wrap";
        
        // Category filters
        const tags = ["All", ...new Set(projects.map(p => p.tag))];
        tags.forEach(tag => {
            const btn = document.createElement("button");
            btn.innerText = tag;
            btn.className = "nav-btn";
            btn.style.background = tag === "All" ? "var(--accent)" : "var(--tag-bg)";
            btn.style.color = tag === "All" ? "white" : "var(--text)";
            btn.style.border = "none";
            btn.style.padding = "5px 12px";
            btn.style.borderRadius = "20px";
            btn.style.cursor = "pointer";
            btn.style.fontSize = "12px";
            btn.addEventListener("click", () => {
                filterContainer.querySelectorAll("button").forEach(b => {
                    b.style.background = "var(--tag-bg)";
                    b.style.color = "var(--text)";
                });
                btn.style.background = "var(--accent)";
                btn.style.color = "white";
                
                filteredProjects = tag === "All" ? [...projects] : projects.filter(p => p.tag === tag);
                currentPage = 1;
                render();
            });
            filterContainer.appendChild(btn);
        });

        grid.parentNode.insertBefore(filterContainer, grid);

        // Pagination controls container
        const pagContainer = document.createElement("div");
        pagContainer.style.marginTop = "20px";
        pagContainer.style.display = "flex";
        pagContainer.style.justifyContent = "center";
        pagContainer.style.gap = "8px";
        grid.parentNode.insertBefore(pagContainer, grid.nextSibling);

        const render = () => {
            grid.innerHTML = "";
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginated = filteredProjects.slice(start, end);

            if (paginated.length === 0) {
                grid.innerHTML = "<p style='color:var(--muted);font-size:14px;'>No projects found in this category.</p>";
                pagContainer.innerHTML = "";
                return;
            }

            paginated.forEach(proj => {
                const card = document.createElement("a");
                card.href = proj.path;
                card.className = "app-card";
                card.innerHTML = `<div class="icon-container"><i class="${proj.icon}"></i></div><h3>${proj.name}</h3><span class="tag">${proj.tag}</span>`;
                grid.appendChild(card);
            });

            // Render pagination buttons
            pagContainer.innerHTML = "";
            const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
            if (totalPages > 1) {
                for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement("button");
                    btn.innerText = i;
                    btn.style.padding = "5px 10px";
                    btn.style.border = "1px solid var(--border)";
                    btn.style.borderRadius = "4px";
                    btn.style.cursor = "pointer";
                    btn.style.background = i === currentPage ? "var(--accent)" : "var(--surface)";
                    btn.style.color = i === currentPage ? "white" : "var(--text)";
                    btn.addEventListener("click", () => {
                        currentPage = i;
                        render();
                    });
                    pagContainer.appendChild(btn);
                }
            }
        };

        render();
    } catch (error) {
        console.error("Failed to load projects:", error);
        grid.innerHTML = "<p>Error loading projects. Please try again later.</p>";
    }
});