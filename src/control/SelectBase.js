/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import ol_Collection from 'ol/Collection'
import ol_source_Vector from 'ol/source/Vector'
import ol_ext_element from '../util/element'

/**
 * This is the base class for Select controls on attributes values. 
 * Abstract base class; 
 * normally only used for creating subclasses and not instantiated in apps. 
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element} options.content form element
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol.Collection<ol.Feature>} options.features a collection of feature to search in, the collection will be kept in date while selection
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.source the source to search in if no features set
 *  @param {string} options.btInfo ok button label
 */
var ol_control_SelectBase = function(options) {
  if (!options) options = {};
  this._features = this.setFeatures(options.features);

  var element;
  if (options.target) {
    element = document.createElement("div");
  } else {
    element = document.createElement("div");
    element.className = 'ol-select ol-unselectable ol-control ol-collapsed';
    ol_ext_element.create('BUTTON', {
      type: 'button',
      on: {
        'click touchstart': function(e) {
          element.classList.toggle('ol-collapsed');
          e.preventDefault();
        }
      },
      parent: element
    });
  }
  if (options.className) element.classList.add(options.className);

  var content = options.content || ol_ext_element.create('DIV');
  element.appendChild(content);

  // OK button
  ol_ext_element.create('BUTTON', {
    html: options.btInfo || 'OK',
    className: 'ol-ok',
    on: { 'click': this.doSelect.bind(this) },
    parent: content
  });

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  this.setSources(options.source);
};
ol_ext_inherits(ol_control_SelectBase, ol_control_Control);

/** Set the current sources
 * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
 */
ol_control_SelectBase.prototype.setSources = function (source) {
  if (source) {
    this.set ('source', (source instanceof Array) ? source : [source]);
  } else {
    this.unset('source');
  }  
};

/** Set feature collection to search in
 * @param {ol.Collection<ol.Feature>} features
 */
ol_control_SelectBase.prototype.setFeatures = function (features) {
  if (features instanceof ol_Collection) this._features = features;
  else this._features = null;
};

/** Get feature collection to search in
 * @return {ol.Collection<ol.Feature>}
 */
ol_control_SelectBase.prototype.getFeatures = function () {
  return this._features;
};

/** List of operators / translation
 * @api
 */
ol_control_SelectBase.prototype.operationsList = {
  '=': '=',
  '!=': '≠',
  '<': '<',
  '<=': '≤',
  '>=': '≥',
  '>': '>',
  'contain': '⊂', // ∈
  '!contain': '⊄',	// ∉
  'regexp': '≃',
  '!regexp': '≄'
};

/** Escape string for regexp
 * @param {string} search
 * @return {string}
 */
ol_control_SelectBase.prototype._escape = function (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

/**
 * Test if a feature check aconditino
 * @param {ol.Feature} f the feature to check condition
 * @param {Object} condition an object to use for test
 *  @param {string} condition.attr attribute name
 *  @param {string} condition.op operator
 *  @param {any} condition.val value to test
 * @param {boolean} usecase use case or not when testing strings
 * @return {boolean}
 * @private
 */
ol_control_SelectBase.prototype._checkCondition = function (f, condition, usecase) {
  if (!condition.attr) return true;
  var val = f.get(condition.attr);
  // Try to test numeric values
  var isNumber = (Number(val) == val && Number(condition.val) == condition.val);
  if (isNumber) val = Number(val);
  // Check
  var rex;
  switch (condition.op) {
    case '=':
      if (isNumber) {
        return val == condition.val;
      } else {
        rex = new RegExp('^'+this._escape(condition.val)+'$', usecase ? '' : 'i');
        return rex.test(val);
      }
    case '!=':
      if (isNumber) {
        return val != condition.val;
      } else {
        rex = new RegExp('^'+this._escape(condition.val)+'$', usecase ? '' : 'i');
        return !rex.test(val);
      }
    case '<':
      return val < condition.val;
    case '<=':
      return val <= condition.val;
    case '>':
      return val > condition.val;
    case '>=':
      return val >= condition.val;
    case 'contain':
      rex = new RegExp(this._escape(condition.val), usecase ? '' : 'i');
      return rex.test(val);
    case '!contain':
      rex = new RegExp(this._escape(condition.val), usecase ? '' : 'i');
      return !rex.test(val);
    case 'regexp':
      rex = new RegExp(condition.val, usecase ? '' : 'i');
      return rex.test(val);
    case '!regexp':
      rex = new RegExp(condition.val, usecase ? '' : 'i');
      return !rex.test(val);
    default:
      return false;
  }
};

/** Selection features in a list of features
 * @param {Array<ol.Feature>} result the current list of features
 * @param {Array<ol.Feature>} features to test in
 * @param {Object} condition 
 *  @param {string} condition.attr attribute name
 *  @param {string} condition.op operator
 *  @param {any} condition.val value to test
 * @param {boolean} all all conditions must be valid
 * @param {boolean} usecase use case or not when testing strings
 */
ol_control_SelectBase.prototype._selectFeatures = function (result, features, conditions, all, usecase) {
  conditions = conditions || [];
  var f;
  for (var i=features.length-1; f=features[i]; i--) {
    var isok = all;
    for (var k=0, c; c=conditions[k]; k++) {
      if (c.attr) {
        if (all) {
          isok = isok && this._checkCondition(f,c,usecase);
        }
        else {
          isok = isok || this._checkCondition(f,c,usecase);
        }
      }
    }
    if (isok) {
      result.push(f);
    } else if (this._features) {
      this._features.removeAt(i);
    }
  }
  return result;
};

/** Get vector source
 * @return {Array<ol.source.Vector>}
 */
ol_control_SelectBase.prototype.getSources = function () {
  if (this.get('source')) return this.get('source');
  var sources = [];
  function getSources(layers) {
    layers.forEach(function(l){
      if (l.getLayers) {
        getSources(l.getLayers());
      } else if (l.getSource && l.getSource() instanceof ol_source_Vector) {
        sources.push(l.getSource());
      }
    });
  }
  if (this.getMap()) {
    getSources(this.getMap().getLayers());
  }
  return sources;
};

/** Select features by attributes
 * @param {*} options
 *  @param {Array<ol.source.Vector>|undefined} options.sources source to apply rules, default the select sources
 *  @param {bool} options.useCase case sensitive, default false
 *  @param {bool} options.matchAll match all conditions, default false
 *  @param {Array<conditions>} options.conditions array of conditions
 * @return {Array<ol.Feature>}
 * @fires select
 */
ol_control_SelectBase.prototype.doSelect = function (options) {
  options = options || {};
  var features = [];
  if (options.features) {
    this._selectFeatures(features, options.features, options.conditions, options.matchAll, options.useCase);
  } else if (this._features) {
    this._selectFeatures(features, this._features.getArray(), options.conditions, options.matchAll, options.useCase);
  } else {
    var sources = options.sources || this.getSources();
    sources.forEach(function(s) {
      this._selectFeatures(features, s.getFeatures(), options.conditions, options.matchAll, options.useCase);
    }.bind(this));
  }
  this.dispatchEvent({ type:"select", features: features });
  return features;
};

export default ol_control_SelectBase
