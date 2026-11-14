# tools/

Developer scripts. None of these run on the website; they generate or check files the site uses.
All need Python 3 and `pip install pymupdf`. Run them from the project root.

| Script | What it does | When to re-run |
|---|---|---|
| `gen_nonedu_spell_map.py` | Writes `js/sheets/nonedu-pdf-spells.js` (which PDF field is which spell line on the 2014 sheet, matched by position) | Only if the 2014 template PDF changes |
| `gen_edu_pdf_map.py <fillable.pdf>` | Writes `js/sheets/edu-pdf-map.js` (where each value is printed on the 2024 sheet) from the official *fillable* 2024 PDF | Only if the 2024 layout or our data keys change |
| `shrink_edu_template.py <in> <out>` | Makes the ~3.9 MB 2024 template from the original 16 MB textured PDF | Only if you want a different size/quality trade-off |
| `export_test/run_export_test.py` | Runs the real export code without a browser and renders the PDF to PNGs so you can look at it | After ANY change to the export or sheet code |

## Testing exports

```
python3 tools/export_test/run_export_test.py nonedu            # 2014, with spell sheet
python3 tools/export_test/run_export_test.py edu               # 2024
python3 tools/export_test/run_export_test.py edu --case empty  # empty character
python3 tools/export_test/run_export_test.py edu --case stress # long text everywhere
```

It prints a folder containing `export.pdf` and `page_N.png`. Open the PNGs and LOOK at them: the
numbers alone have missed visual bugs before (squares instead of circles, text over labels).
It uses macOS's built-in JavaScript engine through `osascript`, so it needs the allow rule
`Bash(osascript:*)` (already in `.claude/settings.json`) and only works on macOS.
It does **not** test the browser download step.

## Where the source files are

- `sketches-source/` : the son's hand-drawn plans (photos) and the two original WotC PDFs. Never edited.
- `assets/templates/` : the PDFs the site loads at runtime (2014 = fillable; 2024 = shrunk textured copy).
- The official fillable 2024 PDF is NOT stored in the project. Download it (URL in `gen_edu_pdf_map.py`) only to regenerate the map.
