# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pure front-end travel assistant application for displaying a 4-day Ho Chi Minh City (Saigon) tour on an interactive map. The project is built with vanilla HTML, CSS, and JavaScript using the Leaflet.js mapping library.

## Development Commands

### Running the Application

**Method 1: Direct Browser Open**
```bash
# Simply open index.html in a browser
# No build step required
```

**Method 2: Python HTTP Server (Recommended)**
```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

**Method 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click index.html → "Open with Live Server"

### No Build Process

This project uses vanilla JavaScript with no build tools. Simply edit any file and refresh the browser to see changes.

## Architecture

### File Structure

```
index.html    # Main HTML structure
style.css     # All styles and responsive design
app.js        # Map initialization and interaction logic
data.js       # All tour data (hotels, attractions, itinerary, tips)
```

### Data Architecture

All tour data is centralized in `data.js` as the `tourData` object:

- `hotels`: Array of 3 hotel objects with lat/lng coordinates
- `attractions`: Array of 10 attraction objects with descriptions, hours, coordinates
- `itinerary`: Array of 4 daily itineraries with activities and attraction references
- `tips`: Array of travel tips with categories and icons
- `emergencyContacts`: Emergency phone numbers

### Key Functions in app.js

- `initMap()`: Initializes Leaflet map and adds all markers
- `addHotelMarkers()`: Creates hotel markers with custom icons
- `addAttractionMarkers()`: Creates attraction markers with day-based coloring
- `renderItinerary()`: Builds the sidebar day list
- `showDayRoute(day)`: Highlights and zooms to specific day's attractions
- `fitAllMarkers()`: Shows all locations on map
- `toggleDayRoute()`: Shows/hides route lines between attractions

### Design Patterns

1. **Color Coding by Day**: Each day has a distinct color (Day 1: red, Day 2: teal, Day 3: green)
2. **Numbered Markers**: Attractions show their order number in the daily itinerary
3. **Centralized Data**: All content in data.js for easy editing
4. **Responsive Layout**: Sidebar + map layout that stacks on mobile

## When Modifying This Code

### Adding New Attractions

1. Add to `tourData.attractions` in data.js with required fields:
   - id, name, lat, lng, day, order, openingHours
2. Add ID to appropriate day's `attractionIds` array in `tourData.itinerary`

### Changing Hotel Information

Edit `tourData.hotels` array in data.js. Markers auto-update from this data.

### Customizing Map Behavior

- Map center and zoom: Set in `initMap()` function
- Marker icons: Edit icon HTML in `addHotelMarkers()` and `addAttractionMarkers()`
- Popup content: Modify the template strings in marker binding

### Styling Changes

All styles are in style.css:
- `.sidebar`: Left panel width and styling
- `.panel`: Individual card components
- `.day-item`: Day list items
- `.btn`: Button styles
- `@media` queries: Responsive breakpoints at 1024px and 768px

## Dependencies

- **Leaflet.js 1.9.4**: Loaded via CDN in HTML
- **OpenStreetMap tiles**: Free map tiles, no API key needed
- **Google Fonts**: Noto Sans SC for Chinese character support

All dependencies are loaded from CDNs in index.html. No npm install required.

## Common Tasks

### Update Trip Dates/Details
Edit the `tourData.itinerary` array in data.js

### Add New Travel Tips
Add objects to `tourData.tips` array in data.js

### Change Map Theme
Replace the tile layer URL in `initMap()` with alternatives like:
- CartoDB: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- Satellite: Use other tile providers

### Export/Import Trip Data
Since all data is in data.js, you can:
- Export: Copy the entire `tourData` object
- Import: Replace the object in data.js

## Browser Compatibility

Test in Chrome/Edge (recommended), Firefox, or Safari. Requires internet connection for map tiles.

## Coordinate System

All coordinates use decimal degrees (WGS84):
- Ho Chi Minh City center: ~10.7740, 106.6900
- Format: [latitude, longitude]
