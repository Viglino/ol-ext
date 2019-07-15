import { Map as _ol_Map_ } from 'ol';
import Collection from 'ol/Collection';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { CanvasBase } from './CanvasBase';
/**
 * Draw a grid reference on the map and add an index.
 *
 * @constructor
 * @extends {contrCanvasBase}
 * @fires select
 * @param {Object=} Control options.
 *  @param {Style} options.style Style to use for drawing the grid (stroke and text), default black.
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {Extent} options.Extent Extent of the grid, required
 *  @param {Size} options.Size number of lines and cols, required
 *  @param {number} options.margin margin to display text (in px), default 0px
 *  @param {VectorSource} options.source source to use for the index, default none (use setIndex to reset the index)
 *  @param {string | function} options.property a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
 *  @param {function|undefined} options.sortFeatures sort function to sort 2 features in the index, default sort on property option
 *  @param {function|undefined} options.indexTitle a function that takes a feature and return the title to display in the index, default the first letter of property option
 *  @param {string} options.filterLabel label to display in the search bar, default 'filter'
 */
export class GridReference extends CanvasBase {
    constructor(Control?: any);
    /** Returns the text to be displayed in the index
     * @param {Feature} f the feature
     * @return {string} the text to be displayed in the index
     * @api
     */
    getFeatureName(f: Feature): string;
    /** Sort function
     * @param {Feature} a first feature
     * @param {Feature} b second feature
     * @return {Number} 0 if a==b, -1 if a<b, 1 if a>b
     * @api
     */
    sortFeatures(a: Feature, b: Feature): number;
    /** Get the feature title
     * @param {Feature} f
     * @return the first letter of the eature name (getFeatureName)
     * @api
     */
    indexTitle(f: Feature): any;
    /** Display features in the index
     * @param { Array<Feature> | Collection<Feature> } features
     */
    setIndex(features: Feature[] | Collection<Feature>): void;
    /** Get reference for a coord
    *	@param {Coordinate} coords
    *	@return {string} the reference
     */
    getReference(coords: Coordinate): string;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Get canvas overlay
     */
    getCanvas(): void;
    /** Set Style
     * @api
     */
    setStyle(): void;
    /** Get style
     * @api
     */
    getStyle(): void;
    /** Get stroke
     * @api
     */
    getStroke(): void;
    /** Get fill
     * @api
     */
    getFill(): void;
    /** Get stroke
     * @api
     */
    getTextStroke(): void;
    /** Get text fill
     * @api
     */
    getTextFill(): void;
    /** Get text font
     * @api
     */
    getTextFont(): void;
}
