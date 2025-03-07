let mapMaker;
let map;
// Garante inicialização do mapa
document.addEventListener('DOMContentLoaded', () => {
mapboxgl.accessToken = 'pk.eyJ1IjoianByZXNtZXIiLCJhIjoiY202dXdpYmMwMDF6ajJpcHpzbWNhb2VkZSJ9.kaUyoNZm2txJmRzsOYADdw';
map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-122.4194, 37.7749], // San Francisco coordinates
    zoom: 10 // Zoom level
});
// Desenha o marcador no mapa
mapMarker = new mapboxgl.Marker()
    .setLngLat([-122.4194, 37.7749]) // Coordinates
    .addTo(map);
});

function updateMap (newCoordinates) {
    // Update the marker's position
    mapMarker.setLngLat(newCoordinates);

    // Optionally, move the map view to the new location
    map.flyTo({
        center: newCoordinates,
        zoom: 10,
        essential: true // Ensures smooth animation
    });
}