/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_SelectBase from './SelectBase.js'
import ol_ext_element from '../util/element.js'

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
 *  @param {number} options.max max feature to test to get the values, default 10000
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {string} options.defaultLabel label for the default selection
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
var ol_control_SelectPopup = class olcontrolSelectPopup extends ol_control_SelectBase {
  constructor(options) {
    options = options || {};
    options.className = options.className || 'ol-select-popup';

    // Container
    var div = options.content = ol_ext_element.create('DIV');

    super(options);
    var bt = div.querySelector('button');

    if (options.label) {
      ol_ext_element.create('LABEL', {
        html: options.label,
        parent: div
      });
    }
    this._input = ol_ext_element.create('SELECT', {
      on: {
        change: function () {
          if (this._onchoice)
            this._onchoice();
          else
            this.doSelect();
        }.bind(this)
      },
      parent: div
    });


    // Add ok button at the end
    div.appendChild(bt);

    this.set('property', options.property || 'name');
    this.set('max', options.max || 10000);
    this.set('defaultLabel', options.defaultLabel);
    this._selectAll = options.selectAll;
    this._onchoice = options.onchoice;

    // Set select options
    this.setValues();
  }
  /**
  * Set the map instance the control associated with.
  * @param {o.Map} map The map instance.
  */
  setMap(map) {
    super.setMap(map);
    this.setValues();
  }
  /** Select features by attributes
   */
  doSelect(options) {
    options = options || {};
    if (!this._input.value) {
      return super.doSelect({ features: options.features, matchAll: this._selectAll });
    } else {
      return super.doSelect({
        features: options.features,
        conditions: [{
          attr: this.get('property'),
          op: '=',
          val: this._input.value
        }]
      });
    }
  }
  /** Set the popup values
   * @param {Object} values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
   */
  setValues(options) {
    options = options || {};
    var values, vals;
    if (options.values) {
      if (options.values instanceof Array) {
        vals = {};
        options.values.forEach(function (v) { vals[v] = v; });
      } else {
        vals = options.values;
      }
    } else {
      vals = {};
      var prop = this.get('property');
      this.getSources().forEach(function (s) {
        var features = s.getFeatures();
        var max = Math.min(features.length, this.get('max'));
        for (var i = 0; i < max; i++) {
          var p = features[i].get(prop);
          if (p)
            vals[p] = p;
        }
      }.bind(this));
    }
    if (options.sort) {
      values = {};
      Object.keys(vals).sort().forEach(function (key) {
        values[key] = vals[key];
      });
    } else {
      values = vals;
    }
    ol_ext_element.setHTML(this._input, '');
    ol_ext_element.create('OPTION', {
      className: 'ol-default',
      html: this.get('defaultLabel') || '',
      value: '',
      parent: this._input
    });
    for (var k in values) {
      ol_ext_element.create('OPTION', {
        html: values[k],
        value: k,
        parent: this._input
      });
    }
  }
}

export default ol_control_SelectPopup
