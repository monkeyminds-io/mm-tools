// =============================================================================
// File Name: utiles.js
// File Description:
// This file contains utility functions that can be used across different parts of the project.
// =============================================================================
// HTML Elements Manipulation
/**
 * Removes given element(s) from the DOM based
 */
export const removeElement = (element) => {
    element.style.opacity = '0';
    setTimeout(() => element.remove(), 300);
}
// =============================================================================