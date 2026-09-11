/**
 * ScrollTracker - High performance passive scroll & velocity telemetry engine.
 * Decoupled from React state loops to maintain 60-120fps with zero layout thrashing.
 */

class ScrollTracker {
  public scrollY = 0;
  public scrollVelocity = 0; // px/sec or smoothed delta
  public scrollProgress = 0; // 0 to 1
  private lastScrollY = 0;
  private lastTime = 0;
  private isListening = false;
  private rafId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isListening) return;
    this.isListening = true;
    this.scrollY = window.scrollY || 0;
    this.lastScrollY = this.scrollY;
    this.lastTime = performance.now();

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.startDecayLoop();
  }

  private handleScroll = () => {
    const now = performance.now();
    const dt = Math.max(1, now - this.lastTime);
    const currentY = window.scrollY || 0;
    const dy = currentY - this.lastScrollY;

    // Instantaneous velocity (px/ms * 1000 = px/s), clamped to avoid huge spikes
    const instantVelocity = (dy / dt) * 1000;
    // Exponential moving average for silky smooth velocity
    this.scrollVelocity = this.scrollVelocity * 0.75 + Math.max(-2500, Math.min(2500, instantVelocity)) * 0.25;

    this.scrollY = currentY;
    this.lastScrollY = currentY;
    this.lastTime = now;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.scrollProgress = Math.min(1, Math.max(0, currentY / maxScroll));
  };

  private startDecayLoop = () => {
    const loop = () => {
      // Smoothly decay velocity towards 0 when not actively scrolling
      if (Math.abs(this.scrollVelocity) > 0.05) {
        this.scrollVelocity *= 0.90; // Natural spring-like damping
      } else {
        this.scrollVelocity = 0;
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  };

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll);
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.isListening = false;
    }
  }
}

// Export singleton instance
export const scrollTracker = typeof window !== 'undefined' ? new ScrollTracker() : ({} as ScrollTracker);
