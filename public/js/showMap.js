console.log("✅ showMap.js loaded...");

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map");

  if (!mapContainer) {
    console.error("❌ #map container not found!");
    return;
  }

  let listing;
  try {
    listing = JSON.parse(mapContainer.dataset.listing);
  } catch (e) {
    console.error("❌ Failed to parse listing data:", e);
    return;
  }

  let user;
  try {
    user = JSON.parse(mapContainer.dataset.user);
  } catch (e) {
    console.error("❌ Failed to parse user data:", e);
    user = null;
  }

  if (!listing.lat || !listing.lng || !listing.apiKey) {
    console.error("❌ Missing lat/lng or API key");
    return;
  }

  // Default style: hybrid (satellite + labels)
  let currentStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${listing.apiKey}`;

  const map = new maplibregl.Map({
    container: "map",
    style: currentStyle,
    center: [listing.lng, listing.lat],
    zoom: 14,
  });

  map.addControl(new maplibregl.NavigationControl());

  // Listing marker (red)
  new maplibregl.Marker({ color: "red" })
    .setLngLat([listing.lng, listing.lat])
    .setPopup(new maplibregl.Popup().setHTML(`
      <strong>${listing.title}</strong><br>${listing.location}, ${listing.country}
    `))
    .addTo(map);

  // Toggle button
  const toggleButton = document.createElement("button");
  toggleButton.className = "map-toggle-button btn btn-outline-primary";
  toggleButton.textContent = "🛰️ Switch to Street View";
  toggleButton.dataset.mode = "hybrid";

  toggleButton.onclick = () => {
    if (toggleButton.dataset.mode === "hybrid") {
      map.setStyle(`https://api.maptiler.com/maps/streets/style.json?key=${listing.apiKey}`);
      toggleButton.textContent = "🌍 Switch to Satellite View";
      toggleButton.dataset.mode = "street";
    } else {
      map.setStyle(`https://api.maptiler.com/maps/hybrid/style.json?key=${listing.apiKey}`);
      toggleButton.textContent = "🛰️ Switch to Street View";
      toggleButton.dataset.mode = "hybrid";
    }
  };

  map.getContainer().appendChild(toggleButton);

  // User location and routing
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        let userName = "Your Location";
        if (user && user.username) {
          userName = user.username;
        }

        new maplibregl.Marker({ color: "blue" })
          .setLngLat([userLng, userLat])
          .setPopup(new maplibregl.Popup().setText(`📍 ${userName}`))
          .addTo(map);

        const routeURL = `https://api.maptiler.com/routing/routeline/geojson?key=${listing.apiKey}&profile=driving&coordinates=${userLng},${userLat}|${listing.lng},${listing.lat}`;

        fetch(routeURL)
          .then(res => {
            if (!res.ok) throw new Error("Route fetch failed");
            return res.json();
          })
          .then(data => {
            if (map.getSource("route")) {
              map.getSource("route").setData(data);
            } else {
              map.addSource("route", {
                type: "geojson",
                data,
              });
              map.addLayer({
                id: "route",
                type: "line",
                source: "route",
                paint: {
                  "line-color": "#3b82f6",
                  "line-width": 4,
                },
              });
            }
          })
          .catch(err => console.error("Routing error:", err));
      },
      (err) => {
        console.warn("Geolocation error:", err);
      }
    );
  }
});

