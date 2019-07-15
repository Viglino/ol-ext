import Projection from 'ol/proj/Projection';
import { DragAndDrop } from 'ol/interaction';
import FeatureFormat from 'ol/format/Feature';
/** Extend DragAndDrop choose drop zone + fires loadstart, loadend
 * @constructor
 * @extends {interaction.DragAndDrop}
 *	@fires loadstart, loadend, addfeatures
 *	@param {dropfile.options} flashlight options param
 *		- zone {string} selector for the drop zone, default document
 *		- projection {projection} default projection of the map
 *		- formatConstructors {Array<function(new:format.Feature)>|undefined} Format constructors, default [ format.GPX, format.GeoJSON, format.IGC, format.KML, format.TopoJSON ]
 *		- accept {Array<string>|undefined} list of eccepted format, default ["gpx","json","geojson","igc","kml","topojson"]
 */
export class DropFile extends DragAndDrop {
    constructor(options: {
        zone: string;
        projection: Projection;
        formatConstructors: FeatureFormat[];
        accept: Array<string> | undefined;
    });
    /** Set the map
     */
    setMap(): void;
    /** Do somthing when over
     */
    onstop(): void;
    /** Do something when over
     */
    ondrop(): void;
}
