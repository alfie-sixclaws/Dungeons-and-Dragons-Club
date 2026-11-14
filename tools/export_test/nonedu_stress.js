globalThis.setTimeout=function(f){f();return 0;}; globalThis.clearTimeout=function(){};
var __logs=[]; globalThis.console={log:()=>{},warn:()=>{},error:()=>{}};
const __b64 = __TEMPLATE_B64__;
fetch = async () => ({ ok: true, arrayBuffer: async () => __b64 });
const LONG = "Long text that goes on and on to test wrapping inside this box";
const data = {};
for (const key of Object.keys(PDF_TEXT)) data[key] = PDF_SMALL_FONT[PDF_TEXT[key][0]] ? (LONG+". ").repeat(25) : LONG;
data.class="Barbarian with a very long class name"; data.level="5";
for (let n=1;n<=3;n++){ data[`atk-${n}-name`]=LONG; data[`atk-${n}-bonus`]="+7 to hit plus extras"; data[`atk-${n}-damage`]=LONG; }
for (let l=0;l<=9;l++) for (let i=1;i<=NONEDU_PDF_SPELLS[l].names.length;i++) data[`spell-${l}-${i}-name`]="Spell with a really long name number "+i+" "+LONG;
data["hit-dice"]="5d12 plus some extra hit dice that go on"; data["spell-ability"]="cha";
buildNoneduPdf({id:"s",name:"Stress",sheetType:"nonedu",hasSpellSheet:true,data}).then(b=>{__logw(JSON.stringify(b.truncated));__out(b);}).catch(e=>{__logw("");__fail(e.message);});
