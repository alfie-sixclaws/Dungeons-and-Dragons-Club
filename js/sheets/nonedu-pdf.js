// nonedu-pdf.js - turns a saved 2014 character into a PDF.
//
// How: we load the real, fillable character sheet PDF (assets/templates/),
// type our character's values into its form fields using the pdf-lib library,
// then "flatten" it so the values become part of the page. The result looks
// exactly like the original sheet because it IS the original sheet.
//
// Needs: js/vendor/pdf-lib.min.js, nonedu.js and nonedu-pdf-spells.js loaded first.

const NONEDU_TEMPLATE_URL = "assets/templates/character-sheet-2014.pdf";

// The PDF's own field names (some really do have trailing spaces!)
const PDF_TEXT = {
  characterName: ["CharacterName", "CharacterName 2"],
  background: ["Background"],
  playerName: ["PlayerName"],
  race: ["Race "],
  alignment: ["Alignment"],
  xp: ["XP"],
  ac: ["AC"],
  speed: ["Speed"],
  "hp-max": ["HPMax"],
  "hp-current": ["HPCurrent"],
  "hp-temp": ["HPTemp"],
  "hit-dice": ["HD"],
  personality: ["PersonalityTraits "],
  ideals: ["Ideals"],
  bonds: ["Bonds"],
  flaws: ["Flaws"],
  features: ["Features and Traits"],
  "other-prof": ["ProficienciesLang"],
  equipment: ["Equipment"],
  "attacks-notes": ["AttacksSpellcasting"],
  "coin-cp": ["CP"], "coin-sp": ["SP"], "coin-ep": ["EP"], "coin-gp": ["GP"], "coin-pp": ["PP"],
  // page 2
  age: ["Age"], height: ["Height"], weight: ["Weight"],
  eyes: ["Eyes"], skin: ["Skin"], hair: ["Hair"],
  allies: ["Allies"],
  symbol: ["FactionName"],
  backstory: ["Backstory"],
  "extra-features": ["Feat+Traits"],
  treasure: ["Treasure"],
  // page 3
  "spell-class": ["Spellcasting Class 2"],
};

const PDF_SCORES = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
const PDF_MODS = { str: "STRmod", dex: "DEXmod ", con: "CONmod", int: "INTmod", wis: "WISmod", cha: "CHamod" };

const PDF_SAVES = {   // [text field, checkbox]
  str: ["ST Strength", "Check Box 11"], dex: ["ST Dexterity", "Check Box 18"],
  con: ["ST Constitution", "Check Box 19"], int: ["ST Intelligence", "Check Box 20"],
  wis: ["ST Wisdom", "Check Box 21"], cha: ["ST Charisma", "Check Box 22"],
};

const PDF_SKILLS = {  // [text field, checkbox]
  acrobatics: ["Acrobatics", "Check Box 23"], animalHandling: ["Animal", "Check Box 24"],
  arcana: ["Arcana", "Check Box 25"], athletics: ["Athletics", "Check Box 26"],
  deception: ["Deception ", "Check Box 27"], history: ["History ", "Check Box 28"],
  insight: ["Insight", "Check Box 29"], intimidation: ["Intimidation", "Check Box 30"],
  investigation: ["Investigation ", "Check Box 31"], medicine: ["Medicine", "Check Box 32"],
  nature: ["Nature", "Check Box 33"], perception: ["Perception ", "Check Box 34"],
  performance: ["Performance", "Check Box 35"], persuasion: ["Persuasion", "Check Box 36"],
  religion: ["Religion", "Check Box 37"], sleightOfHand: ["SleightofHand", "Check Box 38"],
  stealth: ["Stealth ", "Check Box 39"], survival: ["Survival", "Check Box 40"],
};

const PDF_ATTACKS = [   // [name, bonus, damage] for attack rows 1-3
  ["Wpn Name", "Wpn1 AtkBonus", "Wpn1 Damage"],
  ["Wpn Name 2", "Wpn2 AtkBonus ", "Wpn2 Damage "],
  ["Wpn Name 3", "Wpn3 AtkBonus  ", "Wpn3 Damage "],
];

const PDF_DEATH = {
  success: ["Check Box 12", "Check Box 13", "Check Box 14"],
  fail: ["Check Box 15", "Check Box 16", "Check Box 17"],
};

const PDF_SLOTS = [null, 19, 20, 21, 22, 23, 24, 25, 26, 27];   // spell level -> field number

// Fields that hold paragraphs get a small fixed font so the text fits the box
const PDF_SMALL_FONT = {
  "PersonalityTraits ": 8, Ideals: 8, Bonds: 8, Flaws: 8, "Features and Traits": 8,
  ProficienciesLang: 8, Equipment: 8, AttacksSpellcasting: 8,
  Allies: 8, Backstory: 8, "Feat+Traits": 8, Treasure: 8,
};

// Removes a field and its on-page widgets by hand. (pdf-lib's own removeField()
// needs every tick box to have artwork for its "off" state, and this PDF's don't.)
function dropField(pdfDoc, form, field) {
  for (const widget of field.acroField.getWidgets()) {
    const ref = pdfDoc.context.getObjectRef(widget.dict);
    if (ref) form.findWidgetPage(widget).node.removeAnnot(ref);
  }
  form.acroForm.removeField(field.acroField);
}

async function buildNoneduPdf(character) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const data = character.data;
  const calc = computeCalc(data);
  const auto = data.autoCalc !== false;
  // the number shown on the sheet: calculated, or the user's own if they unticked auto
  const shown = (key) => auto ? calc[key] : (data["calc-" + key] ?? calc[key]);

  const response = await fetch(NONEDU_TEMPLATE_URL);
  if (!response.ok) throw new Error("Could not load the PDF template (" + response.status + ")");
  const pdfDoc = await PDFDocument.load(await response.arrayBuffer());
  const form = pdfDoc.getForm();

  // We measure text with the same font the PDF uses (Helvetica) to make it fit.
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const truncated = [];      // boxes whose text had to be shortened

  const setText = (name, value) => {
    if (value === undefined || value === null || value === "") return;
    const field = form.getTextField(name);
    const text = pdfSafe(value);
    const { width, height } = field.acroField.getWidgets()[0].getRectangle();
    const w = width - 4, h = height - 2;

    // Set the font ourselves: pdf-lib's setFontSize() refuses fields that inherit
    // their font from the form instead of having their own entry.
    const useFit = (maxSize, minSize) => {
      const fit = fitText(helvetica, text, w, h, maxSize, minSize);
      if (fit.truncated) truncated.push(name.trim());
      if (!field.isMultiline()) field.enableMultiline();     // lets the text wrap onto more lines
      field.acroField.setDefaultAppearance(`/Helv ${fit.size} Tf 0 g`);
      field.setText(fit.lines.join("\n"));
    };

    if (PDF_SMALL_FONT[name]) {
      useFit(PDF_SMALL_FONT[name], 5.5);                     // paragraph boxes: wrap and shrink to fit
    } else if (!field.isMultiline() && helvetica.widthOfTextAtSize(text, 7) > w) {
      useFit(9, 5.5);                                        // too wide for one line: wrap it
    } else {
      field.setText(text);                                   // fits on one line: let the PDF size it
    }
  };
  const setCheck = (name, on) => { if (on) form.getCheckBox(name).check(); };

  // ----- page 1 -----
  for (const [key, names] of Object.entries(PDF_TEXT)) {
    const value = key === "characterName" ? character.name || data.characterName : data[key];
    for (const n of names) setText(n, value);
  }
  setText("ClassLevel", [data.class, data.level].filter(Boolean).join(" "));
  setText("Inspiration", data.inspiration ? "Yes" : "");
  setText("ProfBonus", shown("prof"));
  setText("Initiative", shown("initiative"));
  setText("Passive", shown("passive"));

  for (const k in PDF_SCORES) {
    setText(PDF_SCORES[k], data["score-" + k]);
    setText(PDF_MODS[k], shown("mod-" + k));
    setText(PDF_SAVES[k][0], shown("save-" + k));
    setCheck(PDF_SAVES[k][1], data["prof-save-" + k]);
  }
  for (const k in PDF_SKILLS) {
    setText(PDF_SKILLS[k][0], shown("skill-" + k));
    setCheck(PDF_SKILLS[k][1], data["prof-skill-" + k]);
  }
  PDF_ATTACKS.forEach(([nameF, bonusF, dmgF], i) => {
    setText(nameF, data[`atk-${i + 1}-name`]);
    setText(bonusF, data[`atk-${i + 1}-bonus`]);
    setText(dmgF, data[`atk-${i + 1}-damage`]);
  });
  for (const kind in PDF_DEATH) {
    PDF_DEATH[kind].forEach((box, i) => setCheck(box, data[`death-${kind}-${i + 1}`]));
  }

  // ----- page 3: spells -----
  if (character.hasSpellSheet) {
    const ability = data["spell-ability"];
    setText("SpellcastingAbility 2", ability ? ability.toUpperCase() : "");
    setText("SpellSaveDC  2", shown("spellDC"));
    setText("SpellAtkBonus 2", shown("spellAtk"));

    for (let lvl = 0; lvl <= 9; lvl++) {
      const { names, prepared } = NONEDU_PDF_SPELLS[lvl];
      names.forEach((fieldName, i) => setText(fieldName, data[`spell-${lvl}-${i + 1}-name`]));
      prepared.forEach((boxName, i) => setCheck(boxName, data[`spell-${lvl}-${i + 1}-prepared`]));
      if (lvl > 0) {
        setText("SlotsTotal " + PDF_SLOTS[lvl], data[`slots-${lvl}-total`]);
        setText("SlotsRemaining " + PDF_SLOTS[lvl], data[`slots-${lvl}-used`]);
      }
    }
  }

  // ----- flatten: turn the typed fields into permanent page content -----
  // The picture buttons have nothing to show, so remove them too.
  for (const f of form.getFields()) {
    if (f instanceof PDFLib.PDFButton) dropField(pdfDoc, form, f);
  }
  // Un-ticked tick boxes are removed. The sheet already has its own circles
  // printed on the page, and pdf-lib would draw ugly squares over them.
  for (const f of form.getFields()) {
    if (f instanceof PDFLib.PDFCheckBox && !f.isChecked()) dropField(pdfDoc, form, f);
  }
  form.updateFieldAppearances(helvetica);
  form.flatten();

  // The PDF has no text box for "character appearance" (it expects a picture),
  // so we write our text into that area of page 2 ourselves.
  if (data.appearance) {
    // the box runs from about y=428 to y=666 on the page, x=40 to x=200
    const fit = fitText(helvetica, pdfSafe(data.appearance), 160, 225, 8, 5.5);
    if (fit.truncated) truncated.push("appearance");
    fit.lines.forEach((line, i) => {
      pdfDoc.getPage(1).drawText(line, {
        x: 40, y: 660 - fit.size * 0.85 - i * fit.size * LINE_HEIGHT, size: fit.size, font: helvetica, color: rgb(0, 0, 0),
      });
    });
  }

  // No spell sheet? Drop page 3.
  if (!character.hasSpellSheet) pdfDoc.removePage(2);

  const bytes = await pdfDoc.save();      // the finished PDF as bytes
  bytes.truncated = truncated;            // savePdfFile warns the user about these
  return bytes;
}

// Builds the PDF and makes the browser download it
async function downloadCharacterPdf(character) {
  savePdfFile(await buildNoneduPdf(character), character);
}

// Tell the engine this sheet can export
SHEETS.nonedu.exportPdf = downloadCharacterPdf;
