import { Interaction } from 'ol/interaction';
/** Interaction to handle longtouch events
 * @constructor
 * @extends {Interaction}
 * @param {olx.interaction.LongTouchOptions}
 * 	@param {function | undefined} options.handleLongTouchEvent Function handling "longtouch" events, it will receive a mapBrowserEvent.
 *	@param {interger | undefined} options.delay The delay for a long touch in ms, default is 1000
 */
export class LongTouch extends Interaction {
    constructor(options: {
        handleLongTouchEvent: ((...params: any[]) => any) | undefined;
        delay: number | undefined;
    });
}
