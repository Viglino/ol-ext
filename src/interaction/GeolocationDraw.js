import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import ol_Geolocation from 'ol/Geolocation.js'
import ol_style_Circle from 'ol/style/Circle.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_geom_Point from 'ol/geom/Point.js'
import ol_geom_LineString from 'ol/geom/LineString.js'
import ol_geom_Polygon from 'ol/geom/Polygon.js'
import ol_geom_Circle from 'ol/geom/Circle.js'
import { fromCircle as ol_geom_Polygon_fromCircle } from 'ol/geom/Polygon.js'
import ol_style_Style from 'ol/style/Style.js'
import ol_style_RegularShape from 'ol/style/RegularShape.js'
import ol_style_Fill from 'ol/style/Fill.js'
import ol_layer_Vector from 'ol/layer/Vector.js'
import ol_source_Vector from 'ol/source/Vector.js'
import ol_Feature from 'ol/Feature.js'
import {containsCoordinate as ol_extent_containsCoordinate, containsExtent as ol_extent_containsExtent} from 'ol/extent.js'
// import {ol_coordinate_dist2d, ol_coordinate_equal} from '../geom/GeomUtils'
import {transform as ol_proj_transform} from 'ol/proj.js'
import {getDistance as ol_sphere_getDistance} from 'ol/sphere.js'


/** Interaction to draw on the current geolocation
 *	It combines a draw with a ol_Geolocation
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart, drawend, drawing, tracking, follow
 * @param {any} options
 *  @param { ol.Collection.<ol.Feature> | undefined } option.features Destination collection for the drawn features.
 *  @param { ol.source.Vector | undefined } options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon'), default LineString.
 *  @param {Number | undefined} options.minAccuracy minimum accuracy underneath a new point will be register (if no condition), default 20
 *  @param {function | undefined} options.condition a function that take a ol_Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuracy < minAccuracy
 *  @param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
 *  @param {Number} options.tolerance tolerance to add a new point (in meter), default 5
 *  @param {Number} options.zoom zoom for tracking, default 16
 *  @param {Number} options.minZoom min zoom for tracking, if zoom is less it will zoom to it, default use zoom option
 *  @param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
 *  @param { ol.style.Style | Array.<ol.style.Style> | ol.StyleFunction | undefined } options.style Style for sketch features.
 */
var ol_interaction_GeolocationDraw = class olinteractionGeolocationDraw extends ol_interaction_Interaction {
  constructor(options) {
    options = options || {}
    super({
      handleEvent: function () {
        return (!this.get('followTrack') || this.get('followTrack') == 'auto') //  || !geoloc.getTracking());
      }
    })

    // Geolocation
    this.geolocation = new ol_Geolocation(({
      projection: "EPSG:4326",
      trackingOptions: {
        maximumAge: 10000,
        enableHighAccuracy: true,
        timeout: 600000
      }
    }))
    this.geolocation.on('change', this.draw_.bind(this))

    // Current path
    this.path_ = []
    this.lastPosition_ = false

    // Default style
    var white = [255, 255, 255, 1]
    var blue = [0, 153, 255, 1]
    var width = 3
    var circle = new ol_style_Circle({
      radius: width * 2,
      fill: new ol_style_Fill({ color: blue }),
      stroke: new ol_style_Stroke({ color: white, width: width / 2 })
    })
    var style = [
      new ol_style_Style({
        stroke: new ol_style_Stroke({ color: white, width: width + 2 })
      }),
      new ol_style_Style({
        stroke: new ol_style_Stroke({ color: blue, width: width }),
        fill: new ol_style_Fill({
          color: [255, 255, 255, 0.5]
        })
      })
    ]
    var triangle = new ol_style_RegularShape({
      radius: width * 3.5,
      points: 3,
      rotation: 0,
      fill: new ol_style_Fill({ color: blue }),
      stroke: new ol_style_Stroke({ color: white, width: width / 2 })
    })
    // stretch the symbol
    var c = triangle.getImage()
    var ctx = c.getContext("2d")
    var c2 = document.createElement('canvas')
    c2.width = c2.height = c.width
    c2.getContext("2d").drawImage(c, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(c2, 0, 0, c.width, c.height, width, 0, c.width - 2 * width, c.height)

    var defaultStyle = function (f) {
      if (f.get('heading') === undefined) {
        style[1].setImage(circle)
      } else {
        style[1].setImage(triangle)
        triangle.setRotation(f.get('heading') || 0)
      }
      return style
    }
    // Style for the accuracy geometry
    this.locStyle = {
      error: new ol_style_Style({ fill: new ol_style_Fill({ color: [255, 0, 0, 0.2] }) }),
      warn: new ol_style_Style({ fill: new ol_style_Fill({ color: [255, 192, 0, 0.2] }) }),
      ok: new ol_style_Style({ fill: new ol_style_Fill({ color: [0, 255, 0, 0.2] }) }),
    }

    // Create a new overlay layer for the sketch
    this.overlayLayer_ = new ol_layer_Vector({
      source: new ol_source_Vector(),
      name: 'GeolocationDraw overlay',
      style: options.style || defaultStyle
    })

    this.sketch_ = [new ol_Feature(), new ol_Feature(), new ol_Feature()]
    this.overlayLayer_.getSource().addFeatures(this.sketch_)

    this.features_ = options.features
    this.source_ = options.source

    this.condition_ = options.condition || function (loc) {
      return loc.getAccuracy() < this.get("minAccuracy")
    }

    this.set('type', options.type || "LineString")
    this.set('attributes', options.attributes || {})
    this.set('minAccuracy', options.minAccuracy || 20)
    this.set('tolerance', options.tolerance || 5)
    this.set('zoom', options.zoom)
    this.set('minZoom', options.minZoom)
    this.setFollowTrack(options.followTrack === undefined ? true : options.followTrack)

    this.setActive(false)
  }
  /** Simplify 3D geometry
   * @param {ol.geom.Geometry} geo
   * @param {number} tolerance
   */
  simplify3D(geo, tolerance) {
    var geom = geo.getCoordinates()
    var proj = this.getMap().getView().getProjection()
    if (this.get("type") === 'Polygon') {
      geom = geom[0]
    }
    var simply = [geom[0]]
    var pi, p = ol_proj_transform(geom[0], proj, 'EPSG:4326')
    for (var i = 1; i < geom.length; i++) {
      pi = ol_proj_transform(geom[i], proj, 'EPSG:4326')
      var d = ol_sphere_getDistance(p, pi)
      if (d > tolerance) {
        simply.push(geom[i])
        p = pi
      }
    }
    if (simply[simply.length - 1] !== geom[geom.length - 1]) {
      simply.push(geom[geom.length - 1])
    }
    /*
    var simply = geo.simplify(tolerance).getCoordinates();
    if (this.get("type")==='Polygon') {
      simply = simply[0];
    }
    var step=0;
    simply.forEach(function(p) {
      for (; step<this.path_.length; step++) {
        if (ol_coordinate_equal(p, this.path_[step])) {
          p[2] = this.path_[step][2];
          p[3] = this.path_[step][3];
          break;
        }
      }
    }.bind(this));
    */
    // Get 3D geom
    if (this.get("type") === 'Polygon') {
      geo = new ol_geom_Polygon([simply], 'XYZM')
    } else {
      geo = new ol_geom_LineString(simply, 'XYZM')
    }
    return geo
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_)
    super.setMap(map)
    this.overlayLayer_.setMap(map)
    if (map) this.geolocation.setProjection(map.getView().getProjection())
  }
  /** Activate or deactivate the interaction.
   * @param {boolean} active
   */
  setActive(active) {
    if (active === this.getActive()) return
    super.setActive(active)
    if (this.getMap()) {
      this.geolocation.setTracking(active)
      try { this.getMap().renderSync()}  catch (e) { /* ok */ }
    }
    if (!this.overlayLayer_) return;
    this.overlayLayer_.setVisible(active)
    this.pause(!active)
    if (active) {
      // Start drawing
      this.reset()
      this.dispatchEvent({ type: 'drawstart', feature: this.sketch_[1] })
    } else {
      var f = this.sketch_[1].clone()
      if (f.getGeometry()) {
        if (this.features_)
          this.features_.push(f)
        if (this.source_)
          this.source_.addFeature(f)
      }
      this.dispatchEvent({ type: 'drawend', feature: f })
    }
  }
  /** Simulate a track and override current geolocation
   * @param {Array<ol.coordinate>|boolean} track a list of point or false to stop
   * @param {*} options
   *  @param {number} delay delay in ms, default 1000 (1s)
   *  @param {number} accuracy gps accuracy, default 10
   *  @param {boolean} repeat repeat track, default true
   */
  simulate(track, options) {
    if (this._track) {
      clearTimeout(this._track.timeout)
    }
    if (!track) {
      this._track = false
      return
    }
    options = options || {}
    var delay = options.delay || 1000
    function handleTrack() {
      if (this._track.pos >= this._track.track.length) {
        this._track = false
        return
      }
      var coord = this._track.track[this._track.pos]
      coord[2] = coord[3] || 0
      coord[3] = (new Date()).getTime()
      this._track.pos++
      if (options.repeat !== false) {
        this._track.pos = this._track.pos % this._track.track.length
      }
      if (this.getActive())
        this.draw_(true, coord, options.accuracy)
      this._track.timeout = setTimeout(handleTrack.bind(this), delay)
    }
    this._track = {
      track: track,
      pos: 0,
      timeout: setTimeout(handleTrack.bind(this), 0)
    }
  }
  /** Is simulation on ?
   * @returns {boolean}
   */
  simulating() {
    return !!this._track
  }
  /** Reset drawing
  */
  reset() {
    this.sketch_[1].setGeometry()
    this.path_ = []
    this.lastPosition_ = false
  }
  /** Start tracking = setActive(true)
   */
  start() {
    this.setActive(true)
  }
  /** Stop tracking = setActive(false)
   */
  stop() {
    this.setActive(false)
  }
  /** Pause drawing
   * @param {boolean} b
   */
  pause(b) {
    this.pause_ = (b !== false)
  }
  /** Is paused
   * @return {boolean} b
   */
  isPaused() {
    return this.pause_
  }
  /** Enable following the track on the map
  * @param {boolean|auto|position|visible} follow,
  *	false: don't follow,
  *	true: follow (position+zoom),
  *	'position': follow only position,
  *	'auto': start following until user move the map,
  *	'visible': center when position gets out of the visible extent
  */
  setFollowTrack(follow) {
    this.set('followTrack', follow)
    var map = this.getMap()
    // Center if wanted
    if (this.getActive() && map) {
      var zoom
      if (follow !== 'position') {
        if (this.get('minZoom')) {
          zoom = Math.max(this.get('minZoom'), map.getView().getZoom())
        } else {
          zoom = this.get('zoom')
        }
      }
      if (follow !== false && !this.lastPosition_) {
        var pos = this.path_[this.path_.length - 1]
        if (pos) {
          map.getView().animate({
            center: pos,
            zoom: zoom
          })
        }
      } else if (follow === 'auto' && this.lastPosition_) {
        map.getView().animate({
          center: this.lastPosition_,
          zoom: zoom
        })
      }
    }
    this.lastPosition_ = false
    this.dispatchEvent({ type: 'follow', following: follow !== false })
  }
  /** Add a new point to the current path
   * @private
   */
  draw_(simulate, coord, accuracy) {
    var map = this.getMap()
    if (!map)
      return

    var accu, pos, p, loc, heading
    // Simulation mode
    if (this._track) {
      if (simulate !== true)
        return
      pos = coord
      accu = accuracy || 10
      if (this.path_ && this.path_.length) {
        var pt = this.path_[this.path_.length - 1]
        heading = Math.atan2(coord[0] - pt[0], coord[1] - pt[1])
      }
      var circle = new ol_geom_Circle(pos, map.getView().getResolution() * accu)
      p = ol_geom_Polygon_fromCircle(circle)
    } else {
      // Current location
      loc = this.geolocation
      accu = loc.getAccuracy()
      pos = this.getPosition(loc)
      p = loc.getAccuracyGeometry()
      heading = loc.getHeading()
    }

    // Center on point
    // console.log(this.get('followTrack'))
    switch (this.get('followTrack')) {
      // Follow center + zoom
      case true: {
        // modify zoom
        if (this.get('followTrack') == true) {
          if (this.get('minZoom')) {
            if (this.get('minZoom') > map.getView().getZoom()) {
              map.getView().setZoom(this.get('minZoom'))
            }
          } else {
            map.getView().setZoom(this.get('zoom') || 16)
          }
          if (!ol_extent_containsExtent(map.getView().calculateExtent(map.getSize()), p.getExtent())) {
            map.getView().fit(p.getExtent())
          }
        }
        map.getView().setCenter(pos)
        break
      }
      // Follow  position 
      case 'position': {
        // modify center
        map.getView().setCenter(pos)
        break
      }
      // Keep on following 
      case 'auto': {
        if (this.lastPosition_) {
          var center = map.getView().getCenter()
          // console.log(center,this.lastPosition_)
          if (center[0] != this.lastPosition_[0] || center[1] != this.lastPosition_[1]) {
            //this.dispatchEvent({ type:'follow', following: false });
            this.setFollowTrack(false)
          } else {
            map.getView().setCenter(pos)
            this.lastPosition_ = pos
          }
        } else {
          map.getView().setCenter(pos)
          if (this.get('minZoom')) {
            if (this.get('minZoom') > map.getView().getZoom()) {
              map.getView().setZoom(this.get('minZoom'))
            }
          } else if (this.get('zoom')) {
            map.getView().setZoom(this.get('zoom'))
          }
          this.lastPosition_ = pos
        }
        break
      }
      // Force to stay on the map
      case 'visible': {
        if (!ol_extent_containsCoordinate(map.getView().calculateExtent(map.getSize()), pos)) {
          map.getView().setCenter(pos)
        }
        break
      }
      // Don't follow
      default: break
    }

    // Draw occuracy
    var f = this.sketch_[0]
    f.setGeometry(p)
    if (accu < this.get("minAccuracy") / 2)
      f.setStyle(this.locStyle.ok)
    else if (accu < this.get("minAccuracy"))
      f.setStyle(this.locStyle.warn)
    else
      f.setStyle(this.locStyle.error)

    var geo
    if (this.pause_) {
      this.lastPosition_ = pos
    }
    if (!this.pause_ && (!loc || this.condition_.call(this, loc))) {
      f = this.sketch_[1]
      this.path_.push(pos)
      switch (this.get("type")) {
        case "Point":
          this.path_ = [pos]
          f.setGeometry(new ol_geom_Point(pos, 'XYZM'))
          var attr = this.get('attributes')
          if (attr.heading)
            f.set("heading", loc.getHeading())
          if (attr.accuracy)
            f.set("accuracy", loc.getAccuracy())
          if (attr.altitudeAccuracy)
            f.set("altitudeAccuracy", loc.getAltitudeAccuracy())
          if (attr.speed)
            f.set("speed", loc.getSpeed())
          break
        case "LineString":
          if (this.path_.length > 1) {
            geo = new ol_geom_LineString(this.path_, 'XYZM')
            if (this.get("tolerance"))
              geo = this.simplify3D(geo, this.get("tolerance"))
            f.setGeometry(geo)
          } else {
            f.setGeometry()
          }
          break
        case "Polygon":
          if (this.path_.length > 2) {
            geo = new ol_geom_Polygon([this.path_], 'XYZM')
            if (this.get("tolerance"))
              geo = this.simplify3D(geo, this.get("tolerance"))
            f.setGeometry(geo)
          }
          else
            f.setGeometry()
          break
      }
      this.dispatchEvent({ type: 'drawing', feature: this.sketch_[1], geolocation: loc })
    }
    this.sketch_[2].setGeometry(new ol_geom_Point(pos))
    this.sketch_[2].set("heading", heading)
    // Drawing
    this.dispatchEvent({ type: 'tracking', feature: this.sketch_[1], geolocation: loc })
  }
  /** Get a position according to the geolocation
   * @param {Geolocation} loc
   * @returns {Array<any>} an array of measure X,Y,Z,T
   * @api
   */
  getPosition(loc) {
    var pos = loc.getPosition()
    pos.push(Math.round((loc.getAltitude() || 0) * 100) / 100)
    pos.push(Math.round((new Date()).getTime() / 1000))
    return pos
  }
}

export default ol_interaction_GeolocationDraw
