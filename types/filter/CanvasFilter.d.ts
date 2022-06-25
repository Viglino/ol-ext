export default ol_filter_CanvasFilter;
export type CanvasFilterOptions = {
    /**
     * Takes an IRI pointing to an SVG filter element
     */
    url: url;
    /**
     * Gaussian blur value in px
     */
    blur: number;
    /**
     * linear multiplier to the drawing, under 100: darkens the image, over 100 brightens it
     */
    brightness: number;
    /**
     * Adjusts the contrast, under 0: black, 100 no change
     */
    contrast: number;
    /**
     * Applies a drop shadow effect, pixel offset
     */
    shadow: ol.pixel;
    /**
     * Blur radius
     */
    shadowBlur: number;
    shadowColor: number;
    /**
     * 0: unchanged, 100: completely grayscale
     */
    grayscale: number;
    /**
     * Hue rotation angle in deg
     */
    hueRotate: number;
    /**
     * Inverts the drawing, 0: unchanged, 100: invert
     */
    invert: number;
    /**
     * Saturates the drawing, 0: unsaturated, 100: unchanged
     */
    saturate: number;
    /**
     * Converts the drawing to sepia, 0: sepia, 100: unchanged
     */
    sepia: number;
};
/** @typedef {Object} CanvasFilterOptions
 * @property {url} url Takes an IRI pointing to an SVG filter element
 * @property {number} blur Gaussian blur value in px
 * @property {number} brightness linear multiplier to the drawing, under 100: darkens the image, over 100 brightens it
 * @property {number} contrast Adjusts the contrast, under 0: black, 100 no change
 * @property {ol.pixel} shadow Applies a drop shadow effect, pixel offset
 * @property {number} shadowBlur Blur radius
 * @property {number} shadowColor
 * @property {number} grayscale 0: unchanged, 100: completely grayscale
 * @property {number} hueRotate Hue rotation angle in deg
 * @property {number} invert Inverts the drawing, 0: unchanged, 100: invert
 * @property {number} saturate Saturates the drawing, 0: unsaturated, 100: unchanged
 * @property {number} sepia Converts the drawing to sepia, 0: sepia, 100: unchanged
 */
/** Add a canvas Context2D filter to a layer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {CanvasFilterOptions} options
 */
declare class ol_filter_CanvasFilter {
    constructor(options: any);
    _svg: {};
    /** Add a new svg filter
     * @param {string|ol.ext.SVGFilter} url IRI pointing to an SVG filter element
     */
    addSVGFilter(url: string | ol.ext.SVGFilter): void;
    /** Remove a svg filter
     * @param {string|ol.ext.SVGFilter} url IRI pointing to an SVG filter element
     */
    removeSVGFilter(url: string | ol.ext.SVGFilter): void;
    /**
     * @private
     */
    private precompose;
    /**
     * @private
     */
    private postcompose;
}
