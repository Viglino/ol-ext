export default ol_layer_GeoImage;
/**
 * @classdesc
 * Image layer to use with a GeoImage source and return the extent calcaulted with this source.
 * @extends {ol.layer.Image}
 * @param {Object=} options Layer Image options.
 * @api
 */
declare class ol_layer_GeoImage {
    constructor(options: any);
    /**
     * Return the {@link module:ol/extent~Extent extent} of the source associated with the layer.
     * @return {ol.Extent} The layer extent.
     * @observable
     * @api
     */
    getExtent(): ol.Extent;
}
