import ol_View from 'ol/View.js'

// Prevent overwrite
if (ol_View.prototype.flyTo)  {
  console.warn('[OL-EXT] ol/View~View.flyTo redefinition')
}

/** Destination
 * @typedef {Object} viewTourDestinations
 *  @property {string} [type=flyto] animation type (flyTo, moveTo), default flyTo
 *  @property {number} [duration=2000] animation duration
 *  @property {ol_coordinate} [center=] destination coordinate, default current center
 *  @property {number} [zoom] destination zoom, default current zoom
 *  @property {number} [zoomAt=-2] zoom to fly to, default min (current zoom, zoom) -2
 *  @property {function} [easing] easing function used during the animation, defaults ol/easing~inAndOut
 *  @property {number} [rotation] The rotation of the view at the end of the animation
 *  @property {anchor} [anchor] Optional anchor to remain fixed during a rotation or resolution animation.
 */

/** FlyTo animation
 * @param {viewTourDestinations} options
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
    duration: duration,
    easing: options.easing,
    anchor: options.anchor,
    rotation: options.rotation
  });
  // Zoom to
  this.animate ({
    zoom: zoomAt,
    duration: duration/2,
    easing: options.easing,
    anchor: options.anchor
  },{
    zoom: zoomTo,
    duration: duration/2,
    easing: options.easing,
    anchor: options.anchor
  },
  callback);
};

/** Start a tour on the map
 * @param {Array<viewTourDestinations>|Array<Array>} destinations an array of destinations or an array of [x,y,zoom,destinationType]
 * @param {Object} options 
 *  @param {number} [options.delay=750] delay between 2 destination
 *  @param {string} [options.type] animation type (flyTo, moveTo) to use if not defined in destinations
 *  @param {function} [options.easing] easing function used during the animation if not defined in destinations
 *  @param {function} [options.done] callback function called at the end of an animation, called with true if the tour completed
 *  @param {function} [options.step] callback function called when a destination is reached with the step index as param
 */
ol_View.prototype.takeTour = function(destinations, options) {
  options = options || {};
  var index = -1;
  var next = function(more) {
    if (more) {
      var dest = destinations[++index];
      if (typeof(options.step) === 'function') options.step(index, destinations);
      if (dest) {
        if (dest instanceof Array) dest = { center: [dest[0],dest[1]], zoom: dest[2], type: dest[3] };
        var delay = index === 0 ? 0 : (options.delay || 750);
        if (!dest.easing) dest.easing = options.easing;
        if (!dest.type) dest.type = options.type;
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
        if (typeof(options.done)==='function') options.done(true);
      }
    } else {
      if (typeof(options.done)==='function') options.done(false);
    }
  }.bind(this)
  next(true);
};

export default ol_View
