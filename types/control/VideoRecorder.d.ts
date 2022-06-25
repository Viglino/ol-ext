export default ol_control_VideoRecorder;
/** Record map canvas as video
 * @constructor
 * @fire start
 * @fire error
 * @fire stop
 * @fire pause
 * @fire resume
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {number} [options.framerate=30] framerate for the video
 *	@param {number} [options.videoBitsPerSecond=5000000] bitrate for the video
 *	@param {DOMElement|string} [options.videoTarget] video element or the container to add the video when finished or 'DIALOG' to show it in a dialog, default none
 */
declare class ol_control_VideoRecorder {
    constructor(options: any);
    _dialog: ol_control_Dialog;
    _videoTarget: any;
    _printCtrl: ol_control_Print;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /** Start recording */
    start(): void;
    /** Stop recording */
    stop(): void;
    _mediaRecorder: any;
    /** Pause recording */
    pause(): void;
    /** Resume recording after pause */
    resume(): void;
}
import ol_control_Dialog from "./Dialog";
import ol_control_Print from "./Print";
