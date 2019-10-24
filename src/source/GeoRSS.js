/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_source_Vector from 'ol/source/Vector'
import ol_ext_Ajax from '../util/Ajax';

import ol_format_GeoRSS from '../format/GeoRSS'

/** ol_source_GeoRSS is a source that load Wikimedia Commons content in a vector layer.
 * @constructor 
 * @extends {ol_source_Vector}
 * @param {*} options source options
 *  @param {string} options.url GeoRSS feed url
 */
var ol_source_GeoRSS = function(options) {
  options = options || {};
  options.loader = this._loaderFn;
  ol_source_Vector.call (this, options);
};
ol_ext_inherits(ol_source_GeoRSS, ol_source_Vector);

/** Loader function used to load features.
* @private
*/
ol_source_GeoRSS.prototype._loaderFn = function(extent, resolution, projection){
  // Ajax request to get source
  ol_ext_Ajax.get({
    url: this.getUrl(),
    dataType: 'XML',
    error: function(){ console.log('oops'); },
    success: function(xml) {
      var features = (new ol_format_GeoRSS()).readFeatures(xml, { featureProjection: projection });
      this.addFeatures(features);
    }.bind(this)
  });
};

export default ol_source_GeoRSS
