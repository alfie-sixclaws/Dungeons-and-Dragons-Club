// edu.js - the 2024 character sheet (2 pages: stats, then spells and details).
// Shared lists, helpers and maths live in common.js, so this file only
// describes what is different about the 2024 layout:
//   - skills sit inside their ability's card
//   - Heroic Inspiration, Species, Subclass and Size
//   - a weapons & cantrips table, and a 30-line spell table
//   - the spell page is always included

SHEETS.edu = {
  nameField: "characterName",

  render(root, character) {
    // ---- one card per ability: score, modifier, saving throw, then its skills ----
    const abilityCard = ([k, name]) => {
      const skills = SKILLS.filter(([, , ab]) => ab === k)
        .map(([sk, label]) => profRow(`skill-${sk}`, label, `skill-${sk}`)).join("");
      return `
        <div class="ability-card">
          <h3>${name}</h3>
          <div class="card-scores">
            <input class="calc ability-mod" data-calc="mod-${k}" data-field="calc-mod-${k}" aria-label="${name} modifier">
            <input class="ability-score" type="number" data-field="score-${k}" placeholder="10" aria-label="${name} score">
          </div>
          ${profRow(`save-${k}`, "Saving throw", `save-${k}`)}
          ${skills ? `<div class="card-skills">${skills}</div>` : ""}
        </div>`;
    };
    const cardsFor = (keys) => ABILITIES.filter(([k]) => keys.includes(k)).map(abilityCard).join("");

    const weapons = [1, 2, 3, 4, 5, 6].map(n => `
      <div class="weapon-row">
        <input data-field="wpn-${n}-name" placeholder="Name" aria-label="Weapon ${n} name">
        <input data-field="wpn-${n}-bonus" placeholder="Atk bonus / DC" aria-label="Weapon ${n} attack bonus">
        <input data-field="wpn-${n}-damage" placeholder="Damage & type" aria-label="Weapon ${n} damage">
        <input data-field="wpn-${n}-notes" placeholder="Notes" aria-label="Weapon ${n} notes">
      </div>`).join("");

    const deathBoxes = (kind) => [1, 2, 3].map(n =>
      `<input type="checkbox" data-field="death-${kind}-${n}" aria-label="Death save ${kind} ${n}">`).join("");

    const armor = [["light", "Light"], ["medium", "Medium"], ["heavy", "Heavy"], ["shields", "Shields"]]
      .map(([k, label]) => `<label class="armor-tick"><input type="checkbox" data-field="armor-${k}"> ${label}</label>`).join("");

    // ---- page 2: spells ----
    const abilityOptions = ABILITIES.map(([k, name]) => `<option value="${k}">${name}</option>`).join("");

    const slotRow = (lvl) => `
      <div class="slot-line"><span>Level ${lvl}</span>
        <input type="number" min="0" data-field="slots-${lvl}-total" aria-label="Level ${lvl} slots total" placeholder="Total">
        <input type="number" min="0" data-field="slots-${lvl}-used" aria-label="Level ${lvl} slots expended" placeholder="Used">
      </div>`;

    const spellRows = Array.from({ length: 30 }, (_, i) => {
      const n = i + 1;
      return `<div class="spell-table-row">
        <input type="text" class="sp-level" data-field="spell-${n}-level" aria-label="Spell ${n} level">
        <input type="text" data-field="spell-${n}-name" aria-label="Spell ${n} name">
        <input type="text" data-field="spell-${n}-time" aria-label="Spell ${n} casting time">
        <input type="text" data-field="spell-${n}-range" aria-label="Spell ${n} range">
        <span class="crm">
          <label title="Concentration"><input type="checkbox" data-field="spell-${n}-c"> C</label>
          <label title="Ritual"><input type="checkbox" data-field="spell-${n}-r"> R</label>
          <label title="Required material"><input type="checkbox" data-field="spell-${n}-m"> M</label>
        </span>
        <input type="text" data-field="spell-${n}-notes" aria-label="Spell ${n} notes">
      </div>`;
    }).join("");

    const attunement = [1, 2, 3].map(n => `
      <div class="attune-row">
        <input type="checkbox" data-field="attune-${n}-on" aria-label="Attuned ${n}">
        <input type="text" data-field="attune-${n}-name" aria-label="Magic item ${n}">
      </div>`).join("");

    root.innerHTML = `
      <section class="sheet edu-sheet">

        <div class="tabs" role="tablist">
          <button type="button" class="tab active" data-tab="stats">Page 1: Stats</button>
          <button type="button" class="tab" data-tab="spells">Page 2: Spells &amp; details</button>
        </div>

        <!-- ===== PAGE 1 ===== -->
        <div class="page" data-page="stats">

          <label class="auto-calc">
            <input type="checkbox" data-field="autoCalc" data-default="true">
            Auto-calculate numbers <small>(untick to type your own values)</small>
          </label>

          <div class="sheet-header">
            ${box("Character name", "characterName", "text", "wide")}
            ${box("Level", "level", "number")}
            ${box("XP", "xp", "number")}
            ${box("Background", "background")}
            ${box("Class", "class")}
            ${box("Species", "species")}
            ${box("Subclass", "subclass")}
          </div>

          <div class="edu-top">
            <div class="panel armor-class">
              ${box("Armor class", "ac", "number")}
              <label class="armor-tick"><input type="checkbox" data-field="shield"> Shield</label>
            </div>
            <div class="panel hp">
              <h3>Hit points</h3>
              <div class="hp-grid">
                ${box("Current", "hp-current", "number")}
                ${box("Max", "hp-max", "number")}
                ${box("Temp", "hp-temp", "number")}
              </div>
            </div>
            <div class="panel">
              <h3>Hit dice</h3>
              <div class="hp-grid two">
                ${box("Spent", "hd-spent")}
                ${box("Max", "hd-max")}
              </div>
            </div>
            <div class="panel death">
              <h3>Death saves</h3>
              <div class="death-row">Successes ${deathBoxes("success")}</div>
              <div class="death-row">Failures ${deathBoxes("fail")}</div>
            </div>
          </div>

          <div class="edu-body">

            <!-- Left: proficiency, inspiration, abilities -->
            <div class="edu-left">
              <div class="edu-pills">
                <div class="inline-stat">Proficiency bonus
                  <input class="calc calc-small" data-calc="prof" data-field="calc-prof" aria-label="Proficiency bonus"></div>
                <label class="inline-stat">
                  <input type="checkbox" data-field="heroic-inspiration"> Heroic inspiration</label>
              </div>
              <div class="ability-cards">
                <div class="ability-col">${cardsFor(["str", "dex", "con"])}</div>
                <div class="ability-col">${cardsFor(["int", "wis", "cha"])}</div>
              </div>
              <div class="panel">
                <h3>Equipment training &amp; proficiencies</h3>
                <div class="armor-training"><span>Armor training</span>${armor}</div>
                ${area("Weapons", "weapon-training")}
                ${area("Tools", "tools")}
              </div>
            </div>

            <!-- Right: combat numbers, weapons, features -->
            <div class="edu-right">
              <div class="edu-stats">
                <div class="field"><span>Initiative</span>
                  <input class="calc calc-box" data-calc="initiative" data-field="calc-initiative" aria-label="Initiative"></div>
                ${box("Speed", "speed")}
                ${box("Size", "size")}
                <div class="field"><span>Passive perception</span>
                  <input class="calc calc-box" data-calc="passive" data-field="calc-passive" aria-label="Passive perception"></div>
              </div>
              <div class="panel">
                <h3>Weapons &amp; damage cantrips</h3>${weapons}
              </div>
              ${area("Class features", "class-features", "tall xtall")}
              <div class="edu-two">
                ${area("Species traits", "species-traits", "tall")}
                ${area("Feats", "feats", "tall")}
              </div>
            </div>

          </div>
        </div>

        <!-- ===== PAGE 2 ===== -->
        <div class="page" data-page="spells" hidden>

          <div class="edu-spell-top">
            <div class="panel spell-stats">
              <label class="field"><span>Spellcasting ability</span>
                <select data-field="spell-ability"><option value="">Choose...</option>${abilityOptions}</select></label>
              <div class="field"><span>Spellcasting modifier</span>
                <input class="calc calc-box" data-calc="spellMod" data-field="calc-spellMod" aria-label="Spellcasting modifier"></div>
              <div class="field"><span>Spell save DC</span>
                <input class="calc calc-box" data-calc="spellDC" data-field="calc-spellDC" aria-label="Spell save DC"></div>
              <div class="field"><span>Spell attack bonus</span>
                <input class="calc calc-box" data-calc="spellAtk" data-field="calc-spellAtk" aria-label="Spell attack bonus"></div>
            </div>
            <div class="panel">
              <h3>Spell slots</h3>
              <div class="slots-grid">
                <div>${[1, 2, 3].map(slotRow).join("")}</div>
                <div>${[4, 5, 6].map(slotRow).join("")}</div>
                <div>${[7, 8, 9].map(slotRow).join("")}</div>
              </div>
            </div>
          </div>

          <div class="edu-spell-body">

            <div class="panel spell-table-panel">
              <h3>Cantrips &amp; prepared spells</h3>
              <div class="spell-table-scroll">
                <div class="spell-table">
                  <div class="spell-table-row spell-table-head">
                    <span>Level</span><span>Name</span><span>Casting time</span><span>Range</span>
                    <span>C / R / M</span><span>Notes</span>
                  </div>
                  ${spellRows}
                </div>
              </div>
            </div>

            <div class="edu-details">
              ${area("Appearance", "appearance", "tall")}
              <div class="panel">
                <h3>Backstory &amp; personality</h3>
                ${area("", "backstory", "tall")}
                ${box("Alignment", "alignment")}
              </div>
              ${area("Languages", "languages")}
              <div class="panel">
                <h3>Equipment</h3>
                ${area("", "equipment", "tall")}
                <span class="mini-label">Magic item attunement</span>
                ${attunement}
              </div>
              <div class="panel">
                <h3>Coins</h3>
                <div class="coins">
                  ${["cp", "sp", "ep", "gp", "pp"].map(c => box(c.toUpperCase(), "coin-" + c, "number")).join("")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>`;

    setUpTabs(root);
  },

  recalc: recalcSheet,
};
