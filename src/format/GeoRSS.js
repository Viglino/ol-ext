/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_Object from 'ol/Object.js'
import ol_Feature from 'ol/Feature.js'
import ol_geom_Point from 'ol/geom/Point.js'
import ol_geom_Polygon from 'ol/geom/Polygon.js'

/** Feature format for reading data in the GeoRSS format.
 * @constructor ol_fromat_GeoRSS
 * @extends {ol_Object}
 * @param {*} options options.
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
var ol_format_GeoRSS = class olformatGeoRSS extends ol_Object {
  constructor(options) {
    options = options || {}
    super(options)
  }
  /**
   * Read a feature.  Only works for a single feature. Use `readFeatures` to
   * read a feature collection.
   *
   * @param {Node|string} source Source.
   * @param {*} options Read options.
   *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
   *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
   * @return {ol.Feature} Feature or null if no feature read
   * @api
   */
  readFeature(source, options) {
    options = options || {}
    var att, atts = source.children
    var f = new ol_Feature()
    // Get attributes
    for (var j = 0; att = atts[j]; j++) {
      f.set(att.tagName, att.innerHTML)
    }
    var temp, g, coord = []
    // Get geometry
    if (f.get('geo:long')) {
      // LonLat
      g = new ol_geom_Point([parseFloat(f.get('geo:long')), parseFloat(f.get('geo:lat'))])
      f.unset('geo:long')
      f.unset('geo:lat')
    } else if (f.get('georss:point')) {
      // Point
      coord = f.get('georss:point').trim().split(' ')
      g = new ol_geom_Point([parseFloat(coord[1]), parseFloat(coord[0])])
      f.unset('georss:point')
    } else if (f.get('georss:polygon')) {
      // Polygon
      temp = f.get('georss:polygon').trim().split(' ')
      for (var i = 0; i < temp.length; i += 2) {
        coord.push([parseFloat(temp[i + 1]), parseFloat(temp[i])])
      }
      g = new ol_geom_Polygon([coord])
      f.unset('georss:polygon')
    } else if (f.get('georss:where')) {
      // GML
      console.warn('[GeoRSS] GML format not implemented')
      f.unset('georss:where')
      return null
    } else {
      console.warn('[GeoRSS] unknown geometry')
      return null
    }
    if (options.featureProjection || this.get('featureProjection')) {
      g.transform(options.dataProjection || this.get('dataProjection') || 'EPSG:4326', options.featureProjection || this.get('featureProjection'))
    }
    f.setGeometry(g)
    return f
  }
  /**
   * Read all features.  Works with both a single feature and a feature
   * collection.
   *
   * @param {Document|Node|string} source Source.
   * @param {*} options Read options.
   *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
   *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
   * @return {Array<ol.Feature>} Features.
   * @api
   */
  readFeatures(source, options) {
    var items
    if (typeof (source) === 'string') {
      var parser = new DOMParser()
      var xmlDoc = parser.parseFromString(source, "text/xml")
      items = xmlDoc.getElementsByTagName(this.getDocumentItemsTagName(xmlDoc))
    } else if (source instanceof Document) {
      items = source.getElementsByTagName(this.getDocumentItemsTagName(source))
    } else if (source instanceof Node) {
      items = source
    } else {
      return []
    }

    var features = []
    for (var i = 0, item; item = items[i]; i++) {
      var f = this.readFeature(item, options)
      if (f)
        features.push(f)
    }

    return features
  }
  /**
   * Get the tag name for the items in the XML Document depending if we are
   * dealing with an atom base document or not.
   * @param {Document} xmlDoc document to extract the tag name for the items
   * @return {string} tag name
   * @private
   */
  getDocumentItemsTagName(xmlDoc) {
    switch (xmlDoc.documentElement.tagName) {
      case 'feed':
        return 'entry'
      default:
        return 'item'
    }
  }
}

export default ol_format_GeoRSS
