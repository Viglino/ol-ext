import ol_control_Control from 'ol/control/Control';
/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {contrControl}
 * @fire change:visible
 * @param {Object=} options Control options.
 *  @param {string} className class of the control
 *  @param {boolean} hideOnClick hide the control on click, default false
 *  @param {boolean} closeBox add a closeBox to the control, default false
 */
export class Notification extends ol_control_Control {
    constructor(options?: {
        className: string;
        hideOnClick: boolean;
        closeBox: boolean;
    });
    /**
     * Display a notification on the map
     * @param {string|node|undefined} what the notification to show, default get the last one
     * @param {number} [duration=3000] duration in ms, if -1 never hide
     */
    show(what: string | Node | undefined, duration?: number): void;
    /**
     * Remove a notification on the map
     */
    hide(): void;
    /**
     * Toggle a notification on the map
     * @param {number} [duration=3000] duration in ms
     */
    toggle(duration?: number): void;
}
