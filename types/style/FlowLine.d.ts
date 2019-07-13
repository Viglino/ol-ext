import Feature from 'ol/Feature';
import { Style } from 'ol/style';
import { ColorLike } from 'ol/colorlike';
/** Flow line style
 * Draw LineString with a variable color / width
 *
 * @extends {Style}
 * @constructor
 * @param {Object} options
 *  @param {boolean} options.visible draw only the visible part of the line, default true
 *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
 *  @param {number} options.width2 Final stroke width
 *  @param {colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
 *  @param {colorLike} options.color2 Final sroke color
 */
export class FlowLine extends Style {
    constructor(options: {
        visible: boolean;
        width: number | ((...params: any[]) => number);
        width2: number;
        color: ColorLike | ((...params: any[]) => ColorLike);
        color2: ColorLike;
    });
    /** Set the initial width
     * @param {number} width width, default 0
     */
    setWidth(width: number): void;
    /** Set the final width
     * @param {number} width width, default 0
     */
    setWidth2(width: number): void;
    /** Set the LineCap
     * @param {steing} cap LineCap (round or mitter), default mitter
     */
    setLineCap(cap: string): void;
    /** Get the current width at step
     * @param {feature} feature
     * @param {number} step current drawing step beetween [0,1]
     * @return {number}
     */
    getWidth(feature: Feature, step: number): number;
    /** Set the initial color
     * @param {colorLike} color
     */
    setColor(color: ColorLike): void;
    /** Set the final color
     * @param {colorLike} color
     */
    setColor2(color: ColorLike): void;
    /** Get the current color at step
     * @param {feature} feature
     * @param {number} step current drawing step beetween [0,1]
     * @return {string}
     */
    getColor(feature: Feature, step: number): string;
}
