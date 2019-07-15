import { Fill, RegularShape } from 'ol/style';
/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {} options Options.
 *   @param {Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
 *   @param {number} options.radius point radius
 * 	 @param {number} options.blur lur radius, default radius/3
 * 	 @param {number} options.offsetX x offset, default 0
 * 	 @param {number} options.offsetY y offset, default 0
 * @extends {style.RegularShape}
 * @implements {structs.IHasChecksum}
 * @api
 */
export class Shadow extends RegularShape {
    constructor(options: {
        fill: Fill | undefined;
        radius: number;
        blur: number;
        offsetX: number;
        offsetY: number;
    });
    /**
     * Clones the style.
     * @return {style.Shadow}
     */
    clone(): Shadow;
    /**
     * @inheritDoc
     */
    getChecksum(): string;
}
