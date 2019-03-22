/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_style_RegularShape from 'ol/style/RegularShape'
import ol_geom_Point from 'ol/geom/Point'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_Map from 'ol/Map'
import {getVectorContext as ol_render_getVectorContext} from 'ol/render';

import ol_control_CanvasBase from './CanvasBase'

/** ol_control_Target draw a target at the center of the map.
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object} options
 *  - style {ol.style.Style|Array<ol.style.Style>} ol.style.Stroke: draw a cross on the map, ol.style.Image: draw the image on the map
 *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
var ol_control_Target = function(options)
{	options = options || {};

	this.style = options.style ||
		[	new ol_style_Style({ image: new ol_style_RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol_style_Stroke({ color: "#fff", width:3 }) }) }),
			new ol_style_Style({ image: new ol_style_RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol_style_Stroke({ color: "#000", width:1 }) }) })
		];
	if (!(this.style instanceof Array)) this.style = [this.style];
	this.composite = options.composite || '';

	var div = document.createElement('div');
	div.className = "ol-target ol-unselectable ol-control";
	ol_control_CanvasBase.call(this,
	{	element: div,
		target: options.target
	});

	this.setVisible(options.visible!==false);
};
ol_ext_inherits(ol_control_Target, ol_control_CanvasBase);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_Target.prototype.setMap = function (map)
{	if (this.getMap()) 
	{	if (this.getVisible()) this.getMap().renderSync();
	}
	if (this._listener) ol_Observable_unByKey(this._listener);
	this._listener = null;

	ol_control_CanvasBase.prototype.setMap.call(this, map);

	if (map) 
	{	this._listener = map.on('postcompose', this.drawTarget_.bind(this));
	}
};

/** Set the control visibility
* @paraam {boolean} b 
*/
ol_control_Target.prototype.setVisible = function (b)
{	this.set("visible",b);
	if (this.getMap()) this.getMap().renderSync();
};

/** Get the control visibility
* @return {boolean} b 
*/
ol_control_Target.prototype.getVisible = function ()
{	return this.get("visible");
};

/** Draw the target
* @private
*/
ol_control_Target.prototype.drawTarget_ = function (e)
{	if (!this.getMap() || !this.getVisible()) return;
	var ctx = this.getContext(e);
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	
		ctx.scale(ratio,ratio);

		var cx = ctx.canvas.width/(2*ratio);
		var cy = ctx.canvas.height/(2*ratio);
		var geom = new ol_geom_Point (this.getMap().getCoordinateFromPixel([cx,cy]));

		if (this.composite) ctx.globalCompositeOperation = this.composite;

	/**/
		for (var i=0; i<this.style.length; i++)
		{	var style = this.style[i];

			if (style instanceof ol_style_Style)
			{	var sc=0;
				// OL < v4.3 : setImageStyle don't check retina
				var imgs = ol_Map.prototype.getFeaturesAtPixel ? false : style.getImage();
				if (imgs) 
				{	sc = imgs.getScale(); 
					imgs.setScale(ratio*sc);
				}
				var vectorContext = e.vectorContext;
				if (!vectorContext) {
					var event = {
						inversePixelTransform: [ratio,0,0,ratio,0,0],
						context: ctx,
						frameState: {
							pixelRatio: ratio,
							extent: e.frameState.extent,
							coordinateToPixelTransform: e.frameState.coordinateToPixelTransform,
							viewState: e.frameState.viewState
						}
					}
					vectorContext = ol_render_getVectorContext(event);
				} 
				vectorContext.setStyle(style);
				vectorContext.drawGeometry(geom);
				if (imgs) imgs.setScale(sc);
			}
		}

	/*/
		for (var i=0; i<this.style.length; i++)
		{	var style = this.style[i];
			if (style.stroke instanceof ol.style.Stroke)
			{	ctx.lineWidth = style.stroke.getWidth();
				ctx.strokeStyle = ol.color.asString(style.stroke.getColor());
				var m = style.radius || 10;
				
				var dx = cx + ctx.lineWidth/2;
				var dy = cy + ctx.lineWidth/2;

				ctx.beginPath();
				ctx.moveTo (dx-m, dy);
				ctx.lineTo (dx+m, dy);
				ctx.moveTo (dx, dy-m);
				ctx.lineTo( dx, dy+m);
				ctx.stroke();
			}
			else if (style instanceof ol.style.Image)
			{	var img = style.getImage();
				ctx.drawImage(img, cx-img.width/2, cy-img.height/2);
			}
			else if (style instanceof ol.style.Text)
			{	ctx.font = style.getFont();
				ctx.textBaseline = "middle";
				ctx.textAlign = "center";
				var fill = style.getFill();
				if (fill)
				{	ctx.fillStyle = ol.color.asString(fill.getColor());
					ctx.fillText(style.getText(), cx, cy);
				}
				var stroke = style.getStroke();
				if (stroke) 
				{	ctx.lineWidth = stroke.getWidth();
					ctx.strokeStyle = ol.color.asString(stroke.getColor());
					ctx.strokeText(style.getText(), cx, cy);
				}
			}
		}
		/**/

	ctx.restore();
};

export default ol_control_Target