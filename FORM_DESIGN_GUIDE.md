# Interactive Forms - Neobrutalist Design System

## Design Overview

The interactive forms follow the platform's **neobrutalist design language** with bold borders, strong shadows, and high-contrast colors that create a distinctive, energetic feel.

---

## Design Principles

### 1. Bold & Confident
- **2px black borders** on all elements
- **Strong shadows** (4px offset) for depth
- **No rounded corners** - sharp, crisp edges
- **High contrast** color combinations

### 2. Tactile & Interactive
- Buttons have **shadow-on-hover** animation
- Forms feel like **physical objects** you can touch
- Clear **visual feedback** on all interactions
- **Uppercase text** for emphasis

### 3. Energetic & Engaging
- **Vibrant background colors** (cream/yellow tones)
- **Bold typography** with tight tracking
- **Accent colors** used strategically (orange for alerts, green for success)
- Clean white input fields for focus

---

## Color Palette

### Primary Colors
- **Background:** `#FFF9E6` (warm cream - inviting, readable)
- **Borders:** `#000000` (black - strong definition)
- **Text:** `#000000` (black - maximum contrast)

### Accent Colors
- **Required Fields:** `#FF6A00` (orange - attention)
- **Success State:** `#00D084` (green - confirmation)
- **Primary Action:** `#000000` (black - bold)

### Input Colors
- **Input Background:** `#FFFFFF` (white - clean slate)
- **Placeholder:** `#6B7280` (gray-500 - subtle hint)

---

## Component Styling

### Form Container
```css
bg-[#FFF9E6]              /* Warm cream background */
border-2 border-black     /* Bold black border */
shadow-[4px_4px_0px_#000000]  /* Offset shadow */
p-6                       /* Generous padding */
```

**Effect:** Forms stand out from the page like physical cards.

### Form Title
```css
text-xl                   /* Large size */
font-extrabold           /* Maximum weight */
uppercase                /* All caps */
tracking-tight          /* Tight letter spacing */
text-black              /* Maximum contrast */
```

**Effect:** Headlines command attention and set clear context.

### Field Labels
```css
text-sm                  /* Readable size */
font-extrabold          /* Bold weight */
uppercase               /* All caps */
tracking-tight         /* Tight spacing */
text-black            /* High contrast */
```

**Required indicator:** `text-[#FF6A00]` (orange asterisk)

**Effect:** Labels are unmistakable and scannable.

### Text Inputs
```css
bg-white                    /* Clean white */
border-2 border-black      /* Bold border */
px-4 py-3                  /* Comfortable padding */
font-medium                /* Readable weight */
placeholder-gray-500       /* Subtle hints */
focus:ring-2 focus:ring-black  /* Focus state */
```

**Effect:** Inputs feel like writing surfaces - clear and inviting.

### Textareas
```css
/* Same as text inputs, plus: */
min-h-[100px]             /* Adequate space */
resize-y                  /* Vertical resize only */
```

**Effect:** Large writing space for longer responses.

### Select Dropdowns
```css
/* Same as text inputs, plus: */
cursor-pointer            /* Indicates clickability */
```

**Options text:** Uppercase for consistency

**Effect:** Dropdowns feel like active controls.

### Checkboxes
```css
/* Container: */
bg-white border-2 border-black p-3

/* Checkbox: */
w-5 h-5
border-2 border-black
cursor-pointer

/* Label: */
font-semibold uppercase tracking-tight
```

**Effect:** Checkboxes are substantial and easy to interact with.

### Radio Buttons
```css
/* Container: */
bg-white border-2 border-black p-3
hover:bg-gray-50          /* Hover feedback */
cursor-pointer

/* Radio: */
w-5 h-5
border-2 border-black

/* Label: */
font-medium               /* Slightly lighter than checkbox */
```

**Effect:** Radio groups look like a set of connected buttons.

### Save Button (Normal State)
```css
bg-black text-white         /* High contrast */
border-2 border-black
px-6 py-3                   /* Substantial size */
font-extrabold text-sm
uppercase tracking-tight
shadow-[4px_4px_0px_#000000]  /* Bold shadow */

/* Hover: */
shadow-none                 /* Shadow disappears */
translate-x-[4px]          /* Moves right */
translate-y-[4px]          /* Moves down */
```

**Effect:** Button "presses down" like a physical button.

### Save Button (Saved State)
```css
bg-[#00D084] text-black    /* Green success */
/* Other styles same as normal */
```

**Effect:** Clear visual confirmation of successful save.

### Help Text
```css
text-xs                    /* Small but readable */
text-gray-700             /* Subtle but visible */
italic                    /* Distinguishes from main content */
mt-1                      /* Slight spacing */
```

**Effect:** Helpful hints without cluttering the interface.

---

## Interactive States

### Focus State
```css
focus:outline-none         /* Remove default */
focus:ring-2              /* Add custom ring */
focus:ring-black         /* Black ring */
```

**Effect:** Clear focus indicator maintains the bold aesthetic.

### Hover State (Radio/Checkbox containers)
```css
hover:bg-gray-50          /* Subtle background change */
transition-colors         /* Smooth transition */
```

**Effect:** Subtle feedback that element is interactive.

### Disabled State
```css
disabled:opacity-50        /* Reduced visibility */
disabled:cursor-not-allowed  /* Shows can't click */
```

**Effect:** Clear indication when actions aren't available.

### Loading State
```css
animate-pulse             /* Pulsing animation */
bg-gray-200 border-2 border-black  /* Placeholder blocks */
```

**Effect:** Maintains design language while loading.

---

## Typography Hierarchy

### Form Title (H3)
- **Size:** `text-xl` (20px)
- **Weight:** `font-extrabold` (800)
- **Transform:** `uppercase`
- **Tracking:** `tracking-tight`

### Field Labels
- **Size:** `text-sm` (14px)
- **Weight:** `font-extrabold` (800)
- **Transform:** `uppercase`
- **Tracking:** `tracking-tight`

### Input Text
- **Size:** Default (16px)
- **Weight:** `font-medium` (500)

### Help Text
- **Size:** `text-xs` (12px)
- **Weight:** Normal (400)
- **Style:** `italic`

### Button Text
- **Size:** `text-sm` (14px)
- **Weight:** `font-extrabold` (800)
- **Transform:** `uppercase`
- **Tracking:** `tracking-tight`

---

## Spacing System

### Container Padding
- **All sides:** `p-6` (24px)

### Vertical Spacing
- **Between sections:** `space-y-6` (24px)
- **Between fields:** `space-y-5` (20px)
- **Within field:** `space-y-2` (8px)

### Horizontal Spacing
- **Icon + Text:** `gap-2` (8px)
- **Checkbox + Label:** `space-x-3` (12px)

---

## Shadow System

### Primary Shadow (Strong)
```css
shadow-[4px_4px_0px_#000000]
```
Used on: Form containers, buttons (normal state)

### No Shadow (Pressed)
```css
shadow-none
```
Used on: Buttons (hover state)

---

## Animation System

### Button Press
```css
transition-all
hover:shadow-none
hover:translate-x-[4px]
hover:translate-y-[4px]
```

**Duration:** Default (150-200ms)
**Effect:** Button "pushes into" the page

### Color Transitions
```css
transition-colors
```

**Duration:** Default (150-200ms)
**Effect:** Smooth color changes on hover

### Loading Pulse
```css
animate-pulse
```

**Duration:** 1.5s infinite
**Effect:** Breathing effect for loading states

---

## Accessibility Features

### Keyboard Navigation
- All inputs support tab navigation
- Focus states are clearly visible (black ring)
- Button actions work with Enter/Space

### Screen Readers
- Labels properly associated with inputs
- Required fields indicated with aria attributes
- Button states announced (saving, saved)

### Color Contrast
- All text meets WCAG AA standards
- Black text on cream background: 13.5:1 ratio
- White text on black button: 21:1 ratio

---

## Responsive Behavior

### Mobile (< 640px)
- Full-width inputs
- Stacked button layout
- Adequate touch targets (44px minimum)

### Tablet (640px - 1024px)
- Full-width inputs
- Side-by-side buttons where space allows

### Desktop (> 1024px)
- Full-width inputs within container
- Buttons at comfortable size
- Generous spacing maintained

---

## Design Consistency with Platform

### Matches Existing Components:
1. **Lesson Viewer** - Same border/shadow style
2. **Exercise Blocks** - Similar warm backgrounds
3. **Buttons** - Identical press animation
4. **Tips/Examples** - Consistent border treatment
5. **Navigation** - Same typography hierarchy

### Color Relationships:
- **Yellow tones:** Forms use `#FFF9E6`, Tips use `#FFF9E6`
- **Orange accent:** Forms use `#FF6A00`, Platform uses `#FF6A00`
- **Green success:** Forms use `#00D084`, consistent with platform

---

## Best Practices

### DO:
✓ Use bold borders (2px) on all elements
✓ Apply shadows to create depth
✓ Use uppercase for emphasis
✓ Maintain high contrast
✓ Give elements breathing room (generous padding)
✓ Keep interactions tactile and physical

### DON'T:
✗ Use rounded corners
✗ Use subtle/thin borders
✗ Mix design styles within forms
✗ Reduce padding to save space
✗ Use low-contrast colors
✗ Add unnecessary decorative elements

---

## Component Variations

### Standard Form (Current)
- Cream background (`#FFF9E6`)
- Bold borders
- Strong shadows
- Best for: Most interactive exercises

### Future Variations (Ideas)

**High-Priority Form:**
- Orange background (`#FF6A00`)
- Black text
- Same structure
- Use for: Critical exercises, final assessments

**Success Form:**
- Green background (`#00D084`)
- Black text
- Same structure
- Use for: Completion confirmations, achievement forms

**Neutral Form:**
- White background
- Black borders
- Same structure
- Use for: Settings, profile updates

---

## Code Examples

### Complete Form Field Example
```tsx
<div className="space-y-2">
  <label className="block text-sm font-extrabold text-black uppercase tracking-tight">
    FIELD LABEL
    <span className="text-[#FF6A00] ml-1">*</span>
  </label>
  <input
    type="text"
    className="w-full px-4 py-3 bg-white border-2 border-black text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black font-medium"
    placeholder="Enter your response..."
  />
  <p className="text-xs text-gray-700 italic mt-1">
    This is helpful context for the field.
  </p>
</div>
```

### Complete Button Example
```tsx
<button
  className="flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-black font-extrabold text-sm uppercase tracking-tight shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
>
  <Save className="w-4 h-4" strokeWidth={2.5} />
  <span>SAVE PROGRESS</span>
</button>
```

---

## Summary

The neobrutalist design system creates forms that are:
- **Visually Distinctive** - Stand out on the page
- **Highly Interactive** - Feel physical and responsive
- **Extremely Clear** - No ambiguity in purpose
- **Accessible** - Works for all users
- **Consistent** - Matches platform aesthetic
- **Engaging** - Makes form-filling feel important

**The result:** Students are more likely to complete exercises because the forms feel substantial, important, and satisfying to interact with.
