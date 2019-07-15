/** Filters are effects that render over a map or a layer.
 * Use the map methods to add or remove filter on a map
 * ({@link Map#addFilter}, {@link Map#removeFilter}, {@link Map#getFilters}).
 * Use the layer methods to add or remove filter on a layer
 * ({@link layer.Base#addFilter}, {@link layer.Base#removeFilter}, {@link layer.Base#getFilters}).
 * @namespace filter
 */
/**
 * @classdesc
 * Abstract base class; normally only used for creating subclasses and not instantiated in apps.
 * Used to create filters
 * Use {@link _ol_Map_#addFilter}, {@link _ol_Map_#removeFilter} or {@link _ol_Map_#getFilters} to handle filters on a map.
 * Use {@link layer.Base#addFilter}, {@link layer.Base#removeFilter} or {@link layer.Base#getFilters}
 * to handle filters on layers.
 *
 * @constructor
 * @extends {Object}
 * @param {Object} options Extend {@link _ol_control_Control_} options.
 *  @param {boolean} [options.active]
 */
export abstract class Base extends Object {
    constructor(options: {
        active?: boolean;
    });
    /** Activate / deactivate filter
    *	@param {boolean} b
     */
    setActive(b: boolean): void;
    /** Get filter active
    *	@return {boolean}
     */
    getActive(): boolean;
}
/** Add a filter to an Map
*	@param {filter}
 */
export function addFilter(filter: Base): void;
/** Remove a filter to an Map
*	@param {filter}
 */
export function removeFilter(filter: Base): void;
/** Get filters associated with an Map
*	@return {Array<filter>}
 */
export function getFilters(): Base[];