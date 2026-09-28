# Resume Studio starter

Lit + TypeScript + MDUI 2 + AG Grid Community + Vite + Vitest. The app runs entirely in the browser.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

Open the URL printed by Vite. Use **Start from template** or **Blank resume**. Edit fields and double-click experience cells. A draft auto-saves in this browser. Download JSON as a portable editable backup. Use **Save as PDF / Print**, then choose “Save as PDF” in the browser print dialog. Test page breaks before sending a resume.

## PDF import: what it actually does

Import a text-based PDF to extract its text with PDF.js. The extraction lands in an **Imported PDF text** field for review. The first line is proposed as the name. Move content into the structured fields yourself. Multi-column layouts, glyphs, reading order, and line breaks can be inaccurate. Image-only/scanned PDFs require OCR, which is not included. Importing a PDF does **not** reproduce its original design or turn arbitrary layout into an editable template. For reliable future editing, retain the downloaded JSON alongside the PDF.

## Design

- `src/model.ts`: serializable resume schema, example template, import draft mapping.
- `src/pdf.ts`: local PDF text extraction, no server upload.
- `src/main.ts`: Lit editor, AG Grid experience table, MDUI controls, print preview.
- `tests/model.test.ts`: data validation and PDF draft mapping.
- Browser print generates the PDF from the same structured preview, so formatting remains under your control.

## Next tasks (in order)

- [ ] Split `resume-app` into editor, grid, and preview components; add focus management around import and status messages.
- [ ] Add structured Education, Projects, Certifications, Links, and multiple bullet points per job.
- [ ] Add multiple named resumes, schema versioning/migrations, and explicit autosave/error handling. Consider IndexedDB for larger drafts.
- [ ] Build 2–3 semantic HTML/CSS templates with theme tokens, paper-size controls, and page-break handling.
- [ ] Improve import: identify contact details and section headings from PDF text, present suggested mappings for confirmation, and preserve original extracted text. Add fixture PDFs and tests for reading order.
- [ ] Add an optional OCR path for scanned PDFs, with a visible privacy and processing choice.
- [ ] Add JSON import/export version checks, recovery UI, and a way to delete local drafts.
- [ ] Verify keyboard editing, focus, screen-reader labels, zoom, and PDF text selection; test printed output in Chrome/Safari and ATS parsing.
- [ ] If exact PDF layout editing is required, scope a separate PDF annotation/editor feature. PDF text extraction cannot reconstruct an arbitrary source layout.

AG Grid is used for tabular experience data; the document preview stays semantic HTML. Community edition is sufficient for this starter.
