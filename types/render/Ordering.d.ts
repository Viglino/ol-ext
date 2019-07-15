/** Ordering function for layer.Vector renderOrder parameter
*	ordering.fn (options)
*	It will return an ordering function (f0,f1)
*	@namespace
 */
    /** y-Ordering
    *	@return ordering function (f0,f1)
     */
   export function yOrdering(): any;
    /** Order with a feature attribute
     * @param options
     *  @param {string} options.attribute ordering attribute, default zIndex
     *  @param {function} options.equalFn ordering function for equal values
     * @return ordering function (f0,f1)
     */
   export  function zIndex(options: {
        attribute: string;
        equalFn: (...params: any[]) => any;
    }): any;

