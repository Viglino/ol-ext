import { Map as _ol_Map_ } from 'ol';
import { Layer } from 'ol/layer';
import { LayerSwitcher } from './LayerSwitcher';
/**
 * @classdesc OpenLayers Layer Switcher Contr
 * @require layer.getPreview
 *
 * @constructor
 * @extends {contrLayerSwitcher}
 * @param {Object=} options Control options.
 */
export class LayerSwitcherImage extends LayerSwitcher {
    constructor(options?: any);
    /** Render a list of layer
     * @param {elt} element to render
     * @layers {Array{layer}} list of layer to show
     * @api stable
     */
    drawList(element: Element): void;
    /** Disable overflow
     */
    overflow(): void;
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
    /** Set the layer associated with a li
     * @param {Element} li
     * @param {layer} layer
     */
    _setLayerForLI(li: Element, layer: Layer): void;
    /** Get the layer associated with a li
     * @param {Element} li
     * @return {layer}
     */
    _getLayerForLI(li: Element): Layer;
    /**
     *	Draw the panel control (prevent multiple draw due to layers manipulation on the map with a delay function)
     */
    drawPanel(): void;
    /** Change layer visibility according to the baselayer option
     * @param {layer}
     * @param {Array<layer>} related layers
     */
    switchLayerVisibility(l: Layer, related: Layer[]): void;
    /** Check if layer is on the map (depending on zoom and Extent)
     * @param {layer}
     * @return {boolean}
     */
    testLayerVisibility(layer: Layer): boolean;
}
