// new-character.js - the "pick a sheet" page

const choicesEl = document.getElementById("sheet-choices");
const spellOption = document.getElementById("spell-option");
const spellCheckbox = document.getElementById("spell-sheet");
const form = document.getElementById("new-character-form");

// Build one card per sheet type. Each card is a <label> wrapping a radio
// button, so clicking anywhere on the card selects it.
for (const [key, info] of Object.entries(SHEET_TYPES)) {
  const label = document.createElement("label");
  label.className = "sheet-card" + (info.available ? "" : " disabled");
  label.style.setProperty("--type-color", info.color);   // the card's colour (used by the CSS)

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "sheetType";     // same name = only one can be selected
  radio.value = key;
  radio.disabled = !info.available;
  radio.checked = key === "nonedu";

  const title = document.createElement("strong");
  title.textContent = info.label;
  const desc = document.createElement("small");
  desc.textContent = info.available ? info.description : "Coming soon";

  label.append(radio, title, document.createElement("br"), desc);
  choicesEl.append(label);
}

function selectedType() {
  return form.elements.sheetType.value;
}

// Show the spell sheet question only if the chosen sheet allows it
function updateSpellOption() {
  spellOption.hidden = !SHEET_TYPES[selectedType()]?.canHaveSpellSheet;
}
choicesEl.addEventListener("change", updateSpellOption);
updateSpellOption();

form.addEventListener("submit", (event) => {
  event.preventDefault();       // stop the browser reloading the page

  const type = selectedType();
  const character = {
    id: newId(),
    name: "",
    sheetType: type,
    hasSpellSheet: SHEET_TYPES[type].canHaveSpellSheet && spellCheckbox.checked,
    data: {},                   // every field on the sheet gets saved in here
  };
  saveCharacter(character);

  // Go to the sheet editor for this new character
  location.href = "sheet.html?id=" + encodeURIComponent(character.id);
});
