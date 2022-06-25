export default ol_style_StrokePattern;
/**
 * @classdesc
 * Stroke style with named pattern
 *
 * @constructor
 * @param {any}  options
 *	@param {ol.style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
 *	@param {number|undefined} options.opacity opacity with image pattern, default:1
 *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
 *	@param {ol.colorLike} options.color pattern color
 *	@param {ol.style.Fill} options.fill fill color (background)
 *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
 *	@param {number} options.size line size for hash/dot/circle/cross pattern
 *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
 *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
 *	@param {number} options.scale pattern scale
 * @extends {ol.style.Fill}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
declare class ol_style_StrokePattern implements ol.structs.IHasChecksum {
    constructor(options: any);
    canvas_: HTMLCanvasElement;
    /**
     * Clones the style.
     * @return {ol_style_StrokePattern}
     */
    clone(): ol_style_StrokePattern;
    /** Get canvas used as pattern
    *	@return {canvas}
    */
    getImage(): canvas;
    /** Get pattern
    *	@param {olx.style.FillPatternOption}
    */
    getPattern_(options: any): any;
}
