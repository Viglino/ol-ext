/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'
import {asString as ol_color_asString} from 'ol/color'

/** Mask drawing using an ol.Feature
 * @constructor
 * @requires ol_filter
 * @extends {ol_filter_Base}
 * @param {Object} [options]
 *  @param {ol.Feature} [options.feature] feature to mask with
 *  @param {ol.style.Fill} [options.fill] style to fill with
 *  @param {boolean} [options.inner=false] mask inner, default false
 *  @param {boolean} [options.wrapX=false] wrap around the world, default false
 */
var ol_filter_Mask = function(options) {
  options = options || {};
  ol_filter_Base.call(this, options);
  if (options.feature) {
    switch (options.feature.getGeometry().getType()) {
      case 'Polygon':
      case 'MultiPolygon':
        this.feature_ = options.feature;
        break;
      default: break;
    }
  }
  this.set('inner', options.inner);
  this.fillColor_ = options.fill ? ol_color_asString(options.fill.getColor()) || "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.2)";
}
ol_ext_inherits(ol_filter_Mask, ol_filter_Base);

/** Draw the feature into canvas */
ol_filter_Mask.prototype.drawFeaturePath_ = function(e, out) {
  var ctx = e.context;
  var canvas = ctx.canvas;
  var ratio = e.frameState.pixelRatio;
  // Transform
  var tr;
  if (e.frameState.coordinateToPixelTransform) {
    var m = e.frameState.coordinateToPixelTransform;
    // ol > 6
    if (e.inversePixelTransform) {
      var ipt = e.inversePixelTransform;
      tr = function(pt) {
        pt = [
          (pt[0]*m[0]+pt[1]*m[1]+m[4]),
          (pt[0]*m[2]+pt[1]*m[3]+m[5])
        ];
        return [
          (pt[0]*ipt[0] - pt[1]*ipt[1] + ipt[4]),
          (-pt[0]*ipt[2] + pt[1]*ipt[3] + ipt[5])
        ]
      }
    } else {
      // ol 5
      tr = function(pt) {
        return [
          (pt[0]*m[0]+pt[1]*m[1]+m[4])*ratio,
          (pt[0]*m[2]+pt[1]*m[3]+m[5])*ratio
        ];
      }
    }
  } else {
    // Older version
    m = e.frameState.coordinateToPixelMatrix;
    tr = function(pt) {
      return [
        (pt[0]*m[0]+pt[1]*m[1]+m[12])*ratio,
        (pt[0]*m[4]+pt[1]*m[5]+m[13])*ratio
      ];
    }
  }
  // Geometry
  var ll = this.feature_.getGeometry().getCoordinates();
  if (this.feature_.getGeometry().getType()==='Polygon') ll = [ll];

  // Draw feature at dx world
  function drawll(dx) {
    for (var l=0; l<ll.length; l++) {
      var c = ll[l];
      for (var i=0; i<c.length; i++) {
        var pt = tr([c[i][0][0] + dx, c[i][0][1]]);
        ctx.moveTo (pt[0], pt[1]);
        for (var j=1; j<c[i].length; j++) {
          pt = tr([c[i][j][0] + dx, c[i][j][1]]);
          ctx.lineTo (pt[0], pt[1]);
        }
      }
    }
  }

  ctx.beginPath();

  if (out) {
    ctx.moveTo (0,0);
    ctx.lineTo (canvas.width, 0);
    ctx.lineTo (canvas.width, canvas.height);
    ctx.lineTo (0, canvas.height);
    ctx.lineTo (0, 0);
  }

  // Draw current world
  if (this.get('wrapX')) {
    var worldExtent = e.frameState.viewState.projection.getExtent()
    var worldWidth  = worldExtent[2] - worldExtent[0];
    var extent = e.frameState.extent;
    var fExtent = this.feature_.getGeometry().getExtent();
    var fWidth = fExtent[2] - fExtent[1];
    var start = Math.floor((extent[0] + fWidth - worldExtent[0]) / worldWidth);
    var end = Math.floor((extent[2] - fWidth - worldExtent[2]) / worldWidth) +1;
    
    if(start > end) {
        [start, end] = [end, start];
    }
    for (var i=start; i<=end; i++) {
      drawll(i*worldWidth);
    }
  } else {
    drawll(0);
  }
};

ol_filter_Mask.prototype.postcompose = function(e) {
  if (!this.feature_) return;
  var ctx = e.context;
  ctx.save();
    this.drawFeaturePath_(e, !this.get("inner"));
    ctx.fillStyle = this.fillColor_;
    ctx.fill("evenodd");
  ctx.restore();
};

export default ol_filter_Mask
