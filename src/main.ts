import {LitElement, html, nothing, type TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import 'mdui/mdui.css';
import './app.css';
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
import {emptyResume, parseResume, sampleResume, textToDraft, type Education, type Experience, type Resume} from './resume';
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
  createRenderRoot() { return this; }

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
        <div><h2 id="panel-title">Content</h2><p class="sub">Add and edit your information. Changes update live.</p></div>
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
      <div class="panel-head"><div><h2 id="panel-title">Templates</h2><p class="sub">Pick a look for your resume. Applies instantly to the preview and PDF.</p></div></div>
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
      <div class="panel-head"><div><h2 id="panel-title">Design</h2><p class="sub">Tune the accent color used across the editor and resume.</p></div></div>
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
      <div class="panel-head"><div><h2 id="panel-title">Settings</h2><p class="sub">App preferences and draft management.</p></div></div>
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
        <h2 class="r-name">${r.name || 'Your Name'}</h1>
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
        <nav class="nav" aria-label="Resume Studio">
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
        <main class="workspace">
          <section class="editor" aria-labelledby="panel-title">
            ${this.page === 'content' ? this.contentPanel()
              : this.page === 'templates' ? this.templatesPanel()
              : this.page === 'design' ? this.designPanel()
              : this.settingsPanel()}
          </section>
          <section class="preview" aria-labelledby="preview-title">
            <div class="panel-head">
              <div><h2 id="preview-title">Preview</h2><p class="sub">See your resume in real time.</p></div>
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
        </main>
      </div>`;
  }
}
