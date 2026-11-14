// nonedu.js - the classic 2014 character sheet (3 pages: stats, details, spells).
// Shared lists, helpers and maths live in common.js.
//
// A sheet is an object with:
//   nameField - which field holds the character's name
//   render()  - draws the boxes
//   recalc()  - works out the automatic numbers (modifiers, skills, etc.)

SHEETS.nonedu = {
  nameField: "characterName",

  render(root, character) {
    const abilities = ABILITIES.map(([k, name]) => `
      <div class="ability">
        <span class="ability-name">${name}</span>
        <input class="calc ability-mod" data-calc="mod-${k}" data-field="calc-mod-${k}" aria-label="${name} modifier">
        <input class="ability-score" type="number" data-field="score-${k}" placeholder="10" aria-label="${name} score">
      </div>`).join("");

    const saves = ABILITIES.map(([k, name]) =>
      profRow(`save-${k}`, name, `save-${k}`)).join("");

    const skills = SKILLS.map(([k, name, ab]) =>
      profRow(`skill-${k}`, name, `skill-${k}`, `(${ab})`)).join("");

    const attacks = [1, 2, 3].map(n => `
      <div class="attack-row">
        <input data-field="atk-${n}-name" placeholder="Name" aria-label="Attack ${n} name">
        <input data-field="atk-${n}-bonus" placeholder="Bonus" aria-label="Attack ${n} bonus">
        <input data-field="atk-${n}-damage" placeholder="Damage/type" aria-label="Attack ${n} damage">
      </div>`).join("");

    const deathBoxes = (kind) => [1, 2, 3].map(n =>
      `<input type="checkbox" data-field="death-${kind}-${n}" aria-label="Death save ${kind} ${n}">`).join("");

    // ---- spell sheet (only for characters who ticked "Include a spell sheet") ----
    // How many spell lines each level has (matches the PDF)
    const SPELL_ROWS = {0: 8, 1: 12, 2: 13, 3: 13, 4: 13, 5: 9, 6: 9, 7: 9, 8: 7, 9: 7};

    const spellLevel = (lvl) => {
      const rows = [];
      for (let i = 1; i <= SPELL_ROWS[lvl]; i++) {
        rows.push(`<div class="spell-row">
          ${lvl === 0 ? "" : `<input type="checkbox" data-field="spell-${lvl}-${i}-prepared" aria-label="Prepared">`}
          <input type="text" data-field="spell-${lvl}-${i}-name" aria-label="Level ${lvl} spell ${i}">
        </div>`);
      }
      const slots = lvl === 0 ? `<span class="level-title">Cantrips</span>` : `
        <label class="slot-box"><span>Slots total</span>
          <input type="number" min="0" data-field="slots-${lvl}-total"></label>
        <label class="slot-box"><span>Slots expended</span>
          <input type="number" min="0" data-field="slots-${lvl}-used"></label>`;
      return `<div class="spell-level">
        <div class="level-head"><span class="level-badge">${lvl}</span>${slots}</div>
        ${rows.join("")}
      </div>`;
    };

    const abilityOptions = ABILITIES.map(([k, name]) =>
      `<option value="${k}">${name}</option>`).join("");

    const spellPage = `
      <div class="page" data-page="spells" hidden>
        <div class="spell-header">
          ${box("Spellcasting class", "spell-class")}
          <label class="field"><span>Spellcasting ability</span>
            <select data-field="spell-ability"><option value="">Choose...</option>${abilityOptions}</select></label>
          <div class="field"><span>Spell save DC</span>
            <input class="calc calc-box" data-calc="spellDC" data-field="calc-spellDC" aria-label="Spell save DC"></div>
          <div class="field"><span>Spell attack bonus</span>
            <input class="calc calc-box" data-calc="spellAtk" data-field="calc-spellAtk" aria-label="Spell attack bonus"></div>
        </div>
        <div class="spell-columns">
          <div class="spell-col">${[0, 1, 2].map(spellLevel).join("")}</div>
          <div class="spell-col">${[3, 4, 5].map(spellLevel).join("")}</div>
          <div class="spell-col">${[6, 7, 8, 9].map(spellLevel).join("")}</div>
        </div>
      </div>`;
    const spellTab = character.hasSpellSheet
      ? `<button type="button" class="tab" data-tab="spells">Page 3: Spells</button>` : "";

    root.innerHTML = `
      <section class="sheet">

        <!-- Tabs: one button per page of the sheet -->
        <div class="tabs" role="tablist">
          <button type="button" class="tab active" data-tab="stats">Page 1: Stats</button>
          <button type="button" class="tab" data-tab="details">Page 2: Details</button>
          ${spellTab}
        </div>

        <!-- ===== PAGE 1 ===== -->
        <div class="page" data-page="stats">

        <label class="auto-calc">
          <input type="checkbox" data-field="autoCalc" data-default="true">
          Auto-calculate numbers <small>(untick to type your own values)</small>
        </label>

        <div class="sheet-header">
          ${box("Character name", "characterName", "text", "wide")}
          ${box("Class", "class")}
          ${box("Level", "level", "number")}
          ${box("Background", "background")}
          ${box("Player name", "playerName")}
          ${box("Race", "race")}
          ${box("Alignment", "alignment")}
          ${box("Experience points", "xp", "number")}
        </div>

        <div class="sheet-body">

          <!-- Column 1: abilities, saves, skills -->
          <div class="col col-stats">
            <div class="abilities">${abilities}</div>
            <div class="stat-column">
              <label class="inline-stat">
                <input type="checkbox" data-field="inspiration"> Inspiration</label>
              <div class="inline-stat">Proficiency bonus
                <input class="calc calc-small" data-calc="prof" data-field="calc-prof" aria-label="Proficiency bonus"></div>
              <div class="panel"><h3>Saving throws</h3>${saves}</div>
              <div class="panel"><h3>Skills</h3>${skills}</div>
            </div>
          </div>

          <!-- Column 2: combat -->
          <div class="col col-combat">
            <div class="combat-top">
              ${box("Armor class", "ac", "number")}
              <div class="field"><span>Initiative</span>
                <input class="calc calc-box" data-calc="initiative" data-field="calc-initiative" aria-label="Initiative"></div>
              ${box("Speed", "speed")}
            </div>
            <div class="panel hp">
              ${box("Hit point maximum", "hp-max", "number")}
              ${box("Current hit points", "hp-current", "number")}
              ${box("Temporary hit points", "hp-temp", "number")}
            </div>
            <div class="combat-row">
              ${box("Hit dice", "hit-dice")}
              <div class="panel death">
                <h3>Death saves</h3>
                <div class="death-row">Successes ${deathBoxes("success")}</div>
                <div class="death-row">Failures ${deathBoxes("fail")}</div>
              </div>
            </div>
            <div class="panel">
              <h3>Attacks &amp; spellcasting</h3>${attacks}
              ${area("More attacks and notes", "attacks-notes")}
            </div>
            <div class="panel">
              <h3>Equipment</h3>
              <div class="coins">
                ${["cp", "sp", "ep", "gp", "pp"].map(c => box(c.toUpperCase(), "coin-" + c, "number")).join("")}
              </div>
              ${area("Equipment", "equipment", "tall")}
            </div>
          </div>

          <!-- Column 3: personality and features -->
          <div class="col col-text">
            ${area("Personality traits", "personality")}
            ${area("Ideals", "ideals")}
            ${area("Bonds", "bonds")}
            ${area("Flaws", "flaws")}
            ${area("Features & traits", "features", "tall")}
            ${area("Other proficiencies & languages", "other-prof", "tall")}
            <div class="inline-stat">Passive wisdom (perception)
              <input class="calc calc-small" data-calc="passive" data-field="calc-passive" aria-label="Passive wisdom"></div>
          </div>

        </div>
        </div> <!-- end page 1 -->

        <!-- ===== PAGE 2 ===== -->
        <div class="page" data-page="details" hidden>
          <div class="appearance-grid">
            ${box("Age", "age")}
            ${box("Height", "height")}
            ${box("Weight", "weight")}
            ${box("Eyes", "eyes")}
            ${box("Skin", "skin")}
            ${box("Hair", "hair")}
          </div>
          <div class="details-grid">
            ${area("Character appearance", "appearance", "tall")}
            ${area("Symbol / emblem (describe it)", "symbol", "tall")}
            ${area("Allies & organizations", "allies", "tall")}
            ${area("Character backstory", "backstory", "tall")}
            ${area("Additional features & traits", "extra-features", "tall")}
            ${area("Treasure", "treasure", "tall")}
          </div>
        </div>

        ${character.hasSpellSheet ? spellPage : ""}
      </section>`;

    setUpTabs(root);
  },

  recalc: recalcSheet,
};
