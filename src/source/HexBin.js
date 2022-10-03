/*	Copyright (c) 2017-2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_geom_Polygon from 'ol/geom/Polygon.js'

import ol_source_BinBase from './BinBase.js'
import ol_HexGrid from '../render/HexGrid.js'

/** A source for hexagonal binning
 * @constructor
 * @extends {ol.source.Vector}
 * @param {Object} options ol_source_VectorOptions + ol.HexGridOptions
 *  @param {ol.source.Vector} options.source Source
 *  @param {number} [options.size] size of the hexagon in map units, default 80000
 *  @param {ol.coordinate} [options.origin] origin of the grid, default [0,0]
 *  @param {HexagonLayout} [options.layout] grid layout, default pointy
 *  @param {function} [options.geometryFunction] Function that takes an ol.Feature as argument and returns an ol.geom.Point as feature's center.
 *  @param {function} [options.flatAttributes] Function takes a bin and the features it contains and aggragate the features in the bin attributes when saving
 */
var ol_source_HexBin = class olsourceHexBin extends ol_source_BinBase {
  constructor(options) {
    options = options || {};
    super(options);

    /** The HexGrid
     * 	@type {ol_HexGrid}
     */
    this._hexgrid = new ol_HexGrid(options);

    // Handle existing features
    this.reset();
  }
  /** Get the hexagon geometry at the coord
   * @param {ol.Coordinate} coord
   * @returns {ol.geom.Polygon}
   * @api
   */
  getGridGeomAt(coord) {
    var h = this._hexgrid.coord2hex(coord);
    return new ol_geom_Polygon([this._hexgrid.getHexagon(h)]);
  }
  /**	Set the inner HexGrid size.
   * 	@param {number} newSize
   * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
   */
  setSize(newSize, noreset) {
    this._hexgrid.setSize(newSize);
    if (!noreset) {
      this.reset();
    }
  }
  /**	Get the inner HexGrid size.
   * 	@return {number}
   */
  getSize() {
    return this._hexgrid.getSize();
  }
  /**	Set the inner HexGrid layout.
   * 	@param {HexagonLayout} newLayout
   * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
   */
  setLayout(newLayout, noreset) {
    this._hexgrid.setLayout(newLayout);
    if (!noreset) {
      this.reset();
    }
  }
  /**	Get the inner HexGrid layout.
   * 	@return {HexagonLayout}
   */
  getLayout() {
    return this._hexgrid.getLayout();
  }
  /**	Set the inner HexGrid origin.
   * 	@param {ol.Coordinate} newLayout
   * 	@param {boolean} noreset If true, reset will not be called (It need to be called through)
   */
  setOrigin(newLayout, noreset) {
    this._hexgrid.setOrigin(newLayout);
    if (!noreset) {
      this.reset();
    }
  }
  /**	Get the inner HexGrid origin.
   * 	@return {ol.Coordinate}
   */
  getOrigin() {
    return this._hexgrid.getOrigin();
  }
  /**
   * Get hexagons without circular dependencies (vs. getFeatures)
   * @return {Array<ol.Feature>}
   */
  getHexFeatures() {
    return super.getGridFeatures();
  }
}

export default ol_source_HexBin
