/** Helper for loading BIL-32 (Band Interleaved by Line) image
 * @param {string} src
 * @param {function} onload a function that takes a Float32Array and a ol.size.Size (array size)
 * @param {function} onerror
 * @private
 */
declare function ol_ext_imageLoader_loadBILImage(src: string, onload: Function, onerror: Function): void;
/** Returns an Imageloader function to load an x-bil-32 image as sea level map
 * to use as a ol/Tile~LoadFunction or ol/Image~LoadFunction
 * @param { number } level
 * @param {*} options
 *  @param { ol.Color } [options.color] fill color
 *  @param { boolean } [options.opacity=true] smooth color on border
 *  @param { number } [options.minValue=-Infinity] minimum level value
 * @returns {function} an ol/Tile~LoadFunction
 */
declare function ol_ext_imageLoader_seaLevelMap(level: number, options: any): Function;
/** Get a TileLoadFunction to load an x-bil-32 image as elevation map (ie. pixels colors codes elevations as terrain-RGB)
 * If getPixelColor is not define pixel store elevation as rgb, use {@link ol_ext_getElevationFromPixel} to get elevation from pixel
 * @param {function} [getPixelColor] a function that taket an elevation and return a color array [r,g,b,a], default store elevation as terrain-RGB
 * @returns {function} an ol/Tile~LoadFunction
 */
declare function ol_ext_imageLoader_elevationMap(getPixelColor?: Function): Function;
/** Convert elevation to pixel as terrain-RGB
 * Encode elevation data in raster tiles
 * - max deep watter trench min > -12000 m
 * - 2 digits (0.01 m)
 * @param {number} height elevation
 * @returns {Array<number>} pixel value
 */
declare function ol_ext_getPixelFromElevation(height: number): Array<number>;
/** Convert pixel (terrain-RGB) to elevation
 * @see ol_ext_getPixelFromElevation
 * @param {Array<number>} pixel the pixel value
 * @returns {number} elevation
 */
declare function ol_ext_getElevationFromPixel(pixel: Array<number>): number;
/** Get a TileLoadFunction to transform tiles into grayscale images
 * @returns {function} an ol/Tile~LoadFunction
 */
declare function ol_ext_imageLoader_grayscale(): Function;
/** Get a TileLoadFunction to turn color or a color range transparent
 * @param {ol.color.Color|Array<ol.color.Color>} colors color or color range to turn transparent
 * @returns {function} an ol/Tile~LoadFunction
 */
declare function ol_ext_imageLoader_transparent(colors: ol.color.Color | Array<ol.color.Color>): Function;
/** Get a TileLoadFunction to transform tiles images
 * @param {function} setPixel a function that takes a Uint8ClampedArray and the pixel position to transform
 * @returns {function} an ol/Tile~LoadFunction
 */
declare function ol_ext_imageLoader_pixelTransform(setPixel: Function): Function;
/** Shaded relief ? not/bad working yet...
 * @returns {function} an ol/Tile~LoadFunction
 * @private
 */
export function ol_ext_imageLoader_shadedRelief(): Function;
export { ol_ext_imageLoader_loadBILImage as loadBILImage, ol_ext_imageLoader_seaLevelMap as seaLevelMap, ol_ext_imageLoader_elevationMap as elevationMap, ol_ext_getPixelFromElevation as getPixelFromElevation, ol_ext_getElevationFromPixel as getElevationFromPixel, ol_ext_imageLoader_grayscale as grayscale, ol_ext_imageLoader_transparent as transparent, ol_ext_imageLoader_pixelTransform as pixelTransform };
