/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_SelectBase from './SelectBase.js'
import ol_ext_element from '../util/element.js'

/**
 * Select features by property using a simple text input
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {function|undefined} options.onchoice function triggered the text change, default nothing
 */
var ol_control_SelectFulltext = class olcontrolSelectFulltext extends ol_control_SelectBase {
  constructor(options) {
    options = options || {};

    // Container
    var div = options.content = ol_ext_element.create('DIV');
    if (options.label) {
      ol_ext_element.create('LABEL', {
        html: options.label,
        parent: div
      });
    }
    super(options);
    var bt = div.querySelector('button');

    this._input = ol_ext_element.create('INPUT', {
      placeHolder: options.placeHolder || 'search...',
      change: function () {
        if (this._onchoice)
          this._onchoice();
      }.bind(this),
      parent: div
    });

    // Add ok button at the end
    div.appendChild(bt);

    this._onchoice = options.onchoice;
    this.set('property', options.property || 'name');
  }
  /** Select features by condition
   */
  doSelect(options) {
    options = options || {};
    return super.doSelect({
      features: options.features,
      useCase: false,
      conditions: [{
        attr: this.get('property'),
        op: 'contain',
        val: this._input.value
      }]
    });
  }
}

export default ol_control_SelectFulltext
