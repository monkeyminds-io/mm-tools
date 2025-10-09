/**
 * MonkeyMinds Slider v1.2
 * Unified slider solution with multiple modes
 * 
 * Attributes:
 * - mm-tool="slider"
 * - mm-slider-mode="marquee|curved|discrete" (default: marquee)
 * - mm-slider-element="track" (container for items)
 * - mm-slider-element="item" (individual slide items)
 * - mm-slider-speed="50" (pixels per second for marquee, default: 50)
 * - mm-slider-direction="left|right" (default: left)
 * - mm-slider-gap="24" (marquee: pixels, curved: degrees, default: 24)
 * - mm-slider-pauseonhover="true|false" (default: true)
 */

import { SliderMode, BaseConfig, BaseDependencies } from './types';
import { MarqueeMode } from './modes/MarqueeMode';
import { CurvedMode } from './modes/CurvedMode';
import { requireGSAP } from '../../../shared/types/gsap-types';
import { getAttributeNumber } from '../../../shared/utils';

// =============================================================================
// Main Slider Class (Factory)
// =============================================================================
class Slider {
  private container: HTMLElement;
  private track: HTMLElement | null = null;
  private items: HTMLElement[] = [];
  private config: BaseConfig | null = null;
  private mode: SliderMode | null = null;
  private gsap: any;

  constructor(container: HTMLElement) {
    this.container = container;

    // Require GSAP
    this.gsap = requireGSAP('Slider');
    
    // Find track element
    this.track = container.querySelector<HTMLElement>('[mm-slider-element="track"]');
    if (!this.track) {
      console.error('MonkeyMinds Slider: Track element not found');
      return;
    }

    // Get original items
    this.items = Array.from(this.track.querySelectorAll<HTMLElement>('[mm-slider-element="item"]'));
    if (this.items.length === 0) {
      console.error('MonkeyMinds Slider: No items found');
      return;
    }

    // Parse configuration
    this.config = this.parseConfig();

    // Initialize the appropriate mode
    this.init();
  }

  private parseConfig(): BaseConfig {
    const mode = (this.container.getAttribute('mm-slider-mode') as 'marquee' | 'curved' | 'discrete') || 'marquee';
    
    // Only parse base/common config here
    return {
      mode,
      speed: getAttributeNumber(this.container, 'mm-slider-speed', 50),
      direction: (this.container.getAttribute('mm-slider-direction') as 'left' | 'right') || 'left',
      gap: getAttributeNumber(this.container, 'mm-slider-gap', 24),
      pauseOnHover: this.container.getAttribute('mm-slider-pauseonhover') !== 'false'
    };
  }

  private init(): void {
    if (!this.config || !this.track) return;

    // Create base dependencies (same for all modes)
    const deps: BaseDependencies = {
      container: this.container,
      track: this.track,
      items: this.items,
      config: this.config,
      gsap: this.gsap
    };

    // Factory: Select and instantiate the appropriate mode
    switch (this.config.mode) {
      case 'marquee':
        this.mode = new MarqueeMode(deps);
        break;
      
      case 'curved':
        this.mode = new CurvedMode(deps);
        break;
      
      case 'discrete':
        console.warn('MonkeyMinds Slider: Discrete mode not yet implemented');
        return;
      
      default:
        console.error(`MonkeyMinds Slider: Unknown mode "${this.config.mode}"`);
        return;
    }

    // Initialize the selected mode
    this.mode.init();
  }

  public destroy(): void {
    if (this.mode) {
      this.mode.destroy();
      this.mode = null;
    }
  }
}

// =============================================================================
// Auto-initialization
// =============================================================================
function initSliders(): void {
  const containers = document.querySelectorAll<HTMLElement>('[mm-tool="slider"]');
  containers.forEach(container => new Slider(container));
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSliders);
} else {
  initSliders();
}

// Expose for manual initialization
(window as any).MonkeyMindsSlider = Slider;