/**
 * A tiny spring, parameterised the way Apple does it:
 *   response — seconds, how quickly it gets there (not a fixed duration)
 *   damping  — 1 = critically damped (no overshoot), < 1 = overshoot
 *
 * It always animates from its *current* value and velocity, so retargeting
 * mid-flight is seamless — that is what makes things interruptible.
 */
export class Spring {
  value: number;
  target: number;
  velocity = 0;
  private stiffness = 0;
  private damping = 0;

  constructor({ value = 0, response = 0.4, damping = 1 }: { value?: number; response?: number; damping?: number } = {}) {
    this.value = value;
    this.target = value;
    this.configure(response, damping);
  }

  configure(response: number, damping: number) {
    this.stiffness = Math.pow((2 * Math.PI) / response, 2);
    this.damping = (4 * Math.PI * damping) / response;
  }

  /** Advance by dt seconds. Returns true while still moving. */
  step(dt: number, epsilon = 0.01): boolean {
    let remaining = Math.min(dt, 0.064); // sub-step for stability on slow frames
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 240);
      const accel = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
      this.velocity += accel * h;
      this.value += this.velocity * h;
      remaining -= h;
    }
    const settled = Math.abs(this.value - this.target) < epsilon && Math.abs(this.velocity) < epsilon;
    if (settled) {
      this.value = this.target;
      this.velocity = 0;
    }
    return !settled;
  }

  snap(v: number) {
    this.value = this.target = v;
    this.velocity = 0;
  }
}

/** Apple's momentum projection (Designing Fluid Interfaces). velocity in units/s. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
