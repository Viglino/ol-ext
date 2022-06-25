export default ol_ordering;
declare namespace ol_ordering {
    /** y-Ordering
    *	@return ordering function (f0,f1)
    */
    function yOrdering(): (f0: any, f1: any) => number;
    /** Order with a feature attribute
     * @param options
     *  @param {string} options.attribute ordering attribute, default zIndex
     *  @param {function} options.equalFn ordering function for equal values
     * @return ordering function (f0,f1)
     */
    function zIndex(options: any): (f0: any, f1: any) => any;
}
