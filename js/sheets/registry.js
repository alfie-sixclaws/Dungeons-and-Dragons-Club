// registry.js - the list of every sheet type the site knows about.
//
// To add another sheet type:
//   1. write js/sheets/<name>.js, which adds itself to SHEETS (see edu.js)
//   2. load that file in sheet.html
//   3. add an entry below with `available: true`
// Give each sheet its own `color`: the picker and character list use it.
// Nothing else in the site needs to change.

const SHEET_TYPES = {
  edu: {
    label: "Education sheet",
    description: "The newer 2024 character sheet. Includes spells.",
    color: "#4aa8e0",     // blue
    available: true,
  },
  nonedu: {
    label: "Non-education sheet",
    description: "The classic 2014 character sheet. Can include a spell sheet.",
    color: "#e8823a",     // orange
    available: true,
    canHaveSpellSheet: true,
  },
};

// Each sheet file puts its code in here, e.g. SHEETS.nonedu = { render, recalc }
const SHEETS = {};
