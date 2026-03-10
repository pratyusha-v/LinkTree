# Find a Book Feature

## Overview
The "Find a Book" feature allows users to search for nearby libraries and bookstores by entering their US zipcode.

## Location
- Available in the **sidebar navigation menu** under "Stats & Badges"
- Click "Find a Book" with the 📚 book icon
- Opens dedicated page at `/find-book`

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

### 3. Results Display
- Shows up to 5 libraries and 5 bookstores
- Includes:
  - Name and address
  - Phone number (if available)
  - Website link (if available)
  - Google Maps directions link

## Usage

1. Enter a valid 5-digit US zipcode (e.g., 90210)
2. Click the search button or press Enter
3. Wait for results to load
4. View libraries and bookstores in two columns
5. Click "Website" to visit their website
6. Click "Directions" to get Google Maps directions

## Technical Details

### APIs Used
- **Nominatim API** - https://nominatim.openstreetmap.org/
- **Overpass API** - https://overpass-api.de/api/interpreter

### Rate Limits
- Nominatim: 1 request/second (add delay if making multiple searches)
- Overpass: Reasonable use policy (avoid hammering the server)

### Notes
- Results depend on OpenStreetMap data quality
- Some locations may not have complete address/contact info
- Free APIs with no authentication required
- Works client-side, no backend needed

## Future Improvements

1. **Google Places API Integration**
   - More comprehensive and accurate results
   - Requires API key and billing
   - Would provide better bookstore data

2. **Radius Selection**
   - Let users choose search radius (5km, 10km, 20km)

3. **Favorites/Save Locations**
   - Save favorite libraries/bookstores to user profile

4. **Operating Hours**
   - Display opening hours if available

5. **Reviews/Ratings**
   - Show ratings from OpenStreetMap or Google

6. **Map View**
   - Display results on an interactive map

## Styling
Styles are in `/src/styles/FindBook.css`
- Mobile responsive
- Clean card-based layout
- Hover effects on location cards
- Blue accent colors matching app theme
