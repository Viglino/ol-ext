export default ol_source_GeoImage;
export type GeoImageOptions = {
    /**
     * url of the static image
     */
    url: url;
    /**
     * the static image, if not provided, use url to load an image
     */
    image: image;
    /**
     * coordinate of the center of the image
     */
    imageCenter: ol.Coordinate;
    /**
     * [scalex, scaley] of the image
     */
    imageScale: ol.Size | number;
    /**
     * angle of the image in radian, default 0
     */
    imageRotate: number;
    /**
     * of the image to be show (in the image) default: [0,0,imageWidth,imageHeight]
     */
    imageCrop: ol.Extent;
    /**
     * linestring to mask the image on the map
     */
    imageMask: Array<ol.Coordinate>;
};
/** Layer source with georeferencement to place it on a map
 * @constructor
 * @extends {ol_source_ImageCanvas}
 * @param {GeoImageOptions} options
 */
declare class ol_source_GeoImage {
    constructor(opt_options: any);
    _image: any;
    center: any;
    rotate: any;
    crop: any;
    mask: any;
    /** calculate image at extent / resolution
     * @param {ol/extent/Extent} extent
     * @param {number} resolution
     * @param {number} pixelRatio
     * @param {ol/size/Size} size
     * @return {HTMLCanvasElement}
     */
    calculateImage(extent: any, resolution: number, pixelRatio: number, size: any): HTMLCanvasElement;
    /**
     * Get coordinate of the image center.
     * @return {ol.Coordinate} coordinate of the image center.
     * @api stable
     */
    getCenter(): ol.Coordinate;
    /**
     * Set coordinate of the image center.
     * @param {ol.Coordinate} coordinate of the image center.
     * @api stable
     */
    setCenter(center: any): void;
    /**
     * Get image scale.
     * @return {ol.size} image scale (along x and y axis).
     * @api stable
     */
    getScale(): ol.size;
    /**
     * Set image scale.
     * @param {ol.size|Number} image scale (along x and y axis or both).
     * @api stable
     */
    setScale(scale: any): void;
    scale: any;
    /**
     * Get image rotation.
     * @return {Number} rotation in degre.
     * @api stable
     */
    getRotation(): number;
    /**
     * Set image rotation.
     * @param {Number} rotation in radian.
     * @api stable
     */
    setRotation(angle: any): void;
    /**
     * Get the image.
     * @api stable
     */
    getGeoImage(): any;
    /**
     * Get image crop extent.
     * @return {ol.extent} image crop extent.
     * @api stable
     */
    getCrop(): ol.extent;
    /**
     * Set image mask.
     * @param {ol.geom.LineString} coords of the mask
     * @api stable
     */
    setMask(mask: any): void;
    /**
     * Get image mask.
     * @return {ol.geom.LineString} coords of the mask
     * @api stable
     */
    getMask(): ol.geom.LineString;
    /**
     * Set image crop extent.
     * @param {ol.extent|Number} image crop extent or a number to crop from original size.
     * @api stable
     */
    setCrop(crop: any): void;
    _imageSize: number[];
    /** Get the extent of the source.
     * @param {module:ol/extent~Extent} extent If provided, no new extent will be created. Instead, that extent's coordinates will be overwritten.
     * @return {ol.extent}
     */
    getExtent(opt_extent: any): ol.extent;
    /** Calculate the extent of the source image.
     * @param {boolean} usemask return the mask extent, default return the image extent
     * @return {ol.extent}
     */
    calculateExtent(usemask: boolean): ol.extent;
}
