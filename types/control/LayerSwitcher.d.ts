export default ol_control_LayerSwitcher;
/** Layer Switcher Control.
 * @fires select
 * @fires drawlist
 * @fires toggle
 * @fires reorder-start
 * @fires reorder-end
 * @fires layer:visible
 * @fires layer:opacity
 *
 * @constructor
 * @extends {ol_control_Control}
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
 *  @param {function} options.onchangeCheck optional callback on click on checkbox, you can call this method for doing operations after check/uncheck a layer
 *
 * Layers attributes that control the switcher
 *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
 *	- displayInLayerSwitcher {boolean} display the layer in switcher, default true
 *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
 */
declare class ol_control_LayerSwitcher {
    constructor(options: any);
    dcount: number;
    show_progress: any;
    oninfo: any;
    onextent: any;
    hasextent: any;
    hastrash: any;
    reordering: boolean;
    _layers: any[];
    _layerGroup: any;
    onchangeCheck: any;
    /** Test if a layer should be displayed in the switcher
     * @param {ol.layer} layer
     * @return {boolean} true if the layer is displayed
     */
    displayInLayerSwitcher(layer: ol.layer): boolean;
    button: HTMLElement | Text;
    topv: HTMLElement | Text;
    botv: HTMLElement | Text;
    _noScroll: any;
    panel_: HTMLElement | Text;
    panelContainer_: HTMLElement | Text;
    header_: HTMLElement | Text;
    /**
     * Set the map instance the control is associated with.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    _listener: {
        moveend: any;
        size: any;
    };
    /** Show control
     */
    show(): void;
    /** Hide control
     */
    hide(): void;
    /** Toggle control
     */
    toggle(): void;
    /** Is control open
     * @return {boolean}
     */
    isOpen(): boolean;
    /** Add a custom header
     * @param {Element|string} html content html
     */
    setHeader(html: Element | string): void;
    /** Calculate overflow and add scrolls
     * @param {Number} dir scroll direction -1|0|1|'+50%'|'-50%'
     * @private
     */
    private overflow;
    /** Set the layer associated with a li
     * @param {Element} li
     * @param {ol.layer} layer
     * @private
     */
    private _setLayerForLI;
    /** Set opacity for a layer
     * @param {ol.layer.Layer} layer
     * @param {Element} li the list element
     * @private
     */
    private setLayerOpacity;
    /** Set visibility for a layer
     * @param {ol.layer.Layer} layer
     * @param {Element} li the list element
     * @api
     */
    setLayerVisibility(layer: ol.layer.Layer, li: Element): void;
    /** Clear layers associated with li
     * @private
     */
    private _clearLayerForLI;
    /** Get the layer associated with a li
     * @param {Element} li
     * @return {ol.layer}
     * @private
     */
    private _getLayerForLI;
    /**
     * On view change hide layer depending on resolution / extent
     * @private
     */
    private viewChange;
    /** Get control panel
     * @api
     */
    getPanel(): HTMLElement | Text;
    /** Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
     * @api
     */
    drawPanel(): void;
    /** Delayed draw panel control
     * @private
     */
    private drawPanel_;
    /** Change layer visibility according to the baselayer option
     * @param {ol.layer}
     * @param {Array<ol.layer>} related layers
     * @private
     */
    private switchLayerVisibility;
    /** Check if layer is on the map (depending on resolution / zoom and extent)
     * @param {ol.layer}
     * @return {boolean}
     * @private
     */
    private testLayerVisibility;
    /** Start ordering the list
    *	@param {event} e drag event
    *	@private
    */
    private dragOrdering_;
    /** Change opacity on drag
    *	@param {event} e drag event
    *	@private
    */
    private dragOpacity_;
    dragging_: boolean;
    /** Render a list of layer
     * @param {Elemen} element to render
     * @layers {Array{ol.layer}} list of layer to show
     * @api stable
     * @private
     */
    private drawList;
    /** Select a layer
     * @param {ol.layer.Layer} layer
     * @returns {string} the layer classname
     * @api
     */
    getLayerClass(layer: ol.layer.Layer): string;
    /** Select a layer
     * @param {ol.layer.Layer} layer
     * @api
     */
    selectLayer(layer: ol.layer.Layer, silent: any): void;
    _selectedLayer: ol.layer.Layer;
    /** Get selected layer
     * @returns {ol.layer.Layer}
     */
    getSelection(): ol.layer.Layer;
    /** Handle progress bar for a layer
    *	@private
    */
    private setprogress_;
    /** List of tips for internationalization purposes
    */
    tip: {
        up: string;
        down: string;
        info: string;
        extent: string;
        trash: string;
        plus: string;
    };
}
