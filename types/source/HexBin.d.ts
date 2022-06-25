export default ol_source_HexBin;
/** A source for hexagonal binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + ol.HexGridOptions
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the hexagon in map units, default 80000
 *  @param {ol.coordinate} [options.origin] origin of the grid, default [0,0]
 *  @param {HexagonLayout} [options.layout] grid layout, default pointy
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
declare class ol_source_HexBin {
    constructor(options: any);
    /** The HexGrid
     * 	@type {ol_HexGrid}
     */
    _hexgrid: ol_HexGrid;
    /** Get the hexagon geometry at the coord
     * @param {ol.Coordinate} coord
     * @returns {ol.geom.Polygon}
     * @api
     */
    getGridGeomAt(coord: ol.Coordinate): ol.geom.Polygon;
    /**	Set the inner HexGrid size.
     * 	@param {number} newSize
     * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
     */
    setSize(newSize: number, noreset: boolean): void;
    /**	Get the inner HexGrid size.
     * 	@return {number}
     */
    getSize(): number;
    /**	Set the inner HexGrid layout.
     * 	@param {HexagonLayout} newLayout
     * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
     */
    setLayout(newLayout: HexagonLayout, noreset: boolean): void;
    /**	Get the inner HexGrid layout.
     * 	@return {HexagonLayout}
     */
    getLayout(): HexagonLayout;
    /**	Set the inner HexGrid origin.
     * 	@param {ol.Coordinate} newLayout
     * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
     */
    setOrigin(newLayout: ol.Coordinate, noreset: boolean): void;
    /**	Get the inner HexGrid origin.
     * 	@return {ol.Coordinate}
     */
    getOrigin(): ol.Coordinate;
    /**
     * Get hexagons without circular dependencies (vs. getFeatures)
     * @return {Array<ol.Feature>}
     */
    getHexFeatures(): Array<ol.Feature>;
}
import ol_HexGrid from "../render/HexGrid";
