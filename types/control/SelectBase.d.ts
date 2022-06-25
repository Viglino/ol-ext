export default ol_control_SelectBase;
/**
 * This is the base class for Select controls on attributes values.
 * Abstract base class;
 * normally only used for creating subclasses and not instantiated in apps.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element} options.content form element
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol.Collection<ol.Feature>} options.features a collection of feature to search in, the collection will be kept in date while selection
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.source the source to search in if no features set
 *  @param {string} options.btInfo ok button label
 */
declare class ol_control_SelectBase {
    constructor(options: any);
    _features: void;
    /** Set the current sources
     * @param {ol.source.Vector|Array<ol.source.Vector>|undefined} source
     */
    setSources(source: ol.source.Vector | Array<ol.source.Vector> | undefined): void;
    /** Set feature collection to search in
     * @param {ol.Collection<ol.Feature>} features
     */
    setFeatures(features: ol.Collection<ol.Feature>): void;
    /** Get feature collection to search in
     * @return {ol.Collection<ol.Feature>}
     */
    getFeatures(): ol.Collection<ol.Feature>;
    /** Escape string for regexp
     * @param {string} search
     * @return {string}
     */
    _escape(s: any): string;
    /**
     * Test if a feature check aconditino
     * @param {ol.Feature} f the feature to check condition
     * @param {Object} condition an object to use for test
     *  @param {string} condition.attr attribute name
     *  @param {string} condition.op operator
     *  @param {any} condition.val value to test
     * @param {boolean} usecase use case or not when testing strings
     * @return {boolean}
     * @private
     */
    private _checkCondition;
    /** Selection features in a list of features
     * @param {Array<ol.Feature>} result the current list of features
     * @param {Array<ol.Feature>} features to test in
     * @param {Object} condition
     *  @param {string} condition.attr attribute name
     *  @param {string} condition.op operator
     *  @param {any} condition.val value to test
     * @param {boolean} all all conditions must be valid
     * @param {boolean} usecase use case or not when testing strings
     */
    _selectFeatures(result: Array<ol.Feature>, features: Array<ol.Feature>, conditions: any, all: boolean, usecase: boolean): ol.Feature[];
    /** Get vector source
     * @return {Array<ol.source.Vector>}
     */
    getSources(): Array<ol.source.Vector>;
    /** Select features by attributes
     * @param {*} options
     *  @param {Array<ol.source.Vector>|undefined} options.sources source to apply rules, default the select sources
     *  @param {bool} options.useCase case sensitive, default false
     *  @param {bool} options.matchAll match all conditions, default false
     *  @param {Array<conditions>} options.conditions array of conditions
     * @return {Array<ol.Feature>}
     * @fires select
     */
    doSelect(options: any): Array<ol.Feature>;
    /** List of operators / translation
     * @api
     */
    operationsList: {
        '=': string;
        '!=': string;
        '<': string;
        '<=': string;
        '>=': string;
        '>': string;
        contain: string;
        '!contain': string;
        regexp: string;
        '!regexp': string;
    };
}
