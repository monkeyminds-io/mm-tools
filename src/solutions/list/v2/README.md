# MonkeyMinds List v2.0

A unified list solution with multiple modes: load more, pagination, and infinite scroll.

## 🎯 Features

- **Multiple Modes** - One script, three behaviors
- **Load More Mode** - Height-based revealing animation
- **Pagination Mode** - Coming soon (discrete page navigation)
- **Infinite Scroll Mode** - Coming soon (auto-load on scroll)
- **Production Ready** - Clean architecture, fully tested
- **Lightweight** - ~4KB minified

## 🚀 Quick Start

### 1. Load the Script

```html
<script src="https://tools.monkeyminds.io/v2/list/"></script>
```

### 2. Add HTML Structure

```html
<div mm-tool="list" mm-list-mode="loadmore">
  <div class="list-container">
    <div mm-list-element="list" mm-list-gap="16">
      <div class="list-item">Item 1</div>
      <div class="list-item">Item 2</div>
      <div class="list-item">Item 3</div>
      <!-- More items... -->
    </div>
    
    <!-- Optional overlay for fade effect (add your gradient style) -->
    <div mm-list-element="overlay" class="your-gradient-class"></div>
  </div>
  
  <button mm-list-element="more-button">Load More</button>
</div>
```

That's it! The list auto-initializes and applies all required functional styles automatically.

**Note:** The solution automatically handles:
- Container overflow and positioning
- Height transitions (300ms ease-out)
- Overlay positioning
- Button fade transitions

You only need to style the visual appearance (colors, spacing, typography, etc.).

## 📖 Modes

### Load More Mode (Default)

Height-based revealing with smooth container expansion.

```html
<div mm-tool="list" mm-list-mode="loadmore">
  <div class="list-container">
    <div mm-list-element="list" mm-list-gap="16">
      <!-- items -->
    </div>
    <div mm-list-element="overlay"></div>
  </div>
  <button mm-list-element="more-button">Load More</button>
</div>
```

**Attributes:**
- `mm-list-gap="16"` - Gap between items in pixels

**Elements:**
- `mm-list-element="list"` - **Required.** Container for items
- `mm-list-element="more-button"` - **Required.** Load more button
- `mm-list-element="overlay"` - Optional fade overlay

### Pagination Mode

Coming soon - discrete page navigation with prev/next buttons.

```html
<div mm-tool="list" 
     mm-list-mode="pagination"
     mm-list-items-per-page="10">
  <div mm-list-element="list">
    <!-- items -->
  </div>
  <div class="pagination">
    <button mm-list-element="prev-button">Previous</button>
    <span mm-list-element="page-indicator"></span>
    <button mm-list-element="next-button">Next</button>
  </div>
</div>
```

### Infinite Scroll Mode

Coming soon - auto-load more items when scrolling to bottom.

```html
<div mm-tool="list" 
     mm-list-mode="infinite"
     mm-list-threshold="0.5">
  <div mm-list-element="list">
    <!-- items -->
  </div>
  <div mm-list-element="sentinel"></div>
  <div mm-list-element="loader">Loading...</div>
</div>
```

## 🎨 Examples

### Basic Load More

```html
<div mm-tool="list">
  <div class="list-container">
    <div mm-list-element="list">
      <div class="list-item">Item 1</div>
      <div class="list-item">Item 2</div>
    </div>
  </div>
  <button mm-list-element="more-button">Load More</button>
</div>
```

### With Fade Overlay

```html
<div mm-tool="list" mm-list-mode="loadmore">
  <div class="list-container">
    <div mm-list-element="list" mm-list-gap="24">
      <!-- items -->
    </div>
    <div mm-list-element="overlay" class="fade-overlay"></div>
  </div>
  <button mm-list-element="more-button">Show More</button>
</div>
```

## 🛠️ API

### Manual Initialization

```javascript
const container = document.querySelector('[mm-tool="list"]');
const list = new window.MonkeyMindsList(container);
```

### Reset to Initial State

```javascript
list.reset();
```

### Destroy Instance

```javascript
list.destroy();
```

### Access from Container

```javascript
const container = document.querySelector('[mm-tool="list"]');
const list = container.mmList;

// Reset
list.reset();

// Destroy
list.destroy();
```

## 📐 Common Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mm-tool` | string | - | **Required.** Must be `"list"` |
| `mm-list-mode` | string | `"loadmore"` | Mode: `loadmore`, `pagination`, or `infinite` |
| `mm-list-gap` | number | `0` | Gap between items in pixels |

## 📊 Load More Mode Details

| Element | Required | Description |
|---------|----------|-------------|
| `mm-list-element="list"` | ✅ | Container for list items |
| `mm-list-element="more-button"` | ✅ | Button to reveal more items |
| `mm-list-element="overlay"` | ❌ | Optional fade overlay |

**How it works:**
1. Calculates row height from first item
2. Sets initial container height to show ~1 row
3. Each click expands container by one row height
4. Reveals all content when fully expanded
5. Auto-adjusts on window resize

## 🎭 Events

### Load More Events

```javascript
const container = document.querySelector('[mm-tool="list"]');

// Fired on each load more click
container.addEventListener('mm:listLoadMore', (event) => {
  console.log('Clicks:', event.detail.clicksCount);
  console.log('Complete:', event.detail.isComplete);
});

// Fired when all content is revealed
container.addEventListener('mm:listComplete', (event) => {
  console.log('Total clicks:', event.detail.totalClicks);
  console.log('Mode:', event.detail.mode);
});
```

### Pagination Events (Coming Soon)

```javascript
container.addEventListener('mm:listPageChange', (event) => {
  console.log('Current page:', event.detail.currentPage);
  console.log('Total pages:', event.detail.totalPages);
});
```

### Infinite Scroll Events (Coming Soon)

```javascript
container.addEventListener('mm:listInfiniteLoad', (event) => {
  console.log('Loading more items...');
});
```

## 🏗️ Architecture

**Pattern:** Strategy Pattern with Factory

**Structure:**
```
v2/
├── index.ts           (Factory - routes to modes)
├── types.ts           (Interfaces)
├── manifest.json
├── README.md
└── modes/
    ├── LoadMoreMode.ts    (Height-based reveal)
    ├── PaginationMode.ts  (Coming soon)
    └── InfiniteMode.ts    (Coming soon)
```

**Benefits:**
- Each mode is isolated and independent
- Easy to add new modes
- Clean separation of concerns
- Testable and maintainable

## 🔄 Migration from v1.0

Two simple changes needed:

```html
<!-- v1.0 -->
<div mm-tool="list-load-more">
  <div mm-list-element="list">
    <!-- items -->
  </div>
  <button mm-list-element="more-button">Load More</button>
</div>

<!-- v2.0 -->
<div mm-tool="list" mm-list-mode="loadmore">
  <div mm-list-element="list">
    <!-- items -->
  </div>
  <button mm-list-element="more-button">Load More</button>
</div>
```

Changes:
1. `mm-tool="list-load-more"` → `mm-tool="list"`
2. Add `mm-list-mode="loadmore"`

All other attributes remain the same!

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 💡 Tips

### Styling Items

The list applies minimal inline styles. You control the look:

```css
[mm-list-element="list"] > * {
  /* Your custom item styles */
}
```

### Responsive

Items are naturally responsive. Use CSS to adjust sizes:

```css
.list-item {
  padding: 20px;
}

@media (max-width: 768px) {
  .list-item {
    padding: 15px;
  }
}
```

### Performance

For best performance:
- Use `transition` on overlay and button (auto-applied)
- Keep reasonable number of items in DOM
- Use minified version in production

## 🆕 What's New in v2.0

- **Unified API** - One tool attribute for all modes
- **Strategy Pattern** - Clean, modular architecture
- **Better separation** - Each mode is independent
- **Easier to extend** - Add new modes without touching existing code
- **Smaller bundle** - Optimized code structure
- **Production tested** - Fully validated refactor

## 🔮 Future Modes & Features

### Planned Modes
- **Pagination Mode** - Traditional page-by-page navigation
  - Prev/Next buttons
  - Page indicators
  - Jump to page
  - First/Last page buttons
  - URL hash support

- **Infinite Scroll Mode** - Auto-load on scroll
  - Intersection Observer API
  - Configurable threshold
  - Loading states
  - Error handling
  - Pull to refresh (mobile)

### Planned Features
- **Filtering** - Filter items by category/tag
- **Sorting** - Sort items by different criteria
- **Search** - Search within list items
- **Virtual Scrolling** - For very large lists
- **Grid Mode** - Masonry/grid layouts
- **Animations** - Entrance animations for revealed items
- **Skeleton Loading** - Better loading states
- **Lazy Images** - Image lazy loading integration
- **Accessibility** - Enhanced ARIA support
- **Keyboard Navigation** - Full keyboard support

### Advanced Features
- **Batch Loading** - Load items in configurable batches
- **Dynamic Item Heights** - Handle variable-height items
- **Smooth Scroll** - Auto-scroll to newly loaded content
- **Memory Management** - Remove off-screen items for performance
- **State Persistence** - Remember scroll position on page reload
- **Loading Strategies** - Preload, on-demand, or scheduled
- **Custom Templates** - Item rendering with templates
- **Data Binding** - Connect to data sources/APIs

## 📚 Resources

- **Examples:** `/examples/v2/list/`
- **Source:** GitHub (link)
- **Support:** [Contact MonkeyMinds](https://monkeyminds.io/contact)

## 🐛 Troubleshooting

**Q: Load more doesn't work**
- Ensure all required attributes are set (`mm-tool="list"`, `mm-list-element="list"`, `mm-list-element="more-button"`)
- Check that the first list item has a valid height
- Verify the list has a parent container element

**Q: Responsive issues**
- The solution automatically handles resize events
- Make sure your CSS doesn't set fixed heights that interfere
- Check that items have proper responsive styles

**Q: Animation not smooth**
- Add the recommended CSS transitions to overlay and button
- Check for conflicting CSS animations
- Ensure no JavaScript is interfering with heights

**Q: Height calculation incorrect**
- Verify the first item is representative of all items
- Check for dynamic content that loads after initialization
- Use `mm-list-gap` if items have margins

---

**MonkeyMinds Tools v2.0** - Professional web solutions for modern developers

© 2025 MonkeyMinds. MIT License.