import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
import { Layer } from 'ol/layer';
/**
 * @classdesc OpenLayers 3 Layer Switcher Contr
 * @fires drawlist
 * @fires toggle
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options
 *  @param {function} options.displayInLayerSwitcher function that takes a layer and return a boolean if the layer is displayed in the switcher, default test the displayInLayerSwitcher layer attribute
 *  @param {boolean} options.show_progress show a progress bar on tile layers, default false
 *  @param {boolean} options.mouseover show the panel on mouseover, default false
 *  @param {boolean} options.reordering allow layer reordering, default true
 *  @param {boolean} options.trash add a trash button to delete the layer, default false
 *  @param {function} options.oninfo callback on click on info button, if none no info button is shown DEPRECATED: use on(info) instead
 *  @param {boolean} options.Extent add an Extent button to zoom to the Extent of the layer
 *  @param {function} options.onExtent callback when click on Extent, default fits view to Extent
 *  @param {number} options.drawDelay delay in ms to redraw the layer (usefull to prevent flickering when manipulating the layers)
 *  @param {boolean} options.collapsed collapse the layerswitcher at beginning, default true
 *
 * Layers attributes that control the switcher
 *	- allwaysOnTop {boolean} true to force layer stay on top of the others while reordering, default false
 *	- displayInLayerSwitcher {boolean} display in switcher, default true
 *	- noSwitcherDelete {boolean} to prevent layer deletion (w. trash option = true), default false
 */
export class LayerSwitcher extends ol_control_Control {
    constructor(options?: {
        displayInLayerSwitcher: (...params: any[]) => any;
        show_progress: boolean;
        mouseover: boolean;
        reordering: boolean;
        trash: boolean;
        oninfo: (...params: any[]) => any;
        Extent: boolean;
        onExtent: (...params: any[]) => any;
        drawDelay: number;
        collapsed: boolean;
    });
    /** List of tips for internationalization purposes
     */
    tip: any;
    /** Test if a layer should be displayed in the switcher
     * @param {layer} layer
     * @return {boolean} true if the layer is displayed
     */
    displayInLayerSwitcher(layer: Layer): boolean;
    /**
     * Set the map instance the control is associated with.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
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
     *	@param {Number} dir scroll direction -1|0|1|'+50%'|'-50%'
     */
    overflow(dir: number): void;
    /** Set the layer associated with a li
     * @param {Element} li
     * @param {layer} layer
     */
    _setLayerForLI(li: Element, layer: Layer): void;
    /** Get the layer associated with a li
     * @param {Element} li
     * @return {Layer}
     */
    _getLayerForLI(li: Element): Layer;
    /**
     *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
     */
    drawPanel(): void;
    /** Change layer visibility according to the baselayer option
     * @param {Layer}
     * @param {Array<layer>} related layers
     */
    switchLayerVisibility(l: Layer, related: Layer[]): void;
    /** Check if Layer is on the map (depending on zoom and Extent)
     * @param {Layer}
     * @return {boolean}
     */
    testLayerVisibility(layer: Layer): boolean;
    /** Render a list of layer
     * @param {Elemen} element to render
     * @layers {Array{layer}} list of layer to show
     * @api stable
     */
    drawList(element: Element): void;
}
