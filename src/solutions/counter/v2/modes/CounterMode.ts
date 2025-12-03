/**
 * MonkeyMinds Flip Counter - Counter Mode
 * Simple numeric counter with dynamic block creation
 */

import { CounterMode as ICounterMode, BaseDependencies } from '../types';

// Utility
const numberToString = (number: number): string => Math.abs(number).toString();

export class CounterMode implements ICounterMode {
  private container: HTMLElement;
  private display: HTMLElement;
  private config: BaseDependencies['config'];
  private gsap: any;
  
  private currentValue: number;
  private targetValue: number | null;
  private increment: number;
  private intervalId: number | null = null;
  
  private digitBlocks: { block: HTMLElement; strip: HTMLElement }[] = [];
  
  constructor(deps: BaseDependencies) {
    this.container = deps.container;
    this.display = deps.display;
    this.config = deps.config;
    this.gsap = deps.gsap;
    
    // Parse counter config
    this.currentValue = parseInt(this.container.getAttribute('mm-counter-start') || '0');
    const target = this.container.getAttribute('mm-counter-target');
    this.targetValue = target && target !== 'infinite' ? parseInt(target) : null;
    this.increment = parseInt(this.container.getAttribute('mm-counter-increment') || '1');
    
    // Adjust increment direction
    if (this.config.direction === 'down') {
      this.increment = -Math.abs(this.increment);
    }
  }
  
  public init(): void {
    this.buildDisplay();
    this.start();
  }
  
  private buildDisplay(): void {
    this.display.innerHTML = '';
    this.digitBlocks = [];
    
    const digits = numberToString(this.currentValue).split('');
    
    digits.forEach((digitStr, index) => {
      // Add divider before block (except first)
      if (index > 0 && index % 3 === 0) {
        this.addDivider();
      }
      
      const digit = parseInt(digitStr);
      this.addDigitBlock(digit);
    });
  }
  
  private addDigitBlock(initialValue: number): void {
    const block = document.createElement('div');
    block.className = 'flip-digit-block';
    block.style.cssText = 'position: relative; display: inline-block; overflow: hidden;';
    
    const strip = document.createElement('div');
    strip.className = 'flip-digit-strip';
    strip.style.cssText = 'display: flex; flex-direction: column;';
    
    // Create digits 0-9
    for (let i = 0; i <= 9; i++) {
      const digit = document.createElement('div');
      digit.className = 'flip-digit';
      digit.textContent = i.toString();
      strip.appendChild(digit);
    }
    
    block.appendChild(strip);
    this.display.appendChild(block);
    
    // Set initial position
    this.gsap.set(strip, { y: `-${initialValue * 10}%` });
    
    this.digitBlocks.push({ block, strip });
  }
  
  private addDivider(): void {
    const divider = document.createElement('span');
    divider.className = 'flip-divider';
    divider.textContent = this.config.divider;
    divider.style.cssText = 'display: inline-block; margin: 0 0.25em;';
    this.display.appendChild(divider);
  }
  
  private start(): void {
    this.intervalId = window.setInterval(() => {
      this.update();
    }, this.config.speed);
  }
  
  private update(): void {
    const newValue = this.currentValue + this.increment;
    
    // Check if reached target
    if (this.targetValue !== null) {
      if ((this.config.direction === 'up' && newValue >= this.targetValue) ||
          (this.config.direction === 'down' && newValue <= this.targetValue)) {
        this.currentValue = this.targetValue;
        this.updateDisplay();
        this.destroy();
        return;
      }
    }
    
    // Check if digit count changed
    const currentDigits = numberToString(this.currentValue).length;
    const newDigits = numberToString(newValue).length;
    
    if (newDigits > currentDigits) {
      // Add new block on the left
      this.currentValue = newValue;
      this.buildDisplay(); // Rebuild with new block
    } else {
      this.currentValue = newValue;
      this.updateDisplay(); // Just animate existing blocks
    }
  }
  
  private updateDisplay(): void {
    const digits = numberToString(this.currentValue).split('');
    
    // Animate each digit to its new value
    digits.forEach((digitStr, index) => {
      if (index < this.digitBlocks.length) {
        const digit = parseInt(digitStr);
        const { strip } = this.digitBlocks[index];
        
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