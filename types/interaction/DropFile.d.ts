export default ol_interaction_DropFile;
/** Extend DragAndDrop choose drop zone + fires loadstart, loadend
 * @constructor
 * @extends {ol_interaction_DragAndDrop}
 * @fires loadstart, loadend, addfeatures
 * @param {*} options
 *  @param {string} options.zone selector for the drop zone, default document
 *  @param{ol.projection} options.projection default projection of the map
 *  @param {Array<function(new:ol.format.Feature)>|undefined} options.formatConstructors Format constructors, default [ ol.format.GPX, ol.format.GeoJSONX, ol.format.GeoJSONP, ol.format.GeoJSON, ol.format.IGC, ol.format.KML, ol.format.TopoJSON ]
 *  @param {Array<string>|undefined} options.accept list of accepted format, default ["gpx","json","geojsonx","geojsonp","geojson","igc","kml","topojson"]
 */
declare class ol_interaction_DropFile {
    constructor(options: any);
    formatConstructors_: any;
    projection_: any;
    accept_: any;
    /** Set the map
    */
    setMap(map: any): void;
    /** Do something when over
    */
    onstop(e: any): boolean;
    /** Do something when over
    */
    ondrop(e: any): boolean;
}
