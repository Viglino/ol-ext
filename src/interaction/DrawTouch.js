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
import ol_geom_Circle from 'ol/geom/Circle'
import ol_ext_getMapCanvas from '../util/getMapCanvas'
import {ol_coordinate_dist2d} from '../geom/GeomUtils'

/** Interaction DrawTouch :
 * @constructor
 * @fires drawstart
 * @fires drawend
 * @fires drawabort
 * @extends {ol_interaction_CenterTouch}
 * @param {olx.interaction.DrawOptions} options
 *  @param {ol_source_Vector | undefined} options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
 *	@param {boolean} options.tap enable on tap, default true
 *  @param {ol_style_Style|Array<ol_style_Style>} options.style Drawing style
 *  @param {ol_style_Style|Array<ol_style_Style>} options.sketchStyle Sketch style
 *  @param {ol_style_Style|Array<ol_style_Style>} options.targetStyle a style to draw the target point, default cross style
 *  @param {string} options.composite composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
var ol_interaction_DrawTouch = function(options) {
  options = options||{};

  options.handleEvent = function(e) {
    if (this.get('tap')) {
      this.sketch.setPosition(this.getPosition());
      switch (e.type) {
        case 'singleclick': {
          this.addPoint();
          break;
        }
        case 'dblclick': {
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

  if (!options.sketchStyle) {
    options.sketchStyle = ol_style_Style_defaultStyle();
  }
  var sketch = this.sketch = new ol_layer_SketchOverlay(options);
  sketch.on(['drawstart', 'drawabort'], function(e) { this.dispatchEvent(e); }.bind(this));
  sketch.on(['drawend'], function(e) { 
    if (e.feature && e.valid && options.source) options.source.addFeature(e.feature);
    this.dispatchEvent(e); 
  }.bind(this));

  ol_interaction_CenterTouch.call(this, options);
  this._source = options.source;
};
ol_ext_inherits(ol_interaction_DrawTouch, ol_interaction_CenterTouch);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_DrawTouch.prototype.setMap = function(map) {
  if (this._listener) {
    for(let l in this._listener) ol_Observable_unByKey(l);
  }
  this._listener = {};

  ol_interaction_CenterTouch.prototype.setMap.call (this, map);
  this.sketch.setMap(map);

  if (map){
    this._listener.center = map.on('postcompose', function() {
      if (!ol_coordinate_equal(this.getPosition(), this.sketch.getPosition() || [])) {
        this.sketch.setPosition(this.getPosition());
      }
    }.bind(this));
  }
};

/** Set geometry type
 * @param {ol.geom.GeometryType} type
 */
ol_interaction_DrawTouch.prototype.setGeometryType = function(type) {
  return this.sketch.setGeometryType(type);
};

/** Get geometry type
 * @return {ol.geom.GeometryType}
 */
ol_interaction_DrawTouch.prototype.getGeometryType = function() {
  return this.sketch.getGeometryType();
};

/** Start drawing and add the sketch feature to the target layer. 
 * The ol.interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
 */
ol_interaction_DrawTouch.prototype.finishDrawing = function() {
  this.sketch.finishDrawing(true);
};

/** Add a new Point to the drawing
 */
ol_interaction_DrawTouch.prototype.addPoint = function() {
  this.sketch.addPoint(this.getPosition());
};

/** Remove last point of the feature currently being drawn.
 */
ol_interaction_DrawTouch.prototype.removeLastPoint = function() {
  this.sketch.removeLastPoint();
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol_interaction_DrawTouch.prototype.setActive = function(b) {
  ol_interaction_CenterTouch.prototype.setActive.call (this, b);
  this.sketch.abortDrawing();
  this.sketch.setVisible(b);
};

export default ol_interaction_DrawTouch
