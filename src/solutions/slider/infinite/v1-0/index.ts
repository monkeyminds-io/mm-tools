// =============================================================================
// File Name: slider/infinite/v1-0/index.ts
// File Description:
// MonkeyMinds Infinite Slider Solution - Linear and curved infinite carousel
// with dual animation engine (CSS/GSAP), autoplay, navigation
// =============================================================================
import { getAttributeNumber, debounce } from '@shared/utils';

// =============================================================================
// Types
// =============================================================================
interface SliderElements {
    container: HTMLElement;
    track: HTMLElement;
    items: HTMLElement[];
    prevButton?: HTMLElement | null;
    nextButton?: HTMLElement | null;
}

interface SliderConfig {
    itemWidth: number;
    visibleItems: number;
    totalItems: number;
    gap: number;
    autoplayDelay: number;
    animationDuration: number;
    currentPosition: number;
    curveMode: boolean;
    curveRadius: number;
    curveAngle: number;
    animationEngine: 'css' | 'gsap';
    easing: string;
}

// =============================================================================
// Infinite Slider Class
// =============================================================================
class MonkeyMindsInfiniteSlider {
    private elements: SliderElements;
    private config: SliderConfig;
    private autoplayTimer?: number;
    private isTransitioning = false;
    private debouncedResize: Function;
    private currentAngle = 0;

    constructor(container: HTMLElement) {
        this.elements = this.getElements(container);
        this.config = this.calculateConfig();
        this.debouncedResize = debounce(() => this.handleResize(), 200);
        
        this.init();
    }

    private getElements(container: HTMLElement): SliderElements {
        const track = container.querySelector('[mm-slider-element="track"]') as HTMLElement;
        const items = Array.from(container.querySelectorAll('[mm-slider-element="item"]')) as HTMLElement[];
        const prevButton = container.querySelector('[mm-slider-element="prev"]') as HTMLElement | null;
        const nextButton = container.querySelector('[mm-slider-element="next"]') as HTMLElement | null;

        if (!track || items.length === 0) {
            throw new Error('MonkeyMinds Infinite Slider: Track and items are required');
        }

        return { container, track, items, prevButton, nextButton };
    }

    private calculateConfig(): SliderConfig {
        const gap = getAttributeNumber(this.elements.container, 'mm-slider-gap', 20);
        const autoplayDelay = getAttributeNumber(this.elements.container, 'mm-slider-autoplay', 0);
        const animationDuration = getAttributeNumber(this.elements.container, 'mm-slider-duration', 800);
        const curveMode = this.elements.container.getAttribute('mm-slider-curve') === 'true';
        const curveRadius = getAttributeNumber(this.elements.container, 'mm-slider-radius', 400);
        const curveAngle = getAttributeNumber(this.elements.container, 'mm-slider-angle', 180);
        const easing = this.elements.container.getAttribute('mm-slider-easing') || 'ease-in-out';
        
        // Detect GSAP availability
        const hasGSAP = typeof window !== 'undefined' && !!(window as any).gsap;
        const animationEngine: 'css' | 'gsap' = hasGSAP ? 'gsap' : 'css';
        
        if (hasGSAP && curveMode) {
            console.log('🎨 MonkeyMinds Slider: GSAP detected - Enhanced curved animations enabled');
        } else if (curveMode) {
            console.log('🎨 MonkeyMinds Slider: CSS curved mode - GSAP not detected');
        }
        
        // Calculate item width and visible count
        const containerWidth = this.elements.container.offsetWidth;
        const firstItem = this.elements.items[0];
        const itemWidth = firstItem.offsetWidth + gap;
        const visibleItems = curveMode ? Math.ceil(curveAngle / 60) : Math.floor(containerWidth / itemWidth);
        
        return {
            itemWidth,
            visibleItems: Math.max(1, visibleItems),
            totalItems: this.elements.items.length,
            gap,
            autoplayDelay,
            animationDuration,
            currentPosition: 0,
            curveMode,
            curveRadius,
            curveAngle,
            animationEngine,
            easing
        };
    }

    private init(): void {
        if (this.config.curveMode) {
            this.setupCurvedSlider();
        } else {
            this.setupLinearSlider();
        }
        
        this.bindEvents();
        this.startAutoplay();
        
        console.log(`🎠 MonkeyMinds Infinite Slider initialized (${this.config.curveMode ? 'Curved' : 'Linear'} mode, ${this.config.animationEngine.toUpperCase()} engine)`);
    }

    // =========================================================================
    // Linear Slider Implementation
    // =========================================================================
    
    private setupLinearSlider(): void {
        const { track, items } = this.elements;
        const { visibleItems, gap, itemWidth } = this.config;
        
        // Container styles
        this.elements.container.style.overflow = 'hidden';
        this.elements.container.style.position = 'relative';
        
        // Track styles
        track.style.display = 'flex';
        track.style.gap = `${gap}px`;
        track.style.willChange = 'transform';
        
        // Item styles
        items.forEach(item => {
            item.style.flexShrink = '0';
            item.style.width = `${itemWidth - gap}px`;
        });
        
        // Clone items for infinite effect
        this.cloneItemsLinear();
        
        // Set initial position
        this.config.currentPosition = -visibleItems * itemWidth;
        this.updateLinearPosition(false);
    }

    private cloneItemsLinear(): void {
        const { track, items } = this.elements;
        const { visibleItems } = this.config;
        
        // Clone first and last items
        const clonesToPrepend = items.slice(-visibleItems);
        const clonesToAppend = items.slice(0, visibleItems);
        
        clonesToPrepend.forEach(item => {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.setAttribute('data-clone', 'true');
            track.insertBefore(clone, track.firstChild);
        });
        
        clonesToAppend.forEach(item => {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.setAttribute('data-clone', 'true');
            track.appendChild(clone);
        });
        
        // Update items list
        this.elements.items = Array.from(track.children) as HTMLElement[];
    }

    private updateLinearPosition(animate: boolean): void {
        const { track } = this.elements;
        const { currentPosition, animationDuration, easing } = this.config;
        
        if (animate) {
            track.style.transition = `transform ${animationDuration}ms ${this.getCSSEasing(easing)}`;
        } else {
            track.style.transition = 'none';
        }
        
        track.style.transform = `translateX(${currentPosition}px)`;
    }

    // =========================================================================
    // Curved Slider Implementation
    // =========================================================================
    
    private setupCurvedSlider(): void {
        const { container, track, items } = this.elements;
        const { curveRadius, curveAngle, visibleItems } = this.config;
        
        // Container styles for curved mode
        container.style.position = 'relative';
        container.style.height = `${curveRadius * 1.5}px`;
        container.style.overflow = 'hidden';
        
        // Track styles for absolute positioning
        track.style.position = 'relative';
        track.style.width = '100%';
        track.style.height = '100%';
        
        // Clone items for infinite curved effect
        this.cloneItemsCurved();
        
        // Position items along curve
        this.positionCurvedItems(0, false);
    }

    private cloneItemsCurved(): void {
        const { track, items } = this.elements;
        const cloneCount = Math.ceil(this.config.visibleItems);
        
        // Clone for seamless looping
        for (let i = 0; i < cloneCount; i++) {
            const clone = items[i].cloneNode(true) as HTMLElement;
            clone.setAttribute('data-clone', 'true');
            track.appendChild(clone);
        }
        
        this.elements.items = Array.from(track.children) as HTMLElement[];
    }

    private positionCurvedItems(angleOffset: number, animate: boolean): void {
        const { items } = this.elements;
        const { curveRadius, curveAngle, totalItems, animationEngine } = this.config;
        
        const angleStep = curveAngle / (totalItems - 1);
        const startAngle = -curveAngle / 2;
        
        items.forEach((item, index) => {
            const angle = startAngle + (index * angleStep) + angleOffset;
            const actualIndex = index % totalItems;
            
            if (animationEngine === 'gsap' && (window as any).gsap) {
                this.positionItemWithGSAP(item, angle, curveRadius, animate);
            } else {
                this.positionItemWithCSS(item, angle, curveRadius, animate);
            }
        });
    }

    private positionItemWithCSS(item: HTMLElement, angle: number, radius: number, animate: boolean): void {
        console.log('🐒 MonkeyMinds Curved Slider: Using CSS for positioning');
        const { animationDuration, easing } = this.config;
        
        // Convert polar to Cartesian coordinates
        const radian = (angle * Math.PI) / 180;
        const x = Math.sin(radian) * radius;
        const y = Math.cos(radian) * radius - radius;
        
        // Calculate scale and opacity based on position
        const normalizedAngle = Math.abs(angle) / 90;
        const scale = 1 - (normalizedAngle * 0.3); // Scale down items at edges
        const opacity = 1 - (normalizedAngle * 0.5); // Fade items at edges
        
        // Apply styles
        item.style.position = 'absolute';
        item.style.left = '50%';
        item.style.top = '50%';
        
        if (animate) {
            item.style.transition = `transform ${animationDuration}ms ${this.getCSSEasing(easing)}, opacity ${animationDuration}ms ${this.getCSSEasing(easing)}`;
        } else {
            item.style.transition = 'none';
        }
        
        item.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale}) rotateY(${angle * 0.5}deg)`;
        item.style.opacity = `${Math.max(0.3, opacity)}`;
        item.style.zIndex = `${Math.round(100 - normalizedAngle * 50)}`;
    }

    private positionItemWithGSAP(item: HTMLElement, angle: number, radius: number, animate: boolean): void {
        console.log('🐒 MonkeyMinds Curved Slider: Using GSAP for positioning');
        const gsap = (window as any).gsap;
        const { animationDuration, easing } = this.config;
        
        // Convert polar to Cartesian
        const radian = (angle * Math.PI) / 180;
        const x = Math.sin(radian) * radius;
        const y = Math.cos(radian) * radius - radius;
        
        // Calculate scale and opacity
        const normalizedAngle = Math.abs(angle) / 90;
        const scale = 1 - (normalizedAngle * 0.3);
        const opacity = 1 - (normalizedAngle * 0.5);
        
        // Set initial position styles
        item.style.position = 'absolute';
        item.style.left = '50%';
        item.style.top = '50%';
        
        // Animate with GSAP
        if (animate) {
            gsap.to(item, {
                x: x,
                y: y,
                scale: scale,
                rotationY: angle * 0.5,
                opacity: Math.max(0.3, opacity),
                duration: animationDuration / 1000,
                ease: this.getGSAPEasing(easing),
                zIndex: Math.round(100 - normalizedAngle * 50)
            });
        } else {
            gsap.set(item, {
                x: x,
                y: y,
                scale: scale,
                rotationY: angle * 0.5,
                opacity: Math.max(0.3, opacity),
                zIndex: Math.round(100 - normalizedAngle * 50)
            });
        }
    }

    // =========================================================================
    // Shared Navigation Logic
    // =========================================================================
    
    private bindEvents(): void {
        const { prevButton, nextButton, container } = this.elements;

        if (prevButton) {
            prevButton.addEventListener('click', () => this.slideTo('prev'));
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.slideTo('next'));
        }

        // Pause autoplay on hover
        if (this.config.autoplayDelay > 0) {
            container.addEventListener('mouseenter', () => this.stopAutoplay());
            container.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Handle resize
        window.addEventListener('resize', this.debouncedResize as EventListener);

        // Touch/swipe support
        let startX = 0;
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                this.slideTo(diff > 0 ? 'next' : 'prev');
            }
        });
    }

    private slideTo(direction: 'next' | 'prev'): void {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        if (this.config.curveMode) {
            this.slideCurved(direction);
        } else {
            this.slideLinear(direction);
        }
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.animationDuration);
    }

    private slideLinear(direction: 'next' | 'prev'): void {
        const { itemWidth, totalItems, visibleItems } = this.config;
        const moveDistance = direction === 'next' ? -itemWidth : itemWidth;
        
        this.config.currentPosition += moveDistance;
        this.updateLinearPosition(true);
        
        setTimeout(() => {
            const threshold = itemWidth * totalItems;
            
            if (this.config.currentPosition <= -threshold - (visibleItems * itemWidth)) {
                this.config.currentPosition = -visibleItems * itemWidth;
                this.updateLinearPosition(false);
            } else if (this.config.currentPosition >= 0) {
                this.config.currentPosition = -threshold;
                this.updateLinearPosition(false);
            }
        }, this.config.animationDuration);
    }

    private slideCurved(direction: 'next' | 'prev'): void {
        const { curveAngle, totalItems } = this.config;
        const angleStep = curveAngle / (totalItems - 1);
        const angleChange = direction === 'next' ? -angleStep : angleStep;
        
        this.currentAngle += angleChange;
        this.positionCurvedItems(this.currentAngle, true);
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================
    
    private getCSSEasing(easing: string): string {
        const easingMap: Record<string, string> = {
            'linear': 'linear',
            'ease': 'ease',
            'ease-in': 'ease-in',
            'ease-out': 'ease-out',
            'ease-in-out': 'ease-in-out',
            'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        };
        return easingMap[easing] || easing;
    }

    private getGSAPEasing(easing: string): string {
        const easingMap: Record<string, string> = {
            'linear': 'none',
            'ease': 'power1.inOut',
            'ease-in': 'power1.in',
            'ease-out': 'power1.out',
            'ease-in-out': 'power2.inOut',
            'smooth': 'power2.out'
        };
        return easingMap[easing] || 'power1.inOut';
    }

    private startAutoplay(): void {
        const { autoplayDelay } = this.config;
        
        if (autoplayDelay <= 0) return;
        
        this.stopAutoplay();
        
        this.autoplayTimer = window.setInterval(() => {
            this.slideTo('next');
        }, autoplayDelay);
    }

    private stopAutoplay(): void {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = undefined;
        }
    }

    private handleResize(): void {
        this.stopAutoplay();
        
        // Recalculate dimensions
        this.config = this.calculateConfig();
        
        // Rebuild based on mode
        if (this.config.curveMode) {
            this.destroyClones();
            this.setupCurvedSlider();
        } else {
            this.destroyClones();
            this.setupLinearSlider();
        }
        
        this.startAutoplay();
    }

    private destroyClones(): void {
        const clones = this.elements.track.querySelectorAll('[data-clone="true"]');
        clones.forEach(clone => clone.remove());
        
        this.elements.items = Array.from(
            this.elements.track.querySelectorAll('[mm-slider-element="item"]:not([data-clone])')
        ) as HTMLElement[];
    }

    // Public API
    public next(): void {
        this.slideTo('next');
    }

    public prev(): void {
        this.slideTo('prev');
    }

    public destroy(): void {
        this.stopAutoplay();
        window.removeEventListener('resize', this.debouncedResize as EventListener);
        this.destroyClones();
        
        this.elements.track.style.transform = '';
        this.elements.track.style.transition = '';
    }
}


// =============================================================================
// Auto-initialization
// =============================================================================
function initializeInfiniteSliders(): void {
    const containers = document.querySelectorAll('[mm-tool="infinite-slider"]');
    
    containers.forEach((container) => {
        if (!(container as any).mmInfiniteSlider) {
            try {
                (container as any).mmInfiniteSlider = new MonkeyMindsInfiniteSlider(container as HTMLElement);
            } catch (error) {
                console.error('MonkeyMinds Infinite Slider initialization failed:', error);
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInfiniteSliders);
} else {
    initializeInfiniteSliders();
}

// Expose to global scope
declare global {
    interface Window {
        MonkeyMindsInfiniteSlider: typeof MonkeyMindsInfiniteSlider;
        mmInfiniteSlider: {
            init: typeof initializeInfiniteSliders;
            version: string;
        };
    }
}

window.MonkeyMindsInfiniteSlider = MonkeyMindsInfiniteSlider;
window.mmInfiniteSlider = {
    init: initializeInfiniteSliders,
    version: '1.0.0'
};