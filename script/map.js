
function testAnalyze() {
  const layers = drawnItems.getLayers();
  const nbLayer = layers.length;
  console.log(nbLayer);
  if (nbLayer === 1) {
    document.getElementsByClassName("status-indicator")[0].innerHTML = `<div class="status-indicator">
                <div class="pulse"></div>
                <span>READY FOR ANALYSIS</span>
                `;
}
  else {
    document.getElementsByClassName("status-indicator")[0].innerHTML = "<br/><br/><br/>"
  }
}



// Initialisation carte
const map = L.map('map').setView([45.76, 4.84], 13);

// Ajout couche tuiles OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// FeatureGroup qui contiendra les dessins
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialisation du drawControl mais on ne l'ajoute pas à la carte (car on gère avec boutons externes)
const drawControl = new L.Control.Draw({
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

// Gestion boutons

// Dessiner polygone
const drawPolygon = new L.Draw.Polygon(map);
document
  .getElementById('drawPolygonBtn')
  .addEventListener('click', () => drawPolygon.enable());

// Éditer les formes
let editing = false;
document.getElementById('editBtn').addEventListener('click', () => {
  if (!editing) {
    map.editTools = new L.EditToolbar.Edit(map, {
      featureGroup: drawnItems,
    });
    map.editTools.enable();
    editing = true;
    document.getElementById('editBtn').innerHTML = '<span class="icon">✎</span> Fin édition';
  } else {
    map.editTools.disable();
    editing = false;
    document.getElementById('editBtn').innerHTML = '<span class="icon">✎</span> Éditer';
  }
});

document.getElementById('deleteBtn').addEventListener('click', () => {
  const layers = drawnItems.getLayers();
  
const lastLayer = layers[layers.length - 1];
  
drawnItems.removeLayer(lastLayer);
  testAnalyze();
});
// Supprimer tous les dessins
document.getElementById('deleteAllBtn').addEventListener('click', () => {
  drawnItems.clearLayers();
  testAnalyze();
});

// Quand un dessin est créé, on l'ajoute au groupe
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);
  testAnalyze();
});

// Bouton Go : centre la carte sur les coords saisies
document.getElementById('goBtn').addEventListener('click', () => {
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  if (!isNaN(lat) && !isNaN(lng)) {
    map.setView([lat, lng], 13);
  } else {
    alert('Veuillez saisir des coordonnées valides');
  }
});

// Gestion dropzone upload GeoJSON
document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const geojson = JSON.parse(event.target.result);
      drawnItems.clearLayers();
      L.geoJSON(geojson).eachLayer((layer) => {
        drawnItems.addLayer(layer);
      });
      map.fitBounds(drawnItems.getBounds());
    } catch (err) {
      alert('Fichier GeoJSON invalide');
    }
  };
  reader.readAsText(file);
});

document.getElementById("askBtn").addEventListener("click", () => {
  const layers = drawnItems.getLayers();
  const nbLayer = layers.length;

  if (nbLayer !== 1) {
    alert(`Please select only one area. You have selected ${nbLayer} areas.`);
    return;
  }

  // Récupération du GeoJSON du layer sélectionné
  const jsonArea = layers[0].toGeoJSON();

  // Si tu veux l'afficher ou le traiter ensuite
  console.log("GeoJSON:", JSON.stringify(jsonArea));
});