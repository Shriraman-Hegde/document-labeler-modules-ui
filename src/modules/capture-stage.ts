import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("capture-stage")
export class CaptureStage extends LitElement {
  @property({ type: String }) previewUrl = "";
  @property({ type: String }) fallback = "Camera opens here — or choose a file below.";
  @property({ type: Boolean }) cameraOn = false;

  @query("#preview") private preview!: HTMLVideoElement;
  @query("#snap") private snap!: HTMLCanvasElement;

  private stream: MediaStream | null = null;

  static styles = css`
    :host {
      display: block;
      position: relative;
      min-height: min(62vh, 560px);
      overflow: hidden;
      border: 1px solid var(--line);
      background:
        linear-gradient(180deg, rgba(26, 23, 20, 0.04), rgba(26, 23, 20, 0.12)),
        #2a3036;
      box-shadow: 0 24px 60px var(--shadow);
    }
    video,
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback {
      position: absolute;
      inset: auto 1.25rem 1.25rem;
      margin: 0;
      color: #efe8df;
      font-size: 0.95rem;
    }
    canvas {
      display: none;
    }
  `;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopCamera();
  }

  async enableCamera(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    this.cameraOn = true;
    this.previewUrl = "";
    await this.updateComplete;
    this.preview.srcObject = this.stream;
    this.dispatchEvent(new CustomEvent("camera-ready", { bubbles: true, composed: true }));
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.cameraOn = false;
  }

  async captureFrame(): Promise<Blob | null> {
    if (!this.stream) return null;
    const track = this.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    const w = settings.width || this.preview.videoWidth || 1280;
    const h = settings.height || this.preview.videoHeight || 720;
    this.snap.width = w;
    this.snap.height = h;
    const ctx = this.snap.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(this.preview, 0, 0, w, h);
    return new Promise((resolve) => {
      this.snap.toBlob((blob) => {
        if (blob) {
          this.previewUrl = URL.createObjectURL(blob);
          this.cameraOn = false;
        }
        resolve(blob);
      }, "image/jpeg", 0.92);
    });
  }

  showFilePreview(file: File): void {
    if (file.type.startsWith("image/")) {
      this.previewUrl = URL.createObjectURL(file);
      this.fallback = "";
    } else {
      this.previewUrl = "";
      this.fallback = `PDF ready: ${file.name}`;
    }
  }

  render() {
    const showVideo = this.cameraOn && !this.previewUrl;
    const showImage = Boolean(this.previewUrl);
    return html`
      <video id="preview" playsinline autoplay muted ?hidden=${!showVideo}></video>
      <canvas id="snap"></canvas>
      <img alt="" src=${this.previewUrl} ?hidden=${!showImage} />
      <p class="fallback" ?hidden=${showVideo || showImage}>${this.fallback}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "capture-stage": CaptureStage;
  }
}
