export default ol_control_ProgressBar;
/** Add a progress bar to a map.
 * Use the layers option listen to tileload event and show the layer loading progress.
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {String} [options.className] class of the control
 *  @param {String} [options.label] waiting label
 *  @param {ol_layer_Layer|Array<ol_layer_Layer>} [options.layers] tile layers with tileload events
 */
declare class ol_control_ProgressBar {
    constructor(options: any);
    _waiting: HTMLElement | Text;
    _bar: HTMLElement | Text;
    _layerlistener: any[];
    /** Set the control visibility
     * @param {Number} [n] progress percentage, a number beetween 0,1, default hide progress bar
     */
    setPercent(n?: number): void;
    /** Set waiting text
     * @param {string} label
     */
    setLabel(label: string): void;
    /** Use a list of tile layer to shown tile load
     * @param {ol_layer_Layer|Array<ol_layer_Layer>} layers a layer or a list of layer
     */
    setLayers(layers: ol_layer_Layer | Array<ol_layer_Layer>): void;
}
import ol_layer_Layer from "ol/layer/Layer";
