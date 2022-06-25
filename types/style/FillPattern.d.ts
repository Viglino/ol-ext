export default ol_style_FillPattern;
/**
 * @classdesc
 * Fill style with named pattern
 *
 * @constructor
 * @param {olx.style.FillPatternOption=}  options
 *	@param {ol.style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
*	@param {number|undefined} options.opacity opacity with image pattern, default:1
*	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
*	@param {ol_color} options.color pattern color
*	@param {ol_style_Fill} options.fill fill color (background)
*	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
*	@param {number} options.size line size for hash/dot/circle/cross pattern
*	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
*	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
*	@param {number} options.scale pattern scale
* @extends {ol_style_Fill}
* @implements {ol.structs.IHasChecksum}
* @api
*/
declare class ol_style_FillPattern implements ol.structs.IHasChecksum {
    /** Static fuction to add char patterns
     * @param {title}
     * @param {*} options
     *  @param {integer} [options.size=10] default 10
     *  @param {integer} [options. width=10] default 10
     *  @param {integer} [options.height=10] default 10
     *  @param {Array<circles>} [options.circles]
     *  @param {Array<pointlist>} [options.lines]
     *  @param {integer} [options.stroke]
     *  @param {bool} [options.fill]
     *  @param {char} [option.char]
     *  @param {string} [font="10px Arial"]
     */
    static addPattern(title: any, options: any): void;
    constructor(options: any);
    canvas_: HTMLCanvasElement;
    /**
     * Clones the style.
     * @return {ol_style_FillPattern}
     */
    clone(): ol_style_FillPattern;
    /** Get canvas used as pattern
    *	@return {canvas}
    */
    getImage(): canvas;
    /** Get pattern
    *	@param {olx.style.FillPatternOption}
    */
    getPattern_(options: any): any;
    /** Patterns definitions
     * @see pattern generator http://www.imagico.de/map/jsdotpattern.php
     */
    patterns: {
        hatch: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        cross: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        dot: {
            width: number;
            height: number;
            circles: number[][];
            stroke: boolean;
            fill: boolean;
        };
        circle: {
            width: number;
            height: number;
            circles: number[][];
            stroke: number;
            fill: boolean;
        };
        square: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
            fill: boolean;
        };
        tile: {
            width: number;
            height: number;
            lines: number[][];
            fill: boolean;
        };
        woven: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        crosses: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        caps: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        nylon: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        hexagon: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
            repeat: number[][];
        };
        cemetry: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
            repeat: number[][];
        };
        sand: {
            width: number;
            height: number;
            circles: number[][];
            fill: number;
        };
        conglomerate: {
            width: number;
            height: number;
            circles: number[][];
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        conglomerate2: {
            width: number;
            height: number;
            circles: number[][];
            lines: number[][];
            repeat: number[][];
            fill: number;
        };
        gravel: {
            width: number;
            height: number;
            circles: number[][];
            lines: number[][];
            stroke: number;
        };
        brick: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        dolomite: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        coal: {
            width: number;
            height: number;
            lines: number[][];
            fill: number;
        };
        breccia: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        clay: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        flooded: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        chaos: {
            width: number;
            height: number;
            lines: number[][];
            fill: number;
        };
        grass: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        swamp: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        reed: {
            width: number;
            height: number;
            lines: number[][];
            circles: number[][];
            repeat: number[][];
            stroke: number;
        };
        wave: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        vine: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
        forest: {
            width: number;
            height: number;
            circles: number[][];
            stroke: number;
        };
        forest2: {
            width: number;
            height: number;
            circles: number[][];
            fill: number;
            stroke: number;
        };
        scrub: {
            width: number;
            height: number;
            lines: number[][];
            circles: number[][];
            stroke: number;
        };
        tree: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        tree2: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            fill: number;
            stroke: number;
        };
        pine: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        pine2: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            fill: number;
            stroke: number;
        };
        mixtree: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        mixtree2: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            fill: number;
            stroke: number;
        };
        pines: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        rock: {
            width: number;
            height: number;
            lines: number[][];
            repeat: number[][];
            stroke: number;
        };
        rocks: {
            width: number;
            height: number;
            lines: number[][];
            stroke: number;
        };
    };
}
