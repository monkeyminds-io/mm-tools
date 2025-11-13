/**
 * MonkeyMinds Tab v2.0 - Main Mode
 * GSAP-powered transitions with per-content animation modes
 */

import { GSAPTimeline } from '@shared/types/gsap-types';
import { 
  TabMode, 
  InstantDependencies, 
  BaseTabConfig,
  TabLink,
  TabContentWrapper,
  TabContent,
  TabState,
  TabChangeEventDetail,
  VideoPlayEventDetail,
  AnimationMode,
} from '../types';

export class TabMainMode implements TabMode {
  private container: HTMLElement;
  private links: TabLink[];
  private wrappers: TabContentWrapper[];
  private config: BaseTabConfig;
  private currentIndex: number;
  private isTransitioning: boolean = false;
  private gsap: any;
  private timeline: GSAPTimeline | null = null;

  constructor(deps: InstantDependencies) {
    this.container = deps.container;
    this.links = deps.links;
    this.wrappers = deps.wrappers;
    this.config = deps.config;
    this.currentIndex = deps.config.initialIndex;
    this.gsap = deps.gsap;
  }

  /**
   * Initialize the tab mode
   */
  public init(): void {
    this.applyRequiredStyles();
    this.setInitialState();
    this.bindEvents();
    
    //console.log('🐒 MonkeyMinds Tab - Initialized with GSAP');
  }

  /**
   * Apply required functional styles
   */
  private applyRequiredStyles(): void {
    // Set initial styles based on animation mode
    this.wrappers.forEach(wrapper => {
      wrapper.contents.forEach(content => {
        if (content.animationMode === 'fade') {
          this.gsap.set(content.element, { autoAlpha: 0, display: 'none' });
        } else if (content.animationMode === 'slide') {
          this.gsap.set(content.element, { xPercent: 100, autoAlpha: 0, display: 'none' });
        } else if (content.animationMode === 'accordion') {
          this.gsap.set(content.element, { height: 0, autoAlpha: 0, overflow: 'hidden' });
        } else {
          this.gsap.set(content.element, { display: 'none' });
        }
      });
    });
  }

  /**
   * Set initial state - show first tab
   */
  private setInitialState(): void {
    this.links.forEach((link, index) => {
      if (index === this.currentIndex) {
        this.setLinkActive(link.element);
      } else {
        this.setLinkHidden(link.element);
      }
    });

    this.wrappers.forEach(wrapper => {
      wrapper.contents.forEach((content, index) => {
        if (index === this.currentIndex) {
          this.setContentActive(content.element);
          if (content.animationMode === 'fade') {
            this.gsap.set(content.element, { autoAlpha: 1, display: 'block' });
          } else if (content.animationMode === 'slide') {
            this.gsap.set(content.element, { xPercent: 0, autoAlpha: 1, display: 'block' });
          } else if (content.animationMode === 'accordion') {
            this.gsap.set(content.element, { height: 'auto', autoAlpha: 1, overflow: 'show' });
          } else {
            this.gsap.set(content.element, { display: 'block' });
          }
          if (content.isVideo && content.videoElement) {
            // Autoplay video if present
            content.videoElement.play().catch(err => {
              console.warn('MonkeyMinds Tab: Video autoplay prevented', err);
            });
          }
        } else {
          this.setContentHidden(content.element);
        }
      });
    });
  }

  /**
   * Bind event listeners to links
   */
  private bindEvents(): void {
    this.links.forEach((link, index) => {
      link.element.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLinkClick(index);
      });
    });
  }

  /**
   * Handle link click
   */
  private handleLinkClick(index: number): void {
    // Prevent clicking during transition
    if (this.isTransitioning || index === this.currentIndex) {
      return;
    }

    this.switchTo(index);
  }

  /**
   * Switch to a specific tab
   */
  public switchTo(index: number): void {
    if (index < 0 || index >= this.links.length || this.isTransitioning) {
      return;
    }

    const previousIndex = this.currentIndex;
    this.isTransitioning = true;

    // Update links immediately
    this.updateLinks(index);

    // Animate transition
    this.animateTransition(previousIndex, index, () => {
      // Update current index
      this.currentIndex = index;

      // Handle videos if present
      this.handleVideos(index);

      // Dispatch event
      this.dispatchChangeEvent(previousIndex, index);

      // Reset transition flag
      this.isTransitioning = false;
    });
  }

  /**
   * Animate transition between tabs
   */
  private animateTransition(fromIndex: number, toIndex: number, onComplete: () => void): void {
    this.timeline = this.gsap.timeline({
      onComplete: onComplete
    });

    // Get all contents at both indices
    const currentContents = this.wrappers.flatMap(w => w.contents[fromIndex]);
    const nextContents = this.wrappers.flatMap(w => w.contents[toIndex]);

    // Animate out current contents
    currentContents.forEach(content => {
      this.animateContentOut(content, this.timeline);
    });

    // Animate in next contents
    nextContents.forEach(content => {
      this.animateContentIn(content, this.timeline);
    });
  }

  /**
   * Animate content out using shared animations
   */
  private animateContentOut(content: TabContent, timeline: any): void {
    const duration = this.config.duration / 2;
    const direction = (content.element.getAttribute('mm-tab-direction') || 'left') as any;

    const animConfig = content.animationMode === 'slide'
      ? { duration, direction, ease: 'power2.inOut' }
      : { duration, ease: 'power2.inOut' };

    timeline(animConfig)

    if (content.animationMode === 'fade') {
      const tween = this.gsap.to(content.element, { autoAlpha: 0, display: 'none', duration });
      timeline.add(tween);
    } else if (content.animationMode === 'slide') {
      const toVars: any = { autoAlpha: 0, display: 'none', duration };
      if (direction === 'left') {
        toVars.xPercent = -100;
      } else if (direction === 'right') {
        toVars.xPercent = 100;
      } else if (direction === 'up') {
        toVars.yPercent = -100;
      } else if (direction === 'down') {
        toVars.yPercent = 100;
      } else {
        toVars.xPercent = 0;
        toVars.yPercent = 0;
      }
      const tween = this.gsap.to(content.element, toVars);
      timeline.add(tween);
    } else if (content.animationMode === 'accordion') {
      const tween = this.gsap.to(content.element, { height: 0, autoAlpha: 0, overflow: 'hidden', duration });
      timeline.add(tween);
    } else {
      const tween = this.gsap.to(content.element, { display: 'none', duration });
      timeline.add(tween);
    }
}

  /**
   * Animate content in using shared animations
   */
  private animateContentIn(content: TabContent, timeline: any): void {
    const duration = this.config.duration / 2;
    const delay = duration / 1000; // Convert to seconds for timeline position
    const direction = (content.element.getAttribute('mm-tab-direction') || 'left') as any;

    const animConfig = content.animationMode === 'slide'
      ? { duration, direction, ease: 'power2.inOut' }
      : { duration, ease: 'power2.inOut' };

    timeline(animConfig)

    if (content.animationMode === 'fade') {
      const tween = this.gsap.to(content.element, { autoAlpha: 1, display: 'block', duration });
      timeline.add(tween, delay);
    } else if (content.animationMode === 'slide') {
      const fromVars: any = { autoAlpha: 0, display: 'block', duration };
      if (direction === 'left') {
        fromVars.xPercent = 100;
      } else if (direction === 'right') {
        fromVars.xPercent = -100;
      } else if (direction === 'up') {
        fromVars.yPercent = 100;
      } else if (direction === 'down') {
        fromVars.yPercent = -100;
      } else {
        fromVars.xPercent = 0;
        fromVars.yPercent = 0;
      }
      const tween = this.gsap.fromTo(
        content.element,
        fromVars,
        { xPercent: 0, yPercent: 0, autoAlpha: 1, duration, ease: 'power2.inOut' }
      );
      timeline.add(tween, delay);
    } else if (content.animationMode === 'accordion') {
      const tween = this.gsap.to(content.element, { height: 'auto', autoAlpha: 1, overflow: 'show', duration });
      timeline.add(tween, delay);
    } else {
      const tween = this.gsap.to(content.element, { display: 'block', duration });
      timeline.add(tween, delay);
    }
  }

  /**
   * Update link states
   */
  private updateLinks(newIndex: number): void {
    this.links.forEach((link, index) => {
      if (index === newIndex) {
        this.setLinkActive(link.element);
      } else {
        this.setLinkHidden(link.element);
      }
    });
  }

  /**
   * Handle video play/pause
   */
  private handleVideos(newIndex: number): void {
    this.wrappers.forEach(wrapper => {
      wrapper.contents.forEach((content, index) => {
        if (content.isVideo && content.videoElement) {
          if (index === newIndex) {
            // Play the new video
            content.videoElement.play().catch(err => {
              console.warn('MonkeyMinds Tab: Video autoplay prevented', err);
            });

            // Dispatch video play event
            this.dispatchVideoEvent(newIndex, content.videoElement, content.element);
          } else {
            // Pause other videos
            content.videoElement.pause();
            content.videoElement.currentTime = 0;
          }
        }
      });
    });
  }

  /**
   * Set link active state
   */
  private setLinkActive(element: HTMLElement): void {
    element.setAttribute('mm-state', TabState.Active);
    if (this.config.activeClass) {
      element.classList.add(...this.config.activeClass.split(' '));
    }
  }

  /**
   * Set link hidden state
   */
  private setLinkHidden(element: HTMLElement): void {
    element.setAttribute('mm-state', TabState.Hidden);
    if (this.config.activeClass) {
      element.classList.remove(...this.config.activeClass.split(' '));
    }
  }

  /**
   * Set content active state
   */
  private setContentActive(element: HTMLElement): void {
    element.setAttribute('mm-state', TabState.Active);
    if (this.config.activeClass) {
      element.classList.add(...this.config.activeClass.split(' '));
    }
  }

  /**
   * Set content hidden state
   */
  private setContentHidden(element: HTMLElement): void {
    element.setAttribute('mm-state', TabState.Hidden);
    if (this.config.activeClass) {
      element.classList.remove(...this.config.activeClass.split(' '));
    }
  }

  /**
   * Dispatch tab change event
   */
  private dispatchChangeEvent(previousIndex: number, currentIndex: number): void {
    const allContents = this.wrappers.flatMap(w => 
      w.contents.filter((_, i) => i === currentIndex).map(c => c.element)
    );

    const detail: TabChangeEventDetail = {
      previousIndex,
      currentIndex,
      link: this.links[currentIndex].element,
      contents: allContents
    };

    this.container.dispatchEvent(new CustomEvent('mm:tabChange', { detail }));
  }

  /**
   * Dispatch video play event
   */
  private dispatchVideoEvent(index: number, video: HTMLVideoElement, content: HTMLElement): void {
    const detail: VideoPlayEventDetail = {
      index,
      videoElement: video,
      contentElement: content
    };

    this.container.dispatchEvent(new CustomEvent('mm:tabVideoPlay', { detail }));
  }

  /**
   * Get current active index
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clean up and remove event listeners
   */
  public destroy(): void {
    // Kill all GSAP animations
    this.wrappers.forEach(wrapper => {
      wrapper.contents.forEach(content => {
        this.gsap.killTweensOf(content.element);
      });
    });

    // Remove event listeners
    this.links.forEach(link => {
      link.element.replaceWith(link.element.cloneNode(true));
    });

    // Reset all states
    this.links.forEach(link => {
      link.element.removeAttribute('mm-state');
      if (this.config.activeClass) {
        link.element.classList.remove(...this.config.activeClass.split(' '));
      }
    });

    this.wrappers.forEach(wrapper => {
      wrapper.contents.forEach(content => {
        content.element.removeAttribute('mm-state');
        this.gsap.set(content.element, { clearProps: 'all' });
        if (this.config.activeClass) {
          content.element.classList.remove(...this.config.activeClass.split(' '));
        }

        // Pause videos
        if (content.videoElement) {
          content.videoElement.pause();
        }
      });
    });

    console.log('🐒 MonkeyMinds Tab - Destroyed');
  }
}