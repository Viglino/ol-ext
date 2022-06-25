export default ol_filter_CSS;
/** Add a mix-blend-mode CSS filter (not working with IE or ol<6).
 * Add a className to the layer to apply the filter to a specific layer.
 * With ol<6 use {@link ol_filter_Composite} instead.
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options
 *  @param {string} options.blend mix-blend-mode to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode CSS property})
 *  @param {string} options.filter filter to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter CSS property})
 *  @param {boolan} options.display show/hide layer from CSS (but keep it in layer list)
 */
declare class ol_filter_CSS {
    constructor(options: any);
    _layers: any[];
    /** Modify blend mode
     * @param {string} blend mix-blend-mode to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode CSS property})
     */
    setBlend(blend: string): void;
    /** Modify filter mode
     * @param {string} filter filter to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter CSS property})
     */
    setFilter(filter: string): void;
    /** Modify layer visibility (but keep it in the layer list)
     * @param {bolean} display
     */
    setDisplay(display: bolean): void;
    /** Add CSS filter to the layer
     * @param {ol_layer_Base} layer
     */
    addToLayer(layer: ol_layer_Base): void;
    /** Remove CSS filter from the layer
     * @param {ol_layer_Base} layer
     */
    removeFromLayer(layer: ol_layer_Base): void;
}
