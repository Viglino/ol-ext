import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { LineString } from 'ol/geom';
import { Size } from 'ol/size';
import { ImageCanvas } from 'ol/source';
/** Layer source with georeferencement to place it on a map
* @constructor
* @extends {source.ImageCanvas}
* @param {olx.source.GeoImageOptions=} options
 */
export class GeoImage extends ImageCanvas {
    constructor(options?: {});
    /**
     * Get coordinate of the image center.
     * @return {Coordinate} coordinate of the image center.
     * @api stable
     */
    getCenter(): Coordinate;
    /**
     * Set coordinate of the image center.
     * @param {Coordinate} coordinate of the image center.
     * @api stable
     */
    setCenter(coordinate: Coordinate): void;
    /**
     * Get image scale.
     * @return {Size} image scale (along x and y axis).
     * @api stable
     */
    getScale(): Size;
    /**
     * Set image scale.
     * @param {Size|Number} image scale (along x and y axis or both).
     * @api stable
     */
    setScale(image: Size | number): void;
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
    setRotation(rotation: number): void;
    /**
     * Get the image.
     * @api stable
     */
    getGeoImage(): void;
    /**
     * Get image crop Extent.
     * @return {Extent} image crop Extent.
     * @api stable
     */
    getCrop(): Extent;
    /**
     * Set image mask.
     * @param {LineString} coords of the mask
     * @api stable
     */
    setMask(coords: LineString): void;
    /**
     * Get image mask.
     * @return {LineString} coords of the mask
     * @api stable
     */
    getMask(): LineString;
    /**
     * Set image crop Extent.
     * @param {Extent|Number} image crop Extent or a number to crop from original Size.
     * @api stable
     */
    setCrop(image: Extent | number): void;
}
