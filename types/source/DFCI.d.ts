import { Vector as VectorSource } from 'ol/source';
/** DFCI source: a source to display the French DFCI grid on a map
 * @see http://ccffpeynier.free.fr/Files/dfci.pdf
 * @constructor source.DFCI
 * @extends {Vector}
 * @param {any} options Vector source options
 *  @param {Array<Number>} resolutions a list of resolution to change the drawing level, default [1000,100,20]
 */
export class DFCI extends VectorSource {
    constructor(options: any, resolutions: Number[]);
    /** Cacluate grid according Extent/resolution
     */
    _calcGrid(): void;
    /** Get features
     *
     */
    _getFeatures(): void;
}
