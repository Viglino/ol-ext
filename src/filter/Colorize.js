/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'
import {asString as ol_color_asString} from 'ol/color'
import {asArray as ol_color_asArray} from 'ol/color'

/** @typedef {Object} FilterColorizeOptions
 *  @property {ol.Color} color style to fill with
 *  @property {string} operation 'enhance' or a CanvasRenderingContext2D.globalCompositeOperation
 *  @property {number} value a [0-1] value to modify the effect value
 *  @property {boolean} inner mask inner, default false
 */

/** Colorize map or layer
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @author Thomas Tilak https://github.com/thhomas
 * @author Jean-Marc Viglino https://github.com/viglino
 * @param {FilterColorizeOptions} options
 */
var ol_filter_Colorize = function(options)
{	ol_filter_Base.call(this, options);

	this.setFilter(options);
}
ol_ext_inherits(ol_filter_Colorize, ol_filter_Base);

/** Set options to the filter
 * @param {FilterColorizeOptions} [options]
 */
ol_filter_Colorize.prototype.setFilter = function(options)
{	options = options || {};
	switch (options)
	{	case "grayscale": options = { operation:'hue', red:0, green:0, blue:0, value:1 }; break;
		case "invert": options = { operation:'difference', red:255, green:255, blue:255, value:1 }; break;
		case "sepia": options = { operation:'color', red:153, green:102, blue:51, value:0.6 }; break;
		default: break;
	}
	var color = options.color ? ol_color_asArray(options.color) : [ options.red, options.green, options.blue, options.value];
	this.set('color', ol_color_asString(color))
	this.set ('value', color[3]||1);
	var v;
	switch (options.operation)
	{	case 'color':
		case 'hue':
		case 'difference':
		case 'color-dodge':
		case 'enhance':
			this.set ('operation', options.operation);
			break;
		case 'saturation':
			v = 255*(options.value || 0);
			this.set('color', ol_color_asString([0,0,v,v||1]));
			this.set ('operation', options.operation);
			break;
		case 'luminosity':
			v = 255*(options.value || 0);
			this.set('color', ol_color_asString([v,v,v,255]));
			//this.set ('operation', 'luminosity')
			this.set ('operation', 'hard-light');
			break;
		case 'contrast':
			v = 255*(options.value || 0);
			this.set('color', ol_color_asString([v,v,v,255]));
			this.set('operation', 'soft-light');
			break;
		default: 
			this.set ('operation', 'color');
			break;
	}
}

/** Set the filter value
 *  @param {ol.Color} options.color style to fill with
 */
ol_filter_Colorize.prototype.setValue = function(v)
{	this.set ('value', v);
	var c = ol_color_asArray(this.get("color"));
	c[3] = v;
	this.set("color", ol_color_asString(c));
}

/** Set the color value
 *  @param {number} options.value a [0-1] value to modify the effect value
 */
ol_filter_Colorize.prototype.setColor = function(c)
{	c = ol_color_asArray(c);
	if (c)
	{	c[3] = this.get("value");
		this.set("color", ol_color_asString(c));
	}
}

/** @private 
 */
ol_filter_Colorize.prototype.precompose = function(/* e */) {
}

/** @private 
 */
ol_filter_Colorize.prototype.postcompose = function(e) {
	// Set back color hue
	var ctx = e.context;
	var canvas = ctx.canvas;
	
	ctx.save();
		if (this.get('operation')=='enhance')
		{	var v = this.get('value');
			if (v)
			{	var w = canvas.width;
				var h = canvas.height;
				ctx.globalCompositeOperation = 'color-burn'
				ctx.globalAlpha = v;
				ctx.drawImage (canvas, 0, 0, w, h);
				ctx.drawImage (canvas, 0, 0, w, h);
				ctx.drawImage (canvas, 0, 0, w, h);
			}
		}
		else
		{	ctx.globalCompositeOperation = this.get('operation');
			ctx.fillStyle = this.get('color');
			ctx.fillRect(0,0,canvas.width,canvas.height);  
		}
	ctx.restore();
}

export default ol_filter_Colorize
