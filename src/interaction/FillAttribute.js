import ol_ext_inherits from '../util/ext'
import ol_interaction_Select from 'ol/interaction/Select'
import {click as ol_events_condition_click} from 'ol/events/condition'

/** A Select interaction to fill feature's properties on click.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires setattributestart
 * @fires setattributeend
 * @param {*} options extentol.interaction.Select options
 *  @param {boolean} options.active activate the interaction on start, default true
 *  @param {string=} options.name 
 *  @param {boolean|string} options.cursor interaction cursor if false use default, default use a paint bucket cursor
 * @param {*} properties The properties as key/value
 */
var ol_interaction_FillAttribute = function(options, properties) {
  options = options || {};

  if (!options.condition) options.condition = ol_events_condition_click;
  ol_interaction_Select.call(this, options);
  this.setActive(options.active!==false)
  this.set('name', options.name);

  this._attributes = properties;
  this.on('select', function(e) {
    this.getFeatures().clear();
    this.fill(e.selected, this._attributes);
  }.bind(this));

  if (options.cursor === undefined) {
    var canvas = document.createElement('CANVAS');
    canvas.width = canvas.height = 32;
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
      ctx.moveTo(9,3);
      ctx.lineTo(2,9);
      ctx.lineTo(10,17);
      ctx.lineTo(17,11);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
      ctx.moveTo(6,4);
      ctx.lineTo(0,8);
      ctx.lineTo(0,13);
      ctx.lineTo(3,17);
      ctx.lineTo(3,8);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.stroke();

    ctx.moveTo(8,8);
    ctx.lineTo(10,0);
    ctx.lineTo(11,0);
    ctx.lineTo(13,3);
    ctx.lineTo(13,7);
    ctx.stroke();

    this._cursor = 'url('+canvas.toDataURL()+') 0 13, auto';
  }
  if (options.cursor) {
    this._cursor = options.cursor;
  }
};
ol_ext_inherits(ol_interaction_FillAttribute, ol_interaction_Select);

/** Define the interaction cursor
 * @param {string} cursor CSS cursor
 */
ol_interaction_FillAttribute.prototype.setCursor = function(cursor) {
  this._cursor = cursor;
};

/** Get the interaction cursor
 * @return {string} cursor
 */
ol_interaction_FillAttribute.prototype.getCursor = function() {
  return this._cursor;
};

/** Activate the interaction
 * @param {boolean} active
 */
ol_interaction_FillAttribute.prototype.setActive = function(active) {
  if(active === this.getActive()) return;
  ol_interaction_Select.prototype.setActive.call(this, active);
  if (this.getMap() && this._cursor) {
    if (active) {
      this._previousCursor = this.getMap().getTargetElement().style.cursor;
      this.getMap().getTargetElement().style.cursor = this._cursor;
//      console.log('setCursor',this._cursor)
    } else {
      this.getMap().getTargetElement().style.cursor = this._previousCursor;
      this._previousCursor = undefined;
    }
  }
};

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
ol_interaction_FillAttribute.prototype.getAttributes = function() {
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
    // Test changes
    var changes = false;
    for (var i=0, f; f = features[i]; i++) {
      for (var p in properties) {
        if (f.get(p) !== properties[p]) changes = true;
      }
      if (changes) break;
    }

    // Set Attributes
    if (changes) {
      this.dispatchEvent({ 
        type: 'setattributestart', 
        features: features, 
        properties: properties 
      });
  
      features.forEach(function(f) {
        for (var p in properties) {
          f.set(p, properties[p]);
        }
      });
  
      this.dispatchEvent({ 
        type: 'setattributeend', 
        features: features, 
        properties: properties 
      });
    }
  }
};

export default ol_interaction_FillAttribute