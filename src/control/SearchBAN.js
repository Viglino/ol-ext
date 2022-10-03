/*	Copyright (c) 2017 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {transform as ol_proj_transform} from 'ol/proj.js'
import ol_control_SearchPhoton from "./SearchPhoton.js";

/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *  @param {string|undefined} options.url Url to BAN api, default "https://api-adresse.data.gouv.fr/search/"
 *  @param {boolean} options.position Search, with priority to geo position, default false
 *  @param {function} options.getTitle a function that takes a feature and return the text to display in the menu, default return label attribute
 *  @param {string|undefined} options.citycode limit search to an administrative area defined by its city code (code commune insee)
 *  @param {string|undefined} options.postcode limit search to a postal code
 *  @param {string|undefined} options.type type of result: 'housenumber' | 'street'
 * @see {@link https://adresse.data.gouv.fr/api/}
 */
var ol_control_SearchBAN = class olcontrolSearchBAN extends ol_control_SearchPhoton {
  constructor(options) {
    options = options || {};
    options.typing = options.typing || 500;
    options.url = options.url || 'https://api-adresse.data.gouv.fr/search/';
    options.className = options.className || 'BAN';
    options.copy = '<a href="https://adresse.data.gouv.fr/" target="new">&copy; BAN-data.gouv.fr</a>';
    
    super(options);

    this.set('postcode', options.postcode);
    this.set('citycode', options.citycode);
    this.set('type', options.type);
  }
  /** Returns the text to be displayed in the menu
   * @param {ol.Feature} f the feature
   * @return {string} the text to be displayed in the index
   * @api
   */
  getTitle(f) {
    var p = f.properties;
    return (p.label);
  }
  /** A ligne has been clicked in the menu > dispatch event
   * @param {any} f the feature, as passed in the autocomplete
   * @api
   */
  select(f) {
    var c = f.geometry.coordinates;
    // Add coordinate to the event
    try {
      c = ol_proj_transform(f.geometry.coordinates, 'EPSG:4326', this.getMap().getView().getProjection());
    } catch (e) { /* ok */ }
    this.dispatchEvent({ type: "select", search: f, coordinate: c });
  }
  requestData(s) {
    var data = super.requestData(s);
    data.postcode = this.get('postcode');
    data.citycode = this.get('citycode');
    data.type = this.get('type');

    return data;
  }
}

export default ol_control_SearchBAN
