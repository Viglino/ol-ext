import Feature from 'ol/Feature';
import { Interaction } from 'ol/interaction';
/** A Select interaction to fill feature's properties on click.
 * @constructor
 * @extends {Interaction}
 * @fires setattributestart
 * @fires setattributeend
 * @param {*} options Extentinteraction.Select options
 *  @param {boolean} options.active activate the interaction on start, default true
 *  @param {boolean} options.cursor use a paint bucket cursor, default true
 * @param {*} properties The properties as key/value
 */
export class FillAttribute extends Interaction {
    constructor(options: {
        active: boolean;
        cursor: boolean;
    }, properties: any);
    /** Activate the interaction
     * @param {boolean} active
     */
    setActive(active: boolean): void;
    /** Set attributes
     * @param {*} properties The properties as key/value
     */
    setAttributes(properties: any): void;
    /** Set an attribute
     * @param {string} key
     * @param {*} val
     */
    setAttribute(key: string, val: any): void;
    /** get attributes
     * @return {*} The properties as key/value
     */
    getAttributes(): any;
    /** Get an attribute
     * @param {string} key
     * @return {*} val
     */
    getAttribute(key: string): any;
    /** Fill feature attributes
     * @param {Array<Feature>} features The features to modify
     * @param {*} properties The properties as key/value
     */
    fill(features: Feature[], properties: any): void;
}
