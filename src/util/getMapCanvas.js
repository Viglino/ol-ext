/** Get a canvas overlay for a map (non rotated, on top of the map)
 * @param {ol.Map} map
 * @return {canvas}
 */
var ol_ext_getMapCanvas = function(map) {
  if (!map) return null;
  var canvas = map.getViewport().getElementsByClassName('ol-fixedoverlay')[0];
  if (!canvas) {
    if (map.getViewport().querySelector('.ol-layers')) {
      // Add a fixed canvas layer on top of the map
      canvas = document.createElement('canvas');
      canvas.className = 'ol-fixedoverlay';
      map.getViewport().querySelector('.ol-layers').after(canvas);
      // Clear before new compose
      map.on('precompose', function (e){
        canvas.width = map.getSize()[0] * e.frameState.pixelRatio;
        canvas.height = map.getSize()[1] * e.frameState.pixelRatio;
      });
    } else {
      canvas = map.getViewport().querySelector('canvas');
    }
  }
  return canvas;
};

export default ol_ext_getMapCanvas
  