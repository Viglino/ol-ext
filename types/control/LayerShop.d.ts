export default ol_control_LayerShop;
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
declare class ol_control_LayerShop {
    constructor(options: any);
    _topbar: any;
    _bottombar: HTMLElement | Text;
    _controls: any[];
    /** Set the map instance the control is associated with.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Get the bar element (to add new element in it)
     * @param {string} [position='top'] bar position bottom or top, default top
     * @returns {Element}
     */
    getBarElement(position?: string): Element;
    /** Add a control to the panel
     * @param {ol_control_Control} control
     * @param {string} [position='top'] bar position bottom or top, default top
     */
    addControl(control: ol_control_Control, position?: string): void;
}
