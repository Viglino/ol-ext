/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options. 
 *	- projection {ol.projectionLike} projection to use for the graticule, default EPSG:4326 
 *	- maxResolution {number} max resolution to display the graticule
 *	- style {ol.style.Style} Style to use for drawing the graticule, default black.
 *	- step {number} step beetween lines (in proj units), default 1
 *	- stepCoord {number} show a coord every stepCoord, default 1
 *	- spacing {number} spacing beetween lines (in px), default 40px 
 *	- borderWidth {number} width of the border (in px), default 5px 
 *	- margin {number} margin of the border (in px), default 0px 
 */
ol.control.GridReference = function(options) 
{	var self = this;
	if (!options) options = {};
	
	// Initialize parent
	var elt = document.createElement("div");
	elt.className = (!options.target ? "ol-control ":"") +"ol-gridreference ol-unselectable "+(options.className||"");
	
	ol.control.Control.call(this, 
		{	element: elt,
			target: options.target
		});

	if (typeof (options.getFeatureName)=='function') this.getFeatureName = options.property;
	if (typeof (options.sortFeatures)=='function') this.sortFeatures = options.sortFeatures;
	
	if (options.source) 
	{	this.setIndex(options.source.getFeatures());
		options.source.once('change',function(e)
			{	if (options.source.getState() === 'ready') 
				{   this.setIndex(options.source.getFeatures());
				}
			}, this);
	};

	// Options
	this.set('maxResolution', options.maxResolution || Infinity);
	this.set('extent', options.extent);
	this.set('size', options.size);
	this.set('margin', options.margin || 0);
	this.set('property', options.property || 'name');

	if (options.style instanceof ol.style.Style) this.style = options.style;
	else this.style = new ol.style.Style(
		{	stroke: new ol.style.Stroke({ color:"#000", width:1 }),
			fill: new ol.style.Fill({ color: "#fff" }),
			text: new ol.style.Text(
			{	font: "bold 14px Arial",
				stroke: new ol.style.Stroke({ color:"#fff", width:2 }),
				fill: new ol.style.Fill({ color:"#000" }),
			}) 
		});
};
ol.inherits(ol.control.GridReference, ol.control.Control);


ol.control.GridReference.prototype.getFeatureName = function (f)
{	return f.get(this.get('property')||'name');
};

ol.control.GridReference.prototype.sortFeatures = function (a,b)
{	return (this.getFeatureName(a) == this.getFeatureName(b)) ? 0 : (this.getFeatureName(a) < this.getFeatureName(b)) ? -1 : 1; 
};

/** Display features in the index
*	@param { Array <ol.Feature> | ol.Collection <ol.Feature> } features
*/
ol.control.GridReference.prototype.setIndex = function (features, options)
{	var self = this;
	if (!options) options={};
	if (features.getArray) features = features.getArray();
	features.sort ( function(a,b) { return self.sortFeatures(a,b); } );
	var elt = $(this.element).html("");

	var search = $("<input>").attr('type', 'search')
					.attr('placeholder', options.filterLabel || 'filter')
					.on('keyup', function()
					{	var v = $(this).val().replace(/^\*/,'');
						console.log(v)
						var r = new RegExp (v, 'i');
						$('li',ul).each(function()
						{	var self = $(this);
							if (self.hasClass('ol-title')) self.show();
							else
							{	if (r.test($('.ol-name',self).text())) self.show();
								else self.hide();
							}
						});
						$("li.ol-title", ul).each(function()
						{	var nextVisible = $(this).nextAll("li:visible").first()
							if (nextVisible.length && !nextVisible.hasClass('ol-title')) $(this).show();
							else $(this).hide();
						});
					})
					.appendTo(elt);

	var ul = $("<ul>").appendTo(elt);
	var r, c;
	for (var i=0, f; f=features[i]; i++)
	{	r = this.getReference(f.getGeometry().getFirstCoordinate());
		if (r) 
		{	var name = this.getFeatureName(f);
			if (c != name.charAt(0)) 
			{	$("<li>").addClass('ol-title').text(name.charAt(0)).appendTo(ul);
			}
			c = name.charAt(0);
			$("<li>").append($("<span>").addClass("ol-name").text(name))
					.append($("<span>").addClass("ol-ref").text(r))
					.data ('feature', f)
					.click(function()
						{	self.dispatchEvent({ type:"select", feature:$(this).data('feature') });
						})
					.appendTo(ul);
		}
	}
};

/** Get reference for a coord
*	@param {ol.coordinate} coords
*	@return {string} the reference
*/
ol.control.GridReference.prototype.getReference = function (coords)
{	var extent = this.get('extent');
	var size = this.get('size');

	var dx = Math.floor ( (coords[0] - extent[0]) / (extent[2]- extent[0]) * size[0] );
	if (dx<0 || dx>=size[0]) return "";
	var dy = Math.floor ( (extent[3] - coords[1]) / (extent[3]- extent[1]) * size[1] );
	if (dy<0 || dy>=size[1]) return "";
	return String.fromCharCode(65+dx)+dy;
};

/**
 * Remove the control from its current map and attach it to the new map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.GridReference.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (oldmap) oldmap.un('postcompose', this.drawGrid_, this);
	
	ol.control.Control.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) map.on('postcompose', this.drawGrid_, this);
};

ol.control.GridReference.prototype.setStyle = function (style)
{	this.style = style;
};

ol.control.GridReference.prototype.getStyle = function (style)
{	return style;
};

ol.control.GridReference.prototype.drawGrid_ = function (e)
{	if (this.get('maxResolution')<e.frameState.viewState.resolution) return;
	
	var ctx = e.context;
	var canvas = ctx.canvas;
	var ratio = e.frameState.pixelRatio;

	var w = canvas.width;
	var h = canvas.height;

	var extent = this.get('extent');
	var size = this.get('size');

	var map = this.getMap();
	var ex = ol.extent.boundingExtent([map.getPixelFromCoordinate([extent[0],extent[1]]), map.getPixelFromCoordinate([extent[2],extent[3]])]);
	var p0 = [ex[0],ex[1]];
	var p1 = [ex[2],ex[3]];
	var dx = (p1[0]-p0[0])/size[0];
	var dy = (p1[1]-p0[1])/size[1];

	ctx.save();
		var margin = this.get('margin');

		ctx.fillStyle = this.style.getFill().getColor();
		ctx.strokeStyle = this.style.getStroke().getColor();
		ctx.lineWidth = this.style.getStroke().getWidth();

		ctx.beginPath();
		for (var i=0; i<=size[0]; i++)
		{	ctx.moveTo(p0[0]+i*dx, p0[1]);
			ctx.lineTo(p0[0]+i*dx, p1[1]);
		}
		for (var i=0; i<=size[1]; i++)
		{	ctx.moveTo(p0[0], p0[1]+i*dy);
			ctx.lineTo(p1[0], p0[1]+i*dy);
		}
		ctx.stroke();


		ctx.font = this.style.getText().getFont();
		ctx.fillStyle = this.style.getText().getFill().getColor();
		ctx.strokeStyle = this.style.getText().getStroke().getColor();
		var lw = ctx.lineWidth = this.style.getText().getStroke().getWidth();
		var spacing = margin +lw;
		ctx.textAlign = 'center';
		var letter, x, y;
		for (var i=0; i<size[0]; i++)
		{	letter = String.fromCharCode(65+i);
			x = p0[0]+i*dx+dx/2;
			y = p0[1]-spacing;
			if (y<0) 
			{	y = spacing;
				ctx.textBaseline = 'hanging';
			}
			else ctx.textBaseline = 'alphabetic';
			ctx.strokeText(letter, x, y);
			ctx.fillText(letter, x, y);
			y = p1[1]+spacing;
			if (y>h) 
			{	y = h-spacing;
				ctx.textBaseline = 'alphabetic';
			}
			else ctx.textBaseline = 'hanging';
			ctx.strokeText(letter, x, y);
			ctx.fillText(letter, x, y);
		}
		ctx.textBaseline = 'middle';
		for (var i=0; i<size[0]; i++)
		{	y = p0[1]+i*dy+dy/2;
			ctx.textAlign = 'right';
			x = p0[0] - spacing;
			if (x<0) 
			{	x = spacing;
				ctx.textAlign = 'left';
			}
			else ctx.textAlign = 'right';
			ctx.strokeText(i, x, y);
			ctx.fillText(i, x, y);
			x = p1[0] + spacing;
			if (x>w) 
			{	x = w-spacing;
				ctx.textAlign = 'right';
			}
			else ctx.textAlign = 'left';
			ctx.strokeText(i, x, y);
			ctx.fillText(i, x, y);
		}


	ctx.restore();
};
