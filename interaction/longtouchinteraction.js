/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction to handle longtouch events
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires  
 * @param {olx.interaction.LongTouchOptions} 
 *	- handleLongTouchEvent {function | undefined} Function handling "longtouch" events, it will receive a mapBrowserEvent.
 *	- delay {interger | undefined} The delay for a long touch in ms, default is 1000
 */
ol.interaction.LongTouch = function(options) 
{	if (!options) options = {};

	this.delay_ = options.delay || 1000;
	var ltouch = options.handleLongTouchEvent || function(){};
	
	var _timeout = null;
	ol.interaction.Interaction.call(this, 
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
					case 'pointerup':
					case 'pointermove':
					case 'pointerdrag':
						if (_timeout) 
						{	clearTimeout(_timeout);
							_timeout = null;
						}
						break;
					default: break;;
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
ol.inherits(ol.interaction.LongTouch, ol.interaction.Interaction);
