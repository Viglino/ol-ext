/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Clip layer or map 
*	@requires ol.filter
*	@extends {ol.filter.Base}
*	@param {ol.filter.clipOptions}
*		- coords {Array<ol.Coordinate>}
*		- extent {ol.Extent}
*		- units {%|px} coords units percent or pixel
*		- keepAspectRatio {boolean} keep aspect ratio
*		- color {string} backgroundcolor
*/
ol.filter.Clip = function(options)
{	options = options || {};
	ol.filter.Base.call(this, options);
	
	this.set("coords", options.coords);
	this.set("units", options.units);
	this.set("keepAspectRatio", options.keepAspectRatio);
	this.set("extent", options.extent || [0,0,1,1]);
	this.set("color", options.color);
	if (!options.extent && options.units!="%" && options.coords)
	{	var xmin = Infinity;
		var ymin = Infinity;
		var xmax = -Infinity;
		var ymax = -Infinity;
		for (var i=0, p; p=options.coords[i]; i++)
		{	if (xmin > p[0]) xmin = p[0];
			if (xmax < p[0]) xmax = p[0];
			if (ymin > p[1]) ymin = p[1];
			if (ymax < p[1]) ymax = p[1];
		}
		options.extent = [xmin,ymin,xmax,ymax];
	}
}
ol.inherits(ol.filter.Clip, ol.filter.Base);

ol.filter.Clip.prototype.clipPath_ = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;
	var coords = this.get("coords");
	if (!coords) return;
	var ex = this.get('extent');
	var scx = 1, scy = 1;
	if (this.get("units")=="%") 
	{	scx = canvas.width/(ex[2]-ex[0]);
		scy = canvas.height/(ex[3]-ex[1]);
	}
	if (this.get("keepAspectRatio")) 
	{	scx = scy = Math.min (scx, scy);
	}
	var pos = this.get('position');
	var dx=0, dy=0;
	if (/left/.test(pos)) 
	{	dx = -ex[0]*scx;
	}
	else if (/center/.test(pos)) 
	{	dx = canvas.width/2 - (ex[2]-ex[0])*scx/2;
	}
	else if (/right/.test(pos)) 
	{	dx = canvas.width - (ex[2]-ex[0])*scx;
	}
	var fx = function(x) { return x*scx + dx };
	if (/top/.test(pos)) 
	{	dy = -ex[1]*scy;
	}
	else if (/middle/.test(pos)) 
	{	dy = canvas.height/2 - (ex[3]-ex[1])*scy/2;
	}
	else if (/bottom/.test(pos)) 
	{	dy = canvas.height - (ex[3]-ex[1])*scy;
	}
	var fy = function(y) { return y*scy + dy; };
	
	ctx.moveTo ( fx(coords[0][0]), fy(coords[0][1]) );
	for (var i=1; p=coords[i]; i++) 
	{	ctx.lineTo ( fx(p[0]), fy(p[1]) );
	}
	ctx.lineTo ( fx(coords[0][0]), fy(coords[0][1]) );
};

ol.filter.Clip.prototype.precompose = function(e)
{	if (!this.get("color"))
	{	e.context.save();
		e.context.beginPath();
		this.clipPath_(e);
		e.context.clip();
	}
}

ol.filter.Clip.prototype.postcompose = function(e)
{	if (this.get("color"))
	{	var ctx = e.context;
		var canvas = e.context.canvas;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(0,canvas.height);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.lineTo(canvas.width, 0);
		ctx.lineTo(0, 0);
		this.clipPath_(e);
		ctx.fillStyle = this.get("color");
		ctx.fill("evenodd");
	};
	
	e.context.restore();
}
