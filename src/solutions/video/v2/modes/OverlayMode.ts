/**
 * MonkeyMinds Video v1.0 - Overlay Mode
 * Play/pause video with overlay control
 */
import { VideoMode, OverlayDependencies } from '../types';

export class OverlayMode implements VideoMode {
  private container: HTMLElement;
  private video: HTMLVideoElement;
  private overlay: HTMLElement;
  private config: OverlayDependencies['config'];
  private isPlaying: boolean = false;

  // Bound event handlers for cleanup
  private handleOverlayClick: () => void;
  private handleVideoClick: () => void;

  constructor(deps: OverlayDependencies) {
    this.container = deps.container;
    this.video = deps.video;
    this.overlay = deps.overlay;
    this.config = deps.config;

    // Bind event handlers
    this.handleOverlayClick = this.onOverlayClick.bind(this);
    this.handleVideoClick = this.onVideoClick.bind(this);
  }

  public init(): void {
    this.setupVideo();
    this.setupOverlay();
    this.attachEventListeners();

    // Auto-play if configured
    if (this.config.autoplay) {
      this.play();
    }
  }

  private setupVideo(): void {
    // Apply video attributes
    this.video.loop = this.config.loop;
    this.video.muted = this.config.muted;

    // Ensure video is ready
    this.video.preload = 'metadata';

    // Style video for proper positioning
    this.video.style.width = '100%';
    this.video.style.height = '100%';
    this.video.style.objectFit = 'cover';
    this.video.style.cursor = 'pointer';
  }

  private setupOverlay(): void {
    // Make overlay clickable
    this.overlay.style.cursor = 'pointer';
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.pointerEvents = 'auto';

    // Apply transition if configured
    if (this.config.transition === 'fade') {
      this.overlay.style.transition = `opacity ${this.config.transitionDuration}ms ease`;
    }

    // Initially visible
    this.overlay.style.opacity = '1';
  }

  private attachEventListeners(): void {
    // Click overlay to play
    this.overlay.addEventListener('click', this.handleOverlayClick);

    // Click video to pause
    this.video.addEventListener('click', this.handleVideoClick);
  }

  private onOverlayClick(): void {
    this.play();
  }

  private onVideoClick(): void {
    if (this.isPlaying) {
      this.pause();
    }
  }

  private play(): void {
    this.video.play()
      .then(() => {
        this.isPlaying = true;
        this.hideOverlay();
      })
      .catch(error => {
        console.error('MonkeyMinds Video: Failed to play video', error);
      });
  }

  private pause(): void {
    this.video.pause();
    this.isPlaying = false;
    this.showOverlay();
  }

  private hideOverlay(): void {
    if (this.config.transition === 'fade') {
      this.overlay.style.opacity = '0';
      // Disable pointer events after transition
      setTimeout(() => {
        this.overlay.style.pointerEvents = 'none';
      }, this.config.transitionDuration);
    } else {
      this.overlay.style.display = 'none';
    }
  }

  private showOverlay(): void {
    if (this.config.transition === 'fade') {
      this.overlay.style.pointerEvents = 'auto';
      this.overlay.style.opacity = '1';
    } else {
      this.overlay.style.display = 'block';
    }
  }

  public destroy(): void {
    // Remove event listeners
    this.overlay.removeEventListener('click', this.handleOverlayClick);
    this.video.removeEventListener('click', this.handleVideoClick);

    // Pause video
    this.video.pause();

    // Reset overlay
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'auto';
  }
}