export default ol_format_GeoRSS;
/** Feature format for reading data in the GeoRSS format.
 * @constructor ol_fromat_GeoRSS
 * @extends {ol_Object}
 * @param {*} options options.
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
declare class ol_format_GeoRSS {
    constructor(options: any);
    /**
     * Read a feature.  Only works for a single feature. Use `readFeatures` to
     * read a feature collection.
     *
     * @param {Node|string} source Source.
     * @param {*} options Read options.
     *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
     *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
     * @return {ol.Feature} Feature or null if no feature read
     * @api
     */
    readFeature(source: Node | string, options: any): ol.Feature;
    /**
     * Read all features.  Works with both a single feature and a feature
     * collection.
     *
     * @param {Document|Node|string} source Source.
     * @param {*} options Read options.
     *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
     *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
     * @return {Array<ol.Feature>} Features.
     * @api
     */
    readFeatures(source: Document | Node | string, options: any): Array<ol.Feature>;
    /**
     * Get the tag name for the items in the XML Document depending if we are
     * dealing with an atom base document or not.
     * @param {Document} xmlDoc document to extract the tag name for the items
     * @return {string} tag name
     * @private
     */
    private getDocumentItemsTagName;
}
