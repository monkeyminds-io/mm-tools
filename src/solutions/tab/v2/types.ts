/**
 * MonkeyMinds Tab v2.0 - Type Definitions
 * Architecture: Strategy Pattern with Factory
 */

// =============================================================================
// Base Configuration
// =============================================================================
export interface BaseTabConfig {
  defaultMode: 'fade' | 'slide' | 'instant' | 'accordion';
  activeClass: string;
  initialIndex: number;
  duration: number;
}

// =============================================================================
// Animation Mode Types
// =============================================================================
export type AnimationMode = 'fade' | 'slide' | 'instant' | 'accordion';

// =============================================================================
// Animation Options
// =============================================================================
export interface AnimationOptions {
  mode: AnimationMode;
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

// =============================================================================
// Tab Elements
// =============================================================================

/**
 * Tab link element
 */
export interface TabLink {
  element: HTMLElement;
  index: number;
}

/**
 * Tab content element
 */
export interface TabContent {
  element: HTMLElement;
  index: number;
  isVideo: boolean;
  videoElement?: HTMLVideoElement | null;
  animationMode: AnimationMode; // Per-content animation mode
}

/**
 * Tab content wrapper
 */
export interface TabContentWrapper {
  element: HTMLElement;
  contents: TabContent[];
}

// =============================================================================
// Mode Interface
// =============================================================================
export interface TabMode {
  /**
   * Initialize the tab mode
   */
  init(): void;
  
  /**
   * Switch to a specific tab
   */
  switchTo(index: number): void;
  
  /**
   * Get current active index
   */
  getCurrentIndex(): number;
  
  /**
   * Clean up resources and event listeners
   */
  destroy(): void;
}

// =============================================================================
// Shared Dependencies
// =============================================================================

/**
 * Base dependencies all modes receive
 */
export interface BaseDependencies {
  container: HTMLElement;
  links: TabLink[];
  wrappers: TabContentWrapper[];
  config: BaseTabConfig;
  gsap: any; // GSAP instance
}

/**
 * Instant mode dependencies
 */
export interface InstantDependencies extends BaseDependencies {
  // Uses base config only
}

/**
 * Fade mode dependencies
 */
export interface FadeDependencies extends BaseDependencies {
  // Uses base config only
}

/**
 * Slide mode dependencies
 */
export interface SlideDependencies extends BaseDependencies {
  // Uses base config only
}

/**
 * Accordion mode dependencies
 */
export interface AccordionDependencies extends BaseDependencies {
  // Uses base config only
}

// =============================================================================
// State Management
// =============================================================================

/**
 * Tab state enum
 */
export enum TabState {
  Active = 'active',
  Hidden = 'hidden'
}

// =============================================================================
// Event Details
// =============================================================================

/**
 * Tab change event detail
 */
export interface TabChangeEventDetail {
  previousIndex: number;
  currentIndex: number;
  link: HTMLElement;
  contents: HTMLElement[];
}

/**
 * Video play event detail
 */
export interface VideoPlayEventDetail {
  index: number;
  videoElement: HTMLVideoElement;
  contentElement: HTMLElement;
}