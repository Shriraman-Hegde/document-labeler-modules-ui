import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { persistApiBase, postScan, resolveApiBase } from "../lib/api";
import "./capture-stage";
import "./scan-form";
import "./result-panel";
import type { CaptureStage } from "./capture-stage";

@customElement("digitizer-app")
export class DigitizerApp extends LitElement {
  @state() private apiBase = resolveApiBase();
  @state() private dept = "stores";
  @state() private mode = "";
  @state() private status = "";
  @state() private canCapture = false;
  @state() private canScan = false;
  @state() private scanning = false;
  @state() private resultJson = "";
  @state() private showResults = false;

  @query("capture-stage") private stage!: CaptureStage;

  private pending: { blob: Blob; name: string } | null = null;

  static styles = css`
    :host {
      display: block;
      width: min(1120px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 2.5rem 0 4rem;
    }
    .brand-mark {
      margin: 0 0 0.75rem;
      font-family: var(--font-display);
      font-size: clamp(2.6rem, 6vw, 4.4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 0.95;
    }
    h1 {
      margin: 0;
      max-width: 16ch;
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 3vw, 2rem);
      font-weight: 560;
      line-height: 1.2;
    }
    .lede {
      margin: 0.85rem 0 0;
      max-width: 46ch;
      color: var(--steel);
      font-size: 1.05rem;
    }
    .capture {
      margin-top: 2rem;
      display: grid;
      gap: 1.25rem;
      animation: rise 560ms ease 80ms both;
    }
    header {
      animation: rise 480ms ease both;
    }
    @media (min-width: 900px) {
      .capture {
        grid-template-columns: 1.4fr 0.9fr;
        align-items: stretch;
      }
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  private async onEnableCamera() {
    try {
      await this.stage.enableCamera();
      this.canCapture = true;
      this.status = "Camera ready.";
    } catch (err) {
      this.status =
        "Camera unavailable — use Upload file. " +
        (err instanceof Error ? err.message : String(err));
    }
  }

  private async onCapture() {
    const blob = await this.stage.captureFrame();
    if (!blob) {
      this.status = "Capture failed.";
      return;
    }
    this.pending = { blob, name: "capture.jpg" };
    this.canScan = true;
    this.canCapture = false;
    this.status = "Frame captured — press Scan.";
  }

  private onFileChosen(file: File) {
    this.pending = { blob: file, name: file.name };
    this.stage.showFilePreview(file);
    this.canScan = true;
    this.status = "File selected — press Scan.";
  }

  private async onScan() {
    if (!this.pending) {
      this.status = "Capture or upload a document first.";
      return;
    }
    if (!this.dept.trim()) {
      this.status = "Department is required.";
      return;
    }
    const base = this.apiBase.trim().replace(/\/$/, "");
    if (!base) {
      this.status = "API base URL is required.";
      return;
    }
    persistApiBase(base);
    this.scanning = true;
    this.status = "Scanning…";
    try {
      const data = await postScan(base, {
        dept: this.dept.trim(),
        mode: this.mode || undefined,
        file: this.pending.blob,
        filename: this.pending.name,
      });
      this.showResults = true;
      this.resultJson = JSON.stringify(data, null, 2);
      const doc = data.documents?.[0];
      this.status = doc?.rescan ? "Rescan needed." : doc?.message || "Done.";
    } catch (err) {
      this.status = "Scan failed: " + (err instanceof Error ? err.message : String(err));
    } finally {
      this.scanning = false;
    }
  }

  render() {
    return html`
      <header>
        <p class="brand-mark">Digitizer</p>
        <h1>Capture the paper. Keep the schema.</h1>
        <p class="lede">
          Lit modules UI for the document-labeler API — camera or file upload, department catalogs stay private until promote.
        </p>
      </header>

      <section class="capture" aria-label="Document capture">
        <capture-stage></capture-stage>
        <scan-form
          .apiBase=${this.apiBase}
          .dept=${this.dept}
          .mode=${this.mode}
          .status=${this.status}
          .canCapture=${this.canCapture}
          .canScan=${this.canScan}
          .scanning=${this.scanning}
          @api-change=${(e: CustomEvent<string>) => (this.apiBase = e.detail)}
          @dept-change=${(e: CustomEvent<string>) => (this.dept = e.detail)}
          @mode-change=${(e: CustomEvent<string>) => (this.mode = e.detail)}
          @enable-camera=${() => this.onEnableCamera()}
          @capture=${() => this.onCapture()}
          @file-chosen=${(e: CustomEvent<File>) => this.onFileChosen(e.detail)}
          @scan=${() => this.onScan()}
        ></scan-form>
      </section>

      <result-panel .open=${this.showResults} .payload=${this.resultJson}></result-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "digitizer-app": DigitizerApp;
  }
}
