

let drawControl; 
const map = L.map('map').setView([45.76, 4.84], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialisation du drawControl mais on ne l'ajoute pas à la carte (car on gère avec boutons externes)
drawControl = new L.Control.Draw({
  draw: {
    polyline: false,
    polygon: true,
    circle: false,
    marker: false,
    circlemarker: false,
    rectangle: false,
  },
  edit: {
    featureGroup: drawnItems,
    edit: false,
    remove: false,
  },
});

map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);
  testAnalyze();
});

// Variable globale à initialiser une fois

function initDrawControl(color = "#56aa00", transparency = "80") {
  if (drawControl) {
    map.removeControl(drawControl);
  }
  drawControl = new L.Control.Draw({
    draw: {
      polygon: {
        shapeOptions: {
          color: color + transparency,
          weight: 3,
          fillColor: "red",   // couleur remplissage
          fillOpacity: 0.5
        }
      },
      polyline: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false
    },
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);
}

function getDNRange(features) {
  let min = Infinity;
  let max = -Infinity;

  features.forEach(feature => {
    const dn = feature.properties.DN;
    if (typeof dn === 'number') {
      if (dn < min) min = dn;
      if (dn > max) max = dn;
    }
  });

  return { min, max };
}
function DNRender(dn, min, max) {
  const clamped = Math.min(Math.max(dn, min), max);
  return (clamped - min) / (max - min);
}


function drawZone(geojson) {
  color = "#56aa00"
  const features = geojson.features;
  if (!features) return;
  
  const dns = geojson.features.map(f => f.properties.DN);
  const min = Math.min(...dns);
  const max = Math.max(...dns);



  features.forEach(feature => {
    const dn = parseInt(feature.properties.DN, 10);
    // Conversion DN en transparence hexadécimale
    
    // Optionnel : modifier la couleur selon la valeur t
    // Ici on ne change que la transparence, on peut aussi changer la couleur
    const ratio = DNRender(dn, min, max);
    const lightness = 80 - ratio * 50; // entre 80% et 30%
    const color = `hsl(90, 77%, ${lightness}%,1)`;
    const coords = feature.geometry.coordinates;
    const latlngs = coords[0].map(coord => [coord[1], coord[0]]);
    const polygon = L.polygon(
      latlngs
      , {
      color: "00000000",      // bordure
      fillColor: color,  // remplissage
      fillOpacity: 0.85    // opacité
    }).addTo(map);
    

    
    drawnItems.addLayer(polygon);
  });

  if (drawnItems.getLayers().length > 0) {
    map.fitBounds(drawnItems.getBounds());
  }
}


document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    
    const geojson = JSON.parse(event.target.result);
    drawZone(geojson);
  
    map.fitBounds(drawnItems.getBounds());
    
  };
  reader.readAsText(file);
});
