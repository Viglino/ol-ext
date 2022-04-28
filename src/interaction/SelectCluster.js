/*
  Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (http://www.cecill.info/).
  
  ol/interaction/SelectCluster is an interaction for selecting vector features in a cluster.
*/

import ol_ext_inherits from '../util/ext'
import ol_Map from 'ol/Map'
import ol_Collection from 'ol/Collection'
import ol_layer_Vector from 'ol/layer/Vector'
import ol_source_Vector from 'ol/source/Vector'
import ol_interaction_Select from 'ol/interaction/Select'
import ol_Feature from 'ol/Feature'
import ol_geom_LineString from 'ol/geom/LineString'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import {easeOut as ol_easing_easeOut} from 'ol/easing'
import ol_geom_Point from 'ol/geom/Point'
import ol_style_Style from 'ol/style/Style'
import ol_style_Circle from 'ol/style/Circle'
import ol_render_getVectorContext from '../util/getVectorContext';
import { createEmpty as ol_extent_createEmpty } from 'ol/extent'
import { extend as ol_extent_extend } from 'ol/extent'
import { singleClick as ol_events_condition_singleClick } from 'ol/events/condition';

/**
 * @classdesc
 * Interaction for selecting vector features in a cluster. 
 * It can be used as an ol.interaction.Select. 
 * When clicking on a cluster, it springs apart to reveal the features in the cluster.
 * Revealed features are selectable and you can pick the one you meant.
 * Revealed features are themselves a cluster with an attribute features that contain the original feature.
 * 
 * @constructor
 * @extends {ol.interaction.Select}
 * @param {olx.interaction.SelectOptions=} options SelectOptions.
 *  @param {ol.style} options.featureStyle used to style the revealed features as options.style is used by the Select interaction.
 * 	@param {boolean} options.selectCluster false if you don't want to get cluster selected
 * 	@param {Number} options.pointRadius to calculate distance between the features
 * 	@param {bool} options.spiral means you want the feature to be placed on a spiral (or a circle)
 * 	@param {Number} options.circleMaxObjects number of object that can be place on a circle
 * 	@param {Number} options.maxObjects number of object that can be drawn, other are hidden
 * 	@param {bool} options.animate if the cluster will animate when features spread out, default is false
 * 	@param {Number} options.animationDuration animation duration in ms, default is 500ms
 * 	@param {boolean} options.autoClose if selecting a cluster should close previously selected clusters. False to get toggle feature. Default is true
 * @fires ol.interaction.SelectEvent
 * @api stable
 */
var ol_interaction_SelectCluster = function(options) {
  options = options || {};

  this.pointRadius = options.pointRadius || 12;
  this.circleMaxObjects = options.circleMaxObjects || 10;
  this.maxObjects = options.maxObjects || 60;
  this.spiral = (options.spiral !== false);
  this.animate = options.animate;
  this.animationDuration = options.animationDuration || 500;
  this.selectCluster_ = (options.selectCluster !== false);
  this._autoClose = (options.autoClose !== false)

  // Create a new overlay layer for 
  var overlay = this.overlayLayer_ = new ol_layer_Vector({
    source: new ol_source_Vector({
      features: new ol_Collection(),
      wrapX: options.wrapX,
      useSpatialIndex: true
    }),
    name:'Cluster overlay',
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    displayInLayerSwitcher: false,
    style: options.featureStyle
  });

  // Add the overlay to selection
  if (options.layers) {
    if (typeof(options.layers) == "function") {
      var fnLayers = options.layers;
      options.layers = function(layer) {
        return (layer===overlay || fnLayers(layer));
      };
    } else if (options.layers.push) {
      options.layers.push(this.overlayLayer_);
    }
  }

  // Don't select links
  if (options.filter) {
    var fnFilter = options.filter;
    options.filter = function(f,l){
      //if (l===overlay && f.get("selectclusterlink")) return false;
      if (!l && f.get("selectclusterlink")) return false;
      else return fnFilter(f,l);
    };
  } else options.filter = function(f,l) {
    //if (l===overlay && f.get("selectclusterlink")) return false; 
    if (!l && f.get("selectclusterlink")) return false; 
    else return true;
  };
  this.filter_ = options.filter;

  if (!this._autoClose && !options.toggleCondition) {
    options.toggleCondition = ol_events_condition_singleClick;
  }

  ol_interaction_Select.call(this, options);
  this.on("select", this.selectCluster.bind(this));
};

ol_ext_inherits(ol_interaction_SelectCluster, ol_interaction_Select);


/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_SelectCluster.prototype.setMap = function(map) {
  if (this.getMap()) {
    this.getMap().removeLayer(this.overlayLayer_);
  }
  if (this._listener) ol_Observable_unByKey(this._listener);
  this._listener = null;

  ol_interaction_Select.prototype.setMap.call (this, map);
  this.overlayLayer_.setMap(map);
  // map.addLayer(this.overlayLayer_);

  if (map && map.getView()) {
    this._listener = map.getView().on('change:resolution', this.clear.bind(this));
  }
};

/**
 * Clear the selection, close the cluster and remove revealed features
 * @api stable
 */
ol_interaction_SelectCluster.prototype.clear = function() {
  this.getFeatures().clear();
  this.overlayLayer_.getSource().clear();
};

/**
 * Get the layer for the revealed features
 * @api stable
 */
ol_interaction_SelectCluster.prototype.getLayer = function() {
  return this.overlayLayer_;
};

/**
 * Select a cluster 
 * @param {ol.SelectEvent | ol.Feature} a cluster feature ie. a feature with a 'features' attribute.
 * @api stable
 */
ol_interaction_SelectCluster.prototype.selectCluster = function (e) {
  // It's a feature => convert to SelectEvent
  if (e instanceof ol_Feature) {
    e = { selected: [e] };
  }
  // Nothing selected
  if (!e.selected.length) {
    if (this._autoClose) {
      this.clear();
    } else {
      var deselectedFeatures = e.deselected;
      deselectedFeatures.forEach(deselectedFeature => {
        var selectClusterFeatures = deselectedFeature.get('selectcluserfeatures');
        if (selectClusterFeatures) {
          selectClusterFeatures.forEach(selectClusterFeature => {
            this.overlayLayer_.getSource().removeFeature(selectClusterFeature);
          });
        }
      });
    }
    return;
  }

  // Get selection
  var feature = e.selected[0];
  // It's one of ours
  if (feature.get('selectclusterfeature')) return;

  // Clic out of the cluster => close it
  var source = this.overlayLayer_.getSource();
  if (this._autoClose) {
    source.clear();
  }

  var cluster = feature.get('features');
  // Not a cluster (or just one feature)
  if (!cluster || cluster.length==1) return;

  // Remove cluster from selection
  if (!this.selectCluster_) this.getFeatures().clear();

  var center = feature.getGeometry().getCoordinates();
  // Pixel size in map unit
  var pix = this.getMap().getView().getResolution();
  var r, a, i, max;
  var p, cf, lk;

  // The features
  var features = [];

  // Draw on a circle
  if (!this.spiral || cluster.length <= this.circleMaxObjects) {
    max = Math.min(cluster.length, this.circleMaxObjects);
    r = pix * this.pointRadius * (0.5 + max / 4);
    for (i=0; i<max; i++) {
      a = 2*Math.PI*i/max;
      if (max==2 || max == 4) a += Math.PI/4;
      p = [ center[0]+r*Math.sin(a), center[1]+r*Math.cos(a) ];
      cf = new ol_Feature({ 'selectclusterfeature':true, 'features':[cluster[i]], geometry: new ol_geom_Point(p) });
      cf.setStyle(cluster[i].getStyle());
      features.push(cf);
      lk = new ol_Feature({ 'selectclusterlink':true, geometry: new ol_geom_LineString([center,p]) });
      features.push(lk);
    }
  }
  // Draw on a spiral
  else {
    // Start angle
    a = 0;
    var d = 2*this.pointRadius;
    max = Math.min (this.maxObjects, cluster.length);
    // Feature on a spiral
    for (i=0; i<max; i++) {
      // New radius => increase d in one turn
      r = d/2 + d*a/(2*Math.PI);
      // Angle
      a = a + (d+0.1)/r;
      var dx = pix*r*Math.sin(a)
      var dy = pix*r*Math.cos(a)
      p = [ center[0]+dx, center[1]+dy ];
      cf = new ol_Feature({ 'selectclusterfeature':true, 'features':[cluster[i]], geometry: new ol_geom_Point(p) });
      cf.setStyle(cluster[i].getStyle()); 
      features.push(cf);
      lk = new ol_Feature({ 'selectclusterlink':true, geometry: new ol_geom_LineString([center,p]) });
      features.push(lk);
    }
  }

  feature.set('selectcluserfeatures', features);
  if (this.animate) {
    this.animateCluster_(center, features);
  } else {
    source.addFeatures(features);
  }
};

/**
 * Animate the cluster and spread out the features
 * @param {ol.Coordinates} the center of the cluster
 */
ol_interaction_SelectCluster.prototype.animateCluster_ = function(center, features) {
  // Stop animation (if one is running)
  if (this.listenerKey_) {
    ol_Observable_unByKey(this.listenerKey_);
  }
  
  // Features to animate
  // var features = this.overlayLayer_.getSource().getFeatures();
  if (!features.length) return;
  
  var style = this.overlayLayer_.getStyle();
  var stylefn = (typeof(style) == 'function') ? style : style.length ? function(){ return style; } : function(){ return [style]; } ;
  var duration = this.animationDuration || 500;
  var start = new Date().getTime();
  
  // Animate function
  function animate(event) {
    var vectorContext = event.vectorContext || ol_render_getVectorContext(event);
    // Retina device
    var ratio = event.frameState.pixelRatio;
    var res = this.getMap().getView().getResolution();
    var e = ol_easing_easeOut((event.frameState.time - start) / duration);
    for (var i=0, feature; feature = features[i]; i++) if (feature.get('features')) {
      var pt = feature.getGeometry().getCoordinates();
      pt[0] = center[0] + e * (pt[0]-center[0]);
      pt[1] = center[1] + e * (pt[1]-center[1]);
      var geo = new ol_geom_Point(pt);
      // Image style
      var st = stylefn(feature, res);
      for (var s=0; s<st.length; s++) {
        var sc;
        // OL < v4.3 : setImageStyle doesn't check retina
        var imgs = ol_Map.prototype.getFeaturesAtPixel ? false : st[s].getImage();
        if (imgs) {
          sc = imgs.getScale();
          imgs.setScale(ratio); 
        }
        // OL3 > v3.14
        if (vectorContext.setStyle) {
          vectorContext.setStyle(st[s]);
          vectorContext.drawGeometry(geo);
        }
        // older version
        else {
          vectorContext.setImageStyle(imgs);
          vectorContext.drawPointGeometry(geo);
        }
        if (imgs) imgs.setScale(sc);
      }
    }
    // Stop animation and restore cluster visibility
    if (e > 1.0) {
      ol_Observable_unByKey(this.listenerKey_);
      this.overlayLayer_.getSource().addFeatures(features);
      this.overlayLayer_.changed();
      return;
    }

    
    // tell OL3 to continue postcompose animation
    event.frameState.animate = true;
  }

  // Start a new postcompose animation
  this.listenerKey_ = this.overlayLayer_.on(['postcompose','postrender'], animate.bind(this));
  // Start animation with a ghost feature
  var feature = new ol_Feature(new ol_geom_Point(this.getMap().getView().getCenter()));
  feature.setStyle(new ol_style_Style({ image: new ol_style_Circle({}) }));
  this.overlayLayer_.getSource().addFeature(feature);
};


/** Helper function to get the extent of a cluster
 * @param {ol.feature} feature
 * @return {ol.extent|null} the extent or null if extent is empty (no cluster or superimposed points)
 */
ol_interaction_SelectCluster.prototype.getClusterExtent = function(feature) {
  if (!feature.get('features')) return null;
  var extent = ol_extent_createEmpty();
  feature.get('features').forEach(function(f) {
    extent = ol_extent_extend(extent, f.getGeometry().getExtent());
  });
  if (extent[0]===extent[2] && extent[1]===extent[3]) return null;
  return extent;
};

export default ol_interaction_SelectCluster
