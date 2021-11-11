/*
  Copyright (c) 2016-2018 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
  
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Path animation: feature follow a path
 * @constructor
 * @extends {ol.featureAnimation}
 * @param {ol.featureAnimationPathOptions} options extend ol.featureAnimation options
 *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
 *  @param {Number|boolean} options.rotate rotate the symbol when following the path, true or the initial rotation, default false
 *  @param {ol.geom.LineString|ol.Feature} options.path the path to follow
 *  @param {Number} options.duration duration of the animation in ms
 */
var ol_featureAnimation_Path = function(options){
  options = options || {};
  ol_featureAnimation.call(this, options);
  this.speed_ = options.speed || 0;
  this.path_ = options.path;
  switch (options.rotate) {
    case true: 
    case 0:
      this.rotate_ = 0;
      break;
    default:
      this.rotate_ = options.rotate || false;
      break;
  }
  if (this.path_ && this.path_.getGeometry) this.path_ = this.path_.getGeometry();
  if (this.path_ && this.path_.getLineString) this.path_ = this.path_.getLineString();
  if (this.path_.getLength) {
    this.dist_ = this.path_.getLength()
    if (this.path_ && this.path_.getCoordinates) this.path_ = this.path_.getCoordinates();
  } else {
    this.dist_ = 0;
  }
  if (this.speed_>0) this.duration_ = this.dist_/this.speed_;
}
ol_ext_inherits(ol_featureAnimation_Path, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Path.prototype.animate = function (e) {
  // First time 
  if (!e.time) {
    if (!this.dist_) return false;
  }
  var dmax = this.dist_*this.easing_(e.elapsed);
  var p0, p, s, dx,dy, dl, d = 0;
  p = this.path_[0];
  // Linear interpol
  for (var i = 1; i<this.path_.length; i++) {
    p0 = p;
    p = this.path_[i];
    dx = p[0]-p0[0];
    dy = p[1]-p0[1];
    dl = Math.sqrt(dx*dx+dy*dy);
    if (dl && d+dl>=dmax) {
      s = (dmax-d)/dl;
      p = [ p0[0] + (p[0]-p0[0])*s, p0[1] + (p[1]-p0[1])*s];
      break;
    }
    d += dl;
  }
  // Rotate symbols
  var style = e.style;
  e.rotation = Math.PI/2 + Math.atan2(p0[1] - p[1], p0[0] - p[0]);
  if (this.rotate_!==false) {
    var st = []
    var angle = this.rotate_ - e.rotation + e.frameState.viewState.rotation;
    e.rotation = Math.PI/2 + Math.atan2(p0[1] - p[1], p0[0] - p[0]);
    for (var k=0; s=e.style[k]; k++) {
      if (s.getImage()) {
        //s = s.clone();
        s.getImage().setRotation(angle);
      }
      st.push(s);
    }
    // Rotated style
    e.style = st;
  }
  e.geom.setCoordinates(p);
  // Animate
  this.drawGeom_(e, e.geom);
  // restore style (if modify by rotation)
  e.style = style;
  
  return (e.time <= this.duration_);
}

export default ol_featureAnimation_Path
