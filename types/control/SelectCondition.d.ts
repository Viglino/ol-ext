export default ol_control_SelectCondition;
/**
 * Select features by property using a condition
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {string} options.label control label, default 'condition'
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {condition|Array<condition>} options.condition conditions
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
declare class ol_control_SelectCondition {
    constructor(options: any);
    _check: HTMLElement | Text;
    _input: HTMLElement | Text;
    _selectAll: any;
    _onchoice: any;
    /** Set condition to select on
     * @param {condition | Array<condition>} condition
     *  @param {string} attr property to select on
     *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
     *  @param {*} val value to select on
     */
    setCondition(condition: any): void;
    _conditions: any[];
    /** Add a condition to select on
     * @param {condition} condition
     *  @param {string} attr property to select on
     *  @param {string} op operator (=, !=, <; <=, >, >=, contain, !contain, regecp)
     *  @param {*} val value to select on
     */
    addCondition(condition: any): void;
    /** Select features by condition
     */
    doSelect(options: any): any;
}
