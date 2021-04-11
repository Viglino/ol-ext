import ol_View from 'ol/View'

// Prevent overwrite
if (ol_View.prototype.flyTo)  {
  console.warn('[OL-EXT] ol/View~View.flyTo redefinition')
}

/** Destination
 * @typedef {Object} ol.viewTourDestinations
 *  @param {number} [duration=2000] animation duration
 *  @param {string} [type=flyto] animation type (flyTo, moveTo), default flyTo
 *  @param {ol_coordinate} [center=] destination coordinate, default current center
 *  @param {number} [zoom=] destination zoom, default current zoom
 *  @param {number} [zoomAt=] zoom to fly to, default min (current zoom, zoom) -2
 */

/** FlyTo animation
 * @param {ol.viewTourDestinations} options
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
};

/** Start a tour on the map
 * @param {Array<ol.viewTourDestinations>|Array<Array>} destinations an array of destinations or an array of [x,y,zoom,type]
 * @param {function} done callback function called at the end of an animation, called with true if the tour completed
 * @param {function} step callback function called when a destination is reached with the step index as param
 */
ol_View.prototype.takeTour = function(destinations, options, done, step) {
  options = options || {};
  if (typeof(options)==='function') {
    done = options;
    options = {}
  }
  var index = -1;
  var next = function(more) {
    if (more) {
      var dest = destinations[++index];
      if (typeof(step) === 'function') step(index, destinations);
      if (dest) {
        if (dest instanceof Array) dest = { center: [dest[0],dest[1]], zoom: dest[2], type: dest[3] };
        var delay = index === 0 ? 0 : (options.delay || 750);
        setTimeout(function () {
          switch(dest.type) {
            case 'moveTo': {
              this.animate(dest, next);
              break;
            }
            case 'flightTo': 
            default: {
              this.flyTo(dest, next);
              break;
            }
          }
        }.bind(this), delay);
      } else {
        if (typeof(done)==='function') done(true);
      }
    } else {
      if (typeof(done)==='function') done(false);
    }
  }.bind(this)
  next(true);
};

export default ol_View
