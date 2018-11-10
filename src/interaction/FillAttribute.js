import ol_interaction_Select from 'ol/interaction/Select'
import {click as ol_events_condition_click} from 'ol/events/condition'

/** A Select interaction to fill feature's properties on click.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires setattributestart
 * @fires setattributeend
 * @param {*} options ol.interaction.Select options
 * @param {*} properties The properties as key/value
 */
var ol_interaction_FillAttribute = function(options, properties) {
  options = options || {};

  if (!options.condition) options.condition = ol_events_condition_click;
  ol_interaction_Select.call(this, options);

  this._attributes = properties;
  this.on('select', function(e) {
    this.getFeatures().clear();
    this.fill(e.selected, this._attributes);
  }.bind(this));
};
ol_inherits(ol_interaction_FillAttribute, ol_interaction_Select);

/** Set attributes
 * @param {*} properties The properties as key/value
 */
ol_interaction_FillAttribute.prototype.setAttributes = function(properties) {
  this._attributes = properties;
};

/** Set an attribute
 * @param {string} key 
 * @param {*} val 
 */
ol_interaction_FillAttribute.prototype.setAttribute = function(key, val) {
  this._attributes[key] = val;
};

/** get attributes
 * @return {*} The properties as key/value
 */
ol_interaction_FillAttribute.prototype.getAttributes = function(properties) {
  return this._attributes;
};

/** Get an attribute
 * @param {string} key 
 * @return {*} val 
 */
ol_interaction_FillAttribute.prototype.getAttribute = function(key) {
  return this._attributes[key];
};

/** Fill feature attributes
 * @param {Array<ol.Feature>} features The features to modify
 * @param {*} properties The properties as key/value
 */
ol_interaction_FillAttribute.prototype.fill = function(features, properties) {
  if (features.length && properties) {
    this.dispatchEvent({ type: 'setattributestart', features: features, properties: properties });

    features.forEach(function(f) {
      for (var p in properties) {
        f.set(p, properties[p]);
      }
    });

    this.dispatchEvent({ type: 'setattributeend', features: features, properties: properties });
  }
};

export default ol_interaction_FillAttribute