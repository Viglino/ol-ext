import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import OverlayPositioning from 'ol/OverlayPositioning';
import { Popup, Template } from './Popup';
/**
 * A popup element to be displayed on a feature.
 *
 * @constructor
 * @extends {Overlay.Popup}
 * @param {} options Extend Popup options
 *  @param {String} options.popupClass the a export class of the overlay to style the popup.
 *  @param {bool} options.closeBox popup has a close box, default false.
 *  @param {function|undefined} options.onclose: callback function when popup is closed
 *  @param {function|undefined} options.onshow callback function when popup is shown
 *  @param {Number|Array<number>} options.offsetBox an offset box
 *  @param {OverlayPositioning | string | undefined} options.positionning
 *    the 'auto' positioning var the popup choose its positioning to stay on the map.
 *  @param {Template} options.template A template with a list of properties to use in the popup
 *  @param {boolean} options.canFix Enable popup to be fixed, default false
 *  @param {boolean} options.showImage display image url as image, default false
 *  @param {boolean} options.maxChar max char to display in a cell, default 200
 *  @api stable
 */
export class PopupFeature extends Popup {
    constructor(options: {
        popupClass: string;
        closeBox: boolean;
        onclose: ((...params: any[]) => any) | undefined;
        onshow: ((...params: any[]) => any) | undefined;
        offsetBox: number | number[];
        positionning: OverlayPositioning | string | undefined;
        template: Template;
        canFix: boolean;
        showImage: boolean;
        maxChar: boolean;
    });
    /** Set the template
     * @param {Template} template A template with a list of properties to use in the popup
     */
    setTemplate(template: Template): void;
    /** Show the popup on the map
     * @param {Coordinate|undefined} coordinate Position of the popup
     * @param {Feature|Array<Feature>} features The features on the popup
     */
    show(coordinate: Coordinate | undefined, features: Feature | Feature[]): void;
    /** Fix the popup
     * @param {boolean} fix
     */
    setFix(fix: boolean): void;
    /** Is a popup fixed
     * @return {boolean}
     */
    getFix(): boolean;
    /** Get a function to use as format to get local string for an attribute
     * if the attribute is a number: Number.toLocaleString()
     * if the attribute is a date: Date.toLocaleString()
     * otherwise the attibute itself
     * @param {string} locales string with a BCP 47 language tag, or an array of such strings
     * @param {*} options Number or Date toLocaleString options
     * @return {function} a function that takes an attribute and return the formated attribute
     */
    static localString(locales: string, options: any): (...params: any[]) => any;
    /**
     * Set a close box to the popup.
     * @param {bool} b
     * @api stable
     */
    setClosebox(b: boolean): void;
    /**
     * Set the CSS export class of the popup.
     * @param {string} c export class name.
     * @api stable
     */
    setPopupClass(c: string): void;
    /**
     * Add a CSS export class to the popup.
     * @param {string} c export class name.
     * @api stable
     */
    addPopupClass(c: string): void;
    /**
     * Remove a CSS export class to the popup.
     * @param {string} c export class name.
     * @api stable
     */
    removePopupClass(c: string): void;
    /**
     * Set positionning of the popup
     * @param {OverlayPositioning | string | undefined} pos an OverlayPositioning
     * 		or 'auto' to var the popup choose the best position
     * @api stable
     */
    setPositioning(pos: OverlayPositioning | string | undefined): void;
    /** Check if popup is visible
    * @return {boolean}
     */
    getVisible(): boolean;
    /**
     * Hide the popup
     * @api stable
     */
    hide(): void;
}
