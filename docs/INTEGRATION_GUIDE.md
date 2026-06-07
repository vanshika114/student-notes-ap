# Global Utilities Integration Guide

This guide describes how to integrate the global libraries and assets available in the root of the **student-notes-app** project into your custom sub-project.

---

## 🛠️ Global Utilities List

| Script / Stylesheet | Functionality | Import Code (HTML) |
|---|---|---|
| **Theme Sync** | Prevents flashing of dark theme | `<script src="../global-theme.js"></script>` |
| **Security XSS Helper** | Sanitizes user inputs | `<script src="../global-security.js"></script>` |
| **Accessibility Panel** | Custom contrast / text-sizing widget | `<script src="../global-accessibility.js"></script>` |
| **Toast Notifications** | Shared Toast alerts and popups | `<script src="../global-toast.js"></script>` |
| **Milestone Celebrations** | Particle confetti effect script | `<script src="../celebrations-helper.js"></script>` |
| **Keyboard Navigation** | High-visibility focus indicators | `<script src="../keyboard-navigation.js"></script>` |

---

## 💻 Code Examples

### 1. Alerting Students on Task Completion
If a student checks off a task, use the **Toast** and **Celebrations** libraries to trigger a motivational alert:

```html
<!-- Import dependencies at the bottom of the body tag -->
<script src="../global-toast.js"></script>
<script src="../celebrations-helper.js"></script>

<script>
    function onCompleteTask() {
        // Trigger particle confetti
        Celebrations.fire(2500);

        // Display a Toast alert
        Toast.show("Awesome job! Task completed successfully.", "success");
    }
</script>
```

### 2. Safely Rendering Student Notes
If a student inputs a note containing custom text, sanitize it before inserting it into the DOM to prevent XSS:

```html
<script src="../global-security.js"></script>

<script>
    function renderNote(title, content) {
        const titleSafe = Security.escapeHTML(title);
        const contentSafe = Security.escapeHTML(content);

        const noteDiv = document.createElement("div");
        noteDiv.className = "note";
        noteDiv.innerHTML = `<h3>${titleSafe}</h3><p>${contentSafe}</p>`;
        document.getElementById("notes-container").appendChild(noteDiv);
    }
</script>
```
