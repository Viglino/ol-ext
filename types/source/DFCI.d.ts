export default ol_source_DFCI;
/** DFCI source: a source to display the French DFCI grid on a map
 * @see http://ccffpeynier.free.fr/Files/dfci.pdf
 * @constructor ol_source_DFCI
 * @extends {ol/source/Vector}
 * @param {any} options Vector source options
 *  @param {Array<Number>} resolutions a list of resolution to change the drawing level, default [1000,100,20]
 */
declare class ol_source_DFCI {
    constructor(options: any);
    _bbox: number[][];
    /** Cacluate grid according extent/resolution
     */
    _calcGrid(extent: any, resolution: any, projection: any): void;
    _features0: ol_Feature<import("ol/geom/Geometry").default>[];
    resolution: any;
    /**
     * Get middle point
     * @private
     */
    private _midPt;
    /**
     * Get feature with geom
     * @private
     */
    private _trFeature;
    /** Get features
     *
     */
    _getFeatures(level: any, extent: any, projection: any): ol_Feature<import("ol/geom/Geometry").default>[];
}
import ol_Feature from "ol/Feature";
