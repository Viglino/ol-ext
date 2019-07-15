import { Button } from './Button';
/** A simple push button control drawn as text
 * @constructor
 * @extends {contrButton}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {String} options.title title of the control
 *	@param {String} options.html html to insert in the control
 *	@param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
export class TextButton extends Button {
    constructor(options?: {
        className: string;
        title: string;
        html: string;
        handleClick: (...params: any[]) => any;
    });
    /** Set the control visibility
    * @param {boolean} b
     */
    setVisible(b: boolean): void;
    /**
     * Set the button title
     * @param {string} title
     * @returns {undefined}
     */
    setTitle(title: string): undefined;
    /**
     * Set the button html
     * @param {string} html
     * @returns {undefined}
     */
    setHtml(html: string): undefined;
}
