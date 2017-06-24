/*	
	Tinker Bell effect on maps.
	
	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	@link https://github.com/Viglino
 */
 /**
 * @constructor
 * @extends {ol.interaction.Pointer}
 *	@param {ol.interaction.TinkerBell.options} flashlight options param
 *		- color {ol.Color} color of the sparkles
 */
ol.interaction.TinkerBell = function(options) 
{	options = options || {};

	ol.interaction.Pointer.call(this, 
	{	handleDownEvent: this.onMove,
		handleMoveEvent: this.onMove
	});

	this.set('color', options.color ? ol.color.asString(options.color) : "#fff");
	this.sparkle = [0,0];
	this.sparkles = [];
	this.lastSparkle = this.time = new Date();

	var self = this;
	this.out_ = function() { self.isout_=true; };
	this.isout_ = true;
};
ol.inherits(ol.interaction.TinkerBell, ol.interaction.Pointer);

/** Set the map > start postcompose
*/
ol.interaction.TinkerBell.prototype.setMap = function(map)
{	if (this.getMap())
	{	this.getMap().un('postcompose', this.postcompose_, this);
		map.getViewport().removeEventListener('mouseout', this.out_, false);
		this.getMap().render();
	}
	
	ol.interaction.Pointer.prototype.setMap.call(this, map);

	if (map)
	{	map.on('postcompose', this.postcompose_, this);
		map.on('mouseout', this.onMove, this);
		map.getViewport().addEventListener('mouseout', this.out_, false);
	}
};

ol.interaction.TinkerBell.prototype.onMove = function(e)
{	this.sparkle = e.pixel;
	this.isout_ = false;
	this.getMap().render();
};

/** Postcompose function
*/
ol.interaction.TinkerBell.prototype.postcompose_ = function(e)
{	var delta = 15;
	var ctx = e.context;
	var canvas = ctx.canvas;
	var dt = e.frameState.time - this.time;
	this.time = e.frameState.time;
	if (e.frameState.time-this.lastSparkle > 30 && !this.isout_)
	{	this.lastSparkle = e.frameState.time;
		this.sparkles.push({ p:[this.sparkle[0]+Math.random()*delta-delta/2, this.sparkle[1]+Math.random()*delta], o:1 });
	}
	ctx.save();
		ctx.scale(e.frameState.pixelRatio,e.frameState.pixelRatio);
		ctx.fillStyle = this.get("color");
		for (var i=this.sparkles.length-1, p; p=this.sparkles[i]; i--)
		{	if (p.o < 0.2) 
			{	this.sparkles.splice(0,i+1);
				break;
			}
			ctx.globalAlpha = p.o;
			ctx.beginPath();
			ctx.arc (p.p[0], p.p[1], 2.2, 0, 2 * Math.PI, false);
			ctx.fill();
			p.o *= 0.98;
			p.p[0] += (Math.random()-0.5);
			p.p[1] += dt*(1+Math.random())/30;
		};
	ctx.restore();

	// tell OL3 to continue postcompose animation
	if (this.sparkles.length) this.getMap().render(); 
};