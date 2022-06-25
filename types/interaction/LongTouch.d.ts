export default ol_interaction_LongTouch;
/** Interaction to handle longtouch events
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {olx.interaction.LongTouchOptions}
 * 	@param {function | undefined} options.handleLongTouchEvent Function handling 'longtouch' events, it will receive a mapBrowserEvent. Or listen to the map 'longtouch' event.
 *	@param {integer | undefined} [options.pixelTolerance=0] pixel tolerance before drag, default 0
 *	@param {integer | undefined} [options.delay=1000] The delay for a long touch in ms, default is 1000
 */
declare class ol_interaction_LongTouch {
    constructor(options: any);
    delay_: any;
}
