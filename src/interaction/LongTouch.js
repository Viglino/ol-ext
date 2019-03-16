/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_interaction_Interaction from 'ol/interaction/Interaction'

/** Interaction to handle longtouch events
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.LongTouchOptions} 
 * 	@param {function | undefined} options.handleLongTouchEvent Function handling "longtouch" events, it will receive a mapBrowserEvent.
 *	@param {interger | undefined} options.delay The delay for a long touch in ms, default is 1000
 */
var ol_interaction_LongTouch = function(options)
{	if (!options) options = {};

	this.delay_ = options.delay || 1000;
	var ltouch = options.handleLongTouchEvent || function(){};
	
	var _timeout = null;
	ol_interaction_Interaction.call(this,
	{	handleEvent: function(e)
		{	if (this.getActive())
			{	switch (e.type)
				{	case 'pointerdown': 
						if (_timeout) clearTimeout(_timeout);
						_timeout = setTimeout (function()
							{	e.type = "longtouch";
								ltouch(e) 
							}, this.delay_);
						break;
					/* case 'pointermove': */
					case 'pointerdrag':
					case 'pointerup':
						if (_timeout) 
						{	clearTimeout(_timeout);
							_timeout = null;
						}
						break;
					default: break;
				}
			}
			else
			{	if (_timeout) 
				{	clearTimeout(_timeout);
					_timeout = null;
				}
			}
			return true;
		}
	});

};
ol_ext_inherits(ol_interaction_LongTouch, ol_interaction_Interaction);

export default ol_interaction_LongTouch
