// =============================================================================
// File Name: slider/index.js
// File Description:
// This file contains the logic for the list slider that allows users to navigate through multiple items.
// =============================================================================
// =============================================================================
// Imports
// =============================================================================
import { cloneElement } from 'react'
import { removeElement } from '../../libs/utiles.js'
// =============================================================================
// Multi-Item Slider Logic
// =============================================================================
window.onload = () => {
    const sliders = document.querySelectorAll('[mm-tool="list-slider"]')
    sliders.forEach(slider => {
        // DOM Elements
        const list = slider.querySelector('[mm-list-element="list"]')
        const prevButton = slider.querySelector('[mm-list-element="button-prev"]')
        const nextButton = slider.querySelector('[mm-list-element="button-next"]')
        // Add a second copy of the list for infinite scrolling effect
        const listClone = cloneElement(list, true)
        slider.appendChild(listClone)
        // Variables
        let slideWidth = list.children[0].offsetWidth + list.getAttribute('mm-list-gap') ? parseInt(slider.getAttribute('mm-list-gap')) : 0
        let visibleSlides = window.innerWidth >= 1024 ? (list.getAttribute('mm-list-visible') ? parseInt(list.getAttribute('mm-list-visible')) : 1) :
                            window.innerWidth >= 768 ? (list.getAttribute('mm-list-visible-tablet') ? parseInt(list.getAttribute('mm-list-visible-tablet')) : 1) :
                            (list.getAttribute('mm-list-visible-mobile') ? parseInt(list.getAttribute('mm-list-visible-mobile')) : 1)
        let totalSlides = list.children.length
        let currentIndex = 0
        // Functions
        const updateSliderPosition = () => {
            list.style.transform = `translateX(-${currentIndex * slideWidth * visibleSlides}px)`
            list.nextSibling.style.transform = `translateX(-${currentIndex * slideWidth * visibleSlides}px)`
        }
        // Initial setup
        updateSliderPosition()
        // Responsiveness
        window.onresize = () => {
            slideWidth = list.children[0].offsetWidth + list.getAttribute('mm-list-gap') ? parseInt(slider.getAttribute('mm-list-gap')) : 0
            visibleSlides = window.innerWidth >= 1024 ? (list.getAttribute('mm-list-visible') ? parseInt(list.getAttribute('mm-list-visible')) : 1) :
                            window.innerWidth >= 768 ? (list.getAttribute('mm-list-visible-tablet') ? parseInt(list.getAttribute('mm-list-visible-tablet')) : 1) :
                            (list.getAttribute('mm-list-visible-mobile') ? parseInt(list.getAttribute('mm-list-visible-mobile')) : 1)
            if (currentIndex > totalSlides - visibleSlides) {
                currentIndex = totalSlides - visibleSlides
                if (currentIndex < 0) currentIndex = 0
                updateSliderPosition()
            }
        }
        // Button Click Handlers
        prevButton.onclick = (event) => {
            event.preventDefault()
            if (currentIndex > 0) {
                currentIndex--
                updateSliderPosition()
            }
            if (currentIndex <= 0) {
                // TODO Fix jump when going back from first to last
                currentIndex = totalSlides / visibleSlides
                updateSliderPosition()
            }
        }
        nextButton.onclick = (event) => {
            event.preventDefault()
            if (currentIndex < totalSlides - visibleSlides) {
                currentIndex++
                updateSliderPosition()
            }
            if (currentIndex >= totalSlides - visibleSlides) {
                // Start again from the beginning
                currentIndex = 0
                updateSliderPosition()
            }
        }
    })
}