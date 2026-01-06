# Responsive Design Patterns & Style Guide

## Breakpoints
- **Mobile First**: Default styles are for mobile (<640px).
- **Small Tablet (sm)**: 640px+ (e.g. `sm:flex-row`)
- **Tablet/Laptop (md)**: 768px+ (e.g. `md:grid-cols-2`)
- **Desktop (lg)**: 1024px+ (e.g. `lg:grid-cols-3`)

## Layout Patterns

### Containers
- **Page Container**: `max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12`
  - Tighter padding on mobile, more breathing room on desktop.
- **Card**: `bg-white rounded-2xl sm:rounded-3xl shadow-xl`
  - Slightly smaller border radius on mobile.

### Flex Layouts
- **Header/Actions**: `flex flex-col sm:flex-row gap-4`
  - Stacks vertically on mobile, horizontal on tablet+.
  - `items-stretch sm:items-center`: Full width items on mobile, centered on desktop.
- **Buttons Group**: `w-full sm:w-auto`
  - Full width buttons on mobile for better touch targets.

### Grids
- **Form Inputs**: `grid grid-cols-1 sm:grid-cols-2 gap-4`
  - Stack inputs on mobile, side-by-side on tablet+.
- **Card Grid**: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
  - 1 column mobile, 2 columns tablet, 3 columns desktop.

## Component Specifics

### Navigation/Tabs
- **Scrollable Tabs**: `overflow-x-auto no-scrollbar`
  - Allows tabs to scroll horizontally on small screens instead of wrapping awkwardly.
- **Pill Buttons**: `whitespace-nowrap`

### Interactive Elements
- **Hover States**: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`
  - **Crucial for Touch**: Always show actions (like Edit buttons) on mobile where hover doesn't exist. Hide them initially only on desktop.

### Typography
- **Headings**: `text-3xl sm:text-4xl md:text-6xl`
  - Scale typography dramatically between mobile and desktop to maintain hierarchy without overflowing.
