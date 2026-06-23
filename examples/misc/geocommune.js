// The map
var map = new ol.Map ({
  target: 'map',
  view: new ol.View ({
    zoom: 15,
    center: [261204.43490751847, 6250258.191535994]
  })
});
var plink = new ol.control.Permalink({ visible: false })
map.addControl(plink);

map.addLayer(new ol.layer.Geoportail({
  layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
  visible: true
}));
map.addLayer (new ol.layer.Geoportail({
  layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 
  visible: false
}));

const dlog = new ol.control.Dialog({
  title: 'Commune',
  content: document.querySelector('#commune'),
  buttons: ['charger'],
  onButton: function (btn) {
    const inputs = dlog.getInputs();
    const insee = inputs.insee.value;
    getCommune(insee);
  }
});
map.addControl(dlog);

async function getCommune(insee) {
  let commune = await fetch(`https://geo.api.gouv.fr/communes?code=${insee}&fields=nom,code,contour&format=geojson&geometry=contour`);
  if (!commune.ok) {
    console.error('Erreur lors de la récupération des données de la commune');
    return;
  }
  commune = await commune.json();
  if (commune.features?.length === 0) {
    console.error('Aucune commune trouvée pour le code INSEE fourni');
    return;
  }
  commune = (new ol.format.GeoJSON()).readFeatures(commune)[0];
  const extent = commune.getGeometry().getExtent();
  const reponse = await fetch('commune.carte');
  const carte = await reponse.json();
  carte.layers.forEach(l => {
    if (l.title === 'Commune') {
      const geojson = new ol.format.GeoJSON().writeFeatureObject(commune, {
        featureProjection: 'EPSG:4326',
        dataProjection: map.getView().getProjection()
      });
      l.features[0].attributes = geojson.properties;
      l.features[0].type = geojson.geometry.type;
      l.features[0].coords = geojson.geometry.coordinates;
      l.crop.coordinates[0] = geojson.geometry.coordinates;
      console.log('COMMUNE', l, geojson);
    }
    if (l.url) {
      const filter = l.url.split('%2C');
      const index = filter.findIndex(f => /BBOX/.test(f));
      console.log('BBOX', l.title, index);
      if (index>=0) {
        filter[index+1] = extent[0];
        filter[index+2] = extent[1];
        filter[index+3] = extent[2];
        filter[index+4] = extent[3];
        // filter[index+5] = 'EPSG%3A4326';
        l.url = filter.join('%2C');
      }
    }
  })
  console.log(carte);
  saveAs(new Blob([JSON.stringify(carte, null, 2)], {type: "application/json"}), `commune-${insee}.carte`);
}
dlog.show();

