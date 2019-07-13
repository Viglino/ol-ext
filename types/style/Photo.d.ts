import { Stroke, RegularShape } from 'ol/style';
/**
 * @classdesc
 * Set Photo style for vector features.
 *
 * @constructor
 * @param {} options
 *  @param { default | square | round | anchored | folio } options.kind
 *  @param {boolean} options.crop crop within square, default is false
 *  @param {Number} options.radius symbol Size
 *  @param {boolean} options.shadow drop a shadow
 *  @param {style.Stroke} options.stroke
 *  @param {String} options.src image src
 *  @param {String} options.crossOrigin The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you want to access pixel data with the Canvas renderer.
 *  @param {Number} options.offsetX Horizontal offset in pixels. Default is 0.
 *  @param {Number} options.offsetY Vertical offset in pixels. Default is 0.
 *  @param {function} options.onload callback when image is loaded (to redraw the layer)
 * @extends {style.RegularShape}
 * @implements {structs.IHasChecksum}
 * @api
 */
export class Photo extends RegularShape {
    constructor(options: {
        kind: 'default' | 'square' | 'round' | 'anchored' | 'folio';
        crop: boolean;
        radius: number;
        shadow: boolean;
        stroke: Stroke;
        src: string;
        crossOrigin: string;
        offsetX: number;
        offsetY: number;
        onload: (...params: any[]) => any;
    });
    /**
     * Clones the style.
     * @return {style.Photo}
     */
    clone(): Photo;
    /**
     * @inheritDoc
     */
    getChecksum(): string;
}
