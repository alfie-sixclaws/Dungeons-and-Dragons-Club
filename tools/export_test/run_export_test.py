"""Runs the REAL PDF export code (no browser needed) and renders the result to PNGs.

How it works: macOS ships a JavaScript engine (JavaScriptCore) reachable through `osascript`.
We glue the site's JS files + pdf-lib + a test character together into one script, stub the few
browser things pdf-lib needs (fetch, console, setTimeout), run it, and decode the PDF it returns.
What this does NOT cover: the browser download step (Blob + link click) and any real-browser quirks.

Usage (from the project root):
    python3 tools/export_test/run_export_test.py nonedu            # full 2014 character with spell sheet
    python3 tools/export_test/run_export_test.py nonedu --no-spells
    python3 tools/export_test/run_export_test.py edu               # full 2024 character
    python3 tools/export_test/run_export_test.py edu --case empty  # completely empty character
    python3 tools/export_test/run_export_test.py edu --case stress # absurdly long text in every box
Prints the output folder. Open the PNGs to LOOK at the result. Needs:
  - the allow rule  Bash(osascript:*)  (see .claude/settings.json) so osascript can run
  - pymupdf for rendering (pip install pymupdf); without it you still get the PDF.
"""
import argparse, base64, os, subprocess, sys, tempfile, time

ROOT = os.getcwd()
FILES = {
    "nonedu": ["registry.js", "common.js", "nonedu.js", "nonedu-pdf-spells.js", "nonedu-pdf.js"],
    "edu":    ["registry.js", "common.js", "edu.js", "edu-pdf-map.js", "edu-pdf.js"],
}
TEMPLATE = {"nonedu": "assets/templates/character-sheet-2014.pdf", "edu": "assets/templates/character-sheet-2024.pdf"}

ap = argparse.ArgumentParser()
ap.add_argument("sheet", choices=["nonedu", "edu"])
ap.add_argument("--case", choices=["full", "empty", "stress"], default="full")
ap.add_argument("--no-spells", action="store_true", help="2014 only: character without a spell sheet")
a = ap.parse_args()

here = os.path.join(ROOT, "tools/export_test")
body_name = f"{a.sheet}_{'stress' if a.case == 'stress' else 'full'}.js"
body = open(os.path.join(here, body_name)).read()
b64 = base64.b64encode(open(os.path.join(ROOT, TEMPLATE[a.sheet]), "rb").read()).decode()
body = (body.replace("__TEMPLATE_B64__", '"' + b64 + '"')
            .replace("__SPELLS__", "false" if a.no_spells else "true")
            .replace("__EMPTY__", "true" if a.case == "empty" else "false"))
parts = [open(os.path.join(ROOT, "js/vendor/pdf-lib.min.js")).read()]
parts += [open(os.path.join(ROOT, "js/sheets", f)).read() for f in FILES[a.sheet]] + [body]

out = tempfile.mkdtemp(prefix=f"export_{a.sheet}_{a.case}_")
open(out + "/combined.js", "w").write("\n".join(parts))
# JXA runner: evaluates combined.js; the test body calls __out(bytes) / __fail(msg) / __logw(text)
open(out + "/run.js", "w").write(f'''
ObjC.import('Foundation');
function readFile(p){{ return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, $())); }}
function writeFile(p,s){{ $(s).writeToFileAtomicallyEncodingError(p, true, $.NSUTF8StringEncoding, $()); }}
var OUT="{out}/result";
function b64(bytes){{ var c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",o="";
  for(var i=0;i<bytes.length;i+=3){{var a=bytes[i],b=bytes[i+1],d=bytes[i+2];
   o+=c[a>>2]+c[((a&3)<<4)|((b||0)>>4)]+(i+1<bytes.length?c[((b&15)<<2)|((d||0)>>6)]:'=')+(i+2<bytes.length?c[d&63]:'=');}}
  return o;}}
globalThis.__out = function(bytes){{ writeFile(OUT+".b64", b64(bytes)); writeFile(OUT+".status","ok "+bytes.length); }};
globalThis.__fail = function(m){{ writeFile(OUT+".status","FAIL "+m); }};
globalThis.__logw = function(m){{ writeFile(OUT+".log", m||"(none)"); }};
try {{ (0,eval)(readFile("{out}/combined.js")); }} catch(e){{ writeFile(OUT+".status","EVALFAIL "+e); }}
''')
subprocess.run(["osascript", "-l", "JavaScript", out + "/run.js"], capture_output=True, timeout=600)
status_file = out + "/result.status"
for _ in range(90):                      # the export finishes asynchronously; wait for its result file
    if os.path.exists(status_file): break
    time.sleep(1)
status = open(status_file).read() if os.path.exists(status_file) else "NO RESULT (timed out)"
print("status:", status[:500])
if not status.startswith("ok"): sys.exit(1)
pdf = out + "/export.pdf"
open(pdf, "wb").write(base64.b64decode(open(out + "/result.b64").read()))
print("text boxes shortened with '...':", open(out + "/result.log").read()[:300])
try:
    import pymupdf
    d = pymupdf.open(pdf)
    for i, p in enumerate(d):
        p.get_pixmap(dpi=100).save(f"{out}/page_{i+1}.png")
    print(f"{len(d)} pages rendered")
except ImportError:
    print("pymupdf not installed: skipped rendering")
print("output folder:", out)
