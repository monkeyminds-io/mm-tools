/**
 * MonkeyMinds Flip Counter - Timer Mode
 * Countdown/countup to a date with all time units
 */

import { CounterMode as ICounterMode, BaseDependencies } from '../types';

export class TimerMode implements ICounterMode {
  private container: HTMLElement;
  private display: HTMLElement;
  private config: BaseDependencies['config'];
  private gsap: any;
  
  private targetDate: Date = new Date();
  private startDate: Date | null = null;
  private format: string;
  private intervalId: number | null = null;
  
  private digitBlocks: HTMLElement[][] = []; // Array of units, each with their digit blocks
  
  constructor(deps: BaseDependencies) {
    this.container = deps.container;
    this.display = deps.display;
    this.config = deps.config;
    this.gsap = deps.gsap;
    
    // Get format (default: 'dhms')
    // Options: 's', 'ms', 'hms', 'dhms', 'ymd', 'ym', 'y'
    this.format = this.container.getAttribute('mm-counter-format') || 'dhms';
    
    // For count-down: need target-date
    // For count-up: need start-date
    const targetDateStr = this.container.getAttribute('mm-counter-target-date');
    const startDateStr = this.container.getAttribute('mm-counter-start-date');
    
    if (this.config.direction === 'down') {
      if (!targetDateStr) {
        console.error('MonkeyMinds Flip Counter: Count-down requires mm-counter-target-date');
        this.targetDate = null as any;
      } else {
        this.targetDate = new Date(targetDateStr);
      }
    } else {
      // Count-up

          console.log('🏗️ TIMER MODE CONSTRUCTOR:', {
            direction: this.config.direction,
            format: this.format,
            targetDateStr,
            startDateStr
         });

      if (!startDateStr) {
        console.error('MonkeyMinds Flip Counter: Count-up requires mm-counter-start-date');
        this.startDate = null as any;
      } else {
        this.startDate = new Date(startDateStr);
      }
      console.log('  ✅ Start date set:', this.startDate ? this.startDate.toISOString() : 'null');
      
      // Optional target for count-up
      if (targetDateStr) {
        this.targetDate = new Date(targetDateStr);
        console.log('  ✅ Target date set (optional):', this.targetDate.toISOString());
      }
    }
  }
  
  public init(): void {
    this.buildDisplay();
    this.start();
  }
  
  private buildDisplay(): void {
    this.display.innerHTML = '';
    this.digitBlocks = [];
    
    const time = this.getTime();
    
    // Build display based on format
    switch (this.format) {
      case 's':
        this.addTimeUnit(time.seconds, 2);
        break;
      
      case 'ms':
        this.addTimeUnit(time.minutes, 2);
        this.addDivider();
        this.addTimeUnit(time.seconds, 2);
        break;
      
      case 'hms':
        this.addTimeUnit(time.hours, 2);
        this.addDivider();
        this.addTimeUnit(time.minutes, 2);
        this.addDivider();
        this.addTimeUnit(time.seconds, 2);
        break;
      
      case 'dhms':
      default:
        this.addTimeUnit(time.days, 3);
        this.addDivider();
        this.addTimeUnit(time.hours, 2);
        this.addDivider();
        this.addTimeUnit(time.minutes, 2);
        this.addDivider();
        this.addTimeUnit(time.seconds, 2);
        break;
      
      case 'y':
        this.addTimeUnit(time.years, 4);
        break;
      
      case 'ym':
        this.addTimeUnit(time.years, 4);
        this.addDivider();
        this.addTimeUnit(time.months, 2);
        this.addDivider();
        this.addTimeUnit(time.days, 2);
        break;
      
      case 'ymd':
        this.addTimeUnit(time.years, 4);
        this.addDivider();
        this.addTimeUnit(time.months, 2);
        this.addDivider();
        this.addTimeUnit(time.days, 2);
        this.addDivider();
        this.addTimeUnit(time.hours, 2);
        this.addDivider();
        this.addTimeUnit(time.minutes, 2);
        this.addDivider();
        this.addTimeUnit(time.seconds, 2);
        break;
    }
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
  
  private getTime(): { 
    years: number; 
    months: number; 
    days: number; 
    hours: number; 
    minutes: number; 
    seconds: number 
  } {
    const now = new Date();
    let diff: number;
    
    if (this.config.direction === 'down') {
      // Count-down: time REMAINING until target
      diff = this.targetDate.getTime() - now.getTime();
      
      // If target passed, show zeros
      if (diff < 0) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    } else {
      // Count-up: time ELAPSED since start
      if (!this.startDate) {
        console.error('startDate is null!');
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const startTime = this.startDate.getTime();
      diff = now.getTime() - startTime;
      
      console.log('🔺 COUNT UP:', {
        now: now.toISOString(),
        start: this.startDate ? this.startDate.toISOString() : 'undefined!',
        startTime: startTime,
        nowTime: now.getTime(),
        diff: diff,
        diffSeconds: Math.floor(diff / 1000)
      });
      
      // Make sure diff is positive
      if (diff < 0) {
        diff = 0;
      }
      
      // If there's a target, stop when reached
      if (this.targetDate) {
        const maxDiff = this.targetDate.getTime() - startTime;
        if (diff > maxDiff) {
          diff = maxDiff;
        }
      }
    }
    
    // Calculate time units from milliseconds
    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    
    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;
    
    // For years/months calculation
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;
    
    console.log('⏰ TIME UNITS:', {
      totalSeconds,
      seconds,
      minutes,
      hours,
      days: this.format.includes('y') ? days : totalDays
    });
    
    return { 
      years, 
      months, 
      days: this.format.includes('y') ? days : totalDays,
      hours, 
      minutes, 
      seconds 
    };
  }
  
  private start(): void {
    this.intervalId = window.setInterval(() => {
      this.update();
    }, this.config.speed);
  }
  
  private update(): void {
    const time = this.getTime();
    
    // Build values array based on format
    const values: string[] = [];
    
    switch (this.format) {
      case 's':
        values.push(time.seconds.toString().padStart(2, '0'));
        break;
      
      case 'ms':
        values.push(time.minutes.toString().padStart(2, '0'));
        values.push(time.seconds.toString().padStart(2, '0'));
        break;
      
      case 'hms':
        values.push(time.hours.toString().padStart(2, '0'));
        values.push(time.minutes.toString().padStart(2, '0'));
        values.push(time.seconds.toString().padStart(2, '0'));
        break;
      
      case 'dhms':
      default:
        values.push(time.days.toString().padStart(3, '0'));
        values.push(time.hours.toString().padStart(2, '0'));
        values.push(time.minutes.toString().padStart(2, '0'));
        values.push(time.seconds.toString().padStart(2, '0'));
        break;
      
      case 'y':
        values.push(time.years.toString().padStart(4, '0'));
        break;
      
      case 'ym':
        values.push(time.years.toString().padStart(4, '0'));
        values.push(time.months.toString().padStart(2, '0'));
        values.push(time.days.toString().padStart(2, '0'));
        break;
      
      case 'ymd':
        values.push(time.years.toString().padStart(4, '0'));
        values.push(time.months.toString().padStart(2, '0'));
        values.push(time.days.toString().padStart(2, '0'));
        values.push(time.hours.toString().padStart(2, '0'));
        values.push(time.minutes.toString().padStart(2, '0'));
        values.push(time.seconds.toString().padStart(2, '0'));
        break;
    }
    
    console.log('🎯 UPDATE VALUES:', values);
    
    // Update each unit
    values.forEach((valueStr, unitIndex) => {
      const unitBlocks = this.digitBlocks[unitIndex];
      
      for (let i = 0; i < valueStr.length; i++) {
        const digit = parseInt(valueStr[i]);
        const block = unitBlocks[i];
        const strip = block.querySelector('.flip-digit-strip') as HTMLElement;
        
        console.log(`   📍 Animating unit ${unitIndex}, digit ${i}: "${valueStr[i]}" → ${digit} → y: -${digit * 10}%`);
        
        // Claude I think this animation is not animating upwards correctly because the y value is negative?
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