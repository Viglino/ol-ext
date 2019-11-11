/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_CenterTouch from './CenterTouch'
import ol_style_Style from 'ol/style/Style'
import ol_style_Circle from 'ol/style/Circle'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'
import ol_Feature from 'ol/Feature'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_source_Vector from 'ol/source/Vector'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_geom_Point from 'ol/geom/Point'
import ol_ext_getMapCanvas from '../util/getMapCanvas'

/** Interaction DrawTouch :
 * @constructor
 * @fires drawstart
 * @fires drawend
 * @extends {ol_interaction_CenterTouch}
 * @param {olx.interaction.DrawOptions} options
 *  @param {ol_source_Vector | undefined} options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
 *	@param {boolean} options.tap enable on tap, default true
 *  @param {ol_style_Style|Array<ol_style_Style>} options.targetStyle a style to draw the target point, default cross style
 *  @param {string} options.composite composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
var ol_interaction_DrawTouch = function(options) {
  options = options||{};

  options.handleEvent = function(e) {
    if (this.get("tap")) {
      switch (e.type) {
        case "singleclick": {
          this.addPoint();
          break;
        }
        case "dblclick": {
          this.addPoint();
          this.finishDrawing();
          return false;
          //break;
        }
        default: break;
      }
    }
    return true;
  }
  ol_interaction_CenterTouch.call(this, options);

  this.typeGeom_ = options.type;
  this.source_ = options.source;
  this.set("tap", (options.tap!==false));

  // Style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var defaultStyle = [
    new ol_style_Style({
      stroke: new ol_style_Stroke({ color: white, width: width + 2 })
    }),
    new ol_style_Style({
      image: new ol_style_Circle({
        radius: width * 2,
        fill: new ol_style_Fill({ color: blue }),
        stroke: new ol_style_Stroke({ color: white, width: width / 2 })
      }),
      stroke: new ol_style_Stroke({ color: blue, width: width }),
      fill: new ol_style_Fill({
        color: [255, 255, 255, 0.5]
      })
    })
  ];

  this.overlay_ = new ol_layer_Vector({
    source: new ol_source_Vector({useSpatialIndex: false }),
    style: defaultStyle
  });

  this.geom_ = [];
  
};
ol_ext_inherits(ol_interaction_DrawTouch, ol_interaction_CenterTouch);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_DrawTouch.prototype.setMap = function(map) {
  if (this._listener.drawSketch) ol_Observable_unByKey(this._listener.drawSketch);
  this._listener.drawSketch = null;

  ol_interaction_CenterTouch.prototype.setMap.call (this, map);
  this.overlay_.setMap(map);

  if (this.getMap()){
    this._listener.drawSketch = this.getMap().on("postcompose", this.drawSketchLink_.bind(this));
  }
};

/** Get geometry type
 * @return {ol.geom.GeometryType}
 */
ol_interaction_DrawTouch.prototype.getGeometryType = function() {
  return this.typeGeom_;
};

/** Start drawing and add the sketch feature to the target layer. 
 * The ol.interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
 */
ol_interaction_DrawTouch.prototype.finishDrawing = function() {
  if (!this.getMap()) return;

  var valid = true;
  if (this._feature) {
    switch (this.typeGeom_) {
      case "LineString": {
        if (this.geom_.length > 1) {
          this._feature.setGeometry(new ol_geom_LineString(this.geom_));
        } else {
          valid = false;
        }
        break;
      }
      case "Polygon": {
        // Close polygon
        if (this.geom_[this.geom_.length-1] != this.geom_[0]) {
          this.geom_.push(this.geom_[0]);
        }
        // Valid ?
        if (this.geom_.length > 3) {
          this._feature.setGeometry(new ol_geom_Polygon([ this.geom_ ]));
        } else {
          valid = false;
        }
        break;
      }
      default: break;
    }
    if (this._feature) this.source_.addFeature (this._feature);
    this.dispatchEvent({ 
      type: 'drawend',
      feature: this._feature,
      valid: valid
    });
  }  

  // reset
  this.geom_ = [];
  this.drawSketch_();
  this._feature = null;
};

/** Add a new Point to the drawing
 */
ol_interaction_DrawTouch.prototype.addPoint = function() {
  if (!this.getMap()) return;

  this.geom_.push(this.getPosition());

  var start = false;
  if (!this._feature) {
    this._feature = new ol_Feature();
    start = true;
  }

  switch (this.typeGeom_) {
    case "Point": 
      this._feature.setGeometry(new ol_geom_Point(this.geom_.pop()));
      break;
    case "LineString":
    case "Polygon":
      this.drawSketch_();
      break;
    default: break;
  }
  // Dispatch events
  if (start) {
    this.dispatchEvent({ 
      type: 'drawstart',
      feature: this._feature
    });
  }
  if (this.typeGeom_ ==='Point') {
      this.finishDrawing();
  }
};

/** Remove last point of the feature currently being drawn.
 */
ol_interaction_DrawTouch.prototype.removeLastPoint = function() {
  if (!this.getMap()) return;
  this.geom_.pop();
  this.drawSketch_();
};

/** Draw sketch
 * @private
 */
ol_interaction_DrawTouch.prototype.drawSketch_ = function() {
  if (!this.overlay_) return;
  this.overlay_.getSource().clear();
  if (this.geom_.length) {
    var geom = new ol_geom_LineString(this.geom_);
    if (this.typeGeom_ == "Polygon") {
      if (!this._feature.getGeometry()) {
        this._feature.setGeometry(new ol_geom_Polygon([this.geom_]));
      } else {
        this._feature.getGeometry().setCoordinates([this.geom_]);
      }
      this.overlay_.getSource().addFeature(new ol_Feature(geom));
    } else {
      if (!this._feature.getGeometry()) {
        this._feature.setGeometry(new ol_geom_LineString(this.geom_));
      } else {
        this._feature.getGeometry().setCoordinates(this.geom_);
      }
    }
    this.overlay_.getSource().addFeature(this._feature);
    var f = new ol_Feature( new ol_geom_Point (this.geom_.slice(-1).pop()) );
    this.overlay_.getSource().addFeature(f);
  }
};

/** Draw contruction lines on postcompose
 * @private
 */
ol_interaction_DrawTouch.prototype.drawSketchLink_ = function(e) {
  if (!this.getActive() || !this.getPosition()) return;

  var ctx = e.context || ol_ext_getMapCanvas(this.getMap()).getContext('2d');
  ctx.save();
    var p, pt = this.getMap().getPixelFromCoordinate(this.getPosition());
    var ratio = e.frameState.pixelRatio || 1;
    ctx.scale(ratio,ratio);
    ctx.strokeStyle = "rgba(0, 153, 255, 1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc (pt[0],pt[1], 5, 0, 2*Math.PI);
    ctx.stroke();
    if (this.geom_.length) {
      p = this.getMap().getPixelFromCoordinate(this.geom_[this.geom_.length-1]);
      ctx.beginPath();
      ctx.moveTo(p[0],p[1]);
      ctx.lineTo(pt[0],pt[1]);
      if (this.typeGeom_ == "Polygon") {
        p = this.getMap().getPixelFromCoordinate(this.geom_[0]);
        ctx.lineTo(p[0],p[1]);
      }
      ctx.stroke();
    }
  ctx.restore();
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol_interaction_DrawTouch.prototype.setActive = function(b) {
  ol_interaction_CenterTouch.prototype.setActive.call (this, b);

  if (!b) this.geom_ = [];
  this.drawSketch_();
};

export default ol_interaction_DrawTouch
