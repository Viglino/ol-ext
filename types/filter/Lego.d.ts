import { Base } from './Base';
/** Make a map or layer look like made of a set of Lego bricks.
 *  @constructor
 * @requires filter
 * @extends {filter.Base}
 * @param {Object} [options]
 *  @param {string} [options.img]
 *  @param {number} [options.brickSize] Size of te brick, default 30
 *  @param {null | string | undefined} [options.crossOrigin] crossOrigin attribute for loaded images.
 */
export class Lego extends Base {
    constructor(options?: {
        img?: string;
        brickSize?: number;
        crossOrigin?: null | string | undefined;
    });
    /** Image definition
     */
    img: any;
    /** Overwrite to handle brickSize
    * @param {string} key
    * @param {any} val
     */
    set(key: string, val: any): void;
    /** Set the current brick
    *	@param {number} width the pattern width, default 30
    *	@param {'brick'|'ol3'|'lego'|undefined} img the pattern, default ol3
    *	@param {string} crossOrigin
     */
    setBrick(width: number, img: 'brick' | 'ol3' | 'lego' | undefined, crossOrigin: string): void;
    /** Get translated pattern
    *	@param {number} offsetX x offset
    *	@param {number} offsetY y offset
     */
    getPattern(offsetX: number, offsetY: number): void;
    /** Postcompose operation
     */
    postcompose(): void;
    /** Activate / deactivate filter
    *	@param {boolean} b
     */
    setActive(b: boolean): void;
    /** Get filter active
    *	@return {boolean}
     */
    getActive(): boolean;
}
