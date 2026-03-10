# Find a Book Feature

## Overview
The "Find a Book" feature allows users to search for nearby libraries and bookstores by entering their US zipcode. Results are displayed both on an interactive map and in a categorized list with synchronized hover interactions.

## Location
- Available in the **sidebar navigation menu** under "Stats & Badges"
- Click "Find a Book" with the 📚 book icon
- Opens dedicated page at `/find-book`

## Setup Required

**Important:** You need to install map dependencies first:
```bash
npm install leaflet react-leaflet
```
See [MAP_SETUP.md](MAP_SETUP.md) for detailed setup instructions.

## How It Works

### 1. Geocoding
- Uses **Nominatim** (OpenStreetMap) to convert US zipcodes to latitude/longitude
- Free API, no API key required
- Rate limited: ~1 request/second

### 2. Location Search
- Uses **Overpass API** (OpenStreetMap) to find nearby places
- Searches within 5km radius (approximately 3 miles)
- Finds:
  - Libraries (amenity=library)
  - Bookstores (shop=books)

### 3. Interactive Map Display
- Uses **Leaflet** (free, open-source mapping library)
- Shows search area with custom markers:
  - 📍 Purple pin for libraries
  - 🏪 Orange shop for bookstores
- Click markers for popup details
- Map legend shows icon meanings
- Zoom and pan controls

### 4. Results Display
- Shows up to 5 libraries and 5 bookstores
- Includes:
  - Name and address
  - Phone number (if available)
  - Website link (if available)
  - Google Maps directions link

### 5. Hover Interactions
- Hover over map marker → corresponding card highlights in blue
- Hover over location card → card stays highlighted
- Smooth animations and transitions

## Usage

1. Click "Find a Book" in the sidebar navigation
2. Enter a valid 5-digit US zipcode (e.g., 90210, 10001)
3. Click the search button or press Enter
4. Wait for results to load
5. **View the interactive map** showing all locations with custom markers
6. **Hover over map markers** to highlight the corresponding location card
7. **Hover over location cards** to highlight them in the list
8. Click map markers for popup details
9. Click "Website" to visit their website
10. Click "Directions" to get Google Maps directions

## Technical Details

### APIs Used
- **Nominatim API** - https://nominatim.openstreetmap.org/
  - Geocoding zipcodes to coordinates
- **Overpass API** - https://overpass-api.de/api/interpreter
  - Searching for libraries and bookstores
- **Leaflet** - https://leafletjs.com/
  - Interactive map rendering (no API key needed)
- **OpenStreetMap Tiles** - https://www.openstreetmap.org/
  - Free map tile layer

### Dependencies
- `leaflet` (^1.9.4) - Core mapping library
- `react-leaflet` (^4.2.1) - React components for Leaflet

### Rate Limits
- Nominatim: 1 request/second (add delay if making multiple searches)
- Overpass: Reasonable use policy (avoid hammering the server)
- OSM Tiles: Standard usage limits apply

### Notes
- Results depend on OpenStreetMap data quality
- Some locations may not have complete address/contact info
- Free APIs with no authentication required
- Works client-side, no backend needed
- Map markers use custom Icons8 images
- Hover state managed via React state (hoveredLocation)

## Future Improvements

1. **Google Places API Integration**
   - More comprehensive and accurate results
   - Requires API key and billing
   - Would provide better bookstore data

2. **Radius Selection**
   - Let users choose search radius (5km, 10km, 20km)
   - Adjust map zoom accordingly

3. **Favorites/Save Locations**
   - Save favorite libraries/bookstores to user profile
   - Quick access to saved locations

4. **Operating Hours**
   - Display opening hours if available
   - Show "Open Now" status

5. **Reviews/Ratings**
   - Show ratings from OpenStreetMap or Google
   - User-generated reviews

6. **Clustering**
   - Group nearby markers when zoomed out
   - Improve map performance with many results

7. **Route Planning**
   - Show driving/walking directions on the map
   - Multi-stop route optimization

8. **Custom Map Styles**
   - Different map themes (dark mode, satellite view)
   - Custom color schemes

9. **Click-to-Navigate**
   - Click markers to center map on that location
   - Auto-scroll to corresponding card

## Styling
Styles are in `/src/styles/FindBook.css`
- Mobile responsive (map adjusts to screen size)
- Clean card-based layout
- Hover effects on location cards with `.highlighted` class
- Blue accent colors matching app theme
- Map legend with custom marker icons
- Smooth transitions for all interactions
- Map container at 400px height
- Cards highlight in light blue (#eff6ff) when hovered or when marker is hovered
