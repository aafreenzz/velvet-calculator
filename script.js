const expressionEl = document.querySelector('#expression');
const resultEl = document.querySelector('#result');
const statusEl = document.querySelector('#status');
const keypad = document.querySelector('.keypad');

let current = '0';
let stored = null;
let operator = null;
let waitingForNext = false;
let expression = '';

const symbols = { '+': '+', '−': '−', '×': '×', '÷': '÷' };

function render() {
  resultEl.textContent = current;
  expressionEl.textContent = expression || '\u00a0';
}

function setStatus(message) {
  statusEl.textContent = message;
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return 'Error';
  const rounded = Number.parseFloat(number.toPrecision(11));
  return String(rounded);
}

function inputDigit(digit) {
  if (current === 'Error' || waitingForNext) {
    current = digit === '.' ? '0.' : digit;
    waitingForNext = false;
    return;
  }
  if (digit === '.') {
    if (!current.includes('.')) current += '.';
  } else if (current === '0') {
    current = digit;
  } else if (current.replace('-', '').replace('.', '').length < 13) {
    current += digit;
  }
}

function chooseOperator(nextOperator) {
  if (current === 'Error') return;
  const inputValue = Number(current);
  if (operator && !waitingForNext) {
    const result = calculate(stored, inputValue, operator);
    current = formatNumber(result);
    stored = result;
  } else {
    stored = inputValue;
  }
  operator = nextOperator;
  waitingForNext = true;
  expression = `${formatNumber(stored)} ${symbols[operator]}`;
  setStatus('Choose the next number');
}

function calculate(a, b, op) {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b === 0 ? NaN : a / b;
  return b;
}

function equals() {
  if (!operator || stored === null || current === 'Error') return;
  const first = stored;
  const second = Number(current);
  const result = calculate(first, second, operator);
  expression = `${formatNumber(first)} ${symbols[operator]} ${formatNumber(second)} =`;
  current = formatNumber(result);
  stored = null;
  operator = null;
  waitingForNext = true;
  setStatus(current === 'Error' ? 'Cannot divide by zero' : 'Nicely calculated ✦');
}

function clearAll() {
  current = '0'; stored = null; operator = null;
  waitingForNext = false; expression = '';
  setStatus('Ready when you are');
}

function changeSign() {
  if (current !== '0' && current !== 'Error') current = current.startsWith('-') ? current.slice(1) : `-${current}`;
}

function percent() {
  if (current !== 'Error') {
    current = formatNumber(Number(current) / 100);
    setStatus('Converted to percent');
  }
}

function backspace() {
  if (waitingForNext || current === 'Error') return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  if (current === '-') current = '0';
}

function handleAction(action) {
  if (action === 'clear') clearAll();
  if (action === 'sign') changeSign();
  if (action === 'percent') percent();
  if (action === 'backspace') backspace();
  if (action === 'equals') equals();
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value !== undefined) {
    const value = button.dataset.value;
    if (['+', '−', '×', '÷'].includes(value)) chooseOperator(value);
    else inputDigit(value);
  } else {
    handleAction(button.dataset.action);
  }
  render();
});

document.addEventListener('keydown', (event) => {
  const keyMap = { '*': '×', '/': '÷', '-': '−', Enter: 'equals', '=': 'equals', Escape: 'clear', Backspace: 'backspace', '%': 'percent' };
  if (/^[0-9.]$/.test(event.key)) inputDigit(event.key);
  else if (['+', '-', '*', '/'].includes(event.key)) chooseOperator(keyMap[event.key]);
  else if (keyMap[event.key] === 'equals') equals();
  else if (keyMap[event.key] === 'clear') clearAll();
  else if (keyMap[event.key] === 'backspace') backspace();
  else if (keyMap[event.key] === 'percent') percent();
  else return;
  event.preventDefault();
  render();
});

render();
