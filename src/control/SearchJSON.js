/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol from 'ol'
import ol_proj from 'ol/proj'
import ol_control_Search from './Search'
import ol_geom_Point from 'ol/geom/point'

/**
 * This is the base class for search controls that use a json service to search features.
 * You can use it for simple custom search or as base to new class.
 *
 * @constructor
 * @extends {ol_control_Search}
 * @fires select
 * @param {Object=} Control options.
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 *
 *	@param {string|undefined} options.url Url of the search api
 */
var ol_control_SearchJSON = function(options)
{	options = options || {};
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

	// Overwrite handleResponse
	if (typeof(options.handleResponse)==='function') this.handleResponse = options.handleResponse;
};
ol.inherits(ol_control_SearchJSON, ol_control_Search);

/** Autocomplete function (ajax request to the server)
* @param {string} s search string
* @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
*/
ol_control_SearchJSON.prototype.autocomplete = function (s, cback)
{	var data = this.requestData(s);

	var self = this;
	var url = encodeURI(this.get('url'));

	var parameters = '';
	for (var index in data) {
		parameters += (parameters) ? '&' : '?';
		if (data.hasOwnProperty(index)) parameters += index + '=' + data[index];
	}

	var ajax = new XMLHttpRequest();
	ajax.open('GET', url + parameters, true);

	ajax.onload = function () {
		if (this.status >= 200 && this.status < 400) {
			var data = JSON.parse(this.response);
			cback(self.handleResponse(data));
		} else {
			console.log(url + parameters, arguments);
		}
	};

	ajax.onerror = function () {
		console.log(url + parameters, arguments);
	};

	ajax.send();
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
