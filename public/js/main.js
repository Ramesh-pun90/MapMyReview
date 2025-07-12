import MapManager from './showMap.js';

const apiKey = 'YOUR_MAPTILER_API_KEY';
const center = [85.3240, 27.7172]; // Kathmandu coordinates
const zoom = 10;

const mapManager = new MapManager('map', center, zoom, apiKey);
mapManager.initMap();

// Toggle button event listener
document.getElementById('styleToggle').addEventListener('click', () => {
  mapManager.toggleStyle();
});

// Example: add a marker somewhere on map
mapManager.addMarker([85.3240, 27.7172], '<h3>Kathmandu</h3><p>Capital city of Nepal</p>');
