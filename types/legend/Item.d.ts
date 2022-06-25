export default ol_legend_Item;
/**
 * ol/legend/Item options
 */
export type olLegendItemOptions = {
    /**
     * row title
     */
    title: string;
    className: className;
    /**
     * a feature to draw on the legend
     */
    feature: ol_Feature;
    /**
     * type geom to draw with the style or the properties if no feature is provided
     */
    typeGeom: string;
    /**
     * a set of properties to use with a style function
     */
    properties: any;
    /**
     * a style or a style function to use to draw the legend symbol
     */
    style: ol_style_Style.styleLike;
    /**
     * a text style to draw the item title in the legend
     */
    textStyle: ol_style_Text;
    size: ol.size | undefined;
    margin: number | undefined;
};
/** ol/legend/Item options
 * @typedef {Object} olLegendItemOptions
 *  @property {string} title row title
 *  @property {className} className
 *  @property {ol_Feature} feature a feature to draw on the legend
 *  @property {string} typeGeom type geom to draw with the style or the properties if no feature is provided
 *  @property {Object} properties a set of properties to use with a style function
 *  @property {ol_style_Style.styleLike} style a style or a style function to use to draw the legend symbol
 *  @property {ol_style_Text} textStyle a text style to draw the item title in the legend
 *  @property {ol.size|undefined} size
 *  @property {number|undefined} margin
 */
/** A class for legend items
 * @constructor
 * @fires select
 * @param {olLegendItemOptions} options
 */
declare class ol_legend_Item {
    constructor(options: any);
    /** Set the legend title
     * @param {string} title
     */
    setTitle(title: string): void;
    /** Get element
     * @param {ol.size} size symbol size
     */
    getElement(size: ol.size, onclick: any): HTMLElement | Text;
}
