/**
 * MonkeyMinds List v2.0 - Load More Mode
 * Height-based revealing with smooth container expansion
 */

import { 
  ListMode, 
  LoadMoreDependencies, 
  LoadMoreConfig,
  LoadMoreEventDetail 
} from '../types';
import { removeElement, debounce, getElementTotalHeight } from '@shared/utils';

export class LoadMoreMode implements ListMode {
  private container: HTMLElement;
  private list: HTMLElement;
  private moreButton: HTMLElement;
  private overlay: HTMLElement | null;
  private config: LoadMoreConfig;
  private debouncedResize: Function;

  constructor(deps: LoadMoreDependencies) {
    this.container = deps.container;
    this.list = deps.list;
    this.moreButton = deps.moreButton;
    this.overlay = deps.overlay;
    this.config = deps.config;
    
    // Create debounced resize handler
    this.debouncedResize = debounce(() => this.handleResize(), 250);
  }

  /**
   * Initialize the load more mode
   */
  public init(): void {
    this.applyRequiredStyles();
    this.setContainerHeight();
    this.bindEvents();
    
    console.log('🐒 MonkeyMinds List - Load More mode initialized');
  }

  /**
   * Apply required functional styles
   */
  private applyRequiredStyles(): void {
    const listParent = this.list.parentElement;
    if (listParent) {
      // Required for height-based revealing
      listParent.style.overflow = 'hidden';
      listParent.style.position = 'relative';
      listParent.style.transition = 'height 300ms ease-out';
    }

    // Required for smooth fade
    if (this.overlay) {
      this.overlay.style.position = 'absolute';
      this.overlay.style.bottom = '0';
      this.overlay.style.left = '0';
      this.overlay.style.right = '0';
      this.overlay.style.pointerEvents = 'none';
      this.overlay.style.transition = 'opacity 300ms ease-out';
    }

    // Required for smooth button fade
    this.moreButton.style.transition = 'opacity 300ms ease-out';
  }

  /**
   * Bind event listeners
   */
  private bindEvents(): void {
    // More button click
    this.moreButton.addEventListener('click', this.handleLoadMore);

    // Window resize with debouncing
    window.addEventListener('resize', this.debouncedResize as EventListener);
  }

  /**
   * Handle load more button click
   */
  private handleLoadMore = (event: Event): void => {
    event.preventDefault();
    this.config.clicksCount++;
    
    if (this.config.clicksCount >= this.config.rowsCount) {
      this.setFinalState();
    } else {
      this.setContainerHeight();
    }

    // Dispatch custom event
    this.dispatchLoadMoreEvent();
  };

  /**
   * Set container height based on current progress
   */
  private setContainerHeight(): void {
    const newHeight = this.config.initHeight + (this.config.rowHeight * this.config.clicksCount);
    const listParent = this.list.parentElement;
    if (listParent) {
      listParent.style.height = `${newHeight}px`;
    }
  }

  /**
   * Set final state - reveal all content
   */
  private setFinalState(): void {
    // Mark as complete
    this.config.isComplete = true;
    
    // Remove overlay and button with animation
    if (this.overlay) {
      removeElement(this.overlay);
    }
    removeElement(this.moreButton);

    // Set container to auto height
    const listParent = this.list.parentElement;
    if (listParent) {
      setTimeout(() => {
        listParent.style.height = 'auto';
      }, 300);
    }

    // Dispatch completion event
    this.container.dispatchEvent(new CustomEvent('mm:listComplete', {
      detail: { 
        totalClicks: this.config.clicksCount,
        mode: 'loadmore'
      }
    }));
  }

  /**
   * Dispatch load more event
   */
  private dispatchLoadMoreEvent(): void {
    const detail: LoadMoreEventDetail = {
      clicksCount: this.config.clicksCount,
      isComplete: this.config.clicksCount >= this.config.rowsCount
    };

    this.container.dispatchEvent(new CustomEvent('mm:listLoadMore', {
      detail
    }));
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    // Don't handle resize if load more is complete
    if (this.config.isComplete) {
      return;
    }

    // Reset container height for recalculation
    const listParent = this.list.parentElement;
    if (listParent) {
      listParent.removeAttribute('style');
    }
    
    // Recalculate configuration for new viewport
    this.recalculateConfig();
    
    // Reapply height based on current progress
    this.setContainerHeight();
  }

  /**
   * Recalculate config after resize
   */
  private recalculateConfig(): void {
    const firstChild = this.list.children[0] as HTMLElement;
    if (!firstChild) return;

    const rowHeight = getElementTotalHeight(firstChild) + this.config.gap;
    const listParent = this.list.parentElement;
    if (!listParent) return;

    const containerHeight = listParent.offsetHeight;
    const rowsCount = Math.ceil(containerHeight / rowHeight) - 1;
    const overlayHeight = this.overlay ? rowHeight * 0.75 : 0;
    const initHeight = rowHeight + overlayHeight;

    // Update config while preserving progress
    this.config.rowHeight = rowHeight;
    this.config.rowsCount = rowsCount;
    this.config.initHeight = initHeight;
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this.config.clicksCount = 0;
    this.config.isComplete = false;
    this.setContainerHeight();
    
    console.log('🐒 MonkeyMinds List - Load More reset');
  }

  /**
   * Clean up and remove event listeners
   */
  public destroy(): void {
    // Remove event listeners
    this.moreButton.removeEventListener('click', this.handleLoadMore);
    window.removeEventListener('resize', this.debouncedResize as EventListener);
    
    // Reset container height
    const listParent = this.list.parentElement;
    if (listParent) {
      listParent.style.height = 'auto';
    }
    
    console.log('🐒 MonkeyMinds List - Load More destroyed');
  }
}