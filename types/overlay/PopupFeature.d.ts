export default ol_Overlay_PopupFeature;
/**
 * Template attributes for popup
 */
export type TemplateAttributes = {
    title: string;
    /**
     * a function that takes an attribute and a feature and returns the formated attribute
     */
    format: Function;
    /**
     * string to instert before the attribute (prefix)
     */
    before: string;
    /**
     * string to instert after the attribute (sudfix)
     */
    after: string;
    /**
     * boolean or a function (feature, value) that decides the visibility of a attribute entry
     */
    visible: boolean | Function;
};
/**
 * Template
 */
export type Template = {
    /**
     * title of the popup, attribute name or a function that takes a feature and returns the title
     */
    title: string | Function;
    /**
     * a list of template attributes
     */
    attributes: any;
};
/** Get a function to use as format to get local string for an attribute
 * if the attribute is a number: Number.toLocaleString()
 * if the attribute is a date: Date.toLocaleString()
 * otherwise the attibute itself
 * @param {string} locales string with a BCP 47 language tag, or an array of such strings
 * @param {*} options Number or Date toLocaleString options
 * @return {function} a function that takes an attribute and return the formated attribute
 */
export function ol_Overlay_PopupFeature_localString(locales: string, options: any): Function;
/** Template attributes for popup
 * @typedef {Object} TemplateAttributes
 * @property {string} title
 * @property {function} format a function that takes an attribute and a feature and returns the formated attribute
 * @property {string} before string to instert before the attribute (prefix)
 * @property {string} after string to instert after the attribute (sudfix)
 * @property {boolean|function} visible boolean or a function (feature, value) that decides the visibility of a attribute entry
 */
/** Template
 * @typedef {Object} Template
 * @property {string|function} title title of the popup, attribute name or a function that takes a feature and returns the title
 * @property {Object.<TemplateAttributes>} attributes a list of template attributes
 */
/**
 * A popup element to be displayed on a feature.
 *
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @fires show
 * @fires hide
 * @fires select
 * @param {} options Extend Popup options
 *  @param {String} options.popupClass the a class of the overlay to style the popup.
 *  @param {bool} options.closeBox popup has a close box, default false.
 *  @param {function|undefined} options.onclose: callback function when popup is closed
 *  @param {function|undefined} options.onshow callback function when popup is shown
 *  @param {Number|Array<number>} options.offsetBox an offset box
 *  @param {ol.OverlayPositioning | string | undefined} options.positionning
 *    the 'auto' positioning var the popup choose its positioning to stay on the map.
 *  @param {Template|function} options.template A template with a list of properties to use in the popup or a function that takes a feature and returns a Template
 *  @param {ol.interaction.Select} options.select a select interaction to get features from
 *  @param {boolean} options.keepSelection keep original selection, otherwise set selection to the current popup feature and add a counter to change current feature, default false
 *  @param {boolean} options.canFix Enable popup to be fixed, default false
 *  @param {boolean} options.showImage display image url as image, default false
 *  @param {boolean} options.maxChar max char to display in a cell, default 200
 *  @api stable
 */
declare class ol_Overlay_PopupFeature {
    constructor(options: any);
    _select: any;
    /** Set the template
     * @param {Template} template A template with a list of properties to use in the popup
     */
    setTemplate(template: Template): void;
    _template: Template;
    /**
     * @private
     */
    private _attributeObject;
    /** Show the popup on the map
     * @param {ol.coordinate|undefined} coordinate Position of the popup
     * @param {ol.Feature|Array<ol.Feature>} features The features on the popup
     * @param {ol.Feature} current The current feature if keepSelection = true, otherwise get the first feature
     */
    show(coordinate: ol.coordinate | undefined, features: ol.Feature | Array<ol.Feature>, current: ol.Feature): void;
    _features: any;
    _count: number;
    /**
     * @private
     */
    private _getHtml;
    _noselect: boolean;
    /** Fix the popup
     * @param {boolean} fix
     */
    setFix(fix: boolean): void;
    /** Is a popup fixed
     * @return {boolean}
     */
    getFix(): boolean;
}
