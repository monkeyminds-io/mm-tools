window.onload = () => {
  // DOM Elements
  const newsList = document.querySelector('[mm-list-element="list"]')
  const moreButton = document.querySelector('[mm-list-element="more-button"]')
  // Variables
  let rowHeight = newsList.children[0].offsetHeight + 32
  let rowsCount = Math.ceil(newsList.parentElement.offsetHeight / rowHeight) - 1
  let initHeight = (rowHeight + (rowHeight * 0.75))
  let clicksCount = 0
  // Functions
  const setContainerHeight = () => initHeight + (rowHeight * clicksCount) + 'px'
  const setFinalState = () => {
  	moreButton.previousSibling.remove()
    moreButton.remove()
  	return 'auto'
  }
  // Init state
  newsList.parentElement.style.height = setContainerHeight()
  // Click animation
  moreButton.onclick = (event) => {
  	event.preventDefault()
    clicksCount++
    if(clicksCount === rowsCount) newsList.parentElement.style.height = setFinalState()
    else newsList.parentElement.style.height = setContainerHeight()
    console.log("Clicks = ", clicksCount)
    console.log("Rows = ", rowsCount)
  }
}