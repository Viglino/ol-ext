/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_interaction_Pointer from 'ol/interaction/Pointer.js'
import ol_ext_getMapCanvas from '../util/getMapCanvas.js'

/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {Object} options
 * 	@param {function|undefined} onDrag Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
 *	@param {Number} options.size size of the compass in px, default 80
 *	@param {Number} options.alpha opacity of the compass, default 0.5
 */
var ol_interaction_TouchCompass = class olinteractionTouchCompass extends ol_interaction_Pointer {
	constructor(options) {
		options = options || {};

		var opt = {};
		// Click on the compass
		opt.handleDownEvent = function (e) {
			var s = this.getCenter_();
			var dx = e.pixel[0] - s[0];
			var dy = e.pixel[1] - s[1];
			this.start = e;
			return (Math.sqrt(dx * dx + dy * dy) < this.size / 2);
		};
		// Pn drag
		opt.handleDragEvent = function (e) {
			if (!this.pos) {
				this.pos = this.start;
				try { this.getMap().renderSync(); } catch (e) { /* ok */ }
			}
			this.pos = e;
		};
		// Stop drag
		opt.handleUpEvent = function () {
			this.pos = false;
			return true;
		};

		super(opt);

		this.ondrag_ = options.onDrag;
		this.size = options.size || 80;
		this.alpha = options.alpha || 0.5;

		if (!this.compass) {
			var canvas = this.compass = document.createElement('canvas');
			var ctx = canvas.getContext("2d");
			var s = canvas.width = canvas.height = this.size;
			var w = s / 10;
			var r = s / 2;
			var r2 = 0.22 * r;

			ctx.translate(r, r);
			ctx.fillStyle = "#999";
			ctx.strokeStyle = "#ccc";
			ctx.lineWidth = w;
			ctx.beginPath();
			ctx.arc(0, 0, s * 0.42, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#99f";
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(r, 0); ctx.lineTo(r2, r2); ctx.moveTo(0, 0);
			ctx.lineTo(-r, 0); ctx.lineTo(-r2, -r2); ctx.moveTo(0, 0);
			ctx.lineTo(0, r); ctx.lineTo(-r2, r2); ctx.moveTo(0, 0);
			ctx.lineTo(0, -r); ctx.lineTo(r2, -r2); ctx.moveTo(0, 0);
			ctx.fill();
			ctx.fillStyle = "#eee";
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(r, 0); ctx.lineTo(r2, -r2); ctx.moveTo(0, 0);
			ctx.lineTo(-r, 0); ctx.lineTo(-r2, r2); ctx.moveTo(0, 0);
			ctx.lineTo(0, r); ctx.lineTo(r2, r2); ctx.moveTo(0, 0);
			ctx.lineTo(0, -r); ctx.lineTo(-r2, -r2); ctx.moveTo(0, 0);
			ctx.fill();
		}
	}
	/**
	 * Remove the interaction from its current map, if any,  and attach it to a new
	 * map, if any. Pass `null` to just remove the interaction from the current map.
	 * @param {_ol_Map_} map Map.
	 * @api stable
	 */
	setMap(map) {
		if (this._listener) ol_Observable_unByKey(this._listener);
		this._listener = null;

		super.setMap(map);

		if (map) {
			this._listener = map.on('postcompose', this.drawCompass_.bind(this));
			ol_ext_getMapCanvas(map);
		}
	}
	/**
	 * Activate or deactivate the interaction.
	 * @param {boolean} active Active.
	 * @observable
	 * @api
	 */
	setActive(b) {
		super.setActive(b);
		if (this.getMap()) {
			try { this.getMap().renderSync(); } catch (e) { /* ok */ }
		}
	}
	/**
	 * Get the center of the compass
	 * @param {_ol_coordinate_}
	 * @private
	 */
	getCenter_() {
		var margin = 10;
		var s = this.size;
		var c = this.getMap().getSize();
		return [c[0] / 2, c[1] - margin - s / 2];
	}
	/**
	 * Draw the compass on post compose
	 * @private
	 */
	drawCompass_(e) {
		if (!this.getActive())
			return;

		var ctx = e.context || ol_ext_getMapCanvas(this.getMap()).getContext('2d');
		var ratio = e.frameState.pixelRatio;

		ctx.save();
		ctx.scale(ratio, ratio);

		ctx.globalAlpha = this.alpha;
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 5;

		var s = this.size;
		var c = this.getCenter_();

		ctx.drawImage(this.compass, 0, 0, this.compass.width, this.compass.height, c[0] - s / 2, c[1] - s / 2, s, s);

		if (this.pos) {
			var dx = this.pos.pixel[0] - this.start.pixel[0];
			var dy = this.pos.pixel[1] - this.start.pixel[1];
			for (var i = 1; i <= 4; i++) {
				ctx.beginPath();
				ctx.arc(c[0] + dx / 4 * i, c[1] + dy / 4 * i, s / 2 * (0.6 + 0.4 * i / 4), 0, 2 * Math.PI);
				ctx.stroke();
			}
		}

		ctx.restore();

		if (this.pos) { // Get delta
			if (this.ondrag_) {
				var r = this.getMap().getView().getResolution();
				var delta = {
					dpixel: [this.pos.pixel[0] - this.start.pixel[0], this.pos.pixel[1] - this.start.pixel[1]]
				};
				delta.traction = [delta.dpixel[0] * r, -delta.dpixel[1] * r];

				this.ondrag_(delta, this.pos);
			}
			// Continue animation
			e.frameState.animate = true;
		}
	}
}

export default ol_interaction_TouchCompass