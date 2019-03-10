/*	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {inherits as ol_inherits} from 'ol'
import {transform as ol_proj_transform} from 'ol/proj'
import ol_control_SearchJSON from "./SearchJSON";
import ol_geom_Point from 'ol/geom/Point'
import ol_ext_Ajax from '../util/Ajax'

/**
 * Search places using the photon API.
 *
 * @constructor
 * @extends {ol_control_SearchJSON}
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
 *	@param {string|undefined} options.url Url to photon api, default "http://photon.komoot.de/api/"
 *	@param {string|undefined} options.lang Force preferred language, default none
 *	@param {boolean} options.position Search, with priority to geo position, default false
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return street + name + contry
 */
var ol_control_SearchWikipedia = function(options){
  options = options || {};
  options.lang = options.lang||'en';
	options.className = options.className || 'wikipedia';
	options.url = 'https://'+options.lang+'.wikipedia.org/w/api.php';
	ol_control_SearchJSON.call(this, options);
	this.set('lang', options.lang);
	this.set('copy','<a href="https://'+options.lang+'.wikipedia.org/" target="new">Wikipedia&reg; -CC-By-SA</a>');
};
ol_inherits(ol_control_SearchWikipedia, ol_control_SearchJSON);

/** Returns the text to be displayed in the menu
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol_control_SearchWikipedia.prototype.getTitle = function (f){
	return f.desc;
};

/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol_control_SearchWikipedia.prototype.requestData = function (s) {
  var data = {
    action: 'opensearch',
    search: s,
    lang: this.get('lang'),
    format: 'json',
    origin: '*',
		limit: this.get('maxItems')
	}
	return data;
};

/**
 * Handle server response to pass the features array to the list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 */
ol_control_SearchWikipedia.prototype.handleResponse = function (response) {
  var features = [];
  for (var i=0; i<response[1].length; i++) {
    features.push({
      title: response[1][i],
      desc: response[2][i],
      uri: response[3][i]
    })
  }
	return features;
};

/** A ligne has been clicked in the menu > dispatch event
*	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol_control_SearchWikipedia.prototype.select = function (f){
  var title = decodeURIComponent(f.uri.split('/').pop()).replace(/\'/,'%27');
  // Search for coords
  ol_ext_Ajax.get({
    url: f.uri.split('wiki/')[0]+'w/api.php',
    data: {
      action: 'query',
      prop: 'pageimages|coordinates',
      piprop: 'original',
      origin: '*',
      format: 'json',
      titles: title
    },
    options: {
      encode: false
    },
    success: function (e) {
      var page = e.query.pages[Object.keys(e.query.pages).pop()];
      var feature = {
        title: f.title,
        desc: f.desc,
        url: f.uri,
        img: page.original.source,
        pageid: page.pageid
      }
      var c;
      if (page.coordinates) {
        feature.lon = page.coordinates[0].lon;
        feature.lat = page.coordinates[0].lat;
        c = [feature.lon, feature.lat];
        c = ol_proj_transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
      }
      this.dispatchEvent({ type:"select", search:feature, coordinate: c });
    }.bind(this)
  })
};

/** */
export default ol_control_SearchWikipedia
