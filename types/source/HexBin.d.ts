import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { HexGrid } from 'render/HexGrid';
/** A source for hexagonal binning
 * @constructor
 * @extends {VectorSource}
 * @param {Object} options VectorSourceOptions + HexGridOptions
 *  @param {VectorSource} options.source Source
 *  @param {number} [options.Size] Size of the hexagon in map units, default 80000
 *  @param {Coordinate} [options.origin] origin of the grid, default [0,0]
 *  @param {import('../render/HexGrid').HexagonLayout} [options.layout] grid layout, default pointy
 *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
 *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
export class HexBin extends VectorSource {
    constructor(options: {
        source: VectorSource;
        Size?: number;
        origin?: Coordinate;
    });
    /** The HexGrid
     * 	@type {HexGrid}
     */
    _hexgrid: HexGrid;
    /** Get the hexagon geometry at the coord
     * @param {Coordinate} coord
     * @returns {Polygon}
     * @api
     */
    getGridGeomAt(coord: Coordinate): Polygon;
    /**	Set the inner HexGrid Size.
     * 	@param {number} newSize
     * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
     */
    setSize(newSize: number, noreset: boolean): void;
    /**	Get the inner HexGrid Size.
     * 	@return {number}
     */
    getSize(): number;
    /**	Set the inner HexGrid layout.
     * 	@param {import('../render/HexGrid').HexagonLayout} newLayout
     * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
     */
    setLayout(newLayout: any, noreset: boolean): void;
    /**	Get the inner HexGrid layout.
     * 	@return {import('../render/HexGrid').HexagonLayout}
     */
    getLayout(): any;
    /**	Set the inner HexGrid origin.
     * 	@param {Coordinate} newLayout
     * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
     */
    setOrigin(newLayout: Coordinate, noreset: boolean): void;
    /**	Get the inner HexGrid origin.
     * 	@return {Coordinate}
     */
    getOrigin(): Coordinate;
    /**
     * Get hexagons without circular dependencies (vs. getFeatures)
     * @return {Array<Feature>}
     */
    getHexFeatures(): Feature[];
    /** Overwrite Vector clear to fire clearstart / clearend event
     */
    clear(): void;
}
