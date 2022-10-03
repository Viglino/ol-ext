/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_featureAnimation from './FeatureAnimation.js'

/** Teleport a feature at a given place (feat. Star Trek)
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
var ol_featureAnimation_Teleport = class olfeatureAnimationTeleport extends ol_featureAnimation {
	constructor(options) {
		super(options);
	}
	/** Animate
	* @param {ol_featureAnimationEvent} e
	*/
	animate(e) {
		var sc = this.easing_(e.elapsed);
		if (sc) {
			e.context.save();
			var ratio = e.frameState.pixelRatio;
			e.context.globalAlpha = sc;
			e.context.scale(sc, 1 / sc);
			var m = e.frameState.coordinateToPixelTransform;
			var dx = (1 / sc - 1) * ratio * (m[0] * e.coord[0] + m[1] * e.coord[1] + m[4]);
			var dy = (sc - 1) * ratio * (m[2] * e.coord[0] + m[3] * e.coord[1] + m[5]);
			e.context.translate(dx, dy);
			this.drawGeom_(e, e.geom);
			e.context.restore();
		}

		return (e.time <= this.duration_);
	}
}

export default ol_featureAnimation_Teleport
