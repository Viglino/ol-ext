/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_interaction_Interaction from 'ol/interaction/interaction'
import ol_Map from 'ol/Map'
import {ol_ext_inherits} from '../util/ext'
import ol_ext_element from '../util/element';

/** A map with a perspective
 * @constructor 
 * @extends {ol.Map}
 * @param {olx.MapOptions=} options 
 */
var ol_PerspectiveMap = function(options) {

  // Map div
  var divMap = options.target instanceof Element ? options.target : document.getElementById(options.target);
  console.log(divMap.style)
  if (window.getComputedStyle(divMap).position !== 'absolute') {
    divMap.style.position = 'relative';
  }
  divMap.style.overflow = 'hidden';

  // Create map inside
  var map = ol_ext_element.create('DIV', {
    className: 'ol-perspective-map',
    parent: divMap
  });
  var opts = {};
  Object.assign(opts, options);
  opts.target = map;
  // enhance pixel ratio
  //opts.pixelRatio = 2;
  console.log(opts)
  ol_Map.call (this, opts);
  
  this.reversInteraction = new ol_interaction_Interaction({
    // Transform the position to the current perspective
    handleEvent: function(e) {
      e.pixel = [
        e.originalEvent.offsetX / this.getPixelRatio(), 
        e.originalEvent.offsetY / this.getPixelRatio()
      ];
      e.coordinate = this.getCoordinateFromPixel(e.pixel);
      return true;
    }.bind(this)
  });
  this.addInteraction(this.reversInteraction);

};
ol_ext_inherits (ol_PerspectiveMap, ol_Map);

ol_PerspectiveMap.prototype.getPixelRatio = function(){
  return window.devicePixelRatio;
};

/** Set perspective angle
 * @param {number} angle the perspective angle 0 (vertical), 10, 20 or 30
 */
ol_PerspectiveMap.prototype.setPerspective = function(angle) {
  angle = Math.round(angle/10)*10;
  if (angle > 30) angle = 30;
  this.getTarget().className = 'ol-perspective-map ol-perspective-'+angle+'deg';
};

ol_PerspectiveMap.prototype.getMatrix = function() {
  var m = window.getComputedStyle(this.getTarget().querySelector('.ol-layer')).transform.replace('matrix3d(','').replace(')','').split(',');
  for (var i=0; i<m.length; i++) m[i] = Number(m[i]);
  return m;
};

/** See https://evanw.github.io/lightgl.js/docs/matrix.html
 * See https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
 * https://github.com/jlmakes/rematrix
 * https://jsfiddle.net/2znLxda2/
 * 
 */
ol_PerspectiveMap.prototype.inversMatrix = function() {
  var m = this.getMatrix();
  var r = [];

  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
  for (var i = 0; i < 16; i++) r[i] /= det;
  return r;
};

ol_PerspectiveMap.prototype.addInteraction = function(interaction) {
  ol_Map.prototype.addInteraction.call(this, interaction);
  // Add inversInteraction on top
  this.removeInteraction(this.reversInteraction);
  ol_Map.prototype.addInteraction.call(this, this.reversInteraction);
};

export default ol_PerspectiveMap
