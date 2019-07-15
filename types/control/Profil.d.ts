import ol_control_Control from 'ol/control/Control';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
/**
 * @classdesc OpenLayers 3 Profil Contr
 *	Draw a profil of a feature (with a 3D geometry)
 *
 * @constructor
 * @extends {contrControl}
 * @fires  over, out, show
 * @param {Object=} _ol_control_ opt_options.
 *
 */
export class Profil extends ol_control_Control {
    constructor(_ol_control_?: any);
    /** Custom infos list
    * @api stable
     */
    info: any;
    /** Show popup info
    * @param {string} info to display as a popup
    * @api stable
     */
    popup(info: string): void;
    /** Mouse move over canvas
     */
    onMove(): void;
    /** Show panel
    * @api stable
     */
    show(): void;
    /** Hide panel
    * @api stable
     */
    hide(): void;
    /** Toggle panel
    * @api stable
     */
    toggle(): void;
    /** Is panel visible
     */
    isShown(): void;
    /**
     * Set the geometry to draw the profil.
     * @param {Feature|geom} f the feature.
     * @param {Object=} options
     *		- projection {ProjectionLike} feature projection, default projection of the map
     *		- zunit {m|km} default m
     *		- unit {m|km} default km
     *		- zmin {Number|undefined} default 0
     *		- zmax {Number|undefined} default max Z of the feature
     *		- graduation {Number|undefined} z graduation default 100
     *		- amplitude {number|undefined} amplitude of the altitude, default zmax-zmin
     * @api stable
     */
    setGeometry(f: Feature | Geometry, options?: any): void;
    /** Get profil image
    * @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
    * @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
    * @return {string} requested data uri
    * @api stable
     */
    getImage(type: string | undefined, encoderOptions: number | undefined): string;
}
