import { Fill, Image } from 'ol/style';
import { Color } from 'ol/color';

export interface FillPatternOptions {
    size: number;
    width: number;
    height: number;
    circles: number[][];
    lines: number[][];
    stroke: number;
    fill: boolean;
    char: string;
    font: string;
}
/**
 * @classdesc
 * Fill style with named pattern
 *
 * @constructor
 * @param {olx.style.FillPatternOption=}  options
 *	@param {style.Image|undefined} options.image an image pattern, image must be preloaded to draw on first call
 *	@param {number|undefined} options.opacity opacity with image pattern, default:1
 *	@param {olx.style.fillPattern} options.pattern pattern name (override by image option)
 *	@param {color} options.color pattern color
 *	@param {Fill} options.fill fill color (background)
 *	@param {number} options.offset pattern offset for hash/dot/circle/cross pattern
 *	@param {number} options.Size line Size for hash/dot/circle/cross pattern
 *	@param {number} options.spacing spacing for hash/dot/circle/cross pattern
 *	@param {number|bool} options.angle angle for hash pattern / true for 45deg dot/circle/cross
 *	@param {number} options.scale pattern scale
 * @extends {Fill}
 * @implements {structs.IHasChecksum}
 * @api
 */
export class FillPattern extends Fill {
    constructor(options?: {
        image: Image | undefined;
        opacity: number | undefined;
        pattern: FillPattern;
        color: Color;
        fill: Color;
        offset: number;
        Size: number;
        spacing: number;
        angle: number | boolean;
        scale: number;
    });
    /**
     * Clones the style.
     * @return {style.FillPattern}
     */
    clone(): FillPattern;
    /** Get canvas used as pattern
    *	@return {canvas}
     */
    getImage(): HTMLCanvasElement;
    /** Get pattern
    *	@param {olx.style.FillPatternOption}
     */
    getPattern_(options: FillPatternOptions): void;
    /** Static fuction to add char patterns
    *	@param {title}
    *	@param {olx.fillpattern.Option}
    *		- Size {number} default 10
    *		- width {number} default 10
    *		- height {number} default 10
    *		- circles {Array<circles>}
    *		- lines: {Array<pointlist>}
    *		- stroke {number}
    *		- fill {bool}
    *		- char {char}
    *		- font {string} default "10px Arial"
     */
    static addPattern(title: string, options: FillPatternOptions): void;
    /** Patterns definitions
        Examples : http://seig.ensg.ign.fr/fichchap.php?NOFICHE=FP31&NOCHEM=CHEMS009&NOLISTE=1&N=8
     */
    patterns: any;
}
