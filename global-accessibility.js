/**
 * Global Accessibility Utility
 * Adds accessibility helpers such as high contrast mode, text-size adjustments, and keyboard navigation indicators.
 */
(function() {
    // Create UI helper overlay container
    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.createElement("button");
        btn.id = "accessibility-toggle-btn";
        btn.innerText = "♿";
        btn.title = "Accessibility Options";
        btn.style.position = "fixed";
        btn.style.bottom = "20px";
        btn.style.right = "20px";
        btn.style.zIndex = "10000";
        btn.style.width = "45px";
        btn.style.height = "45px";
        btn.style.borderRadius = "50%";
        btn.style.backgroundColor = "#2563eb";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.fontSize = "20px";
        btn.style.cursor = "pointer";
        btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.setAttribute("aria-label", "Accessibility Settings Menu");
        btn.setAttribute("aria-haspopup", "true");

        const menu = document.createElement("div");
        menu.id = "accessibility-menu";
        menu.style.position = "fixed";
        menu.style.bottom = "75px";
        menu.style.right = "20px";
        menu.style.zIndex = "10000";
        menu.style.backgroundColor = "white";
        menu.style.border = "1px solid #e8eaed";
        menu.style.borderRadius = "8px";
        menu.style.padding = "16px";
        menu.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
        menu.style.display = "none";
        menu.style.flexDirection = "column";
        menu.style.gap = "12px";
        menu.style.width = "220px";
        menu.style.color = "#111318";
        menu.style.fontFamily = "system-ui, sans-serif";

        menu.innerHTML = `
            <div style="font-weight:bold;font-size:14px;border-bottom:1px solid #e8eaed;padding-bottom:8px;">Accessibility Options</div>
            <button id="contrast-toggle-btn" class="a11y-menu-btn" style="text-align:left;padding:8px;border:1px solid #e8eaed;background:none;border-radius:4px;cursor:pointer;font-size:12px;">🌓 Toggle High Contrast</button>
            <button id="text-increase-btn" class="a11y-menu-btn" style="text-align:left;padding:8px;border:1px solid #e8eaed;background:none;border-radius:4px;cursor:pointer;font-size:12px;">➕ Increase Text Size</button>
            <button id="text-decrease-btn" class="a11y-menu-btn" style="text-align:left;padding:8px;border:1px solid #e8eaed;background:none;border-radius:4px;cursor:pointer;font-size:12px;">➖ Decrease Text Size</button>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(menu);

        btn.addEventListener("click", () => {
            const isVisible = menu.style.display === "flex";
            menu.style.display = isVisible ? "none" : "flex";
            btn.setAttribute("aria-expanded", !isVisible);
        });

        // Contrast Mode
        const contrastBtn = menu.querySelector("#contrast-toggle-btn");
        contrastBtn.addEventListener("click", () => {
            document.documentElement.classList.toggle("high-contrast");
            const active = document.documentElement.classList.contains("high-contrast");
            localStorage.setItem("a11y_high_contrast", active ? "true" : "false");
        });

        if (localStorage.getItem("a11y_high_contrast") === "true") {
            document.documentElement.classList.add("high-contrast");
        }

        // Text Resizing
        let fontSizeScale = parseFloat(localStorage.getItem("a11y_text_scale")) || 1.0;
        const updateTextScale = () => {
            document.documentElement.style.setProperty("--a11y-text-scale", fontSizeScale);
            localStorage.setItem("a11y_text_scale", fontSizeScale);
        };

        menu.querySelector("#text-increase-btn").addEventListener("click", () => {
            if (fontSizeScale < 1.4) {
                fontSizeScale += 0.1;
                updateTextScale();
            }
        });

        menu.querySelector("#text-decrease-btn").addEventListener("click", () => {
            if (fontSizeScale > 0.8) {
                fontSizeScale -= 0.1;
                updateTextScale();
            }
        });

        updateTextScale();
    });
})();
