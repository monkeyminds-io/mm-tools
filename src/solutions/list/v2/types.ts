/**
 * MonkeyMinds List v2.0 - Type Definitions
 * Architecture: Strategy Pattern with Factory
 */

// =============================================================================
// Base Configuration (Shared across all modes)
// =============================================================================
export interface BaseListConfig {
  mode: 'loadmore' | 'pagination' | 'infinite';
  gap: number;
}

// =============================================================================
// Mode-Specific Configurations
// =============================================================================

/**
 * Load More mode config
 */
export interface LoadMoreConfig extends BaseListConfig {
  mode: 'loadmore';
  rowHeight: number;
  rowsCount: number;
  initHeight: number;
  clicksCount: number;
  isComplete: boolean;
}

/**
 * Pagination mode config (future)
 */
export interface PaginationConfig extends BaseListConfig {
  mode: 'pagination';
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Infinite Scroll mode config (future)
 */
export interface InfiniteConfig extends BaseListConfig {
  mode: 'infinite';
  threshold: number;
  isLoading: boolean;
}

/**
 * Union type for all configs
 */
export type ListConfig = LoadMoreConfig | PaginationConfig | InfiniteConfig;

// =============================================================================
// Mode Interface
// =============================================================================
export interface ListMode {
  /**
   * Initialize the list mode
   */
  init(): void;
  
  /**
   * Clean up resources and event listeners
   */
  destroy(): void;
  
  /**
   * Reset mode to initial state
   */
  reset(): void;
}

// =============================================================================
// Shared Dependencies
// =============================================================================

/**
 * Base dependencies all modes receive
 */
export interface BaseDependencies {
  container: HTMLElement;
  list: HTMLElement;
  config: BaseListConfig;
}

/**
 * Load More mode dependencies
 */
export interface LoadMoreDependencies extends BaseDependencies {
  moreButton: HTMLElement;
  overlay: HTMLElement | null;
  config: LoadMoreConfig;
}

/**
 * Pagination mode dependencies (future)
 */
export interface PaginationDependencies extends BaseDependencies {
  prevButton: HTMLElement;
  nextButton: HTMLElement;
  pageIndicator: HTMLElement;
  config: PaginationConfig;
}

/**
 * Infinite Scroll mode dependencies (future)
 */
export interface InfiniteDependencies extends BaseDependencies {
  sentinel: HTMLElement;
  loader: HTMLElement;
  config: InfiniteConfig;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Custom event detail for load more events
 */
export interface LoadMoreEventDetail {
  clicksCount: number;
  isComplete: boolean;
}

/**
 * Custom event detail for pagination events
 */
export interface PaginationEventDetail {
  currentPage: number;
  totalPages: number;
}