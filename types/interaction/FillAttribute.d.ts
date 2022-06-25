export default ol_interaction_FillAttribute;
/** A Select interaction to fill feature's properties on click.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires setattributestart
 * @fires setattributeend
 * @param {*} options extentol.interaction.Select options
 *  @param {boolean} options.active activate the interaction on start, default true
 *  @param {string=} options.name
 *  @param {boolean|string} options.cursor interaction cursor if false use default, default use a paint bucket cursor
 * @param {*} properties The properties as key/value
 */
declare class ol_interaction_FillAttribute {
    constructor(options: any, properties: any);
    _attributes: any;
    _cursor: any;
    /** Define the interaction cursor
     * @param {string} cursor CSS cursor
     */
    setCursor(cursor: string): void;
    /** Get the interaction cursor
     * @return {string} cursor
     */
    getCursor(): string;
    /** Activate the interaction
     * @param {boolean} active
     */
    setActive(active: boolean): void;
    _previousCursor: any;
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
     * @param {Array<ol.Feature>} features The features to modify
     * @param {*} properties The properties as key/value
     */
    fill(features: Array<ol.Feature>, properties: any): void;
}
