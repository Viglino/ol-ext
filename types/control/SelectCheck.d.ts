import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { SelectBase } from './SelectBase';
import { condition } from './control';
/**
 * Select features by property using a popup
 *
 * @constructor
 * @extends {contrSelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {Vector | Array<Vector>} options.source the source to search in
 *  @param {string} options.property property to select on
 *  @param {string} options.label control label
 *  @param {number} options.max max feature to test to get the values, default 10000
 *  @param {number} options.selectAll select all features if no option selected
 *  @param {string} options.type check type: checkbox or radio, default checkbox
 *  @param {number} options.defaultLabel label for the default radio button
 *  @param {function|undefined} options.onchoice function triggered when an option is clicked, default doSelect
 */
export class SelectCheck extends SelectBase {
    constructor(options?: {
        className: string;
        target: Element | undefined;
        source: VectorSource | VectorSource[];
        property: string;
        label: string;
        max: number;
        selectAll: number;
        type: string;
        defaultLabel: number;
        onchoice: ((...params: any[]) => any) | undefined;
    });
    /**
    * Set the map instance the control associated with.
    * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Select features by attributes
     */
    doSelect(options: {
        useCase: boolean;
        matchAll: boolean;
        conditions: condition[];
    }): Feature[]; /** Set the popup values
     * @param {Object} options
     *  @param {Object} options.values a key/value list with key = property value, value = title shown in the popup, default search values in the sources
     *  @param {boolean} options.sort sort values
     */
    setValues(options: {
        values: any;
        sort: boolean;
    }): void;
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
