export default ol_control_LayerSwitcherImage;
/**
 * @classdesc OpenLayers Layer Switcher Control.
 * @require layer.getPreview
 *
 * @constructor
 * @extends {ol_control_LayerSwitcher}
 * @param {Object=} options Control options.
 */
declare class ol_control_LayerSwitcherImage {
    constructor(options: any);
    /** Render a list of layer
     * @param {elt} element to render
     * @layers {Array{ol.layer}} list of layer to show
     * @api stable
     */
    drawList(ul: any, layers: any): void;
    /** Disable overflow
    */
    overflow(): void;
}
