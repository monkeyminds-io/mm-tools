// =============================================================================
// File Name: index.ts
// File Description:
// This file contains utility functions that can be used across different MonkeyMinds solutions.
// =============================================================================

// HTML Elements Manipulation
/**
 * Removes given element(s) from the DOM with fade animation
 * @param element - The DOM element to remove
 * @param delay - Animation delay in milliseconds (default: 300)
 */
export const removeElement = (element: HTMLElement, delay: number = 300): void => {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.transition = `opacity ${delay}ms ease-out`;
    
    setTimeout(() => {
        element.remove();
    }, delay);
};

/**
 * Get numeric value from element attribute or return default
 * @param element - The DOM element
 * @param attribute - The attribute name
 * @param defaultValue - Default value if attribute doesn't exist
 */
export const getAttributeNumber = (element: HTMLElement, attribute: string, defaultValue: number = 0): number => {
    const value = element.getAttribute(attribute);
    return value ? parseInt(value, 10) : defaultValue;
};

/**
 * Debounce function to limit how often a function can be called
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 */
export const debounce = (func: Function, delay: number): Function => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Get element's computed height including margins
 * @param element - The DOM element
 */
export const getElementTotalHeight = (element: HTMLElement): number => {
    const styles = window.getComputedStyle(element);
    const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
    return element.offsetHeight + margin;
};