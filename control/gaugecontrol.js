/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** A simple gauge control 
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 *		className {String} class of the control
 *		title {String} title of the control
 *		max {number} maximum value, default 100;
 *		val {number} the value, default 0
 */
ol.control.Gauge = function(options) 
{	options = options || {};
	var element = $("<div>").addClass((options.className||"") + ' ol-gauge ol-unselectable ol-control');
	this.title_ = $("<span>").appendTo(element);
	this.gauge_ = $("<button>").appendTo($("<div>").appendTo(element)).width(0);
	
	ol.control.Control.call(this, 
	{	element: element.get(0),
		target: options.target
	});

	this.setTitle(options.title);
	this.val(options.val);
	this.set("max", options.max||100);
};
ol.inherits(ol.control.Gauge, ol.control.Control);

/** Set the control title
* @param {string} title
*/
ol.control.Gauge.prototype.setTitle = function(title)
{	this.title_.html(title||"");
	if (!title) this.title_.hide();
	else this.title_.show();
};

/** Set/get the gauge value
* @param {number|undefined} v the value or undefined to get it
* @return {number} the value
*/
ol.control.Gauge.prototype.val = function(v)
{	if (v!==undefined) 
	{	this.val_ = v;
		this.gauge_.css("width", (v/this.get('max')*100)+"%");
	}
	return this.val_;
};