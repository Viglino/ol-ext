export default ol_legend_Legend;
/** Legend class to draw features in a legend element
 * @constructor
 * @fires select
 * @fires refresh
 * @param {*} options
 *  @param {String} options.title Legend title
 *  @param {ol.size | undefined} options.size Size of the symboles in the legend, default [40, 25]
 *  @param {number | undefined} options.margin Size of the symbole's margin, default 10
 *  @param { ol.style.Text | undefined } options.textStyle a text style for the legend, default 16px sans-serif
 *  @param { ol.style.Text | undefined } options.titleStyle a text style for the legend title, default textStyle + bold
 *  @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} options.style a style or a style function to use with features
 */
declare class ol_legend_Legend {
    /** Get a symbol image for a given legend item
     * @param {olLegendItemOptions} item
     * @param {Canvas|undefined} canvas a canvas to draw in, if none creat one
     * @param {int|undefined} row row number to draw in canvas, default 0
     */
    static getLegendImage(item: olLegendItemOptions, canvas: Canvas | undefined, row: int | undefined): any;
    constructor(options: any);
    _items: ol_Collection<any>;
    _listElement: HTMLElement | Text;
    _canvas: HTMLCanvasElement;
    _textStyle: any;
    _title: ol_legend_Item;
    _titleStyle: any;
    /** Set legend title
     * @param {string} title
     */
    setTitle(title: string): void;
    /** Get legend title
     * @returns {string}
     */
    getTitle(): string;
    /** Get text Style
     * @returns {ol_style_Text}
     */
    getTextStyle(): ol_style_Text;
    /** Set legend size
     * @param {ol.size} size
     */
    set(key: any, value: any, opt_silent: any): void;
    /** Get legend list element
     * @returns {Element}
     */
    getListElement(): Element;
    /** Get legend canvas
     * @returns {HTMLCanvasElement}
     */
    getCanvas(): HTMLCanvasElement;
    /** Set the style
     * @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} style a style or a style function to use with features
     */
    setStyle(style: ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined): void;
    _style: any;
    /** Add a new item to the legend
     * @param {olLegendItemOptions|ol_legend_Item} item
     */
    addItem(item: olLegendItemOptions | ol_legend_Item): void;
    /** Get item collection
     * @param {ol_Collection}
     */
    getItems(): ol_Collection<any>;
    /** Draw legend text
     * @private
     */
    private _drawText;
    /** Draw legend text
     * @private
     */
    private _measureText;
    /** Refresh the legend
     */
    refresh(): void;
    /** Get the image for a style
     * @param {olLegendItemOptions} item
     * @param {Canvas|undefined} canvas a canvas to draw in, if none creat one
     * @param {int|undefined} row row number to draw in canvas, default 0
     * @return {CanvasElement}
     */
    getLegendImage(options: any, canvas: Canvas | undefined, row: int | undefined): CanvasElement;
}
import ol_Collection from "ol/Collection";
import ol_legend_Item from "./Item";
import ol_style_Text from "ol/style/Text";
