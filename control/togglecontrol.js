/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple toggle control 
 * The control can be created with an interaction to control its activation.
 *
 * @constructor
 * @extends {ol.control.Button}
 * @fires change:active
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		title {String} title of the control
 *		html {String} html to insert in the control
 *		interaction {ol.interaction} interaction associated with the control 
 *		active {bool} the control is created active, default false
 *		bar {ol.control.Bar} a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
 *		autoActive {bool} the control will activate when shown in an ol.control.Bar, default false
 *		onToggle {function} callback when control is clicked (or use change:active event)
 */
ol.control.Toggle = function(options) 
{	options = options || {};
	var self = this;

	this.interaction_ = options.interaction;
	if (this.interaction_)
	{	this.interaction_.on("change:active", function(e)
		{	self.setActive(!e.oldValue);
		});
	}

	if (options.toggleFn) options.onToggle = options.toggleFn; // compat old version
	options.handleClick = function()
				{	self.toggle();
					if (options.onToggle) options.onToggle.call(self, self.getActive());
				};
	options.className = (options.className||"") + " ol-toggle";
	ol.control.Button.call(this, options);

	this.set("title", options.title);

	this.set ("autoActivate", options.autoActivate);
	if (options.bar) 
	{	this.subbar_ = options.bar;
		this.subbar_.setTarget(this.element);
		$(this.subbar_.element).addClass("ol-option-bar");
	}

	this.setActive (options.active);
};
ol.inherits(ol.control.Toggle, ol.control.Button);

/**
*/
ol.control.Toggle.prototype.setMap = function(map)
{	
	ol.control.Control.prototype.setMap.call(this, map);

	if (this.interaction_) map.addInteraction (this.interaction_);
	if (this.subbar_) map.addControl (this.subbar_);
};

/** Get the subbar associated with a control
* @return {ol.control.Bar}
*/
ol.control.Toggle.prototype.getSubBar = function ()
{	return this.subbar_;
};

/**
 * Test if the control is active.
 * @return {bool}.
 * @api stable
 */
ol.control.Toggle.prototype.getActive = function()
{	return $(this.element).hasClass("ol-active");
};

/** Toggle control state active/deactive
*/
ol.control.Toggle.prototype.toggle = function()
{	if (this.getActive()) this.setActive(false);
	else this.setActive(true);
};

/** Change control state
* @param {bool} b activate or deactivate the control, default false
*/
ol.control.Toggle.prototype.setActive = function(b)
{	if (this.getActive()==b) return;
	if (b) $(this.element).addClass("ol-active");
	else $(this.element).removeClass("ol-active");
	if (this.interaction_) this.interaction_.setActive (b);
	if (this.subbar_) this.subbar_.setActive(b);

	this.dispatchEvent({ type:'change:active', key:'active', oldValue:!b, active:b });
};

/** Set the control interaction
* @param {ol.interaction} i interaction to associate with the control
*/
ol.control.Toggle.prototype.setInteraction = function(i)
{	this.interaction_ = i;
};

/** Get the control interaction
* @return {ol.interaction} interaction associated with the control
*/
ol.control.Toggle.prototype.getInteraction = function()
{	return this.interaction_;
};