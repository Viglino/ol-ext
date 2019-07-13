import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { SelectBase } from './SelectBase';
import { condition } from './control';
/**
 * Select features by property using a simple text input
 *
 * @constructor
 * @extends {contrSelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {Vector | Array<Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {function|undefined} options.onchoice function triggered the text change, default nothing
 */
export class SelectFulltext extends SelectBase {
    constructor(options?: {
        className: string;
        target: Element | undefined;
        source: VectorSource | VectorSource[];
        property: string;
        onchoice: ((...params: any[]) => any) | undefined;
    });
    /** Select features by condition
     */
    doSelect(options: {
        useCase: boolean;
        matchAll: boolean;
        conditions: condition[];
    }): Feature[]; /** Set the current sources
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
