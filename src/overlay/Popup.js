/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_Overlay from 'ol/overlay'


/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @example
var popup = new ol_Overlay_Popup();
map.addOverlay(popup);
popup.show(coordinate, "Hello!");
popup.hide();
 *
 * @constructor
 * @extends {ol_Overlay}
 * @param {} options Extend Overlay options 
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *	@param {bool} options.closeBox popup has a close box, default false.
 *	@param {function|undefined} options.onclose: callback function when popup is closed
 *	@param {function|undefined} options.onshow callback function when popup is shown
 *	@param {ol.OverlayPositioning | string | undefined} options.positionning 
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
var ol_Overlay_Popup = function (options)
{	var self = this;
	
	this.offsetBox = options.offsetBox;
	
	// Popup div
	var d = $("<div>").addClass('ol-overlaycontainer-stopevent');
	options.element = d.get(0);
	// Anchor div
	$("<div>").addClass("anchor").appendTo(d);

	// Content
	this.content = $("<div>").addClass("content").appendTo(d).get(0);
	// Closebox
	this.closeBox = options.closeBox;
	this.onclose = options.onclose;      
	this.onshow = options.onshow;      
	$("<button>").addClass("closeBox").addClass(options.closeBox?"hasclosebox":"")
				.attr('type', 'button')
				.prependTo(d)
				.click(function()
				{	self.hide();
				});
	// Stop event
	options.stopEvent = true;
	d.on("mousedown touchstart", function(e){ e.stopPropagation(); })

	ol_Overlay.call(this, options);
	this._elt = $(this.element);

	// call setPositioning first in constructor so getClassPositioning is called only once
	this.setPositioning(options.positioning);
	this.setPopupClass(options.popupClass);
};
ol.inherits(ol_Overlay_Popup, ol_Overlay);

/**
 * Get CSS class of the popup according to its positioning.
 * @private
 */
ol_Overlay_Popup.prototype.getClassPositioning = function ()
{	var c = "";
	var pos = this.getPositioning();
	if (/bottom/.test(pos)) c += "ol-popup-bottom ";
	if (/top/.test(pos)) c += "ol-popup-top ";
	if (/left/.test(pos)) c += "ol-popup-left ";
	if (/right/.test(pos)) c += "ol-popup-right ";
	if (/^center/.test(pos)) c += "ol-popup-middle ";
	if (/center$/.test(pos)) c += "ol-popup-center ";
	return c;
};

/**
 * Set a close box to the popup.
 * @param {bool} b
 * @api stable
 */
ol_Overlay_Popup.prototype.setClosebox = function (b)
{	this.closeBox = b;
	if (b) this._elt.addClass("hasclosebox");
	else this._elt.removeClass("hasclosebox");
};

/**
 * Set the CSS class of the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_Popup.prototype.setPopupClass = function (c)
{	this._elt.removeClass()
		.addClass("ol-popup "+(c||"default")+" "+this.getClassPositioning()+(this.closeBox?" hasclosebox":""));
};

/**
 * Add a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_Popup.prototype.addPopupClass = function (c)
{	this._elt.addClass(c);
};

/**
 * Remove a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_Popup.prototype.removePopupClass = function (c)
{	this._elt.removeClass(c);
};

/**
 * Set positionning of the popup
 * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning 
 * 		or 'auto' to var the popup choose the best position
 * @api stable
 */
ol_Overlay_Popup.prototype.setPositioning = function (pos)
{	if (pos === undefined)
		return;
	if (/auto/.test(pos))
	{	this.autoPositioning = pos.split('-');
		if (this.autoPositioning.length==1) this.autoPositioning[1]="auto";
	}
	else this.autoPositioning = false;
	pos = pos.replace(/auto/g,"center");
	if (pos=="center") pos = "bottom-center";
	this.setPositioning_(pos);
};

/** @private
 * @param {ol.OverlayPositioning | string | undefined} pos  
 */
ol_Overlay_Popup.prototype.setPositioning_ = function (pos)
{	ol_Overlay.prototype.setPositioning.call(this, pos);
	this._elt.removeClass("ol-popup-top ol-popup-bottom ol-popup-left ol-popup-right ol-popup-center ol-popup-middle");
	this._elt.addClass(this.getClassPositioning());
};

/** Check if popup is visible
* @return {boolean}
*/
ol_Overlay_Popup.prototype.getVisible = function ()
{	return this._elt.hasClass("visible");
};

/**
 * Set the position and the content of the popup.
 * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
 * @param {string|undefined} html the HTML content (undefined = previous content).
 * @example
var popup = new ol_Overlay_Popup();
// Show popup
popup.show([166000, 5992000], "Hello world!");
// Move popup at coord with the same info
popup.show([167000, 5990000]);
// set new info
popup.show("New informations");
 * @api stable
 */
ol_Overlay_Popup.prototype.show = function (coordinate, html)
{	if (!html && typeof(coordinate)=='string') 
	{	html = coordinate; 
		coordinate = null;
	}
	
	var self = this;
	var map = this.getMap();
	if (!map) return;
	
	if (html && html !== this.prevHTML) 
	{	// Prevent flickering effect
		this.prevHTML = html;
		$(this.content).html("").append(html);
		// Refresh when loaded (img)
		$("*", this.content).on('load',function()
		{	map.renderSync();
		})
	}

	if (coordinate) 
	{	// Auto positionning
		if (this.autoPositioning)
		{	var p = map.getPixelFromCoordinate(coordinate);
			var s = map.getSize();
			var pos=[];
			if (this.autoPositioning[0]=='auto')
			{	pos[0] = (p[1]<s[1]/3) ? "top" : "bottom";
			}
			else pos[0] = this.autoPositioning[0];
			pos[1] = (p[0]<2*s[0]/3) ? "left" : "right";
			this.setPositioning_(pos[0]+"-"+pos[1]);
			if (this.offsetBox)
			{	this.setOffset([this.offsetBox[pos[1]=="left"?2:0], this.offsetBox[pos[0]=="top"?3:1] ]);
			}
		}
		// Show
		this.setPosition(coordinate);
		// Set visible class (wait to compute the size/position first)
		this._elt.parent().show();
                if (typeof (this.onshow) == 'function') this.onshow();
		this._tout = setTimeout (function()
		{	self._elt.addClass("visible"); 
		}, 0);
	}
};

/**
 * Hide the popup
 * @api stable
 */
ol_Overlay_Popup.prototype.hide = function ()
{	if (this.getPosition() == undefined) return;
	if (typeof (this.onclose) == 'function') this.onclose();
	this.setPosition(undefined);
	if (this._tout) clearTimeout(this._tout);
	this._elt.removeClass("visible");
};

export  default ol_Overlay_Popup
