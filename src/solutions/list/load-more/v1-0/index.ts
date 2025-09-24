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
    totalItemsRevealed: number; // Track how much content is actually visible
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
            totalItemsRevealed: Math.max(1, rowsCount) // At least show first row
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
        // Don't actually remove elements - just hide them and track state
        if (this.elements.overlay) {
            this.elements.overlay.style.display = 'none';
        }
        this.elements.moreButton.style.display = 'none';

        // Set container to auto height
        setTimeout(() => {
            this.elements.list.parentElement!.style.height = 'auto';
        }, 300);

        // Track that all content is revealed
        this.config.totalItemsRevealed = this.elements.list.children.length;

        // Dispatch completion event
        this.elements.container.dispatchEvent(new CustomEvent('mm:loadMoreComplete', {
            detail: { 
                totalClicks: this.config.clicksCount,
                totalItems: this.config.totalItemsRevealed 
            }
        }));
    }

    private handleResize(): void {
        // Reset container height for recalculation
        this.elements.list.parentElement!.style.height = 'auto';
        
        // Recalculate configuration for new viewport
        const newConfig = this.calculateConfig();
        const currentlyVisibleItems = this.config.totalItemsRevealed;
        
        // Check if we need to show more/less content for new viewport
        if (currentlyVisibleItems > newConfig.totalItemsRevealed) {
            // New viewport shows less → need to restart load more
            this.restoreLoadMoreState(newConfig, currentlyVisibleItems);
        } else if (currentlyVisibleItems <= newConfig.totalItemsRevealed) {
            // New viewport can show same or more → adjust accordingly
            this.config = {
                ...newConfig,
                totalItemsRevealed: currentlyVisibleItems,
                clicksCount: Math.ceil((currentlyVisibleItems - newConfig.totalItemsRevealed) / 3) // Estimate clicks needed
            };
            
            if (currentlyVisibleItems >= this.elements.list.children.length) {
                // All content still visible → keep final state
                return;
            }
            
            this.setContainerHeight();
        }
    }

    private restoreLoadMoreState(newConfig: LoadMoreConfig, itemsToShow: number): void {
        // Restore button and overlay if they were removed
        if (!document.contains(this.elements.moreButton)) {
            // Note: In real implementation, you'd need to restore from template or recreation
            console.log('Load more button needs restoration for responsive behavior');
        }
        
        if (this.elements.overlay && !document.contains(this.elements.overlay)) {
            // Similarly, restore overlay
            console.log('Overlay needs restoration for responsive behavior');
        }
        
        // Calculate how many clicks needed to show current content in new viewport
        const itemsPerClick = 3; // Or get from config
        const clicksNeeded = Math.ceil((itemsToShow - newConfig.totalItemsRevealed) / itemsPerClick);
        
        this.config = {
            ...newConfig,
            totalItemsRevealed: itemsToShow,
            clicksCount: Math.max(0, clicksNeeded)
        };
        
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