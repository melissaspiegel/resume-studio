# Resume Studio

Lit + TypeScript + MDUI 2 (+ `@mdui/icons`) + Vite + Vitest. The app runs entirely in the browser.

## Run

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

Open the URL printed by Vite. The app starts with a sample resume. Edit fields in the **Content** panel — the preview and autosave update live. Sections have an **Edit/Done** toggle; skills are chips you can delete or add; experience and education entries have an inline editor via their **⋯** menu. **Import PDF**/**Import JSON** restore a draft; the **⋯** menu offers **Download JSON** and **Blank resume**. **Templates** and **Design** in the sidebar switch the resume template and accent color; **Settings** has dark mode and draft management. **Download PDF** opens the browser print dialog — choose "Save as PDF". Test page breaks before sending a resume.

## PDF import: what it actually does

Import a text-based PDF to extract its text with PDF.js. The extraction lands in an **Imported PDF text** field for review. The first line is proposed as the name. Move content into the structured fields yourself. Multi-column layouts, glyphs, reading order, and line breaks can be inaccurate. Image-only/scanned PDFs require OCR, which is not included. Importing a PDF does **not** reproduce its original design or turn arbitrary layout into an editable template. For reliable future editing, retain the downloaded JSON alongside the PDF.

## Design

- `src/model.ts`: serializable resume schema (contact links, skill list, experience bullets, education), sample template, import draft mapping, and migration of v1 drafts.
- `src/pdf.ts`: local PDF text extraction, no server upload.
- `src/main.ts`: Lit app shell — sidebar nav, topbar actions, section-card editor, and a live template-aware preview. Icons come from `@mdui/icons` (SVG components, no icon font).
- `tests/model.test.ts`: data validation, v1 migration, and PDF draft mapping.
- Browser print generates the PDF from the same structured preview, so formatting remains under your control.

## Next tasks (in order)

- [ ] Split `resume-app` into editor, section-card, and preview components; add focus management around import and status messages.
- [ ] Add Projects, Certifications, and links sections; drag-to-reorder entries (grip handles are visual only today).
- [ ] Add multiple named resumes, schema versioning/migrations, and explicit autosave/error handling. Consider IndexedDB for larger drafts.
- [ ] Refine templates: paper-size controls, page-break handling, and per-template font pairing.
- [ ] Improve import: identify contact details and section headings from PDF text, present suggested mappings for confirmation, and preserve original extracted text. Add fixture PDFs and tests for reading order.
- [ ] Add an optional OCR path for scanned PDFs, with a visible privacy and processing choice.
- [ ] Add JSON import/export version checks, recovery UI, and a way to delete local drafts.
- [ ] Verify keyboard editing, focus, screen-reader labels, zoom, and PDF text selection; test printed output in Chrome/Safari and ATS parsing.
- [ ] If exact PDF layout editing is required, scope a separate PDF annotation/editor feature. PDF text extraction cannot reconstruct an arbitrary source layout.
