export default ol_source_FeatureBin;
/** A source that use a set of feature to collect data on it.
 * If a binSource is provided the bin is recalculated when features change.
 * @constructor
 * @extends {ol_source_BinBase}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source source to collect in the bin
 *  @param {ol.source.Vector} options.binSource a source to use as bin collector, default none
 *  @param {Array<ol.Feature>} options.features the features, ignored if binSource is provided, default none
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
declare class ol_source_FeatureBin {
    constructor(options: any);
    _sourceFeature: any;
    /** Set features to use as bin collector
     * @param {ol.Feature} features
     */
    setFeatures(features: ol.Feature): void;
    /** Get the grid geometry at the coord
     * @param {ol.Coordinate} coord
     * @returns {ol.geom.Polygon}
     * @api
     */
    getGridGeomAt(coord: ol.Coordinate, attributes: any): ol.geom.Polygon;
}
