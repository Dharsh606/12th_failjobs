const LANG_KEY = "failjob_lang";
let T = {}; // translations in memory

function getLang() {
  return localStorage.getItem(LANG_KEY) || "en";
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  location.reload();
}

async function loadLang() {
  const lang = getLang();
  try {
    const res = await fetch(`i18n/${lang}.json`);
    T = await res.json();
  } catch {
    const res = await fetch(`i18n/en.json`);
    T = await res.json();
  }
}

function t(key) {
  return T[key] || key;
}

// Apply translations to elements having data-i18n="key"
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key));
  });
}