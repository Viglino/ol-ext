import { Coordinate } from 'ol/coordinate';
import { ProjectionLike } from 'ol/proj';
/**
 * French INSEE grids
 * @classdesc a class to compute French INSEE grids, ie. fix area (200x200m) square grid,
 * based appon EPSG:3035
 *
 * @requires proj4
 * @constructor
 * @extends {Object}
 * @param {Object} [options]
 *  @param {number} [options.Size] Size grid Size in meter, default 200 (200x200m)
 */
export class InseeGrid extends Object {
    constructor(options?: {
        Size?: number;
    });
    /** Grid Extent (in EPSG:3035)
     */
    static Extent: any;
    /** Get the grid Extent
     * @param {proj.ProjLike} [proj='EPSG:3857']
     */
    getExtent(proj?: ProjectionLike): void;
    /** Get grid geom at coord
     * @param {Coordinate} coord
     * @param {proj.ProjLike} [proj='EPSG:3857']
     */
    getGridAtCoordinate(coord: Coordinate, proj?: ProjectionLike): void;
}
