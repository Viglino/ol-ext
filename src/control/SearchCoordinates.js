/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {transform as ol_proj_transform} from 'ol/proj.js'
import {toStringHDMS as ol_coordinate_toStringHDMS} from 'ol/coordinate.js';
import ol_Geolocation from 'ol/Geolocation.js'

import ol_control_Search from './Search.js'
import ol_ext_element from '../util/element.js'

/**
 * Search on GPS coordinate.
 *
 * @constructor
 * @extends {ol_control_Search}
 * @fires select
 * @param {Object=} Control options. 
 *  @param {ol/proj/ProjectionLike} options.projection 
 *  @param {string} [options.className] control class name
 *  @param {Element | string | undefined} [options.target] Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} [options.label="search"] Text label to use for the search button, default "search"
 *  @param {string | undefined} [options.labelGPS="Locate with GPS"] placeholder, default "Locate with GPS"
 *  @param {number | undefined} [options.typing=300] a delay on each typing to start searching (ms), default 300.
 *  @param {integer | undefined} [options.minLength=1] minimum length to start searching, default 1
 *  @param {integer | undefined} [options.maxItems=10] maximum number of items to display in the autocomplete list, default 10
 */
var ol_control_SearchCoordinates = class olcontrolSearchCoordinates extends ol_control_Search {
  constructor(options) {
    options = options || {};
    options.className = (options.className || '') + ' ol-searchcoord';
    options.placeholder = options.placeholder || 'x,y';
    
    super(options);
    
    // Projection
    this.projection_ = options.projection || 'EPSG:3857'
    // Geolocation
    this.geolocation = new ol_Geolocation({
      projection: "EPSG:4326",
      trackingOptions: {
        maximumAge: 10000,
        enableHighAccuracy: true,
        timeout: 600000
      }
    });
    ol_ext_element.create('BUTTON', {
      className: 'ol-geoloc',
      title: options.labelGPS || 'Locate with GPS',
      parent: this.element,
      click: function () {
        this.geolocation.setTracking(true);
      }.bind(this)
    });

    this._createForm();

    // Move list to the end
    var ul = this.element.querySelector("ul.autocomplete");
    this.element.appendChild(ul);
  }
  /** Set the projection
   * 
   */
  setProjection(proj) {
    if (this.projection_ !== proj) {
      this.projection_ = proj;
      this.clearHistory();
      this.element.querySelectorAll('INPUT[type="number"]').forEach(function(i) {
        i.value = '';
      })
    }
  }
  /** Create input form
   * @private
   */
  _createForm() {

    // Value has change
    var onchange = function (e) {
      if (lon.value || lat.value) {
        this._input.value = lon.value + ',' + lat.value;
      } else {
        this._input.value = '';
      }
      // Center on coords
      this.search();
    }.bind(this);

    function createInput(className) {
      var input = ol_ext_element.create('INPUT', {
        className: className,
        type: 'number',
        step: 'any',
        lang: 'en',
        parent: div,
        on: {
          'change keyup': onchange
        }
      });
      return input;
    }

    // X
    var div = ol_ext_element.create('DIV', {
      className: 'ol-longitude',
      parent: this.element
    });
    ol_ext_element.create('LABEL', {
      html: 'X',
      parent: div
    });
    var lon = createInput('ol-decimal');

    // Y
    div = ol_ext_element.create('DIV', {
      className: 'ol-latitude',
      parent: this.element
    });
    ol_ext_element.create('LABEL', {
      html: 'Y',
      parent: div
    });
    var lat = createInput('ol-decimal');

    // Focus on open
    if (this.button) {
      this.button.addEventListener("click", function () {
        lon.focus();
      });
    }

    // Change value on click
    this.on('select', function (e) {
      lon.value = e.search.gps[0];
      lat.value = e.search.gps[1];
    }.bind(this));

    // Change value on geolocation
    this.geolocation.on('change', function () {
      this.geolocation.setTracking(false);
      var coord = this.geolocation.getPosition();
      coord = ol_proj_transform(coord, 'EPSG:4326', this.projection_)
      console.log(coord)
      lon.value = coord[0];
      lat.value = coord[1];
      this._triggerCustomEvent('keyup', lon);
    }.bind(this));
  }
  /** Autocomplete function
  * @param {string} s search string
  * @return {Array<any>|false} an array of search solutions
  * @api
  */
  autocomplete(s) {
    var result = [];
    var c = s.split(',');
    c[0] = Number(c[0]);
    c[1] = Number(c[1]);
    // 
    var coord = ol_proj_transform([c[0], c[1]], this.projection_, this.getMap().getView().getProjection());
    result.push({ gps: c, coordinate: coord, name: s });
    return result;
  }
}

export default ol_control_SearchCoordinates