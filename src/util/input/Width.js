import ol_ext_element from '../element.js';
import ol_ext_input_List from './List.js'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_List}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {Array<number>} [options.size] a list of size (default 0,1,2,3,5,10,15,20)
 */
var ol_ext_input_Width = class olextinputWidth extends ol_ext_input_List {
  constructor(options) {
    options = options || {};

    options.options = [];
    (options.size || [0, 1, 2, 3, 5, 10, 15, 20]).forEach(function (i) {
      options.options.push({
        value: i,
        html: ol_ext_element.create('DIV', {
          className: 'ol-option-' + i,
          style: {
            height: i || undefined
          }
        })
      });
    });
    super(options);
    
    this._content.remove();

    this.element.classList.add('ol-width');

  }
  /** Get the current value
   * @returns {number}
   */
  getValue() {
    return parseFloat(super.getValue());
  }
}

export default ol_ext_input_Width
