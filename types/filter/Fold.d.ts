export default ol_filter_Fold;
/** Fold filer map
 * @constructor
 * @requires ol_filter
 * @extends {ol_filter_Base}
 * @param {Object} [options]
 *  @param {Array<number>} [options.fold[8,4]] number of fold (horizontal and vertical)
 *  @param {number} [options.margin=8] margin in px, default 8
 *  @param {number} [options.padding=8] padding in px, default 8
 *  @param {number|number[]} [options.fsize=[8,10]] fold size in px, default 8,10
 *  @param {boolean} [options.fill=false] true to fill the background, default false
 *  @param {boolean} [options.shadow=true] true to display shadow
 *  @param {boolean} [options.opacity=.2] effect opacity
 */
declare class ol_filter_Fold {
    constructor(options: any);
    drawLine_(ctx: any, d: any, m: any): void;
    precompose(e: any): void;
    postcompose(e: any): void;
}
