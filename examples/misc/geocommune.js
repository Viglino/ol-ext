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
  carte.param.lon = (extent[0] + extent[2]) / 2;
  carte.param.lat = (extent[1] + extent[3]) / 2;
  for (let i=0; i<carte.layers.length; i++) {
    l = carte.layers[i];
  // carte.layers.forEach(l => {
    if (l.title === 'Commune') {
      // Change communes attributes
      const geojson = new ol.format.GeoJSON().writeFeatureObject(commune, {
        featureProjection: 'EPSG:4326',
        dataProjection: map.getView().getProjection()
      });
      l.features[0].attributes = geojson.properties;
      l.features[0].type = geojson.geometry.type;
      l.features[0].coords = geojson.geometry.coordinates;
      if (geojson.geometry.type === 'Polygon') {
        l.crop.coordinates[0] = geojson.geometry.coordinates;
      } else {
        l.crop.coordinates = geojson.geometry.coordinates;
      }
    }
    if (l.url) {
      l.url = l.url.split('?');
      const search = l.url.pop().split('&');
      search.forEach((s,i) => {
        if (/BBOX/.test(s)) {
          let filter = s.split(',');
          const index = filter.findIndex(f => /BBOX/.test(f));
          if (index>=0) {
            filter[index+1] = extent[0];
            filter[index+2] = extent[1];
            filter[index+3] = extent[2];
            filter[index+4] = extent[3];
            // filter[index+5] = 'EPSG%3A4326';
            search[i] = filter.join(',');
          }
        }
      });
      l.url.push(search.join('&'));
      l.url = l.url.join('?');
      // Get points layer
      const player = carte.layers.find(l2 => l.title === l2.title && l2 !== l);
      if (player) {
        await fetch(l.url).then(r => r.json()).then(json => {
          const features = (new ol.format.GeoJSON()).readFeatures(json, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection()
          });
          features.forEach(f => {
            if (f.getGeometry().getType() === 'Polygon') {
              f.setGeometry(f.getGeometry().getInteriorPoint());
            } else if (f.getGeometry().getType() === 'MultiPolygon') {
              f.setGeometry(f.getGeometry().getPolygons()[0].getInteriorPoint());
            }
          });
          const pts = (new ol.format.GeoJSON()).writeFeaturesObject(features);
          player.features = [];
          pts.features.forEach(f => {
            player.features.push({
              attributes: f.properties,
              type: f.geometry.type,
              coords: f.geometry.coordinates
            });
          });
          console.log(json, player, features);

        });
      }
    }
  }
  saveAs(new Blob([JSON.stringify(carte, null, ' ')], {type: "application/json"}), `commune-${insee}.carte`);
}
dlog.show();

