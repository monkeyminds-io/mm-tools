/**
 * MonkeyMinds Flip Counter
 * Simple flip counter with timer and counter modes
 * 
 * Attributes:
 * - mm-tool="flip-counter"
 * - mm-counter-mode="timer|counter" (default: counter)
 * - mm-counter-direction="up|down" (default: up)
 * - mm-counter-divider=":" (default: :)
 * - mm-counter-speed="1000" (ms, default: 1000)
 * 
 * Timer Mode:
 * - mm-counter-target-date="2026-01-01T00:00:00" (ISO 8601 format, required)
 * 
 * Counter Mode:
 * - mm-counter-start="0" (default: 0)
 * - mm-counter-target="1000" (omit or "infinite" for endless)
 * - mm-counter-increment="1" (default: 1)
 */

import { CounterMode as ICounterMode, BaseConfig, BaseDependencies } from './types';
import { TimerMode } from './modes/TimerMode';
import { CounterMode } from './modes/CounterMode';

// GSAP helper
function requireGSAP(): any {
  if (typeof window !== 'undefined' && (window as any).gsap) {
    return (window as any).gsap;
  }
  throw new Error(
    'MonkeyMinds Flip Counter: GSAP is required. ' +
    'Please include GSAP before this script: ' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
  );
}

// Utility to parse number from attribute
function getAttributeNumber(element: HTMLElement, attr: string, defaultValue: number): number {
  const value = element.getAttribute(attr);
  return value ? parseInt(value, 10) : defaultValue;
}

class FlipCounter {
  private container: HTMLElement;
  private display: HTMLElement | null = null;
  private mode: ICounterMode | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    
    const gsap = requireGSAP();
    
    this.display = container.querySelector<HTMLElement>('[mm-counter-element="display"]');
    if (!this.display) {
      console.error('MonkeyMinds Flip Counter: Display element not found');
      return;
    }

    const config: BaseConfig = {
      mode: (container.getAttribute('mm-counter-mode') as 'timer' | 'counter') || 'counter',
      direction: (container.getAttribute('mm-counter-direction') as 'up' | 'down') || 'up',
      divider: container.getAttribute('mm-counter-divider') || ',',
      speed: getAttributeNumber(container, 'mm-counter-speed', 1000)
    };

    const deps: BaseDependencies = {
      container,
      display: this.display,
      config,
      gsap
    };

    // Route to mode
    if (config.mode === 'timer') {
      this.mode = new TimerMode(deps);
    } else {
      this.mode = new CounterMode(deps);
    }

    this.mode.init();
  }

  public destroy(): void {
    if (this.mode) {
      this.mode.destroy();
    }
  }
}

// Auto-init
function initFlipCounters(): void {
  const containers = document.querySelectorAll<HTMLElement>('[mm-tool="flip-counter"]');
  containers.forEach(container => new FlipCounter(container));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlipCounters);
} else {
  initFlipCounters();
}

// Expose for manual init if needed
(window as any).MonkeyMindsFlipCounter = FlipCounter;