export default ol_control_Select;
/**
 * Select Control.
 * A control to select features by attributes
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.source the source to search in
 *  @param {string} [options.selectLabel=select] select button label
 *  @param {string} [options.addLabel=add] add button label
 *  @param {string} [options.caseLabel=case sensitive] case checkbox label
 *  @param {string} [options.allLabel=match all] match all checkbox label
 *  @param {string} [options.attrPlaceHolder=attribute]
 *  @param {string} [options.valuePlaceHolder=value]
 */
declare class ol_control_Select {
    constructor(options: any);
    _ul: HTMLElement | Text;
    _all: HTMLElement | Text;
    _useCase: HTMLElement | Text;
    _conditions: any[];
    /** Add a new condition
     * @param {*} options
     * 	@param {string} options.attr attribute name
     * 	@param {string} options.op	operator
     * 	@param {string} options.val attribute value
     */
    addCondition(options: any): void;
    /** Get the condition list
     */
    getConditions(): {
        usecase: any;
        all: any;
        conditions: any[];
    };
    /** Set the condition list
     */
    setConditions(cond: any): void;
    /** Get the conditions as string
     */
    getConditionsString(cond: any): string;
    /** Draw the liste
     * @private
     */
    private _drawlist;
    /** Get a line
     * @return {*}
     * @private
     */
    private _autocomplete;
    /** Get a line
     * @return {*}
     * @private
     */
    private _getLiCondition;
    /** Remove the ith condition
     * @param {int} i condition index
     */
    removeCondition(i: int): void;
    /** Select features by attributes
     * @param {*} options
     *  @param {Array<ol.source.Vector>|undefined} options.sources source to apply rules, default the select sources
     *  @param {bool} options.useCase case sensitive, default checkbox state
     *  @param {bool} options.matchAll match all conditions, , default checkbox state
     *  @param {Array<conditions>} options.conditions array of conditions
     * @fires select
     */
    doSelect(options: any): any;
}
