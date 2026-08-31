const display = document.getElementById("display");
const history = document.getElementById("history");
const keys = document.querySelector(".keys");

let current = "0";
let previous = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

function render() {
  display.textContent = current;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function calculate(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? null : a / b;
  return b;
}

function reset() {
  current = "0";
  previous = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;
  history.textContent = "";
  render();
}

function inputDigit(digit) {
  if (current === "Error" || waitingForOperand || justCalculated) {
    current = digit;
    waitingForOperand = false;
    justCalculated = false;
  } else {
    current = current === "0" ? digit : current + digit;
  }
  render();
}

function inputDecimal() {
  if (current === "Error" || waitingForOperand || justCalculated) {
    current = "0.";
    waitingForOperand = false;
    justCalculated = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  render();
}

function chooseOperator(nextOperator) {
  if (current === "Error") return reset();

  const inputValue = Number(current);

  if (operator && waitingForOperand) {
    operator = nextOperator;
    history.textContent = `${formatNumber(previous)} ${operator}`;
    return;
  }

  if (previous === null) {
    previous = inputValue;
  } else if (operator) {
    const result = calculate(previous, inputValue, operator);
    if (result === null) {
      current = "Error";
      history.textContent = "Cannot divide by zero";
      previous = null;
      operator = null;
      waitingForOperand = true;
      render();
      return;
    }
    current = formatNumber(result);
    previous = result;
  }

  operator = nextOperator;
  waitingForOperand = true;
  justCalculated = false;
  history.textContent = `${formatNumber(previous)} ${nextOperator}`;
  render();
}

function equals() {
  if (operator === null || previous === null || current === "Error") return;

  const a = previous;
  const b = Number(current);
  const result = calculate(a, b, operator);

  if (result === null) {
    current = "Error";
    history.textContent = "Cannot divide by zero";
  } else {
    history.textContent = `${formatNumber(a)} ${operator} ${formatNumber(b)} =`;
    current = formatNumber(result);
  }

  previous = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = true;
  render();
}

function backspace() {
  if (waitingForOperand || justCalculated || current === "Error") return reset();
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  render();
}

function percent() {
  if (current === "Error") return reset();
  current = formatNumber(Number(current) / 100);
  render();
}

function handleAction(action) {
  if (action === "clear") reset();
  else if (action === "backspace") backspace();
  else if (action === "decimal") inputDecimal();
  else if (action === "percent") percent();
  else if (action === "equals") equals();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.value !== undefined) {
    const value = button.dataset.value;
    if (/^[0-9]$/.test(value)) inputDigit(value);
    else chooseOperator(value);
  } else {
    handleAction(button.dataset.action);
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(key)) {
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "%" ) {
    percent();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    reset();
  }
});

reset();
