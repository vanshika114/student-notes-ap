const questions = [
  {
    question: "What does HTML stand for?",
    answers: [
      "HyperText Markup Language",
      "Hyperlink and Text Markup Language",
      "Home Tool Markup Language",
    ],
    correctIndex: 0,
  },
  {
    question: "Which language is used for styling web pages?",
    answers: ["HTML", "CSS", "Python"],
    correctIndex: 1,
  },
  {
    question: "Which symbol is used for single-line comments in JS?",
    answers: ["//", "<!-- -->", "#"],
    correctIndex: 0,
  },
];

const progressEl = document.getElementById("progress");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const resultEl = document.getElementById("result");
const quizCard = document.getElementById("quiz-card");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const restartBtn = document.getElementById("restart");

let currentIndex = 0;
let score = 0;

const renderQuestion = () => {
  const current = questions[currentIndex];
  progressEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  questionEl.textContent = current.question;
  answersEl.innerHTML = "";

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => handleAnswer(index));
    answersEl.appendChild(button);
  });
};

const handleAnswer = (index) => {
  if (questions[currentIndex].correctIndex === index) {
    score += 1;
  }

  currentIndex += 1;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
};

const showResult = () => {
  quizCard.hidden = true;
  resultEl.hidden = false;
  scoreEl.textContent = score;
  totalEl.textContent = questions.length;
};

const restartQuiz = () => {
  currentIndex = 0;
  score = 0;
  resultEl.hidden = true;
  quizCard.hidden = false;
  renderQuestion();
};

restartBtn.addEventListener("click", restartQuiz);

renderQuestion();
