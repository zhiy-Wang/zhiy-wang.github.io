import { OceanEngine } from './vendor/ascii-sharks/engine.js';

// Native equivalent of upstream AsciiOcean's useEffect / engine.destroy lifecycle:
// https://github.com/stackedlol/ascii-sharks/blob/c521e24a787e6d4cc460d4cf2b9815f25e4fe453/src/react.tsx
class AsciiHeroBackground extends HTMLElement {
  engine = null;
  mobile = null;

  connectedCallback() {
    this.mobile = window.matchMedia('(max-width: 620px)');
    this.mobile.addEventListener('change', this.onBreakpoint);
    window.addEventListener('pagehide', this.stop);
    window.addEventListener('pageshow', this.start);
    this.start();
  }

  disconnectedCallback() {
    this.stop();
    this.mobile.removeEventListener('change', this.onBreakpoint);
    window.removeEventListener('pagehide', this.stop);
    window.removeEventListener('pageshow', this.start);
    this.mobile = null;
  }

  start = () => {
    if (this.engine || !this.isConnected) return;
    const canvas = this.querySelector('canvas');
    if (!canvas || !window.ResizeObserver || !window.IntersectionObserver) return;
    const sharks = this.mobile.matches
      ? [{ kind: 'hammerhead', size: 0.9 }, { kind: 'classic', size: 0.65 }]
      : [{ kind: 'hammerhead', size: 1 }, { kind: 'classic', size: 0.8 }, { kind: 'mako', size: 0.65 }];
    try {
      this.engine = new OceanEngine(canvas, sharks);
    } catch (error) {
      // The homepage remains usable if the browser cannot create a 2D context.
      console.warn('ASCII ocean unavailable:', error);
    }
  };

  stop = () => {
    this.engine?.destroy();
    this.engine = null;
  };

  onBreakpoint = () => {
    this.stop();
    this.start();
  };
}

customElements.define('ascii-hero-background', AsciiHeroBackground);
