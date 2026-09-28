import {LitElement, css, html, nothing, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import 'mdui/mdui.css';
import 'mdui/components/button.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/text-field.js';
import 'mdui/components/chip.js';
import 'mdui/components/select.js';
import 'mdui/components/menu.js';
import 'mdui/components/menu-item.js';
import 'mdui/components/dropdown.js';
import 'mdui/components/switch.js';
import {setTheme} from 'mdui/functions/setTheme.js';
import {snackbar} from 'mdui/functions/snackbar.js';
import '@mdui/icons/add--rounded.js';
import '@mdui/icons/article--rounded.js';
import '@mdui/icons/auto-awesome--rounded.js';
import '@mdui/icons/badge--rounded.js';
import '@mdui/icons/check-circle--rounded.js';
import '@mdui/icons/close--rounded.js';
import '@mdui/icons/dark-mode--rounded.js';
import '@mdui/icons/delete--rounded.js';
import '@mdui/icons/description--rounded.js';
import '@mdui/icons/download--rounded.js';
import '@mdui/icons/drag-indicator--rounded.js';
import '@mdui/icons/draw--rounded.js';
import '@mdui/icons/edit--rounded.js';
import '@mdui/icons/event--rounded.js';
import '@mdui/icons/grid-view--rounded.js';
import '@mdui/icons/light-mode--rounded.js';
import '@mdui/icons/lightbulb--rounded.js';
import '@mdui/icons/link--rounded.js';
import '@mdui/icons/location-on--rounded.js';
import '@mdui/icons/mail--rounded.js';
import '@mdui/icons/more-vert--rounded.js';
import '@mdui/icons/palette--rounded.js';
import '@mdui/icons/person--rounded.js';
import '@mdui/icons/school--rounded.js';
import '@mdui/icons/settings--rounded.js';
import '@mdui/icons/share--rounded.js';
import '@mdui/icons/upload--rounded.js';
import '@mdui/icons/upload-file--rounded.js';
import '@mdui/icons/work--rounded.js';
import {emptyResume, parseResume, sampleResume, textToDraft, type Education, type Experience, type Resume} from './model';
import {extractPdfText} from './pdf';

const storageKey = 'resume-starter-v1';

type Page = 'content' | 'templates' | 'design' | 'settings';
type Template = 'modern' | 'classic' | 'minimal' | 'dark';

const TEMPLATES: {id: Template; label: string}[] = [
  {id: 'modern', label: 'Modern'},
  {id: 'classic', label: 'Classic'},
  {id: 'minimal', label: 'Minimal'},
  {id: 'dark', label: 'Bold'},
];

const ACCENTS = [
  {name: 'Violet', value: '#6c4df4'},
  {name: 'Blue', value: '#3b6ef0'},
  {name: 'Teal', value: '#0d9488'},
  {name: 'Rose', value: '#e14d7b'},
  {name: 'Amber', value: '#d97706'},
];

const LINKEDIN_SVG = 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.28 2.38 4.28 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z';
const GITHUB_SVG = 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.32-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.05.78 2.13v3.16c0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z';

@customElement('resume-app')
class ResumeApp extends LitElement {
  @state() private resume: Resume = sampleResume();
  @state() private page: Page = 'content';
  @state() private template: Template = 'modern';
  @state() private accent = ACCENTS[0].value;
  @state() private dark = false;
  @state() private saved = true;
  @state() private editPersonal = true;
  @state() private editSummary = false;
  @state() private editingExp: string | null = null;
  @state() private editingEdu: string | null = null;
  @state() private addingSkill = false;

  static styles = css`
    :host {
      --accent: #6c4df4;
      --accent-ink: #5b3ee6;
      --accent-soft: #efecfe;
      --bg: #f4f5fb;
      --card: #ffffff;
      --ink: #1e2230;
      --muted: #6b7280;
      --faint: #9aa1b2;
      --line: #e8eaf2;
      --ok: #16a34a;
      display: flex;
      min-height: 100vh;
      font: 15px/1.5 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--ink);
      background: var(--bg);
    }
    :host-context(.mdui-theme-dark) {
      --accent-soft: #28224d;
      --bg: #14161f;
      --card: #1d2029;
      --ink: #e8eaf2;
      --muted: #9aa1b2;
      --faint: #6b7280;
      --line: #2b2f3d;
    }
    * { box-sizing: border-box; }

    /* ---------- sidebar ---------- */
    .sidebar {
      width: 244px; flex: none; background: var(--card); border-right: 1px solid var(--line);
      display: flex; flex-direction: column; padding: 20px 14px; gap: 22px;
      position: sticky; top: 0; height: 100vh;
    }
    .brand { display: flex; gap: 12px; align-items: flex-start; padding: 0 4px; }
    .brand-icon {
      width: 40px; height: 40px; flex: none; border-radius: 10px; display: grid; place-items: center;
      background: var(--accent); color: #fff; box-shadow: 0 4px 10px color-mix(in srgb, var(--accent) 35%, transparent);
    }
    .brand-icon mdui-icon-description--rounded { font-size: 22px; }
    .brand h1 { margin: 0; font-size: 1.05rem; font-weight: 700; }
    .brand p { margin: 2px 0 0; font-size: .72rem; color: var(--muted); line-height: 1.35; }
    .nav { display: flex; flex-direction: column; gap: 4px; }
    .nav button {
      display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px;
      border: 0; border-radius: 10px; background: none; color: var(--muted);
      font: inherit; font-weight: 500; cursor: pointer; text-align: left; position: relative;
    }
    .nav button:hover { background: var(--bg); color: var(--ink); }
    .nav button.active { background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; }
    .nav button.active::before {
      content: ''; position: absolute; left: -14px; top: 8px; bottom: 8px; width: 4px;
      border-radius: 0 4px 4px 0; background: var(--accent);
    }
    .nav [class^='mdui-icon-'] { font-size: 21px; }
    .tip { margin-top: auto; background: var(--accent-soft); border-radius: 14px; padding: 14px; }
    .tip-title { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: .85rem; color: var(--accent-ink); }
    .tip-title mdui-icon-lightbulb--rounded { font-size: 17px; color: #f59e0b; }
    .tip p { margin: 6px 0 0; font-size: .75rem; color: var(--muted); line-height: 1.45; }

    /* ---------- shell / topbar ---------- */
    .shell { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .topbar {
      display: flex; justify-content: flex-end; align-items: center; gap: 10px;
      padding: 14px 28px; border-bottom: 1px solid var(--line); background: var(--card);
    }
    .topbar mdui-button-icon { color: var(--muted); }
    .topbar mdui-button { --shape-corner: 10px; }
    mdui-button { --mdui-color-primary: var(--accent); }
    mdui-button[variant='filled'] { background: var(--accent); color: #fff; }
    mdui-button[variant='outlined'] { border-color: var(--line); color: var(--ink); }

    /* ---------- workspace ---------- */
    .workspace { display: grid; grid-template-columns: minmax(400px, 560px) minmax(0, 1fr); gap: 26px; padding: 26px 28px; align-items: start; }
    .panel-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .panel-head h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .panel-head .sub { margin: 3px 0 0; font-size: .83rem; color: var(--muted); }
    .saved { display: inline-flex; align-items: center; gap: 5px; font-size: .75rem; font-weight: 600; color: var(--ok); white-space: nowrap; }
    .saved mdui-icon-check-circle--rounded { font-size: 15px; }
    .saved.err { color: #dc2626; font-weight: 500; }

    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; align-items: center; }
    input[type='file'] { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

    /* ---------- cards ---------- */
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
    .card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .card-head h3 { margin: 0; font-size: .95rem; font-weight: 700; flex: 1; }
    .card-icon {
      width: 32px; height: 32px; flex: none; border-radius: 9px; display: grid; place-items: center;
      background: var(--accent-soft); color: var(--accent-ink);
    }
    .card-icon [class^='mdui-icon-'] { font-size: 18px; }
    .edit-link {
      display: inline-flex; align-items: center; gap: 5px; border: 0; background: none; cursor: pointer;
      color: var(--accent-ink); font: inherit; font-size: .82rem; font-weight: 600; padding: 4px 6px; border-radius: 6px;
    }
    .edit-link:hover { background: var(--accent-soft); }
    .edit-link [class^='mdui-icon-'] { font-size: 15px; }

    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 14px; }
    .fld { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
    .fld.span2 { grid-column: 1 / -1; }
    .fld > span { font-size: .78rem; font-weight: 600; color: var(--muted); }
    mdui-text-field { width: 100%; }
    mdui-text-field::part(input) { font-size: .88rem; }
    .view-rows { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
    .view-rows div { min-width: 0; }
    .view-rows dt { font-size: .72rem; font-weight: 600; color: var(--faint); text-transform: uppercase; letter-spacing: .04em; }
    .view-rows dd { margin: 2px 0 0; font-size: .88rem; overflow-wrap: anywhere; }
    .summary-box {
      border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px;
      font-size: .88rem; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere;
    }
    .summary-box.empty { color: var(--faint); }

    /* ---------- chips ---------- */
    .chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    mdui-chip { font-weight: 600; font-size: .8rem; }
    mdui-chip::part(button) { background: var(--accent-soft); color: var(--accent-ink); }
    mdui-chip [slot='delete-icon'] { font-size: 14px; }
    .dashed {
      display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; cursor: pointer;
      border: 1.5px dashed color-mix(in srgb, var(--accent) 55%, transparent); border-radius: 999px;
      background: none; color: var(--accent-ink); font: inherit; font-size: .82rem; font-weight: 600;
    }
    .dashed:hover { background: var(--accent-soft); }
    .dashed.wide { width: 100%; justify-content: center; padding: 10px; border-radius: 10px; }
    .dashed [class^='mdui-icon-'] { font-size: 16px; }
    .add-skill { display: inline-flex; align-items: center; gap: 6px; }
    .add-skill mdui-text-field { width: 150px; }

    /* ---------- experience / education entries ---------- */
    .entry { display: flex; gap: 4px; padding: 10px 0; }
    .entry + .entry { border-top: 1px solid var(--line); }
    .grip { color: var(--faint); font-size: 18px; margin-top: 2px; cursor: grab; flex: none; }
    .entry-body { flex: 1; min-width: 0; }
    .entry-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .entry-top strong { font-size: .95rem; }
    .entry-top mdui-button-icon { color: var(--muted); }
    .entry-company { margin: 1px 0; color: var(--accent-ink); font-size: .85rem; font-weight: 600; }
    .entry-meta { display: flex; align-items: center; gap: 5px; margin: 2px 0 6px; color: var(--muted); font-size: .78rem; }
    .entry-meta [class^='mdui-icon-'] { font-size: 14px; }
    .entry-body ul { margin: 4px 0 0; padding-left: 18px; font-size: .85rem; color: var(--ink); }
    .entry-body li { margin: 2px 0; }
    .entry-form { display: flex; flex-direction: column; gap: 10px; padding: 6px 0 2px; }
    .entry-form .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .empty-note { color: var(--faint); font-size: .85rem; margin: 6px 0 10px; }
    .note { margin: 0 0 10px; font-size: .8rem; color: var(--muted); }

    /* ---------- template picker ---------- */
    .tpl-row { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 18px; }
    .tpl-field { display: flex; flex-direction: column; gap: 5px; }
    .tpl-field > span { font-size: .78rem; font-weight: 600; color: var(--muted); }
    mdui-select { min-width: 130px; }
    .thumbs { display: flex; gap: 10px; margin-left: auto; }
    .thumb {
      width: 52px; height: 66px; border-radius: 6px; cursor: pointer; padding: 6px;
      border: 2px solid var(--line); background: #fff; display: flex; flex-direction: column; gap: 4px;
      transition: border-color .15s, box-shadow .15s;
    }
    .thumb:hover { border-color: var(--faint); }
    .thumb.sel { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent); }
    .thumb i { display: block; height: 4px; border-radius: 2px; background: #c9cede; }
    .thumb i:first-child { height: 6px; width: 60%; }
    .thumb.modern { border-left-width: 5px; border-left-color: #d5cef8; }
    .thumb.modern.sel { border-left-color: var(--accent); }
    .thumb.classic i { margin: 0 auto; }
    .thumb.classic i:first-child { width: 45%; }
    .thumb.dark { background: #232a3d; } .thumb.dark i { background: #4a5470; }
    .thumb.dark i:first-child { background: #8b97b5; }

    /* ---------- resume paper ---------- */
    .paper-wrap { display: flex; justify-content: center; }
    .paper {
      background: #fff; color: #191c26; width: 100%; max-width: 780px; min-height: 900px;
      border-radius: 4px; box-shadow: 0 2px 8px rgb(20 22 40 / 8%), 0 12px 32px rgb(20 22 40 / 10%);
      padding: 44px 48px; font-size: .9rem; line-height: 1.5; overflow-wrap: anywhere;
    }
    .r-name { margin: 0; font-size: 1.9rem; font-weight: 800; letter-spacing: -.01em; }
    .r-headline { margin: 2px 0 0; font-size: 1rem; font-weight: 600; color: var(--accent-ink); }
    .r-contact { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 10px 0 0; font-size: .8rem; color: #565d70; }
    .r-contact span { display: inline-flex; align-items: center; gap: 5px; }
    .r-contact svg, .r-contact [class^='mdui-icon-'] { width: 14px; height: 14px; font-size: 14px; fill: #565d70; color: #565d70; }
    .r-sec { margin-top: 26px; }
    .r-sec > h3 {
      display: flex; align-items: center; gap: 10px; margin: 0 0 10px;
      font-size: .82rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #191c26;
    }
    .sec-icon {
      width: 26px; height: 26px; flex: none; border-radius: 50%; display: grid; place-items: center;
      background: var(--accent); color: #fff;
    }
    .sec-icon [class^='mdui-icon-'] { font-size: 14px; }
    .r-sec p { margin: 0; font-size: .86rem; color: #333a4d; }
    .r-pills { display: flex; flex-wrap: wrap; gap: 7px; }
    .r-pills span {
      background: var(--accent-soft); color: var(--accent-ink); font-weight: 600;
      font-size: .74rem; padding: 4px 12px; border-radius: 999px;
    }
    .r-job { margin-top: 14px; }
    .r-job:first-of-type { margin-top: 2px; }
    .r-job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .r-job-head strong { font-size: .95rem; }
    .r-dates { font-size: .76rem; color: #6b7280; white-space: nowrap; }
    .r-company { margin: 1px 0; font-size: .84rem; font-weight: 600; color: var(--accent-ink); }
    .r-loc { font-size: .76rem; color: #6b7280; margin: 0 0 5px; }
    .r-job ul { margin: 4px 0 0; padding-left: 18px; font-size: .85rem; color: #333a4d; }
    .r-job li { margin: 3px 0; }
    .r-job li::marker { color: var(--accent); }

    /* template variants */
    .paper.tpl-modern { border-left: 7px solid var(--accent); }
    .paper.tpl-classic { font-family: Georgia, 'Times New Roman', serif; }
    .paper.tpl-classic .r-name { text-align: center; font-weight: 700; }
    .paper.tpl-classic .r-headline, .paper.tpl-classic .r-contact { justify-content: center; text-align: center; color: #444; }
    .paper.tpl-classic .r-headline { font-weight: 400; font-style: italic; }
    .paper.tpl-classic .sec-icon { display: none; }
    .paper.tpl-classic .r-sec > h3 { border-bottom: 1px solid #999; padding-bottom: 5px; letter-spacing: .12em; }
    .paper.tpl-classic .r-company, .paper.tpl-classic .r-headline { color: #191c26; }
    .paper.tpl-classic .r-pills span { background: none; border: 1px solid #bbb; color: #333a4d; }
    .paper.tpl-classic .r-job li::marker { color: #191c26; }
    .paper.tpl-minimal .sec-icon { display: none; }
    .paper.tpl-minimal .r-sec > h3 { color: #6b7280; letter-spacing: .14em; font-weight: 700; }
    .paper.tpl-minimal .r-headline { color: #191c26; }
    .paper.tpl-minimal .r-company { color: #191c26; font-weight: 500; }
    .paper.tpl-minimal .r-pills span { background: #f0f1f5; color: #333a4d; }
    .paper.tpl-minimal .r-job li::marker { color: #9aa1b2; }
    .paper.tpl-dark { padding-top: 0; }
    .paper.tpl-dark .r-head { background: #232a3d; color: #fff; margin: 0 -48px 26px; padding: 34px 48px 28px; }
    .paper.tpl-dark .r-headline { color: #b9c2ff; }
    .paper.tpl-dark .r-contact { color: #c4cadb; }
    .paper.tpl-dark .r-contact svg, .paper.tpl-dark .r-contact [class^='mdui-icon-'] { fill: #c4cadb; color: #c4cadb; }
    .paper.tpl-dark .sec-icon { background: #232a3d; }

    /* ---------- misc panels ---------- */
    .panel { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 22px; }
    .panel h3 { margin: 0 0 6px; font-size: 1rem; }
    .panel p { margin: 0 0 14px; font-size: .85rem; color: var(--muted); }
    .swatches { display: flex; gap: 10px; }
    .swatch {
      width: 40px; height: 40px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0;
    }
    .swatch.sel { border-color: var(--ink); box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--line); }
    .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; }
    .settings-row + .settings-row { border-top: 1px solid var(--line); }
    .settings-row .lbl { font-size: .9rem; font-weight: 600; }
    .settings-row .hint { font-size: .78rem; color: var(--muted); margin: 2px 0 0; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-top: 8px; }
    .gallery .thumb { width: 100%; height: 150px; gap: 8px; padding: 12px; }
    .gallery .thumb i { height: 8px; }
    .gallery .thumb i:first-child { height: 12px; }
    .gallery-name { display: block; margin-top: 6px; font-size: .82rem; font-weight: 600; text-align: center; color: var(--muted); }

    @media (max-width: 1080px) {
      .workspace { grid-template-columns: 1fr; }
      .sidebar { width: 74px; padding: 20px 10px; }
      .brand div:not(.brand-icon), .nav button span, .tip p, .tip-title { display: none; }
      .nav button { justify-content: center; padding: 10px; }
      .tip { display: grid; place-items: center; padding: 10px; }
      .tip::after { content: '💡'; }
    }
    @media (max-width: 640px) {
      .sidebar { display: none; }
      .field-grid, .entry-form .row2 { grid-template-columns: 1fr; }
      .tpl-row { flex-wrap: wrap; } .thumbs { margin-left: 0; }
    }
    @media print {
      @page { size: letter; margin: 0; }
      :host { display: block; background: #fff; }
      .sidebar, .topbar, .editor, .tpl-row, .panel-head { display: none !important; }
      .workspace { display: block; padding: 0; }
      .paper { box-shadow: none; max-width: none; min-height: 0; border-radius: 0; width: auto; }
      .paper.tpl-modern { border-left-width: 0; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) this.resume = parseResume(saved);
    } catch {
      this.toast('Saved draft could not be loaded.');
    }
    this.style.setProperty('--accent', this.accent);
    this.style.setProperty('--accent-ink', this.accent);
    this.style.setProperty('--accent-soft', `${this.accent}1f`);
  }

  private toast(message: string) { snackbar({message, closeable: true}); }

  private commit(next: Resume) {
    this.resume = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      this.saved = true;
    } catch {
      this.saved = false;
      this.toast('Browser storage unavailable. Download JSON to keep your work.');
    }
  }

  private patch(patch: Partial<Resume>) { this.commit({...this.resume, ...patch}); }

  private setAccent(value: string) {
    this.accent = value;
    this.style.setProperty('--accent', value);
    this.style.setProperty('--accent-ink', value);
    this.style.setProperty('--accent-soft', `${value}1f`);
  }

  private setDark(on: boolean) {
    this.dark = on;
    setTheme(on ? 'dark' : 'light');
  }

  private save() {
    this.commit(this.resume);
    this.toast('Resume saved.');
  }

  private async share() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(this.resume, null, 2));
      this.toast('Resume JSON copied to clipboard.');
    } catch {
      this.toast('Clipboard unavailable — use Download JSON instead.');
    }
  }

  private downloadJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(this.resume, null, 2)], {type: 'application/json'}));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private pick(kind: 'pdf' | 'json') {
    this.renderRoot.querySelector<HTMLInputElement>(`#file-${kind}`)?.click();
  }

  private async importFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        this.commit(parseResume(await file.text()));
        this.toast('Resume JSON imported.');
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const text = await extractPdfText(file);
        this.commit(textToDraft(text));
        this.toast(text ? 'PDF text extracted. Review and move it into the fields.' : 'No selectable text found. Scanned PDFs need OCR (TODO).');
      } else {
        throw new Error('Choose a PDF or resume JSON file.');
      }
    } catch (err) {
      this.toast(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      input.value = '';
    }
  }

  private updateExp(id: string, patch: Partial<Experience>) {
    this.patch({experience: this.resume.experience.map(x => x.id === id ? {...x, ...patch} : x)});
  }

  private updateEdu(id: string, patch: Partial<Education>) {
    this.patch({education: this.resume.education.map(x => x.id === id ? {...x, ...patch} : x)});
  }

  private addSkill(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && !this.resume.skills.includes(value)) this.patch({skills: [...this.resume.skills, value]});
    this.addingSkill = false;
  }

  private navItem(page: Page, icon: TemplateResult, label: string) {
    return html`<button class=${this.page === page ? 'active' : ''} @click=${() => (this.page = page)}>${icon}<span>${label}</span></button>`;
  }

  private card(icon: TemplateResult, title: string, body: TemplateResult, edit?: TemplateResult) {
    return html`<div class="card">
      <div class="card-head"><span class="card-icon">${icon}</span><h3>${title}</h3>${edit ?? nothing}</div>
      ${body}
    </div>`;
  }

  private editToggle(editing: boolean, toggle: () => void) {
    return html`<button class="edit-link" @click=${toggle}>
      ${editing
        ? html`<mdui-icon-check-circle--rounded></mdui-icon-check-circle--rounded>Done`
        : html`<mdui-icon-edit--rounded></mdui-icon-edit--rounded>Edit`}
    </button>`;
  }

  private textField(label: string, value: string, onInput: (v: string) => void, opts: {icon?: TemplateResult; rows?: number; placeholder?: string; helper?: string; commitOnChange?: boolean} = {}) {
    const handler = (e: Event) => onInput((e.target as HTMLInputElement).value);
    return html`<label class="fld">${label ? html`<span>${label}</span>` : nothing}
      <mdui-text-field variant="outlined" .value=${value} placeholder=${opts.placeholder ?? ''}
        ?autosize=${!!opts.rows} .minRows=${opts.rows} .maxRows=${(opts.rows ?? 0) + 6}
        @input=${opts.commitOnChange ? nothing : handler} @change=${handler}>
        ${opts.icon ? html`<span slot="icon" style="display:inline-flex">${opts.icon}</span>` : nothing}
        ${opts.helper ? html`<span slot="helper">${opts.helper}</span>` : nothing}
      </mdui-text-field>
    </label>`;
  }

  /* ---------- editor panels ---------- */

  private contentPanel() {
    const r = this.resume;
    return html`
      <div class="panel-head">
        <div><h2>Content</h2><p class="sub">Add and edit your information. Changes update live.</p></div>
        <span class="saved ${this.saved ? '' : 'err'}">${this.saved
          ? html`<mdui-icon-check-circle--rounded></mdui-icon-check-circle--rounded>All changes saved`
          : 'Not saved — storage unavailable'}</span>
      </div>

      <div class="actions">
        <mdui-button variant="filled" @click=${() => { this.commit(sampleResume()); this.toast('Template loaded.'); }}>
          <mdui-icon-auto-awesome--rounded slot="icon"></mdui-icon-auto-awesome--rounded>Start from template
        </mdui-button>
        <mdui-button variant="outlined" @click=${() => this.pick('pdf')}>
          <mdui-icon-upload-file--rounded slot="icon"></mdui-icon-upload-file--rounded>Import PDF
        </mdui-button>
        <mdui-button variant="outlined" @click=${() => this.pick('json')}>
          <mdui-icon-upload--rounded slot="icon"></mdui-icon-upload--rounded>Import JSON
        </mdui-button>
        <mdui-dropdown placement="bottom-end">
          <mdui-button-icon slot="trigger"><mdui-icon-more-vert--rounded></mdui-icon-more-vert--rounded></mdui-button-icon>
          <mdui-menu>
            <mdui-menu-item @click=${this.downloadJson}>Download JSON</mdui-menu-item>
            <mdui-menu-item @click=${() => this.commit(emptyResume())}>Blank resume</mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>
        <input id="file-pdf" type="file" accept=".pdf,application/pdf" @change=${this.importFile}>
        <input id="file-json" type="file" accept=".json,application/json" @change=${this.importFile}>
      </div>

      ${this.card(html`<mdui-icon-badge--rounded></mdui-icon-badge--rounded>`, 'Personal Information',
        this.editPersonal ? html`
          <div class="field-grid">
            <div class="fld span2">${this.textField('Full name', r.name, v => this.patch({name: v}), {placeholder: 'Alex Morgan'})}</div>
            <div class="fld span2">${this.textField('Headline', r.headline, v => this.patch({headline: v}), {placeholder: 'Frontend Engineer'})}</div>
            ${this.textField('Email', r.email, v => this.patch({email: v}), {icon: html`<mdui-icon-mail--rounded></mdui-icon-mail--rounded>`, placeholder: 'alex@example.com'})}
            ${this.textField('Location', r.location, v => this.patch({location: v}), {icon: html`<mdui-icon-location-on--rounded></mdui-icon-location-on--rounded>`, placeholder: 'Remote'})}
            <div class="fld span2">${this.textField('Links', r.links.map(l => l.url).join(', '), v => this.patch({links: v.split(',').map(s => s.trim()).filter(Boolean).map(url => ({id: crypto.randomUUID(), url}))}), {icon: html`<mdui-icon-link--rounded></mdui-icon-link--rounded>`, placeholder: 'linkedin.com/in/you, github.com/you', helper: 'Separate multiple links with commas', commitOnChange: true})}</div>
          </div>` : html`
          <dl class="view-rows">
            <div><dt>Full name</dt><dd>${r.name || '—'}</dd></div>
            <div><dt>Headline</dt><dd>${r.headline || '—'}</dd></div>
            <div><dt>Email</dt><dd>${r.email || '—'}</dd></div>
            <div><dt>Location</dt><dd>${r.location || '—'}</dd></div>
            ${r.links.length ? html`<div><dt>Links</dt><dd>${r.links.map(l => l.url).join(', ')}</dd></div>` : nothing}
          </dl>`,
        this.editToggle(this.editPersonal, () => (this.editPersonal = !this.editPersonal)))}

      ${this.card(html`<mdui-icon-article--rounded></mdui-icon-article--rounded>`, 'Professional Summary',
        this.editSummary
          ? this.textField('', r.summary, v => this.patch({summary: v}), {rows: 4, placeholder: 'Builds accessible, reliable interfaces…'})
          : html`<div class="summary-box ${r.summary ? '' : 'empty'}">${r.summary || 'Add a short summary of your experience and strengths.'}</div>`,
        this.editToggle(this.editSummary, () => (this.editSummary = !this.editSummary)))}

      ${this.card(html`<mdui-icon-auto-awesome--rounded></mdui-icon-auto-awesome--rounded>`, 'Skills', html`
        <div class="chips">
          ${r.skills.map(s => html`
            <mdui-chip deletable @delete=${() => this.patch({skills: r.skills.filter(x => x !== s)})}>
              ${s}<mdui-icon-close--rounded slot="delete-icon"></mdui-icon-close--rounded>
            </mdui-chip>`)}
          ${this.addingSkill ? html`
            <span class="add-skill"><mdui-text-field variant="outlined" placeholder="Skill name"
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.addSkill(e.target as HTMLInputElement)}
              @change=${(e: Event) => this.addSkill(e.target as HTMLInputElement)}></mdui-text-field></span>` : html`
            <button class="dashed" @click=${() => (this.addingSkill = true)}>
              <mdui-icon-add--rounded></mdui-icon-add--rounded>Add skill
            </button>`}
        </div>`)}

      ${this.card(html`<mdui-icon-work--rounded></mdui-icon-work--rounded>`, 'Work Experience', html`
        ${r.experience.length ? r.experience.map(x => this.experienceEntry(x)) : html`<p class="empty-note">No roles yet.</p>`}
        <button class="dashed wide" @click=${() => {
          const id = crypto.randomUUID();
          this.patch({experience: [...r.experience, {id, role: '', company: '', dates: '', location: '', bullets: []}]});
          this.editingExp = id;
        }}><mdui-icon-add--rounded></mdui-icon-add--rounded>Add experience</button>`)}

      ${this.card(html`<mdui-icon-school--rounded></mdui-icon-school--rounded>`, 'Education', html`
        ${r.education.length ? r.education.map(x => this.educationEntry(x)) : html`<p class="empty-note">No education yet.</p>`}
        <button class="dashed wide" @click=${() => {
          const id = crypto.randomUUID();
          this.patch({education: [...r.education, {id, degree: '', school: '', dates: '', location: ''}]});
          this.editingEdu = id;
        }}><mdui-icon-add--rounded></mdui-icon-add--rounded>Add education</button>`)}

      ${r.importedText ? this.card(html`<mdui-icon-upload-file--rounded></mdui-icon-upload-file--rounded>`, 'Imported PDF text', html`
        <p class="note">Copy relevant content into the structured fields; extraction may reorder columns.</p>
        ${this.textField('', r.importedText, v => this.patch({importedText: v}), {rows: 8})}`) : nothing}
    `;
  }

  private experienceEntry(x: Experience) {
    if (this.editingExp === x.id) {
      return html`<div class="entry"><div class="entry-body entry-form">
        ${this.textField('Role', x.role, v => this.updateExp(x.id, {role: v}))}
        ${this.textField('Company', x.company, v => this.updateExp(x.id, {company: v}))}
        <div class="row2">
          ${this.textField('Dates', x.dates, v => this.updateExp(x.id, {dates: v}), {placeholder: 'Jan 2022 – Present'})}
          ${this.textField('Location', x.location, v => this.updateExp(x.id, {location: v}), {placeholder: 'Remote'})}
        </div>
        ${this.textField('Bullet points', x.bullets.join('\n'), v => this.updateExp(x.id, {bullets: v.split('\n').map(s => s.trim()).filter(Boolean)}), {rows: 4, helper: 'One bullet per line', commitOnChange: true})}
        <div><mdui-button variant="tonal" @click=${() => (this.editingExp = null)}>Done</mdui-button></div>
      </div></div>`;
    }
    return html`<div class="entry">
      <mdui-icon-drag-indicator--rounded class="grip"></mdui-icon-drag-indicator--rounded>
      <div class="entry-body">
        <div class="entry-top">
          <strong>${x.role || 'Role title'}</strong>
          <mdui-dropdown placement="bottom-end">
            <mdui-button-icon slot="trigger"><mdui-icon-more-vert--rounded></mdui-icon-more-vert--rounded></mdui-button-icon>
            <mdui-menu>
              <mdui-menu-item @click=${() => (this.editingExp = x.id)}>Edit</mdui-menu-item>
              <mdui-menu-item @click=${() => this.patch({experience: this.resume.experience.filter(e => e.id !== x.id)})}>Delete</mdui-menu-item>
            </mdui-menu>
          </mdui-dropdown>
        </div>
        <p class="entry-company">${x.company}</p>
        <p class="entry-meta"><mdui-icon-event--rounded></mdui-icon-event--rounded>${[x.dates, x.location].filter(Boolean).join(' · ')}</p>
        ${x.bullets.length ? html`<ul>${x.bullets.map(b => html`<li>${b}</li>`)}</ul>` : nothing}
      </div>
    </div>`;
  }

  private educationEntry(x: Education) {
    if (this.editingEdu === x.id) {
      return html`<div class="entry"><div class="entry-body entry-form">
        ${this.textField('Degree', x.degree, v => this.updateEdu(x.id, {degree: v}), {placeholder: 'B.S. Computer Science'})}
        ${this.textField('School', x.school, v => this.updateEdu(x.id, {school: v}))}
        <div class="row2">
          ${this.textField('Dates', x.dates, v => this.updateEdu(x.id, {dates: v}), {placeholder: '2010 – 2014'})}
          ${this.textField('Location', x.location, v => this.updateEdu(x.id, {location: v}))}
        </div>
        <div><mdui-button variant="tonal" @click=${() => (this.editingEdu = null)}>Done</mdui-button></div>
      </div></div>`;
    }
    return html`<div class="entry">
      <div class="entry-body">
        <div class="entry-top">
          <strong>${x.degree || 'Degree'}</strong>
          <mdui-dropdown placement="bottom-end">
            <mdui-button-icon slot="trigger"><mdui-icon-more-vert--rounded></mdui-icon-more-vert--rounded></mdui-button-icon>
            <mdui-menu>
              <mdui-menu-item @click=${() => (this.editingEdu = x.id)}>Edit</mdui-menu-item>
              <mdui-menu-item @click=${() => this.patch({education: this.resume.education.filter(e => e.id !== x.id)})}>Delete</mdui-menu-item>
            </mdui-menu>
          </mdui-dropdown>
        </div>
        <p class="entry-company">${x.school}</p>
        <p class="entry-meta">${[x.dates, x.location].filter(Boolean).join(' · ')}</p>
      </div>
    </div>`;
  }

  /* ---------- other pages ---------- */

  private templatesPanel() {
    return html`
      <div class="panel-head"><div><h2>Templates</h2><p class="sub">Pick a look for your resume. Applies instantly to the preview and PDF.</p></div></div>
      <div class="panel">
        <div class="gallery">
          ${TEMPLATES.map(t => html`<div>
            <button class="thumb ${t.id} ${this.template === t.id ? 'sel' : ''}" @click=${() => (this.template = t.id)}>
              <i></i><i></i><i></i><i></i><i></i>
            </button>
            <span class="gallery-name">${t.label}</span>
          </div>`)}
        </div>
      </div>`;
  }

  private designPanel() {
    return html`
      <div class="panel-head"><div><h2>Design</h2><p class="sub">Tune the accent color used across the editor and resume.</p></div></div>
      <div class="panel">
        <h3>Accent color</h3>
        <p>Used for headings, links, skill pills, and section icons.</p>
        <div class="swatches">
          ${ACCENTS.map(a => html`<button class="swatch ${this.accent === a.value ? 'sel' : ''}"
            style="background:${a.value}" title=${a.name} aria-label=${a.name}
            @click=${() => this.setAccent(a.value)}></button>`)}
        </div>
      </div>`;
  }

  private settingsPanel() {
    return html`
      <div class="panel-head"><div><h2>Settings</h2><p class="sub">App preferences and draft management.</p></div></div>
      <div class="panel">
        <div class="settings-row">
          <div><div class="lbl">Dark mode</div><p class="hint">Switch the editor theme. The resume preview stays print-ready.</p></div>
          <mdui-switch ?checked=${this.dark} @change=${() => this.setDark(!this.dark)}></mdui-switch>
        </div>
        <div class="settings-row">
          <div><div class="lbl">Saved draft</div><p class="hint">Your work auto-saves in this browser (localStorage).</p></div>
          <mdui-button variant="outlined" @click=${() => { localStorage.removeItem(storageKey); this.toast('Saved draft deleted. Current edits stay on screen.'); }}>
            <mdui-icon-delete--rounded slot="icon"></mdui-icon-delete--rounded>Delete draft
          </mdui-button>
        </div>
        <div class="settings-row">
          <div><div class="lbl">Export</div><p class="hint">Keep a portable backup of your resume data.</p></div>
          <mdui-button variant="outlined" @click=${this.downloadJson}>
            <mdui-icon-download--rounded slot="icon"></mdui-icon-download--rounded>Download JSON
          </mdui-button>
        </div>
      </div>`;
  }

  /* ---------- preview ---------- */

  private linkIcon(url: string) {
    const u = url.toLowerCase();
    if (u.includes('linkedin')) return html`<svg viewBox="0 0 24 24"><path d=${LINKEDIN_SVG}/></svg>`;
    if (u.includes('github')) return html`<svg viewBox="0 0 24 24"><path d=${GITHUB_SVG}/></svg>`;
    return html`<mdui-icon-link--rounded></mdui-icon-link--rounded>`;
  }

  private paper() {
    const r = this.resume;
    return html`<article class="paper tpl-${this.template}" aria-label="Resume preview">
      <header class="r-head">
        <h1 class="r-name">${r.name || 'Your Name'}</h1>
        ${r.headline ? html`<p class="r-headline">${r.headline}</p>` : nothing}
        <p class="r-contact">
          ${r.email ? html`<span><mdui-icon-mail--rounded></mdui-icon-mail--rounded>${r.email}</span>` : nothing}
          ${r.location ? html`<span><mdui-icon-location-on--rounded></mdui-icon-location-on--rounded>${r.location}</span>` : nothing}
          ${r.links.map(l => html`<span>${this.linkIcon(l.url)}${l.url.replace(/^https?:\/\/(www\.)?/, '')}</span>`)}
        </p>
      </header>
      ${r.summary ? html`<section class="r-sec">
        <h3><span class="sec-icon"><mdui-icon-person--rounded></mdui-icon-person--rounded></span>Professional Summary</h3>
        <p>${r.summary}</p>
      </section>` : nothing}
      ${r.skills.length ? html`<section class="r-sec">
        <h3><span class="sec-icon"><mdui-icon-draw--rounded></mdui-icon-draw--rounded></span>Skills</h3>
        <div class="r-pills">${r.skills.map(s => html`<span>${s}</span>`)}</div>
      </section>` : nothing}
      ${r.experience.length ? html`<section class="r-sec">
        <h3><span class="sec-icon"><mdui-icon-work--rounded></mdui-icon-work--rounded></span>Experience</h3>
        ${r.experience.map(x => html`<div class="r-job">
          <div class="r-job-head"><strong>${x.role || 'Role'}</strong><span class="r-dates">${x.dates}</span></div>
          <p class="r-company">${x.company}</p>
          ${x.location ? html`<p class="r-loc">${x.location}</p>` : nothing}
          ${x.bullets.length ? html`<ul>${x.bullets.map(b => html`<li>${b}</li>`)}</ul>` : nothing}
        </div>`)}
      </section>` : nothing}
      ${r.education.length ? html`<section class="r-sec">
        <h3><span class="sec-icon"><mdui-icon-school--rounded></mdui-icon-school--rounded></span>Education</h3>
        ${r.education.map(x => html`<div class="r-job">
          <div class="r-job-head"><strong>${x.degree || 'Degree'}</strong><span class="r-dates">${x.dates}</span></div>
          <p class="r-company">${x.school}</p>
          ${x.location ? html`<p class="r-loc">${x.location}</p>` : nothing}
        </div>`)}
      </section>` : nothing}
    </article>`;
  }

  render() {
    return html`
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-icon"><mdui-icon-description--rounded></mdui-icon-description--rounded></span>
          <div><h1>Resume Studio</h1><p>Create. Edit. Customize. Land your next opportunity.</p></div>
        </div>
        <nav class="nav">
          ${this.navItem('content', html`<mdui-icon-article--rounded></mdui-icon-article--rounded>`, 'Content')}
          ${this.navItem('design', html`<mdui-icon-palette--rounded></mdui-icon-palette--rounded>`, 'Design')}
          ${this.navItem('templates', html`<mdui-icon-grid-view--rounded></mdui-icon-grid-view--rounded>`, 'Templates')}
          ${this.navItem('settings', html`<mdui-icon-settings--rounded></mdui-icon-settings--rounded>`, 'Settings')}
        </nav>
        <div class="tip">
          <div class="tip-title"><mdui-icon-lightbulb--rounded></mdui-icon-lightbulb--rounded>Pro Tip</div>
          <p>Use action verbs and quantifiable results to make your resume stand out.</p>
        </div>
      </aside>
      <div class="shell">
        <header class="topbar">
          <mdui-button-icon title="AI suggestions" @click=${() => this.toast('AI suggestions are coming soon.')}>
            <mdui-icon-auto-awesome--rounded></mdui-icon-auto-awesome--rounded>
          </mdui-button-icon>
          <mdui-button-icon title="Toggle theme" @click=${() => this.setDark(!this.dark)}>
            ${this.dark ? html`<mdui-icon-light-mode--rounded></mdui-icon-light-mode--rounded>` : html`<mdui-icon-dark-mode--rounded></mdui-icon-dark-mode--rounded>`}
          </mdui-button-icon>
          <mdui-button variant="outlined" @click=${this.share}>
            <mdui-icon-share--rounded slot="icon"></mdui-icon-share--rounded>Share
          </mdui-button>
          <mdui-button variant="outlined" @click=${() => window.print()}>
            <mdui-icon-download--rounded slot="icon"></mdui-icon-download--rounded>Download PDF
          </mdui-button>
          <mdui-button variant="filled" @click=${this.save}>Save</mdui-button>
        </header>
        <div class="workspace">
          <section class="editor">
            ${this.page === 'content' ? this.contentPanel()
              : this.page === 'templates' ? this.templatesPanel()
              : this.page === 'design' ? this.designPanel()
              : this.settingsPanel()}
          </section>
          <section class="preview">
            <div class="panel-head">
              <div><h2>Preview</h2><p class="sub">See your resume in real time.</p></div>
            </div>
            <div class="tpl-row">
              <label class="tpl-field"><span>Template</span>
                <mdui-select variant="outlined" .value=${this.template}
                  @change=${(e: Event) => (this.template = (e.target as HTMLElement & {value: Template}).value)}>
                  ${TEMPLATES.map(t => html`<mdui-menu-item value=${t.id}>${t.label}</mdui-menu-item>`)}
                </mdui-select>
              </label>
              <div class="thumbs">
                ${TEMPLATES.map(t => html`<button class="thumb ${t.id} ${this.template === t.id ? 'sel' : ''}"
                  title=${t.label} aria-label=${`${t.label} template`} @click=${() => (this.template = t.id)}>
                  <i></i><i></i><i></i><i></i>
                </button>`)}
              </div>
            </div>
            <div class="paper-wrap">${this.paper()}</div>
          </section>
        </div>
      </div>`;
  }
}
