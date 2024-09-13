// Initialize the socket io
const socket = io();

// Check if the browser supports geolocation
if (navigator.geolocation) {
  // Use watchPosition to track the users location continuously
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      // Emit the latitude and longitude via a socket with 'send-location'
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.log(error);
    },
    // Set options for high accuracy, a 5-second timeout, and no caching
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

// Initialize a map centered at coordinates(0,0) with a zoom level of 15 using leaflet. Add OpenStreetMap tiles to the map
const map = L.map("map").setView([0, 0], 10);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Bigyan Sapkota",
}).addTo(map);

// Create an empty object markers
const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
