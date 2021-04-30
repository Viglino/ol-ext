/** Placemark API
 * Link placemark position to inputs to get its lonlat
 * Implements a mapInput api method in the parent window.
 */

 /* Create placemark overlay an drag interaction */
var placemark = new ol.Overlay.Placemark ({
  stopEvent: false
});
var drag = new ol.interaction.DragOverlay({
  overlays: placemark
});
// Init at first call
function getPosition() {
  var pos = placemark.getPosition();
  // Initialize
  if (!pos) {
    map.addOverlay(placemark);
    map.addInteraction(drag);
    pos = map.getView().getCenter();
    placemark.show(pos);
  }
  return pos;
}

/** Get placemark longitude */
api.addListener('getLon', function(val) {
  if (val) val = ol.proj.fromLonLat([val,0])
  else val = map.getView().getCenter();
  var pos = getPosition();
  placemark.show([val[0], pos[1]]);
  var p = ol.proj.toLonLat(placemark.getPosition())
  api.postMessage('getLon', p[0]);
  drag.on('dragend', function(e){
    var p = ol.proj.toLonLat(placemark.getPosition())
    api.postMessage('getLon', p[0]);
  });
});

/** Get placemark latitude */
api.addListener('getLat', function(val) {
  if (val) val = fromLonLat([0,val])
  else val = map.getView().getCenter();
  var pos = getPosition();
  placemark.show([pos[0], val[1]]);
  var p = ol.proj.toLonLat(placemark.getPosition())
  api.postMessage('getLat', p[1]);
  drag.on('dragend', function(e){
    var p = ol.proj.toLonLat(placemark.getPosition())
    api.postMessage('getLat', p[1]);
  });
});

/* Set placemark lon, lat */
api.setAPI({
  getLon: function(lon) {
    if (lon===undefined) {
      var pos = ol.proj.toLonLat(placemark.getPosition());
      return pos[0];
    } else {
      var pos = placemark.getPosition();
      var p = ol.proj.fromLonLat([lon, 0]);
      placemark.show([p[0],pos[1]]);
    }
  },
  getLat: function(lat) {
    if (lat===undefined) {
      var pos = ol.proj.toLonLat(placemark.getPosition());
      return pos[1];
    } else {
      var pos = placemark.getPosition();
      var p = ol.proj.fromLonLat([0, lat]);
      placemark.show([pos[0], p[1]]);
    }
  },
  setLonLat: function(lonlat) {
    var p = ol.proj.fromLonLat(lonlat);
    placemark.show(p);
    api.postMessage('getLon', lonlat[0]);
    api.postMessage('getLat', lonlat[1]);
  }
});
