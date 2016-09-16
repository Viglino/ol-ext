/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc OpenLayers 3 Profil Control.
 *	Draw a profil of a feature (with a 3D geometry)
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options.
 *
 */
ol.control.Profil = function(opt_options) 
{	var options = opt_options || {};
	this.info = options.info || ol.control.Profil.prototype.info;
	var self = this;
	
	var element;
	if (options.target) 
	{	element = $("<div>").addClass(options.className || "ol-profil");
	}
	else
	{	element = $("<div>").addClass((options.className || 'ol-profil') +' ol-unselectable ol-control ol-collapsed');
		this.button = $("<button>")
					.on("click touchstart", function(e)
					{	element.toggleClass("ol-collapsed"); 
						e.preventDefault(); 
					})
					.appendTo(element);
    }

	var div = $("<div>").addClass("ol-inner").appendTo(element);
	div = $("<div>").css("position","relative").appendTo(div);

	this.canvas_ = document.createElement('canvas');
	this.canvas_.width = options.width || 300;
	this.canvas_.height = options.height || 150;
	$(this.canvas_).appendTo(div)
		.on("click mousemove", function(e){ self.onMove(e); });

	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	// Offset in px
	this.margin_ = { top:10, left:40, bottom:30, right:10 };
	if (!this.info.ytitle) this.margin_.left -= 20;
	if (!this.info.xtitle) this.margin_.bottom -= 20;
	
	// Cursor
	this.bar_ = $("<div>").addClass("ol-profilbar")
			.css({top:this.margin_.top+"px", height:(this.canvas_.height-this.margin_.top-this.margin_.bottom)+"px" })
			.appendTo(div);
	this.cursor_ = $("<div>").addClass("ol-profilcursor")
			.appendTo(div);
	this.popup_ = $("<div>").addClass("ol-profilpopup")
			.appendTo(this.cursor_);

	// Track information
	var t = $("<table cellpadding='0' cellspacing='0'>").appendTo(div).width(this.canvas_.width);
	var tr = $("<tr>").addClass("track-info").appendTo(t);
	$("<td>").html((this.info.zmin||"Zmin")+': <span class="zmin">').appendTo(tr);
	$("<td>").html((this.info.zmax||"Zmax")+': <span class="zmax">').appendTo(tr);
	$("<td>").html((this.info.distance||"Distance")+': <span class="dist">').appendTo(tr);
	$("<td>").html((this.info.time||"Time")+': <span class="time">').appendTo(tr);
	tr = $("<tr>").addClass("point-info").appendTo(t);
	$("<td>").html((this.info.altitude||"Altitude")+': <span class="z">').appendTo(tr);
	$("<td>").html((this.info.distance||"Distance")+': <span class="dist">').appendTo(tr);
	$("<td>").html((this.info.time||"Time")+': <span class="time">').appendTo(tr);

	// Array of data
	this.tab_ = [];

	// Show feature
	if (options.feature)
	{	this.setFeature (options.feature);
	}
};
ol.inherits(ol.control.Profil, ol.control.Control);

/** Custom infos list
* @api stable
*/
ol.control.Profil.prototype.info =
{	"zmin": "Zmin",
	"zmax": "Zmax",
	"ytitle": "Altitude (m)",
	"xtitle": "Distance (km)",
	"time": "Time",
	"altitude": "Altitude",
	"distance": "Distance"
};

/** Show popup info
*/
ol.control.Profil.prototype.popup = function(info)
{	this.popup_.html(info);
}

/** Mouse move over canvas
*/
ol.control.Profil.prototype.onMove = function(e)
{	if (!this.tab_.length) return;
	var pos = $(this.canvas_).offset();
	var dx = e.pageX -pos.left;
	var dy = e.pageY -pos.top;
	if (dx>this.margin_.left && dx<this.canvas_.width-this.margin_.right
		&& dy>this.margin_.top && dy<this.canvas_.height-this.margin_.bottom) 
	{	this.bar_.css("left", dx+"px").show();
		var d = (dx-this.margin_.left)/this.scale_[0];
		var p0 = this.tab_[0];
		for (var i=1, p; p=this.tab_[i]; i++)
		{	if (p[0]>=d) 
			{	if (d < (p[0]+p0[0])/2) p = p0;
				break;
			}
		}
		if (p) this.cursor_.css({ left:dx+"px", top:(this.canvas_.height-this.margin_.bottom+p[1]*this.scale_[1]+this.dy_)+"px"}).show();
		else this.cursor_.hide();
		this.bar_.parent().addClass("over");
		$(".point-info .z", this.element).text(p[1]+"m");
		$(".point-info .dist", this.element).text((p[0]/1000).toFixed(1)+"km");
		$(".point-info .time", this.element).text(p[2]);
		if (dx>this.canvas_.width/2) this.popup_.addClass('ol-left');
		else this.popup_.removeClass('ol-left');
		this.dispatchEvent({ type:'over', click:e.type=="click", coord: p[3], time: p[2], distance: p[0] });
	}
	else
	{	if (this.bar_.parent().hasClass("over"))
		{	this.bar_.hide();
			this.cursor_.hide();
			this.bar_.parent().removeClass("over");
			this.dispatchEvent({ type:'out' });
		}
	}
}


/** Show panel
*/
ol.control.Profil.prototype.show = function()
{	$(this.element).removeClass("ol-collapsed"); 
}
/** Hide panel
*/
ol.control.Profil.prototype.hide = function()
{	$(this.element).addClass("ol-collapsed"); 
}
/** Toggle panel
*/
ol.control.Profil.prototype.toggle = function()
{	$(this.element).toggleClass("ol-collapsed"); 
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
ol.control.Profil.prototype.setGeometry = function(g, options)
{	if (!options) options = {};
	if (g instanceof ol.Feature) g = g.getGeometry();
	var canvas = this.canvas_;
	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;
	ctx.clearRect(0,0, w, h);

	// No Z
	if (!/Z/.test(g.getLayout())) return;
	
	// Coords
	var c = g.getCoordinates();
	switch (g.getType())
	{	case "LineString": break;
		case "MultiLineString": c = c[0]; break;
		default: return;
	}

	// Distance beetween 2 coords
	var wgs84Sphere = new ol.Sphere(6378137);
	var proj = options.projection || this.getMap().getView().getProjection();
	function dist2d(p1,p2)
	{	return wgs84Sphere.haversineDistance(
			ol.proj.transform(p1, proj, 'EPSG:4326'),
			ol.proj.transform(p2, proj, 'EPSG:4326'));
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
	w -= this.margin_.right + this.margin_.left;
	h -= this.margin_.top + this.margin_.bottom;
	// Draw axes
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.moveTo(0,0); ctx.lineTo(0,-h);
	ctx.moveTo(0,0); ctx.lineTo(w, 0);
	ctx.stroke();
	
	//
	var zmin=Infinity, zmax=-Infinity;
	var d, z, ti, t = this.tab_ = [];
	for (var i=0, p; p=c[i]; i++)
	{	z = p[2];
		if (z<zmin) zmin=z;
		if (z>zmax) zmax=z;
		if (i==0) d = 0;
		else d += dist2d(c[i-1], p);
		ti = getTime(c[0][3],p[3]);
		t.push ([d, z, ti, p]);
	}

	// Info
	$(".track-info .zmin", this.element).text(zmin+"m");
	$(".track-info .zmax", this.element).text(zmax+"m");
	$(".track-info .dist", this.element).text((d/1000).toFixed(1)+"km");
	$(".track-info .time", this.element).text(ti);

	//
	var grad = options.graduation || 100;
	zmax = Math.ceil(zmax/grad)*grad;
	zmin = Math.floor(zmin/grad)*grad;

	//
	if (typeof(options.zmin)=='number' && zmin > options.zmin) zmin = options.zmin;
	if (typeof(options.zmax)=='number' && zmax < options.zmax) zmax = options.zmax;
	var amplitude = options.amplitude;
	if (amplitude)
	{	zmax = Math.max (zmin + amplitude, zmax);
	}

	// Scales
	var scx = w/d;
	var scy = -h/(zmax-zmin);
	var dy = this.dy_ = -zmin*scy;
	this.scale_ = [scx,scy];
	// Draw
	ctx.font = "10px arial";
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	ctx.fillStyle="#000";
	ctx.beginPath();
	for (var i=zmin; i<=zmax; i+=grad)
	{	if (options.zunit!="km") ctx.fillText(i, -4, i*scy+dy);
		else ctx.fillText((i/1000).toFixed(1), -4, i*scy+dy);
		ctx.moveTo (-2, i*scy+dy);
		if (i!=0) ctx.lineTo (d*scx, i*scy+dy);
		else ctx.lineTo (0, i*scy+dy);
	}
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.setLineDash([1,3]);
	var step = Math.round(d/1000)*100;
	if (step > 1000) step = Math.ceil(step/1000)*1000;
	for (var i=0; i<=d; i+=step)
	{	var txt = (options.zunit=="m") ? i : (i/1000);
		if (i+step>d) txt += " "+ (options.zunits || "km");
		ctx.fillText(txt, i*scx, 4);
		ctx.moveTo (i*scx, 2); ctx.lineTo (i*scx, 0);
	}
	ctx.font = "12px arial";
	ctx.fillText(this.info.xtitle, w/2, 18);
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
	for (var i=0, p; p=t[i]; i++)
	{	if (i==0) ctx.moveTo(p[0]*scx,p[1]*scy+dy);
		else ctx.lineTo(p[0]*scx,p[1]*scy+dy);
	}
	ctx.stroke();
};

/** Get profil image
*	@param {string|undefined} type image format, default image/png.
*	@param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
*	@return {string} requested data uri
*/
ol.control.Profil.prototype.getImage = function(type, encoderOptions)
{	return this.canvas_.toDataURL(type, encoderOptions);
}
