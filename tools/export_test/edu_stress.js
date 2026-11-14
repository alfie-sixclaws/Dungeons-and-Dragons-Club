globalThis.setTimeout=function(f){f();return 0;}; globalThis.clearTimeout=function(){};
var __logs=[]; globalThis.console={log:()=>{},warn:()=>{},error:()=>{}};
const __b64 = __TEMPLATE_B64__;
fetch = async () => ({ ok: true, arrayBuffer: async () => __b64 });
const LONG = "Long text that goes on and on to test wrapping inside this box";
const data = {};
for (const t of EDU_PDF_MAP.text) {
  const [kind,key] = t.k.split(":");
  if (kind==="data" && !key.startsWith("score-") ) data[key] = t.multi ? (LONG+". ").repeat(30) : LONG;
}
data["class-features"] = (LONG+". ").repeat(60); data.autoCalc = true;
buildEduPdf({id:"s",name:"Stress",sheetType:"edu",data}).then(b=>{__logw(JSON.stringify(b.truncated));__out(b);}).catch(e=>{__logw("");__fail(e.message);});
