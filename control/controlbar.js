/** A simple toggle control with a callback function
 * OpenLayers 3 Layer Switcher Control.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		group {bool} the is a group, default false
 *		toggleOne {bool} only one toggle control is active at a time, default false
 *		controls {Array<ol.control>} a list of control to add to the bar
 */
ol.control.Bar = function(options) 
{	if (!options) options={};
	var element = $("<div>").addClass('ol-unselectable ol-control ol-bar');
	if (options.className) element.addClass(options.className);
	if (options.group) element.addClass('ol-group');
	
	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	this.set('toggleOne', options.toggleOne);

	this.controls_ = [];
	if (options.controls instanceof Array) 
	{	for (var i=0; i<options.controls.length; i++)
		{	this.addControl(options.controls[i]);
		}
	}
}
ol.inherits(ol.control.Bar, ol.control.Control);

/**
*/
ol.control.Bar.prototype.setMap = function (map)
{	ol.control.Control.prototype.setMap.call(this, map);

	for (var i=0; i<this.controls_.length; i++)
	{	map.addControl(this.controls_[i]);
	}
}

/** Add a control to the bar
*	@param {ol.control}
*/
ol.control.Bar.prototype.addControl = function (c)
{	this.controls_.push(c);
	c.setTarget(this.element);
	if (this.getMap()) 
	{	this.getMap().addControl(c);
		c.on ('activate', this.onActivateControl_, this);
	}
	//$(this.element).append(c.element);
}

/** Activate a control
*	@param {ol.event} an object with a target {ol.control} and active {bool}
*/
ol.control.Bar.prototype.onActivateControl_ = function (e)
{	if (!e.active || !this.get('toggleOne')) return;
	var ctrl = e.target;
	var n;
	for (n=0; n<this.controls_.length; n++) 
	{	if (this.controls_[n]===ctrl) break;
	}
	// Not here!
	if (n==this.controls_.length) return;
	for (var i=0; i<this.controls_.length; i++) 
	{	if (i!=n && this.controls_[i].setActive) this.controls_[i].setActive(false);
	}
}
