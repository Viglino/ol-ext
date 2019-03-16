/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_style_RegularShape from 'ol/style/RegularShape'
import ol_style_Style from 'ol/style/Style'
import ol_interaction_Interaction from 'ol/interaction/Interaction'
import ol_geom_Point from 'ol/geom/Point'
import ol_Map from 'ol/Map'
import ol_style_Stroke from 'ol/style/Stroke'

/** Handles coordinates on the center of the viewport.
 * It can be used as abstract base class used for creating subclasses. 
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * Only pointermove pointerup are concerned with it.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  - targetStyle {ol_style_Style|Array<ol_style_Style>} a style to draw the target point, default cross style
 *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
var ol_interaction_CenterTouch = function(options)
{	options = options || {};

	// LIst of listerner on the object
	this._listener = {};
	// Filter event
	var rex = /^pointermove$|^pointerup$/;

	// Default style = cross
	this.targetStyle = options.targetStyle ||
		[	new ol_style_Style({ image: new ol_style_RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol_style_Stroke({ color: "#fff", width:3 }) }) }),
			new ol_style_Style({ image: new ol_style_RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol_style_Stroke({ color: "#000", width:1 }) }) })
		];
	if (!(this.targetStyle instanceof Array)) this.targetStyle = [this.targetStyle];
	this.composite = options.composite || '';

	// Interaction to defer center on top of the interaction 
	// this is done to enable other coordinates manipulation inserted after the interaction (snapping)
	this.ctouch = new ol_interaction_Interaction(
		{	handleEvent: function(e) 
				{	if (rex.test(e.type) && this.getMap()) 
					{	e.coordinate = this.getMap().getView().getCenter();
						e.pixel = this.getMap().getSize();
						e.pixel = [ e.pixel[0]/2, e.pixel[1]/2 ];
					}
					return true; 
				}
		});

	ol_interaction_Interaction.call(this,
		{	handleEvent: function(e) 
			{	if (rex.test(e.type)) this.pos_ = e.coordinate;
				if (options.handleEvent) return options.handleEvent.call (this,e);
				return true; 
			}
		});
};
ol_ext_inherits(ol_interaction_CenterTouch, ol_interaction_Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_interaction_CenterTouch.prototype.setMap = function(map)
{	if (this.getMap())
	{	this.getMap().removeInteraction(this.ctouch);
	}
	if (this._listener.drawtarget) ol_Observable_unByKey(this._listener.drawtarget);
	this._listener.drawtarget = null;

	ol_interaction_Interaction.prototype.setMap.call (this, map);

	if (this.getMap())
	{	if (this.getActive()) this.getMap().addInteraction(this.ctouch);
		this._listener.drawtarget = this.getMap().on('postcompose', this.drawTarget_.bind(this));
	}
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol_interaction_CenterTouch.prototype.setActive = function(b)
{	ol_interaction_Interaction.prototype.setActive.call (this, b);

	this.pos_ = null;

	if (this.getMap())
	{	if (this.getActive()) 
		{	this.getMap().addInteraction(this.ctouch);
		}
		else this.getMap().removeInteraction(this.ctouch);
	}
	
};

/** Get the position of the target
 * @return {ol.coordinate}
 */
ol_interaction_CenterTouch.prototype.getPosition = function ()
{	if (!this.pos_) 
	{	var px =this.getMap().getSize();
		px = [ px[0]/2, px[1]/2 ];
		this.pos_ = this.getMap().getCoordinateFromPixel(px);
	}
	return this.pos_; 
};

/** Draw the target
* @private
*/
ol_interaction_CenterTouch.prototype.drawTarget_ = function (e)
{	if (!this.getMap() || !this.getActive()) return;

	var ctx = e.context;
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	
		var cx = ctx.canvas.width/(2*ratio);
		var cy = ctx.canvas.height/(2*ratio);

		var geom = new ol_geom_Point (this.getMap().getCoordinateFromPixel([cx,cy]));

		if (this.composite) ctx.globalCompositeOperation = this.composite;

		for (var i=0; i<this.targetStyle.length; i++)
		{	var style = this.targetStyle[i];

			if (style instanceof ol_style_Style)
			{	var sc=0;
				// OL < v4.3 : setImageStyle doesn't check retina
				var imgs = ol_Map.prototype.getFeaturesAtPixel ? false : style.getImage();
				if (imgs) 
				{	sc = imgs.getScale(); 
					imgs.setScale(ratio*sc);
				}
				e.vectorContext.setStyle(style);
				e.vectorContext.drawGeometry(geom);
				if (imgs) imgs.setScale(sc);
			}
		}

	ctx.restore();
};

export default ol_interaction_CenterTouch
