/** Control bar for OL3
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		group {bool} is a group, default false
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
 * Set the map instance the control is associated with.
 * @param {ol.Map} map The map instance.
 */
ol.control.Bar.prototype.setMap = function (map)
{	ol.control.Control.prototype.setMap.call(this, map);

	for (var i=0; i<this.controls_.length; i++)
	{	var c = this.controls_[i];
		map.addControl(c);
		if (c.option_bar) this.getMap().addControl(c.option_bar);
	}
}

/** Get controls in the panel
*	@param {Array<ol.control>}
*/
ol.control.Bar.prototype.getControls = function ()
{	return this.controls_;
}

/** Set tool bar position
*	@param {top|left|bottom|right}
*/
ol.control.Bar.prototype.setPosition = function (pos)
{	$(this.element).removeClass('ol-left ol-top ol-bottom ol-right')
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
}

/** Add a control to the bar
*	@param {ol.control} c control to add
*	@param {ol.control.Bar} bar an option bar associated with the control (drawn when active)
*/
ol.control.Bar.prototype.addControl = function (c, bar)
{	this.controls_.push(c);
	c.setTarget(this.element);
	c.on ('change:active', this.onActivateControl_, this);
	if (bar)
	{	this.controls_.push(bar);
		bar.setTarget(c.element);
		$(bar.element).addClass("ol-option-bar");
		c.option_bar = bar;
		bar.pcontrol = c;
	}
	if (this.getMap()) 
	{	this.getMap().addControl(c);
		if (c.option_bar) this.getMap().addControl(c.option_bar);
	}
	// If defaultActive control,
	if (c.get('defaultActive') == true) {
		// if top-level control bar, set control active.
		if (!this.pcontrol) {
			c.setActive(true);
		}
		// If nested control, set control active if parent control is active.
		else {
			if (this.pcontrol.getActive())
				c.setActive(true);
		}
	}
}

/** Find defaultActive control in containing control bar,
*   and activate it if present.
*/
ol.control.Bar.prototype.activateDefaultControl = function()
{	
	var n;
	for (n=0; n<this.controls_.length; n++) 
		if (this.controls_[n].get('defaultActive') == true) break;
	// defaultActive control not found in control bar. Nothing to activate.
	if (n == this.controls_.length) return;
	this.controls_[n].setActive(true);
}

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
{
	// Find control in containing control bar.
	var n;
	var ctrl = e.target;
	for (n=0; n<this.controls_.length; n++) 
		if (this.controls_[n] === ctrl) break;
	// Control not found in control bar. Should not happen. Return!
	if (n == this.controls_.length) return;

	// If control was activated,
	if (e.active) {
		// If containing control bar has toggleOne enabled,
		if (this.get('toggleOne')) {
			// deactivate any other controls contained within this same control bar.
			this.deactivateControls (this.controls_[n]);
		}
		// Check if the containing control bar has a sub-control bar containing a control with defaultActive set.
		// If so, activate it.
		if (this.controls_[n].option_bar)
			this.controls_[n].option_bar.activateDefaultControl();
	}
	// If control was deactivated,
	else {
		// Check if the containing control bar has a sub-control bar.
		// If so, deactivate all controls within it.
		if (this.controls_[n].option_bar)
			this.controls_[n].option_bar.deactivateControls();		
	}
}

