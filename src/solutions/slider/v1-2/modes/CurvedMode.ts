/**
 * MonkeyMinds Slider v1.2 - Curved Mode
 * Circular arc rotation with optional 3D effects
 * 
 * Config Attributes:
 * - mm-slider-radius="400" (circle radius in pixels, default: 400)
 * - mm-slider-arc-position="top|bottom|left|right" (default: top)
 * - mm-slider-perspective="true|false" (default: false)
 * - mm-slider-scale="true|false" (default: false)
 * - mm-slider-scale-range="0.6,1" (min,max scale, default: 0.5,1)
 */
import { SliderMode, CurvedDependencies, CurvedConfig } from '../types';
import { GSAPTimeline } from '../../../../shared/types/gsap-types';
import { getAttributeNumber } from '../../../../shared/utils';

export class CurvedMode implements SliderMode {
  private container: HTMLElement;
  private track: HTMLElement;
  private items: HTMLElement[];
  private baseConfig: CurvedDependencies['config'];
  private config: CurvedConfig;
  private gsap: any;
  private timeline: GSAPTimeline | null = null;

  constructor(deps: CurvedDependencies) {
    this.container = deps.container;
    this.track = deps.track;
    this.items = deps.items;
    this.baseConfig = deps.config;
    this.gsap = deps.gsap;
    
    // Parse curved-specific config from container
    this.config = this.parseCurvedConfig();
  }

  private parseCurvedConfig(): CurvedConfig {
    const scaleRangeStr = this.container.getAttribute('mm-slider-scale-range') || '1,0.5';
    const scaleRange = scaleRangeStr.split(',').map(v => parseFloat(v.trim())) as [number, number];
    
    return {
      ...this.baseConfig,
      radius: getAttributeNumber(this.container, 'mm-slider-radius', 400),
      arcPosition: (this.container.getAttribute('mm-slider-arc-position') as 'top' | 'bottom' | 'left' | 'right') || 'top',
      perspective: this.container.getAttribute('mm-slider-perspective') === 'true',
      perspectiveDepth: getAttributeNumber(this.container, 'mm-slider-perspective-depth', 1000),
      scale: this.container.getAttribute('mm-slider-scale') === 'true',
      scaleRange
    };
  }

  public init(): void {
    this.setupContainer();
    this.cloneItems();
    this.positionItemsOnCircle();
    this.createAnimation();
    
    if (this.config.pauseOnHover) {
      this.setupHoverPause();
    }
  }

  private setupContainer(): void {
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

  private cloneItems(): void {
    const originalCount = this.items.length;
    const gapDegrees = this.config.gap;
    
    // How many total items can fit in 360 degrees
    const totalItemsNeeded = Math.floor(360 / gapDegrees);
    
    // How many complete sets do we need
    const setsNeeded = Math.ceil(totalItemsNeeded / originalCount);
    
    // Clone items (setsNeeded - 1 because we already have 1 set)
    for (let i = 0; i < setsNeeded - 1; i++) {
      this.items.forEach(item => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute('data-clone', 'true');
        this.track.appendChild(clone);
      });
    }

    // Update items array to include all items + clones
    this.items = Array.from(this.track.querySelectorAll<HTMLElement>('[mm-slider-element="item"]'));
  }

  private positionItemsOnCircle(): void {
    const radius = this.config.radius;
    const center = radius;
    const totalItems = this.items.length;
    const angleStep = 360 / totalItems;
    const DEG2RAD = Math.PI / 180;

    this.items.forEach((item, i) => {
      const angle = i * angleStep;
      
      // Calculate position on circle (item center)
      const x = center + radius * Math.sin(angle * DEG2RAD);
      const y = center - radius * Math.cos(angle * DEG2RAD);

      // Determine rotation based on arc position
      let itemRotation = 0;

      switch (this.config.arcPosition) {
        case 'top':
          itemRotation = angle;
          break;
        case 'bottom':
          itemRotation = angle + 180;
          break;
        case 'left':
          itemRotation = angle + 90;
          break;
        case 'right':
          itemRotation = angle - 90;
          break;
      }

      this.gsap.set(item, {
        position: 'absolute',
        left: x,
        top: y,
        xPercent: -50,
        yPercent: -50,
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

  private createAnimation(): void {
    const circumference = 2 * Math.PI * this.config.radius;
    const duration = circumference / this.config.speed;
    const rotationAmount = this.config.direction === 'left' ? 360 : -360;

    this.timeline = this.gsap.timeline({
      repeat: -1
    });

    this.timeline?.to(this.track, {
      rotation: `+=${rotationAmount}`,
      duration: duration,
      ease: 'none',
      onUpdate: () => {
        if (this.config.scale) {
          this.updateItemScales();
        }
      }
    });
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