declare namespace ext {
    /** Ajax request
     * @fires success
     * @fires error
     * @param {*} options
     *  @param {string} options.auth Authorisation as btoa("username:password");
     *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
     */
    function Ajax(options: {
        auth: string;
        dataType: string;
    }): void;
    /** Vanilla JS helper to manipulate DOM without jQuery
     * @see https://github.com/nefe/You-Dont-Need-jQuery
     * @see https://plainjs.com/javascript/
     * @see http://youmightnotneedjquery.com/
     */
    var element: any;
}
