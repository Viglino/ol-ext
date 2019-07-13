import ol_control_Control from 'ol/control/Control';
import Feature from 'ol/Feature';
import { Size } from 'ol/size';
import { StyleLike } from 'ol/style/Style';
import { Style } from 'ol/style';
/** Create a legend for styles
 * @constructor
 * @fires select
 * @param {*} options
 *  @param {String} options.className class of the control
 *  @param {String} options.title Legend title
 *  @param {Size | undefined} options.Size Size of the symboles in the legend, default [40, 25]
 *  @param {number | undefined} options.margin Size of the symbole's margin, default 10
 *  @param {boolean | undefined} options.collapsed Specify if attributions should be collapsed at startup. Default is true.
 *  @param {boolean | undefined} options.collapsible Specify if attributions can be collapsed, default true.
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param { Style | Array<Style> | StyleFunction | undefined	} options.style a style or a style function to use with features
 * @extends {contrControl}
 */
export class Legend extends ol_control_Control {
    constructor(options: {
        className: string;
        title: string;
        Size: Size | undefined;
        margin: number | undefined;
        collapsed: boolean | undefined;
        collapsible: boolean | undefined;
        target: Element | string | undefined;
        style: StyleLike;
    });
    /** Set the style
     * @param { Style | Array<Style> | StyleFunction | undefined	} style a style or a style function to use with features
     */
    setStyle(style: StyleLike | undefined): void;
    /** Add a new row to the legend
     * * You can provide in options:
     * - a feature width a style
     * - or a feature that will use the legend style function
     * - or properties ans a geometry type that will use the legend style function
     * - or a style and a geometry type
     * @param {*} options a list of parameters
     *  @param {Feature} options.feature a feature to draw
     *  @param {Style} options.style the style to use if no feature is provided
     *  @param {*} options.properties properties to use with a style function
     *  @param {string} options.typeGeom type geom to draw with the style or the properties
     */
    addRow(options: {
        feature: Feature;
        style: Style;
        properties: any;
        typeGeom: string;
    }): void;
    /** Add a new row to the legend
     * @param {*} options a list of parameters
     *  @param {} options.
     */
    removeRow(index: number): void;
    /** Get a legend row
     * @param {number} index
     * @return {*}
     */
    getRow(index: number): any;
    /** Get a legend row
     * @return {number}
     */
    getLength(): number;
    /** Refresh the legend
     */
    refresh(): void;
    /** Show control
     */
    show(): void;
    /** Hide control
     */
    hide(): void;
    /** Toggle control
     */
    toggle(): void;
    /** Get the image for a style
     * You can provide in options:
     * - a feature width a style
     * - or a feature that will use the legend style function
     * - or properties and a geometry type that will use the legend style function
     * - or a style and a geometry type
     * @param {*} options
     *  @param {Feature} options.feature a feature to draw
     *  @param {Style} options.style the style to use if no feature is provided
     *  @param {*} options.properties properties to use with a style function
     *  @param {string} options.typeGeom type geom to draw with the style or the properties
     * @param {Canvas|undefined} canvas a canvas to draw in
     * @param {number|undefined} row row number to draw in canvas
     * @return {CanvasElement}
     */
    getStyleImage(options: {
        feature: Feature;
        style: Style;
        properties: any;
        typeGeom: string;
    }, canvas: HTMLCanvasElement | undefined, row: number | undefined): HTMLCanvasElement;
}
