/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {inherits as ol_inherits} from 'ol'
import ol_Overlay_Popup from './Popup'
import ol_ext_element from '../util/element'

/**
* A popup element to be displayed on a feature.
*
* @constructor
* @extends {ol_Overlay_Popup}
* @param {} options Extend Popup options 
*	@param {String} options.popupClass the a class of the overlay to style the popup.
*	@param {bool} options.closeBox popup has a close box, default false.
*	@param {function|undefined} options.onclose: callback function when popup is closed
*	@param {function|undefined} options.onshow callback function when popup is shown
*	@param {Number|Array<number>} options.offsetBox an offset box
*	@param {ol.OverlayPositioning | string | undefined} options.positionning 
*		the 'auto' positioning var the popup choose its positioning to stay on the map.
* @param {*} options.template A template with a list of properties to use in the popup
* @api stable
*/
var ol_Overlay_PopupFeature = function (options) {
  options = options || {};

  ol_Overlay_Popup.call(this, options);

  this._template = options.template || {};

  // Bind with a select interaction
  if (options.select && (typeof options.select.on ==='function')) {
    this._select = options.select;
    options.select.on('select', function(e){
      if (!this._noselect) this.show(e.mapBrowserEvent.coordinate, options.select.getFeatures().getArray());
    }.bind(this));
  }
};
ol_inherits(ol_Overlay_PopupFeature, ol_Overlay_Popup);

/** Set the template
 * @param {*} template A template with a list of properties to use in the popup
 */
ol_Overlay_PopupFeature.prototype.setTemplate = function(template) {
  this._template = template || {};
};

/** Show the popup on the map
 * @param {ol.coordinate|undefined} coordinate Position of the popup
 * @param {ol.Feature|Array<ol.Feature>} features The features on the popup
 */
ol_Overlay_PopupFeature.prototype.show = function(coordinate, features) {
  if (!(features instanceof Array)) features = [features];
  this._features = features.slice();
  if (!this._count) this._count = 1;

  // Calculate html upon feaures attributes
  this._count = 1;
  var html = this._getHtml(features[0]);
  this.hide();
  if (html) {
    if (!coordinate) {
      coordinate = features[0].getGeometry().getFirstCoordinate();
    }
    ol_Overlay_Popup.prototype.show.call(this, coordinate, html);
  }
};

/**
 * @private
 */
ol_Overlay_PopupFeature.prototype._getHtml = function(feature) {
  if (!feature) return '';
  var html = ol_ext_element.create('DIV', { className: 'ol-popupfeature' });
  if (this._template.title) {
    ol_ext_element.create('H1', { html:feature.get(this._template.title), parent: html });
  }
  if (this._template.attributes) {
    var tr, table = ol_ext_element.create('TABLE', { parent: html });
    this._template.attributes.forEach( function(att) {
      tr = ol_ext_element.create('TR', { parent: table });
      ol_ext_element.create('TD', { html: att, parent: tr });
      ol_ext_element.create('TD', { html: feature.get(att), parent: tr });
    });
  }
  // Zoom button
  ol_ext_element.create('BUTTON', { className: 'ol-zoombt', parent: html })
    .addEventListener('click', function(e) {
      this.getMap().getView().fit(feature.getGeometry().getExtent(), { duration:1000 });
    }.bind(this));

  // Counter
  if (this._features.length > 1) {
    var div = ol_ext_element.create('DIV', { className: 'ol-count', parent: html });
    ol_ext_element.create('DIV', { className: 'ol-prev', parent: div })
      .addEventListener('click', function() {
        this._count--;
        if (this._count<1) this._count = this._features.length;
        html = this._getHtml(this._features[this._count-1]);
        ol_Overlay_Popup.prototype.show.call(this, this.getPosition(), html);
      }.bind(this));
    ol_ext_element.create('TEXT', { html:this._count+'/'+this._features.length, parent: div });
    ol_ext_element.create('DIV', { className: 'ol-next', parent: div })
      .addEventListener('click', function() {
        this._count++;
        if (this._count>this._features.length) this._count = 1;
        html = this._getHtml(this._features[this._count-1]);
        ol_Overlay_Popup.prototype.show.call(this, this.getPosition(), html);
      }.bind(this));
  }
  this._noselect = true;
  this._select.getFeatures().clear();
  this._select.getFeatures().push(feature);
  this._noselect = false;
  return html;
};

export default ol_Overlay_PopupFeature