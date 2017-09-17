/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Handles coordinates on the center of the viewport.
 * It can be used as abstract base class used for creating subclasses. 
 * The CenterTouch interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * Only pointermove pointerup are concerned with it.
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.InteractionOptions} options Options
 *  - targetStyle {ol.style.Style|Array<ol.style.Style>} a style to draw the target point, default cross style
 *  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
ol.interaction.CenterTouch = function(options) 
{	options = options || {};
	// Filter event
	var rex = /^pointermove$|^pointerup$/;

	// Default style = cross
	this.targetStyle = options.targetStyle ||
		[	new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#fff", width:3 }) }) }),
			new ol.style.Style({ image: new ol.style.RegularShape ({ points: 4, radius: 11, radius1: 0, radius2: 0, snapToPixel:true, stroke: new ol.style.Stroke({ color: "#000", width:1 }) }) })
		];
	if (!(this.targetStyle instanceof Array)) this.targetStyle = [this.targetStyle];
	this.composite = options.composite || '';

	// Interaction to defer center on top of the interaction 
	// this is done to enable other coordinates manipulation inserted after the interaction (snapping)
	this.ctouch = new ol.interaction.Interaction( 
		{	handleEvent: function(e) 
				{	if (rex.test(e.type) && this.getMap()) 
					{	e.coordinate = this.getMap().getView().getCenter();
						e.pixel = this.getMap().getSize();
						e.pixel = [ e.pixel[0]/2, e.pixel[1]/2 ];
					}
					return true; 
				}
		});

	ol.interaction.Interaction.call(this, 
		{	handleEvent: function(e) 
			{	if (rex.test(e.type)) this.pos_ = e.coordinate;
				if (options.handleEvent) return options.handleEvent.call (this,e);
				return true; 
			}
		});
};
ol.inherits(ol.interaction.CenterTouch, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.CenterTouch.prototype.setMap = function(map) 
{	if (this.getMap())
	{	this.getMap().removeInteraction(this.ctouch);
		this.getMap().un('postcompose', this.drawTarget_, this);
	}

	ol.interaction.Interaction.prototype.setMap.call (this, map);

	if (this.getMap())
	{	if (this.getActive()) this.getMap().addInteraction(this.ctouch);
		this.getMap().on('postcompose', this.drawTarget_, this);
	}
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol.interaction.CenterTouch.prototype.setActive = function(b) 
{	ol.interaction.Interaction.prototype.setActive.call (this, b);

	this.pos_ = null;

	if (this.getMap())
	{	if (this.getActive()) 
		{	this.getMap().addInteraction(this.ctouch);
		}
		else this.getMap().removeInteraction(this.ctouch);
	}
	
};

/** Get the position of the target
*/
ol.interaction.CenterTouch.prototype.getPosition = function (e)
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
ol.interaction.CenterTouch.prototype.drawTarget_ = function (e)
{	if (!this.getMap() || !this.getActive()) return;

	var ctx = e.context;
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	
		var cx = ctx.canvas.width/(2*ratio);
		var cy = ctx.canvas.height/(2*ratio);

		var geom = new ol.geom.Point (this.getMap().getCoordinateFromPixel([cx,cy]));

		if (this.composite) ctx.globalCompositeOperation = this.composite;

		for (var i=0; i<this.targetStyle.length; i++)
		{	var style = this.targetStyle[i];

			if (style instanceof ol.style.Style)
			{	var sc=0;
				// OL < v4.3 : setImageStyle doesn't check retina
				var imgs = ol.Map.prototype.getFeaturesAtPixel ? false : style.getImage();
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
