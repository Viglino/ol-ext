/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {inherits as ol_inherits} from 'ol'
import {unByKey as ol_Observable_unByKey} from 'ol/observable'
import ol_control_Control from 'ol/control/control'

/**
 * @classdesc OpenLayers 3 swipe Control.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} Control opt_options.
 *	- layers {ol.layer} layer to swipe
 *	- rightLayer {ol.layer} layer to swipe on right side
 *	- className {string} control class name
 *	- position {number} position propertie of the swipe [0,1], default 0.5
 *	- orientation {vertical|horizontal} orientation propertie, default vertical
 */
var ol_control_Swipe = function(opt_options)
{	var options = opt_options || {};
	var self = this;
	
	var button = document.createElement('button');

	var element = document.createElement('div');
    element.className = (options.className || "ol-swipe") + " ol-unselectable ol-control";
    element.appendChild(button);

	$(element).on ("mousedown touchstart", this, this.move );
    
	ol_control_Control.call(this,
	{	element: element
	});

	// An array of listener on layer postcompose
	this._listener = [];
	
	this.layers = [];
	if (options.layers) this.addLayer(options.layers, false);
	if (options.rightLayers) this.addLayer(options.rightLayers, true);

	this.on('propertychange', function() 
	{	if (this.getMap()) this.getMap().renderSync();
		if (this.get('orientation') === "horizontal")
		{	$(this.element).css("top", this.get('position')*100+"%");
			$(this.element).css("left", "");
		}
		else
		{	if (this.get('orientation') !== "vertical") this.set('orientation', "vertical");
			$(this.element).css("left", this.get('position')*100+"%");
			$(this.element).css("top", "");
		}
		$(this.element).removeClass("horizontal vertical");
		$(this.element).addClass(this.get('orientation'));
	}.bind(this));
	
	this.set('position', options.position || 0.5);
	this.set('orientation', options.orientation || 'vertical');
};
ol_inherits(ol_control_Swipe, ol_control_Control);

/**
 * Set the map instance the control associated with.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_Swipe.prototype.setMap = function(map)
{   
	for (var i=0; i<this._listener.length; i++) {
		ol_Observable_unByKey(this._listener[i]);
	}
	this._listener = [];
	if (this.getMap()) {	
		this.getMap().renderSync();
	}

	ol_control_Control.prototype.setMap.call(this, map);

	if (map)
	{	this._listener = [];
		for (var i=0; i<this.layers.length; i++)
		{	var l = this.layers[i];
			if (l.right) this._listener.push (l.layer.on('precompose', this.precomposeRight.bind(this)));
			else this._listener.push (l.layer.on('precompose', this.precomposeLeft.bind(this)));
			this._listener.push(l.layer.on('postcompose', this.postcompose.bind(this)));
		}
		map.renderSync();
	}
};

/** @private
*/
ol_control_Swipe.prototype.isLayer_ = function(layer)
{	for (var k=0; k<this.layers.length; k++)
	{	if (this.layers[k].layer === layer)  return k;
	}
	return -1;
};

/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*	@param {bool} add layer in the right part of the map, default left.
*/
ol_control_Swipe.prototype.addLayer = function(layers, right)
{	if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++) { 
		var l = layers[i];
		if (this.isLayer_(l)<0)
		{	this.layers.push({ layer:l, right:right });
			if (this.getMap())
			{	if (right) this._listener.push (l.on('precompose', this.precomposeRight.bind(this)));
				else this._listener.push (l.on('precompose', this.precomposeLeft.bind(this)));
				this._listener.push(l.on('postcompose', this.postcompose.bind(this)));
				this.getMap().renderSync();
			}
		}
	}
};

/** Remove a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
 */
ol_control_Swipe.prototype.removeLayer = function(layers)
{	if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++)
	{	var k = this.isLayer_(layers[i]);
		if (k >=0 && this.getMap())
		{	if (this.layers[k].right) layers[i].un('precompose', this.precomposeRight, this);
			else layers[i].un('precompose', this.precomposeLeft, this);
			layers[i].un('postcompose', this.postcompose, this);
			this.layers.splice(k,1);
			this.getMap().renderSync();
		}
	}
};

/** @private
*/
ol_control_Swipe.prototype.move = function(e)
{	var self = e.data;
	switch (e.type)
	{	case 'touchcancel': 
		case 'touchend': 
		case 'mouseup': 
		{	self.isMoving = false;
			$(document).off ("mouseup mousemove touchend touchcancel touchmove", self.move );
			break;
		}
		case 'mousedown': 
		case 'touchstart':
		{	self.isMoving = true;
			$(document).on ("mouseup mousemove touchend touchcancel touchmove", self, self.move );
		}
		case 'mousemove': 
		case 'touchmove':
		{	if (self.isMoving)
			{	if (self.get('orientation') === "vertical")
				{	var pageX = e.pageX 
						|| (e.originalEvent.touches && e.originalEvent.touches.length && e.originalEvent.touches[0].pageX) 
						|| (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length && e.originalEvent.changedTouches[0].pageX);
					if (!pageX) break;
					pageX -= $(self.getMap().getTargetElement()).offset().left;

					var l = self.getMap().getSize()[0];
					l = Math.min(Math.max(0, 1-(l-pageX)/l), 1);
					self.set('position', l);
				}
				else
				{	var pageY = e.pageY 
						|| (e.originalEvent.touches && e.originalEvent.touches.length && e.originalEvent.touches[0].pageY) 
						|| (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length && e.originalEvent.changedTouches[0].pageY);
					if (!pageY) break;
					pageY -= $(self.getMap().getTargetElement()).offset().top;

					var l = self.getMap().getSize()[1];
					l = Math.min(Math.max(0, 1-(l-pageY)/l), 1);
					self.set('position', l);
				}
			}
			break;
		}
		default: break;
	}
};

/** @private
*/
ol_control_Swipe.prototype.precomposeLeft = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;
	ctx.save();
	ctx.beginPath();
	if (this.get('orientation') === "vertical") ctx.rect (0,0, canvas.width*this.get('position'), canvas.height);
	else ctx.rect (0,0, canvas.width, canvas.height*this.get('position'));
	ctx.clip();
};

/** @private
*/
ol_control_Swipe.prototype.precomposeRight = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;
	ctx.save();
	ctx.beginPath();
	if (this.get('orientation') === "vertical") ctx.rect (canvas.width*this.get('position'), 0, canvas.width, canvas.height);
	else ctx.rect (0,canvas.height*this.get('position'), canvas.width, canvas.height);
	ctx.clip();
};

/** @private
*/
ol_control_Swipe.prototype.postcompose = function(e)
{	e.context.restore();
};

export default ol_control_Swipe
