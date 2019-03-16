/*	Copyright (c) 2016 Jean-Marc VIGLINO,
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_control_Button from "./Button";

/** A simple push button control drawn as text
 * @constructor
 * @extends {ol_control_Button}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.title title of the control
 *	@param {String} options.html html to insert in the control
 *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
 */

var ol_control_TextButton = function(options)
{	options = options || {};
    options.className = (options.className||"") + " ol-text-button";
    ol_control_Button.call(this, options);
};
ol_ext_inherits(ol_control_TextButton, ol_control_Button);

export default ol_control_TextButton
