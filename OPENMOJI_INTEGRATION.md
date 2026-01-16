# OpenMoji Integration

Project Sapiens now uses [OpenMoji](https://openmoji.org/) emojis for a consistent, vibrant design system throughout the platform.

## What is OpenMoji?

OpenMoji is an open-source emoji library with 4000+ emojis in a cohesive design style. We're using OpenMoji 16.0.0 via CDN for performance and reliability.

## Implementation

### OpenMoji Component

Created `src/components/OpenMoji.tsx` - a reusable component that:
- Maps common emojis to their OpenMoji hex codes
- Loads SVG emojis from the jsdelivr CDN
- Supports custom sizing and styling
- Falls back to native emojis if mapping doesn't exist

### Usage Examples

```tsx
import OpenMoji from './OpenMoji';

// Basic usage
<OpenMoji emoji="🎯" size={24} />

// With custom styling
<OpenMoji emoji="🚀" size={48} className="custom-class" />
```

## Where OpenMoji is Used

### Hero Section
- Brain 🧠, Rocket 🚀, and Light Bulb 💡 icons above the main headline

### Features/Pillars Section
- 🗺️ Role-specific learning paths
- 🧪 Interactive AI labs
- 🔧 Build real projects
- 🏆 Track your progress
- ⏱️ Learn at your pace
- 🌈 Join a community

### Lesson Viewer
- 🎯 Create Your First Prompts
- 🎯 Practice the AIM Framework
- 🗺️ Practice the MAP Framework
- 🔧 Practice Debugging Patterns
- 🧪 AI Practice Lab

### Lab Sandbox
- ✍️ Writing Lab
- 📊 Analysis Lab
- 🎨 Creative Lab
- 💡 Strategy Lab
- 💻 Code Lab

### Prompt Library
- ⭐ Featured badge on featured prompts

### Completion Messages
- 🎉 Production Complete celebration

## Available Emojis

The OpenMoji component currently supports 40+ commonly used emojis including:
- Goals & Achievement: 🎯, 🏆, ⭐, 🌟
- Learning & Growth: 🧠, 💡, 📚, 🎓
- Tools & Labs: 🧪, 🔧, ⚙️, 💻
- Creative: 🎨, ✍️, 🎬, 🎸
- Progress: 🚀, ✨, 🔥, 💪
- Community: 🌈, 🌱, 🌸
- Celebration: 🎉, 🎪
- And more!

## Benefits

1. **Visual Consistency** - All emojis have the same design style across all platforms
2. **Brand Identity** - Professional, cohesive look that enhances the warm minimalism design
3. **Performance** - SVGs load from CDN, cached for optimal performance
4. **Accessibility** - Better than icon fonts, works with screen readers
5. **Personality** - Adds warmth and playfulness to the learning experience

## Future Enhancements

- Add more emojis as needed for new features
- Consider animated OpenMoji variants for celebrations
- Add color variants to match different themes
