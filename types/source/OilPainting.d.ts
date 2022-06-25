export default ol_source_OilPainting;
/** A source to turn your maps into oil paintings...
 * Original idea:  Santhosh G https://www.codeproject.com/Articles/471994/OilPaintEffect
 * JS implementation: Loktar (https://github.com/loktar00) https://codepen.io/loktar00/full/Fhzot/
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options
 *  @param {Array<ol/source/Source|ol/layer/Layer>} sources Input sources or layers. For vector data, use an VectorImage layer.
 *  @param {number} radius default 4
 *  @param {number} intensity default 25
 */
declare class ol_source_OilPainting {
    constructor(options: any);
    /** Set value and force change
     */
    set(key: any, val: any): any;
    /**
     * @private
     */
    private _operation;
}
