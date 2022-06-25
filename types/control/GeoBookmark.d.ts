export default ol_control_GeoBookmark;
/** Bookmark positions on ol maps.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires add
 * @fires remove
 * @fires select
 * @param {} options Geobookmark's options
 *  @param {string} options.className default ol-bookmark
 *  @param {string | undefined} options.title Title to use for the button tooltip, default "Geobookmarks"
 *  @param {string} options.placeholder input placeholder, default Add a new geomark...
 *  @param {string} [options.deleteTitle='Suppr.'] title for delete buttons
 *  @param {bool} options.editable enable modification, default true
 *  @param {string} options.namespace a namespace to save the boolmark (if more than one on a page), default ol
 *  @param {Array<any>} options.marks a list of default bookmarks:
 * @see [Geobookmark example](../../examples/control/map.control.geobookmark.html)
 * @example
var bm = new GeoBookmark ({
  marks: {
    "Paris": {pos:ol.proj.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
    "London": {pos:ol.proj.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
  }
});
 */
declare class ol_control_GeoBookmark {
    constructor(options: any);
    button: HTMLElement | Text;
    /** Set bookmarks
     * @param {} bmark a list of bookmarks, default retreave in the localstorage
     * @example
    bm.setBookmarks({
      "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
      "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
    });
     */
    setBookmarks(bmark: any): void;
    /** Get Geo bookmarks
     * @return {any} a list of bookmarks : { BM1:{pos:ol.coordinates, zoom: integer}, BM2:{pos:ol.coordinates, zoom: integer} }
     */
    getBookmarks(): any;
    /** Remove a Geo bookmark
     * @param {string} name
     */
    removeBookmark(name: string): void;
    /** Add a new Geo bookmark (replace existing one if any)
     * @param {string} name name of the bookmark (display in the menu)
     * @param {*} options
     *  @param {ol.coordinate} position default current position
     *  @param {number} zoom default current map zoom
     *  @param {number} rotation default current map rotation
     *  @param {bool} permanent prevent from deletion, default false
     */
    addBookmark(name: string, position: ol.coordinate, zoom: number, permanent: bool): void;
}
