"""Regenerates js/sheets/edu-pdf-map.js: where every value is printed on the 2024 sheet.

The textured 2024 PDF we ship has no form fields, but Wizards' official FILLABLE version
of the same sheet has identical layout (labels match to 0.00 pt). We read that file's field
boxes and map each one (by position/label, names like "Text54" are meaningless) to our data keys.
Download the fillable file from:
  https://media.dndbeyond.com/compendium-images/free-rules/downloads/2024-character-sheet.pdf
Then, from the project root:
    python3 tools/gen_edu_pdf_map.py path/to/2024-character-sheet.pdf
Needs pymupdf. If WotC re-issues the PDF the field names may change; re-check the mapping
by exporting a fully filled test character (tools/export_test).
"""
import pymupdf, json, sys
d=pymupdf.open(sys.argv[1])
F={}   # field name -> (page, rect, fontsize, align)
for pi,p in enumerate(d):
    for w in p.widgets():
        q=d.xref_get_key(w.xref,"Q"); al=int(q[1]) if q[0]!="null" else 0
        F[w.field_name]=dict(page=pi,r=[round(v,1) for v in w.rect],size=round(w.text_fontsize) or 10,align=al,
                             multi=bool(w.field_flags&4096),kind=w.field_type_string)
def T(name,key,**kw):
    f=F[name]; return dict(k=key,page=f["page"],r=f["r"],size=f["size"],align=f["align"],**kw)
def C(name,key,shape):
    f=F[name]; return dict(k=key,page=f["page"],r=f["r"],shape=shape)

text=[]; checks=[]; flows=[]; counts=[]
D=lambda k:"data:"+k; K=lambda k:"calc:"+k
# ---------- page 1 ----------
for n,k in [("Text1","characterName"),("Text6","background"),("Text7","class"),("Text8","species"),("Text9","subclass"),
            ("Text11","level"),("Text12","xp"),("Text13","ac"),("Text14","hp-current"),("Text15","hp-temp"),("Text16","hp-max"),
            ("Text17","hd-max"),("Text18","hd-spent"),("Text27","speed"),("Text28","size"),
            ("Text63","score-int"),("Text64","score-str"),("Text65","score-wis"),("Text66","score-dex"),("Text67","score-con"),("Text68","score-cha")]:
    text.append(T(n,D(k)))
for n,k in [("Text19","prof"),("Text20","mod-int"),("Text21","mod-str"),("Text22","mod-dex"),("Text23","mod-wis"),("Text24","mod-con"),("Text25","mod-cha"),
            ("Text26","initiative"),("Text29","passive"),
            ("Text69","save-int"),("Text70","skill-arcana"),("Text71","skill-history"),("Text72","skill-investigation"),("Text73","skill-nature"),("Text74","skill-religion"),
            ("Text75","save-wis"),("Text76","skill-animalHandling"),("Text77","skill-insight"),("Text78","skill-medicine"),("Text79","skill-perception"),("Text80","skill-survival"),
            ("Text81","save-cha"),("Text82","skill-deception"),("Text83","skill-intimidation"),("Text84","skill-performance"),("Text85","skill-persuasion"),
            ("Text86","save-con"),("Text87","save-dex"),("Text88","skill-acrobatics"),("Text89","skill-sleightOfHand"),("Text90","skill-stealth"),
            ("Text91","save-str"),("Text92","skill-athletics")]:
    text.append(T(n,K(k)))
for row in range(6):
    for col,name in enumerate(["name","bonus","damage","notes"]):
        text.append(T(f"Text{30+row*4+col}",D(f"wpn-{row+1}-{name}")))
for n,k in [("Text57","species-traits"),("Text58","feats"),("Text59","weapon-training"),("Text60","tools")]:
    text.append(T(n,D(k),multi=True))
flows.append(dict(k=D("class-features"),page=0,rs=[F["Text54"]["r"],F["Text55"]["r"]],size=10))
C_=lambda n,k,s: checks.append(C(n,D(k),s))
C_("Check Box3","shield","diamond")
for i in range(3):
    C_(f"Check Box{5+i}",f"death-success-{i+1}","diamond"); C_(f"Check Box{8+i}",f"death-fail-{i+1}","diamond")
C_("Check Box11","heroic-inspiration","diamond")
for n,k in [("Check Box13","light"),("Check Box14","medium"),("Check Box15","heavy"),("Check Box12","shields")]: C_(n,"armor-"+k,"diamond")
for n,k in [("Check Box4","save-int"),("Check Box16","skill-arcana"),("Check Box17","skill-history"),("Check Box19","skill-investigation"),("Check Box20","skill-nature"),("Check Box18","skill-religion"),
            ("Check Box21","save-wis"),("Check Box22","skill-animalHandling"),("Check Box23","skill-insight"),("Check Box25","skill-medicine"),("Check Box31","skill-perception"),("Check Box24","skill-survival"),
            ("Check Box26","save-cha"),("Check Box27","skill-deception"),("Check Box28","skill-intimidation"),("Check Box30","skill-performance"),("Check Box29","skill-persuasion"),
            ("Check Box32","save-con"),("Check Box33","save-dex"),("Check Box34","skill-acrobatics"),("Check Box35","skill-sleightOfHand"),("Check Box36","skill-stealth"),
            ("Check Box37","save-str"),("Check Box38","skill-athletics")]:
    C_(n,"prof-"+k,"circle")
# ---------- page 2 ----------
text.append(T("Text111","fn:spellAbility"))
for n,k in [("Text93","spellMod"),("Text94","spellDC"),("Text95","spellAtk")]: text.append(T(n,K(k)))
for n,k in [("Text96","appearance"),("Text97","backstory"),("Text98","languages"),("Text99","equipment")]: text.append(T(n,D(k),multi=True))
text.append(T("Text100",D("alignment")))
for i,n in enumerate(["Text101","Text102","Text103"]): text.append(T(n,D(f"attune-{i+1}-name")))
for i,n in enumerate(["Check Box249","Check Box250","Check Box251"]): C_(n,f"attune-{i+1}-on","diamond")
for lvl,n in zip(range(1,10),["Text112","Text113","Text114","Text117","Text116","Text115","Text118","Text119","Text120"]):
    text.append(T(n,D(f"slots-{lvl}-total")))
slotboxes={1:range(227,231),2:range(231,234),3:range(234,237),4:range(237,240),5:range(240,243),6:range(243,245),7:range(245,247),8:[247],9:[248]}
for lvl,nums in slotboxes.items():
    counts.append(dict(k=D(f"slots-{lvl}-used"),page=1,rs=[F[f"Check Box{n}"]["r"] for n in nums],shape="diamond"))
for n,k in zip(["Text226","Text267","Text268","Text269","Text270"],["cp","sp","ep","gp","pp"]): text.append(T(n,D("coin-"+k)))
# spell table: 30 rows
def intable(f): r=f["r"]; return f["page"]==1 and r[1]>170 and r[3]<760 and r[2]<395 and r[0]>10
cols=[("level",0,40),("name",40,153),("time",153,187),("range",187,232),("notes",300,395)]
tf=[(n,f) for n,f in F.items() if f["kind"]=="Text" and intable(f)]
names=sorted([f for n,f in tf if 40<=f["r"][0]<153],key=lambda f:f["r"][1])
assert len(names)==30,len(names)
for i,nf in enumerate(names):
    cy=(nf["r"][1]+nf["r"][3])/2
    for col,lo,hi in cols:
        m=[f for n,f in tf if lo<=f["r"][0]<hi and abs((f["r"][1]+f["r"][3])/2-cy)<5]
        assert len(m)==1,(i,col,len(m))
        f=m[0]; text.append(dict(k=D(f"spell-{i+1}-{col}"),page=1,r=f["r"],size=f["size"],align=f["align"]))
    boxes=sorted([f for n,f in F.items() if f["kind"]=="CheckBox" and f["page"]==1 and f["r"][0]<395 and f["r"][1]>170 and abs((f["r"][1]+f["r"][3])/2-cy)<6],key=lambda f:f["r"][0])
    assert len(boxes)==3,(i,len(boxes))
    for b,k in zip(boxes,["c","r","m"]): checks.append(dict(k=D(f"spell-{i+1}-{k}"),page=1,r=b["r"],shape="diamond"))
# every field used exactly once?
used=0
mapped=len(text)+len(checks)+len(flows)*2+sum(len(c["rs"]) for c in counts)
print("fields in official file:",len(F),"| mapped rects:",mapped)
js="// GENERATED by matching the fillable official 2024 PDF's field boxes to our data keys.\n// Coordinates are in PDF points measured from the TOP-LEFT of the page (603 x 774).\n// k: \"data:x\" = saved value, \"calc:x\" = calculated number, \"fn:x\" = special.\nconst EDU_PDF_MAP = "+json.dumps(dict(text=text,flows=flows,checks=checks,counts=counts),separators=(",",":"))+";\n"
open("js/sheets/edu-pdf-map.js","w").write(js)
unmapped=[n for n in F]
print("map written, bytes:",len(js))
