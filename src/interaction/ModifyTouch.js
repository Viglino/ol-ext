/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_interaction_Modify from 'ol/interaction/Modify.js'
import ol_Overlay_Popup from '../overlay/Popup.js'
import {boundingExtent as ol_extent_boundingExtent} from 'ol/extent.js'

/** Modify interaction with a popup to delet a point on touch device
 * @constructor
 * @fires showpopup
 * @fires hidepopup
 * @extends {ol.interaction.Modify}
 * @param {olx.interaction.ModifyOptions} options
 * @param {String|undefined} options.title title to display, default "remove point"
 * @param {String|undefined} options.className CSS class name for the popup
 * @param {String|undefined} options.positioning positioning for the popup
 * @param {Number|Array<number>|undefined} options.offsetBox offset box for the popup
 * @param {Boolean|undefined} options.usePopup use a popup, default true
 */
var ol_interaction_ModifyTouch = class olinteractionModifyTouch extends ol_interaction_Modify {
  constructor(options) {
    options = options || {};

    // Check if there is a feature to select
    var pixelTolerance = options.pixelTolerance || 0;
    var searchDist = pixelTolerance + 5;
    options.condition = function (e) {
      var features = this.getMap().getFeaturesAtPixel(e.pixel, {
        hitTolerance: searchDist
      });
      var p0, p1, found = false;
      if (features) {
        var search = this._features;
        if (!search) {
          p0 = [e.pixel[0] - searchDist, e.pixel[1] - searchDist];
          p1 = [e.pixel[0] + searchDist, e.pixel[1] + searchDist];
          p0 = this.getMap().getCoordinateFromPixel(p0);
          p1 = this.getMap().getCoordinateFromPixel(p1);
          var ext = ol_extent_boundingExtent([p0, p1]);
          search = this._source.getFeaturesInExtent(ext);
        }
        if (search.getArray)
          search = search.getArray();
        for (var i = 0, f; f = features[i]; i++) {
          if (search.indexOf(f) >= 0)
            break;
        }
        if (f) {
          p0 = e.pixel;
          p1 = f.getGeometry().getClosestPoint(e.coordinate);
          p1 = this.getMap().getPixelFromCoordinate(p1);
          var dx = p0[0] - p1[0];
          var dy = p0[1] - p1[1];
          found = (Math.sqrt(dx * dx + dy * dy) < searchDist);
        }
      }
      // Show popup if any
      this.showDeleteBt(found ? { type: 'show', feature: f, coordinate: e.coordinate } : { type: 'hide' });

      return true;
    };

    // Hide popup on insert
    options.insertVertexCondition = function () {
      this.showDeleteBt({ type: 'hide' });
      return true;
    };

    super(options);

    this._popup = new ol_Overlay_Popup({
      popupClass: options.className || 'modifytouch',
      positioning: options.positioning || 'bottom-rigth',
      offsetBox: options.offsetBox || 10
    });

    this._source = options.source;
    this._features = options.features;

    // popup content
    var a = document.createElement('a');
    a.appendChild(document.createTextNode(options.title || "remove point"));
    a.onclick = function () {
      this.removePoint();
    }.bind(this);
    this.setPopupContent(a);

    this.on(['modifystart', 'modifyend'], function () {
      this.showDeleteBt({ type: 'hide', modifying: true });
    });

    // Use a popup ?
    this.set('usePopup', options.usePopup !== false);
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    if (this.getMap()) {
      this.getMap().removeOverlay(this._popup);
    }
    super.setMap(map);
    if (this.getMap()) {
      this.getMap().addOverlay(this._popup);
    }
  }
  /** Activate the interaction and remove popup
   * @param {Boolean} b
   */
  setActive(b) {
    super.setActive(b);
    this.showDeleteBt({ type: 'hide' });
  }
  /**
   * Remove the current point
   */
  removePoint() {
    // Prevent touch + click on popup 
    if (new Date() - this._timeout < 200) return;
    // Remove point
    super.removePoint();
    this.showDeleteBt({ type: 'hide' });
  }
  /**
   * Show the delete button (menu)
   * @param {Event} e
   * @api stable
   */
  showDeleteBt(e) {
    if (!this._popup) return;
    if (this.get('usePopup') && e.type === 'show') {
      this._popup.show(e.coordinate, this._menu);
    } else {
      this._popup.hide();
    }
    e.type += 'popup';
    this.dispatchEvent(e);
    // Date if popup start a timeout to prevent touch + click on the popup
    this._timeout = new Date();
  }
  /**
   * Change the popup content
   * @param {DOMElement} html
   */
  setPopupContent(html) {
    this._menu = html;
  }
  /**
   * Get the popup content
   * @return {DOMElement}
   */
  getPopupContent() {
    return this._menu;
  }
}

export default ol_interaction_ModifyTouch
