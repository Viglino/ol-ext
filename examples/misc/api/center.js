// Add api setter and getter
api.setAPI({
  setCenter: function(data) {
    map.getView().setCenter(ol.proj.fromLonLat(data));
  },
  getCenter: function() {
    return ol.proj.toLonLat(map.getView().getCenter());
  },
  setZoom: function(data) {
    map.getView().setZoom(data);
  },
  getZoom: function() {
    return map.getView().getZoom()
  }
});

// Register move
api.addListener('move', function() {
  // Post message on moveend
  map.on('moveend', function(e) {
    api.postMessage('move', { 
      center: ol.proj.toLonLat(map.getView().getCenter()),
      zoom: map.getView().getZoom()
    })
  });
});
