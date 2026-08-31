"use strict";

const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const keypad = document.querySelector(".keypad");
const operators = ["+", "-", "*", "/"];
let expression = "";
let justCalculated = false;

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  return Number.parseFloat(value.toFixed(10)).toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function updateDisplay(preview = "0") {
  expressionEl.textContent = expression || "0";
  resultEl.textContent = preview;
}

function calculateExpression(input) {
  const tokens = input.match(/(\d*\.?\d+|[+\-*/])/g);
  if (!tokens || tokens.join("") !== input || operators.includes(tokens.at(-1))) return null;

  const values = [Number(tokens[0])];
  const pendingOperators = [];
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const number = Number(tokens[index + 1]);
    if (operator === "*" || operator === "/") {
      const last = values.pop();
      if (operator === "/" && number === 0) return "Error";
      values.push(operator === "*" ? last * number : last / number);
    } else {
      pendingOperators.push(operator);
      values.push(number);
    }
  }
  return values.slice(1).reduce((total, value, index) => pendingOperators[index] === "+" ? total + value : total - value, values[0]);
}

function appendValue(value) {
  if (justCalculated && !operators.includes(value)) expression = "";
  justCalculated = false;

  const lastChar = expression.at(-1);
  if (operators.includes(value)) {
    if (!expression) return;
    expression = operators.includes(lastChar) ? expression.slice(0, -1) + value : expression + value;
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).at(-1);
    if (!currentNumber.includes(".")) expression += currentNumber ? "." : "0.";
  } else {
    expression += value;
  }
  updateDisplay();
}

function calculate() {
  const answer = calculateExpression(expression);
  if (answer === null) return;
  const displayValue = answer === "Error" ? "Error" : formatNumber(answer);
  updateDisplay(displayValue);
  if (answer !== "Error") expression = String(answer);
  justCalculated = true;
}

function handleAction(action) {
  if (action === "clear") { expression = ""; justCalculated = false; updateDisplay(); }
  if (action === "delete") { expression = expression.slice(0, -1); justCalculated = false; updateDisplay(); }
  if (action === "calculate") calculate();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action) handleAction(button.dataset.action);
  else if (button.dataset.value === "%") {
    const number = expression.split(/[+\-*/]/).at(-1);
    if (number) expression = expression.slice(0, -number.length) + String(Number(number) / 100);
    updateDisplay();
  } else appendValue(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.+\-*/]$/.test(event.key)) { event.preventDefault(); appendValue(event.key); }
  if (event.key === "Enter" || event.key === "=") { event.preventDefault(); calculate(); }
  if (event.key === "Backspace") { event.preventDefault(); handleAction("delete"); }
  if (event.key === "Escape") handleAction("clear");
  if (event.key === "%") document.querySelector('[data-value="%"]').click();
});
