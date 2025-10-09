/**
 * MonkeyMinds Video v1.0 - Type Definitions
 */

// =============================================================================
// Base Configuration (Shared across all modes)
// =============================================================================
export interface BaseVideoConfig {
  mode: 'overlay' | 'inline' | 'lightbox' | 'background' | 'playlist';
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  transition: 'fade' | 'none';
  transitionDuration: number;
}

// =============================================================================
// Mode-Specific Configurations
// =============================================================================

/**
 * Overlay mode config
 */
export interface OverlayConfig extends BaseVideoConfig {
  mode: 'overlay';
  // Add overlay-specific config here if needed
}

/**
 * Future modes
 */
export interface InlineConfig extends BaseVideoConfig {
  mode: 'inline';
}

export interface LightboxConfig extends BaseVideoConfig {
  mode: 'lightbox';
}

/**
 * Union type for all configs
 */
export type VideoConfig = OverlayConfig | InlineConfig | LightboxConfig;

// =============================================================================
// Mode Interface
// =============================================================================
export interface VideoMode {
  /**
   * Initialize the video mode
   */
  init(): void;
  
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
  video: HTMLVideoElement;
  config: BaseVideoConfig;
}

/**
 * Overlay mode dependencies
 */
export interface OverlayDependencies extends BaseDependencies {
  overlay: HTMLElement;
}

/**
 * Inline mode dependencies (future)
 */
export interface InlineDependencies extends BaseDependencies {
  // Add inline-specific elements
}

/**
 * Lightbox mode dependencies (future)
 */
export interface LightboxDependencies extends BaseDependencies {
  // Add lightbox-specific elements
}