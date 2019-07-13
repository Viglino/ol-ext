import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
/** A source for INSEE grid
 * @constructor
 * @extends {VectorSource}
 * @param {Object} options VectorSourceOptions + grid option
 *  @param {VectorSource} options.source Source
 *  @param {number} [options.Size] Size of the grid in meter, default 200m
 *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
 *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
export class FeatureBin extends VectorSource {
    constructor(options: {
        source: VectorSource;
        Size?: number;
    });
    /** Set grid Size
     * @param {Feature} features
     */
    setFeatures(features: Feature): void;
    /** Get the grid geometry at the coord
     * @param {Coordinate} coord
     * @returns {Polygon}
     * @api
     */
    getGridGeomAt(coord: Coordinate): Polygon;
    /** Overwrite Vector clear to fire clearstart / clearend event
     */
    clear(): void;
}
