// sheet.js - the generic sheet engine. It knows nothing about D&D rules.
// Its job: load a character, ask the right sheet type to draw itself,
// fill the boxes with saved values, and save whenever something changes.
//
// Conventions every sheet follows:
//   data-field="x"  on an <input>/<textarea>  ->  saved as character.data.x
//   data-calc="y"   on any element            ->  filled in by the sheet's recalc()

const root = document.getElementById("sheet-root");
const statusEl = document.getElementById("save-status");
const toolbar = document.getElementById("sheet-toolbar");
const exportBtn = document.getElementById("export-btn");

function showMessage(text) {
  root.innerHTML = "";
  const p = document.createElement("p");
  p.className = "empty-message";
  p.textContent = text + " ";
  const back = document.createElement("a");
  back.href = "characters.html";
  back.textContent = "Back to your characters";
  p.append(back);
  root.append(p);
}

const id = new URLSearchParams(location.search).get("id");
const character = id ? getCharacter(id) : null;
const sheet = character ? SHEETS[character.sheetType] : null;

if (!character) {
  showMessage("We couldn't find that character.");
} else if (!sheet) {
  showMessage("This sheet type isn't built yet.");
} else {
  start();
}

function start() {
  sheet.render(root, character);          // 1. the sheet draws its boxes
  setUpToolbar();

  // 2. put saved values into the boxes
  const fields = root.querySelectorAll("[data-field]");
  for (const el of fields) {
    const saved = character.data[el.dataset.field];
    if (el.type === "checkbox") {
      // data-default="true" means "ticked until the user unticks it"
      el.checked = saved === undefined ? el.dataset.default === "true" : !!saved;
    }
    else if (saved !== undefined) el.value = saved;
  }
  sheet.recalc(root, character.data);

  // 3. whenever anything is typed or ticked, save it
  root.addEventListener("input", (event) => {
    const el = event.target;
    if (!el.dataset.field) return;

    character.data[el.dataset.field] = el.type === "checkbox" ? el.checked : el.value;
    // keep the name shown on the characters list in step with the sheet
    if (sheet.nameField && el.dataset.field === sheet.nameField) {
      character.name = el.value;
    }
    sheet.recalc(root, character.data);   // recalc first: it may add values to data
    saveCharacter(character);

    statusEl.textContent = "Saved ✓";
  });
}

// The toolbar's Export PDF button. Only sheet types that can export get a working one.
function setUpToolbar() {
  toolbar.hidden = false;

  if (typeof sheet.exportPdf !== "function") {
    exportBtn.disabled = true;
    exportBtn.title = "PDF export isn't available for this sheet yet";
    return;
  }

  exportBtn.addEventListener("click", async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = "Exporting...";
    try {
      await sheet.exportPdf(character);   // uses the latest saved data
    } catch (err) {
      console.error(err);
      alert("Sorry, the PDF export failed: " + err.message);
    }
    exportBtn.textContent = "Export PDF";
    exportBtn.disabled = false;
  });
}
