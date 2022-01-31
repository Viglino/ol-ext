/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Control from 'ol/control/Control'
import ol_layer_Layer from 'ol/layer/Layer'
import ol_ext_element from '../util/element'
import ol_ext_inherits from '../util/ext'

/** Add a progress bar to a map.
 * Use the layers option listen to tileload event and show the layer loading progress.
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {String} [options.className] class of the control
 *  @param {String} [options.label] waiting label
 *  @param {ol_layer_Layer|Array<ol_layer_Layer>} [options.layers] tile layers with tileload events
 */
var ol_control_ProgressBar = function(options) {
  options = options || {};

  var element = ol_ext_element.create('DIV', {
    className: ((options.className || '') + ' ol-progress-bar ol-unselectable ol-control').trim()
  });
  this._waiting = ol_ext_element.create('DIV', {
    html: options.label || '',
    className: 'ol-waiting',
    parent: element
  });
  this._bar = ol_ext_element.create('DIV', {
    className: 'ol-bar',
    parent: element
  });

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  this._layerlistener = [];
  this.setLayers(options.layers);
};
ol_ext_inherits(ol_control_ProgressBar, ol_control_Control);

/** Set the control visibility
 * @param {Number} [n] progress percentage, a number beetween 0,1, default hide progress bar
 */
ol_control_ProgressBar.prototype.setPercent = function (n) {
  this._bar.style.width = ((Number(n) || 0) * 100)+'%';
  if (n===undefined) {
    ol_ext_element.hide(this.element);
  } else {
    ol_ext_element.show(this.element);
  }
};

/** Set waiting text
 * @param {string} label
 */
ol_control_ProgressBar.prototype.setLabel = function (label) {
  this._waiting.innerHTML = label;
};

/** Use a list of tile layer to shown tile load
 * @param {ol_layer_Layer|Array<ol_layer_Layer>} layers a layer or a list of layer
 */
ol_control_ProgressBar.prototype.setLayers = function (layers) {
  // reset
  this._layerlistener.forEach(function (l) {
    ol_Observable_unByKey(l);
  });
  this._layerlistener = [];
  this.setPercent();

  var loading=0, loaded=0;
  if (layers instanceof ol_layer_Layer) layers = [layers];
  if (!layers || !layers.forEach) return;
  var tout;
  // Listeners
  layers.forEach(function(layer) {
    if (layer instanceof ol_layer_Layer) {
      this._layerlistener.push(layer.getSource().on('tileloadstart', function () {
        loading++;
        this.setPercent(loaded/loading);
        clearTimeout(tout);
      }.bind(this)));
      this._layerlistener.push(layer.getSource().on(['tileloadend', 'tileloaderror'], function () {
        loaded++;
        if (loaded === loading) {
          loading = loaded = 0;
          this.setPercent(1);
          tout = setTimeout(this.setPercent.bind(this), 300);
        } else {
          this.setPercent(loaded/loading);
        }
      }.bind(this)));
    }
  }.bind(this));
}

export default ol_control_ProgressBar
