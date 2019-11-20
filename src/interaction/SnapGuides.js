/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import {buffer as ol_extent_buffer, containsCoordinate as ol_extent_containsCoordinate} from 'ol/extent'
import ol_source_Vector from 'ol/source/Vector'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_Collection from 'ol/Collection'
import ol_Feature from 'ol/Feature'
import ol_geom_LineString from 'ol/geom/LineString'
import './Modify'

/** Interaction to snap to guidelines
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {*} options
 *  @param {number | undefined} options.pixelTolerance distance (in px) to snap to a guideline, default 10 px
 *  @param {bool | undefined} options.enableInitialGuides whether to draw initial guidelines based on the maps orientation, default false.
 *  @param {ol_style_Style | Array<ol_style_Style> | undefined} options.style Style for the sektch features.
 *  @param {*} options.vectorClass a vector layer class to create the guides with ol6, use ol/layer/VectorImage using ol6
 */
var ol_interaction_SnapGuides = function(options) {
  if (!options) options = {};

  // Intersect 2 guides
  function getIntersectionPoint (d1, d2) {
    var d1x = d1[1][0] - d1[0][0];
    var d1y = d1[1][1] - d1[0][1];
    var d2x = d2[1][0] - d2[0][0];
    var d2y = d2[1][1] - d2[0][1];
    var det = d1x * d2y - d1y * d2x;

    if (det != 0) {
      var k = (d1x * d1[0][1] - d1x * d2[0][1] - d1y * d1[0][0] + d1y * d2[0][0]) / det;
      return [d2[0][0] + k*d2x, d2[0][1] + k*d2y];
    }
    else return false;
  }
  function dist2D (p1,p2) {
    var dx = p1[0]-p2[0];
    var dy = p1[1]-p2[1];
    return Math.sqrt(dx*dx+dy*dy);
  }

  // Snap distance (in px)
  this.snapDistance_ = options.pixelTolerance || 10;
  this.enableInitialGuides_ = options.enableInitialGuides || false;

  // Default style
  var sketchStyle = [
    new ol_style_Style({
      stroke: new ol_style_Stroke({
        color: '#ffcc33',
        lineDash: [8,5],
        width: 1.25
      })
    })
  ];

  // Custom style
  if (options.style) sketchStyle = options.style instanceof Array ? options.style : [options.style];

  // Create a new overlay for the sketch
  this.overlaySource_ = new ol_source_Vector({
    features: new ol_Collection(),
    useSpatialIndex: false
  });

  // Use ol/layer/VectorImage to render the snap guides as an image to improve performance on rerenderers
  const vectorClass = options.vectorClass || ol_layer_Vector;
  this.overlayLayer_ = new vectorClass({
    // render the snap guides as an image to improve performance on rerenderers
    renderMode: 'image',
    source: this.overlaySource_,
      style: function() {
        return sketchStyle;
      },
      name:'Snap overlay',
      displayInLayerSwitcher: false
    });
  // Use snap interaction
  ol_interaction_Interaction.call(this, {
    handleEvent: function(e) {
      if (this.getActive()) {
        var features = this.overlaySource_.getFeatures();
        var prev = null;
        var p = null;
        var res = e.frameState.viewState.resolution;
        for (var i=0, f; f = features[i]; i++) {
          var c = f.getGeometry().getClosestPoint(e.coordinate);
          if ( dist2D(c, e.coordinate) / res < this.snapDistance_) {
            // Intersection on 2 lines
            if (prev) {
              var c2 = getIntersectionPoint(prev.getGeometry().getCoordinates(),  f.getGeometry().getCoordinates());
              if (c2) {
                if (dist2D(c2, e.coordinate) / res < this.snapDistance_) {
                  p = c2;
                }
              }
            } else {
              p = c;
            }
            prev = f;
          }
        }
        if (p) e.coordinate = p;
      }
      return true;
    }
  });
};
ol_ext_inherits(ol_interaction_SnapGuides, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_SnapGuides.prototype.setMap = function(map) {
  if (this.getMap()) this.getMap().removeLayer(this.overlayLayer_);
  ol_interaction_Interaction.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
  if (map) this.projExtent_ = map.getView().getProjection().getExtent();
};

/** Activate or deactivate the interaction.
 * @param {boolean} active
 */
ol_interaction_SnapGuides.prototype.setActive = function(active) {
  this.overlayLayer_.setVisible(active);
  ol_interaction_Interaction.prototype.setActive.call (this, active);
}

/** Clear previous added guidelines
 * @param {Array<ol.Feature> | undefined} features a list of feature to remove, default remove all feature
 */
ol_interaction_SnapGuides.prototype.clearGuides = function(features) {
  if (!features) {
    this.overlaySource_.clear();
  } else {
    for (var i=0, f; f=features[i]; i++) {
      try {
        this.overlaySource_.removeFeature(f);
      } catch(e) {/* nothing to to */}
    }
  }
};

/** Get guidelines
 * @return {ol.Collection} guidelines features
 */
ol_interaction_SnapGuides.prototype.getGuides = function() {
  return this.overlaySource_.getFeaturesCollection();
}

/** Add a new guide to snap to
 * @param {Array<ol.coordinate>} v the direction vector
 * @return {ol.Feature} feature guide
 */
ol_interaction_SnapGuides.prototype.addGuide = function(v, ortho) {
  if (v) {
    var map = this.getMap();
    // Limit extent
    var extent = map.getView().calculateExtent(map.getSize());

    var guideLength = Math.max(
      this.projExtent_[2] - this.projExtent_[0],
      this.projExtent_[3] - this.projExtent_[1]
    );

    extent = ol_extent_buffer(extent, guideLength * 1.5);
    //extent = ol_extent_boundingExtent(extent, this.projExtent_);
    if (extent[0]<this.projExtent_[0]) extent[0]=this.projExtent_[0];
    if (extent[1]<this.projExtent_[1]) extent[1]=this.projExtent_[1];
    if (extent[2]>this.projExtent_[2]) extent[2]=this.projExtent_[2];
    if (extent[3]>this.projExtent_[3]) extent[3]=this.projExtent_[3];

    var dx = v[0][0] - v[1][0];
    var dy = v[0][1] - v[1][1];
    var d = 1 / Math.sqrt(dx*dx+dy*dy);

    var generateLine = function(loopDir) {
      var p, g = [];
      var loopCond = guideLength*loopDir*2;
      for (var i=0; loopDir > 0 ? i < loopCond : i > loopCond; i+=(guideLength * loopDir) / 100) {
        if (ortho) p = [ v[0][0] + dy*d*i, v[0][1] - dx*d*i];
        else p = [ v[0][0] + dx*d*i, v[0][1] + dy*d*i];
        if (ol_extent_containsCoordinate(extent, p)) g.push(p);
        else break;
      }
      return new ol_Feature(new ol_geom_LineString([g[0], g[g.length-1]]));
    }

    var f0 = generateLine(1);
    var f1 = generateLine(-1);
    this.overlaySource_.addFeature(f0);
    this.overlaySource_.addFeature(f1);
    return [f0, f1];
  }
};

/** Add a new orthogonal guide to snap to
 * @param {Array<ol.coordinate>} v the direction vector
 * @return {ol.Feature} feature guide
 */
ol_interaction_SnapGuides.prototype.addOrthoGuide = function(v) {
  return this.addGuide(v, true);
};

/** Listen to draw event to add orthogonal guidelines on the first and last point.
 * @param {_ol_interaction_Draw_} drawi a draw interaction to listen to
 * @api
 */
ol_interaction_SnapGuides.prototype.setDrawInteraction = function(drawi) {
  var self = this;
  // Number of points currently drawing
  var nb = 0;
  // Current guidelines
  var features = [];
  function setGuides(e) {
    var coord = e.target.getCoordinates();
    var s = 2;
    switch (e.target.getType()) {
      case 'Point':
        return;
      case 'Polygon':
        coord = coord[0].slice(0, -1);
        break;
      default: break;
    }

    var l = coord.length;
    if (l === s && self.enableInitialGuides_) {
      var x = coord[0][0];
      var y = coord[0][1];
      coord = [[x, y], [x, y - 1]];
    }
    if (l != nb && (self.enableInitialGuides_ ? l >= s : l > s)) {
      self.clearGuides(features);
      // use try catch to remove a bug on freehand draw...
      try {
        var p1 = coord[l - s], p2 = coord[l - s - 1];
        if (l > s && !(p1[0] === p2[0] && p1[1] === p2[1])) {
          features = self.addOrthoGuide([coord[l - s], coord[l - s - 1]]);
        }
        features = features.concat(self.addGuide([coord[0], coord[1]]));
        features = features.concat(self.addOrthoGuide([coord[0], coord[1]]));
        nb = l;
      } catch (e) { /* ok*/ }
    }
  }
  // New drawing
  drawi.on ("drawstart", function(e) {
    // When geom is changing add a new orthogonal direction 
    e.feature.getGeometry().on("change", setGuides);
  });
  // end drawing / deactivate => clear directions
  drawi.on (["drawend", "change:active"], function(e) {
    self.clearGuides(features);
    if (e.feature) e.feature.getGeometry().un("change", setGuides);
    nb = 0;
    features = [];
  });
};

/** Listen to modify event to add orthogonal guidelines relative to the currently dragged point
 * @param {_ol_interaction_Modify_} modifyi a modify interaction to listen to
 * @api
 */
ol_interaction_SnapGuides.prototype.setModifyInteraction = function (modifyi) {
  function mod(d, n) {
    return ((d % n) + n) % n;
  }

  var self = this;
  // Current guidelines
  var features = [];

  function computeGuides(e) {
    const selectedVertex = e.target.vertexFeature_
    if (!selectedVertex) return;
    var f = e.target.getModifiedFeatures()[0];
    var geom = f.getGeometry();

    var coord = geom.getCoordinates();
    switch (geom.getType()) {
      case 'Point':
        return;
      case 'Polygon':
        coord = coord[0].slice(0, -1);
        break;
      default: break;
    }

    var modifyVertex = selectedVertex.getGeometry().getCoordinates();
    var idx = coord.findIndex(function(c) {
      return c[0] === modifyVertex[0] && c[1] === modifyVertex[1]
    });

    var l = coord.length;

    self.clearGuides(features);
    features = self.addOrthoGuide([coord[mod(idx - 1, l)], coord[mod(idx - 2, l)]]);
    features = features.concat(self.addGuide([coord[mod(idx - 1, l)], coord[mod(idx - 2, l)]]));
    features = features.concat(self.addGuide([coord[mod(idx + 1, l)], coord[mod(idx + 2, l)]]));
    features = features.concat(self.addOrthoGuide([coord[mod(idx + 1, l)], coord[mod(idx + 2, l)]]));
  }

  function setGuides(e) {
    // This callback is called before ol adds the vertex to the feature, so
    // defer a moment for openlayers to add the new vertex
    setTimeout(computeGuides, 0, e);
  }


  function drawEnd() {
    self.clearGuides(features);
    features = [];
  }

  // New drawing
  modifyi.on("modifystart", setGuides);
  // end drawing, clear directions
  modifyi.on("modifyend", drawEnd);
};

export default ol_interaction_SnapGuides
