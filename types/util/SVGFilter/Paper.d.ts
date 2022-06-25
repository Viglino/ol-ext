export default ol_ext_SVGFilter_Paper;
/** Apply a sobel filter on an image
 * @constructor
 * @requires ol.filter
 * @extends {ol_ext_SVGFilter}
 * @param {object} options
 *  @param {string} [options.id]
 *  @param {number} [options.scale=1]
 *  @param {number} [options.ligth=50] light option. 0: darker, 100: lighter
 */
declare class ol_ext_SVGFilter_Paper {
    constructor(options: any);
    /** Set filter light
     * @param {number} light light option. 0: darker, 100: lighter
     */
    setLight(light: number): void;
}
