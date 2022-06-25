export default exif2geojson;
/** Convert a list of image file or a list of image into geojson
* reading location in the EXIF tags
* @constructor
* @param {Array<Image|File>} img the array to process
* @param {} options
*	  @param {boolean} camera true to get camera info
*	  @param {boolean} options.date true to get photo date
*	  @param {boolean} options.image true to get image info
*	  @param {function} options.loading a callback function that take the number of image to process
*	  @param {function} options.onLoad callback function that takes a geojson when loaded
* @require Exif-JS [https://github.com/exif-js/exif-js]
*/
declare var exif2geojson: any;
