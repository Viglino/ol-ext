export default ol_source_TileWFS;
/** A vector source to load WFS at a tile zoom level
 * @constructor
 * @fires tileloadstart
 * @fires tileloadend
 * @fires tileloaderror
 * @fires overload
 * @extends {ol.source.Vector}
 * @param {Object} options
 *  @param {string} [options.version=1.1.0] WFS version to use. Can be either 1.0.0, 1.1.0 or 2.0.0.
 *  @param {string} options.typeName WFS type name parameter
 *  @param {number} options.tileZoom zoom to load the tiles
 *  @param {number} options.maxFeatures maximum features returned in the WFS
 *  @param {number} options.featureLimit maximum features in the source before refresh, default Infinity
 *  @param {boolean} [options.pagination] experimental enable pagination, default no pagination
 */
declare class ol_source_TileWFS {
    constructor(options: any);
    /**
     *
     */
    _loadTile(url: any, extent: any, projection: any, format: any, loader: any): void;
}
