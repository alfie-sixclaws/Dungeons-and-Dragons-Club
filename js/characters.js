// characters.js - draws the list of saved characters on characters.html

const listEl = document.getElementById("character-list");
const emptyEl = document.getElementById("empty-message");

function renderCharacters() {
  const characters = loadCharacters();

  listEl.innerHTML = "";                       // clear the list first
  emptyEl.hidden = characters.length > 0;      // only show the message if empty

  for (const c of characters) {
    const li = document.createElement("li");
    li.className = "character-card";
    // colour-code each card by its sheet type
    const typeColor = SHEET_TYPES[c.sheetType]?.color;
    if (typeColor) li.style.setProperty("--type-color", typeColor);

    const info = document.createElement("div");
    // textContent (not innerHTML) is important: it treats names as plain
    // text, so nobody can sneak HTML or code into a character name.
    const name = document.createElement("strong");
    name.textContent = c.name || "Unnamed character";
    const type = document.createElement("small");
    type.textContent = SHEET_TYPES[c.sheetType]?.label || "";
    info.append(name, document.createElement("br"), type);

    // Link to the editor page (built in a later step), passing the id in the URL
    const edit = document.createElement("a");
    edit.href = "sheet.html?id=" + encodeURIComponent(c.id);
    edit.textContent = "Open";

    // Export to PDF. Only sheet types that know how (have exportPdf) can do it.
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export PDF";
    const canExport = typeof SHEETS[c.sheetType]?.exportPdf === "function";
    if (!canExport) {
      exportBtn.disabled = true;
      exportBtn.title = "PDF export isn't available for this sheet yet";
    }
    exportBtn.addEventListener("click", async () => {
      exportBtn.disabled = true;
      exportBtn.textContent = "Exporting...";
      try {
        await SHEETS[c.sheetType].exportPdf(c);
      } catch (err) {
        console.error(err);
        alert("Sorry, the PDF export failed: " + err.message);
      }
      exportBtn.textContent = "Export PDF";
      exportBtn.disabled = false;
    });

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      if (confirm('Delete "' + (c.name || "Unnamed character") + '"?')) {
        deleteCharacter(c.id);
        renderCharacters();                    // redraw the list
      }
    });

    li.append(info, edit, exportBtn, del);
    listEl.append(li);
  }
}

renderCharacters();
