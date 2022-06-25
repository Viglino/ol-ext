export default ol_ext_element;
declare namespace ol_ext_element {
    /**
     * Create an element
     * @param {string} tagName The element tag, use 'TEXT' to create a text node
     * @param {*} options
     *  @param {string} options.className className The element class name
     *  @param {Element} options.parent Parent to append the element as child
     *  @param {Element|string} [options.html] Content of the element (if text is not set)
     *  @param {string} [options.text] Text content (if html is not set)
     *  @param {Element|string} [options.options] when tagName = SELECT a list of options as key:value to add to the select
     *  @param {string} options.* Any other attribut to add to the element
     */
    function create(tagName: string, options: any): HTMLElement | Text;
    /** Create a toggle switch input
     * @param {*} options
     *  @param {string|Element} options.html
     *  @param {string|Element} options.after
     *  @param {boolean} options.checked
     *  @param {*} [options.on] a list of actions
     *  @param {function} [options.click]
     *  @param {function} [options.change]
     *  @param {Element} options.parent
     */
    function createSwitch(options: any): HTMLElement | Text;
    /** Create a toggle switch input
     * @param {*} options
     *  @param {string|Element} options.html
     *  @param {string|Element} options.after
     *  @param {string} [options.name] input name
     *  @param {string} [options.type=checkbox] input type: radio or checkbox
     *  @param {string} options.value input value
     *  @param {*} [options.on] a list of actions
     *  @param {function} [options.click]
     *  @param {function} [options.change]
     *  @param {Element} options.parent
     */
    function createCheck(options: any): HTMLElement | Text;
    /** Set inner html or append a child element to an element
     * @param {Element} element
     * @param {Element|string} html Content of the element
     */
    function setHTML(element: Element, html: string | Element): void;
    /** Append text into an elemnt
     * @param {Element} element
     * @param {string} text text content
     */
    function appendText(element: Element, text: string): void;
    /**
     * Add a set of event listener to an element
     * @param {Element} element
     * @param {string|Array<string>} eventType
     * @param {function} fn
     */
    function addListener(element: Element, eventType: string | string[], fn: Function, useCapture: any): void;
    /**
     * Add a set of event listener to an element
     * @param {Element} element
     * @param {string|Array<string>} eventType
     * @param {function} fn
     */
    function removeListener(element: Element, eventType: string | string[], fn: Function): void;
    /**
     * Show an element
     * @param {Element} element
     */
    function show(element: Element): void;
    /**
     * Hide an element
     * @param {Element} element
     */
    function hide(element: Element): void;
    /**
     * Test if an element is hihdden
     * @param {Element} element
     * @return {boolean}
     */
    function hidden(element: Element): boolean;
    /**
     * Toggle an element
     * @param {Element} element
     */
    function toggle(element: Element): void;
    /** Set style of an element
     * @param {DOMElement} el the element
     * @param {*} st list of style
     */
    function setStyle(el: DOMElement, st: any): void;
    /**
     * Get style propertie of an element
     * @param {DOMElement} el the element
     * @param {string} styleProp Propertie name
     * @return {*} style value
     */
    function getStyle(el: DOMElement, styleProp: string): any;
    /** Get outerHeight of an elemen
     * @param {DOMElement} elt
     * @return {number}
     */
    function outerHeight(elt: DOMElement): number;
    /** Get outerWidth of an elemen
     * @param {DOMElement} elt
     * @return {number}
     */
    function outerWidth(elt: DOMElement): number;
    /** Get element offset rect
     * @param {DOMElement} elt
     * @return {*}
     */
    function offsetRect(elt: DOMElement): any;
    /** Get element offset
     * @param {ELement} elt
     * @returns {Object} top/left offset
     */
    function getFixedOffset(elt: ELement): any;
    /** Get element offset rect
     * @param {DOMElement} elt
     * @param {boolean} fixed get fixed position
     * @return {Object}
     */
    function positionRect(elt: DOMElement, fixed: boolean): any;
    /** Make a div scrollable without scrollbar.
     * On touch devices the default behavior is preserved
     * @param {DOMElement} elt
     * @param {*} options
     *  @param {function} [options.onmove] a function that takes a boolean indicating that the div is scrolling
     *  @param {boolean} [options.vertical=false]
     *  @param {boolean} [options.animate=true] add kinetic to scroll
     *  @param {boolean} [options.mousewheel=false] enable mousewheel to scroll
     *  @param {boolean} [options.minibar=false] add a mini scrollbar to the parent element (only vertical scrolling)
     * @returns {Object} an object with a refresh function
     */
    function scrollDiv(elt: DOMElement, options: any): any;
    /** Dispatch an event to an Element
     * @param {string} eventName
     * @param {Element} element
     */
    function dispatchEvent(eventName: string, element: Element): void;
}
