/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import ol_ext_inherits from '../util/ext'
import {getDistance as ol_sphere_getDistance} from 'ol/sphere'
import {transform as ol_proj_transform} from 'ol/proj'
import ol_control_Control from 'ol/control/Control'
import ol_Feature from 'ol/Feature'

/**
 * @classdesc OpenLayers 3 Profil Control.
 *	Draw a profil of a feature (with a 3D geometry)
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires  over, out, show
 * @param {Object=} _ol_control_ opt_options.
 *
 */
var ol_control_Profil = function(opt_options)
{	var options = opt_options || {};
	this.info = options.info || ol_control_Profil.prototype.info;
	var self = this;

	var element;
	if (options.target)
	{	element = document.createElement("div");
		element.classList.add(options.className || "ol-profil");
	}
	else
	{	element = document.createElement("div");
		element.className = ((options.className || 'ol-profil') +' ol-unselectable ol-control ol-collapsed').trim();
		this.button = document.createElement("button");
		this.button.setAttribute('type','button');
		var click_touchstart_function = function(e)
		{	self.toggle();
			e.preventDefault();
		};
		this.button.addEventListener("click", click_touchstart_function);
		this.button.addEventListener("touchstart", click_touchstart_function);
		element.appendChild(this.button);
	}

	var div_inner = document.createElement("div");
			div_inner.classList.add("ol-inner");
			element.appendChild(div_inner);
	var div = document.createElement("div");
			div.style.position = "relative";
			div_inner.appendChild(div);

	var ratio = this.ratio = 2;
	this.canvas_ = document.createElement('canvas');
	this.canvas_.width = (options.width || 300)*ratio;
	this.canvas_.height = (options.height || 150)*ratio;

	var styles = {
		"msTransform":"scale(0.5,0.5)", "msTransformOrigin":"0 0",
		"webkitTransform":"scale(0.5,0.5)", "webkitTransformOrigin":"0 0",
		"mozTransform":"scale(0.5,0.5)", "mozTransformOrigin":"0 0",
		"transform":"scale(0.5,0.5)", "transformOrigin":"0 0"
	};

	Object.keys(styles).forEach(function(style) {
		if (style in self.canvas_.style) {
			self.canvas_.style[style] = styles[style];
		}
	});

	var div_to_canvas = document.createElement("div");
	div.appendChild(div_to_canvas);
	div_to_canvas.style.width = this.canvas_.width/ratio + "px";
	div_to_canvas.style.height = this.canvas_.height/ratio + "px";
	div_to_canvas.appendChild(this.canvas_);
	div_to_canvas.addEventListener("click", function(e){ self.onMove(e); });
	div_to_canvas.addEventListener("mousemove", function(e){ self.onMove(e); });

	ol_control_Control.call(this,
	{	element: element,
		target: options.target
	});

	// Offset in px
	this.margin_ = { top:10*ratio, left:40*ratio, bottom:30*ratio, right:10*ratio };
	if (!this.info.ytitle) this.margin_.left -= 20*ratio;
	if (!this.info.xtitle) this.margin_.bottom -= 20*ratio;

	// Cursor
	this.bar_ = document.createElement("div");
	this.bar_.classList.add("ol-profilbar");
	this.bar_.style.top = (this.margin_.top/ratio)+"px";
	this.bar_.style.height = (this.canvas_.height-this.margin_.top-this.margin_.bottom)/ratio+"px";
	div.appendChild(this.bar_);

	this.cursor_ = document.createElement("div");
	this.cursor_.classList.add("ol-profilcursor");
	div.appendChild(this.cursor_);

	this.popup_ = document.createElement("div");
	this.popup_.classList.add("ol-profilpopup");
	this.cursor_.appendChild(this.popup_);

	// Track information
	var t = document.createElement("table");
			t.cellPadding = '0';
			t.cellSpacing = '0';
			t.style.clientWidth = this.canvas_.width/ratio + "px";
		div.appendChild(t);

	var firstTr = document.createElement("tr");
			firstTr.classList.add("track-info");
			t.appendChild(firstTr);
	var div_zmin = document.createElement("td");
	div_zmin.innerHTML = (this.info.zmin||"Zmin")+': <span class="zmin">';
	firstTr.appendChild(div_zmin);
	var div_zmax = document.createElement("td");
	div_zmax.innerHTML = (this.info.zmax||"Zmax")+': <span class="zmax">';
	firstTr.appendChild(div_zmax);
	var div_distance = document.createElement("td");
	div_distance.innerHTML = (this.info.distance||"Distance")+': <span class="dist">';
	firstTr.appendChild(div_distance);
	var div_time = document.createElement("td");
	div_time.innerHTML = (this.info.time||"Time")+': <span class="time">';
	firstTr.appendChild(div_time);
	var secondTr = document.createElement("tr");
			secondTr.classList.add("point-info")
			t.appendChild(secondTr);
	var div_altitude = document.createElement("td");
	div_altitude.innerHTML = (this.info.altitude||"Altitude")+': <span class="z">';
	secondTr.appendChild(div_altitude);
	var div_distance2 = document.createElement("td");
	div_distance2.innerHTML = (this.info.distance||"Distance")+': <span class="dist">';
	secondTr.appendChild(div_distance2);
	var div_time2 = document.createElement("td");
	div_time2.innerHTML = (this.info.time||"Time")+': <span class="time">';
	secondTr.appendChild(div_time2);

	// Array of data
	this.tab_ = [];

	// Show feature
	if (options.feature)
	{	this.setGeometry (options.feature);
	}
};
ol_ext_inherits(ol_control_Profil, ol_control_Control);

/** Custom infos list
* @api stable
*/
ol_control_Profil.prototype.info =
{	"zmin": "Zmin",
	"zmax": "Zmax",
	"ytitle": "Altitude (m)",
	"xtitle": "Distance (km)",
	"time": "Time",
	"altitude": "Altitude",
	"distance": "Distance",
	"altitudeUnits": "m",
	"distanceUnitsM": "m",
	"distanceUnitsKM": "km",
};

/** Show popup info
* @param {string} info to display as a popup
* @api stable
*/
ol_control_Profil.prototype.popup = function(info)
{	this.popup_.innerHTML = info;
}

/** Mouse move over canvas
*/
ol_control_Profil.prototype.onMove = function(e)
{	if (!this.tab_.length) return;
	var box_canvas = this.canvas_.getBoundingClientRect();
	var pos = {
    top: box_canvas.top + window.pageYOffset - document.documentElement.clientTop,
    left: box_canvas.left + window.pageXOffset - document.documentElement.clientLeft
  };

	var dx = e.pageX -pos.left;
	var dy = e.pageY -pos.top;
	var ratio = this.ratio;
	if (dx>this.margin_.left/ratio && dx<(this.canvas_.width-this.margin_.right)/ratio
		&& dy>this.margin_.top/ratio && dy<(this.canvas_.height-this.margin_.bottom)/ratio)
	{	this.bar_.style.left = dx+"px";
		this.bar_.style.display = "block";
		var d = (dx*ratio-this.margin_.left)/this.scale_[0];
		var p0 = this.tab_[0];
		for (var i=1, p; p=this.tab_[i]; i++)
		{	if (p[0]>=d)
			{	if (d < (p[0]+p0[0])/2) p = p0;
				break;
			}
		}
		if (p) {
			this.cursor_.style.left = dx+"px";
			this.cursor_.style.top = (this.canvas_.height-this.margin_.bottom+p[1]*this.scale_[1]+this.dy_)/ratio+"px";
			this.cursor_.style.display = "block";
		}
		else {
			this.cursor_.style.display = "none";
		}
		this.bar_.parentElement.classList.add("over");
		this.element.querySelector(".point-info .z").textContent = p[1]+this.info.altitudeUnits;
		this.element.querySelector(".point-info .dist").textContent = (p[0]/1000).toFixed(1)+this.info.distanceUnitsKM;
		this.element.querySelector(".point-info .time").textContent = p[2];
		if (dx>this.canvas_.width/ratio/2) this.popup_.classList.add('ol-left');
		else this.popup_.classList.remove('ol-left');
		this.dispatchEvent({ type:'over', click:e.type=="click", coord: p[3], time: p[2], distance: p[0] });
	}
	else
	{	if (this.bar_.parentElement.classList.contains("over"))
		{	this.bar_.style.display = 'none';
			this.cursor_.style.display = 'none';
			this.bar_.parentElement.classList.remove("over");
			this.dispatchEvent({ type:'out' });
		}
	}
}

/** Show panel
* @api stable
*/
ol_control_Profil.prototype.show = function()
{	this.element.classList.remove("ol-collapsed");
	this.dispatchEvent({ type:'show', show: true });
}
/** Hide panel
* @api stable
*/
ol_control_Profil.prototype.hide = function()
{	this.element.classList.add("ol-collapsed");
	this.dispatchEvent({ type:'show', show: false });
}
/** Toggle panel
* @api stable
*/
ol_control_Profil.prototype.toggle = function()
{	this.element.classList.toggle("ol-collapsed");
	var b = this.element.classList.contains("ol-collapsed");
	this.dispatchEvent({ type:'show', show: !b });
}
/** Is panel visible
*/
ol_control_Profil.prototype.isShown = function()
{	return (!this.element.classList.contains("ol-collapsed"));
}

/**
 * Set the geometry to draw the profil.
 * @param {ol.Feature|ol.geom} f the feature.
 * @param {Object=} options
 *		- projection {ol.ProjectionLike} feature projection, default projection of the map
 *		- zunit {m|km} default m
 *		- unit {m|km} default km
 *		- zmin {Number|undefined} default 0
 *		- zmax {Number|undefined} default max Z of the feature
 *		- graduation {Number|undefined} z graduation default 100
 *		- amplitude {integer|undefined} amplitude of the altitude, default zmax-zmin
 * @api stable
 */
ol_control_Profil.prototype.setGeometry = function(g, options)
{	if (!options) options = {};
	if (g instanceof ol_Feature) g = g.getGeometry();
	var canvas = this.canvas_;
	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0,0, w, h);

	// No Z
	if (!/Z/.test(g.getLayout())) return;
	// No time
	if(/M/.test(g.getLayout())) this.element.querySelector(".time").parentElement.style.display = 'block';
	else this.element.querySelector(".time").parentElement.style.display = 'none';

	// Coords
	var c = g.getCoordinates();
	switch (g.getType())
	{	case "LineString": break;
		case "MultiLineString": c = c[0]; break;
		default: return;
	}

	// Distance beetween 2 coords
	var proj = options.projection || this.getMap().getView().getProjection();
	function dist2d(p1,p2)
	{	return ol_sphere_getDistance(
			ol_proj_transform(p1, proj, 'EPSG:4326'),
			ol_proj_transform(p2, proj, 'EPSG:4326'));
	}

	function getTime(t0, t1)
	{	if (!t0 || !t1) return "-"
		var dt = (t1-t0) / 60; // mn
		var ti = Math.trunc(dt/60);
		var mn = Math.trunc(dt-ti*60);
		return ti+"h"+(mn<10?"0":"")+mn+"mn";
	}

	// Margin
	ctx.setTransform(1, 0, 0, 1, this.margin_.left, h-this.margin_.bottom);
	var ratio = this.ratio;

	w -= this.margin_.right + this.margin_.left;
	h -= this.margin_.top + this.margin_.bottom;
	// Draw axes
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 0.5*ratio;
	ctx.beginPath();
	ctx.moveTo(0,0); ctx.lineTo(0,-h);
	ctx.moveTo(0,0); ctx.lineTo(w, 0);
	ctx.stroke();

	//
	var zmin=Infinity, zmax=-Infinity;
	var i, p, d, z, ti, t = this.tab_ = [];
	for (i=0, p; p=c[i]; i++)
	{	z = p[2];
		if (z<zmin) zmin=z;
		if (z>zmax) zmax=z;
		if (i==0) d = 0;
		else d += dist2d(c[i-1], p);
		ti = getTime(c[0][3],p[3]);
		t.push ([d, z, ti, p]);
	}

	// Info
	this.element.querySelector(".track-info .zmin").textContent = zmin.toFixed(2)+this.info.altitudeUnits;
	this.element.querySelector(".track-info .zmax").textContent = zmax.toFixed(2)+this.info.altitudeUnits;
	if (d>1000)
	{	this.element.querySelector(".track-info .dist").textContent = (d/1000).toFixed(1)+this.info.distanceUnitsKM;
	}
	else
	{	this.element.querySelector(".track-info .dist").textContent= (d).toFixed(1)+this.info.distanceUnitsM;
	}
	this.element.querySelector(".track-info .time").textContent = ti;

	// Set graduation
	var grad = options.graduation || 100;
	while (true)
	{	zmax = Math.ceil(zmax/grad)*grad;
		zmin = Math.floor(zmin/grad)*grad;
		var nbgrad = (zmax-zmin)/grad;
		if (h/nbgrad < 15*ratio)
		{	grad *= 2;
		}
		else break;
	}

	// Set amplitude
	if (typeof(options.zmin)=='number' && zmin > options.zmin) zmin = options.zmin;
	if (typeof(options.zmax)=='number' && zmax < options.zmax) zmax = options.zmax;
	var amplitude = options.amplitude;
	if (amplitude)
	{	zmax = Math.max (zmin + amplitude, zmax);
	}

	// Scales lines
	var scx = w/d;
	var scy = -h/(zmax-zmin);
	var dy = this.dy_ = -zmin*scy;
	this.scale_ = [scx,scy];
	// Draw
	ctx.font = (10*ratio)+"px arial";
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillStyle="#000";
	// Scale Z
	ctx.beginPath();
	for (i=zmin; i<=zmax; i+=grad)
	{	if (options.zunit!="km") ctx.fillText(i, -4*ratio, i*scy+dy);
		else ctx.fillText((i/1000).toFixed(1), -4*ratio, i*scy+dy);
		ctx.moveTo (-2*ratio, i*scy+dy);
		if (i!=0) ctx.lineTo (d*scx, i*scy+dy);
		else ctx.lineTo (0, i*scy+dy);
	}
	// Scale X
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.setLineDash([ratio,3*ratio]);
	var unit = options.unit ||"km";
	var step;
	if (d>1000)
	{	step = Math.round(d/1000)*100;
		if (step > 1000) step = Math.ceil(step/1000)*1000;
	}
	else
	{	unit = "m";
		if (d>100) step = Math.round(d/100)*10;
		else if (d>10) step = Math.round(d/10);
		else if (d>1) step = Math.round(d)/10;
		else step = d;
	}
	for (i=0; i<=d; i+=step)
	{	var txt = (unit=="m") ? i : (i/1000);
		//if (i+step>d) txt += " "+ (options.zunits || "km");
		ctx.fillText(Math.round(txt*10)/10, i*scx, 4*ratio);
		ctx.moveTo (i*scx, 2*ratio); ctx.lineTo (i*scx, 0);
	}
	ctx.font = (12*ratio)+"px arial";
	ctx.fillText(this.info.xtitle.replace("(km)","("+unit+")"), w/2, 18*ratio);
	ctx.save();
	ctx.rotate(-Math.PI/2);
	ctx.fillText(this.info.ytitle, h/2, -this.margin_.left);
	ctx.restore();
	
	ctx.stroke();

	// 
	ctx.strokeStyle = "#369";
	ctx.lineWidth = 1;
	ctx.setLineDash([]);
	ctx.beginPath();
	for (i=0; p=t[i]; i++)
	{	if (i==0) ctx.moveTo(p[0]*scx,p[1]*scy+dy);
		else ctx.lineTo(p[0]*scx,p[1]*scy+dy);
	}
	ctx.stroke();
};

/** Get profil image
* @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
* @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
* @return {string} requested data uri
* @api stable
*/
ol_control_Profil.prototype.getImage = function(type, encoderOptions)
{	if (type==="canvas") return this.canvas_;
	return this.canvas_.toDataURL(type, encoderOptions);
}

export default ol_control_Profil
