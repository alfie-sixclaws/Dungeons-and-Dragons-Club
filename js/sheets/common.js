// common.js - pieces shared by every character sheet type (2014 and 2024).
// Load this BEFORE nonedu.js / edu.js.

const ABILITIES = [
  ["str", "Strength"],
  ["dex", "Dexterity"],
  ["con", "Constitution"],
  ["int", "Intelligence"],
  ["wis", "Wisdom"],
  ["cha", "Charisma"],
];

// [field key, label, which ability it uses]
const SKILLS = [
  ["acrobatics", "Acrobatics", "dex"],
  ["animalHandling", "Animal Handling", "wis"],
  ["arcana", "Arcana", "int"],
  ["athletics", "Athletics", "str"],
  ["deception", "Deception", "cha"],
  ["history", "History", "int"],
  ["insight", "Insight", "wis"],
  ["intimidation", "Intimidation", "cha"],
  ["investigation", "Investigation", "int"],
  ["medicine", "Medicine", "wis"],
  ["nature", "Nature", "int"],
  ["perception", "Perception", "wis"],
  ["performance", "Performance", "cha"],
  ["persuasion", "Persuasion", "cha"],
  ["religion", "Religion", "int"],
  ["sleightOfHand", "Sleight of Hand", "dex"],
  ["stealth", "Stealth", "dex"],
  ["survival", "Survival", "wis"],
];

// ---- small helpers that build HTML text for us ----

// A labelled text/number box
function box(label, key, type = "text", extra = "") {
  return `<label class="field ${extra}"><span>${label}</span>
            <input type="${type}" data-field="${key}"></label>`;
}

// A big writing area
function area(label, key, extra = "") {
  return `<label class="area ${extra}"><span>${label}</span>
            <textarea data-field="${key}"></textarea></label>`;
}

// A tick box with a number that gets calculated (used for saves and skills)
function profRow(key, label, calcKey, hint = "") {
  return `<label class="prof-row">
            <input type="checkbox" data-field="prof-${key}">
            <input class="calc prof-value" data-calc="${calcKey}" data-field="calc-${calcKey}" aria-label="${label} bonus">
            <span class="prof-label">${label} <small>${hint}</small></span>
          </label>`;
}

// ---- the maths ----

function modifier(score) {
  return Math.floor((score - 10) / 2);
}

function signed(n) {                 // 3 -> "+3", -1 -> "-1"
  return (n >= 0 ? "+" : "") + n;
}

function profBonus(level) {
  const l = Math.min(Math.max(level, 1), 20);
  return 2 + Math.floor((l - 1) / 4);
}

// Works out every automatic number for a character's data and returns them
// in an object like { "mod-str": "+3", prof: "+2", ... }.
// Lives outside the sheet so the PDF export can use it too.
function computeCalc(data) {
  const num = (v, fallback) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : n;
  };
  const level = num(data.level, 1);
  const pb = profBonus(level);
  const calc = { prof: signed(pb) };

  const mods = {};
  for (const [k] of ABILITIES) {
    mods[k] = modifier(num(data["score-" + k], 10));
    calc["mod-" + k] = signed(mods[k]);
    calc["save-" + k] = signed(mods[k] + (data["prof-save-" + k] ? pb : 0));
  }
  for (const [k, , ab] of SKILLS) {
    calc["skill-" + k] = signed(mods[ab] + (data["prof-skill-" + k] ? pb : 0));
  }
  // Spellcasting: DC = 8 + proficiency + ability modifier; attack = proficiency + modifier
  const sa = data["spell-ability"];
  calc.spellDC = sa ? String(8 + pb + mods[sa]) : "";
  calc.spellAtk = sa ? signed(pb + mods[sa]) : "";
  calc.spellMod = sa ? signed(mods[sa]) : "";
  calc.initiative = signed(mods.dex);
  calc.passive = String(10 + mods.wis + (data["prof-skill-perception"] ? pb : 0));
  return calc;
}

// ---- shared sheet behaviour ----

// Show every automatic number in its data-calc box.
//  - auto-calculate ON : boxes are locked and show the computed value
//  - auto-calculate OFF: boxes are unlocked and show whatever the user typed
function recalcSheet(root, data) {
  const calc = computeCalc(data);
  const auto = data.autoCalc !== false;      // on unless explicitly unticked

  // Just switched from auto to manual? Keep the numbers on screen as the
  // starting point for the user to edit.
  if (root._wasAuto === true && !auto) {
    for (const key in calc) data["calc-" + key] = calc[key];
  }
  root._wasAuto = auto;

  for (const el of root.querySelectorAll("[data-calc]")) {
    const key = el.dataset.calc;
    el.readOnly = auto;
    if (auto) {
      el.value = calc[key];
    } else if (el !== document.activeElement) {   // don't overwrite while typing
      el.value = data["calc-" + key] ?? calc[key];
    }
  }
}

// Clicking a tab shows its page and hides the others.
// (Typing is saved by the engine whether or not the page is showing.)
function setUpTabs(root) {
  const pages = root.querySelectorAll(".page");
  const tabs = root.querySelectorAll(".tab");
  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      for (const t of tabs) t.classList.toggle("active", t === tab);
      for (const pg of pages) pg.hidden = pg.dataset.page !== tab.dataset.tab;
    });
  }
}

// ---- shared PDF export helpers ----

// The PDF fonts can only print standard Latin characters. Swap fancy ones for
// plain ones and turn anything else (emoji etc.) into "?" so export never crashes.
function pdfSafe(value) {
  return String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/gu, "?");
}

// Makes the browser download finished PDF bytes, named after the character.
function savePdfFile(bytes, character) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (character.name || "character").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "character";
  a.download = safeName + ".pdf";
  a.click();
  URL.revokeObjectURL(url);
  if (bytes.truncated && bytes.truncated.length) {
    alert("Your PDF was saved, but some long text did not fit its box and was shortened with '...':\n\n" +
          bytes.truncated.join("\n"));
  }
}

// Breaks text into lines no wider than maxWidth. Respects the user's own line
// breaks, and chops any single word that is wider than the box.
function wrapToWidth(font, text, size, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      let w = word;
      // a word wider than the whole box: split it into pieces that fit
      while (font.widthOfTextAtSize(w, size) > maxWidth && w.length > 1) {
        let cut = w.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > maxWidth) cut--;
        if (line) { lines.push(line); line = ""; }
        lines.push(w.slice(0, cut));
        w = w.slice(cut);
      }
      const attempt = line ? line + " " + w : w;
      if (!line || font.widthOfTextAtSize(attempt, size) <= maxWidth) line = attempt;
      else { lines.push(line); line = w; }
    }
    lines.push(line);
  }
  return lines;
}

// Fits text into a box of w x h points. Picks the LARGEST font size (from maxSize
// down to minSize) at which the wrapped text fits. If it will not fit even at
// minSize, keeps what fits and ends the last line with "..." so nothing overflows.
// Returns { size, lines, truncated }.
const LINE_HEIGHT = 1.15;
function fitText(font, text, w, h, maxSize, minSize) {
  for (let size = maxSize; size >= minSize; size -= 0.5) {
    const lines = wrapToWidth(font, text, size, w);
    if (lines.length * size * LINE_HEIGHT <= h + 0.01) return { size, lines, truncated: false };
  }
  const size = minSize;
  const maxLines = Math.max(1, Math.floor(h / (size * LINE_HEIGHT)));
  const lines = wrapToWidth(font, text, size, w).slice(0, maxLines);
  let last = lines[lines.length - 1];
  while (last.length > 0 && font.widthOfTextAtSize(last + "...", size) > w) last = last.slice(0, -1);
  lines[lines.length - 1] = last + "...";
  return { size, lines, truncated: true };
}

// savePdfFile also tells the user if any long text had to be shortened to fit.
