// =============================================================================
// File Name: load-more/index.js
// File Description:
// This file contains the logic for a "Load More" button that reveals more items in a list when clicked.
// =============================================================================
// =============================================================================
// Imports
// =============================================================================
import { removeElement } from '../../libs/utiles.js'

// =============================================================================
// Load More Button Logic
// =============================================================================
window.onload = () => {
    // DOM Elements
    const list = document.querySelector('[mm-list-element="list"]')
    const moreButton = document.querySelector('[mm-list-element="more-button"]')
    const overlay = document.querySelector('[mm-list-element="overlay"]') || null
    // Variables
    let rowsCount = 0
    let clicksCount = 0
    // Functions
    const setContainerHeight = () => {
        let rowHeight = list.children[0].offsetHeight + 32
        let initHeight = rowHeight + (overlay ? rowHeight * 0.75 : 0)
        rowsCount = Math.ceil(list.parentElement.offsetHeight / rowHeight) - 1
        return initHeight + (rowHeight * clicksCount) + 'px'
    }
    const setFinalState = () => {
        overlay && removeElement(overlay)
        moreButton && removeElement(moreButton)
        return 'auto'
    }
    // Initial setup
    const init = () => list.parentElement.style.height = setContainerHeight()
    init()
    console.log("Initial Row Count: ", rowsCount)
    // Responsiveness
    window.onresize = () => {
        init()
        console.log("Row Count: ", rowsCount)
    }
    // Click animation
    moreButton.onclick = (event) => {
        event.preventDefault()
        clicksCount++
        if(clicksCount === rowsCount) list.parentElement.style.height = setFinalState()
        else list.parentElement.style.height = setContainerHeight()
    }
}