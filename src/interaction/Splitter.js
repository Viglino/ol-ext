/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import ol_interaction_Interaction from 'ol/interaction/Interaction.js'
import ol_source_Vector from 'ol/source/Vector.js'
import ol_Collection from 'ol/Collection.js'
import {boundingExtent as ol_extent_boundingExtent, buffer as ol_extent_buffer} from 'ol/extent.js'
import '../geom/LineStringSplitAt.js'

/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires  beforesplit, aftersplit
 * @param {options} 
 *  @param {ol.source.Vector|Array<ol.source.Vector>} options.source The target source (or array of source) with features to be split (configured with useSpatialIndex set to true)
 *  @param {ol.source.Vector} options.triggerSource Any newly created or modified features from this source will be used to split features on the target source. If none is provided the target source is used instead.
 *  @param {ol_Collection.<ol.Feature>} options.features A collection of feature to be split (replace source target).
 *  @param {ol_Collection.<ol.Feature>} options.triggerFeatures Any newly created or modified features from this collection will be used to split features on the target source (replace triggerSource).
 *  @param {function|undefined} options.filter a filter that takes a feature and return true if the feature is eligible for splitting, default always split.
 *  @param {function|undefined} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split. Default is 1e-10.
 * @todo verify auto intersection on features that split.
 */
var ol_interaction_Splitter = class olinteractionSplitter extends ol_interaction_Interaction {
  constructor(options) {
    options = options || {}

    super({
      handleEvent: function (e) {
        // Hack to get only one changeFeature when draging with ol.interaction.Modify on.
        if (e.type != "pointermove" && e.type != "pointerdrag") {
          if (this.lastEvent_) {
            this.splitSource(this.lastEvent_.feature)
            this.lastEvent_ = null
          }
          this.moving_ = false
        } else {
          this.moving_ = true
        }
        return true
      },
    })

    // Features added / remove
    this.added_ = []
    this.removed_ = []

    // Source to split
    if (options.features) {
      this.source_ = new ol_source_Vector({ features: options.features })
    } else {
      this.source_ = options.source ? options.source : new ol_source_Vector({ features: new ol_Collection() })
    }
    var trigger = this.triggerSource
    if (options.triggerFeatures) {
      trigger = new ol_source_Vector({ features: options.triggerFeatures })
    }

    if (trigger) {
      trigger.on("addfeature", this.onAddFeature.bind(this))
      trigger.on("changefeature", this.onChangeFeature.bind(this))
      trigger.on("removefeature", this.onRemoveFeature.bind(this))
    } else {
      this.source_.on("addfeature", this.onAddFeature.bind(this))
      this.source_.on("changefeature", this.onChangeFeature.bind(this))
      this.source_.on("removefeature", this.onRemoveFeature.bind(this))
    }

    // Split tolerance between the calculated intersection and the geometry
    this.tolerance_ = options.tolerance || 1e-10

    // Get all features candidate
    this.filterSplit_ = options.filter || function () { return true }
  }
  /** Calculate intersection on 2 segs
  * @param {Array<_ol_coordinate_>} s1 first seg to intersect (2 points)
  * @param {Array<_ol_coordinate_>} s2 second seg to intersect (2 points)
  * @return { boolean | _ol_coordinate_ } intersection point or false no intersection
  */
  intersectSegs(s1, s2) {
    var tol = this.tolerance_

    // Solve
    var x12 = s1[0][0] - s1[1][0]
    var x34 = s2[0][0] - s2[1][0]
    var y12 = s1[0][1] - s1[1][1]
    var y34 = s2[0][1] - s2[1][1]

    var det = x12 * y34 - y12 * x34
    // No intersection
    if (Math.abs(det) < tol) {
      return false
    } else {
      // Outside segement
      var r1 = ((s1[0][0] - s2[1][0]) * y34 - (s1[0][1] - s2[1][1]) * x34) / det
      if (Math.abs(r1) < tol)
        return s1[0]
      if (Math.abs(1 - r1) < tol)
        return s1[1]
      if (r1 < 0 || r1 > 1)
        return false

      var r2 = ((s1[0][1] - s2[1][1]) * x12 - (s1[0][0] - s2[1][0]) * y12) / det
      if (Math.abs(r2) < tol)
        return s2[1]
      if (Math.abs(1 - r2) < tol)
        return s2[0]
      if (r2 < 0 || r2 > 1)
        return false

      // Intersection
      var a = s1[0][0] * s1[1][1] - s1[0][1] * s1[1][0]
      var b = s2[0][0] * s2[1][1] - s2[0][1] * s2[1][0]
      var p = [(a * x34 - b * x12) / det, (a * y34 - b * y12) / det]
      // Test start / end
      /*
      console.log("r1: "+r1)
      console.log("r2: "+r2)
      console.log ("s10: "+(_ol_coordinate_.dist2d(p,s1[0])<tol)) ;
      console.log ("s11: "+(_ol_coordinate_.dist2d(p,s1[1])<tol)) ;
      console.log ("s20: "+(_ol_coordinate_.dist2d(p,s2[0])<tol)) ;
      console.log ("s21: "+(_ol_coordinate_.dist2d(p,s2[1])<tol)) ;
      */
      return p
    }
  }
  /** Split the source using a feature
  * @param {ol.Feature} feature The feature to use to split.
  * @private
  */
  splitSource(feature, change) {
    if (!this.getActive())
      return

    // Allready perform a split
    if (this.splitting)
      return

    // Start splitting
    this.source_.dispatchEvent({ type: 'beforesplit', feaure: feature, source: this.source_ })
    this.dispatchEvent({ type: 'beforesplit', feaure: feature, source: this.source_ })

    // If the interaction is inserted other interaction, the objet is not consistant 
    // > wait end of other interactions
    if (change) {
      this._splitSource(feature)
    } else {
      setTimeout(function () { this._splitSource(feature) }.bind(this))
    }
  }
  /** Split the source using a feature
  * @param {ol.Feature} feature The feature to use to split.
  * @private
  */
  _splitSource(feature) {

    var i, k, f2

    this.splitting = true
    this.added_ = []
    this.removed_ = []

    var c = feature.getGeometry().getCoordinates()
    // Geom type
    switch (feature.getGeometry().getType()) {
      case 'Point': {
        c = [c]; 
        break;
      }
      case 'LineString': {
        break;
      }
      default: {
        c = []; 
        break;
      }
    }

    var seg, split = []
    function intersect(f) {
      if (f !== feature && f.getGeometry().splitAt) {
        var c2 = f.getGeometry().getCoordinates()
        for (var j = 0; j < c2.length - 1; j++) {
          var p = this.intersectSegs(seg, [c2[j], c2[j + 1]])
          if (p) {
            split.push(p)
            g = f.getGeometry().splitAt(p, this.tolerance_)
            if (g && g.length > 1) {
              found = f
              return true
            }
          }
        }
      }
      return false
    }

    // Split with a point
    if (c.length === 1) {
      seg = [c[0], c[0]]
      var extent = ol_extent_buffer(ol_extent_boundingExtent(seg), this.tolerance_ /*0.01*/)
      this.source_.forEachFeatureIntersectingExtent(extent, function(f) {
        if (f.getGeometry().splitAt) {
          var g = f.getGeometry().splitAt(c[0], this.tolerance_)
          if (g.length > 1) {
            this.source_.removeFeature(f)
            for (k = 0; k < g.length; k++) {
              f2 = f.clone()
              f2.setGeometry(g[k])
              this.source_.addFeature(f2)
            }
          }
        }
      }.bind(this))
    }
    // Split existing features
    for (i = 0; i < c.length - 1; i++) {
      seg = [c[i], c[i + 1]]
      var extent = ol_extent_buffer(ol_extent_boundingExtent(seg), this.tolerance_ /*0.01*/)
      var g
      while (true) {
        var found = false
        this.source_.forEachFeatureIntersectingExtent(extent, intersect.bind(this))
        // Split feature
        if (found) {
          var f = found
          this.source_.removeFeature(f)
          for (k = 0; k < g.length; k++) {
            f2 = f.clone()
            f2.setGeometry(g[k])
            this.source_.addFeature(f2)
          }
        }
        else
          break
      }
    }

    // Auto intersect
    for (i = 0; i < c.length - 2; i++) {
      for (var j = i + 1; j < c.length - 1; j++) {
        var p = this.intersectSegs([c[i], c[i + 1]], [c[j], c[j + 1]])
        if (p && p != c[i + 1]) {
          split.push(p)
        }
      }
    }

    // Split original
    var splitOriginal = false
    if (split.length) {
      var result = feature.getGeometry().splitAt(split, this.tolerance_)
      if (result.length > 1) {
        for (k = 0; k < result.length; k++) {
          f2 = feature.clone()
          f2.setGeometry(result[k])
          this.source_.addFeature(f2)
        }
        splitOriginal = true
      }
    }

    // End splitting
    setTimeout(function () {
      if (splitOriginal)
        this.source_.removeFeature(feature)
      this.source_.dispatchEvent({ type: 'aftersplit', featureAdded: this.added_, featureRemoved: this.removed_, source: this.source_ })
      this.dispatchEvent({ type: 'aftersplit', featureAdded: this.added_, featureRemoved: this.removed_, source: this.source_ })
      // Finish
      this.splitting = false
    }.bind(this))

  }
  /** New feature source is added
   * @private
  */
  onAddFeature(e) {
    this.splitSource(e.feature)
    if (this.splitting) {
      this.added_.push(e.feature)
    }
  }
  /** Feature source is removed > count features added/removed
   * @private
  */
  onRemoveFeature(e) {
    if (this.splitting) {
      var n = this.added_.indexOf(e.feature)
      if (n == -1) {
        this.removed_.push(e.feature)
      } else {
        this.added_.splice(n, 1)
      }
    }
  }
  /** Feature source is changing
   * @private
  */
  onChangeFeature(e) {
    if (this.moving_) {
      this.lastEvent_ = e
    } else {
      this.splitSource(e.feature, true)
    }
  }
}

export default ol_interaction_Splitter
