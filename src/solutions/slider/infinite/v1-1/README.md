# Infinite Slider - Marquee Mode (v1.1)

A GSAP-powered continuous marquee slider with seamless infinite looping. Perfect for logo walls, testimonials, or any content that needs to scroll endlessly.

## Features

- ✨ **Seamless infinite loop** - Content loops smoothly without jumps
- 🎯 **Simple setup** - Just add attributes, no JS configuration
- ⚡ **GSAP-powered** - Smooth, performant animations
- 🎨 **Fully customizable** - Speed, direction, spacing, and more
- 🖱️ **Hover pause** - Optional pause on mouse hover
- 📱 **Responsive** - Auto-adjusts to container width

## Quick Start

### 1. Load GSAP

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
```

### 2. Load MonkeyMinds Marquee

```html
<script src="https://tools.monkeyminds.io/v1-1/slider/infinite.js"></script>
```

### 3. Add HTML Structure

```html
<div mm-tool="infinite-slider">
  <div mm-slider-element="track">
    <div mm-slider-element="item">Slide 1</div>
    <div mm-slider-element="item">Slide 2</div>
    <div mm-slider-element="item">Slide 3</div>
  </div>
</div>
```

That's it! The marquee will auto-initialize and start scrolling.

## Attributes

### Container Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mm-tool` | string | - | **Required.** Must be `"infinite-slider"` |
| `mm-slider-speed` | number | 50 | Scroll speed in pixels per second |
| `mm-slider-direction` | string | "left" | Direction: `"left"` or `"right"` |
| `mm-slider-gap` | number | 20 | Spacing between items in pixels |
| `mm-slider-pauseonhover` | boolean | true | Pause animation on hover |

### Element Attributes

| Attribute | Value | Description |
|-----------|-------|-------------|
| `mm-slider-element` | `"track"` | **Required.** Container for items |
| `mm-slider-element` | `"item"` | **Required.** Individual slide item |

## Examples

### Default Marquee

```html
<div mm-tool="infinite-slider">
  <div mm-slider-element="track">
    <div mm-slider-element="item">Item 1</div>
    <div mm-slider-element="item">Item 2</div>
    <div mm-slider-element="item">Item 3</div>
  </div>
</div>
```

### Fast Right-Scrolling

```html
<div mm-tool="infinite-slider" 
     mm-slider-direction="right" 
     mm-slider-speed="100">
  <div mm-slider-element="track">
    <!-- items -->
  </div>
</div>
```

### Slow with More Spacing

```html
<div mm-tool="infinite-slider" 
     mm-slider-speed="25" 
     mm-slider-gap="40">
  <div mm-slider-element="track">
    <!-- items -->
  </div>
</div>
```

### No Hover Pause

```html
<div mm-tool="infinite-slider" 
     mm-slider-pauseonhover="false">
  <div mm-slider-element="track">
    <!-- items -->
  </div>
</div>
```

## How It Works

1. **Auto-cloning**: The slider automatically clones your items to create a seamless loop
2. **Smart calculations**: Determines optimal number of clones based on container width
3. **GSAP timeline**: Uses GSAP's timeline for smooth, performant animation
4. **Modulo positioning**: Uses modifiers to reset position for infinite effect

## Styling

The slider applies minimal inline styles. You control the look:

```css
/* Container overflow */
[mm-tool="infinite-slider"] {
  overflow: hidden;
}

/* Item styling */
[mm-slider-element="item"] {
  /* Your custom styles */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Requirements

- **GSAP 3.x** - Must be loaded before the slider script

## API

### Manual Initialization

```javascript
const container = document.querySelector('[mm-tool="infinite-slider"]');
const marquee = new window.MonkeyMindsMarquee(container);
```

### Destroy Instance

```javascript
marquee.destroy();
```

## Coming Soon

- Vertical marquee mode
- Touch/drag interaction
- Variable speed based on scroll position
- Discrete slider mode (separate solution)

## Support

Issues? Questions? [Contact us](https://monkeyminds.io/contact)

---

**MonkeyMinds Tools** - Professional web solutions for modern developers