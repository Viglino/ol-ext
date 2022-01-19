/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Pointer from 'ol/interaction/Pointer'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_source_Vector from 'ol/source/Vector'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Circle from 'ol/style/Circle'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_geom_Point from 'ol/geom/Point'
import ol_Feature from 'ol/Feature'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import {ol_coordinate_dist2d, ol_coordinate_equal} from "../geom/GeomUtils";
import {boundingExtent as ol_extent_boundingExtent} from 'ol/extent'
import {buffer as ol_extent_buffer} from 'ol/extent'
import {altKeyOnly as ol_events_condition_altKeyOnly} from 'ol/events/condition'
import {primaryAction as ol_events_condition_primaryAction} from 'ol/events/condition'
import {always as ol_events_condition_always} from 'ol/events/condition'

import '../geom/LineStringSplitAt'

/** Interaction for modifying feature geometries. Similar to the core ol/interaction/Modify.
 * The interaction is more suitable to use to handle feature modification: only features concerned 
 * by the modification are passed to the events (instead of all feature with ol/interaction/Modify)
 * - the modifystart event is fired before the feature is modified (no points still inserted)
 * - the modifyend event is fired after the modification
 * - it fires a modifying event
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires modifystart
 * @fires modifying
 * @fires modifyend
 * @fires select
 * @param {*} options
 *	@param {ol.source.Vector} options.source a source to modify (configured with useSpatialIndex set to true)
 *	@param {ol.source.Vector|Array<ol.source.Vector>} options.sources a list of source to modify (configured with useSpatialIndex set to true)
 *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to modify
 *  @param {integer} options.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for editing. Default is 10.
 *  @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
 *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.style Style for the sketch features.
 *  @param {ol.EventsConditionType | undefined} options.condition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event will be considered to add or move a vertex to the sketch. Default is ol.events.condition.primaryAction.
 *  @param {ol.EventsConditionType | undefined} options.deleteCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled. By default, ol.events.condition.singleClick with ol.events.condition.altKeyOnly results in a vertex deletion.
 *  @param {ol.EventsConditionType | undefined} options.insertVertexCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether a new vertex can be added to the sketch features. Default is ol.events.condition.always
 *  @param {boolean} options.wrapX Wrap the world horizontally on the sketch overlay, default false
 */
var ol_interaction_ModifyFeature = function(options){
  if (!options) options = {};

  var dragging, modifying;
  ol_interaction_Pointer.call(this,{
    /*
    handleDownEvent: this.handleDownEvent,
    handleDragEvent: this.handleDragEvent,
    handleMoveEvent: this.handleMoveEvent,
    handleUpEvent: this.handleUpEvent,
    */
    handleEvent: function(e) {
      switch(e.type) {
        case 'pointerdown': {
          dragging = this.handleDownEvent(e);
          modifying = dragging || this._deleteCondition(e);
          return !dragging;
        }
        case 'pointerup': {
          dragging = false;
          return this.handleUpEvent(e);
        }
        case 'pointerdrag': {
          if (dragging) return this.handleDragEvent(e);
          else return true;
        }
        case 'pointermove': {
          if (!dragging) return this.handleMoveEvent(e);
          else return true;
        }
        case 'singleclick':
        case 'click': {
          // Prevent click when modifying
          return !modifying;
        }
        default: return true;
      }
    }
  });

  // Snap distance (in px)
  this.snapDistance_ = options.pixelTolerance || 10;
  // Split tolerance between the calculated intersection and the geometry
  this.tolerance_ = 1e-10;
  // Cursor
  this.cursor_ = options.cursor;

  // List of source to split
  this.sources_ = options.sources ? (options.sources instanceof Array) ? options.sources:[options.sources] : [];
  if (options.source) this.sources_.push (options.source);
  if (options.features) this.sources_.push (new ol_source_Vector({ features: options.features }));

  // Get all features candidate
  this.filterSplit_ = options.filter || function(){ return true; };

  this._condition = options.condition || ol_events_condition_primaryAction;
  this._deleteCondition = options.deleteCondition || ol_events_condition_altKeyOnly;
  this._insertVertexCondition = options.insertVertexCondition || ol_events_condition_always;

  // Default style
  var sketchStyle = function() {
    return [ new ol_style_Style({
        image: new ol_style_Circle({
          radius: 6,
          fill: new ol_style_Fill({ color: [0, 153, 255, 1] }),
          stroke: new ol_style_Stroke({ color: '#FFF', width: 1.25 })
        })
      })
    ];
  }

  // Custom style
  if (options.style) {
    if (typeof(options.style) === 'function') {
      sketchStyle = options.style
     } else {
       sketchStyle = function() { return options.style; }
     }
  }

  // Create a new overlay for the sketch
  this.overlayLayer_ = new ol_layer_Vector({
    source: new ol_source_Vector({
      useSpatialIndex: false
    }),
    name:'Modify overlay',
    displayInLayerSwitcher: false,
    style: sketchStyle,
    wrapX: options.wrapX
  });

};
ol_ext_inherits(ol_interaction_ModifyFeature, ol_interaction_Pointer);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_ModifyFeature.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol_interaction_Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
};

/**
 * Activate or deactivate the interaction + remove the sketch.
 * @param {boolean} active.
 * @api stable
 */
ol_interaction_ModifyFeature.prototype.setActive = function(active) {
  ol_interaction_Interaction.prototype.setActive.call (this, active);
  if (this.overlayLayer_) this.overlayLayer_.getSource().clear();
};

/** Change the filter function
 * @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
 */
ol_interaction_ModifyFeature.prototype.setFilter = function(filter) {
  if (typeof(filter) === 'function') this.filterSplit_ = filter;
  else if (filter === undefined) this.filterSplit_ = function(){ return true; };
};

/** Get closest feature at pixel
 * @param {ol.Pixel} 
 * @return {*} 
 * @private
 */
ol_interaction_ModifyFeature.prototype.getClosestFeature = function(e) {
  var f, c, d = this.snapDistance_+1;
  for (var i=0; i<this.sources_.length; i++) {
    var source = this.sources_[i];
    f = source.getClosestFeatureToCoordinate(e.coordinate);
    if (f && this.filterSplit_(f)) {
      var ci = f.getGeometry().getClosestPoint(e.coordinate);
      var di = ol_coordinate_dist2d(e.coordinate,ci) / e.frameState.viewState.resolution;
      if (di < d){
        d = di;
        c = ci;
      }
      break;
    }
  }
  if (d > this.snapDistance_) {
    if (this.currentFeature) this.dispatchEvent({ type: 'select', selected: [], deselected: [this.currentFeature] })
    this.currentFeature = null;
    return false;
  } else {
    // Snap to node
    var coord = this.getNearestCoord (c, f.getGeometry());
    if (coord) {
      coord = coord.coord;
      var p = this.getMap().getPixelFromCoordinate(coord);
      if (ol_coordinate_dist2d(e.pixel, p) < this.snapDistance_) {
        c = coord;
      }
      //
      if (this.currentFeature !== f) this.dispatchEvent({ type: 'select', selected: [f], deselected: [this.currentFeature] })
      this.currentFeature = f;
      return { source:source, feature:f, coord: c };
    }
  }
}

/** Get nearest coordinate in a list 
* @param {ol.coordinate} pt the point to find nearest
* @param {ol.geom} coords list of coordinates
* @return {*} the nearest point with a coord (projected point), dist (distance to the geom), ring (if Polygon)
*/
ol_interaction_ModifyFeature.prototype.getNearestCoord = function(pt, geom) {
  var i, l, p, p0, dm;
  switch (geom.getType()) {
    case 'Point': {
      return { coord: geom.getCoordinates(), dist: ol_coordinate_dist2d(geom.getCoordinates(), pt) };
    }
    case 'MultiPoint': {
      return this.getNearestCoord (pt, new ol_geom_LineString(geom.getCoordinates()));
    }
    case 'LineString':
    case 'LinearRing': {
      var d;
      dm = Number.MAX_VALUE;
      var coords = geom.getCoordinates();
      for (i=0; i < coords.length; i++) {
        d = ol_coordinate_dist2d (pt, coords[i]);
        if (d < dm) {
          dm = d;
          p0 = coords[i];
        }
      }
      return { coord: p0, dist: dm };
    }
    case 'MultiLineString': {
      var lstring = geom.getLineStrings();
      p0 = false, dm = Number.MAX_VALUE;
      for (i=0; l=lstring[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.ring = i;
        }
      }
      return p0;
    }
    case 'Polygon': {
      var lring = geom.getLinearRings();
      p0 = false;
      dm = Number.MAX_VALUE;
      for (i=0; l=lring[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.ring = i;
        }
      }
      return p0;
    }
    case 'MultiPolygon': {
      var poly = geom.getPolygons();
      p0 = false;
      dm = Number.MAX_VALUE;
      for (i=0; l=poly[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.poly = i;
        }
      }
      return p0;
    }
    case 'GeometryCollection': {
      var g = geom.getGeometries();
      p0 = false;
      dm = Number.MAX_VALUE;
      for (i=0; l=g[i]; i++) {
        p = this.getNearestCoord(pt, l);
        if (p && p.dist<dm) {
          p0 = p;
          dm = p.dist;
          p0.geom = i;
        }
      }
      return p0;
    }
    default: return false;
  }
};

/** Get arcs concerned by a modification 
 * @param {ol.geom} geom the geometry concerned
 * @param {ol.coordinate} coord pointed coordinates
 */
ol_interaction_ModifyFeature.prototype.getArcs = function(geom, coord) {
  var arcs = false;
  var coords, i, s, l, g;
  switch(geom.getType()) {
    case 'Point': {
      if (ol_coordinate_equal(coord, geom.getCoordinates())) {
        arcs = { 
          geom: geom, 
          type: geom.getType(),
          coord1: [],
          coord2: [],
          node: true
        }
      }
      break;
    }
    case 'MultiPoint': {
      coords = geom.getCoordinates();
      for (i=0; i < coords.length; i++) {
        if (ol_coordinate_equal(coord, coords[i])) {
          arcs = { 
            geom: geom, 
            type: geom.getType(),
            index: i,
            coord1: [],
            coord2: [],
            node: true
          }
          break;
        }
      }
      break;
    }
    case 'LinearRing': 
    case 'LineString': {
      var p = geom.getClosestPoint(coord);
      if (ol_coordinate_dist2d(p,coord) < 1.5*this.tolerance_) {
        var split;
        // Split the line in two
        if (geom.getType() === 'LinearRing') {
          g = new ol_geom_LineString(geom.getCoordinates());
          split = g.splitAt(coord, this.tolerance_);
        } else {
          split = geom.splitAt(coord, this.tolerance_);
        }
        // If more than 2
        if (split.length>2) {
          coords = split[1].getCoordinates();
          for (i=2; s=split[i]; i++) {
            var c = s.getCoordinates();
            c.shift();
            coords = coords.concat(c);
          }
          split = [ split[0], new ol_geom_LineString(coords) ];
        }
        // Split in two
        if (split.length === 2) {
          var c0 = split[0].getCoordinates();
          var c1 = split[1].getCoordinates();
          var nbpt = c0.length + c1.length -1;
          c0.pop();
          c1.shift();
          arcs = { 
            geom: geom, 
            type: geom.getType(),
            coord1: c0, 
            coord2: c1,
            node: (geom.getCoordinates().length === nbpt),
            closed: false
          }
        } else if (split.length === 1) {
          s = split[0].getCoordinates();
          var start = ol_coordinate_equal(s[0], coord);
          var end = ol_coordinate_equal(s[s.length-1], coord);
          // Move first point
          if (start) {
            s.shift();
            if (end) s.pop();
            arcs = { 
              geom: geom, 
              type: geom.getType(),
              coord1: [], 
              coord2: s,
              node: true,
              closed: end
            }
          } else if (end) {
            // Move last point
            s.pop()
            arcs = { 
              geom: geom, 
              type: geom.getType(),
              coord1: s, 
              coord2: [],
              node: true,
              closed: false
            }
          }
        }
      }
      break;
    }
    case 'MultiLineString': {
      var lstring = geom.getLineStrings();
      for (i=0; l=lstring[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.type = geom.getType();
          arcs.lstring = i;
          break;
        }
      }
      break;
    }
    case 'Polygon': {
      var lring = geom.getLinearRings();
      for (i=0; l=lring[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.type = geom.getType();
          arcs.index = i;
          break;
        }
      }
      break;
    }
    case 'MultiPolygon': {
      var poly = geom.getPolygons();
      for (i=0; l=poly[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.type = geom.getType();
          arcs.poly = i;
          break;
        }
      }
      break;
    }
    case 'GeometryCollection': {
      g = geom.getGeometries();
      for (i=0; l=g[i]; i++) {
        arcs = this.getArcs(l, coord);
        if (arcs) {
          arcs.geom = geom;
          arcs.g = i;
          arcs.typeg = arcs.type;
          arcs.type = geom.getType();
          break;
        }
      }
      break;
    }
    default: {
      console.error('ol/interaction/ModifyFeature '+geom.getType()+' not supported!');
      break;
    }
  }
  return arcs;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol_interaction_ModifyFeature.prototype.handleDownEvent = function(evt) {
  if (!this.getActive()) return false;

  // Something to move ?
  var current = this.getClosestFeature(evt);

  if (current && (this._condition(evt) || this._deleteCondition(evt))) {
    var features = [];
    this.arcs = [];

    // Get features concerned
    this.sources_.forEach(function(s) {
      var extent = ol_extent_buffer (ol_extent_boundingExtent([current.coord]), this.tolerance_);
      features = features.concat(features, s.getFeaturesInExtent(extent));
    }.bind(this));

    // Get arcs concerned
    this._modifiedFeatures = [];
    features.forEach(function(f) {
      var a = this.getArcs(f.getGeometry(), current.coord);
      if (a) {
        if (this._insertVertexCondition(evt) || a.node) {
          a.feature = f;
          this._modifiedFeatures.push(f);
          this.arcs.push(a);
        }
      }
    }.bind(this));

    if (this._modifiedFeatures.length) {
      if (this._deleteCondition(evt)) {
        return !this._removePoint(current, evt); 
      } else {
        this.dispatchEvent({ 
          type:'modifystart', 
          coordinate: current.coord,
          originalEvent: evt.originalEvent,
          features: this._modifiedFeatures
        });
        this.handleDragEvent({ 
          coordinate: current.coord,
          originalEvent: evt.originalEvent
        })
        return true;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
};

/** Get modified features
 * @return {Array<ol.Feature>} list of modified features
 */
ol_interaction_ModifyFeature.prototype.getModifiedFeatures = function() {
  return this._modifiedFeatures || [];
};

/** Removes the vertex currently being pointed.
 */
ol_interaction_ModifyFeature.prototype.removePoint = function() {
  this._removePoint({},{});
};

/**
 * @private
 */
ol_interaction_ModifyFeature.prototype._getModification = function(a) {
  var coords = a.coord1.concat(a.coord2);
  switch (a.type) {
    case 'LineString': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>1) {
        if (a.geom.getCoordinates().length != coords.length) {
          a.coords = coords;
          return true;
        }
      }
      break;
    }
    case 'MultiLineString': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>1) {
        var c = a.geom.getCoordinates();
        if (c[a.lstring].length != coords.length) {
          c[a.lstring] = coords;
          a.coords = c;
          return true;
        }
      }
      break;
    }
    case 'Polygon': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>3) {
        c = a.geom.getCoordinates();
        if (c[a.index].length != coords.length) {
          c[a.index] = coords;
          a.coords = c;
          return true;
        }
      }
      break;
    }
    case 'MultiPolygon': {
      if (a.closed) coords.push(coords[0]);
      if (coords.length>3) {
        c = a.geom.getCoordinates();
        if (c[a.poly][a.index].length != coords.length) {
          c[a.poly][a.index] = coords;
          a.coords = c;
          return true;
        }
      }
      break;
    }
    case 'GeometryCollection': {
      a.type = a.typeg;
      var geom = a.geom;
      var geoms = geom.getGeometries();
      a.geom = geoms[a.g];
      var found = this._getModification(a);
      // Restore current arc
      geom.setGeometries(geoms);
      a.geom = geom;
      a.type = 'GeometryCollection';
      return found;
    }
    default: {
      //console.error('ol/interaction/ModifyFeature '+a.type+' not supported!');
      break;
    }
  }
  return false;
};

/** Removes the vertex currently being pointed.
 * @private
 */
ol_interaction_ModifyFeature.prototype._removePoint = function(current, evt) {
  if (!this.arcs) return false;

  this.overlayLayer_.getSource().clear();

  var found = false;
  // Get all modifications
  this.arcs.forEach(function(a) {
    found = found || this._getModification(a);
  }.bind(this));

  // Almost one point is removed
  if (found) {
    this.dispatchEvent({ 
      type:'modifystart', 
      coordinate: current.coord,
      originalEvent: evt.originalEvent,
      features: this._modifiedFeatures
    });
    this.arcs.forEach(function(a) {
      if (a.geom.getType() === 'GeometryCollection') {
        if (a.coords) {
          var geoms = a.geom.getGeometries();
          geoms[a.g].setCoordinates(a.coords);
          a.geom.setGeometries(geoms);
        }
      } else {
        if (a.coords) a.geom.setCoordinates(a.coords);
      }
    }.bind(this));
    this.dispatchEvent({ 
      type:'modifyend', 
      coordinate: current.coord,
      originalEvent: evt.originalEvent,
      features: this._modifiedFeatures
    });
  }

  this.arcs = [];
  return found;
};

/**
 * @private
 */
ol_interaction_ModifyFeature.prototype.handleUpEvent = function(e) {
  if (!this.getActive()) return false;
  if (!this.arcs || !this.arcs.length) return true;

  this.overlayLayer_.getSource().clear();
  this.dispatchEvent({ 
    type:'modifyend', 
    coordinate: e.coordinate,
    originalEvent: e.originalEvent,
    features: this._modifiedFeatures
  });
  
  this.arcs = [];
  return true;
};

/**
 * @private
 */
ol_interaction_ModifyFeature.prototype.setArcCoordinates = function(a, coords) {
  var c;
  switch (a.type) {
    case 'Point': {
      a.geom.setCoordinates(coords[0]);
      break;
    }
    case 'MultiPoint': {
      c = a.geom.getCoordinates();
      c[a.index] = coords[0];
      a.geom.setCoordinates(c);
      break;
    }
    case 'LineString': {
      a.geom.setCoordinates(coords);
      break;
    }
    case 'MultiLineString': {
      c = a.geom.getCoordinates();
      c[a.lstring] = coords;
      a.geom.setCoordinates(c);
      break;
    }
    case 'Polygon': {
      c = a.geom.getCoordinates();
      c[a.index] = coords;
      a.geom.setCoordinates(c);
      break;
    }
    case 'MultiPolygon': {
      c = a.geom.getCoordinates();
      c[a.poly][a.index] = coords;
      a.geom.setCoordinates(c);
      break;
    }
    case 'GeometryCollection': {
      a.type = a.typeg;
      var geom = a.geom;
      var geoms = geom.getGeometries();
      a.geom = geoms[a.g];
      this.setArcCoordinates(a, coords);
      geom.setGeometries(geoms);
      a.geom = geom;
      a.type = 'GeometryCollection';
      break;
    }
  }
};
/**
 * @private
 */
ol_interaction_ModifyFeature.prototype.handleDragEvent = function(e) {
  if (!this.getActive()) return false;
  if (!this.arcs) return true;

  // Show sketch
  this.overlayLayer_.getSource().clear();
  var p = new ol_Feature(new ol_geom_Point(e.coordinate));
  this.overlayLayer_.getSource().addFeature(p);

  // Nothing to do
  if (!this.arcs.length) return true;

  // Move arcs
  this.arcs.forEach(function(a) {
    var coords = a.coord1.concat([e.coordinate], a.coord2);
    if (a.closed) coords.push(e.coordinate);
    this.setArcCoordinates(a, coords);
  }.bind(this));

  this.dispatchEvent({ 
    type:'modifying', 
    coordinate: e.coordinate,
    originalEvent: e.originalEvent,
    features: this._modifiedFeatures
  });

  return true;
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 * @private
 */
ol_interaction_ModifyFeature.prototype.handleMoveEvent = function(e) {
  if (!this.getActive()) return false;

  this.overlayLayer_.getSource().clear();
  var current = this.getClosestFeature(e);

  // Draw sketch
  if (current) {
    var p = new ol_Feature(new ol_geom_Point(current.coord));
    this.overlayLayer_.getSource().addFeature(p);
  }

  // Show cursor
  var element = e.map.getTargetElement();
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

/** Get the current feature to modify
 * @return {ol.Feature} 
 */
ol_interaction_ModifyFeature.prototype.getCurrentFeature = function() {
  return this.currentFeature;
};

export default ol_interaction_ModifyFeature