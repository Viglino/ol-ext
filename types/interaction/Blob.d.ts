export default ol_interaction_Blob;
/** Blob interaction to clip layers in a blob
 * @constructor
 * @extends {ol_interaction_Clip}
 * @param {*} options blob  options
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
 *	@param {number} [options.stiffness=20] spring stiffness coef, default 20
 *	@param {number} [options.damping=7] spring damping coef
 *	@param {number} [options.mass=1] blob mass
 *	@param {number} [options.points=10] number of points for the blob polygon
 *	@param {number} [options.tension=.5] blob polygon spline tension
 *	@param {number} [options.fuss] bob fussing factor
 *	@param {number} [options.amplitude=1] blob deformation amplitude factor
 */
declare class ol_interaction_Blob {
    constructor(options: any);
    /** Animate the blob
     * @private
     */
    private precompose_;
    frame: any;
    /** Get blob center with kinetic
     * @param {number} dt0 time laps
     * @private
     */
    private _getCenter;
    _center: any;
    _velocity: number[];
    /** Calculate the blob geom
     * @param {number} dt time laps
     * @returns {Array<ol_coordinate>}
     * @private
     */
    private _calculate;
    _waves: any[];
    _rotation: any;
}
