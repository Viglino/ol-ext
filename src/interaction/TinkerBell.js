/*	
  Tinker Bell effect on maps.
  
  Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @link https://github.com/Viglino
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_Pointer from 'ol/interaction/Pointer'
import {asString as ol_color_asString} from 'ol/color'
import ol_ext_getMapCanvas from '../util/getMapcanvas'

/**
 * @constructor
 * @extends {ol_interaction_Pointer}
 *	@param {ol_interaction_TinkerBell.options}  options flashlight param
*		- color {ol_color} color of the sparkles
*/
var ol_interaction_TinkerBell = function(options) {
  options = options || {};

  ol_interaction_Pointer.call(this, {
    handleDownEvent: this.onMove,
    handleMoveEvent: this.onMove
  });

  this.set('color', options.color ? ol_color_asString(options.color) : "#fff");
  this.sparkle = [0,0];
  this.sparkles = [];
  this.lastSparkle = this.time = new Date();

  var self = this;
  this.out_ = function() { self.isout_=true; };
  this.isout_ = true;
};
ol_ext_inherits(ol_interaction_TinkerBell, ol_interaction_Pointer);

/** Set the map > start postcompose
*/
ol_interaction_TinkerBell.prototype.setMap = function(map) {
  if (this._listener) ol_Observable_unByKey(this._listener);
  this._listener = null;
  if (this.getMap()) {
    map.getViewport().removeEventListener('mouseout', this.out_, false);
    this.getMap().render();
  }

  ol_interaction_Pointer.prototype.setMap.call(this, map);

  if (map) {
    this._listener = map.on('postcompose', this.postcompose_.bind(this));
    map.getViewport().addEventListener('mouseout', this.out_, false);
  }
};

ol_interaction_TinkerBell.prototype.onMove = function(e) {
  this.sparkle = e.pixel;
  this.isout_ = false;
  this.getMap().render();
};

/** Postcompose function
*/
ol_interaction_TinkerBell.prototype.postcompose_ = function(e) {
  var delta = 15;
  var ctx = e.context || ol_ext_getMapCanvas(this.getMap()).getContext('2d');
  var dt = e.frameState.time - this.time;
  this.time = e.frameState.time;
  if (e.frameState.time-this.lastSparkle > 30 && !this.isout_) {
    this.lastSparkle = e.frameState.time;
    this.sparkles.push({ p:[this.sparkle[0]+Math.random()*delta-delta/2, this.sparkle[1]+Math.random()*delta], o:1 });
  }
  ctx.save();
    ctx.scale(e.frameState.pixelRatio,e.frameState.pixelRatio);
    ctx.fillStyle = this.get("color");
    for (var i=this.sparkles.length-1, p; p=this.sparkles[i]; i--) {
      if (p.o < 0.2) {
        this.sparkles.splice(0,i+1);
        break;
      }
      ctx.globalAlpha = p.o;
      ctx.beginPath();
      ctx.arc (p.p[0], p.p[1], 2.2, 0, 2 * Math.PI, false);
      ctx.fill();
      p.o *= 0.98;
      p.p[0] += (Math.random()-0.5);
      p.p[1] += dt*(1+Math.random())/30;
    }
  ctx.restore();

  // continue postcompose animation
  if (this.sparkles.length) this.getMap().render(); 
};

export default ol_interaction_TinkerBell