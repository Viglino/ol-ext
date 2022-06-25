export default exportMap;
/** Function to export the map as an image. The function
 *
 * Export PDF :
 * @uses jspdf
 * by gingerik
 * https://github.com/gingerik/ol3/blob/gh-pages/examples/export-pdf.html
 * http://gingerik.github.io/ol3/examples/export-pdf.html
 *
 * @param: {Array<HTMLElement>} elements an array of <A> elements with a download attribute
 * @param: {ol.Map} map the map to export
 * @param: {Object=} options
 *  @param {String} option.format image format: png/jpeg/webp, default find the extension in the download attribut
 *	@param {Number} options.quality quality between 0 and 1 indicating image quality if the requested type is jpeg or webp
*  @param {Number} options.dpi resolution of the map
*/
declare function exportMap(elements: any, map: any, options: any): any;
