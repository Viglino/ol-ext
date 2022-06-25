export default ol_control_Imageline;
/** Image line control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Array<ol.source.Vector>|ol.source.Vector} options.source vector sources that contains the images
 *	@param {Array<ol.layer.Vector>} options.layers A list of layers to display images. If no source and no layers, all visible layers will be considered.
 *	@param {function} options.getImage a function that gets a feature and return the image url or false if no image to Show, default return the img propertie
 *	@param {function} options.getTitle a function that gets a feature and return the title, default return an empty string
 *	@param {boolean} options.collapsed the line is collapse, default false
 *	@param {boolean} options.collapsible the line is collapsible, default false
 *	@param {number} options.maxFeatures the maximum image element in the line, default 100
 *	@param {number} options.useExtent only show feature in the current extent
 *	@param {boolean} options.hover select image on hover, default false
 *	@param {string|boolean} options.linkColor link color or false if no link, default false
 */
declare class ol_control_Imageline {
    constructor(options: any);
    _sources: any;
    /** Default function to get an image of a feature
     * @param {ol.Feature} f
     * @private
     */
    private _getImage;
    /** Default function to get an image title
     * @param {ol.Feature} f
     * @private
     */
    private _getTitle;
    /**
     * Remove the control from its current map and attach it to the new map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _listener: any[];
    /** Set layers to use in the control
     * @param {Array<ol.Layer} layers
     */
    setLayers(layers: Array<ol.Layer>): void;
    /** Get source from a set of layers
     * @param {Array<ol.Layer} layers
     * @returns {Array<ol.source.Vector}
     * @private
     */
    private _getSources;
    /** Set useExtent param and refresh the line
     * @param {boolean} b
     */
    useExtent(b: boolean): void;
    /** Is the line collapsed
     * @return {boolean}
     */
    isCollapsed(): boolean;
    /** Collapse the line
     * @param {boolean} b
     */
    collapse(b: boolean): void;
    /** Collapse the line
     */
    toggle(): void;
    /**
     * Get features
     * @return {Array<ol.Feature>}
     */
    getFeatures(): Array<ol.Feature>;
    /** Set element scrolling with a acceleration effect on desktop
     * (on mobile it uses the scroll of the browser)
     * @private
     */
    private _setScrolling;
    _scrolldiv: HTMLElement | Text;
    /** Set element scrolling with a acceleration effect on desktop
     * (on mobile it uses the scroll of the browser)
     * @private
     */
    private _updateScrollBounds;
    /**
     * Refresh the imageline with new data
     */
    refresh(): void;
    _iline: any[];
    /** Center image line on a feature
     * @param {ol.feature} feature
     * @param {boolean} scroll scroll the line to center on the image, default true
     * @api
     */
    select(feature: ol.feature, scroll: boolean): void;
    _select: boolean;
    /** Draw link on the map
     * @private
     */
    private _drawLink;
}
