/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {transform as ol_proj_transform} from 'ol/proj.js'
import ol_control_SearchJSON from "./SearchJSON.js";
import ol_ext_Ajax from '../util/Ajax.js'
import ol_ext_element from '../util/element.js';

/**
 * Search places using the MediaWiki API.
 * @see https://www.mediawiki.org/wiki/API:Main_page
 *
 * @constructor
 * @extends {ol_control_SearchJSON}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 * 
 *  @param {string|undefined} options.lang API language, default none
 */
var ol_control_SearchWikipedia = class olcontrolSearchWikipedia extends ol_control_SearchJSON {
  constructor(options) {
    options = options || {};
    options.lang = options.lang || 'en';
    options.className = options.className || 'ol-search-wikipedia';
    options.url = 'https://' + options.lang + '.wikipedia.org/w/api.php';
    options.placeholder = options.placeholder || 'search string, File:filename';
    options.copy = '<a href="https://' + options.lang + '.wikipedia.org/" target="new">Wikipedia&reg; - CC-By-SA</a>';
    super(options);
    this.set('lang', options.lang);
  }
  /** Returns the text to be displayed in the menu
  *	@param {ol.Feature} f the feature
  *	@return {string} the text to be displayed in the index
  *	@api
  */
  getTitle(f) {
    return ol_ext_element.create('DIV', {
      html: f.title,
      title: f.desc
    });
    //return f.desc;
  }
  /** Set the current language
   * @param {string} lang the current language as ISO string (en, fr, de, es, it, ja, ...)
   */
  setLang(lang) {
    this.set('lang', lang);
    this.set('url', 'https://' + lang + '.wikipedia.org/w/api.php');
  }
  /**
   * @param {string} s the search string
   * @return {Object} request data (as key:value)
   * @api
   */
  requestData(s) {
    var data = {
      action: 'opensearch',
      search: s,
      lang: this.get('lang'),
      format: 'json',
      origin: '*',
      limit: this.get('maxItems')
    };
    return data;
  }
  /**
   * Handle server response to pass the features array to the list
   * @param {any} response server response
   * @return {Array<any>} an array of feature
   */
  handleResponse(response) {
    var features = [];
    for (var i = 0; i < response[1].length; i++) {
      features.push({
        title: response[1][i],
        desc: response[2][i],
        uri: response[3][i]
      });
    }
    return features;
  }
  /** A ligne has been clicked in the menu query for more info and disatch event
  *	@param {any} f the feature, as passed in the autocomplete
  *	@api
  */
  select(f) {
    var title = decodeURIComponent(f.uri.split('/').pop()).replace(/'/, '%27');
    // Search for coords
    ol_ext_Ajax.get({
      url: f.uri.split('wiki/')[0] + 'w/api.php',
      data: {
        action: 'query',
        prop: 'pageimages|coordinates|extracts',
        exintro: 1,
        explaintext: 1,
        piprop: 'original',
        origin: '*',
        format: 'json',
        redirects: 1,
        titles: title
      },
      options: {
        encode: false
      },
      success: function (e) {
        var page = e.query.pages[Object.keys(e.query.pages).pop()];
        console.log(page);
        var feature = {
          title: f.title,
          desc: page.extract || f.desc,
          url: f.uri,
          img: page.original ? page.original.source : undefined,
          pageid: page.pageid
        };
        var c;
        if (page.coordinates) {
          feature.lon = page.coordinates[0].lon;
          feature.lat = page.coordinates[0].lat;
          c = [feature.lon, feature.lat];
          c = ol_proj_transform(c, 'EPSG:4326', this.getMap().getView().getProjection());
        }
        this.dispatchEvent({ type: "select", search: feature, coordinate: c });
      }.bind(this)
    });
  }
}

export default ol_control_SearchWikipedia
