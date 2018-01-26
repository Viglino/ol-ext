
import ol from 'ol'
import ol_control_Control from 'ol/control/control'

/** A simple control to disable all actions on the map.
 * The control will create an invisible div over the map.
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *		@param {String} options.class class of the control
 *		@param {String} options.html html code to insert in the control
 *		@param {bool} options.on the control is on
 *		@param {function} options.toggleFn callback when control is clicked 
 */
var ol_control_Disable = function(options)
{	var options = options||{};
	var element = $("<div>").addClass((options.calssName||"")+' ol-disable ol-unselectable ol-control');
	element.css({ top:0, left:0, right:0, bottom:0, "z-index":10000, background:"none", display:"none" });

	ol_control_Control.call(this,
	{	element: element.get(0)
	});
}
ol.inherits(ol_control_Disable, ol_control_Control);

/** Test if the control is on
 * @return {bool}
 * @api stable
 */
ol_control_Disable.prototype.isOn = function()
{	return $(this.element).hasClass("ol-disable");
}

/** Disable all action on the map
 * @param {bool} b, default false
 * @api stable
 */
ol_control_Disable.prototype.disableMap = function(b)
{	if (b) 
	{	$(this.element).addClass("ol-enable").show();
	}
	else 
	{	$(this.element).removeClass("ol-enable").hide();
	}
}

export default ol_control_Disable