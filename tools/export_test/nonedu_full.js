// ---- test harness ----
globalThis.setTimeout=function(f){f();return 0;}; globalThis.clearTimeout=function(){}; var __logs=[]; globalThis.console={log:(...a)=>__logs.push('log: '+a.join(' ')),warn:(...a)=>__logs.push('WARN: '+a.map(x=>x&&x.message||String(x)).join(' ')),error:(...a)=>__logs.push('ERR: '+a.join(' '))};
const __b64 = __TEMPLATE_B64__;
fetch = async () => ({ ok: true, arrayBuffer: async () => __b64 });
const ch = { id:"t", name:"Fire Pott", sheetType:"nonedu", hasSpellSheet: __SPELLS__, data: {
  characterName:"Fire Pott", class:"Sorcerer", level:"5", background:"Sage", playerName:"Test Kid",
  race:"Dragonborn", alignment:"Chaotic Good", xp:"6500", ac:"13", speed:"30 ft", "hp-max":"32","hp-current":"30","hp-temp":"0","hit-dice":"5d6",
  "score-str":"8","score-dex":"14","score-con":"14","score-int":"10","score-wis":"12","score-cha":"18",
  "prof-save-con":true,"prof-save-cha":true,"prof-skill-arcana":true,"prof-skill-persuasion":true,"prof-skill-perception":true,
  inspiration:true,"death-success-1":true,"death-fail-2":true,
  "atk-1-name":"Fire Bolt","atk-1-bonus":"+7","atk-1-damage":"2d10 fire",
  personality:"I speak in riddles and never back down from a dare. “Quotes” and emoji 🔥 test.",
  ideals:"Freedom.", bonds:"My dragon family.", flaws:"Too proud.",
  features:"Draconic bloodline\nFire affinity\nSorcery points: 5", equipment:"Staff, dagger, backpack, 10 torches",
  "coin-gp":"75","other-prof":"Common, Draconic",
  age:"24", height:"6'2", weight:"210", eyes:"Gold", skin:"Blue", hair:"None",
  appearance:"Tall, blue scales edged in gold. Carries a charred wooden staff. Smells faintly of smoke.",
  allies:"The Ember Circle", symbol:"Flame in a circle", backstory:"Raised by dragons.", "extra-features":"Darkvision", treasure:"A gold tooth",
  "spell-class":"Sorcerer","spell-ability":"cha","slots-1-total":"4","slots-1-used":"1","slots-3-total":"2",
  "spell-0-1-name":"Fire Bolt","spell-0-2-name":"Prestidigitation",
  "spell-1-1-name":"Magic Missile","spell-1-1-prepared":true,"spell-1-12-name":"Last L1 row",
  "spell-3-1-name":"Fireball","spell-3-1-prepared":true,"spell-5-9-name":"L5 last","spell-9-7-name":"L9 last"
}};
if (__EMPTY__) { ch.data = {}; ch.name = ""; }
buildNoneduPdf(ch).then(bytes => { __logw(__logs.join('\n')); __out(bytes); }).catch(e => { __logw(__logs.join('\n')); __fail((e && e.name) + ": " + (e && e.message) + " | " + String(e)); });
