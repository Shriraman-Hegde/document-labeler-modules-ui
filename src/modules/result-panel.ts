import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("result-panel")
export class ResultPanel extends LitElement {
  @property({ type: String }) payload = "";
  @property({ type: Boolean }) open = false;

  static styles = css`
    :host {
      display: block;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--line);
      animation: rise 420ms ease both;
    }
    :host([hidden]) {
      display: none;
    }
    h2 {
      margin: 0 0 0.75rem;
      font-family: var(--font-display);
      font-size: 1.5rem;
    }
    pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      max-height: 420px;
      background: rgba(26, 23, 20, 0.06);
      border: 1px solid var(--line);
      font-size: 0.85rem;
      line-height: 1.45;
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

  render() {
    if (!this.open) return html``;
    return html`
      <h2>Results</h2>
      <pre>${this.payload}</pre>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "result-panel": ResultPanel;
  }
}
