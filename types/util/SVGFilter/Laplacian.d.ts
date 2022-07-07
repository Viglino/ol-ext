export default ol_ext_SVGFilter_Laplacian;
/** A simple filter to detect edges on images
 * @constructor
 * @requires ol.filter
 * @extends {ol_ext_SVGFilter}
 * @param {*} options
 *  @param {number} options.neighbours nb of neighbour (4 or 8), default 8
 *  @param {boolean} options.grayscale get grayscale image, default false,
 *  @param {boolean} options.alpha get alpha channel, default false
 */
declare class ol_ext_SVGFilter_Laplacian {
    constructor(options: any);
}
