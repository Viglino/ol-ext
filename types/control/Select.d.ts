import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { SelectBase } from './SelectBase';
import { condition } from './control';
/**
 * Select Contr
 * A control to select features by attributes
 *
 * @constructor
 * @extends {contrSelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {Vector | Array<Vector>} options.source the source to search in
 *  @param {string} [options.selectLabel=select] select button label
 *  @param {string} [options.addLabel=add] add button label
 *  @param {string} [options.caseLabel=case sensitive] case checkbox label
 *  @param {string} [options.allLabel=match all] match all checkbox label
 *  @param {string} [options.attrPlaceHolder=attribute]
 *  @param {string} [options.valuePlaceHolder=value]
 */
export class Select extends SelectBase {
    constructor(options?: {
        className: string;
        target: Element | undefined;
        source: VectorSource | VectorSource[];
        selectLabel?: string;
        addLabel?: string;
        caseLabel?: string;
        allLabel?: string;
        attrPlaceHolder?: string;
        valuePlaceHolder?: string;
    });
    /** Add a new condition
     * @param {*} options
     * 	@param {string} options.attr attribute name
     * 	@param {string} options.op	operator
     * 	@param {string} options.val attribute value
     */
    addCondition(options: {
        attr: string;
        op: string;
        val: string;
    }): void;
    /** Get the condition list
     */
    getConditions(): void;
    /** Set the condition list
     */
    setConditions(): void;
    /** Get the conditions as string
     */
    getConditionsString(): void;
    /** Remove the ith condition
     * @param {number} i condition index
     */
    removeCondition(i: number): void;
    /** Select features by attributes
     * @param {*} options
     *  @param {Array<Vector|undefined} options.sources source to apply rules, default the select sources
     *  @param {bool} options.useCase case sensitive, default checkbox state
     *  @param {bool} options.matchAll match all conditions, , default checkbox state
     *  @param {Array<conditions>} options.conditions array of conditions
     * @fires select
     */
    doSelect(options: {
        useCase: boolean;
        matchAll: boolean;
        conditions: condition[];
    }): Feature[];
    /** Set the current sources
     * @param {VectorSource|Array<VectorSource>|undefined} source
     */
    setSources(source: VectorSource | VectorSource[] | undefined): void;
    /** Set feature collection to search in
     * @param {Collection<Feature>} features
     */
    setFeatures(features: Collection<Feature>): void;
    /** Get feature collection to search in
     * @return {Collection<Feature>}
     */
    getFeatures(): Collection<Feature>;
    /** List of operators / translation
     * @api
     */
    operationsList: any;
    /** Escape string for regexp
     * @param {string} search
     * @return {string}
     */
    _escape(search: string): string;
    /** Selection features in a list of features
     * @param {Array<Feature>} result the current list of features
     * @param {Array<Feature>} features to test in
     * @param {Object} condition
     *  @param {string} condition.attr attribute name
     *  @param {string} condition.op operator
     *  @param {any} condition.val value to test
     * @param {boolean} all all conditions must be valid
     * @param {boolean} usecase use case or not when testing strings
     */
    _selectFeatures(result: Feature[], features: Feature[], condition: {
        attr: string;
        op: string;
        val: any;
    }, all: boolean, usecase: boolean): void;
    /** Get vector source
     * @return {Array<VectorSource>}
     */
    getSources(): VectorSource[];
}
