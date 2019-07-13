import { Fill, Stroke, RegularShape } from 'ol/style';
/**
 * @classdesc
 * A marker style to use with font symbols.
 *
 * @constructor
 * @param {} options Options.
 *  @param {number} options.glyph the glyph name or a char to display as symb
 * 		The name must be added using the {@link style.FontSymbaddDefs} function.
 *  @param {string} options.form
 * 		none|circle|poi|bubble|marker|coma|shield|blazon|bookmark|hexagon|diamond|triangle|sign|ban|lozenge|square
 * 		a form that will enclose the glyph, default none
 *  @param {number} options.radius
 *  @param {number} options.rotation
 *  @param {number} options.rotateWithView
 *  @param {number} options.opacity
 *  @param {number} options.fontSize, default 1
 *  @param {string} options.fontStyle the font style (bold, italic, bold italic, etc), default none
 *  @param {boolean} options.gradient true to display a gradient on the symbol
 *  @param {_ol_style_Fill_} options.fill
 *  @param {Stroke} options.stroke
 * @extends {style.RegularShape}
 * @implements {structs.IHasChecksum}
 * @api
 */
export class FontSymbol extends RegularShape {
    constructor(options: {
        glyph: number;
        form: string;
        radius: number;
        rotation: number;
        rotateWithView: number;
        opacity: number;
        fontSize: number;
        fontStyle: string;
        gradient: boolean;
        fill: Fill;
        stroke: Stroke;
    });
    /**
     *	Font defs
     */
    defs: any;
    /** Static function : add new font defs
     * @param {String|Object} font the font desciption
     * @param {} glyphs a key / value list of glyph definitions.
     * 		Each key is the name of the glyph,
     * 		the value is an object that code the font, the caracter code,
     * 		the name and a search string for the glyph.
     */
    static addDefs(font: string | any, glyphs: any): void;
    /**
     * Clones the style.
     * @return {style.FontSymbol}
     */
    clone(): FontSymbol;
    /**
     * Get the fill style for the symb
     * @return {Fill} Fill style.
     * @api
     */
    getFill(): Fill;
    /**
     * Get the stroke style for the symb
     * @return {Stroke} Stroke style.
     * @api
     */
    getStroke(): Stroke;
    /**
     * Get the glyph definition for the symb
     * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
     * @return {Stroke} Stroke style.
     * @api
     */
    getGlyph(name: string | undefined): Stroke;
    /**
     * Get the glyph name.
     * @return {string} the name
     * @api
     */
    getGlyphName(): string;
    /**
     * Get the stroke style for the symb
     * @return {Stroke} Stroke style.
     * @api
     */
    getFontInfo(): Stroke;
    /**
     * @inheritDoc
     */
    getChecksum(): string;
}
