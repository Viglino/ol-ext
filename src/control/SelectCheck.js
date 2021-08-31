/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_SelectBase from './SelectBase'
import ol_ext_element from '../util/element'

/**
 * Select features by property using a popup 
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {string} options.label control label
 *  @param {number} options.max max feature to test to get the values, default 10000
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {string} options.type check type: checkbox or radio, default checkbox
 *  @param {number} options.defaultLabel label for the default radio button
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
var ol_control_SelectCheck = function(options) {
  if (!options) options = {};

  // Container
  var div = options.content = ol_ext_element.create('DIV');
  if (options.label) {
    ol_ext_element.create('LABEL', {
      html: options.label,
      parent: div
    });
  }
  // Input div
  this._input = ol_ext_element.create('DIV', {
    parent: div
  });
  
  options.className = options.className || 'ol-select-check';
  ol_control_SelectBase.call(this, options);

  this.set('property', options.property || 'name');
  this.set('max', options.max || 10000);
  this.set('defaultLabel', options.defaultLabel);
  this.set('type', options.type);
  this._selectAll = options.selectAll;
  this._onchoice = options.onchoice;

  // Set select options
  if (options.values) {
    this.setValues({ values: options.values, sort: true });
  } else {
    this.setValues();
  }
};
ol_ext_inherits(ol_control_SelectCheck, ol_control_SelectBase);

/**
* Set the map instance the control associated with.
* @param {o.Map} map The map instance.
*/
ol_control_SelectCheck.prototype.setMap = function(map) {
  ol_control_SelectBase.prototype.setMap.call(this, map);
  this.setValues();
};

/** Select features by attributes
 */
ol_control_SelectCheck.prototype.doSelect = function(options) {
  console.log('select')
  options = options || {};
  var conditions = [];
  this._checks.forEach(function(c) {
    if (c.checked) {
      if (c.value) {
        conditions.push({
          attr: this.get('property'),
          op: '=',
          val: c.value
        });
      }
    }
  }.bind(this));
  if (!conditions.length) {
    return ol_control_SelectBase.prototype.doSelect.call(this, { 
      features: options.features, 
      matchAll: this._selectAll 
    });
  } else {
    return ol_control_SelectBase.prototype.doSelect.call(this, {
      features: options.features, 
      conditions: conditions
    })
  }
};

/** Set the popup values
 * @param {Object} options
 *  @param {Object} options.values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
 *  @param {boolean} options.sort sort values
 */
ol_control_SelectCheck.prototype.setValues = function(options) {
  options = options || {};
  var values, vals;
  if (options.values) {
    if (options.values instanceof Array) {
      vals = {};
      options.values.forEach(function(v) { vals[v] = v; });
    } else {
      vals = options.values;
    }
  } else {
    vals = {};
    var prop = this.get('property');
    this.getSources().forEach(function(s){
      var features = s.getFeatures();
      var max = Math.min(features.length, this.get('max'))
      for (var i=0; i<max; i++) {
        var p = features[i].get(prop);
        if (p) vals[p] = p;
      }
    }.bind(this));
  }
  if (!Object.keys(vals).length) return;
  if (options.sort) {
    values = {};
    Object.keys(vals).sort().forEach(function(key) {
      values[key] = vals[key];
    });
  } else {
    values = vals;
  }
  ol_ext_element.setHTML(this._input, '');
  this._checks = [];
  var id = 'radio_'+(new Date().getTime());
  var addCheck = function(val, info) {
    this._checks.push( ol_ext_element.createCheck({
      after: info,
      name: id,
      val: val,
      type: this.get('type'),
      change: function () { 
        if (this._onchoice) this._onchoice()
        else this.doSelect();
      }.bind(this),
      parent: this._input
    }));
  }.bind(this);
  if (this.get('defaultLabel') && this.get('type')==='radio') {
    addCheck('', this.get('defaultLabel'));
  }
  for (var k in values) addCheck(k, values[k]);
};

export default ol_control_SelectCheck
