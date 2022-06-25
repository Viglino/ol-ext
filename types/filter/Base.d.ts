export default ol_filter_Base;
export var ol_filter: {};
/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not instantiated in apps.
 * Used to create filters
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * to handle filters on layers.
 *
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options
 *  @param {boolean} [options.active]
 */
declare class ol_filter_Base {
    constructor(options: any);
    _listener: any[];
    /** Activate / deactivate filter
    *	@param {boolean} b
    */
    setActive(b: boolean): void;
    /** Get filter active
    *	@return {boolean}
    */
    getActive(): boolean;
}
