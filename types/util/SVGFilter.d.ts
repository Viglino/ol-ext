export default ol_ext_SVGFilter;
/** SVG filter
 * @param {*} options
 *  @param {ol_ext_SVGOperation} option.operation
 *  @param {string} option.id filter id, only to use if you want to adress the filter directly or let the lib create one, if none create a unique id
 *  @param {string} option.color color interpolation filters, linear or sRGB
 */
declare class ol_ext_SVGFilter {
    constructor(options: any);
    element: Element;
    _id: any;
    /** Get filter ID
     * @return {string}
     */
    getId(): string;
    /** Remove from DOM
     */
    remove(): void;
    /** Add a new operation
     * @param {ol_ext_SVGOperation} operation
     */
    addOperation(operation: ol_ext_SVGOperation): void;
    /** Add a grayscale operation
     * @param {number} value
     */
    grayscale(value: number): void;
    /** Add a luminanceToAlpha operation
     * @param {*} options
     *  @param {number} options.gamma enhance gamma, default 0
     */
    luminanceToAlpha(options: any): void;
    applyTo(img: any): HTMLElement;
    NS: string;
    svg: any;
}
import ol_ext_SVGOperation from "./SVGOperation";
