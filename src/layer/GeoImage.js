/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_layer_Image from 'ol/layer/Image.js'

/**
 * @classdesc
 * Image layer to use with a GeoImage source and return the extent calcaulted with this source.
 * @extends {ol.layer.Image}
 * @param {Object=} options Layer Image options.
 * @api
 */
var ol_layer_GeoImage = class ollayerGeoImage extends ol_layer_Image {
  constructor(options) {
    super(options);
  }
  /**
   * Return the {@link module:ol/extent~Extent extent} of the source associated with the layer.
   * @return {ol.Extent} The layer extent.
   * @observable
   * @api
   */
  getExtent() {
    return this.getSource().getExtent();
  }
}

export default ol_layer_GeoImage;
