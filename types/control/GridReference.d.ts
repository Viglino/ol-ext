export default ol_control_GridReference;
/**
 * Draw a grid reference on the map and add an index.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @fires select
 * @param {Object=} Control options.
 *  @param {ol_style_Style} options.style Style to use for drawing the grid (stroke and text), default black.
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {ol.extent} options.extent extent of the grid, required
 *  @param {ol.size} options.size number of lines and cols, required
 *  @param {number} options.margin margin to display text (in px), default 0px
 *  @param {ol.source.Vector} options.source source to use for the index, default none (use setIndex to reset the index)
 *  @param {string | function} options.property a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
 *  @param {function|undefined} options.sortFeatures sort function to sort 2 features in the index, default sort on property option
 *  @param {function|undefined} options.indexTitle a function that takes a feature and return the title to display in the index, default the first letter of property option
 *  @param {string} options.filterLabel label to display in the search bar, default 'filter'
 */
declare class ol_control_GridReference {
    constructor(options: any);
    /** Returns the text to be displayed in the index
     * @param {ol.Feature} f the feature
     * @return {string} the text to be displayed in the index
     * @api
     */
    getFeatureName(f: ol.Feature): string;
    /** Sort function
     * @param {ol.Feature} a first feature
     * @param {ol.Feature} b second feature
     * @return {Number} 0 if a==b, -1 if a<b, 1 if a>b
     * @api
     */
    sortFeatures(a: ol.Feature, b: ol.Feature): number;
    /** Get the feature title
     * @param {ol.Feature} f
     * @return the first letter of the eature name (getFeatureName)
     * @api
     */
    indexTitle(f: ol.Feature): string;
    source_: any;
    /**
     * Set the map instance the control is associated with.
     * @param {ol_Map} map The map instance.
     */
    setMap(map: ol_Map): void;
    /** Display features in the index
     * @param { Array<ol.Feature> | ol.Collection<ol.Feature> } features
     */
    setIndex(features: Array<ol.Feature> | ol.Collection<ol.Feature>): void;
    /** Get reference for a coord
    *	@param {ol.coordinate} coords
    *	@return {string} the reference
    */
    getReference(coords: ol.coordinate): string;
    /** Get vertical index (0,1,2,3...)
     * @param {number} index
     * @returns {string}
     * @api
     */
    getVIndex(index: number): string;
    /** Get horizontal index (A,B,C...)
     * @param {number} index
     * @returns {string}
     * @api
     */
    getHIndex(index: number): string;
    /** Draw the grid
    * @param {ol.event} e postcompose event
    * @private
    */
    private _draw;
}
