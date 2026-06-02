const form = document.getElementById("note-form");
const titleInput = document.getElementById("note-title");
const bodyInput = document.getElementById("note-body");
const list = document.getElementById("note-list");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("empty");

const updateStatus = () => {
  const total = list.children.length;
  countEl.textContent = total;
  emptyEl.hidden = total > 0;
};

const createNote = ({ title, body, createdAt }) => {
  const li = document.createElement("li");
  li.className = "note-card";

  const heading = document.createElement("h3");
  heading.textContent = title || "Untitled note";

  const text = document.createElement("p");
  text.textContent = body;

  const meta = document.createElement("div");
  meta.className = "note-meta";

  const timestamp = document.createElement("span");
  timestamp.textContent = createdAt;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Delete";

  removeBtn.addEventListener("click", () => {
    li.remove();
    updateStatus();
  });

  meta.append(timestamp, removeBtn);
  li.append(heading, text, meta);
  return li;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const body = bodyInput.value.trim();
  if (!body) {
    bodyInput.focus();
    return;
  }

  const title = titleInput.value.trim();
  const createdAt = new Date().toLocaleString();

  list.prepend(createNote({ title, body, createdAt }));
  titleInput.value = "";
  bodyInput.value = "";
  titleInput.focus();
  updateStatus();
});

updateStatus();
