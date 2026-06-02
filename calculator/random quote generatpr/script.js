const quoteEl = document.getElementById("quote");
const authorEl = document.getElementById("author");
const button = document.getElementById("new-quote");

const quotes = [
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "Your time is limited, so don’t waste it living someone else’s life.",
    author: "Steve Jobs",
  },
  {
    text: "Believe you can and you’re halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "It always seems impossible until it’s done.",
    author: "Nelson Mandela",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
];

const showQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, author } = quotes[randomIndex];
  quoteEl.textContent = `“${text}”`;
  authorEl.textContent = `— ${author}`;
};

button.addEventListener("click", showQuote);

showQuote();
