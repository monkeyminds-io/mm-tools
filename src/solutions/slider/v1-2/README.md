# MonkeyMinds Slider v1.2

A unified GSAP-powered slider solution with multiple modes: marquee, curved, and discrete (coming soon).

## 🎯 Features

- **Multiple Modes** - One script, three behaviors
- **Marquee Mode** - Horizontal infinite scrolling
- **Curved Mode** - Circular arc rotation with optional 3D
- **Discrete Mode** - Coming soon (prev/next navigation)
- **Production Ready** - Clean architecture, fully tested
- **Lightweight** - ~4KB minified

## 🚀 Quick Start

### 1. Load GSAP (required)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
```

### 2. Load MonkeyMinds Slider

```html
<script src="https://tools.monkeyminds.io/v1-2/slider/"></script>
```

### 3. Add HTML Structure

```html
<div mm-tool="slider" mm-slider-mode="marquee">
  <div mm-slider-element="track">
    <div mm-slider-element="item">Item 1</div>
    <div mm-slider-element="item">Item 2</div>
    <div mm-slider-element="item">Item 3</div>
  </div>
</div>
```

That's it! The slider auto-initializes.

## 📖 Modes

### Marquee Mode (Default)

Horizontal infinite scrolling marquee.

```html
<div mm-tool="slider" mm-slider-mode="marquee">
  <div mm-slider-element="track">
    <!-- items -->
  </div>
</div>
```

**Attributes:**
- `mm-slider-speed="50"` - Speed in pixels/second
- `mm-slider-direction="left|right"` - Scroll direction
- `mm-slider-gap="24"` - Gap between items in pixels
- `mm-slider-pauseonhover="true|false"` - Pause on hover

### Curved Mode

Circular arc rotation with optional 3D effects.

```html
<div mm-tool="slider" 
     mm-slider-mode="curved"
     mm-slider-radius="400"
     mm-slider-arc-position="top">
  <div mm-slider-element="track">
    <!-- items -->
  </div>
</div>
```

**Attributes:**
- `mm-slider-radius="400"` - Circle radius in pixels
- `mm-slider-arc-position="top|bottom|left|right"` - Arc position
- `mm-slider-gap="24"` - Gap between items in degrees
- `mm-slider-perspective="true|false"` - Enable 3D perspective
- `mm-slider-scale="true|false"` - Scale items by position
- `mm-slider-scale-range="0.5,1"` - Min/max scale values

### Discrete Mode

Coming soon - prev/next navigation with discrete slides.

## 🎨 Examples

### Basic Marquee

```html
<div mm-tool="slider">
  <div mm-slider-element="track">
    <div mm-slider-element="item">Slide 1</div>
    <div mm-slider-element="item">Slide 2</div>
  </div>
</div>
```

### Fast Right-Scrolling Marquee

```html
<div mm-tool="slider" 
     mm-slider-mode="marquee"
     mm-slider-direction="right" 
     mm-slider-speed="100">
  <!-- items -->
</div>
```

### Curved with 3D Effects

```html
<div mm-tool="slider" 
     mm-slider-mode="curved"
     mm-slider-perspective="true"
     mm-slider-scale="true"
     mm-slider-scale-range="0.6,1">
  <!-- items -->
</div>
```

### Logo Wall Marquee

```html
<div mm-tool="slider" 
     mm-slider-mode="marquee"
     mm-slider-speed="40"
     mm-slider-gap="48">
  <div mm-slider-element="track">
    <div mm-slider-element="item">
      <img src="logo1.svg" alt="Company 1">
    </div>
    <div mm-slider-element="item">
      <img src="logo2.svg" alt="Company 2">
    </div>
  </div>
</div>
```

## 🛠️ API

### Manual Initialization

```javascript
const container = document.querySelector('[mm-tool="slider"]');
const slider = new window.MonkeyMindsSlider(container);
```

### Destroy Instance

```javascript
slider.destroy();
```

## 📐 Common Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mm-tool` | string | - | **Required.** Must be `"slider"` |
| `mm-slider-mode` | string | `"marquee"` | Mode: `marquee`, `curved`, or `discrete` |
| `mm-slider-speed` | number | `50` | Animation speed (px/s) |
| `mm-slider-direction` | string | `"left"` | Direction: `left` or `right` |
| `mm-slider-gap` | number | `24` | Gap (px for marquee, degrees for curved) |
| `mm-slider-pauseonhover` | boolean | `true` | Pause on hover |

## 🎭 Curved Mode Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mm-slider-radius` | number | `400` | Circle radius (px) |
| `mm-slider-arc-position` | string | `"top"` | Arc position |
| `mm-slider-perspective` | boolean | `false` | Enable 3D perspective |
| `mm-slider-perspective-depth` | number | `1000` | Perspective depth (px) |
| `mm-slider-scale` | boolean | `false` | Scale items by position |
| `mm-slider-scale-range` | string | `"0.5,1"` | Min,max scale values |

## 🏗️ Architecture

**Pattern:** Strategy Pattern with Factory

**Structure:**
```
v1-2/
├── index.ts           (Factory - routes to modes)
├── types.ts           (Interfaces)
└── modes/
    ├── MarqueeMode.ts (Horizontal scrolling)
    ├── CurvedMode.ts  (Circular rotation)
    └── DiscreteMode.ts (Coming soon)
```

**Benefits:**
- Each mode is isolated and independent
- Easy to add new modes
- Clean separation of concerns
- Testable and maintainable

## 🔄 Migration from v1.1

Only one change needed:

```html
<!-- v1.1 -->
<div mm-tool="infinite-slider" mm-slider-mode="marquee">

<!-- v1.2 -->
<div mm-tool="slider" mm-slider-mode="marquee">
```

All other attributes remain the same!

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 Requirements

- **GSAP 3.x** - Must be loaded before the slider script

## 💡 Tips

### Styling Items

The slider applies minimal inline styles. You control the look:

```css
[mm-slider-element="item"] {
  /* Your custom styles */
}
```

### Responsive

Items are naturally responsive. Use CSS to adjust sizes:

```css
[mm-slider-element="item"] {
  width: 200px;
}

@media (max-width: 768px) {
  [mm-slider-element="item"] {
    width: 150px;
  }
}
```

### Performance

For best performance:
- Use `will-change: transform` on track (auto-applied)
- Keep item count reasonable for curved mode
- Use minified version in production

## 🆕 What's New in v1.2

- **Unified API** - One tool attribute for all modes
- **Strategy Pattern** - Clean, modular architecture
- **Better separation** - Each mode is independent
- **Easier to extend** - Add new modes without touching existing code
- **Smaller bundle** - Optimized code structure
- **Production tested** - Fully validated refactor

## 🔮 Coming Soon

- **Discrete Mode** - Prev/next navigation
- **Touch/Drag Support** - Mobile interactions
- **Keyboard Navigation** - Accessibility improvements
- **Auto-height** - Dynamic container sizing

## 📚 Resources

- **Examples:** `/examples/v1-2/slider/`
- **Source:** GitHub (link)
- **Support:** [Contact MonkeyMinds](https://monkeyminds.io/contact)

---

**MonkeyMinds Tools v1.2** - Professional web solutions for modern developers

© 2025 MonkeyMinds. MIT License.