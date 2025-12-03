/**
 * MonkeyMinds Flip Counter - Timer Mode
 * Countdown/countup to a date
 */

import { CounterMode as ICounterMode, BaseDependencies } from '../types';

export class TimerMode implements ICounterMode {
  private container: HTMLElement;
  private display: HTMLElement;
  private config: BaseDependencies['config'];
  private gsap: any;
  
  private targetDate: Date;
  private intervalId: number | null = null;
  
  private digitBlocks: HTMLElement[][] = []; // [days, hours, mins, secs]
  
  constructor(deps: BaseDependencies) {
    this.container = deps.container;
    this.display = deps.display;
    this.config = deps.config;
    this.gsap = deps.gsap;
    
    const dateStr = this.container.getAttribute('mm-counter-target-date');
    if (!dateStr) {
      console.error('MonkeyMinds Flip Counter: Timer mode requires mm-counter-target-date');
      this.targetDate = new Date();
    } else {
      this.targetDate = new Date(dateStr);
    }
  }
  
  public init(): void {
    this.buildDisplay();
    this.start();
  }
  
  private buildDisplay(): void {
    this.display.innerHTML = '';
    this.digitBlocks = [];
    
    const time = this.getTimeRemaining();
    
    // Days (3 digits)
    this.addTimeUnit(time.days, 3);
    this.addDivider();
    
    // Hours (2 digits)
    this.addTimeUnit(time.hours, 2);
    this.addDivider();
    
    // Minutes (2 digits)
    this.addTimeUnit(time.minutes, 2);
    this.addDivider();
    
    // Seconds (2 digits)
    this.addTimeUnit(time.seconds, 2);
  }
  
  private addTimeUnit(value: number, digitCount: number): void {
    const unitBlocks: HTMLElement[] = [];
    const valueStr = value.toString().padStart(digitCount, '0');
    
    for (let i = 0; i < digitCount; i++) {
      const digit = parseInt(valueStr[i]);
      const block = this.createDigitBlock(digit);
      this.display.appendChild(block);
      unitBlocks.push(block);
    }
    
    this.digitBlocks.push(unitBlocks);
  }
  
  private createDigitBlock(initialValue: number): HTMLElement {
    const block = document.createElement('div');
    block.className = 'flip-digit-block';
    block.style.cssText = 'position: relative; display: inline-block; overflow: hidden;';
    
    const strip = document.createElement('div');
    strip.className = 'flip-digit-strip';
    strip.style.cssText = 'display: flex; flex-direction: column;';
    
    for (let i = 0; i <= 9; i++) {
      const digit = document.createElement('div');
      digit.className = 'flip-digit';
      digit.textContent = i.toString();
      strip.appendChild(digit);
    }
    
    block.appendChild(strip);
    this.gsap.set(strip, { y: `-${initialValue * 10}%` });
    
    return block;
  }
  
  private addDivider(): void {
    const divider = document.createElement('span');
    divider.className = 'flip-divider';
    divider.textContent = this.config.divider;
    divider.style.cssText = 'display: inline-block; margin: 0 0.25em;';
    this.display.appendChild(divider);
  }
  
  private getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const diff = this.config.direction === 'down' 
      ? this.targetDate.getTime() - now.getTime()
      : now.getTime() - this.targetDate.getTime();
    
    if (diff < 0 && this.config.direction === 'down') {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const absDiff = Math.abs(diff);
    const seconds = Math.floor((absDiff / 1000) % 60);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    
    return { days, hours, minutes, seconds };
  }
  
  private start(): void {
    this.intervalId = window.setInterval(() => {
      this.update();
    }, this.config.speed);
  }
  
  private update(): void {
    const time = this.getTimeRemaining();
    const values = [
      time.days.toString().padStart(3, '0'),
      time.hours.toString().padStart(2, '0'),
      time.minutes.toString().padStart(2, '0'),
      time.seconds.toString().padStart(2, '0')
    ];
    
    values.forEach((valueStr, unitIndex) => {
      const unitBlocks = this.digitBlocks[unitIndex];
      
      for (let i = 0; i < valueStr.length; i++) {
        const digit = parseInt(valueStr[i]);
        const block = unitBlocks[i];
        const strip = block.querySelector('.flip-digit-strip') as HTMLElement;
        
        this.gsap.to(strip, {
          y: `-${digit * 10}%`,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }
  
  public destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}