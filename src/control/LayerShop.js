/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_element from '../util/element.js'
import ol_control_LayerSwitcher from '../control/LayerSwitcher.js'

/** LayerShop a layer switcher with special controls to handle operation on layers.
 * @fires select
 * @fires drawlist
 * @fires toggle
 * @fires reorder-start
 * @fires reorder-end
 * @fires layer:visible
 * @fires layer:opacity
 * 
 * @constructor
 * @extends {ol_control_LayerSwitcher}
 * @param {Object=} options
 *  @param {boolean} options.selection enable layer selection when click on the title
 *  @param {function} options.displayInLayerSwitcher function that takes a layer and return a boolean if the layer is displayed in the switcher, default test the displayInLayerSwitcher layer attribute
 *  @param {boolean} options.show_progress show a progress bar on tile layers, default false
 *  @param {boolean} options.mouseover show the panel on mouseover, default false
 *  @param {boolean} options.reordering allow layer reordering, default true
 *  @param {boolean} options.trash add a trash button to delete the layer, default false
 *  @param {function} options.oninfo callback on click on info button, if none no info button is shown DEPRECATED: use on(info) instead
 *  @param {boolean} options.extent add an extent button to zoom to the extent of the layer
 *  @param {function} options.onextent callback when click on extent, default fits view to extent
 *  @param {number} options.drawDelay delay in ms to redraw the layer (usefull to prevent flickering when manipulating the layers)
 *  @param {boolean} options.collapsed collapse the layerswitcher at beginning, default true
 *  @param {ol.layer.Group} options.layerGroup a layer group to display in the switcher, default display all layers of the map
 *  @param {boolean} options.noScroll prevent handle scrolling, default false
 *
 * Layers attributes that control the switcher
 *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
 *	- displayInLayerSwitcher {boolean} display the layer in switcher, default true
 *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
 */
var ol_control_LayerShop = class olcontrolLayerShop extends ol_control_LayerSwitcher {
  constructor(options) {

    options = options || {};
    options.selection = true;
    options.noScroll = true;

    super(options);
    this.element.classList.add('ol-layer-shop');

    // Control title (selected layer)
    var title = this.element.insertBefore(ol_ext_element.create('DIV', { className: 'ol-title-bar' }), this.getPanel());
    this.on('select', function (e) {
      title.innerText = e.layer ? e.layer.get('title') : '';
      this.element.setAttribute('data-layerClass', this.getLayerClass(e.layer));
    }.bind(this));

    // Top/bottom bar
    this._topbar = this.element.insertBefore(ol_ext_element.create('DIV', {
      className: 'ol-bar ol-top-bar'
    }), this.getPanel());
    this._bottombar = ol_ext_element.create('DIV', {
      className: 'ol-bar ol-bottom-bar',
      parent: this.element
    });

    this._controls = [];
  }
  /** Set the map instance the control is associated with.
   * @param {_ol_Map_} map The map instance.
   */
  setMap(map) {
    if (this.getMap()) {
      // Remove map controls
      this._controls.forEach(function (c) {
        this.getMap().removeControl(c);
      }.bind(this));
    }

    super.setMap(map);

    if (map) {
      // Select first layer
      this.selectLayer();
      // Remove a layer
      this._listener.removeLayer = map.getLayers().on('remove', function (e) {
        // Select first layer
        if (e.element === this.getSelection()) {
          this.selectLayer();
        }
      }.bind(this));
      // Add controls
      this._controls.forEach(function (c) {
        this.getMap().addControl(c);
      }.bind(this));
    }
  }
  /** Get the bar element (to add new element in it)
   * @param {string} [position='top'] bar position bottom or top, default top
   * @returns {Element}
   */
  getBarElement(position) {
    return position === 'bottom' ? this._bottombar : this._topbar;
  }
  /** Add a control to the panel
   * @param {ol_control_Control} control
   * @param {string} [position='top'] bar position bottom or top, default top
   */
  addControl(control, position) {
    this._controls.push(control);
    control.setTarget(position === 'bottom' ? this._bottombar : this._topbar);
    if (this.getMap()) {
      this.getMap().addControl(control);
    }
  }
}

export default ol_control_LayerShop
