/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_Search from './Search'
import ol_ext_Ajax from '../util/Ajax';

/**
 * This is the base class for search controls that use a json service to search features.
 * You can use it for simple custom search or as base to new class.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {any} options extend ol.control.Search options
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.title Title to use for the search button tooltip, default "Search"
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 *
 *  @param {string|undefined} options.url Url of the search api
 *  @param {string | undefined} options.authentication: basic authentication for the search API as btoa("login:pwd")
 */
var ol_control_SearchJSON = function(options) {
  options = options || {};
  options.className = options.className || 'JSON';
  delete options.autocomplete;
  options.minLength = options.minLength || 3;
  options.typing = options.typing || 800;
  ol_control_Search.call(this, options);
  // Handle Mix Content Warning
  // If the current connection is an https connection all other connections must be https either
  var url = options.url || "";
  if (window.location.protocol === "https:") {
    var parser = document.createElement('a');
    parser.href = url;
    parser.protocol = window.location.protocol;
    url = parser.href;
  }
  this.set('url', url);

  this._ajax = new ol_ext_Ajax({ dataType:'JSON', auth: options.authentication });
  this._ajax.on('success', function (resp) {
    if (resp.status >= 200 && resp.status < 400) {
      if (typeof(this._callback) === 'function') this._callback(resp.response);
    } else {
      if (typeof(this._callback) === 'function') this._callback(false, 'error');
      console.log('AJAX ERROR', arguments);
    }
  }.bind(this));
  this._ajax.on('error', function() {
    if (typeof(this._callback) === 'function') this._callback(false, 'error');
    console.log('AJAX ERROR', arguments);
  }.bind(this));
  // Handle searchin
  this._ajax.on('loadstart', function() {
    this.element.classList.add('searching');
  }.bind(this));
  this._ajax.on('loadend', function() {
    this.element.classList.remove('searching');
  }.bind(this));

  // Overwrite handleResponse
  if (typeof(options.handleResponse)==='function') this.handleResponse = options.handleResponse;
};
ol_ext_inherits(ol_control_SearchJSON, ol_control_Search);

/** Send ajax request
 * @param {string} url
 * @param {*} data
 * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
 */
ol_control_SearchJSON.prototype.ajax = function (url, data, cback, options) {
  options = options || {};
  this._callback = cback;
  this._ajax.set('dataType', options.dataType || 'JSON');
  this._ajax.send(url, data, options);
};

/** Autocomplete function (ajax request to the server)
 * @param {string} s search string
 * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
 */
ol_control_SearchJSON.prototype.autocomplete = function (s, cback) {
  var data = this.requestData(s);
  var url = encodeURI(this.get('url'));
  this.ajax(url, data, function(resp) {
    if (typeof(cback) === 'function') cback(this.handleResponse(resp));
  });
};

/**
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol_control_SearchJSON.prototype.requestData = function (s){
  return { q: s };
};

/**
 * Handle server response to pass the features array to the display list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 * @api
 */
ol_control_SearchJSON.prototype.handleResponse = function (response) {
  return response;
};

export default ol_control_SearchJSON
