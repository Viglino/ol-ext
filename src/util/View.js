import ol_View from 'ol/View'

// Prevent overwrite
if (ol_View.prototype.flyTo)  {
  console.warn('[OL-EXT] View.flyTo redefinition')
};

/** FlyTo animation
 * @param {*} options
 *  @param {number} [duration=2000]
 *  @param {ol_coordinate} [center=] destination coordinate, default current center
 *  @param {number} [zoom=] destination zoom, current zoom
 *  @param {number} [zoomAt=] zoom to fly to, default min (current zoom & zoom) -2
 * @param {function} done callback function called at the end of an animation, called with true if the animation completed
 */
ol_View.prototype.flyTo = function(options, done) {
  options = options || {};
  // Start new anim
  this.cancelAnimations();
  var callback = (typeof(done) === 'function' ? done : function(){});
  // Fly to destination
  var duration = options.duration || 2000;
  var zoomAt = options.zoomAt || (Math.min(options.zoom||100, this.getZoom())-2);
  var zoomTo = options.zoom || this.getZoom();
  var coord = options.center || this.getCenter();
  // Move to
  this.animate ({
    center: coord,
    duration: duration
  });
  // Zoom to
  this.animate ({
    zoom: zoomAt,
    duration: duration/2
  },{
    zoom: zoomTo,
    duration: duration/2
  },
  callback);
}

/** Start a tour on the map
 * @param {Array<*>} destinations
 * @param {*} options
 *  @param {number} [delay=750] delay between destinations
 * @param {function} done callback function called at the end of an animation,called with true if the tour completed
 */
ol_View.prototype.takeTour = function(destinations, options, done) {
  options = options || {};
  if (typeof(options)==='function') {
    done = options;
    options = {}
  }
  var index = -1;
  function next(more) {
    if (more) {
      var dest = destinations[++index];
      if (dest) {
        var delay = index === 0 ? 0 : (options.delay || 750);
        setTimeout(function () {
          map.getView().flyTo(dest, next);
        }, delay);
      } else {
        if (typeof(done)==='function') done(true);
      }
    } else {
      if (typeof(done)==='function') done(false);
    }
  }
  next(true);
};