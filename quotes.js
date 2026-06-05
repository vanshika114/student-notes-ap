/**
 * quotes.js
 * Manages motivational quotes — local array, random selection,
 * and DOM rendering. Called by app.js on load and pomodoro.js
 * on session transitions.
 */

const Quotes = (() => {
  const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
    { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
    { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
    { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell" },
    { text: "Excellence is not a destination but a continuous journey.", author: "Brian Tracy" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "It's not about having time, it's about making time.", author: "Unknown" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Augusta F. Kantra" },
    { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
    { text: "The secret to success is to start before you are ready.", author: "Marie Forleo" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  ];

  let lastIndex = -1;

  function getRandom() {
    let idx;
    do { idx = Math.floor(Math.random() * QUOTES.length); } while (idx === lastIndex);
    lastIndex = idx;
    return QUOTES[idx];
  }

  function display() {
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    if (!textEl || !authorEl) return;
    const quote = getRandom();
    textEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = `"${quote.text}"`;
      authorEl.textContent = `— ${quote.author}`;
      textEl.style.opacity = '1';
      authorEl.style.opacity = '1';
    }, 300);
  }

  function getAll() { return [...QUOTES]; }

  return { display, getRandom, getAll };
})();
