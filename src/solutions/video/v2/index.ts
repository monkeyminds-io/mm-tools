/**
 * MonkeyMinds Video v1.0
 * Unified video solution with multiple modes
 * 
 * Attributes:
 * - mm-tool="video"
 * - mm-video-mode="overlay|inline|lightbox|background|playlist" (default: overlay)
 * - mm-video-element="player" (video element)
 * - mm-video-element="overlay" (overlay element - required for overlay mode)
 * - mm-video-autoplay="true|false" (default: false)
 * - mm-video-loop="true|false" (default: false)
 * - mm-video-muted="true|false" (default: false)
 * - mm-video-transition="fade|none" (default: fade)
 * - mm-video-transition-duration="300" (ms, default: 300)
 */

import { VideoMode, BaseVideoConfig, BaseDependencies, OverlayDependencies } from './types';
import { OverlayMode } from './modes/OverlayMode';
import { getAttributeNumber } from '../../../shared/utils';

// =============================================================================
// Main Video Class (Factory)
// =============================================================================
class Video {
  private container: HTMLElement;
  private video: HTMLVideoElement | null = null;
  private config: BaseVideoConfig | null = null;
  private mode: VideoMode | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Find video element
    this.video = container.querySelector<HTMLVideoElement>('[mm-video-element="player"]');
    if (!this.video) {
      console.error('MonkeyMinds Video: Video element not found');
      return;
    }

    // Parse configuration
    this.config = this.parseConfig();

    // Initialize the appropriate mode
    this.init();
  }

  private parseConfig(): BaseVideoConfig {
    const mode = (this.container.getAttribute('mm-video-mode') as 'overlay' | 'inline' | 'lightbox' | 'background' | 'playlist') || 'overlay';

    return {
      mode,
      autoplay: this.container.getAttribute('mm-video-autoplay') === 'true',
      loop: this.container.getAttribute('mm-video-loop') === 'true',
      muted: this.container.getAttribute('mm-video-muted') === 'true',
      transition: (this.container.getAttribute('mm-video-transition') as 'fade' | 'none') || 'fade',
      transitionDuration: getAttributeNumber(this.container, 'mm-video-transition-duration', 300)
    };
  }

  private init(): void {
    if (!this.config || !this.video) return;

    // Create base dependencies
    const baseDeps: BaseDependencies = {
      container: this.container,
      video: this.video,
      config: this.config
    };

    // Factory: Select and instantiate the appropriate mode
    switch (this.config.mode) {
      case 'overlay': {
        const overlay = this.container.querySelector<HTMLElement>('[mm-video-element="overlay"]');
        if (!overlay) {
          console.error('MonkeyMinds Video: Overlay element not found for overlay mode');
          return;
        }

        const deps: OverlayDependencies = {
          ...baseDeps,
          overlay
        };
        this.mode = new OverlayMode(deps);
        break;
      }

      case 'inline':
        console.warn('MonkeyMinds Video: Inline mode not yet implemented');
        return;

      case 'lightbox':
        console.warn('MonkeyMinds Video: Lightbox mode not yet implemented');
        return;

      case 'background':
        console.warn('MonkeyMinds Video: Background mode not yet implemented');
        return;

      case 'playlist':
        console.warn('MonkeyMinds Video: Playlist mode not yet implemented');
        return;

      default:
        console.error(`MonkeyMinds Video: Unknown mode "${this.config.mode}"`);
        return;
    }

    // Initialize the selected mode
    this.mode.init();
  }

  public destroy(): void {
    if (this.mode) {
      this.mode.destroy();
      this.mode = null;
    }
  }
}

// =============================================================================
// Auto-initialization
// =============================================================================
function initVideos(): void {
  const containers = document.querySelectorAll<HTMLElement>('[mm-tool="video"]');
  containers.forEach(container => new Video(container));
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideos);
} else {
  initVideos();
}

// Expose for manual initialization
(window as any).MonkeyMindsVideo = Video;