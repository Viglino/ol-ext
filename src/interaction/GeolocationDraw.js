import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_Geolocation from 'ol/Geolocation'
import ol_style_Circle from 'ol/style/Circle'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_style_Style from 'ol/style/Style'
import ol_style_RegularShape from 'ol/style/RegularShape'
import ol_style_Fill from 'ol/style/Fill'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_source_Vector from 'ol/source/Vector'
import ol_Feature from 'ol/Feature'
import ol_interaction_Pointer from 'ol/interaction/Pointer'
import {containsCoordinate as ol_extent_containsCoordinate, containsExtent as ol_extent_containsExtent} from 'ol/extent'

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
 *  @param {function | undefined} options.condition a function that take a ol_Geolocation object and return a boolean to indicate whether location should be handled or not, default return true if accuraty < minAccuraty
 *  @param {Object} options.attributes a list of attributes to register as Point properties: {accuracy:true,accuracyGeometry:true,heading:true,speed:true}, default none.
 *  @param {Number} options.tolerance tolerance to add a new point (in projection unit), use ol.geom.LineString.simplify() method, default 5
 *  @param {Number} options.zoom zoom for tracking, default 16
 *  @param {boolean|auto|position|visible} options.followTrack true if you want the interaction to follow the track on the map, default true
 *  @param { ol.style.Style | Array.<ol.style.Style> | ol.StyleFunction | undefined } options.style Style for sketch features.
 */
var ol_interaction_GeolocationDraw = function(options) {
  if (!options) options={};

  // Geolocation
  this.geolocation = new ol_Geolocation(({ 
    projection: "EPSG:4326",
    trackingOptions: {
      maximumAge: 10000,
      enableHighAccuracy: true,
      timeout: 600000
    }
  }));
  this.geolocation.on('change', this.draw_.bind(this));

  // Current path
  this.path_ = [];
  this.lastPosition_ = false;

  // Default style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var circle = new ol_style_Circle({
    radius: width * 2,
    fill: new ol_style_Fill({ color: blue }),
    stroke: new ol_style_Stroke({ color: white, width: width / 2 })
  });
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
  ];
  var triangle = new ol_style_RegularShape({
    radius: width * 3.5,
    points: 3,
    rotation: 0,
    fill: new ol_style_Fill({ color: blue }),
    stroke: new ol_style_Stroke({ color: white, width: width / 2 })
  });
  // stretch the symbol
  var c = triangle.getImage();
  var ctx = c.getContext("2d");
  var c2 = document.createElement('canvas');
  c2.width = c2.height = c.width;
  c2.getContext("2d").drawImage(c, 0,0);
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(c2, 0,0, c.width, c.height, width, 0, c.width-2*width, c.height);

  var defaultStyle = function(f) {
    if (f.get('heading')===undefined) {
      style[1].setImage(circle);
    } else {
      style[1].setImage(triangle);
      triangle.setRotation( f.get('heading') || 0);
    }
    return style;
  }
  // Style for the accuracy geometry
  this.locStyle = {
    error: new ol_style_Style({ fill: new ol_style_Fill({ color: [255, 0, 0, 0.2] }) }),
    warn: new ol_style_Style({ fill: new ol_style_Fill({ color: [255, 192, 0, 0.2] }) }),
    ok: new ol_style_Style({ fill: new ol_style_Fill({ color: [0, 255, 0, 0.2] }) }),
  };

  // Create a new overlay layer for the sketch
  this.overlayLayer_ = new ol_layer_Vector({
    source: new ol_source_Vector(),
    name:'GeolocationDraw overlay',
    style: options.style || defaultStyle
  });

  this.sketch_ = [new ol_Feature(), new ol_Feature(), new ol_Feature()];
  this.overlayLayer_.getSource().addFeatures(this.sketch_);

  this.features_ = options.features;
  this.source_ = options.source;

  this.condition_ = options.condition || function(loc) { return loc.getAccuracy() < this.get("minAccuracy") };

  // Prevent interaction when tracking
  ol_interaction_Interaction.call(this, {
    handleEvent: function() {
      return (!this.get('followTrack') || this.get('followTrack')=='auto');//  || !geoloc.getTracking());
    }
  });

  this.set("type", options.type||"LineString");
  this.set("attributes", options.attributes||{});
  this.set("minAccuracy", options.minAccuracy||20);
  this.set("tolerance", options.tolerance||5);
  this.set("zoom", options.zoom);
  this.setFollowTrack (options.followTrack===undefined ? true : options.followTrack);

  this.setActive(false);
};
ol_ext_inherits(ol_interaction_GeolocationDraw, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_GeolocationDraw.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol_interaction_Pointer.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
  if (map) this.geolocation.setProjection(map.getView().getProjection());
};

/** Activate or deactivate the interaction.
 * @param {boolean} active
 */
ol_interaction_GeolocationDraw.prototype.setActive = function(active) {
  if (active === this.getActive()) return;
  ol_interaction_Interaction.prototype.setActive.call(this, active);
  this.overlayLayer_.setVisible(active);
  if (this.getMap()) {
    this.geolocation.setTracking(active);
    this.getMap().renderSync();
  }
  this.pause(!active);
  if (active) {
    // Start drawing
    this.reset();
    this.dispatchEvent({ type:'drawstart', feature: this.sketch_[1]});
  } else {
    var f = this.sketch_[1].clone();
    if (f.getGeometry()) {
      if (this.features_) this.features_.push(f);
      if (this.source_) this.source_.addFeature(f);
      this.dispatchEvent({ type:'drawend', feature: f});
    }
  }
};

/** Reset drawing
*/
ol_interaction_GeolocationDraw.prototype.reset = function() {
  this.sketch_[1].setGeometry();
  this.path_ = [];
  this.lastPosition_ = false;
};

/** Start tracking = setActive(true)
 */
ol_interaction_GeolocationDraw.prototype.start = function() {
  this.setActive(true);
};

/** Stop tracking = setActive(false)
 */
ol_interaction_GeolocationDraw.prototype.stop = function() {
  this.setActive(false);
};

/** Pause drawing
 * @param {boolean} b 
 */
ol_interaction_GeolocationDraw.prototype.pause = function(b) {
  this.pause_ = b!==false;
};

/** Is paused
 * @return {boolean} b 
 */
ol_interaction_GeolocationDraw.prototype.isPaused = function() {
  return this.pause_;
};

/** Enable following the track on the map
* @param {boolean|auto|position|visible} follow, 
*	false: don't follow, 
*	true: follow (position+zoom), 
*	'position': follow only position,
*	'auto': start following until user move the map,
*	'visible': center when position gets out of the visible extent
*/
ol_interaction_GeolocationDraw.prototype.setFollowTrack = function(follow) {
  this.set('followTrack', follow);
  var map = this.getMap();
  // Center if wanted
  if (follow !== false && !this.lastPosition_ && map) {
    var pos = this.path_[this.path_.length-1];
    if (pos) {
      map.getView().animate({
        center: pos,
        zoom: (follow!="position" ? this.get("zoom") : undefined)
      });
    }
  }
  this.lastPosition_ = false;				
  this.dispatchEvent({ type:'follow', following: follow!==false });
};

/** Add a new point to the current path
 * @private
 */
ol_interaction_GeolocationDraw.prototype.draw_ = function() {
  var map = this.getMap();
  if (!map) return;

  // Current location
  var loc = this.geolocation;
  var accu = loc.getAccuracy();
  var pos = loc.getPosition();
  pos.push (Math.round((loc.getAltitude()||0)*100)/100);
  pos.push (Math.round((new Date()).getTime()/1000));
  var p = loc.getAccuracyGeometry();

  // Center on point
  // console.log(this.get('followTrack'))
  switch (this.get('followTrack')) {
    // Follow center + zoom
    case true: {
      // modify zoom
      if (this.get('followTrack') == true) {
        map.getView().setZoom( this.get("zoom") || 16 );
        if (!ol_extent_containsExtent(map.getView().calculateExtent(map.getSize()), p.getExtent())) {
          map.getView().fit(p.getExtent());
        }
      }
      map.getView().setCenter( pos );
      break;
    }
    // Follow  position 
    case 'position': {
      // modify center
      map.getView().setCenter( pos );
      break;
    }
    // Keep on following 
    case 'auto': {
      if (this.lastPosition_) {
        var center = map.getView().getCenter();
        // console.log(center,this.lastPosition_)
        if (center[0]!=this.lastPosition_[0] || center[1]!=this.lastPosition_[1]) {
          //this.dispatchEvent({ type:'follow', following: false });
          this.setFollowTrack (false);
        } else {
          map.getView().setCenter( pos );	
          this.lastPosition_ = pos;
        }
      } else {
        map.getView().setCenter( pos );	
        if (this.get("zoom")) map.getView().setZoom( this.get("zoom") );
        this.lastPosition_ = pos;
      }
      break;
    }
    // Force to stay on the map
    case 'visible': {
      if (!ol_extent_containsCoordinate(map.getView().calculateExtent(map.getSize()), pos)) {
        map.getView().setCenter (pos);
      }
      break;
    }
    // Don't follow
    default: break;
  }
  
  // Draw occuracy
  var f = this.sketch_[0];
  f.setGeometry(p);
  if (accu < this.get("minAccuracy")/2) f.setStyle(this.locStyle.ok);
  else if (accu < this.get("minAccuracy")) f.setStyle(this.locStyle.warn);
  else f.setStyle(this.locStyle.error);

  var geo;
  if (!this.pause_ && this.condition_.call(this, loc)) {
    f = this.sketch_[1];
    this.path_.push(pos);
    switch (this.get("type")) {
      case "Point":
        this.path_ = [pos];
        f.setGeometry(new ol_geom_Point(pos, 'XYZM'));
        var attr = this.get('attributes');
        if (attr.heading) f.set("heading",loc.getHeading());
        if (attr.accuracy) f.set("accuracy",loc.getAccuracy());
        if (attr.altitudeAccuracy) f.set("altitudeAccuracy",loc.getAltitudeAccuracy());
        if (attr.speed) f.set("speed",loc.getSpeed());
        break;
      case "LineString":
        if (this.path_.length>1) {
          geo = new ol_geom_LineString(this.path_, 'XYZM');
          geo.simplify (this.get("tolerance"));
          f.setGeometry(geo);
        } else {
          f.setGeometry();
        }
        break;
      case "Polygon":
        if (this.path_.length>2) {
          geo = new ol_geom_Polygon([this.path_], 'XYZM');
          geo.simplify (this.get("tolerance"));
          f.setGeometry(geo);
        }
        else f.setGeometry();
        break;
    }
    this.dispatchEvent({ type:'drawing', feature: this.sketch_[1], geolocation: loc });
  }
  this.sketch_[2].setGeometry(new ol_geom_Point(pos));
  this.sketch_[2].set("heading",loc.getHeading());
  // Drawing
  this.dispatchEvent({ type:'tracking', feature: this.sketch_[1], geolocation: loc });
};

export default ol_interaction_GeolocationDraw
