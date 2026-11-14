globalThis.setTimeout=function(f){f();return 0;}; globalThis.clearTimeout=function(){};
var __logs=[]; globalThis.console={log:(...a)=>__logs.push('log: '+a.join(' ')),warn:(...a)=>__logs.push('WARN: '+a.map(x=>x&&x.message||String(x)).join(' ')),error:(...a)=>__logs.push('ERR: '+a.join(' '))};
const __b64 = __TEMPLATE_B64__;
fetch = async () => ({ ok: true, arrayBuffer: async () => __b64 });
const d = {
  characterName:"Aria Stormwind", level:"5", xp:"6500", background:"Sage", class:"Wizard", species:"High Elf", subclass:"Evoker",
  ac:"15", shield:true, "hp-current":"28", "hp-max":"32", "hp-temp":"5", "hd-spent":"2", "hd-max":"5d6",
  "death-success-1":true,"death-success-2":true,"death-fail-1":true,
  "heroic-inspiration":true,
  "score-str":"8","score-dex":"14","score-con":"14","score-int":"18","score-wis":"12","score-cha":"10",
  "prof-save-int":true,"prof-save-wis":true,"prof-skill-arcana":true,"prof-skill-history":true,"prof-skill-perception":true,"prof-skill-stealth":true,"prof-skill-athletics":false,
  speed:"30 ft","size":"Medium",
  "wpn-1-name":"Quarterstaff","wpn-1-bonus":"+1","wpn-1-damage":"1d6 bludgeoning","wpn-1-notes":"Versatile",
  "wpn-2-name":"Fire Bolt","wpn-2-bonus":"+7","wpn-2-damage":"2d10 fire","wpn-2-notes":"Range 120 ft",
  "wpn-6-name":"Sixth row","wpn-6-notes":"Last",
  "class-features":"Spellcasting\nArcane Recovery: once per day finish a short rest and recover spell slots with a combined level equal to half your wizard level.\nSculpt Spells: protect allies from your evocation spells.\n"+"Extra feature line. ".repeat(40),
  "species-traits":"Darkvision 60 ft\nFey Ancestry\nTrance\nCantrip: Prestidigitation",
  feats:"Alert\nMagic Initiate (Cleric)",
  "armor-light":true,"armor-shields":true,
  "weapon-training":"Simple weapons","tools":"Cartographer's tools",
  "spell-ability":"int","slots-1-total":"4","slots-1-used":"2","slots-2-total":"3","slots-2-used":"3","slots-3-total":"2","slots-3-used":"1","slots-9-total":"1","slots-9-used":"1","slots-4-total":"3","slots-4-used":"1","slots-7-total":"2","slots-7-used":"2",
  "spell-1-level":"C","spell-1-name":"Fire Bolt","spell-1-time":"Action","spell-1-range":"120 ft","spell-1-c":true,"spell-1-notes":"2d10",
  "spell-2-level":"1","spell-2-name":"Magic Missile","spell-2-time":"Action","spell-2-range":"120 ft","spell-2-r":true,"spell-2-m":true,"spell-2-notes":"3 darts",
  "spell-30-level":"9","spell-30-name":"Wish","spell-30-c":true,"spell-30-r":true,"spell-30-m":true,
  appearance:"Tall and slender with silver hair, a blue cloak and an ink-stained left hand.",
  backstory:"Raised in a library tower. Left to find the lost spellbook of her master.\nCurious, polite, and easily distracted by old maps.",
  alignment:"Neutral Good", languages:"Common, Elvish, Draconic",
  equipment:"Spellbook, quarterstaff, scholar's pack, ink, 10 candles.",
  "attune-1-on":true,"attune-1-name":"Cloak of Protection","attune-2-name":"Wand of Fireballs",
  "coin-cp":"12","coin-sp":"30","coin-ep":"0","coin-gp":"145","coin-pp":"2"
};
const ch = { id:"t", name:"Aria Stormwind", sheetType:"edu", data: __EMPTY__ ? {} : d };
if (__EMPTY__) ch.name="";
buildEduPdf(ch).then(bytes => { __logw(__logs.join('\n')); __out(bytes); }).catch(e => { __logw(__logs.join('\n')); __fail((e && e.name) + ": " + (e && e.message)); });
