/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {transform as ol_proj_transform} from 'ol/proj.js'
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
 *  @param {ol/proj/ProjectionLike} [options.projection="EPSG:3857"] control projection
 *  @param {string} [options.className] control class name
 *  @param {Element | string } [options.target] Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string} [options.label="search"] Text label to use for the search button, default "search"
 *  @param {string} [options.labelGPS="Locate with GPS"] placeholder
 *  @param {string} [options.labelCenter="Map center"] placeholder
 *  @param {number} [options.typing=300] a delay on each typing to start searching (ms), default 300.
 *  @param {integer} [options.minLength=1] minimum length to start searching, default 1
 *  @param {integer} [options.maxItems=10] maximum number of items to display in the autocomplete list, default 10
 *  @param {integer} [options.digit=3] number of digit in coords
 */
var ol_control_SearchCoordinates = class olcontrolSearchCoordinates extends ol_control_Search {
  constructor(options) {
    options = options || {};
    options.className = (options.className || '') + ' ol-searchcoord';
    options.placeholder = options.placeholder || 'x,y';
    
    super(options);
    
    // Projection
    this.projection_ = options.projection || 'EPSG:3857'
    this.set('digit', typeof(options.digit) === 'number' ? options.digit : 3)
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
    ol_ext_element.create('BUTTON', {
      className: 'ol-centerloc',
      title: options.labelCenter || 'Map center',
      parent: this.element,
      click: function () {
        this.setInput()
      }.bind(this)
    });

    this._createForm();

    // Move list to the end
    var ul = this.element.querySelector("ul.autocomplete");
    this.element.appendChild(ul);
  }
  /** Set the input value in the form (for initialisation purpose)
   *	@param {Array<number>} [coord] if none get the map center
   *	@api
   */
  setInput(coord) {
    if (!coord) {
      if (!this.getMap()) return
      coord = this.getMap().getView().getCenter();
      coord = ol_proj_transform(coord, this.getMap().getView().getProjection(), this.getProjection())
    }
    var d = Math.pow(10, this.get('digit'))
    this.inputs_[0].value = Math.round(coord[0] * d) / d
    this.inputs_[1].value = Math.round(coord[1] * d) / d;
    this._triggerCustomEvent('keyup', this.inputs_[0]);
  }
  /** Get the control projection
   * @returns {ol/proj/ProjectionLike}
   */
  getProjection() {
    return this.projection_
  }
  /** Set the projection
   * @param {ol/proj/ProjectionLike} proj
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
    var onchange = function() {
      if (lonx.value || laty.value) {
        this._input.value = lonx.value + ',' + laty.value;
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
    var lonx = createInput('ol-decimal');

    // Y
    div = ol_ext_element.create('DIV', {
      className: 'ol-latitude',
      parent: this.element
    });
    ol_ext_element.create('LABEL', {
      html: 'Y',
      parent: div
    });
    var laty = createInput('ol-decimal');

    // Focus on open
    if (this.button) {
      this.button.addEventListener("click", function () {
        lonx.focus();
      });
    }
    this.inputs_ = [ lonx, laty ];

    // Change value on click
    this.on('select', function (e) {
      lonx.value = e.search.gps[0];
      laty.value = e.search.gps[1];
    }.bind(this));

    // Change value on geolocation
    this.geolocation.on('change', function () {
      this.geolocation.setTracking(false);
      var coord = this.geolocation.getPosition();
      coord = ol_proj_transform(coord, 'EPSG:4326', this.projection_)
      var d = Math.pow(10, this.get('digit'))
      lonx.value = Math.round(coord[0] * d) / d;
      laty.value = Math.round(coord[1] * d) / d;
      this._triggerCustomEvent('keyup', lonx);
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