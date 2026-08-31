const SYMBOLS = ["🍎","🚀","🎮","⚡","🐼","🎵","🌟","🧩"];

const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("newGame");
const modal = document.getElementById("winModal");
const winText = document.getElementById("winText");
const playAgainBtn = document.getElementById("playAgain");

let first = null;
let second = null;
let locked = false;
let moves = 0;
let pairs = 0;
let seconds = 0;
let score = 1000;
let timer = null;
let started = false;

let best = Number(sessionStorage.getItem("memoryBestScore")) || 0;
bestEl.textContent = best ? best : "—";

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function formatTime(value) {
  const m = Math.floor(value / 60).toString().padStart(2, "0");
  const s = (value % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function calculateScore() {
  return Math.max(0, 1000 - seconds * 3 - Math.max(0, moves - 8) * 20);
}

function updateStats() {
  score = calculateScore();
  movesEl.textContent = moves;
  timerEl.textContent = formatTime(seconds);
  scoreEl.textContent = score;
  bestEl.textContent = best || "—";
}

function startTimer() {
  if (timer !== null) return;
  timer = setInterval(() => {
    seconds += 1;
    updateStats();
  }, 1000);
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function makeCard(symbol) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card";
  button.dataset.symbol = symbol;
  button.setAttribute("aria-label", "Hidden card");
  button.innerHTML = `
    <span class="inner">
      <span class="face back" aria-hidden="true"></span>
      <span class="face front" aria-hidden="true">${symbol}</span>
    </span>`;
  button.addEventListener("click", () => flipCard(button));
  return button;
}

function flipCard(card) {
  if (locked || card === first || card.classList.contains("matched") || card.classList.contains("flipped")) return;

  if (!started) {
    started = true;
    startTimer();
  }

  card.classList.add("flipped");
  card.setAttribute("aria-label", `Card showing ${card.dataset.symbol}`);

  if (!first) {
    first = card;
    return;
  }

  second = card;
  moves += 1;
  updateStats();

  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add("matched");
    second.classList.add("matched");
    first.disabled = true;
    second.disabled = true;
    pairs += 1;
    statusEl.textContent = `Match found! ${pairs} of 8 pairs completed.`;
    resetTurn();

    if (pairs === SYMBOLS.length) finish();
  } else {
    locked = true;
    statusEl.textContent = "Not a match. Try again.";
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      first.setAttribute("aria-label", "Hidden card");
      second.setAttribute("aria-label", "Hidden card");
      resetTurn();
    }, 700);
  }
}

function resetTurn() {
  first = null;
  second = null;
  locked = false;
}

function finish() {
  stopTimer();
  score = calculateScore();

  if (score > best) {
    best = score;
    sessionStorage.setItem("memoryBestScore", String(best));
  }

  updateStats();
  statusEl.textContent = "All pairs matched!";
  winText.textContent = `Completed in ${moves} moves and ${formatTime(seconds)} with a score of ${score}.`;
  modal.classList.remove("hidden");
}

function newGame() {
  stopTimer();
  first = null;
  second = null;
  locked = false;
  moves = 0;
  pairs = 0;
  seconds = 0;
  score = 1000;
  started = false;

  modal.classList.add("hidden");
  board.replaceChildren();

  shuffle([...SYMBOLS, ...SYMBOLS]).forEach(symbol => {
    board.appendChild(makeCard(symbol));
  });

  statusEl.textContent = "Find all 8 pairs.";
  updateStats();
}

newGameBtn.addEventListener("click", newGame);
playAgainBtn.addEventListener("click", newGame);
newGame();
