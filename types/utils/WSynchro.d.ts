declare namespace WSynchro {
    /** Open a new window to synchronize
    *	@param {url|undefined} url to open, default current window url
    *	@param {specs|undefined|null} specs (as for window.open), undefined to open in a new window, null to open in a new tab, default new window
    */
    function open(href: any, specs: any): void;
    /**	Trigger function
    *	@param {synchronize}
    *	@param {function} synchronize function
    */
    function on(e: any, syncFn: any): void;
    /**	Synchronize windows
    *	@param {Object|undefined} if undefined stop synchro (when the window is synchronize)
    */
    function synchronize(params: any): void;
    /**	Synchronize windows:
    *	@param {Array} array of arguments to use with fn
    *	@param {} internal syncrho time to avoid stnchro loops
    *	@private
    */
    function synchronize_(args: any, sync: any): void;
}
