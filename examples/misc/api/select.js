/** Add a select layer to the API */

// Add features to select
var vector = new ol.layer.Vector({
  name: 'Departements',
  source: new ol.source.Vector({
    url: '../data/departements.geojson',
    format: new ol.format.GeoJSON(),
    attributions: [ "&copy; <a href='https://www.insee.fr'>INSEE</a>", "&copy; <a href='https://www.data.gouv.fr/fr/datasets/geofla-r/'>IGN</a>" ],
  })
});
map.addLayer(vector);

// Selection interaction
var select = new ol.interaction.Select();
map.addInteraction(select);
select.setActive(false);

// Get selection as JSON object
function getSelectionAsJSON() {
  var selected = [];
  select.getFeatures().getArray().forEach(function(f) {
    var p = api.get('format').writeFeatureObject(f, { featureProjection: map.getView().getProjection() });
    selected.push(p);
  })
  return selected;
};

// Add selection 
api.setAPI({
  // Activate/deactivate select interaction
  activateSelection: function(b) {
    select.setActive(b);
  },
  // Select a feture by
  selectBy: function(atts) {
    select.getFeatures().clear();
    var ext = ol.extent.createEmpty();
    vector.getSource().getFeatures().forEach(function(f) {
      for (var i in atts) {
        if (f.get(i) == atts[i]) {
          select.getFeatures().push(f);
          ol.extent.extend(ext, f.getGeometry().getExtent());
          break;
        }
      }
    })
    if (select.getFeatures().getLength()) {
      map.getView().fit(ext);
    }
    api.postMessage('select', {
      selected: getSelectionAsJSON(),
      deselected: []
    });
  }
});

// Do something on select
api.addListener('select', function() {
  // Select an object > post as GeoJSON
  select.on('select', function(e) {
    var selected = getSelectionAsJSON();
    var deselected = [];
    e.deselected.forEach(function(f) {
      deselected.push(f.get('id'));
    });
    api.postMessage('select', {
      selected: selected,
      deselected: deselected
    });
  });
});
