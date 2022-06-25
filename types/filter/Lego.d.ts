export default ol_filter_Lego;
/** Make a map or layer look like made of a set of Lego bricks.
 *  @constructor
 * @requires ol_filter
 * @extends {ol_filter_Base}
 * @param {Object} [options]
 *  @param {string} [options.img]
 *  @param {number} [options.brickSize] size of te brick, default 30
 *  @param {null | string | undefined} [options.crossOrigin] crossOrigin attribute for loaded images.
 */
declare class ol_filter_Lego {
    constructor(options: any);
    pattern: {
        canvas: HTMLCanvasElement;
    };
    internal_: HTMLCanvasElement;
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
    getPattern(offsetX: number, offsetY: number): any;
    /** Postcompose operation
    */
    postcompose(e: any): void;
    /** Image definition
    */
    img: {
        brick: string;
        ol3: string;
        lego: string;
    };
}
