const replacements = {
  'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v', 'Г': 'Q', 'г': 'q', 'Ґ': 'G', 'ґ': 'g',
  'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e', 'Є': 'Je', 'є': 'je', 'Ж': 'X', 'ж': 'x', 'З': 'Z', 'з': 'z',
  'И': 'Y', 'и': 'y', 'І': 'I', 'і': 'i', 'Ї': 'Ji', 'ї': 'ji', 'Й': 'J', 'й': 'j', 'К': 'K', 'к': 'k',
  'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p',
  'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u', 'Ф': 'F', 'ф': 'f',
  'Х': 'H', 'х': 'h', 'Ц': 'Ts', 'ц': 'ts', 'Ч': 'Tc', 'ч': 'tc', 'Ш': 'C', 'ш': 'c', 'Щ': 'Ctc', 'щ': 'ctc',
  'Ю': 'Ju', 'ю': 'ju', 'Я': 'Ja', 'я': 'ja', 'Ь': 'J', 'ь': 'j'
};

const inputBox = document.getElementById('input');
const outputBox = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const copyFeedback = document.getElementById('copyFeedback');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const closeRules = document.getElementById('closeRules');
const rulesGrid = document.getElementById('rulesGrid');
const clearBtn = document.getElementById('clearBtn');
const charCount = document.getElementById('charCount');

function populateRules() {
  const arr = Object.entries(replacements).sort((a, b) => a[0].localeCompare(b[0], 'uk'));
  rulesGrid.innerHTML = arr.map(([from, to]) => `
    <div class="rule-item">
      <span class="from">${from}</span>
      <span class="arrow">→</span>
      <span class="to">${to}</span>
    </div>
  `).join('');
}
populateRules();

function transliterate(text) {
  return [...text].map(ch => replacements[ch] ?? ch).join('');
}

function pluralize(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return '';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'и';
  return 'ів';
}

function updateOutput() {
  const translit = transliterate(inputBox.value);
  outputBox.value = translit;
  copyBtn.disabled = !translit;
  const len = inputBox.value.length;
  charCount.textContent = len + ' символ' + pluralize(len);
  charCount.classList.toggle('has-text', len > 0);
}

inputBox.addEventListener('input', updateOutput);

clearBtn.addEventListener('click', () => {
  inputBox.value = '';
  updateOutput();
  inputBox.focus();
});

copyBtn.addEventListener('click', async () => {
  let copied = false;
  try {
    await navigator.clipboard.writeText(outputBox.value);
    copied = true;
  } catch {
    try {
      outputBox.select();
      copied = document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
    } catch {
      copied = false;
    }
  }
  if (copied) {
    copyFeedback.classList.add('show');
    setTimeout(() => copyFeedback.classList.remove('show'), 1600);
  }
});

let lastFocused = null;

function getFocusables() {
  return rulesModal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
}

function openModal() {
  lastFocused = document.activeElement;
  rulesModal.classList.add('show');
  rulesBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  closeRules.focus();
}

function closeModal() {
  rulesModal.classList.remove('show');
  rulesBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (lastFocused && typeof lastFocused.focus === 'function') {
    lastFocused.focus();
  }
}

rulesBtn.addEventListener('click', openModal);
closeRules.addEventListener('click', closeModal);
rulesModal.addEventListener('click', (e) => {
  if (e.target === rulesModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (!rulesModal.classList.contains('show')) return;
  if (e.key === 'Escape') {
    closeModal();
    return;
  }
  if (e.key !== 'Tab') return;
  const focusables = getFocusables();
  if (focusables.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (!rulesModal.contains(active)) {
    e.preventDefault();
    first.focus();
    return;
  }
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
});
