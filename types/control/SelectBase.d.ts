import Collection from 'ol/Collection';
import ol_control_Control from 'ol/control/Control';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { condition } from './control';
/**
 * This is the base class for Select controls on attributes values.
 * Abstract base class;
 * normally only used for creating subclasses and not instantiated in apps.
 *
 * @constructor
 * @extends {contrControl}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {Collection<Feature>} options.features a collection of feature to search in, the collection will be kept in date while selection
 *  @param {Vector | Array<Vector>} options.source the source to search in if no features set
 */
export class SelectBase extends ol_control_Control {
    constructor(options?: {
        className: string;
        target: Element | undefined;
        features: Collection<Feature>;
        source: VectorSource | VectorSource[];
    });
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
    /** Select features by attributes
     * @param {*} options
     *  @param {Array<Vector|undefined} options.sources source to apply rules, default the select sources
     *  @param {bool} options.useCase case sensitive, default false
     *  @param {bool} options.matchAll match all conditions, default false
     *  @param {Array<conditions>} options.conditions array of conditions
     * @return {Array<Feature>}
     * @fires select
     */
    doSelect(options: {
        useCase: boolean;
        matchAll: boolean;
        conditions: condition[];
    }): Feature[];
}
