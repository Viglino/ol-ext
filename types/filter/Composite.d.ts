export default ol_filter_Composite;
/** Add a composite filter on a layer.
 * With ol6+ you'd better use {@link ol_filter_CSS} instead.
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {Object} options
 *  @param {string} options.operation composite operation
 */
declare class ol_filter_Composite {
    constructor(options: any);
    /** Change the current operation
    *	@param {string} operation composite function
    */
    setOperation(operation: string): void;
    precompose(e: any): void;
    postcompose(e: any): void;
}
