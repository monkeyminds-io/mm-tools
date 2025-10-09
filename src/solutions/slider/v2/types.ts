/**
 * MonkeyMinds Slider v1.2 - Type Definitions
 */

// =============================================================================
// Base Configuration (Shared across all modes)
// =============================================================================
export interface BaseConfig {
  mode: 'marquee' | 'curved' | 'discrete';
  speed: number;
  direction: 'left' | 'right';
  gap: number;
  pauseOnHover: boolean;
}

// =============================================================================
// Mode-Specific Configurations
// =============================================================================

/**
 * Marquee mode uses only base config (gap in pixels)
 */
export interface MarqueeConfig extends BaseConfig {
  // No additional properties needed
}

/**
 * Curved mode config (gap in degrees)
 */
export interface CurvedConfig extends BaseConfig {
  radius: number;
  arcPosition: 'top' | 'bottom' | 'left' | 'right';
  perspective: boolean;
  perspectiveDepth: number;
  scale: boolean;
  scaleRange: [number, number];
}

/**
 * Discrete mode config (future)
 */
export interface DiscreteConfig extends BaseConfig {
  // Add discrete-specific config here later
}

/**
 * Union type for all configs
 */
export type SliderConfig = MarqueeConfig | CurvedConfig | DiscreteConfig;

// =============================================================================
// Mode Interface
// =============================================================================
export interface SliderMode {
  /**
   * Initialize the slider mode
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
  track: HTMLElement;
  items: HTMLElement[];
  config: BaseConfig;
  gsap: any; // GSAP instance
}

/**
 * Marquee mode dependencies
 */
export interface MarqueeDependencies extends BaseDependencies {
  // Uses base config only
}

/**
 * Curved mode dependencies
 */
export interface CurvedDependencies extends BaseDependencies {
  // Uses base config, parses curved-specific internally
}

/**
 * Discrete mode dependencies (future)
 */
export interface DiscreteDependencies extends BaseDependencies {
  // Uses base config, parses discrete-specific internally
}