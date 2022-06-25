export default ol_ext_input_Collection;
/** A list element synchronize with a Collection.
 * Element in the list can be reordered interactively and the associated Collection is kept up to date.
 * @constructor
 * @fires item:select
 * @fires item:dblclick
 * @fires item:order
 * @extends {ol_Object}
 * @param {*} options
 *  @param {Element} [options.target]
 *  @param {Collection} [options.collection]  the collection to display in the list
 *  @param {function} [options.getTitle] a function that takes a collection item and returns an Element or a string
 */
declare class ol_ext_input_Collection {
    constructor(options: any);
    element: HTMLElement | Text;
    collection: any;
    _title: any;
    /** Select an item
     * @param {*} item
     */
    select(item: any): void;
    _currentItem: any;
    /** Select an item at
     * @param {number} n
     */
    selectAt(n: number): void;
    /** Get current selection
     * @returns {*}
     */
    getSelect(): any;
    /** Get current selection
     * @returns {number}
     */
    getSelectPosition(): number;
    /** Redraw the list
     */
    refresh(): void;
    _listElt: any[];
}
