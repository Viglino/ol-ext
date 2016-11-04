/** Control bar for OL3
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested (subbar) and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		group {bool} is a group, default false
 *		toggleOne {bool} only one toggle control is active at a time, default false
 *		autoDeactivate {bool} used with nested (subbar) to deactivate all control when top level control deactivate, default false
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
	this.set('autoDeactivate', options.autoDeactivate);

	this.controls_ = [];
	if (options.controls instanceof Array) 
	{	for (var i=0; i<options.controls.length; i++)
		{	this.addControl(options.controls[i]);
		}
	}
};
ol.inherits(ol.control.Bar, ol.control.Control);

/**
 * Set the map instance the control is associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Bar.prototype.setMap = function (map)
{	ol.control.Control.prototype.setMap.call(this, map);

	for (var i=0; i<this.controls_.length; i++)
	{	var c = this.controls_[i];
		map.addControl(c);
		if (c.subBar_) this.getMap().addControl(c.subBar_);
	}
};

/** Get controls in the panel
*	@param {Array<ol.control>}
*/
ol.control.Bar.prototype.getControls = function ()
{	return this.controls_;
};

/** Set tool bar position
*	@param {top|left|bottom|right}
*/
ol.control.Bar.prototype.setPosition = function (pos)
{	$(this.element).removeClass('ol-left ol-top ol-bottom ol-right');
	pos=pos.split ('-');
	for (var i=0; i<pos.length; i++)
	{	
		console.log(pos[i]);
		switch (pos[i])
		{	case 'top':
			case 'left':
			case 'bottom':
			case 'right':
				$(this.element).addClass ("ol-"+pos[i]);
				break;
			default: break;
		}
	}
};

/** Add a control to the bar
*	@param {ol.control} c control to add
*	@param {ol.control.Bar} bar a subbar associated with the control (drawn when active)
*/
ol.control.Bar.prototype.addControl = function (c, bar)
{	this.controls_.push(c);
	c.setTarget(this.element);
	c.on ('change:active', this.onActivateControl_, this);
	if (bar)
	{	this.controls_.push(bar);
		bar.setTarget(c.element);
		$(bar.element).addClass("ol-option-bar");
		c.subBar_ = bar;
	}
	if (this.getMap()) 
	{	this.getMap().addControl(c);
		if (c.subBar_) this.getMap().addControl(c.subBar_);
	}
};

/** Get the subbar associated with a control
*	@param {ol.control} c control to get subbar
*/
ol.control.Bar.prototype.getControlSubBar = function (c)
{	if (c.subBar_) return c.subBar_;
	else return null;
};

/** Deativate all controls in a bar
* @param {ol.control} except a control
*/
ol.control.Bar.prototype.deactivateControls = function (except)
{	for (var i=0; i<this.controls_.length; i++) 
	{	if (this.controls_[i] !== except && this.controls_[i].setActive) 
		{	this.controls_[i].setActive(false);
		}
	}
};

/** Post-process an activated/deactivated control
*	@param {ol.event} an object with a target {ol.control} and active flag {bool}
*/
ol.control.Bar.prototype.onActivateControl_ = function (e)
{	// Deactivate control on subbar
	if (!e.active && e.target.subBar_ && e.target.subBar_.get("autoDeactivate"))
	{	e.target.subBar_.deactivateControls ();
	}
	// Auto activate control on subbar
	if (e.active && e.target.subBar_)
	{	var ctrls = e.target.subBar_.getControls();
		for (var i=0, sb; sb = ctrls[i]; i++)
		{	if (sb.get("autoActivate")) sb.setActive(true);
		}
	}

	if (!e.active || !this.get('toggleOne')) return;
	var n;
	var ctrl = e.target;
	for (n=0; n<this.controls_.length; n++) 
	{	if (this.controls_[n]===ctrl) break;
	}
	// Not here!
	if (n==this.controls_.length) return;
	this.deactivateControls (this.controls_[n]);
};
