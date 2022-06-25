export default ol_control_LayerPopup;
/**
 * OpenLayers Layer Switcher Control.
 *
 * @constructor
 * @extends {ol_control_LayerSwitcher}
 * @param {Object=} options Control options.
 */
declare class ol_control_LayerPopup {
    constructor(options: any);
    /** Disable overflow
    */
    overflow(): void;
    /** Render a list of layer
     * @param {elt} element to render
     * @layers {Array{ol.layer}} list of layer to show
     * @api stable
     */
    drawList(ul: any, layers: any): void;
}
