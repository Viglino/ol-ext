export default ol_style_Shadow;
/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {} options Options.
 *  @param {ol.style.Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
 *  @param {number} options.radius point radius
 * 	@param {number} options.blur lur radius, default radius/3
 * 	@param {number} options.offsetX x offset, default 0
 * 	@param {number} options.offsetY y offset, default 0
 * @extends {ol_style_RegularShape}
 * @api
 */
declare class ol_style_Shadow {
    constructor(options: any);
    _fill: any;
    _radius: any;
    _blur: any;
    _offset: any[];
    /**
     * Clones the style.
     * @return {ol_style_Shadow}
     */
    clone(): ol_style_Shadow;
    /**
     * @private
     */
    private renderShadow_;
}
