export default ol_style_FontSymbol;
/**
 * @classdesc
 * A marker style to use with font symbols.
 *
 * @constructor
 * @param {} options Options.
 *  @param {string} [options.color] default #000
 *  @param {string} options.glyph the glyph name or a char to display as symbol.
 *    The name must be added using the {@link ol.style.FontSymbol.addDefs} function.
 *  @param {string} [options.text] a text to display as a glyph
 *  @param {string} [options.font] font to use with the text option
 *  @param {string} options.form
 * 	  none|circle|poi|bubble|marker|coma|shield|blazon|bookmark|hexagon|diamond|triangle|sign|ban|lozenge|square
 * 	  a form that will enclose the glyph, default none
 *  @param {number} options.radius
 *  @param {number} options.rotation
 *  @param {boolean} options.rotateWithView
 *  @param {number} [options.opacity=1]
 *  @param {number} [options.fontSize=1] size of the font compare to the radius, fontSize greater than 1 will exceed the symbol extent
 *  @param {string} [options.fontStyle] the font style (bold, italic, bold italic, etc), default none
 *  @param {boolean} options.gradient true to display a gradient on the symbol
 *  @param {number} [options.offsetX=0] default 0
 *  @param {number} [options.offsetY=0] default 0
 *  @param {_ol_style_Fill_} options.fill
 *  @param {_ol_style_Stroke_} options.stroke
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
declare class ol_style_FontSymbol implements ol.structs.IHasChecksum {
    /** Static function : add new font defs
     * @param {String|Object} font the font desciption
     * @param {} glyphs a key / value list of glyph definitions.
     * 		Each key is the name of the glyph,
     * 		the value is an object that code the font, the caracter code,
     * 		the name and a search string for the glyph.
     */
    static addDefs(font: string | any, glyphs: any): void;
    constructor(options: any);
    color_: any;
    fontSize_: any;
    fontStyle_: any;
    stroke_: any;
    fill_: any;
    radius_: number;
    form_: any;
    gradient_: any;
    offset_: any[];
    glyph_: any;
    /** Clones the style.
     * @return {ol_style_FontSymbol}
     */
    clone(): ol_style_FontSymbol;
    /** Get the fill style for the symbol.
     * @return {ol_style_Fill} Fill style.
     * @api
     */
    getFill(): ol_style_Fill;
    /** Get the stroke style for the symbol.
     * @return {_ol_style_Stroke_} Stroke style.
     * @api
     */
    getStroke(): _ol_style_Stroke_;
    /** Get the glyph definition for the symbol.
     * @param {string|undefined} name a glyph name to get the definition, default return the glyph definition for the style.
     * @return {*}
     * @api
     */
    getGlyph(name: string | undefined): any;
    /** Get glyph definition given a text and a font
     * @param {string|undefined} text
     * @param {string} [font] the font for the text
     * @return {*}
     * @api
     */
    getTextGlyph(text: string | undefined, font?: string): any;
    /**
     * Get the glyph name.
     * @return {string} the name
     * @api
     */
    getGlyphName(): string;
    /**
     * Get the stroke style for the symbol.
     * @return {_ol_style_Stroke_} Stroke style.
     * @api
     */
    getFontInfo(glyph: any): _ol_style_Stroke_;
    /** @private
     */
    private renderMarker_;
    /**
     * @private
     * @param {ol_style_FontSymbol.RenderOptions} renderOptions
     * @param {CanvasRenderingContext2D} context
     */
    private drawPath_;
    /**
     * @private
     * @param {ol_style_FontSymbol.RenderOptions} renderOptions
     * @param {CanvasRenderingContext2D} context
     * @param {number} x The origin for the symbol (x).
     * @param {number} y The origin for the symbol (y).
     */
    private drawMarker_;
    /**
     * @inheritDoc
     */
    getChecksum(): any;
    checksums_: any[];
    /** Font defs
     */
    defs: {
        fonts: {};
        glyphs: {};
    };
}
