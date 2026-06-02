function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.innerHTML = `<span onclick="toggleDone(this)">${text}</span>
                  <button class="del" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById('taskList').appendChild(li);
  input.value = '';
}

function toggleDone(span) {
  span.parentElement.classList.toggle('done');
}

document.getElementById('taskInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTask();
});