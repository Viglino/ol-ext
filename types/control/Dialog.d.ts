export default ol_control_Dialog;
/**
 * @classdesc
 * Application dialog
 * @extends {ol_control_Control}
 * @constructor
 * @param {*} options
 *  @param {string} options.className
 *  @param {ol.Map} options.map the map to place the dialog inside
 *  @param {Element} options.target target to place the dialog
 *  @param {boolean} options.fullscreen view dialog fullscreen (same as options.target = document.body)
 *  @param {boolean} options.zoom add a zoom effect
 *  @param {boolean} options.closeBox add a close button
 *  @param {number} options.max if not null add a progress bar to the dialog, default null
 *  @param {boolean} options.hideOnClick close dialog when click
 *  @param {boolean} options.hideOnBack close dialog when click the background
 *  @param {boolean} options.closeOnSubmit Prevent closing the dialog on submit
 */
declare class ol_control_Dialog {
    constructor(options: any);
    _progress: HTMLElement | Text;
    _progressbar: HTMLElement | Text;
    _progressMessage: HTMLElement | Text;
    /** Show a new dialog
     * @param { * | Element | string } options options or a content to show
     *  @param {Element | String} options.content dialog content
     *  @param {string} options.title title of the dialog
     *  @param {string} options.className dialog class name
     *  @param {number} options.autoclose a delay in ms before auto close
     *  @param {boolean} options.hideOnBack close dialog when click the background
     *  @param {number} options.max if not null add a progress bar to the dialog
     *  @param {number} options.progress set the progress bar value
     *  @param {Object} options.buttons a key/value list of button to show
     *  @param {function} [options.onButton] a function that takes the button id and a list of input by className
     */
    show(options: any | Element | string): void;
    /** Open the dialog
     */
    open(): void;
    /** Set the dialog content
     * @param {Element | String} content dialog content
     */
    setContentMessage(content: Element | string): void;
    /** Set the dialog title
     * @param {Element | String} content dialog content
     */
    setTitle(title: any): void;
    /** Set the dialog content
     * @param {*} options
     *  @param {Element | String} options.content dialog content
     *  @param {string} options.title title of the dialog
     *  @param {string} options.className dialog class name
     *  @param {number} options.max if not null add a progress bar to the dialog
     *  @param {number} options.progress set the progress bar value
     *  @param {Object} options.buttons a key/value list of button to show
     *  @param {function} [options.onButton] a function that takes the button id and a list of input by className
     */
    setContent(options: any): void;
    /** Get dialog content element
     * @returns {Element}
     */
    getContentElement(): Element;
    /** Set progress
     * @param {number|boolean} val the progress value or false to hide the progressBar
     * @param {number} max
     * @param {string|element} message
     */
    setProgress(val: number | boolean, max: number, message: string | element): void;
    /** Returns a function to do something on button click
     * @param {strnig} button button id
     * @param {function} callback
     * @returns {function}
     * @private
     */
    private _onButton;
    /** Get inputs, textarea an select of the dialog by classname
     * @return {Object} a {key:value} list of Elements by classname
     */
    getInputs(): any;
    /** Close the dialog
     */
    hide(): void;
    /** The dialog is shown
     * @return {bool} true if a dialog is open
     */
    isOpen(): bool;
    /** Close the dialog
     * @method Dialog.close
     * @return {bool} true if a dialog is closed
     */
    close: () => void;
}
