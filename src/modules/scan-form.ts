import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("scan-form")
export class ScanForm extends LitElement {
  @property({ type: String }) apiBase = "http://127.0.0.1:8091";
  @property({ type: String }) dept = "stores";
  @property({ type: String }) mode = "";
  @property({ type: String }) status = "";
  @property({ type: Boolean }) canCapture = false;
  @property({ type: Boolean }) canScan = false;
  @property({ type: Boolean }) scanning = false;
  @property({ type: Boolean }) relating = false;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0.25rem 0;
    }
    .field {
      display: grid;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--steel);
    }
    input,
    select {
      appearance: none;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.55);
      color: var(--ink);
      padding: 0.75rem 0.85rem;
      font: inherit;
      font-size: 1rem;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.35rem;
    }
    button,
    .file-btn {
      border: 1px solid transparent;
      padding: 0.8rem 1.1rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
      background: transparent;
      color: var(--ink);
    }
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .primary {
      background: var(--copper);
      color: #fff8f2;
    }
    .primary:not(:disabled):hover {
      background: var(--copper-deep);
      transform: translateY(-1px);
    }
    .ghost {
      border-color: var(--line);
    }
    .ghost:not(:disabled):hover {
      border-color: var(--steel);
    }
    .file-btn {
      display: inline-flex;
      align-items: center;
      border-color: var(--line);
    }
    .status {
      min-height: 1.4em;
      margin: 0;
      color: var(--steel);
      font-size: 0.95rem;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 400;
    }
  `;

  private emit(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <label class="field">
        <span>API base</span>
        <input
          type="url"
          .value=${this.apiBase}
          @change=${(e: Event) =>
            this.emit("api-change", (e.target as HTMLInputElement).value)}
        />
      </label>
      <label class="field">
        <span>Department</span>
        <input
          type="text"
          .value=${this.dept}
          @input=${(e: Event) =>
            this.emit("dept-change", (e.target as HTMLInputElement).value)}
        />
      </label>
      <label class="field">
        <span>Mode override</span>
        <select
          .value=${this.mode}
          @change=${(e: Event) =>
            this.emit("mode-change", (e.target as HTMLSelectElement).value)}
        >
          <option value="">auto</option>
          <option value="fully_learned">fully_learned</option>
          <option value="seeded_extensible">seeded_extensible</option>
          <option value="known_dynamic">known_dynamic</option>
        </select>
      </label>
      <div class="actions">
        <button type="button" class="ghost" @click=${() => this.emit("enable-camera")}>
          Enable camera
        </button>
        <button
          type="button"
          class="primary"
          ?disabled=${!this.canCapture}
          @click=${() => this.emit("capture")}
        >
          Capture
        </button>
        <label class="file-btn ghost">
          Upload file
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            hidden
            @change=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              const file = input.files?.[0];
              if (file) this.emit("file-chosen", file);
            }}
          />
        </label>
        <button
          type="button"
          class="primary"
          ?disabled=${!this.canScan || this.scanning}
          @click=${() => this.emit("scan")}
        >
          ${this.scanning ? "Scanning…" : "Scan"}
        </button>
        <button
          type="button"
          class="ghost"
          ?disabled=${this.relating || this.scanning}
          @click=${() => this.emit("relate")}
        >
          ${this.relating ? "Relating…" : "Relate"}
        </button>
      </div>
      <p class="status" role="status">${this.status}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "scan-form": ScanForm;
  }
}
