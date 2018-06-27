/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_Control from 'ol/control/control'
import ol_style_Style from 'ol/style/style'
import ol_style_Stroke from 'ol/style/stroke'
import ol_style_Fill from 'ol/style/fill'
import ol_style_Text from 'ol/style/text'
import ol_extent from 'ol/extent'

/**
 * Draw a grid reference on the map and add an index.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @param {Object=} Control options. 
 *	- style {ol_style_Style} Style to use for drawing the grid (stroke and text), default black.
 *	- maxResolution {number} max resolution to display the graticule
 *	- extent {ol.extent} extent of the grid, required
 *	- size {ol.size} number of lines and cols, required 
 *	- margin {number} margin to display text (in px), default 0px 
 *	- source {ol.source.Vector} source to use for the index, default none (use setIndex to reset the index)
 *	- property {string | function} a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
 *	- sortFeatures {function|undefined} sort function to sort 2 features in the index, default sort on property option
 *	- indexTitle {function|undefined} a function that takes a feature and return the title to display in the index, default the first letter of property option
 *	- filterLabel {string} label to display in the search bar, default 'filter'
 */
var ol_control_GridReference = function(options)
{	var self = this;
	if (!options) options = {};
	
	// Initialize parent
	var elt = document.createElement("div");
	elt.className = (!options.target ? "ol-control ":"") +"ol-gridreference ol-unselectable "+(options.className||"");
	
	ol_control_Control.call(this,
		{	element: elt,
			target: options.target
		});

	if (typeof (options.property)=='function') this.getFeatureName = options.property;
	if (typeof (options.sortFeatures)=='function') this.sortFeatures = options.sortFeatures;
	if (typeof (options.indexTitle)=='function') this.indexTitle = options.indexTitle;
	
	// Set index using the source
	this.source_ = options.source;
	if (options.source) 
	{	this.setIndex(options.source.getFeatures(), options);
		// reload on ready
		options.source.once('change',function(e)
			{	if (options.source.getState() === 'ready') 
				{   this.setIndex(options.source.getFeatures(), options);
				}
			}.bind(this));
	};

	// Options
	this.set('maxResolution', options.maxResolution || Infinity);
	this.set('extent', options.extent);
	this.set('size', options.size);
	this.set('margin', options.margin || 0);
	this.set('property', options.property || 'name');
	this.set('filterLabel', options.filterLabel || 'filter');

	if (options.style instanceof ol_style_Style) this.style = options.style;
	else this.style = new ol_style_Style(
		{	stroke: new ol_style_Stroke({ color:"#000", width:1 }),
			text: new ol_style_Text(
			{	font: "bold 14px Arial",
				stroke: new ol_style_Stroke({ color:"#fff", width:2 }),
				fill: new ol_style_Fill({ color:"#000" }),
			}) 
		});
};
ol.inherits(ol_control_GridReference, ol_control_Control);

/** Returns the text to be displayed in the index
*	@param {ol.Feature} f the feature
*	@return {string} the text to be displayed in the index
*	@api
*/
ol_control_GridReference.prototype.getFeatureName = function (f)
{	return f.get(this.get('property')||'name');
};

/** Sort function
*	@param {ol.Feature} a first feature
*	@param {ol.Feature} b second feature
*	@return {Number} 0 if a==b, -1 if a<b, 1 if a>b
*	@api
*/
ol_control_GridReference.prototype.sortFeatures = function (a,b)
{	return (this.getFeatureName(a) == this.getFeatureName(b)) ? 0 : (this.getFeatureName(a) < this.getFeatureName(b)) ? -1 : 1; 
};

/** Get the feature title
*	@param {ol.Feature} f
*	@return the first letter of the eature name (getFeatureName)
*	@api
*/
ol_control_GridReference.prototype.indexTitle = function (f)
{	return this.getFeatureName(f).charAt(0); 
};

/** Display features in the index
*	@param { Array<ol.Feature> | ol.Collection<ol.Feature> } features
*/
ol_control_GridReference.prototype.setIndex = function (features)
{	if (!this.getMap()) return;
	var self = this;
	if (features.getArray) features = features.getArray();
	features.sort ( function(a,b) { return self.sortFeatures(a,b); } );
	var elt = $(this.element).html("");

	var search = $("<input>").attr('type', 'search')
					.attr('placeholder', this.get('filterLabel') || 'filter')
					.on('search keyup', function()
					{	var v = $(this).val().replace(/^\*/,'');
						// console.log(v)
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
	var r, title;
	for (var i=0, f; f=features[i]; i++)
	{	r = this.getReference(f.getGeometry().getFirstCoordinate());
		if (r) 
		{	var name = this.getFeatureName(f);
			var c = this.indexTitle(f);
			if (c != title) 
			{	$("<li>").addClass('ol-title').text(c).appendTo(ul);
			}
			title = c;
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
ol_control_GridReference.prototype.getReference = function (coords)
{	if (!this.getMap()) return;
	var extent = this.get('extent');
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
ol_control_GridReference.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (this._listener) ol.Observable.unByKey(this._listener);
	this._listener = null;
	
	ol_control_Control.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) 
	{	this._listener = map.on('postcompose', this.drawGrid_.bind(this));
		if (this.source_) this.setIndex(this.source_.getFeatures());
	}
};

/** Set style
* @param {ol_style_Style} style
*/
ol_control_GridReference.prototype.setStyle = function (style)
{	this.style = style;
};

/** Get style
* @return {ol_style_Style} style
*/
ol_control_GridReference.prototype.getStyle = function ()
{	return style;
};

/** Draw the grid 
* @param {ol.event} e postcompose event
* @private
*/
ol_control_GridReference.prototype.drawGrid_ = function (e)
{	if (this.get('maxResolution')<e.frameState.viewState.resolution) return;
	
	var ctx = e.context;
	var canvas = ctx.canvas;
	var ratio = e.frameState.pixelRatio;

	var w = canvas.width/ratio;
	var h = canvas.height/ratio;

	var extent = this.get('extent');
	var size = this.get('size');

	var map = this.getMap();
	var ex = ol_extent.boundingExtent([map.getPixelFromCoordinate([extent[0],extent[1]]), map.getPixelFromCoordinate([extent[2],extent[3]])]);
	var p0 = [ex[0],ex[1]];
	var p1 = [ex[2],ex[3]];
	var dx = (p1[0]-p0[0])/size[0];
	var dy = (p1[1]-p0[1])/size[1];

	ctx.save();
		var margin = this.get('margin');
		ctx.scale(ratio,ratio);

		ctx.strokeStyle = this.style.getStroke().getColor();
		ctx.lineWidth = this.style.getStroke().getWidth();

		// Draw grid
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

		// Draw text
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

export default ol_control_GridReference