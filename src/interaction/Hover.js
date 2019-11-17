import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'

/** Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires hover, enter, leave
 * @param {olx.interaction.HoverOptions} 
 *  @param { string | undefined } options.cursor css cursor propertie or a function that gets a feature, default: none
 *  @param {function | undefined} optionsfeatureFilter filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature 
 *  @param {function | undefined} options.layerFilter filter a function with one argument, the layer to test. Return true to test the layer
 *  @param {Array<ol.layer> | undefined} options.layers a set of layers to test
 *  @param {number | undefined} options.hitTolerance Hit-detection tolerance in pixels.
 *  @param { function | undefined } options.handleEvent Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
var ol_interaction_Hover = function(options) {
  if (!options) options={};
  var self = this;

  ol_interaction_Interaction.call(this, {
    handleEvent: function(e) {
      if (e.type=="pointermove") { self.handleMove_(e); } 
      if (options.handleEvent) return options.handleEvent(e);
      return true; 
    }
  });

  if (options.layers && options.layers.length) {
    this.setFeatureFilter(function(f, l) {
      return (options.layers.indexOf(l) >= 0);
    })
  } else {
    this.setFeatureFilter (options.featureFilter);
  }
  this.setLayerFilter (options.layerFilter);
  this.set('hitTolerance', options.hitTolerance)
  this.setCursor (options.cursor);
};
ol_ext_inherits(ol_interaction_Hover, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_interaction_Hover.prototype.setMap = function(map) {
  if (this.previousCursor_!==undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  ol_interaction_Interaction.prototype.setMap.call (this, map);
};

/**
 * Set cursor on hover
 * @param { string } cursor css cursor propertie or a function that gets a feature, default: none
 * @api stable
 */
ol_interaction_Hover.prototype.setCursor = function(cursor) {
  if (!cursor && this.previousCursor_!==undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  this.cursor_ = cursor;
};

/** Feature filter to get only one feature
* @param {function} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature 
*/
ol_interaction_Hover.prototype.setFeatureFilter = function(filter) {
  if (typeof (filter) == 'function') this.featureFilter_ = filter;
  else this.featureFilter_ = function(){ return true; };
};

/** Feature filter to get only one feature
* @param {function} filter a function with one argument, the layer to test. Return true to test the layer
*/
ol_interaction_Hover.prototype.setLayerFilter = function(filter) {
  if (typeof (filter) == 'function') this.layerFilter_ = filter;
  else this.layerFilter_ = function(){ return true; };
};

/** Get features whenmove
* @param {ol.event} e "move" event
*/
ol_interaction_Hover.prototype.handleMove_ = function(e) {
  var map = this.getMap();
  if (map) {
    //var b = map.hasFeatureAtPixel(e.pixel);
    var feature, layer;
    var self = this;
    var b = map.forEachFeatureAtPixel(
      e.pixel, 
      function(f, l) {
        if (self.layerFilter_.call(null, l) 
        && self.featureFilter_.call(null,f,l)) {
          feature = f;
          layer = l;
          return true;
        } else {
          feature = layer = null;
          return false;
        }
      },{ 
        hitTolerance: this.get('hitTolerance') 
      }
    );

    if (b) this.dispatchEvent({ 
      type: 'hover', 
      feature: feature, 
      layer: layer, 
      coordinate: e.coordinate, 
      pixel: e.pixel, 
      map: e.map, 
      dragging: e.dragging 
    });

    if (this.feature_===feature && this.layer_===layer){
      /* ok */
    } else {
      this.feature_ = feature;
      this.layer_ = layer;
      if (feature) {
        this.dispatchEvent({ 
          type: 'enter', 
          feature: feature, 
          layer: layer, 
          coordinate: e.coordinate, 
          pixel: e.pixel, 
          map: e.map, 
          dragging: e.dragging 
        });
      } else {
        this.dispatchEvent({ 
          type: 'leave', 
          coordinate: e.coordinate, 
          pixel: e.pixel, 
          map: e.map, 
          dragging: e.dragging 
        });
      }
    }

    if (this.cursor_) {
      var style = map.getTargetElement().style;
      if (b) {
        if (style.cursor != this.cursor_) {
          this.previousCursor_ = style.cursor;
          style.cursor = this.cursor_;
        }
      } else if (this.previousCursor_ !== undefined) {
        style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
      }
    }
  }
};

export default ol_interaction_Hover
