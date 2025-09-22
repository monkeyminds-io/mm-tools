# MonkeyMinds Load More v1.0

A height-based load more solution that reveals list items by smoothly expanding the container height instead of showing/hiding elements.

## Features

- **Height-based animation**: Smooth container expansion instead of show/hide
- **Responsive design**: Automatically recalculates on window resize
- **Optional overlay**: Fade effect with customizable height
- **Custom gap support**: Define spacing between list items
- **Smooth animations**: 300ms fade transitions
- **Custom events**: Track load more interactions
- **Public API**: Methods for reset and cleanup

## Quick Start

### 1. Include the Script

```html
<script src="https://tools.monkeyminds.io/v1-0/list/load-more"></script>
```

### 2. HTML Structure

```html
<div mm-tool="list-load-more">
  <div class="list-container">
    <div mm-list-element="list" mm-list-gap="16">
      <div class="list-item">Item 1</div>
      <div class="list-item">Item 2</div>
      <div class="list-item">Item 3</div>
      <!-- More items... -->
    </div>
    
    <!-- Optional overlay for fade effect -->
    <div mm-list-element="overlay" class="fade-overlay"></div>
  </div>
  
  <button mm-list-element="more-button">Load More</button>
</div>
```

### 3. CSS (Required)

```css
.list-container {
  overflow: hidden;
  position: relative;
}

.fade-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, white);
  pointer-events: none;
}

/* Smooth transitions */
[mm-list-element="overlay"],
[mm-list-element="more-button"] {
  transition: opacity 300ms ease-out;
}
```

## Attributes

| Attribute | Element | Description | Required |
|-----------|---------|-------------|----------|
| `mm-tool="list-load-more"` | Container | Main container element | ✅ |
| `mm-list-element="list"` | List | The list containing items | ✅ |
| `mm-list-element="more-button"` | Button | Load more trigger button | ✅ |
| `mm-list-element="overlay"` | Overlay | Optional fade overlay | ❌ |
| `mm-list-gap="number"` | List | Gap between items in pixels | ❌ |

## Events

Listen to custom events for advanced interactions:

```javascript
const container = document.querySelector('[mm-tool="list-load-more"]');

// Fired on each load more click
container.addEventListener('mm:loadMore', (event) => {
  console.log('Loaded more items:', event.detail);
});

// Fired when all content is revealed
container.addEventListener('mm:loadMoreComplete', (event) => {
  console.log('Load more completed:', event.detail);
});
```

## API Methods

Access the instance through the container element:

```javascript
const container = document.querySelector('[mm-tool="list-load-more"]');
const loadMoreInstance = container.mmLoadMore;

// Reset to initial state
loadMoreInstance.reset();

// Clean up and remove event listeners
loadMoreInstance.destroy();
```

## Advanced Configuration

### Custom Gap Calculation

The gap attribute adds spacing between rows in the height calculation:

```html
<div mm-list-element="list" mm-list-gap="24">
  <!-- Items with 24px gap -->
</div>
```

### Overlay Height

The overlay takes 75% of a row's height by default. This creates a natural fade effect without covering too much content.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Examples

Check out the example files:
- `examples/basic.html` - Simple load more setup
- `examples/with-overlay.html` - Load more with fade overlay

## Troubleshooting

**Q: Load more doesn't work**
- Ensure all required attributes are set
- Check that the first list item has a valid height
- Verify the container structure is correct

**Q: Responsive issues**
- The solution automatically handles resize events
- Make sure your CSS doesn't interfere with height calculations

**Q: Animation not smooth**
- Add the recommended CSS transitions
- Check for conflicting styles

## Version History

### v1.0.0
- Initial release
- Height-based revealing
- Responsive design
- Overlay support
- Custom events and API