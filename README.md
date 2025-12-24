# Liquid Metal Button ✨

A stunning chat input component with an animated liquid metal send button, featuring prismatic glow effects and smooth CSS animations. Built with **Cursor AI** and designed for **WeWeb**.

![Liquid Metal Effect](https://img.shields.io/badge/Effect-Liquid%20Metal-silver)
![Built with](https://img.shields.io/badge/Built%20with-Cursor%20AI-blue)
![Platform](https://img.shields.io/badge/Platform-WeWeb-purple)

## Inspiration

This component was inspired by [Brett's tweet](https://x.com/BrettFromDJ/status/2002114751078543846) showcasing the liquid glass metal effect. The mesmerizing animation caught my eye, and I recreated it as a functional WeWeb component.

## Features

- 🌊 **Liquid Metal Animation** - Rotating conic gradient ring with realistic metallic sheen
- 🌈 **Prismatic Glow** - Subtle rainbow reflections that shift as the button rotates
- 📷 **Camera Capture** - Live preview with photo capture functionality
- 🎤 **Voice Recording** - Built-in microphone support with recording indicator
- 📁 **File Upload** - Drag & drop or click to upload images, videos, and documents
- ✨ **AI Sparkle Icon** - Perfect for AI-powered chat interfaces
- 🎨 **Fully Customizable** - Control colors, sizes, animations, and icon visibility

## Customization Options

| Property | Description |
|----------|-------------|
| Container background | Input bar background color |
| Container border radius | 0-100px roundness |
| Container padding | Internal spacing |
| Send button size | 32-100px diameter |
| Animation speed | 1-10 seconds per rotation |
| Icon size | 16-48px |
| Icon color / hover color | Default and hover states |
| Show/hide icons | Toggle each icon independently |
| Text & placeholder colors | Input field styling |

## How It Was Built

### Step 1: Design in Cursor AI

Created the initial HTML/CSS/JavaScript prototype using Cursor AI:

```bash
# Created liquid-glass-button.html with:
# - CSS conic-gradient for metallic ring effect
# - @keyframes animation for smooth rotation
# - Prismatic glow overlay with blur effect
# - Dark glass input container styling
```

### Step 2: Initialize WeWeb Component

```bash
# Using npm 7+ (extra double-dash needed)
npm init @weweb/component liquid-glass-chat -- --type element

# Navigate to the directory
cd liquid-glass-chat

# Install dependencies
npm install
```

### Step 3: Migrate to Vue Component

Converted the HTML/CSS/JS into `src/wwElement.vue`:
- Template: HTML structure with Vue directives
- Script: Component logic with props, data, methods, and computed properties
- Style: Scoped SCSS with all animations

### Step 4: Configure WeWeb Properties

Updated `ww-config.js` with:
- Editor label and icon
- Bindable properties for customization
- Trigger events for user interactions

### Step 5: Test in WeWeb Editor

```bash
# Start dev server
npm run serve

# If port 8080 is busy, specify another port
npm run serve -- --port=8081
```

Then in WeWeb:
1. Go to **Settings > Custom Code > Developer**
2. Add component URL: `https://localhost:8080`
3. Click **Load**
4. Drag the component from the **Add** panel

### Step 6: Push to GitHub

```bash
git init
git remote add origin https://github.com/izzie-iz/liquid-metal-button.git
git add .
git commit -m "✨ Liquid Metal Button - WeWeb Custom Component"
git branch -M main
git push -u origin main
```

## Usage in WeWeb

### Events

The component emits these events you can listen to:

| Event | Payload |
|-------|---------|
| `On message sent` | `{ message, files, photo }` |
| `On camera clicked` | `{}` |
| `On microphone clicked` | `{}` |
| `On upload clicked` | `{}` |
| `On AI icon clicked` | `{}` |

### Example Workflow

1. User types a message or attaches media
2. Clicks the liquid metal send button
3. `On message sent` event fires with all data
4. Handle the event in WeWeb workflows

## Tech Stack

- **Vue 3** - Component framework
- **SCSS** - Scoped styling with variables
- **CSS Animations** - Pure CSS liquid metal effect
- **MediaDevices API** - Camera & microphone access
- **WeWeb CLI** - Component scaffolding and dev server

## Local Development

```bash
# Clone the repo
git clone https://github.com/izzie-iz/liquid-metal-button.git

# Install dependencies
npm install

# Start dev server
npm run serve

# Build for production
npm run build
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 14+

## License

MIT

---

**Built with 💜 using [Cursor AI](https://cursor.sh) for [WeWeb](https://www.weweb.io)**
