import ol_ext_element from '../element.js';
import ol_ext_input_List from './List.js'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_List}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {Array<number>} [options.size] a list of size (default 0,2,3,5,8,13,21,34,55)
 */
var ol_ext_input_Size = class olextinputSize extends ol_ext_input_List {
  constructor(options) {
    options = options || {};

    options.options = [];
    (options.size || [0, 2, 3, 5, 8, 13, 21, 34, 55]).forEach(function (i) {
      options.options.push({
        value: i,
        html: ol_ext_element.create('DIV', {
          className: 'ol-option-' + i,
          style: {
            fontSize: i ? i + 'px' : undefined
          }
        })
      });
    });
    super(options);

    this._content.remove();

    this.element.classList.add('ol-size');

  }
  /** Get the current value
   * @returns {number}
   */
  getValue() {
    return parseFloat(super.getValue());
  }
}

export default ol_ext_input_Size
