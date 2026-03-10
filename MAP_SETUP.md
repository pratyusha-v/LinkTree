# Setup Instructions for Find a Book Map Feature

## Installation Required

The interactive map feature requires two new dependencies to be installed:

```bash
npm install leaflet react-leaflet
```

Or if you're using yarn:
```bash
yarn add leaflet react-leaflet
```

Or if you're using pnpm:
```bash
pnpm add leaflet react-leaflet
```

## What Was Added

### Dependencies
- **leaflet** (^1.9.4) - Open-source JavaScript library for interactive maps
- **react-leaflet** (^4.2.1) - React components for Leaflet maps

### Files Updated
1. **package.json** - Added new dependencies
2. **src/components/books/FindBook.jsx** - Added map with interactive markers
3. **src/styles/FindBook.css** - Added map and highlight styles

## Features

### Interactive Map
- Shows the searched area with a 10km (6 mile) radius
- Classic colored pin markers for libraries (blue) and bookstores (red)
- Click markers to see popup with location details
- Zoom and pan controls
- OpenStreetMap tile layer (no API key needed!)
- Console logging for debugging results

### Hover Interactions
- Hover over a map marker → corresponding location card highlights in blue
- Hover over a location card → keeps that card highlighted
- Smooth transitions and visual feedback

### Map Legend
- Top-right corner shows which pin color represents libraries vs bookstores
- Blue pins = Libraries
- Red pins = Bookstores
- Responsive design for mobile

## Usage

1. Install the dependencies (command above)
2. Run `npm run dev` to start the development server
3. Navigate to "Find a Book" in the sidebar
4. Enter a US zipcode and search
5. See the map with pinned locations
6. Hover over pins or cards to see the highlight interaction

## Technical Notes

- Uses free OpenStreetMap tiles (no API key required)
- Leaflet is lightweight (~39KB gzipped)
- Map is responsive and works on mobile
- Markers use custom Icons8 images for visual consistency
- Hover state synced between map and cards via React state

## Troubleshooting

If the map doesn't load:
1. Make sure you ran the install command
2. Check browser console for errors
3. Ensure you have internet connection (map tiles load from OSM servers)
4. Try clearing cache and rebuilding: `rm -rf node_modules package-lock.json && npm install`
