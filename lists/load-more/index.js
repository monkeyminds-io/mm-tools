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
  let rowHeight = list.children[0].offsetHeight + 32
  let rowsCount = Math.ceil(list.parentElement.offsetHeight / rowHeight) - 1
  let initHeight = (rowHeight + (overlay ? rowHeight * 0.75 : 0))
  let clicksCount = 0
  // Functions
  const setContainerHeight = () => initHeight + (rowHeight * clicksCount) + 'px'
  const setFinalState = () => {
  	overlay && removeElement(overlay)
    moreButton && removeElement(moreButton)
  	return 'auto'
  }
  // Init state
  list.parentElement.style.height = setContainerHeight()
  // Responsiveness
  window.onresize = () => {
    rowHeight = list.children[0].offsetHeight + 32
    rowsCount = Math.ceil(list.parentElement.offsetHeight / rowHeight) - 1
    initHeight = (rowHeight + (overlay ? rowHeight * 0.75 : 0))
    list.parentElement.style.height = setContainerHeight()
  }
  // Click animation
  moreButton.onclick = (event) => {
  	event.preventDefault()
    clicksCount++
    if(clicksCount === rowsCount) list.parentElement.style.height = setFinalState()
    else list.parentElement.style.height = setContainerHeight()
  }
}