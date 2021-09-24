/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_Pointer from 'ol/interaction/Pointer'
import ol_ext_getMapCanvas from '../util/getMapCanvas'

/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {olx.interaction.TouchCompass} 
 *	- onDrag {function|undefined} Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
 *	- size {Number} size of the compass in px, default 80
 *	- alpha {Number} opacity of the compass, default 0.5
 */
var ol_interaction_TouchCompass = function(options) {
	options = options||{};

	var opt = {};
	// Click on the compass
	opt.handleDownEvent = function(e)
	{	var s = this.getCenter_();
		var dx = e.pixel[0]-s[0];
		var dy = e.pixel[1]-s[1];
		this.start = e;
		return (Math.sqrt(dx*dx+dy*dy) < this.size/2);
	};
	// Pn drag
	opt.handleDragEvent = function(e) {
		if (!this.pos) {
			this.pos = this.start;
			try { this.getMap().renderSync(); } catch(e) { /* ok */ }
		}
		this.pos = e;
	};
	// Stop drag
	opt.handleUpEvent = function()
	{	this.pos = false;
		return true;
	};

	ol_interaction_Pointer.call(this, opt);

	this.ondrag_ = options.onDrag;
	this.size = options.size || 80;
	this.alpha = options.alpha || 0.5;

	if (!ol_interaction_TouchCompass.prototype.compass)
	{	var canvas = ol_interaction_TouchCompass.prototype.compass = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		var s = canvas.width = canvas.height = this.size;
		var w = s/10;
		var r = s/2;
		var r2 = 0.22*r;

		ctx.translate(r,r);
		ctx.fillStyle = "#999";
		ctx.strokeStyle = "#ccc";
		ctx.lineWidth = w;
		ctx.beginPath();
		ctx.arc (0,0, s*0.42, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#99f";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.fill();
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.fill();
	}
};
ol_ext_inherits(ol_interaction_TouchCompass, ol_interaction_Pointer);

/** Compass Image as a JS Image object
* @api
*/
ol_interaction_TouchCompass.prototype.compass = null;

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_TouchCompass.prototype.setMap = function(map) {
	if (this._listener) ol_Observable_unByKey(this._listener);
	this._listener = null;

	ol_interaction_Pointer.prototype.setMap.call (this, map);

	if (map) {
		this._listener = map.on('postcompose', this.drawCompass_.bind(this));
		ol_ext_getMapCanvas(map);
	}
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol_interaction_TouchCompass.prototype.setActive = function(b)
{	ol_interaction_Pointer.prototype.setActive.call (this, b);
	if (this.getMap()) {
		try { this.getMap().renderSync(); } catch(e) { /* ok */ }
	}
}

/**
 * Get the center of the compass
 * @param {_ol_coordinate_}
 * @private
 */
ol_interaction_TouchCompass.prototype.getCenter_ = function()
{	var margin = 10;
	var s = this.size;
	var c = this.getMap().getSize(); 
	return [c[0]/2, c[1]-margin-s/2];
}

/**
 * Draw the compass on post compose
 * @private
 */
ol_interaction_TouchCompass.prototype.drawCompass_ = function(e)
{	if (!this.getActive()) return;

	var ctx = e.context || ol_ext_getMapCanvas(this.getMap()).getContext('2d');
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	ctx.scale(ratio,ratio);

	ctx.globalAlpha = this.alpha;
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 5;

	var s = this.size;
	var c = this.getCenter_();

	ctx.drawImage(this.compass, 0,0,this.compass.width,this.compass.height, c[0]-s/2, c[1]-s/2, s,s);

	if (this.pos)
	{	var dx = this.pos.pixel[0]-this.start.pixel[0];
		var dy = this.pos.pixel[1]-this.start.pixel[1];
		for (var i=1; i<=4; i++)
		{	ctx.beginPath();
			ctx.arc (c[0] +dx/4*i, c[1] +dy/4*i, s/2*(0.6+0.4*i/4), 0, 2*Math.PI);
			ctx.stroke();
		}
	}

	ctx.restore();

	if (this.pos)
	{	// Get delta
		if (this.ondrag_) 
		{	var r = this.getMap().getView().getResolution();
			var delta = 
				{	dpixel: [ this.pos.pixel[0] - this.start.pixel[0], this.pos.pixel[1] - this.start.pixel[1] ]
				}
			delta.traction = [ delta.dpixel[0]*r, -delta.dpixel[1]*r];

			this.ondrag_(delta, this.pos);
		}
		// Continue animation
		e.frameState.animate = true;
	}
};

export default ol_interaction_TouchCompass