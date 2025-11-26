/**
 * MonkeyMinds Slider v2 - Discrete Mode
 * Classic slider with prev/next navigation and autoplay
 * 
 * Features:
 * - Infinite loop
 * - Autoplay with pause on hover
 * - Slide or fade transitions
 * - Keyboard navigation (arrow keys)
 * - Touch/swipe support
 * - Custom duration and easing
 * 
 * Config Attributes:
 * - mm-slider-transition="slide|fade" (default: slide)
 * - mm-slider-duration="500" (transition duration in ms, default: 500)
 * - mm-slider-ease="power2.inOut" (GSAP ease, default: power2.inOut)
 * - mm-slider-autoplay="true|false" (default: false)
 * - mm-slider-autoplay-delay="3000" (delay between slides in ms, default: 3000)
 * - mm-slider-keyboard="true|false" (enable keyboard nav, default: true)
 * - mm-slider-swipe="true|false" (enable touch swipe, default: true)
 * 
 * Elements:
 * - mm-slider-element="prev" (optional prev button)
 * - mm-slider-element="next" (optional next button)
 * - mm-slider-element="pagination" (optional pagination container)
 */

import { SliderMode as ISliderMode, BaseDependencies } from '../types';
import { GSAPTimeline } from '../../../../shared/types/gsap-types';
import { getAttributeNumber } from '../../../../shared/utils';

interface DiscreteConfig {
  transition: 'slide' | 'fade';
  duration: number; // in milliseconds
  ease: string;
  autoplay: boolean;
  autoplayDelay: number; // in milliseconds
  keyboard: boolean;
  swipe: boolean;
}

export class DiscreteMode implements ISliderMode {
  private container: HTMLElement;
  private track: HTMLElement;
  private items: HTMLElement[];
  private baseConfig: BaseDependencies['config'];
  private config: DiscreteConfig;
  private gsap: any;
  
  // Navigation elements
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;
  private pagination: HTMLElement | null = null;
  private dots: HTMLElement[] = [];
  
  // State
  private currentIndex: number = 0;
  private isAnimating: boolean = false;
  private autoplayTimer: number | null = null;
  
  // Touch/swipe
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  constructor(deps: BaseDependencies) {
    this.container = deps.container;
    this.track = deps.track;
    this.items = deps.items;
    this.baseConfig = deps.config;
    this.gsap = deps.gsap;
    
    // Parse discrete-specific config
    this.config = this.parseDiscreteConfig();
  }

  private parseDiscreteConfig(): DiscreteConfig {
    return {
      transition: (this.container.getAttribute('mm-slider-transition') as 'slide' | 'fade') || 'slide',
      duration: getAttributeNumber(this.container, 'mm-slider-duration', 500),
      ease: this.container.getAttribute('mm-slider-ease') || 'power2.inOut',
      autoplay: this.container.getAttribute('mm-slider-autoplay') === 'true',
      autoplayDelay: getAttributeNumber(this.container, 'mm-slider-autoplay-delay', 3000),
      keyboard: this.container.getAttribute('mm-slider-keyboard') !== 'false',
      swipe: this.container.getAttribute('mm-slider-swipe') !== 'false'
    };
  }

  public init(): void {
    this.setupTrack();
    this.findNavigationElements();
    this.setupEventListeners();
    this.createPaginationDots();
    this.showSlide(0, false);
    
    if (this.config.autoplay) {
      this.startAutoplay();
    }
  }

  private setupTrack(): void {
    // Container should clip overflow
    this.gsap.set(this.container, {
      position: 'relative',
      overflow: 'hidden'
    });

    // Track positioning based on transition type
    if (this.config.transition === 'slide') {
      this.gsap.set(this.track, {
        display: 'flex',
        flexWrap: 'nowrap',
        width: `${this.items.length * 100}%`,
        willChange: 'transform'
      });

      // Each item takes equal space
      this.items.forEach(item => {
        this.gsap.set(item, {
          flex: '0 0 auto',
          width: `${100 / this.items.length}%`
        });
      });
    } else {
      // Fade mode: stack items absolutely
      this.gsap.set(this.track, {
        position: 'relative',
        width: '100%',
        height: '100%'
      });

      this.items.forEach((item, index) => {
        this.gsap.set(item, {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: index === 0 ? 1 : 0,
          zIndex: index === 0 ? 2 : 1
        });
      });
    }
  }

  private findNavigationElements(): void {
    // Find prev/next buttons
    this.prevButton = this.container.querySelector<HTMLElement>('[mm-slider-element="prev"]');
    this.nextButton = this.container.querySelector<HTMLElement>('[mm-slider-element="next"]');
    this.pagination = this.container.querySelector<HTMLElement>('[mm-slider-element="pagination"]');
  }

  private setupEventListeners(): void {
    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.prev();
      });
    }
    if (this.nextButton) {
      this.nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.next()
    });
    }

    // Keyboard navigation
    if (this.config.keyboard) {
      document.addEventListener('keydown', this.handleKeyboard);
    }

    // Touch/swipe
    if (this.config.swipe) {
      this.container.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      this.container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }

    // Pause on hover
    if (this.config.autoplay && this.baseConfig.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.container.addEventListener('mouseleave', () => this.resumeAutoplay());
    }
  }

  private createPaginationDots(): void {
    if (!this.pagination) return;

    // Clear existing dots
    this.pagination.innerHTML = '';
    this.dots = [];

    // Create dot for each slide
    this.items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.style.cursor = 'pointer';
      
      // Add active class to first dot
      if (index === 0) {
        dot.setAttribute('data-active', 'true');
      }

      dot.addEventListener('click', () => this.goToSlide(index));
      
      this.pagination?.appendChild(dot);
      this.dots.push(dot);
    });
  }

  private showSlide(index: number, animate: boolean = true): void {
    if (this.isAnimating) return;
    
    // Wrap index for infinite loop
    const targetIndex = ((index % this.items.length) + this.items.length) % this.items.length;
    
    if (targetIndex === this.currentIndex && animate) return;

    this.isAnimating = true;

    if (this.config.transition === 'slide') {
      this.slideTransition(targetIndex, animate);
    } else {
      this.fadeTransition(targetIndex, animate);
    }

    this.currentIndex = targetIndex;
    this.updatePagination();
  }

  private slideTransition(targetIndex: number, animate: boolean): void {
    const targetX = -(targetIndex * (100 / this.items.length));

    if (animate) {
      this.gsap.to(this.track, {
        xPercent: targetX,
        duration: this.config.duration / 1000,
        ease: this.config.ease,
        onComplete: () => {
          this.isAnimating = false;
        }
      });
    } else {
      this.gsap.set(this.track, { xPercent: targetX });
      this.isAnimating = false;
    }
  }

  private fadeTransition(targetIndex: number, animate: boolean): void {
    const currentItem = this.items[this.currentIndex];
    const targetItem = this.items[targetIndex];

    if (animate) {
      const tl = this.gsap.timeline({
        onComplete: () => {
          this.isAnimating = false;
        }
      });

      tl.to(currentItem, {
        opacity: 0,
        duration: this.config.duration / 2000,
        ease: this.config.ease,
        onStart: () => {
          this.gsap.set(targetItem, { zIndex: 2 });
          this.gsap.set(currentItem, { zIndex: 1 });
        }
      })
      .to(targetItem, {
        opacity: 1,
        duration: this.config.duration / 2000,
        ease: this.config.ease
      }, `-=${this.config.duration / 4000}`); // Overlap slightly
    } else {
      this.gsap.set(currentItem, { opacity: 0, zIndex: 1 });
      this.gsap.set(targetItem, { opacity: 1, zIndex: 2 });
      this.isAnimating = false;
    }
  }

  private updatePagination(): void {
    if (this.dots.length === 0) return;

    this.dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.setAttribute('data-active', 'true');
      } else {
        dot.removeAttribute('data-active');
      }
    });
  }

  // Navigation methods
  public next(): void {
    this.showSlide(this.currentIndex + 1);
    this.resetAutoplay();
  }

  public prev(): void {
    this.showSlide(this.currentIndex - 1);
    this.resetAutoplay();
  }

  public goToSlide(index: number): void {
    this.showSlide(index);
    this.resetAutoplay();
  }

  // Autoplay controls
  private startAutoplay(): void {
    if (!this.config.autoplay) return;
    
    this.autoplayTimer = window.setInterval(() => {
      this.next();
    }, this.config.autoplayDelay);
  }

  private pauseAutoplay(): void {
    if (this.autoplayTimer !== null) {
      window.clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private resumeAutoplay(): void {
    if (this.config.autoplay && this.autoplayTimer === null) {
      this.startAutoplay();
    }
  }

  private resetAutoplay(): void {
    if (!this.config.autoplay) return;
    
    this.pauseAutoplay();
    this.startAutoplay();
  }

  // Event handlers
  private handleKeyboard = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    }
  };

  private handleTouchStart = (e: TouchEvent): void => {
    this.touchStartX = e.touches[0].clientX;
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    this.touchEndX = e.changedTouches[0].clientX;
    this.handleSwipe();
  };

  private handleSwipe(): void {
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > this.minSwipeDistance) {
      if (diff > 0) {
        // Swipe left
        this.next();
      } else {
        // Swipe right
        this.prev();
      }
    }
  }

  public destroy(): void {
    // Stop autoplay
    this.pauseAutoplay();

    // Remove event listeners
    if (this.prevButton) {
      this.prevButton.removeEventListener('click', () => this.prev());
    }
    if (this.nextButton) {
      this.nextButton.removeEventListener('click', () => this.next());
    }
    if (this.config.keyboard) {
      document.removeEventListener('keydown', this.handleKeyboard);
    }
    if (this.config.swipe) {
      this.container.removeEventListener('touchstart', this.handleTouchStart);
      this.container.removeEventListener('touchend', this.handleTouchEnd);
    }
    if (this.config.autoplay && this.baseConfig.pauseOnHover) {
      this.container.removeEventListener('mouseenter', () => this.pauseAutoplay());
      this.container.removeEventListener('mouseleave', () => this.resumeAutoplay());
    }

    // Clear pagination
    if (this.pagination) {
      this.pagination.innerHTML = '';
    }
    this.dots = [];
  }
}