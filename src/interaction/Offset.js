/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_interaction_Pointer from 'ol/interaction/Pointer'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import {ol_coordinate_dist2d, ol_coordinate_findSegment, ol_coordinate_offsetCoords} from "../geom/GeomUtils";

import ol_style_Style_defaultStyle from '../style/defaultStyle'

/** Offset interaction for offseting feature geometry
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires offsetstart
 * @fires offsetting
 * @fires offsetend
 * @param {any} options
 *	@param {ol.layer.Vector | Array<ol.layer.Vector>} options.layers list of feature to transform 
 *	@param {ol.Collection.<ol.Feature>} options.features collection of feature to transform
 *	@param {ol.source.Vector | undefined} options.source source to duplicate feature when ctrl key is down
 *	@param {boolean} options.duplicate force feature to duplicate (source must be set)
 *  @param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style style for the sketch
 */
var ol_interaction_Offset = function(options) {
  if (!options) options = {};

	// Extend pointer
	ol_interaction_Pointer.call(this, {
    handleDownEvent: this.handleDownEvent_,
    handleDragEvent: this.handleDragEvent_,
    handleMoveEvent: this.handleMoveEvent_,
    handleUpEvent: this.handleUpEvent_
  });
    
	// Collection of feature to transform
	this.features_ = options.features;
	// List of layers to transform
  this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers:[options.layers] : null;
  // duplicate
  this.set('duplicate', options.duplicate);
  this.source_ = options.source;
  // Style
  this._style = (typeof (options.style) === 'function') ? options.style : function () { 
    if (options.style) return options.style;
    else return ol_style_Style_defaultStyle(true);
  };

  // init
  this.previousCursor_ = false;
};
ol_ext_inherits(ol_interaction_Offset, ol_interaction_Pointer);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_Offset.prototype.setMap = function(map) {
	ol_interaction_Pointer.prototype.setMap.call (this, map);
};

/** Get Feature at pixel
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {any} a feature and the hit point
 * @private
 */
ol_interaction_Offset.prototype.getFeatureAtPixel_ = function(e) {
  var self = this;
	return this.getMap().forEachFeatureAtPixel(e.pixel,
		function(feature, layer) {
      var current;
			// feature belong to a layer
			if (self.layers_) {
        for (var i=0; i<self.layers_.length; i++) {
          if (self.layers_[i]===layer) {
            current = feature;
            break;
          }
				}
			}
			// feature in the collection
			else if (self.features_) {
        self.features_.forEach (function(f) {
          if (f===feature) {
            current = feature 
          }
        });
			}
			// Others
			else {
        current = feature;
      }

      // Only poygon or linestring
      var typeGeom = current.getGeometry().getType();
      if (current && /Polygon|LineString/.test(typeGeom)) {
        if (typeGeom==='Polygon' && current.getGeometry().getCoordinates().length>1) return false;
        // test distance
        var p = current.getGeometry().getClosestPoint(e.coordinate);
        var dx = p[0]-e.coordinate[0];
        var dy = p[1]-e.coordinate[1];
        var d = Math.sqrt(dx*dx+dy*dy) / e.frameState.viewState.resolution;
      
        if (d<5) {
          return { 
            feature: current, 
            hit: p, 
            coordinates: current.getGeometry().getCoordinates(),
            geom: current.getGeometry().clone(),
            geomType: typeGeom
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
		},  { hitTolerance: 5 });
};

/**
 * @param {ol.MapBrowserEvent} e Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 * @private
 */
ol_interaction_Offset.prototype.handleDownEvent_ = function(e) {	
  this.current_ = this.getFeatureAtPixel_(e);
  if (this.current_) {
    this.currentStyle_ = this.current_.feature.getStyle();
    if (this.source_ && (this.get('duplicate') || e.originalEvent.ctrlKey)) {
      this.current_.feature = this.current_.feature.clone();
      this.current_.feature.setStyle(this._style(this.current_.feature));
      this.source_.addFeature(this.current_.feature);
    } else {
      // Modify the current feature
      this.current_.feature.setStyle(this._style(this.current_.feature));
      this._modifystart = true;
    }
    this.dispatchEvent({ type:'offsetstart', feature: this.current_.feature, offset: 0 });
    return true;
  } else  {
    return false;
  }
};

/**
 * @param {ol.MapBrowserEvent} e Map browser event.
 * @private
 */
ol_interaction_Offset.prototype.handleDragEvent_ = function(e) {
  if (this._modifystart) {
    this.dispatchEvent({ type:'modifystart', features: [ this.current_.feature ] });
    this._modifystart = false;
  }
  var p = this.current_.geom.getClosestPoint(e.coordinate);
  var d = ol_coordinate_dist2d(p, e.coordinate);
  var seg, v1, v2, offset;
  switch (this.current_.geomType) {
    case  'Polygon': {
      seg = ol_coordinate_findSegment(p, this.current_.coordinates[0]).segment;
      if (seg) {
        v1 = [ seg[1][0]-seg[0][0], seg[1][1]-seg[0][1] ];
        v2 = [ e.coordinate[0]-p[0], e.coordinate[1]-p[1] ];
        if (v1[0]*v2[1] - v1[1]*v2[0] > 0) {
          d = -d;
        }

        offset = [];
        for (var i=0; i<this.current_.coordinates.length; i++) {
          offset.push( ol_coordinate_offsetCoords(this.current_.coordinates[i], i==0 ? d : -d) );
        }
        this.current_.feature.setGeometry(new ol_geom_Polygon(offset));
      }
      break;
    }
    case 'LineString': {
      seg = ol_coordinate_findSegment(p, this.current_.coordinates).segment;
      if (seg) {
        v1 = [ seg[1][0]-seg[0][0], seg[1][1]-seg[0][1] ];
        v2 = [ e.coordinate[0]-p[0], e.coordinate[1]-p[1] ];
        if (v1[0]*v2[1] - v1[1]*v2[0] > 0) {
          d = -d;
        }
        offset = ol_coordinate_offsetCoords(this.current_.coordinates, d);
        this.current_.feature.setGeometry(new ol_geom_LineString(offset));
      }
      break;
    }
    default: {
      break;
    }
  }
  this.dispatchEvent({ type:'offsetting', feature: this.current_.feature, offset: d, segment: [p, e.coordinate], coordinate: e.coordinate });  
};

/**
 * @param {ol.MapBrowserEvent} e Map browser event.
 * @private
 */
ol_interaction_Offset.prototype.handleUpEvent_ = function(e) {
  if (!this._modifystart) {
    this.dispatchEvent({ type:'offsetend', feature: this.current_.feature, coordinate: e.coordinate }); 
  }
  this.current_.feature.setStyle(this.currentStyle_);
  this.current_ = false;
};

/**
 * @param {ol.MapBrowserEvent} e Event.
 * @private
 */
ol_interaction_Offset.prototype.handleMoveEvent_ = function(e) {	
  var f = this.getFeatureAtPixel_(e);
  if (f) {
    if (this.previousCursor_ === false) {
      this.previousCursor_ = e.map.getTargetElement().style.cursor;
    }
    e.map.getTargetElement().style.cursor = 'pointer';
  } else {
    e.map.getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = false;
  }
};

export default ol_interaction_Offset
