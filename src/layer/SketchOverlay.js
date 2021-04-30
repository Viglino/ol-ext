/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {ol_ext_inherits} from '../util/ext'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_style_Style from 'ol/style/Style'
import ol_style_RegularShape from 'ol/style/RegularShape'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_source_Vector from 'ol/source/Vector'
import ol_Feature from 'ol/Feature'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_geom_Circle from 'ol/geom/Circle'

import ol_style_Style_defaultStyle from '../style/defaultStyle'
import {ol_coordinate_dist2d} from "../geom/GeomUtils";

/** A sketch layer used as overlay to handle drawing sketch (helper for drawing tools)
 * @constructor 
 * @extends {ol/layer/Vector}
 * @fires drawstart
 * @fires drawend
 * @fires drawabort
 * @param {*} options 
 *  @param {string} options.type Geometry type, default LineString
 *  @param {ol_style_Style|Array<ol_style_Style>} options.style Drawing style
 *  @param {ol_style_Style|Array<ol_style_Style>} options.sketchStyle Sketch style
 */
var ol_layer_SketchOverlay = function(options) {
  options = options || {};

  var style = options.style || ol_style_Style_defaultStyle(true);
  var sketchStyle = options.sketchStyle;
  if (!sketchStyle) {
    sketchStyle = ol_style_Style_defaultStyle();
    sketchStyle = [
      new ol_style_Style({
        image: new ol_style_RegularShape ({
          points: 4,
          radius: 10,
          radius2: 0,
          stroke: new ol_style_Stroke({
            color: [255,255,255, .5],
            width: 3
          })
        })
      }),
      sketchStyle[0].clone()
    ];
    sketchStyle[1].setImage(new ol_style_RegularShape ({
      points: 4,
      radius: 10,
      radius2: 0,
      stroke: new ol_style_Stroke({
        color: [0, 153, 255, 1],
        width: 1.25
      })
    }));
  }

  this._geom = [];

  ol_layer_Vector.call (this, {
    name: 'sketch',
    source: new ol_source_Vector({ useSpatialIndex: false }),
    style: function(f) {
      return (f.get('sketch') ? sketchStyle : style);
    },
    updateWhileAnimating: true,
    updateWhileInteracting: true
  });
  // Sketch features
  this.getSource().addFeatures([
    new ol_Feature({
      sketch: true,
      geometry: new ol_geom_Point([])
    }),
    new ol_Feature({
      sketch: true,
      geometry: new ol_geom_LineString([])
    }),
    new ol_Feature(),
    new ol_Feature(new ol_geom_Point([]))
  ]);

  this.setGeometryType(options.type);
};
ol_ext_inherits (ol_layer_SketchOverlay, ol_layer_Vector);

/** Set geometry type
 * @param {string} type Geometry type
 * @return {string} the current type
 */
ol_layer_SketchOverlay.prototype.setGeometryType = function(type) {
  var t = /^Point$|^LineString$|^Polygon$|^Circle$/.test(type) ? type : 'LineString';
  if (t !== this._type) {
    this.abortDrawing();
    this._type = t;
  }
  return this._type;
};

/** Get geometry type
 * @return {string} Geometry type
 */
ol_layer_SketchOverlay.prototype.getGeometryType = function() {
  return this._type;
};

/** Add a new Point to the sketch
 * @param {ol.coordinate} coord
 * @return {boolean} true if point has been added, false if same coord
 */
ol_layer_SketchOverlay.prototype.addPoint = function(coord) {
  if (this._lastCoord !== this._position) {
    if (!this._geom.length) {
      this.startDrawing();
    }
    this._geom.push(coord);
    this._lastCoord = coord; 
    this._position = coord; 
    this.drawSketch();
    if (this.getGeometryType() === 'Point') {
      this.finishDrawing();
    }
    if (this.getGeometryType() === 'Circle' && this._geom.length>=2) {
      this.finishDrawing();
    }
    return true;
  }
  return false;
};

/** Remove the last Point from the sketch
 */
ol_layer_SketchOverlay.prototype.removeLastPoint = function() {
  this._geom.pop();
  this._lastCoord = this._geom[this._geom.length-1];
  this.drawSketch();
};

/** Strat a new drawing
 * @param {*} options
 *  @param {string} type Geometry type, default the current type
 *  @param {Array<ol.coordinate>} coordinates a list of coordinates to extend
 *  @param {ol.Feature} feature a feature to extend (LineString or Polygon only)
 *  @param {boolean} atstart extent coordinates or feature at start, default false (extend at end)
 */
ol_layer_SketchOverlay.prototype.startDrawing = function(options) {
  options = options || {};
  this._geom = [];
  if (options.type) this.setGeometryType(options.type);
  this.drawSketch();
  if (!this._drawing) {
    this.dispatchEvent({
      type: 'drawstart',
      feature: this.getFeature()
    });
  }
  this._drawing = true;
};

/** Finish drawing
 * @return {ol.Feature} the drawed feature
 */
ol_layer_SketchOverlay.prototype.finishDrawing = function(valid) {
  var f = this.getSource().getFeatures()[2].clone();
  var isvalid = !!f;
  switch (this.getGeometryType()) {
    case 'Circle': 
    case 'LineString': {
      isvalid = this._geom.length > 1;
      break;
    }
    case 'Polygon': {
      isvalid = this._geom.length > 2;
      break;
    }
  }
  if (valid && !isvalid) return false;
  this._geom = [];
  this._lastCoord = null;
  this.drawSketch();
  if (this._drawing) {
    this.dispatchEvent({
      type: 'drawend',
      valid: isvalid,
      feature: f
    });
  }
  this._drawing = false
  return f;
};

/** Abort drawing
 */
ol_layer_SketchOverlay.prototype.abortDrawing = function() {
  if (this._drawing) {
    this.dispatchEvent({
      type: 'drawabort',
      feature: this.getFeature()
    });
  }
  this._drawing = false;
  this._geom = [];
  this._lastCoord = null;
  this.drawSketch();
};

/** Set current position
 * @param {ol.coordinate} coord
 */
ol_layer_SketchOverlay.prototype.setPosition = function(coord) {
  this._position = coord;
  this.drawLink();
};

/** Get current position
 * @return {ol.coordinate} 
 */
ol_layer_SketchOverlay.prototype.getPosition = function() {
  return this._position;
};

/** Draw/refresh link
 */
ol_layer_SketchOverlay.prototype.drawLink = function() {
  var features = this.getSource().getFeatures();
  if (this._position) {
    if (this._lastCoord && this._lastCoord === this._position) {
      features[0].getGeometry().setCoordinates([]);
    } else {
      features[0].getGeometry().setCoordinates(this._position);
    }
    if (this._geom.length) {
      if (this.getGeometryType()==='Circle') {
        features[1].setGeometry(new ol_geom_Circle(this._geom[0], ol_coordinate_dist2d(this._geom[0], this._position)));
      } else if (this.getGeometryType()==='Polygon') {
        features[1].setGeometry(new ol_geom_LineString([ this._lastCoord, this._position, this._geom[0] ]));
      } else {
        features[1].setGeometry(new ol_geom_LineString([ this._lastCoord, this._position ]));
      }
    } else {
      features[1].setGeometry(new ol_geom_LineString([]));
    }
  } else {
    features[0].getGeometry().setCoordinates([]);
    features[1].setGeometry(new ol_geom_LineString([]));
  }
};

/** Get current feature
 */
ol_layer_SketchOverlay.prototype.getFeature = function() {
  return this.getSource().getFeatures()[2];
};

/** Draw/refresh sketch
 */
ol_layer_SketchOverlay.prototype.drawSketch = function() {
  this.drawLink();
  var features = this.getSource().getFeatures();
  if (!this._geom.length) {
    features[2].setGeometry(null);
    features[3].setGeometry(new ol_geom_Point([]));
  } else {
    if (!this._lastCoord) this._lastCoord = this._geom[this._geom.length-1];
    features[3].getGeometry().setCoordinates(this._lastCoord);
    switch (this._type) {
      case 'Point': {
        features[2].setGeometry(new ol_geom_Point(this._lastCoord));
        break;
      }
      case 'Circle': {
        if (!features[2].getGeometry()) {
          features[2].setGeometry(new ol_geom_Circle(this._geom[0], ol_coordinate_dist2d(this._geom[0], this._geom[this._geom.length-1])));
        } else {
          features[2].getGeometry().setRadius(ol_coordinate_dist2d(this._geom[0], this._geom[this._geom.length-1]));
        }
        break;
      }
      case 'LineString': {
        if (!features[2].getGeometry()) {
          features[2].setGeometry(new ol_geom_LineString(this._geom));
        } else {
          features[2].getGeometry().setCoordinates(this._geom);
        }
        break;
      }
      case 'Polygon': {
        this._geom.push(this._geom[0]);
        if (!features[2].getGeometry()) {
          features[2].setGeometry(new ol_geom_Polygon([this._geom]));
        } else {
          features[2].getGeometry().setCoordinates([this._geom]);
        }
        this._geom.pop();
        break;
      }
      default: {
        console.error('[ol/layer/SketchOverlay~drawSketch] geometry type not supported ('+this._type+')');
        break;
      }
    }
  }
};

export default ol_layer_SketchOverlay