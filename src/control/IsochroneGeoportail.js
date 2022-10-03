/*	Copyright (c) 2018 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_Control from 'ol/control/Control.js'
import ol_format_WKT from 'ol/format/WKT.js'
import {toLonLat as ol_proj_toLonLat} from 'ol/proj.js'
import ol_ext_Ajax from '../util/Ajax.js';
import ol_ext_element from '../util/element.js';
import ol_control_SearchGeoportail from './SearchGeoportail.js'

/**
 * Geoportail isochrone Control.
 * @see https://geoservices.ign.fr/documentation/geoservices/isochrones.html
 * @constructor
 * @extends {ol_control_Control}
 * @fires isochrone
 * @fires error
 * @param {Object=} options
 *	@param {string} options.className control class name
 *	@param {string} [options.apiKey] Geoportail apo key
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {string | undefined} options.inputLabel label for the input, default none
 *	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *	@param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
 *
 *  @param {string} options.exclusions Exclusion list separate with a comma 'Toll,Tunnel,Bridge'
 */
var ol_control_IsochroneGeoportail = class olcontrolIsochroneGeoportail extends ol_control_Control {
  constructor(options) {
    if (!options)
      options = {};
    if (options.typing == undefined)
      options.typing = 300;

    var classNames = (options.className ? options.className : '') + ' ol-isochrone ol-routing';
    if (!options.target) classNames += ' ol-unselectable ol-control';
    var element = ol_ext_element.create('DIV', { className: classNames });

    if (!options.target) {
      var bt = ol_ext_element.create('BUTTON', { parent: element });
      bt.addEventListener('click', function () {
        element.classList.toggle('ol-collapsed');
      });
    }

    // Inherits
    super({
      element: element,
      target: options.target
    });

    var self = this;
    this.set('iter', 1);

    var content = ol_ext_element.create('DIV', { className: 'content', parent: element });
    // Search control
    this._addSearchCtrl(content, options);

    // Method buttons
    ol_ext_element.create('BUTTON', { className: 'ol-button ol-method-time selected', title: 'isochrone', parent: content })
      .addEventListener('click', function () {
        this.setMethod('time');
      }.bind(this));
    ol_ext_element.create('I', { className: 'ol-button ol-method-distance', title: 'isodistance', parent: content })
      .addEventListener('click', function () {
        this.setMethod('distance');
      }.bind(this));

    // Mode buttons
    ol_ext_element.create('I', { className: 'ol-button ol-car selected', title: 'by car', parent: content })
      .addEventListener('click', function () {
        this.setMode('car');
      }.bind(this));
    ol_ext_element.create('I', { className: 'ol-button ol-pedestrian', title: 'by foot', parent: content })
      .addEventListener('click', function () {
        this.setMode('pedestrian');
      }.bind(this));

    // Direction buttons
    ol_ext_element.create('I', { className: 'ol-button ol-direction-direct selected', title: 'direct', parent: content })
      .addEventListener('click', function () {
        this.setDirection('direct');
      }.bind(this));
    ol_ext_element.create('I', { className: 'ol-button ol-direction-reverse', title: 'reverse', parent: content })
      .addEventListener('click', function () {
        this.setDirection('reverse');
      }.bind(this));

    // Input 
    var div = ol_ext_element.create('DIV', { className: 'ol-time', parent: content });
    ol_ext_element.create('DIV', { html: 'isochrone:', parent: div });
    ol_ext_element.create('INPUT', { type: 'number', parent: div, min: 0 })
      .addEventListener('change', function () {
        self.set('hour', Number(this.value));
      });
    ol_ext_element.create('TEXT', { parent: div, html: 'h' });
    ol_ext_element.create('INPUT', { type: 'number', parent: div, min: 0 })
      .addEventListener('change', function () {
        self.set('minute', Number(this.value));
      });
    ol_ext_element.create('TEXT', { parent: div, html: 'mn' });
    div = ol_ext_element.create('DIV', { className: 'ol-distance', parent: content });
    ol_ext_element.create('DIV', { html: 'isodistance:', parent: div });
    ol_ext_element.create('INPUT', { type: 'number', step: 'any', parent: div, min: 0 })
      .addEventListener('change', function () {
        self.set('distance', Number(this.value));
      });
    ol_ext_element.create('TEXT', { parent: div, html: 'km' });

    div = ol_ext_element.create('DIV', { className: 'ol-iter', parent: content });
    ol_ext_element.create('DIV', { html: 'Iteration:', parent: div });
    ol_ext_element.create('INPUT', { type: 'number', parent: div, value: 1, min: 1 })
      .addEventListener('change', function () {
        self.set('iter', Number(this.value));
      });

    // OK button
    ol_ext_element.create('I', { className: 'ol-ok', html: 'ok', parent: content })
      .addEventListener('click', function () {
        var val = 0;
        switch (this.get('method')) {
          case 'distance': {
            val = this.get('distance') * 1000;
            break;
          }
          default: {
            val = (this.get('hour') || 0) * 3600 + (this.get('minute') || 0) * 60;
            break;
          }
        }
        if (val && this.get('coordinate')) {
          this.search(this.get('coordinate'), val);
        }
      }.bind(this));

    this.set('url', 'https://wxs.ign.fr/' + (options.apiKey || 'essentiels') + '/isochrone/isochrone.json');
    this._ajax = new ol_ext_Ajax({
      dataType: 'JSON',
      auth: options.auth
    });

    this._ajax.on('success', this._success.bind(this));
    this._ajax.on('error', this._error.bind(this));
    // searching
    this._ajax.on('loadstart', function () {
      this.element.classList.add('ol-searching');
    }.bind(this));
    this._ajax.on('loadend', function () {
      this.element.classList.remove('ol-searching');
    }.bind(this));

    this.setMethod(options.method);
  }
  /**
   * Set the map instance the control is associated with
   * and add its controls associated to this map.
   * @param {_ol_Map_} map The map instance.
   */
  setMap(map) {
    super.setMap(map);
    this._search.setMap(map);
  }
  /** Add a new search input
   * @private
   */
  _addSearchCtrl(element, options) {
    var div = ol_ext_element.create("DIV", { parent: element });

    var search = this._search = new ol_control_SearchGeoportail({
      className: 'IGNF ol-collapsed',
      apiKey: options.apiKey,
      target: div
    });
    search.on('select', function (e) {
      search.setInput(e.search.fulltext);
      this.set('coordinate', e.coordinate);
    }.bind(this));
    search.on('change:input', function () {
      this.set('coordinate', false);
    }.bind(this));
  }
  /** Set the travel method
   * @param [string] method The method (time or distance)
   */
  setMethod(method) {
    7;
    method = (/distance/.test(method) ? 'distance' : 'time');
    this.element.querySelector(".ol-method-time").classList.remove("selected");
    this.element.querySelector(".ol-method-distance").classList.remove("selected");
    this.element.querySelector(".ol-method-" + method).classList.add("selected");
    this.element.querySelector("div.ol-time").classList.remove("selected");
    this.element.querySelector("div.ol-distance").classList.remove("selected");
    this.element.querySelector("div.ol-" + method).classList.add("selected");
    this.set('method', method);
  }
  /** Set mode
   * @param {string} mode The mode: 'car' or 'pedestrian', default 'car'
   */
  setMode(mode) {
    this.set('mode', mode);
    this.element.querySelector(".ol-car").classList.remove("selected");
    this.element.querySelector(".ol-pedestrian").classList.remove("selected");
    this.element.querySelector(".ol-" + mode).classList.add("selected");
  }
  /** Set direction
   * @param {string} direction The direction: 'direct' or 'reverse', default direct
   */
  setDirection(direction) {
    this.set('direction', direction);
    this.element.querySelector(".ol-direction-direct").classList.remove("selected");
    this.element.querySelector(".ol-direction-reverse").classList.remove("selected");
    this.element.querySelector(".ol-direction-" + direction).classList.add("selected");
  }
  /** Calculate an isochrone
   * @param {ol.coordinate} coord
   * @param {number|string} option A number as time (in second) or distance (in meter), depend on method propertie
   * or a string with a unit (s, mn, h for time or km, m)
   */
  search(coord, option, iter) {
    var proj = this.getMap() ? this.getMap().getView().getProjection() : 'EPSG:3857';
    var method = /distance/.test(this.get('method')) ? 'distance' : 'time';
    if (typeof (option) === 'string') {
      var unit = option.replace(/([0-9|.]*)([a-z]*)$/, '$2');
      method = 'time';
      option = parseFloat(option);
      // convert unit
      switch (unit) {
        case 'mn': {
          option = option * 60;
          break;
        }
        case 'h': {
          option = option * 3600;
          break;
        }
        case 'm': {
          method = 'distance';
          break;
        }
        case 'km': {
          method = 'distance';
          option = option * 1000;
          break;
        }
      }
    }
    var dt = Math.round(option * (this.get('iter') - (iter || 0)) / this.get('iter'));
    if (typeof option === 'number') {
      // Send data
      var data = {
        'gp-access-lib': '2.1.0',
        location: ol_proj_toLonLat(coord, proj),
        graphName: (this.get('mode') === 'pedestrian' ? 'Pieton' : 'Voiture'),
        exclusions: this.get('exclusions') || undefined,
        method: method,
        time: method === 'time' ? dt : undefined,
        distance: method === 'distance' ? dt : undefined,
        reverse: (this.get('direction') === 'reverse'),
        smoothing: this.get('smoothing') || true,
        holes: this.get('holes') || false
      };
      this._ajax.send(this.get('url'), data, {
        coord: coord,
        option: option,
        data: data,
        iteration: (iter || 0) + 1
      });
    }
  }
  /** Trigger result
   * @private
   */
  _success(e) {
    var proj = this.getMap() ? this.getMap().getView().getProjection() : 'EPSG:3857';
    // Convert to features
    var format = new ol_format_WKT();
    var evt = e.response;
    evt.feature = format.readFeature(evt.wktGeometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: proj
    });
    evt.feature.set('iteration', e.options.iteration);
    evt.feature.set('method', e.options.data.method);
    evt.feature.set(e.options.data.method, e.options.data[e.options.data.method]);
    delete evt.wktGeometry;
    evt.type = 'isochrone';
    evt.iteration = e.options.iteration - 1;
    this.dispatchEvent(evt);
    if (e.options.iteration < this.get('iter')) {
      this.search(e.options.coord, e.options.option, e.options.iteration);
    }
  }
  /** Trigger error
   * @private
   */
  _error() {
    this.dispatchEvent({ type: 'error' });
  }
}

export default ol_control_IsochroneGeoportail;