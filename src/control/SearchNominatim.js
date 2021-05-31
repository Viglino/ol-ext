/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import {transform as ol_proj_transform} from 'ol/proj'
import ol_control_SearchJSON from "./SearchJSON";

/**
 * Search places using the Nominatim geocoder from the OpenStreetmap project.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {boolean | undefined} options.polygon To get output geometry of results (in geojson format), default false.
 *  @param {Array<Number> | undefined} options.viewbox The preferred area to find search results. Any two corner points of the box are accepted in any order as long as they span a real box, default none.
 *  @param {boolean | undefined} options.bounded Restrict the results to only items contained with the bounding box. Restricting the results to the bounding box also enables searching by amenity only. default false
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.title Title to use for the search button tooltip, default "Search"
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *  @param {string|undefined} options.url URL to Nominatim API, default "https://nominatim.openstreetmap.org/search"
 * @see {@link https://wiki.openstreetmap.org/wiki/Nominatim}
 */
var ol_control_SearchNominatim = function(options) {
  options = options || {};
  options.className = options.className || 'nominatim';
  options.typing = options.typing || 500;
  options.url = options.url || 'https://nominatim.openstreetmap.org/search';
  options.copy = '<a href="http://www.openstreetmap.org/copyright" target="new">&copy; OpenStreetMap contributors</a>';
  ol_control_SearchJSON.call(this, options);
  this.set('polygon', options.polygon);
  this.set('viewbox', options.viewbox);
  this.set('bounded', options.bounded);
};
ol_ext_inherits(ol_control_SearchNominatim, ol_control_SearchJSON);

/** Returns the text to be displayed in the menu
 *	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol_control_SearchNominatim.prototype.getTitle = function (f) {
  var info = [];
  if (f.class) info.push(f.class);
  if (f.type) info.push(f.type);
  var title = f.display_name+(info.length ? "<i>"+info.join(' - ')+"</i>" : '');
  if (f.icon) title = "<img src='"+f.icon+"' />" + title;
  return (title);
};

/** 
 * @param {string} s the search string
 * @return {Object} request data (as key:value)
 * @api
 */
ol_control_SearchNominatim.prototype.requestData = function (s) {
  var data = { 
    format: "json", 
    addressdetails: 1, 
    q: s, 
    polygon_geojson: this.get('polygon') ? 1:0,
    bounded: this.get('bounded') ? 1:0,
    limit: this.get('maxItems')
  };
  if (this.get('viewbox')) data.viewbox = this.get('viewbox');
  return data;
};

/** A ligne has been clicked in the menu > dispatch event
 *	@param {any} f the feature, as passed in the autocomplete
*	@api
*/
ol_control_SearchNominatim.prototype.select = function (f){
  var c = [Number(f.lon), Number(f.lat)];
  // Add coordinate to the event
  try {
    c = ol_proj_transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
  } catch(e) { /* ok */}
  this.dispatchEvent({ type:"select", search:f, coordinate: c });
};

/**
 * Handle server response to pass the features array to the display list
 * @param {any} response server response
 * @return {Array<any>} an array of feature
 * @api
 */
ol_control_SearchJSON.prototype.handleResponse = function (response) {
  return response.results || response;
};

/** Reverse geocode
 * @param {ol.coordinate} coord
 * @api
 */
ol_control_SearchNominatim.prototype.reverseGeocode = function (coord, cback) {
  var lonlat = ol_proj_transform (coord, this.getMap().getView().getProjection(), 'EPSG:4326');
  this.ajax(
    this.get('url').replace('search', 'reverse'),
    { lon: lonlat[0], lat: lonlat[1], format: 'json' },
    function(resp) {
      if (cback) {
        cback.call(this, [resp]);
      } else {
        if (resp && !resp.error) {
          this._handleSelect(resp, true);
        }
        //this.setInput('', true);
      }
    }.bind(this)
  );
};

export default ol_control_SearchNominatim
