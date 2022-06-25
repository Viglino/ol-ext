export default ol_filter_SVGFilter;
/** Add a canvas Context2D SVG filter to a layer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {ol_ext_SVGFilter|Array<ol_ext_SVGFilter>} filters
 */
declare class ol_filter_SVGFilter {
    constructor(filters: any);
    _svg: {};
    /** Add a new svg filter
     * @param {ol.ext.SVGFilter} filter
     */
    addSVGFilter(filter: ol.ext.SVGFilter): void;
    /** Remove a svg filter
     * @param {ol.ext.SVGFilter} filter
     */
    removeSVGFilter(filter: ol.ext.SVGFilter): void;
    /**
     * @private
     */
    private precompose;
    /**
     * @private
     */
    private postcompose;
}
