import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
/** Abstract base class; normally only used for creating subclasses. Bin collector for data
 * @constructor
 * @extends {VectorSource}
 * @param {Object} options VectorSourceOptions + grid option
 *  @param {VectorSource} options.source Source
 *  @param {boolean} options.listenChange listen changes (move) on source features to recalculate the bin, default true
 *  @param {(f: Feature) => Point} [options.geometryFunction] Function that takes an Feature as argument and returns an Point as feature's center.
 *  @param {(bin: Feature, features: Array<Feature>)} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
export class BinBase extends VectorSource {
    constructor(options: {
        source: VectorSource;
        listenChange: boolean;
    });
    /**
     * Get the bin that contains a feature
     * @param {Feature} f the feature
     * @return {Feature} the bin or null it doesn't exit
     */
    getBin(f: Feature): Feature;
    /** Get the grid geometry at the coord
     * @param {Coordinate} coord
     * @param {Object} attributes add key/value to this object to add properties to the grid feature
     * @returns {Polygon}
     * @api
     */
    getGridGeomAt(coord: Coordinate, attributes: any): Polygon;
    /** Get the bean at a coord
     * @param {Coordinate} coord
     * @param {boolean} create true to create if doesn't exit
     * @return {Feature} the bin or null it doesn't exit
     */
    getBinAt(coord: Coordinate, create: boolean): Feature;
    /** Clear all bins and generate a new one.
     */
    reset(): void;
    /**
     * Get features without circular dependencies (vs. getFeatures)
     * @return {Array<Feature>}
     */
    getGridFeatures(): Feature[];
    /** Create bin attributes using the features it contains when exporting
     * @param {Feature} bin the bin to export
     * @param {Array<Features>} features the features it contains
     */
    _flatAttributes(bin: Feature, features: Feature[]): void;
    /**
     * Get the orginal source
     * @return {VectorSource}
     */
    getSource(): VectorSource;
    /** Overwrite Vector clear to fire clearstart / clearend event
     */
    clear(): void;
}
