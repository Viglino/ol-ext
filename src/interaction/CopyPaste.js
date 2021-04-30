import ol_ext_inherits from '../util/ext'
import ol_Collection from 'ol/Collection'
import ol_interaction_CurrentMap from './CurrentMap';

/** An interaction to copy/paste features on a map. 
 * It will fire a 'focus' event on the map when map is focused (use mapCondition option to handle the condition when the map is focused).
 * @constructor
 * @fires focus
 * @fires copy
 * @fires paste
 * @extends {ol_interaction_Interaction}
 * @param {Object} options Options
 *  @param {function} options.condition a function that takes a mapBrowserEvent and return the action to perform: 'copy', 'cut' or 'paste', default Ctrl+C / Ctrl+V
 *  @param {function} options.mapCondition a function that takes a mapBrowserEvent and return true if the map is the active map, default always returns true
 *  @param {ol.Collection<ol.Feature>} options.features list of features to copy
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.sources the source to copy from (used for cut), if not defined, it will use the destination
 *  @param {ol.source.Vector} options.destination the source to copy to
 */
var ol_interaction_CopyPaste = function(options) {
  options = options || {};
  
  // Features to copy
  this.features = [];
  this._cloneFeature = true;
  
  var condition = options.condition;
  if (typeof (condition) !== 'function') {
    condition = function (e) {
      if (e.originalEvent.ctrlKey) {
        if (/^c$/i.test(e.originalEvent.key)) return 'copy';
        if (/^x$/i.test(e.originalEvent.key)) return 'cut';
        if (/^v$/i.test(e.originalEvent.key)) return 'paste';
      }
      return false;
    }
  }

  this._featuresSource = options.features || new ol_Collection();
  this.setSources(options.sources);
  this.setDestination(options.destination);
  
  // Create intreaction
  ol_interaction_CurrentMap.call(this, {
    condition: options.mapCondition,
    onKeyDown: function (e) {
      switch (condition(e)) {
        case 'copy': {
          this.copy({ silent: false });
          break;
        }
        case 'cut': {
          this.copy({ cut: true, silent: false });
          break;
        }
        case 'paste': {
          this.paste({ silent: false });
          break;
        }
        default: break;
      }
    }.bind(this)
  });
};
ol_ext_inherits(ol_interaction_CopyPaste, ol_interaction_CurrentMap);

/** Sources to cut feature from
 * @param { ol.source.Vector | Array<ol.source.Vector> } sources
 */
ol_interaction_CopyPaste.prototype.setSources = function (sources) {
  if (sources) {
    this._source = [];
    this._source = sources instanceof Array ? sources : [sources];
  } else {
    this._source = null;
  }
};
/** Get sources to cut feature from
 * @return { Array<ol.source.Vector> } 
 */
ol_interaction_CopyPaste.prototype.getSources = function () {
  return this._source;
};

/** Source to paste features
 * @param { ol.source.Vector } source
 */
ol_interaction_CopyPaste.prototype.setDestination = function (destination) {
  this._destination = destination;
};

/** Get source to paste features
 * @param { ol.source.Vector } 
 */
ol_interaction_CopyPaste.prototype.getDestination = function () {
  return this._destination;
};

/** Get current feature to copy
 * @return {Array<ol.Feature>}
 */
ol_interaction_CopyPaste.prototype.getFeatures = function() {
  return this.features;
};

/** Set current feature to copy
 * @param {Object} options
 *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} options.features feature to copy, default get in the provided collection
 *  @param {boolean} options.cut try to cut feature from the sources, default false
 *  @param {boolean} options.silent true to send an event, default true
 */
ol_interaction_CopyPaste.prototype.copy = function (options) {
  options = options || {};
  var features = options.features || this._featuresSource.getArray();
  // Try to remove feature from sources
  if (options.cut) {
    var sources = this._source || [this._destination];
    // Remove feature from sources
    features.forEach(function(f) {
      sources.forEach(function(source) {
        try {
          source.removeFeature(f);
        } catch(e) {/*ok*/}
      });
    });
  }
  if (this._cloneFeature) {
    this.features = [];
    features.forEach(function(f) {
      this.features.push(f.clone());
    }.bind(this));
  } else {
    this.features = features;
  }
  // Send an event
  if (options.silent===false) this.dispatchEvent({ type: options.cut ? 'cut' : 'copy', time: (new Date).getTime() });
};

/** Paste features
 * @param {Object} options
 *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} features feature to copy, default get current features
 *  @param {ol.source.Vector} options.destination Source to paste to, default the current source
 *  @param {boolean} options.silent true to send an event, default true
 */
ol_interaction_CopyPaste.prototype.paste = function(options) {
  options = options || {};
  var features = options.features || this.features;
  if (features) {
    var destination = options.destination || this._destination;
    if (destination) {
      destination.addFeatures(this.features);
      if (this._cloneFeature) this.copy({ features: this.features });
    }
  }
  // Send an event
  if (options.silent===false) this.dispatchEvent({ type:'paste', features: features, time: (new Date).getTime() });
};

export default ol_interaction_CopyPaste
