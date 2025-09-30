/**
 * MonkeyMinds Tools - Infinite Slider v1.1
 * GSAP-powered slider with multiple modes: marquee, discrete, curved
 * 
 * Attributes:
 * - mm-tool="infinite-slider"
 * - mm-slider-mode="marquee|slider|curved" (default: marquee)
 * - mm-slider-element="track" (container for items)
 * - mm-slider-element="item" (individual slide items)
 * - mm-slider-speed="50" (pixels per second for marquee, default: 50)
 * - mm-slider-direction="left|right" (default: left)
 * - mm-slider-gap="24" (marquee: pixels, curved: degrees between items, default: 24)
 * - mm-slider-pauseonhover="true|false" (default: true)
 * 
 * Curved mode specific:
 * - mm-slider-radius="400" (circle radius in pixels, default: 400)
 * - mm-slider-arc-position="top|bottom|left|right" (default: top)
 * - mm-slider-perspective="true|false" (enable 3D perspective, default: false)
 * - mm-slider-scale="true|false" (scale items by position, default: false)
 * - mm-slider-scale-range="0.6,1" (min,max scale values, default: 0.5,1)
 */
// =============================================================================
// Imports
// =============================================================================
import { getAttributeNumber } from '../../../../shared/utils';
import { GSAP, GSAPTimeline, requireGSAP } from '../../../../shared/types/gsap-types';

// =============================================================================
// Types
// =============================================================================
interface InfiniteSliderConfig {
  mode: 'slider' | 'marquee' | 'curved';
  speed: number;
  direction: 'left' | 'right';
  gap: number;
  pauseOnHover: boolean;
  // Curved mode specific
  radius: number;
  arcPosition: 'top' | 'bottom' | 'left' | 'right';
  arcSpan: number;
  perspective: boolean;
  perspectiveDepth: number;
  scale: boolean;
  scaleRange: [number, number];
}

class InfiniteSlider {
  private container: HTMLElement;
  private track: HTMLElement | null = null;
  private items: HTMLElement[] = [];
  private config: InfiniteSliderConfig | null = null;
  private gsap: GSAP;
  private timeline: GSAPTimeline | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Require GSAP with helpful error message
    this.gsap = requireGSAP('Infinite Slider');
    
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

    // Initialize based on mode
    this.init();
  }

  private parseConfig(): InfiniteSliderConfig {
    const scaleRangeStr = this.container.getAttribute('mm-slider-scale-range') || '0.5,1';
    const scaleRange = scaleRangeStr.split(',').map(v => parseFloat(v.trim())) as [number, number];

    return {
      mode: (this.container.getAttribute('mm-slider-mode') as 'slider' | 'marquee' | 'curved') || 'marquee',
      speed: getAttributeNumber(this.container, 'mm-slider-speed', 50),
      direction: (this.container.getAttribute('mm-slider-direction') as 'left' | 'right') || 'left',
      gap: getAttributeNumber(this.container, 'mm-slider-gap', 24),
      pauseOnHover: this.container.getAttribute('mm-slider-pauseonhover') !== 'false',
      // Curved mode
      radius: getAttributeNumber(this.container, 'mm-slider-radius', 400),
      arcPosition: (this.container.getAttribute('mm-slider-arc-position') as 'top' | 'bottom' | 'left' | 'right') || 'top',
      arcSpan: getAttributeNumber(this.container, 'mm-slider-arc-span', 180),
      perspective: this.container.getAttribute('mm-slider-perspective') === 'true',
      perspectiveDepth: getAttributeNumber(this.container, 'mm-slider-perspective-depth', 1000),
      scale: this.container.getAttribute('mm-slider-scale') === 'true',
      scaleRange: scaleRange
    };
  }

  private init(): void {
    if (!this.config) return;

    // Route to appropriate mode
    switch (this.config.mode) {
      case 'marquee':
        this.initMarquee();
        break;
      case 'slider':
        console.warn('MonkeyMinds Slider: Discrete slider mode not yet implemented');
        break;
      case 'curved':
        this.initCurved();
        break;
    }
  }

  // =============================================================================
  // Marquee Mode
  // =============================================================================
  private initMarquee(): void {
    this.setupMarqueeTrack();
    this.cloneItemsForMarquee();
    this.createMarqueeAnimation();
    
    if (this.config?.pauseOnHover) {
      this.setupHoverPause();
    }
  }

  private setupMarqueeTrack(): void {
    if (!this.track || !this.config) return;

    // Apply gap to all items
    this.items.forEach(item => {
      item.style.marginRight = `${this.config?.gap}px`;
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

  private cloneItemsForMarquee(): void {
    if (!this.track || !this.config) return;

    const trackWidth = this.getTrackWidth();
    const containerWidth = this.container.offsetWidth;
    
    // Need at least 2x container width for seamless loop
    const minTotalWidth = containerWidth * 2.5;
    const clonesNeeded = Math.ceil(minTotalWidth / trackWidth);
    
    // Clone the entire set of items multiple times
    for (let i = 0; i < clonesNeeded; i++) {
      this.items.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.style.marginRight = `${this.config?.gap}px`;
        clone.setAttribute('data-clone', 'true');
        this.track?.appendChild(clone);
      });
    }
  }

  private getTrackWidth(): number {
    if (!this.config) return 0;
    
    let width = 0;
    this.items.forEach(item => {
      width += item.offsetWidth + (this.config?.gap || 0);
    });
    return width;
  }

  private createMarqueeAnimation(): void {
    if (!this.track || !this.config) return;

    const trackWidth = this.getTrackWidth();
    const duration = trackWidth / this.config.speed;

    this.timeline = this.gsap.timeline({
      repeat: -1
    });

    if (this.config.direction === 'left') {
      // Left: Start at 0, move to -trackWidth
      this.timeline.fromTo(
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
      this.timeline.fromTo(
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

  // =============================================================================
  // Curved Mode
  // =============================================================================
  private initCurved(): void {
    this.setupCurvedContainer();
    this.cloneItemsForCurved();
    this.positionItemsOnCircle();
    this.createCurvedAnimation();
    
    if (this.config?.pauseOnHover) {
      this.setupHoverPause();
    }
  }

  private setupCurvedContainer(): void {
    if (!this.track || !this.config) return;

    const diameter = this.config.radius * 2;

    // Container needs overflow visible
    this.gsap.set(this.container, {
      position: 'relative',
      overflow: 'visible',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center'
    });

    // Track is the rotating wheel
    this.gsap.set(this.track, {
      position: 'relative',
      width: `${diameter}px`,
      height: `${diameter}px`,
      margin: '0 auto'
    });

    // Apply perspective to container if enabled
    if (this.config.perspective) {
      this.gsap.set(this.container, {
        perspective: this.config.perspectiveDepth,
        perspectiveOrigin: '50% 50%'
      });
    }
  }

  private cloneItemsForCurved(): void {
    if (!this.track || !this.config) return;

    const originalCount = this.items.length; // 5
    
    // Gap is in degrees - how much space between each item
    const gapDegrees = this.config.gap; // 10
    
    // How many total items can fit in 360 degrees
    const totalItemsNeeded = Math.floor(360 / gapDegrees);
    
    // How many complete sets do we need to reach that number
    const setsNeeded = Math.ceil(totalItemsNeeded / originalCount);
    
    // Clone items (setsNeeded - 1 because we already have 1 set)
    for (let i = 0; i < setsNeeded - 1; i++) {
        this.items.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute('data-clone', 'true');
        this.track?.appendChild(clone);
        });
    }

    // Update items array to include all items + clones
    this.items = Array.from(this.track.querySelectorAll<HTMLElement>('[mm-slider-element="item"]'));
  }

  private positionItemsOnCircle(): void {
    if (!this.config) return;

    const radius = this.config.radius;
    const center = radius;
    const totalItems = this.items.length;
    const angleStep = 360 / totalItems;
    const DEG2RAD = Math.PI / 180;

    this.items.forEach((item, i) => {
      const angle = i * angleStep;
      const x = center + radius * Math.sin(angle * DEG2RAD);
      const y = center - radius * Math.cos(angle * DEG2RAD);

      // Determine anchor point and rotation based on arc position
      //let xPercent = -50;
      //let yPercent = -50;
      let itemRotation = 0;

      switch (this.config?.arcPosition) {
        case 'top':
          //xPercent = -50;
          //yPercent = 0;
          itemRotation = angle;
          break;
        case 'bottom':
          //xPercent = -50;
          //yPercent = -100;
          itemRotation = angle + 180;
          break;
        case 'left':
          //xPercent = -100;
          //yPercent = -50;
          itemRotation = angle + 90;
          break;
        case 'right':
          //xPercent = 0;
          //yPercent = -50;
          itemRotation = angle - 90;
          break;
      }

      this.gsap.set(item, {
        position: 'absolute',
        x: x,
        y: y,
        //xPercent: xPercent,
        //yPercent: yPercent,
        rotation: itemRotation,
        transformOrigin: 'center center'
      });

      // Store angle for optional effects
      (item as any)._angle = angle;
    });

    // Apply optional scale based on position
    if (this.config.scale) {
      this.updateItemScales();
    }
  }

  private updateItemScales(): void {
    if (!this.config) return;

    const [minScale, maxScale] = this.config.scaleRange;
    const trackRotation = this.gsap.getProperty(this.track, 'rotation') as number || 0;

    this.items.forEach((item) => {
      const itemAngle = (item as any)._angle || 0;
      const totalAngle = (itemAngle + trackRotation) % 360;
      
      // Items at top (0/360°) are largest, bottom (180°) are smallest
      const normalizedAngle = (totalAngle + 360) % 360;
      const scaleFactor = (Math.cos((normalizedAngle - 180) * Math.PI / 180) + 1) / 2;
      const scale = minScale + (scaleFactor * (maxScale - minScale));

      this.gsap.set(item, { scale });
    });
  }

  private createCurvedAnimation(): void {
    if (!this.track || !this.config) return;

    const circumference = 2 * Math.PI * this.config.radius;
    const duration = circumference / this.config.speed;
    const rotationAmount = this.config.direction === 'left' ? 360 : -360;

    this.timeline = this.gsap.timeline({
      repeat: -1
    });

    this.timeline.to(this.track, {
      rotation: `+=${rotationAmount}`,
      duration: duration,
      ease: 'none',
      onUpdate: () => {
        if (this.config?.scale) {
          this.updateItemScales();
        }
      }
    });
  }

  // =============================================================================
  // Shared Methods
  // =============================================================================
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
    if (this.track) {
      const clones = this.track.querySelectorAll<HTMLElement>('[data-clone="true"]');
      clones.forEach(clone => clone.remove());
    }

    // Remove event listeners
    this.container.replaceWith(this.container.cloneNode(true));
  }
}

// =============================================================================
// Auto-initialization
// =============================================================================
function initInfiniteSliders(): void {
  const containers = document.querySelectorAll<HTMLElement>('[mm-tool="infinite-slider"]');
  containers.forEach(container => new InfiniteSlider(container));
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInfiniteSliders);
} else {
  initInfiniteSliders();
}

// Expose for manual initialization
(window as any).MonkeyMindsInfiniteSlider = InfiniteSlider;
