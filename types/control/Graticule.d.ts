export default ol_control_Graticule;
/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} _ol_control_ options.
 *  @param {ol.projectionLike} options.projection projection to use for the graticule, default EPSG:4326
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {ol_style_Style} options.style Style to use for drawing the graticule, default black.
 *  @param {number} options.step step beetween lines (in proj units), default 1
 *  @param {number} options.stepCoord show a coord every stepCoord, default 1
 *  @param {number} options.spacing spacing beetween lines (in px), default 40px
 *  @param {number} options.borderWidth width of the border (in px), default 5px
 *  @param {number} options.margin margin of the border (in px), default 0px
 *  @param {number} options.formatCoord a function that takes a coordinate and a position and return the formated coordinate
 */
declare class ol_control_Graticule {
    constructor(options: any);
    fac: number;
    formatCoord: any;
    setStyle(style: any): void;
    _style: any;
    _draw(e: any): void;
}
