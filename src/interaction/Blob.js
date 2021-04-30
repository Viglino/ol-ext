import ol_ext_inherits from '../util/ext'
import ol_interaction_Clip from './Clip'
import ol_coordinate_cspline from '../render/Cspline'

/** Blob interaction to clip layers in a blob
 * @constructor
 * @extends {ol_interaction_Clip}
 * @param {*} options blob  options
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
 *	@param {number} [options.stiffness=20] spring stiffness coef, default 20
 *	@param {number} [options.damping=7] spring damping coef
 *	@param {number} [options.mass=1] blob mass
 *	@param {number} [options.points=10] number of points for the blob polygon
 *	@param {number} [options.tension=.5] blob polygon spline tension 
 *	@param {number} [options.fuss] bob fussing factor
 *	@param {number} [options.amplitude=1] blob deformation amplitude factor
 */
var ol_interaction_Blob = function(options) {
  ol_interaction_Clip.call(this, options);
};
ol_ext_inherits(ol_interaction_Blob, ol_interaction_Clip);

/** Animate the blob
 * @private
 */
ol_interaction_Blob.prototype.precompose_ = function(e) {
  if (!this.getActive()) return;
  var ctx = e.context;
  var ratio = e.frameState.pixelRatio;

  ctx.save();
  if (!this.pos) {
    ctx.beginPath();
    ctx.moveTo (0,0);
    ctx.clip();
    return;
  }

  var pt = [ this.pos[0], this.pos[1] ];
  var tr = e.inversePixelTransform;
  if (tr) {
    pt = [
      (pt[0]*tr[0] - pt[1]*tr[1] + tr[4]),
      (-pt[0]*tr[2] + pt[1]*tr[3] + tr[5])
    ];
  } else {
    pt[0] *= ratio;
    pt[1] *= ratio;
  }

  // Time laps
  if (!this.frame) this.frame = e.frameState.time;
  var dt = e.frameState.time - this.frame;
  this.frame = e.frameState.time;
  // Blob position
  pt = this._getCenter(pt, dt);
  // Blob geom
  var blob = this._calculate(dt);
  // Draw
  var p = blob[0];
  ctx.beginPath();
  ctx.moveTo (pt[0] + p[0], pt[1] + p[1]);
  for (var i=1; p=blob[i]; i++) {
    ctx.lineTo (pt[0] + p[0], pt[1] + p[1]);
  }
  ctx.clip();
  e.frameState.animate = true;
};

/** Get blob center with kinetic
 * @param {number} dt0 time laps
 * @private
 */
ol_interaction_Blob.prototype._getCenter = function(pt, dt0) {
  if (!this._center) {
    this._center = pt;
    this._velocity = [0, 0];
  } else {
    var k = this.get('stiffness') || 20;     // stiffness
    var d = -1* (this.get('damping') || 7);  // damping
    var mass = Math.max(this.get('mass') || 1, .1);
    var dt = Math.min(dt0/1000, 1/30);

    var fSpring = [
      k * (pt[0] - this._center[0]),
      k * (pt[1] - this._center[1])
    ];
    var fDamping = [
      d * this._velocity[0],
      d * this._velocity[1]
    ];

    var accel = [
      (fSpring[0] + fDamping[0]) / mass,
      (fSpring[1] + fDamping[1]) / mass
    ];

    this._velocity[0] += accel[0] * dt;
    this._velocity[1] += accel[1] * dt;

    this._center[0] += this._velocity[0] * dt;
    this._center[1] += this._velocity[1] * dt;
  }
  return this._center;
};

/** Calculate the blob geom
 * @param {number} dt time laps
 * @returns {Array<ol_coordinate>}
 * @private
 */
ol_interaction_Blob.prototype._calculate = function(dt) {
  var i, nb = this.get('points') || 10;
  if (!this._waves || this._waves.length !== nb) {
    this._waves = [];
    for (i = 0; i < nb; i++) {
      this._waves.push({
        angle: Math.random()*Math.PI, 
        noise: Math.random()
      });
    }
  }
  var blob = [];
  var speed = (this._velocity[0]*this._velocity[0] + this._velocity[1]*this._velocity[1]) / 500;
  this._rotation = (this._rotation||0) + (this._velocity[0]>0 ? 1 : -1) * Math.min(.015, speed/70000*dt);
  for (i = 0; i < nb; i++) {
    var angle = i * 2 * Math.PI / nb + this._rotation;
    var radius = this.radius + Math.min(this.radius, speed);
    var delta = Math.cos(this._waves[i].angle) * radius/4 * this._waves[i].noise * (this.get('amplitude') || 1);
    blob.push([
      (this.radius + delta) * Math.cos(angle),
      (this.radius + delta) * Math.sin(angle)
    ]);
    // Add noise
    this._waves[i].angle += (Math.PI + Math.random() + speed/200)/350 * dt * (this.get('fuss') || 1);
    this._waves[i].noise = Math.min(1, Math.max(0, this._waves[i].noise + (Math.random() - .5) *.1 *(this.get('fuss') || 1)));
  }
  blob.push(blob[0]);
  return ol_coordinate_cspline(blob, { tension: this.get('tension') });
};

export default ol_interaction_Blob
