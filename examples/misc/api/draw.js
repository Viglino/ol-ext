/** Add a draw API */
// Polygon layer
var polygon = new ol.layer.Vector({
  name: 'Polygon',
  source: new ol.source.Vector({})
});
map.addLayer(polygon);

// Modify interaction
var modify = new ol.interaction.Modify({
  source: polygon.getSource()
});
map.addInteraction(modify);

// DrawPolygon interaction
var draw = new ol.interaction.Draw({
  type: 'Polygon',
  stopClick: true
});
draw.setActive(false);
map.addInteraction(draw);
draw.on('change:active', function() {
  modify.setActive(!draw.getActive());
});

// Get polygon as JSON object
function getJSONPoly(feature) {
  feature.set('length', ol.sphere.getLength(feature.getGeometry()))
  feature.set('area', ol.sphere.getArea(feature.getGeometry()))
  return api.get('format').writeFeatureObject(feature, { featureProjection: map.getView().getProjection() });
}

// Add api setter and getter
api.setAPI({
  // Activate draw
  drawPolygon: function() {
    if (draw.getActive()) {
      draw.setActive(false);
    } else {
      select.getFeatures().clear();
      draw.setActive(true);
    }
  },
  // Get the polygon
  getPolygon: function() {
    var f = polygon.getSource().getFeatures()[0];
    if (f) return getJSONPoly(f);
    else return null;
  },
  // Set the polygon
  setPolygon: function(p) {
    polygon.getSource().clear();
    try {
      var f = api.get('format').readFeature(p, { featureProjection: map.getView().getProjection() });
      polygon.getSource().addFeature(f);
      map.getView().fit(f.getGeometry().getExtent());
    } catch(e) {}
  }
});

// Do something when drawn
api.addListener('drawPolygon', function() {
  // Draw a polygon
  draw.on('drawend', function (e) {
    polygon.getSource().clear();
    polygon.getSource().addFeature(e.feature);
    setTimeout(function() {
      draw.setActive(false);
      api.postMessage('drawPolygon', getJSONPoly(e.feature));
    })
  });
  // Modify a polygon
  modify.on('modifyend', function(e){
    api.postMessage('drawPolygon', getJSONPoly(e.features.item(0)));
  });
});