export default ol_source_GridBin;
/** A source for grid binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + grid option
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the grid in meter, default 200m
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
declare class ol_source_GridBin {
    constructor(options: any);
    /** Set grid projection
     * @param {ol.ProjectionLike} proj
     */
    setGridProjection(proj: ol.ProjectionLike): void;
    /** Set grid size
     * @param {number} size
     */
    setSize(size: number): void;
    /** Get the grid geometry at the coord
     * @param {ol.Coordinate} coord
     * @returns {ol.geom.Polygon}
     * @api
     */
    getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
}
