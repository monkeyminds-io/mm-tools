/**
 * MonkeyMinds Tools - Shared GSAP Types
 * 
 * Minimal TypeScript interfaces for GSAP functionality
 * Used across all solutions that leverage GSAP
 * 
 * Note: These are interface definitions only. GSAP must be loaded
 * separately via CDN in the browser environment.
 */

// =============================================================================
// Timeline
// =============================================================================
export interface GSAPTimeline {
  pause(): GSAPTimeline;
  play(): GSAPTimeline;
  resume(): GSAPTimeline;
  reverse(): GSAPTimeline;
  restart(): GSAPTimeline;
  kill(): void;
  progress(value?: number): number | GSAPTimeline;
  duration(value?: number): number | GSAPTimeline;
  time(value?: number): number | GSAPTimeline;
  timeScale(value?: number): number | GSAPTimeline;
  
  // Animation methods
  to(target: any, vars: any): GSAPTimeline;
  from(target: any, vars: any): GSAPTimeline;
  fromTo(target: any, fromVars: any, toVars: any): GSAPTimeline;
  set(target: any, vars: any): GSAPTimeline;
  
  // Callbacks
  call(callback: Function, params?: any[], position?: string | number): GSAPTimeline;
  add(value: any, position?: string | number): GSAPTimeline;
}

// =============================================================================
// Tween
// =============================================================================
export interface GSAPTween {
  pause(): GSAPTween;
  play(): GSAPTween;
  resume(): GSAPTween;
  reverse(): GSAPTween;
  restart(): GSAPTween;
  kill(): void;
  progress(value?: number): number | GSAPTween;
  duration(value?: number): number | GSAPTween;
  time(value?: number): number | GSAPTween;
  timeScale(value?: number): number | GSAPTween;
}

// =============================================================================
// Main GSAP Interface
// =============================================================================
export interface GSAP {
  // Core animation methods
  to(target: any, vars: any): GSAPTween;
  from(target: any, vars: any): GSAPTween;
  fromTo(target: any, fromVars: any, toVars: any): GSAPTween;
  set(target: any, vars: any): void;
  
  // Property getter
  getProperty(target: any, property: string, unit?: string): any;
  
  // Timeline
  timeline(vars?: any): GSAPTimeline;
  
  // Utilities
  registerPlugin(...plugins: any[]): void;
  utils: {
    toArray(target: any): any[];
    wrap(items: any[]): (index: number) => any;
    clamp(min: number, max: number, value: number): number;
    interpolate(start: any, end: any, progress: number): any;
    mapRange(
      inMin: number,
      inMax: number,
      outMin: number,
      outMax: number,
      value: number
    ): number;
  };
  
  // Ticker
  ticker: {
    add(callback: Function): void;
    remove(callback: Function): void;
    fps(fps: number): void;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if GSAP is loaded in the browser environment
 */
export function isGSAPLoaded(): boolean {
  return typeof window !== 'undefined' && !!(window as any).gsap;
}

/**
 * Get GSAP instance from window with type safety
 */
export function getGSAP(): GSAP | null {
  if (!isGSAPLoaded()) {
    return null;
  }
  return (window as any).gsap as GSAP;
}

/**
 * Require GSAP or throw error with helpful message
 */
export function requireGSAP(solutionName: string): GSAP {
  const gsap = getGSAP();
  if (!gsap) {
    throw new Error(
      `MonkeyMinds ${solutionName}: GSAP is required but not loaded. ` +
      `Please include GSAP before this script: ` +
      `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>`
    );
  }
  return gsap;
}