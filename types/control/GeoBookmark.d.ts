import ol_control_Control from 'ol/control/Control';
import { Coordinate } from 'ol/coordinate';
/** Bookmark positions on ol maps.
 *
 * @constructor
 * @extends {contrControl}
 * @fires add
 * @fires remove
 * @param {} options Geobookmark's options
 *  @param {string} options.className default ol-bookmark
 *  @param {string} options.placeholder input placeholder, default Add a new geomark...
 *  @param {bool} options.editable enable modification, default true
 *  @param {string} options.namespace a namespace to save the boolmark (if more than one on a page), default ol
 *  @param {Array<any>} options.marks a list of default bookmarks:
 * @see [Geobookmark example](../../examples/map.contrgeobookmark.html)
 * @example
var bm = new GeoBookmark ({
  marks: {
    "Paris": {pos:_ol_proj_.transform([2.351828, 48.856578], 'EPSG:4326', 'EPSG:3857'), zoom:11, permanent: true },
    "London": {pos:_ol_proj_.transform([-0.1275,51.507222], 'EPSG:4326', 'EPSG:3857'), zoom:12}
  }
});
 */
export class GeoBookmark extends ol_control_Control {
    constructor(options: {
        className: string;
        placeholder: string;
        editable: boolean;
        namespace: string;
        marks: any[];
    });
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
    * @return {any} a list of bookmarks : { BM1:{pos:Coordinates, zoom: number}, BM2:{pos:Coordinates, zoom: number} }
     */
    getBookmarks(): any;
    /** Remove a Geo bookmark
    * @param {string} name
     */
    removeBookmark(name: string): void;
    /** Add a new Geo bookmark (replace existing one if any)
    * @param {string} name name of the bookmark (display in the menu)
    * @param {Coordinate} position default current position
    * @param {number} zoom default current map zoom
    * @param {bool} permanent prevent from deletion, default false
     */
    addBookmark(name: string, position: Coordinate, zoom: number, permanent: boolean): void;
}
