/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'

/** Colorize map or layer
* @constructor
* @requires ol.filter
* @extends {ol_filter_Base}
* @param {Object} options
*   @param {string} options.operation composite operation
*/
var ol_filter_Composite = function(options)
{	ol_filter_Base.call(this, options);

	this.set("operation", options.operation || "source-over");
}
ol_ext_inherits(ol_filter_Composite, ol_filter_Base);

/** Change the current operation
*	@param {string} operation composite function
*/
ol_filter_Composite.prototype.setOperation = function(operation)
{	this.set('operation', operation || "source-over");
}

ol_filter_Composite.prototype.precompose = function(e)
{	var ctx = e.context;
	ctx.save();
	ctx.globalCompositeOperation = this.get('operation');
}

ol_filter_Composite.prototype.postcompose = function(e)
{	e.context.restore();
}

export default ol_filter_Composite
