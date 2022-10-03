/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_Vector from 'ol/source/Vector.js'
import ol_ext_Ajax from '../util/Ajax.js';

import ol_format_GeoRSS from '../format/GeoRSS.js'

/** ol_source_GeoRSS is a source that load Wikimedia Commons content in a vector layer.
 * @constructor 
 * @extends {ol_source_Vector}
 * @param {*} options source options
 *  @param {string} options.url GeoRSS feed url
 */
var ol_source_GeoRSS = class olsourceGeoRSS extends ol_source_Vector {
  constructor(options) {
    options = options || {};
    options.loader = function(extent, resolution, projection) {
      return this._loaderFn(extent, resolution, projection);
    } 
    super(options);
  }
  /** Loader function used to load features.
  * @private
  */
  _loaderFn(extent, resolution, projection) {
    // Ajax request to get source
    ol_ext_Ajax.get({
      url: this.getUrl(),
      dataType: 'XML',
      error: function () { console.log('oops'); },
      success: function (xml) {
        var features = (new ol_format_GeoRSS()).readFeatures(xml, { featureProjection: projection });
        this.addFeatures(features);
      }.bind(this)
    });
  }
}

export default ol_source_GeoRSS
