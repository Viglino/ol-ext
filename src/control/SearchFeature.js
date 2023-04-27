/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Search from './Search.js'

/**
 * Search features.
 *
 * @constructor
 * @extends {ol_control_Search}
 * @fires select
 * @param {Object=} Control options. 
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string | undefined} options.property a property to display in the index, default 'name'.
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property 
 *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
 *	@param {function | undefined} options.sort a function to sort autocomplete list. Takes 2 features and return 0, -1 or 1.
 */
var ol_control_SearchFeature = class olcontrolSearchFeature extends ol_control_Search {
  constructor(options) {
    options = options || {};
    options.className = options.className || 'feature';

    super(options);

    if (typeof (options.getSearchString) == "function") {
      this.getSearchString = options.getSearchString;
    }
    this.set('property', options.property || 'name');

    this.source_ = options.source;
    this._sort = options.sort;
  }
  /** No history avaliable on features
   */
  restoreHistory() {
    this.set('history', []);
  }
  /** No history avaliable on features
   */
  saveHistory() {
    try {
      localStorage.removeItem("ol@search-" + this._classname);
    } catch (e) { console.warn('Failed to access localStorage...'); }
  }
  /** Returns the text to be displayed in the menu
  *	@param {ol.Feature} f the feature
  *	@return {string} the text to be displayed in the index
  *	@api
  */
  getTitle(f) {
    return f.get(this.get('property') || 'name');
  }
  /** Return the string to search in
  *	@param {ol.Feature} f the feature
  *	@return {string} the text to be used as search string
  *	@api
  */
  getSearchString(f) {
    return this.getTitle(f);
  }
  /** Get the source
   *	@return {ol.source.Vector}
   *	@api
   */
  getSource() {
    return this.source_;
  }
  /** Get the source
   *	@param {ol.source.Vector} source
   *	@api
   */
  setSource(source) {
    this.source_ = source;
  }
  /** Set function to sort autocomplete results
   * @param {function} sort a sort function that takes 2 features and returns 0, -1 or 1
   */
  setSortFunction(sort) {
    this._sort = sort
  }
  /** Autocomplete function
   * @param {string} s search string
   * @param {int} max max
   * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
   * @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
   * @api
   */
  autocomplete(s) {
    var result = [];
    if (this.source_) {
      // regexp
      s = s.replace(/^\*/, '');
      var rex = new RegExp(s, 'i');
      // The source
      var features = this.source_.getFeatures();
      var max = this.get('maxItems');
      for (var i = 0, f; f = features[i]; i++) {
        var att = this.getSearchString(f);
        if (att !== undefined && rex.test(att)) {
          result.push(f);
          if ((--max) <= 0)
            break;
        }
      }
    }
    if (typeof(this._sort) === 'function') {
      result = result.sort(this._sort)
    }
    return result;
  }
}

export default ol_control_SearchFeature