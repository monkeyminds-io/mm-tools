// =============================================================================
// File Name: load-more/index.ts
// File Description:
// MonkeyMinds Load More Solution - Reveals list items by expanding container height
// =============================================================================

import { removeElement, getAttributeNumber, debounce, getElementTotalHeight } from '@shared/utils';

// =============================================================================
// Types
// =============================================================================
interface LoadMoreElements {
    container: HTMLElement;
    list: HTMLElement;
    moreButton: HTMLElement;
    overlay?: HTMLElement | null;
}

interface LoadMoreConfig {
    rowHeight: number;
    rowsCount: number;
    initHeight: number;
    clicksCount: number;
    gap: number;
    isComplete: boolean;
}

// =============================================================================
// Load More Class
// =============================================================================
class MonkeyMindsLoadMore {
    private elements: LoadMoreElements;
    private config: LoadMoreConfig;
    private debouncedResize: Function;

    constructor(container: HTMLElement) {
        this.elements = this.getElements(container);
        this.config = this.calculateConfig();
        this.debouncedResize = debounce(() => this.handleResize(), 250);
        
        this.init();
    }

    private getElements(container: HTMLElement): LoadMoreElements {
        const list = container.querySelector('[mm-list-element="list"]') as HTMLElement;
        const moreButton = container.querySelector('[mm-list-element="more-button"]') as HTMLElement;
        const overlay = container.querySelector('[mm-list-element="overlay"]') as HTMLElement | null;

        if (!list || !moreButton) {
            throw new Error('MonkeyMinds Load More: Required elements not found');
        }

        return {
            container,
            list,
            moreButton,
            overlay
        };
    }

    private calculateConfig(): LoadMoreConfig {
        const gap = getAttributeNumber(this.elements.list, 'mm-list-gap', 0);
        const rowHeight = getElementTotalHeight(this.elements.list.children[0] as HTMLElement) + gap;
        const containerHeight = this.elements.list.parentElement!.offsetHeight;
        const rowsCount = Math.ceil(containerHeight / rowHeight) - 1;
        const overlayHeight = this.elements.overlay ? rowHeight * 0.75 : 0;
        const initHeight = rowHeight + overlayHeight;

        return {
            rowHeight,
            rowsCount,
            initHeight,
            clicksCount: 0,
            gap,
            isComplete: false
        };
    }

    private init(): void {
        this.setContainerHeight();
        this.bindEvents();
        
        console.log('🐒 MonkeyMinds Load More initialized');
    }

    private bindEvents(): void {
        // More button click
        this.elements.moreButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleLoadMore();
        });

        // Window resize with debouncing
        window.addEventListener('resize', this.debouncedResize as EventListener);
    }

    private handleLoadMore(): void {
        this.config.clicksCount++;
        
        if (this.config.clicksCount >= this.config.rowsCount) {
            this.setFinalState();
        } else {
            this.setContainerHeight();
        }

        // Dispatch custom event
        this.elements.container.dispatchEvent(new CustomEvent('mm:loadMore', {
            detail: {
                clicksCount: this.config.clicksCount,
                isComplete: this.config.clicksCount >= this.config.rowsCount
            }
        }));
    }

    private setContainerHeight(): void {
        const newHeight = this.config.initHeight + (this.config.rowHeight * this.config.clicksCount);
        this.elements.list.parentElement!.style.height = `${newHeight}px`;
    }

    private setFinalState(): void {
        // Mark as complete
        this.config.isComplete = true;
        
        // Remove overlay and button with animation
        if (this.elements.overlay) {
            removeElement(this.elements.overlay);
        }
        removeElement(this.elements.moreButton);

        // Set container to auto height
        setTimeout(() => {
            this.elements.list.parentElement!.style.height = 'auto';
        }, 300);

        // Dispatch completion event
        this.elements.container.dispatchEvent(new CustomEvent('mm:loadMoreComplete', {
            detail: { totalClicks: this.config.clicksCount }
        }));
    }

    private handleResize(): void {
        // Don't handle resize if load more is complete
        if (this.config.isComplete) {
            return;
        }

        // Reset container height for recalculation
        this.elements.list.parentElement!.removeAttribute('style');
        
        // Recalculate configuration for new viewport, preserving progress
        const newConfig = this.calculateConfig();
        this.config = { 
            ...newConfig, 
            clicksCount: this.config.clicksCount,
            isComplete: this.config.isComplete 
        };
        
        // Reapply height based on current progress
        this.setContainerHeight();
    }

    // Public API
    public reset(): void {
        this.config.clicksCount = 0;
        this.setContainerHeight();
        
        // Restore button if it was removed
        if (!document.contains(this.elements.moreButton)) {
            // Note: In a real scenario, you'd need to restore from a template
            console.warn('MonkeyMinds Load More: Cannot restore removed button');
        }
    }

    public destroy(): void {
        window.removeEventListener('resize', this.debouncedResize as EventListener);
        this.elements.list.parentElement!.style.height = 'auto';
    }
}

// =============================================================================
// Auto-initialization
// =============================================================================
function initializeLoadMore(): void {
    const containers = document.querySelectorAll('[mm-tool="list-load-more"]');
    
    containers.forEach((container) => {
        if (!(container as any).mmLoadMore) {
            try {
                (container as any).mmLoadMore = new MonkeyMindsLoadMore(container as HTMLElement);
            } catch (error) {
                console.error('MonkeyMinds Load More initialization failed:', error);
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoadMore);
} else {
    initializeLoadMore();
}

// Expose to global scope
declare global {
    interface Window {
        MonkeyMindsLoadMore: typeof MonkeyMindsLoadMore;
        mmLoadMore: {
            init: typeof initializeLoadMore;
            version: string;
        };
    }
}

window.MonkeyMindsLoadMore = MonkeyMindsLoadMore;
window.mmLoadMore = {
    init: initializeLoadMore,
    version: '1.0.0'
};