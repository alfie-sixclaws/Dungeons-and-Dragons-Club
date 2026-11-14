// edu-pdf.js - turns a saved 2024 character into a PDF.
//
// The textured 2024 sheet (assets/templates/character-sheet-2024.pdf) has no
// fillable fields, so instead of filling fields we PRINT each value onto the page
// ourselves. Where to print comes from edu-pdf-map.js, which was measured from the
// official fillable version of the same sheet (identical layout). The sheet's own
// artwork is untouched, so the result looks exactly like the original.
//
// Needs: js/vendor/pdf-lib.min.js, common.js, edu.js and edu-pdf-map.js loaded first.

const EDU_TEMPLATE_URL = "assets/templates/character-sheet-2024.pdf";
const EDU_PAGE_HEIGHT = 774;      // points; coordinates in the map count down from the top

async function buildEduPdf(character) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const data = character.data;
  const calc = computeCalc(data);
  const auto = data.autoCalc !== false;
  const shown = (key) => auto ? calc[key] : (data["calc-" + key] ?? calc[key]);

  // Look up what a map entry should print. Keys look like "data:level", "calc:prof", "fn:spellAbility".
  const valueOf = (mapKey) => {
    const [kind, key] = mapKey.split(":");
    if (kind === "calc") return shown(key);
    if (kind === "fn" && key === "spellAbility") {
      return (ABILITIES.find(([k]) => k === data["spell-ability"]) || [])[1] || "";
    }
    if (key === "characterName") return character.name || data.characterName;
    return data[key];
  };

  const response = await fetch(EDU_TEMPLATE_URL);
  if (!response.ok) throw new Error("Could not load the PDF template (" + response.status + ")");
  const pdfDoc = await PDFDocument.load(await response.arrayBuffer());
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.05, 0.05, 0.05);
  const pages = [pdfDoc.getPage(0), pdfDoc.getPage(1)];

  const truncated = [];     // names of boxes whose text had to be shortened
  const nice = (k) => k.split(":")[1].replace(/-/g, " ");

  // ----- single boxes of text -----
  // Every box wraps onto more lines (and shrinks) when the text is too long for one line.
  for (const t of EDU_PDF_MAP.text) {
    const raw = valueOf(t.k);
    if (raw === undefined || raw === null || raw === "") continue;
    const text = pdfSafe(raw);
    const [x0, y0, x1, y1] = t.r;
    const w = x1 - x0 - 4, h = y1 - y0;
    const page = pages[t.page];

    const fit = fitText(font, text, w, h, t.size, t.multi ? 6 : 6.5);
    if (fit.truncated) truncated.push(nice(t.k));
    const lineH = fit.size * LINE_HEIGHT;
    // paragraph boxes start at the top; one-line boxes centre their text vertically
    const top = t.multi ? y0 + 2 : y0 + (h - fit.lines.length * lineH) / 2;
    fit.lines.forEach((line, i) => {
      const tw = font.widthOfTextAtSize(line, fit.size);
      const x = t.align === 1 ? x0 + (x1 - x0 - tw) / 2 : t.align === 2 ? x1 - 2 - tw : x0 + 2;
      page.drawText(line, { x, y: EDU_PAGE_HEIGHT - top - fit.size * 0.85 - i * lineH, size: fit.size, font, color: ink });
    });
  }

  // ----- text that flows across several boxes (class features: left column then right) -----
  for (const f of EDU_PDF_MAP.flows) {
    const raw = valueOf(f.k);
    if (!raw) continue;
    const text = pdfSafe(raw);
    const width = f.rs[0][2] - f.rs[0][0] - 4;
    const heights = f.rs.map(r => r[3] - r[1]);
    const minSize = 6;
    let size = f.size, lines, capacities;
    for (; size >= minSize; size -= 0.5) {
      lines = wrapToWidth(font, text, size, width);
      capacities = heights.map(h => Math.floor(h / (size * LINE_HEIGHT)));
      if (lines.length <= capacities.reduce((a, b) => a + b, 0)) break;
    }
    if (size < minSize) {            // still too long: cut it and end with "..."
      size = minSize;
      capacities = heights.map(h => Math.floor(h / (size * LINE_HEIGHT)));
      lines = wrapToWidth(font, text, size, width).slice(0, capacities.reduce((a, b) => a + b, 0));
      let last = lines[lines.length - 1];
      while (last.length > 0 && font.widthOfTextAtSize(last + "...", size) > width) last = last.slice(0, -1);
      lines[lines.length - 1] = last + "...";
      truncated.push(nice(f.k));
    }
    let box = 0, row = 0;
    for (const line of lines) {
      if (row >= capacities[box] && box < f.rs.length - 1) { box++; row = 0; }
      const r = f.rs[box];
      pages[f.page].drawText(line, { x: r[0] + 2, y: EDU_PAGE_HEIGHT - r[1] - 2 - size * 0.85 - row * size * LINE_HEIGHT, size, font, color: ink });
      row++;
    }
  }

  // ----- tick marks: a dot for round boxes, a diamond for diamond boxes -----
  const mark = (page, r, shape) => {
    const cx = (r[0] + r[2]) / 2, cy = EDU_PAGE_HEIGHT - (r[1] + r[3]) / 2;
    const side = Math.min(r[2] - r[0], r[3] - r[1]);
    if (shape === "circle") {
      page.drawCircle({ x: cx, y: cy, size: side * 0.32, color: ink });
    } else {
      const d = side * 0.46;
      page.drawSvgPath(`M 0 ${-d} L ${d} 0 L 0 ${d} L ${-d} 0 Z`, { x: cx, y: cy, color: ink });
    }
  };
  for (const c of EDU_PDF_MAP.checks) {
    if (valueOf(c.k) === true) mark(pages[c.page], c.r, c.shape);
  }
  // spell slots: "used" is a number, so tick that many diamonds from the left
  for (const c of EDU_PDF_MAP.counts) {
    const n = Math.min(parseInt(valueOf(c.k), 10) || 0, c.rs.length);
    for (let i = 0; i < n; i++) mark(pages[c.page], c.rs[i], c.shape);
  }

  const bytes = await pdfDoc.save();
  bytes.truncated = truncated;      // savePdfFile warns the user about these
  return bytes;
}

// Tell the engine this sheet can export
SHEETS.edu.exportPdf = async (character) => savePdfFile(await buildEduPdf(character), character);
