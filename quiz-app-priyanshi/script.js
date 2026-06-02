const questions = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Logic", "Home Tool Markup Language"],
    answer: 0
  },
  {
    question: "Which language is used for styling web pages?",
    options: ["Java", "Python", "CSS", "C++"],
    answer: 2
  },
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Coded Style Syntax"],
    answer: 1
  },
  {
    question: "Which symbol is used for single-line comments in JavaScript?",
    options: ["/* */", "<!-- -->", "//", "#"],
    answer: 2
  },
  {
    question: "Which HTML tag is used to link a CSS file?",
    options: ["<style>", "<css>", "<script>", "<link>"],
    answer: 3
  }
];

let current = 0;
let score = 0;
let answered = false;

function loadQuestion() {
  answered = false;
  const q = questions[current];
  document.getElementById('question-count').textContent = `Question ${current + 1} of ${questions.length}`;
  document.getElementById('question').textContent = q.question;
  document.getElementById('progress').style.width = `${((current) / questions.length) * 100}%`;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i, btn);
    optionsDiv.appendChild(btn);
  });

  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = true;
  nextBtn.textContent = current === questions.length - 1 ? 'Finish ✓' : 'Next →';
}

function selectAnswer(index, btn) {
  if (answered) return;
  answered = true;

  const correct = questions[current].answer;
  const allBtns = document.querySelectorAll('.option');
  allBtns.forEach(b => b.disabled = true);

  if (index === correct) {
    btn.classList.add('correct');
    score++;
  } else {
    btn.classList.add('wrong');
    allBtns[correct].classList.add('correct');
  }

  document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById('quiz-box').classList.add('hidden');
  document.getElementById('result-box').classList.remove('hidden');
  document.getElementById('score-text').textContent = `${score} / ${questions.length}`;
  document.getElementById('progress').style.width = '100%';

  const pct = (score / questions.length) * 100;
  let msg = '';
  if (pct === 100) msg = '🎉 Perfect score! Outstanding!';
  else if (pct >= 80) msg = '👏 Great job! Almost perfect!';
  else if (pct >= 60) msg = '👍 Good effort! Keep practicing!';
  else msg = '📚 Keep studying, you\'ll get there!';

  document.getElementById('score-msg').textContent = msg;
}

function restartQuiz() {
  current = 0;
  score = 0;
  document.getElementById('quiz-box').classList.remove('hidden');
  document.getElementById('result-box').classList.add('hidden');
  loadQuestion();
}

loadQuestion();