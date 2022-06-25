export default ol_source_BinBase;
/** Abstract base class; normally only used for creating subclasses. Bin collector for data
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {boolean} options.listenChange listen changes (move) on source features to recalculate the bin, default true
 *  @param {fucntion} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
declare class ol_source_BinBase {
    constructor(options: any);
    _bindModify: any;
    _watch: boolean;
    _origin: any;
    _listen: boolean;
    _geomFn: any;
    /** Create bin attributes using the features it contains when exporting
     * @param {ol.Feature} bin the bin to export
     * @param {Array<ol.Features>} features the features it contains
     */
    _flatAttributes(): void;
    /**
     * On add feature
     * @param {ol.events.Event} e
     * @param {ol.Feature} bin
     * @private
     */
    private _onAddFeature;
    /**
     *  On remove feature
     *  @param {ol.events.Event} e
     *  @param {ol.Feature} bin
     *  @private
     */
    private _onRemoveFeature;
    /** When clearing features remove the listener
     * @private
     */
    private _onClearFeature;
    /**
     * Get the bin that contains a feature
     * @param {ol.Feature} f the feature
     * @return {ol.Feature} the bin or null it doesn't exit
     */
    getBin(feature: any): ol.Feature;
    /** Get the grid geometry at the coord
     * @param {ol.Coordinate} coord
     * @param {Object} attributes add key/value to this object to add properties to the grid feature
     * @returns {ol.geom.Polygon}
     * @api
     */
    getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
    /** Get the bean at a coord
     * @param {ol.Coordinate} coord
     * @param {boolean} create true to create if doesn't exit
     * @return {ol.Feature} the bin or null it doesn't exit
     */
    getBinAt(coord: ol.Coordinate, create: boolean): ol.Feature;
    /**
     *  A feature has been modified
     *  @param {ol.events.Event} e
     *  @private
     */
    private _onModifyFeature;
    /** Clear all bins and generate a new one.
     */
    reset(): void;
    /**
     * Get features without circular dependencies (vs. getFeatures)
     * @return {Array<ol.Feature>}
     */
    getGridFeatures(): Array<ol.Feature>;
    /** Set the flatAttribute function
     * @param {function} fn Function that takes a bin and the features it contains and aggragate the features in the bin attributes when saving
     */
    setFlatAttributesFn(fn: Function): void;
    /**
     * Get the orginal source
     * @return {ol_source_Vector}
     */
    getSource(): ol_source_Vector;
}
import ol_source_Vector from "ol/source/Vector";
