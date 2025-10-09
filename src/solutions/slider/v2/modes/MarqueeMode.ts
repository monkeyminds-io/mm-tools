/**
 * MonkeyMinds Slider v1.2 - Marquee Mode
 * Horizontal infinite scrolling marquee
 * 
 * Config Attributes:
 * N/A
 */
import { SliderMode, MarqueeDependencies } from '../types';
import { GSAPTimeline } from '../../../../shared/types/gsap-types';

export class MarqueeMode implements SliderMode {
  private container: HTMLElement;
  private track: HTMLElement;
  private items: HTMLElement[];
  private config: MarqueeDependencies['config'];
  private gsap: any;
  private timeline: GSAPTimeline | null = null;

  constructor(deps: MarqueeDependencies) {
    this.container = deps.container;
    this.track = deps.track;
    this.items = deps.items;
    this.config = deps.config;
    this.gsap = deps.gsap;
  }

  public init(): void {
    this.setupTrack();
    this.cloneItems();
    this.createAnimation();
    
    if (this.config.pauseOnHover) {
      this.setupHoverPause();
    }
  }

  private setupTrack(): void {
    // Apply gap to all items
    this.items.forEach(item => {
      item.style.marginRight = `${this.config.gap}px`;
    });

    // Track styling for horizontal marquee
    this.gsap.set(this.track, {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      width: 'max-content',
      willChange: 'transform'
    });
  }

  private cloneItems(): void {
    const trackWidth = this.getTrackWidth();
    const containerWidth = this.container.offsetWidth;
    
    // Need at least 2.5x container width for seamless loop
    const minTotalWidth = containerWidth * 2.5;
    const clonesNeeded = Math.ceil(minTotalWidth / trackWidth);
    
    // Clone the entire set of items multiple times
    for (let i = 0; i < clonesNeeded; i++) {
      this.items.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.style.marginRight = `${this.config.gap}px`;
        clone.setAttribute('data-clone', 'true');
        this.track.appendChild(clone);
      });
    }
  }

  private getTrackWidth(): number {
    let width = 0;
    this.items.forEach(item => {
      width += item.offsetWidth + this.config.gap;
    });
    return width;
  }

  private createAnimation(): void {
    const trackWidth = this.getTrackWidth();
    const duration = trackWidth / this.config.speed;

    this.timeline = this.gsap.timeline({
      repeat: -1
    });

    if (this.config.direction === 'left') {
      // Left: Start at 0, move to -trackWidth
      this.timeline?.fromTo(
        this.track,
        { x: 0 },
        {
          x: -trackWidth,
          duration: duration,
          ease: 'none',
          onRepeat: () => {
            this.gsap.set(this.track, { x: 0 });
          }
        }
      );
    } else {
      // Right: Start at -trackWidth, move to 0
      this.timeline?.fromTo(
        this.track,
        { x: -trackWidth },
        {
          x: 0,
          duration: duration,
          ease: 'none',
          onRepeat: () => {
            this.gsap.set(this.track, { x: -trackWidth });
          }
        }
      );
    }
  }

  private setupHoverPause(): void {
    if (!this.timeline) return;

    this.container.addEventListener('mouseenter', () => {
      this.timeline?.pause();
    });

    this.container.addEventListener('mouseleave', () => {
      this.timeline?.play();
    });
  }

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