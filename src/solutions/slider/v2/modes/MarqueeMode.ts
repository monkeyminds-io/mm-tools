/**
 * MonkeyMinds Slider v1.2 - Marquee Mode (Refactored)
 * Smooth infinite scrolling with seamless looping
 * 
 * Performance Strategy: Use GSAP's modifiers to create a seamless
 * loop by wrapping the position. This is the MOST performant approach:
 * - One GSAP animation (GPU accelerated)
 * - No DOM manipulation during animation
 * - No position resets (no jumps)
 * - Seamless infinite loop
 * - Fewer clones needed
 */
import { SliderMode, MarqueeDependencies } from '../types';
import { getGSAP } from '@shared/types/gsap-types';

export class MarqueeMode implements SliderMode {
  private container: HTMLElement;
  private track: HTMLElement;
  private items: HTMLElement[];
  private config: MarqueeDependencies['config'];
  private timeline: any = null;

  constructor(deps: MarqueeDependencies) {
    this.container = deps.container;
    this.track = deps.track;
    this.items = deps.items;
    this.config = deps.config;
  }

  public init(): void {
    this.setupTrack();
    this.cloneItems();
    this.createSeamlessAnimation();
    
    if (this.config.pauseOnHover) {
      this.setupHoverPause();
    }
  }

  /**
   * Setup track for horizontal marquee
   */
  private setupTrack(): void {
    const gsap = getGSAP()!;
    
    // Track styling for horizontal marquee
    gsap.set(this.track, {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      willChange: 'transform'
    });

    // Apply gap to all items
    this.items.forEach(item => {
      item.style.marginRight = `${this.config.gap}px`;
    });
  }

  /**
   * Clone items - we only need enough to create seamless loop
   * Just 1 extra set is enough with modulo wrapping!
   */
  private cloneItems(): void {
    const originalCount = this.items.length;
    
    // Clone the entire set once for seamless loop
    this.items.forEach(item => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.style.marginRight = `${this.config.gap}px`;
      clone.setAttribute('data-clone', 'true');
      this.track.appendChild(clone);
    });
    
    console.log(`🐒 Marquee: Cloned ${originalCount} items for seamless loop`);
  }

  /**
   * Get width of one complete set of original items
   */
  private getSetWidth(): number {
    let width = 0;
    this.items.forEach(item => {
      width += item.offsetWidth // + this.config.gap;
    });
    return width;
  }

  /**
   * Create seamless animation using GSAP modifiers
   * This wraps the position for infinite scrolling with NO jumps
   */
  private createSeamlessAnimation(): void {
    const gsap = getGSAP()!;
    const setWidth = this.getSetWidth();
    const duration = setWidth / this.config.speed;

    this.timeline = gsap.timeline({
      repeat: -1
    });

    if (this.config.direction === 'left') {
      // Animate infinitely left with modulo wrapping
      this.timeline.fromTo(
        this.track,
        { x: 0 },
        {
          x: -setWidth,
          duration: duration,
          ease: 'none',
          modifiers: {
            x: (x: any) => {
              // Wrap position using modulo for seamless loop
              const xNum = parseFloat(x);
              return `${xNum % setWidth}px`;
            }
          }
        }
      );
    } else {
      // Animate infinitely right with modulo wrapping
      this.timeline.fromTo(
        this.track,
        { x: -setWidth },
        {
          x: 0,
          duration: duration,
          ease: 'none',
          modifiers: {
            x: (x: any) => {
              // Wrap position using modulo for seamless loop
              const xNum = parseFloat(x);
              return `${-(Math.abs(xNum) % setWidth)}px`;
            }
          }
        }
      );
    }
  }

  /**
   * Setup hover pause functionality
   */
  private setupHoverPause(): void {
    if (!this.timeline) return;

    this.container.addEventListener('mouseenter', () => {
      this.timeline.pause();
    });

    this.container.addEventListener('mouseleave', () => {
      this.timeline.play();
    });
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Clean up timeline
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    // Remove clones
    const clones = this.track.querySelectorAll<HTMLElement>('[data-clone="true"]');
    clones.forEach(clone => clone.remove());
  }
}