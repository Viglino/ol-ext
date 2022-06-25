export default ol_control_Notification;
/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fire change:visible
 * @param {Object=} options Control options.
 *  @param {string} className class of the control
 *  @param {boolean} options.closeBox add a close button
 *  @param {boolean} options.hideOnClick close dialog when click
 */
declare class ol_control_Notification {
    constructor(options: any);
    contentElement: HTMLElement | Text;
    /**
     * Display a notification on the map
     * @param {string|node|undefined} what the notification to show, default get the last one
     * @param {number} [duration=3000] duration in ms, if -1 never hide
     */
    show(what: string | node | undefined, duration?: number): void;
    _listener: number;
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
