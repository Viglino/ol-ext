export default ol_ext_SVGOperation;
/** SVG filter
 * @param {string | *} attributes a list of attributes or fe operation
 *  @param {string} attributes.feoperation filter primitive tag name
 */
declare class ol_ext_SVGOperation {
    constructor(attributes: any);
    _name: any;
    element: Element;
    /** Get filter name
     * @return {string}
     */
    getName(): string;
    /** Set Filter attribute
     * @param {*} attributes
     */
    set(k: any, val: any): void;
    /** Set Filter attributes
     * @param {*} attributes
     */
    setProperties(attributes: any): void;
    /** Get SVG  element
     * @return {Element}
     */
    geElement(): Element;
    /** Append a new operation
     * @param {ol_ext_SVGOperation} operation
     */
    appendChild(operation: ol_ext_SVGOperation): void;
    NS: string;
}
