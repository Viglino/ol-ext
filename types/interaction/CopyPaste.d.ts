export default ol_interaction_CopyPaste;
/** An interaction to copy/paste features on a map.
 * It will fire a 'focus' event on the map when map is focused (use mapCondition option to handle the condition when the map is focused).
 * @constructor
 * @fires focus
 * @fires copy
 * @fires paste
 * @extends {ol_interaction_Interaction}
 * @param {Object} options Options
 *  @param {function} options.condition a function that takes a mapBrowserEvent and return the action to perform: 'copy', 'cut' or 'paste', default Ctrl+C / Ctrl+V
 *  @param {function} options.mapCondition a function that takes a mapBrowserEvent and return true if the map is the active map, default always returns true
 *  @param {ol.Collection<ol.Feature>} options.features list of features to copy
 *  @param {ol.source.Vector | Array<ol.source.Vector>} options.sources the source to copy from (used for cut), if not defined, it will use the destination
 *  @param {ol.source.Vector} options.destination the source to copy to
 */
declare class ol_interaction_CopyPaste {
    constructor(options: any);
    features: any[];
    _cloneFeature: boolean;
    _featuresSource: any;
    /** Sources to cut feature from
     * @param { ol.source.Vector | Array<ol.source.Vector> } sources
     */
    setSources(sources: ol.source.Vector | Array<ol.source.Vector>): void;
    _source: any[];
    /** Get sources to cut feature from
     * @return { Array<ol.source.Vector> }
     */
    getSources(): Array<ol.source.Vector>;
    /** Source to paste features
     * @param { ol.source.Vector } source
     */
    setDestination(destination: any): void;
    _destination: any;
    /** Get source to paste features
     * @param { ol.source.Vector }
     */
    getDestination(): any;
    /** Get current feature to copy
     * @return {Array<ol.Feature>}
     */
    getFeatures(): Array<ol.Feature>;
    /** Set current feature to copy
     * @param {Object} options
     *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} options.features feature to copy, default get in the provided collection
     *  @param {boolean} options.cut try to cut feature from the sources, default false
     *  @param {boolean} options.silent true to send an event, default true
     */
    copy(options: {
        features: Array<ol.Feature> | ol.Collection<ol.Feature>;
        cut: boolean;
        silent: boolean;
    }): void;
    /** Paste features
     * @param {Object} options
     *  @param {Array<ol.Feature> | ol.Collection<ol.Feature>} features feature to copy, default get current features
     *  @param {ol.source.Vector} options.destination Source to paste to, default the current source
     *  @param {boolean} options.silent true to send an event, default true
     */
    paste(options: any): void;
}
