/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_source_Vector from 'ol/source/Vector'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Circle from 'ol/style/Circle'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_geom_Point from 'ol/geom/Point'
import ol_Feature from 'ol/Feature'
import ol_geom_LineString from 'ol/geom/LineString'
import {ol_coordinate_dist2d} from "../geom/GeomUtils";
import '../geom/LineStringSplitAt'

/** Interaction split interaction for splitting feature geometry
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires  beforesplit, aftersplit, pointermove
 * @param {*} 
 *  @param {ol.source.Vector|Array<ol.source.Vector>} [options.sources] a list of source to split (configured with useSpatialIndex set to true), if none use map visible layers.
 *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to split (instead of a list of sources)
 *  @param {integer} options.snapDistance distance (in px) to snap to an object, default 25px
 *	@param {string|undefined} options.cursor cursor name to display when hovering an objet
 *  @param {function|undefined} opttion.filter a filter that takes a feature and return true if it can be clipped, default always split.
 *  @param ol_style_Style | Array<ol_style_Style> | false | undefined} options.featureStyle Style for the selected features, choose false if you don't want feature selection. By default the default edit style is used.
 *  @param {ol_style_Style | Array<ol_style_Style> | undefined} options.sketchStyle Style for the sektch features. 
 *  @param {function|undefined} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split.  Default is 1e-10.
 */
var ol_interaction_Split = function(options) {
  if (!options) options = {};

  ol_interaction_Interaction.call(this, {
    handleEvent: function(e) {
      switch (e.type) {
        case "singleclick":
          return this.handleDownEvent(e);
        case "pointermove":
          return this.handleMoveEvent(e);
        default: 
          return true;
      }
      //return true;
    }
  });

  // Snap distance (in px)
  this.snapDistance_ = options.snapDistance || 25;
  // Split tolerance between the calculated intersection and the geometry
  this.tolerance_ = options.tolerance || 1e-10;
  // Cursor
  this.cursor_ = options.cursor;

  // List of source to split
  this.setSources(options.sources);

  if (options.features) {
    this.sources_.push (new ol_source_Vector({ features: options.features }));
  }

  // Get all features candidate
  this.filterSplit_ = options.filter || function(){ return true; };

  // Default style
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;
  var fill = new ol_style_Fill({ color: 'rgba(255,255,255,0.4)' });
  var stroke = new ol_style_Stroke({
    color: '#3399CC',
    width: 1.25
  });
  var sketchStyle = [
    new ol_style_Style({
      image: new ol_style_Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
      }),
      fill: fill,
      stroke: stroke
    })
  ];
  var featureStyle = [
    new ol_style_Style({
      stroke: new ol_style_Stroke({
        color: white,
        width: width + 2
      })
    }),
    new ol_style_Style({
      image: new ol_style_Circle({
        radius: 2*width,
        fill: new ol_style_Fill({
          color: blue
        }),
        stroke: new ol_style_Stroke({
          color: white,
          width: width/2
        })
      }),
      stroke: new ol_style_Stroke({
          color: blue,
          width: width
        })
    }),
  ];

  // Custom style
  if (options.sketchStyle) sketchStyle = options.sketchStyle instanceof Array ? options.sketchStyle : [options.sketchStyle];
  if (options.featureStyle) featureStyle = options.featureStyle instanceof Array ? options.featureStyle : [options.featureStyle];

  // Create a new overlay for the sketch
  this.overlayLayer_ = new ol_layer_Vector({
    source: new ol_source_Vector({
      useSpatialIndex: false
    }),
    name:'Split overlay',
    displayInLayerSwitcher: false,
    style: function(f) {
      if (f._sketch_) return sketchStyle;
      else return featureStyle;
    }
  });

};
ol_ext_inherits(ol_interaction_Split, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_Split.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol_interaction_Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
};

/** Get sources to split features in
 * @return {Array<ol.source.Vector>}
 */
ol_interaction_Split.prototype.getSources = function() {
  if (!this.sources_ && this.getMap()) {
    var sources = []
    function getSources(layers) {
      layers.forEach(function(layer) {
        if (layer.getVisible()) {
          if (layer.getSource && layer.getSource() instanceof ol_source_Vector) {
            sources.unshift(layer.getSource());
          } else if (layer.getLayers) {
            getSources(layer.getLayers());
          }
        }
      })
    }
    getSources(this.getMap().getLayers())
    return sources;
  }
  return this.sources_ || [];
};

/** Set sources to split features in 
 * @param {ol.source.Vector|Array<ol.source.Vector>} [sources]
 */
ol_interaction_Split.prototype.setSources = function(sources) {
  this.sources_ = sources ? (sources instanceof Array ? sources||false : [sources]) : false;
};


/** Get closest feature at pixel
 * @param {ol.Pixel} 
 * @return {ol.feature} 
 * @private
 */
ol_interaction_Split.prototype.getClosestFeature = function(e) {
  var source, f, c, g, d = this.snapDistance_+1;
  // Look for closest point in the sources
  this.getSources().forEach(function(si) {
    var fi = si.getClosestFeatureToCoordinate(e.coordinate);
    if (fi && fi.getGeometry().splitAt) {
      var ci = fi.getGeometry().getClosestPoint(e.coordinate);
      var gi = new ol_geom_LineString([e.coordinate,ci]);
      var di = gi.getLength() / e.frameState.viewState.resolution;
      if (di < d) {
        source = si;
        d = di;
        f = fi;
        g = gi;
        c = ci;
      }
    }
  });
  // Snap ?
  if (d > this.snapDistance_) {
    return false;
  } else {
    // Snap to node
    var coord = this.getNearestCoord (c, f.getGeometry().getCoordinates());
    var p = this.getMap().getPixelFromCoordinate(coord);
    if (ol_coordinate_dist2d(e.pixel, p) < this.snapDistance_) {
      c = coord;
    }
    //
    return { source:source, feature:f, coord: c, link: g };
  }
}

/** Get nearest coordinate in a list 
* @param {ol.coordinate} pt the point to find nearest
* @param {Array<ol.coordinate>} coords list of coordinates
* @return {ol.coordinate} the nearest coordinate in the list
*/
ol_interaction_Split.prototype.getNearestCoord = function(pt, coords) {
  var d, dm=Number.MAX_VALUE, p0;
  for (var i=0; i < coords.length; i++) {
    d = ol_coordinate_dist2d (pt, coords[i]);
    if (d < dm) {
      dm = d;
      p0 = coords[i];
    }
  }
  return p0;
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol_interaction_Split.prototype.handleDownEvent = function(evt) {
  // Something to split ?
  var current = this.getClosestFeature(evt);

  if (current) {
    var self = this;
    self.overlayLayer_.getSource().clear();
    var split = current.feature.getGeometry().splitAt(current.coord, this.tolerance_);
    var i;
    if (split.length > 1) {
      var tosplit = [];
      for (i=0; i<split.length; i++) {
        var f = current.feature.clone();
        f.setGeometry(split[i]);
        tosplit.push(f);
      }
      self.dispatchEvent({ type:'beforesplit', original: current.feature, features: tosplit });
      current.source.dispatchEvent({ type:'beforesplit', original: current.feature, features: tosplit });
      current.source.removeFeature(current.feature);
      for (i=0; i<tosplit.length; i++) {
        current.source.addFeature(tosplit[i]);
      }
      self.dispatchEvent({ type:'aftersplit', original: current.feature, features: tosplit });
      current.source.dispatchEvent({ type:'aftersplit', original: current.feature, features: tosplit });
    }
  }
  return false;
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ol_interaction_Split.prototype.handleMoveEvent = function(e) {
  var map = e.map;
  this.overlayLayer_.getSource().clear();
  var current = this.getClosestFeature(e);

  if (current && this.filterSplit_(current.feature)) {
    var p, l;
    // Draw sketch
    this.overlayLayer_.getSource().addFeature(current.feature);
    p = new ol_Feature(new ol_geom_Point(current.coord));
    p._sketch_ = true;
    this.overlayLayer_.getSource().addFeature(p);
    //
    l = new ol_Feature(current.link);
    l._sketch_ = true;
    this.overlayLayer_.getSource().addFeature(l);
    // move event
    this.dispatchEvent({
      type: 'pointermove',
      coordinate: e.coordinate,
      frameState: e.frameState,
      originalEvent: e.originalEvent,
      map: e.map,
      pixel: e.pixel,
      feature: current.feature,
      linkGeometry: current.link
    });
  } else {
    this.dispatchEvent(e);
  }

  var element = map.getTargetElement();
  if (this.cursor_) {
    if (current) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};

export default ol_interaction_Split
