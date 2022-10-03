/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @classdesc
  ol_source_WikiCommons is a source that load Wikimedia Commons content in a vector layer.
  
  Inherits from:
  <ol.source.Vector>
*/
import {bbox as ol_loadingstrategy_bbox} from 'ol/loadingstrategy.js'
import ol_source_Vector from 'ol/source/Vector.js'
import ol_Feature from 'ol/Feature.js'
import ol_geom_Point from 'ol/geom/Point.js'
import {transform as ol_proj_transform, transformExtent as ol_proj_transformExtent} from 'ol/proj.js'
import ol_ext_Ajax from '../util/Ajax.js';

/**
* @constructor ol_source_WikiCommons
* @extends {ol_source_Vector}
* @param {olx.source.WikiCommons=} options
*/
var ol_source_WikiCommons = class olsourceWikiCommons extends ol_source_Vector {
  constructor(opt_options) {
    var options = opt_options || {}

    options.loader = function(extent, resolution, projection) {
      return this._loaderFn(extent, resolution, projection)
    } 

    /** Default attribution */
    if (!options.attributions) options.attributions = [ '&copy; <a href="https://commons.wikimedia.org/">Wikimedia Commons</a>']

    // Bbox strategy : reload at each move
    if (!options.strategy) options.strategy = ol_loadingstrategy_bbox

    super(options)

    /** Max resolution to load features  */
    this._maxResolution = options.maxResolution || 100

    /** Result language */
    this._lang = options.lang || "fr"

    /** Query limit */
    this._limit = options.limit || 100
  }
  /** Decode wiki attributes and choose to add feature to the layer
  * @param {feature} the feature
  * @param {attributes} wiki attributes
  * @return {boolean} true: add the feature to the layer
  * @API stable
  */
  readFeature(feature, attributes) {
    feature.set("descriptionurl", attributes.descriptionurl)
    feature.set("url", attributes.url)
    feature.set("title", attributes.title.replace(/^file:|.jpg$/ig, ""))
    feature.set("thumbnail", attributes.url.replace(/^(.+wikipedia\/commons)\/([a-zA-Z0-9]\/[a-zA-Z0-9]{2})\/(.+)$/, "$1/thumb/$2/$3/200px-$3"))
    feature.set("user", attributes.user)
    if (attributes.extmetadata && attributes.extmetadata.LicenseShortName) {
      feature.set("copy", attributes.extmetadata.LicenseShortName.value)
    }
    return true
  }
  /** Loader function used to load features.
  * @private
  */
  _loaderFn(extent, resolution, projection) {
    if (resolution > this._maxResolution)
      return
    var self = this
    var bbox = ol_proj_transformExtent(extent, projection, "EPSG:4326")
    // Commons API: for more info @see https://commons.wikimedia.org/wiki/Commons:API/MediaWiki
    var url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=coordinates|imageinfo"
      + "&generator=geosearch&iiprop=timestamp|user|url|extmetadata|metadata|size&iiextmetadatafilter=LicenseShortName"
      + "&ggsbbox=" + bbox[3] + "|" + bbox[0] + "|" + bbox[1] + "|" + bbox[2]
      + "&ggslimit=" + this._limit
      + "&iilimit=" + (this._limit - 1)
      + "&ggsnamespace=6"

    // Ajax request to get the tile
    ol_ext_Ajax.get({
      url: url,
      success: function (data) {
        //console.log(data);
        var features = []
        var att, pt, feature
        if (!data.query || !data.query.pages)
          return
        for (var i in data.query.pages) {
          att = data.query.pages[i]
          if (att.coordinates && att.coordinates.length) {
            pt = [att.coordinates[0].lon, att.coordinates[0].lat]
          } else {
            var meta = att.imageinfo[0].metadata
            if (!meta) {
              //console.log(att);
              continue
            }
            pt = []
            var found = 0
            for (var k = 0; k < meta.length; k++) {
              if (meta[k].name == "GPSLongitude") {
                pt[0] = meta[k].value
                found++
              }
              if (meta[k].name == "GPSLatitude") {
                pt[1] = meta[k].value
                found++
              }
            }
            if (found != 2) {
              //console.log(att);
              continue
            }
          }
          feature = new ol_Feature(new ol_geom_Point(ol_proj_transform(pt, "EPSG:4326", projection)))
          att.imageinfo[0].title = att.title
          if (self.readFeature(feature, att.imageinfo[0])) {
            features.push(feature)
          }
        }
        self.addFeatures(features)
      }
    })
  }
}

export default ol_source_WikiCommons
