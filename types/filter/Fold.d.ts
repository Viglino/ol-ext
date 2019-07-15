import { Base } from './Base';
/** Fold filer map
* @constructor
* @requires filter
* @extends {filter.Base}
* @param {Object} [options]
*  @param {[number, number]} [options.fold] number of fold (horizontal and vertical)
*  @param {number} [options.margin] margin in px, default 8
*  @param {number} [options.padding] padding in px, default 8
*  @param {number|number[]} [options.fSize] fold Size in px, default 8,10
 */
export class Fold extends Base {
    constructor(options?: {
        margin?: number;
        padding?: number;
        fSize?: number | number[];
    });
    /** Activate / deactivate filter
    *	@param {boolean} b
     */
    setActive(b: boolean): void;
    /** Get filter active
    *	@return {boolean}
     */
    getActive(): boolean;
}
