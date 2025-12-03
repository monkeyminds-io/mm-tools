/**
 * MonkeyMinds Flip Counter - Type Definitions
 */

export interface BaseConfig {
  mode: 'timer' | 'counter';
  direction: 'up' | 'down';
  divider: string;
  speed: number; // ms between updates
}

export interface CounterConfig extends BaseConfig {
  mode: 'counter';
  startValue: number;
  targetValue: number | null; // null = infinite
  increment: number;
}

export interface TimerConfig extends BaseConfig {
  mode: 'timer';
  targetDate: Date;
}

export interface CounterMode {
  init(): void;
  destroy(): void;
}

export interface BaseDependencies {
  container: HTMLElement;
  display: HTMLElement;
  config: BaseConfig;
  gsap: any;
}