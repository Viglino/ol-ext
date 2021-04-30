/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_source_Source from 'ol/source/Source'
import ol_source_Tile from 'ol/source/Tile'
import ol_source_TileWMS from 'ol/source/TileWMS'
import ol_layer_Base from 'ol/layer/Layer'
import {containsCoordinate as ol_extent_containsCoordinate} from 'ol/extent'
import {transform as ol_proj_transform} from 'ol/proj'
import ol_layer_Group from 'ol/layer/Group'

/**
 * Return a preview image of the source.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {String} the preview url
 * @api
 */
ol_source_Source.prototype.getPreview = function(/*lonlat, resolution*/) {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAk6QAAJOkBUCTn+AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANeSURBVHic7ZpPiE1RHMc/780MBhkik79JSUlIUbOxI+wkI2yRhYSUlJLNpJF/xcpiJBmZGBZsNM1CkmhKITGkGbH0/BuPmXnP4rxbb/TOn3fvOffeec6nfqvb/b7f93fveeec37ng8Xg8Ho/nf6Uu4d+fDswFssCvhHOJhaXAMeApMAQUyyIPPAdOAiuTStAVy4EHjDWsix5gdRLJ2mY34ulWYz6IEeA4kIk9awtkgTOEM/5vdAKT4k0/Ou3YMR/ELcbRm9AKFLBbgCJwNE4TYZkJfMG++SIwDCyLz0o4bI17WdyJz0r1TAZ+oDcxCBwAFgIzEIuhvcBbg3sLwOK4DFXLFvQGniCGSSUagS4DjUPOHESkA3XiOWCORqMR6Nfo9DjI3QqPUSd+ylBnv0Zn0GrWFvmIOvGNhjqrNDp/EAutyFgRKUM2tgO+Gur81FxvAKYZaimxXYBvmuuLDHWWaK4X0RfJCNsF6NdcbzXU2a65PohYFKWOc+jn8PUajbWIXaBKp9NB7lZYh34OzwFbFfd/NtDYYSth27urLGIm0M31AL3APWAAmIooymaDnPIl/Vz4NN1yHrd7gcvxWQnHAuA3bsyPop8hUsE13BSgK04TUViBeFo2zedJ8S6wElexW4D2eNOPTjNi6WvD/DtEr8E6tk6GGoAmxFY2iFHE9NZiQf8gogiB9gTEH23izAZuE77vHyU+ANucO1QwD3hD/MbLowAcdm20EmkwXx4n3NodS9rMB2HabYpEWs0HcRqHp0fNwAvJD+eBTZr7p6BvmQVxUaEzEbiruNfJekH15L8jtrEm7JJolEcOmKXRqQOuKDQuY7HZY8s8iNfzkSLxIuI43FTrkkLnOlBfRW4VsWk+oAX5weknxFAxJQNckGgVgZuIRVoomoGXEmGTMa+iQ6K7M4SW7k24QYgiuDQPYinbhugiF4H3RGtzZYCzyIvQXfpNI1ybLyeLpf5+iTbkRbiP2EcocTHm4+YI8iI8RFHwWjAfsA95Q+YZFU6wasl8wB7kReijtNbIILa0vcg/PRlGfPQwHmlCviDqAzaA+OREtzqr1ejOIDorxlNEjTGUBV4nnUWCvAJxGDlA8q9j3DEArAn2zvXAfOwfl6eVAmJrPpJ0Ih6Px+PxeJLjLwPul3vj5d0eAAAAAElFTkSuQmCC";
};

/**
 * Return the tile image of the source.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {String} the preview url
 * @api
 */
ol_source_Tile.prototype.getPreview = function(lonlat, resolution) {
  if (!lonlat) lonlat = [21020, 6355964];
  if (!resolution) resolution = 150;
  
  var coord = this.getTileGrid().getTileCoordForCoordAndResolution(lonlat, resolution);
  var fn = this.getTileUrlFunction();
  return fn.call(this, coord, this.getProjection());
};


/**
 * Return the tile image of the source.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {String} the preview url
 * @api
 */
ol_source_TileWMS.prototype.getPreview = function(lonlat, resolution) {
  if (!lonlat) lonlat = [21020, 6355964];
  if (!resolution) resolution = 150;

  var fn = this.getTileUrlFunction();
  if (fn) {
    var tileGrid = this.getTileGrid() || this.getTileGridForProjection(this.getProjection());
    var coord = tileGrid.getTileCoordForCoordAndResolution(lonlat, resolution);
    return fn.call(this, coord, 1, this.getProjection());
  }

  // Use getfeature info instead
  var url = this.getGetFeatureInfoUrl ? 
    this.getGetFeatureInfoUrl(lonlat, resolution, this.getProjection() || 'EPSG:3857', {})
    : this.getFeatureInfoUrl(lonlat, resolution, this.getProjection() || 'EPSG:3857', {});
  url = url.replace(/getfeatureinfo/i,"GetMap");
  return url;
};


/**
 * Return a preview for the layer.
 * @param {ol.Coordinate|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {Array<String>} list of preview url
 * @api
 */
ol_layer_Base.prototype.getPreview = function(lonlat, resolution, projection) {
  if (this.get("preview")) return [ this.get("preview") ];
  if (!resolution) resolution = 150;
  // Get middle resolution
  if (resolution < this.getMinResolution() || resolution > this.getMaxResolution()) {
    var rmin = this.getMinResolution(),
      rmax = this.getMaxResolution();
    if (rmax>100000) rmax = 156543;	// min zoom : world
    if (rmin<0.15) rmin = 0.15;	// max zoom 
    resolution = rmax;
    while (rmax>rmin) {
      rmin *= 2;
      rmax /= 2;
      resolution = rmin;
    }
  }
  var e = this.getExtent();
  if (!lonlat) lonlat = [21020, 6355964];	// Default lonlat
  if (e && !ol_extent_containsCoordinate(e,lonlat)) lonlat = [ (e[0]+e[2])/2, (e[1]+e[3])/2 ];

  if (projection) lonlat = ol_proj_transform (lonlat, projection, this.getSource().getProjection());

  if (this.getSource && this.getSource()) {
    return [ this.getSource().getPreview(lonlat, resolution) ];
  }
  return [];
};

/**
 * Return a preview for the layer.
 * @param {_ol_coordinate_|undefined} lonlat The center of the preview.
 * @param {number} resolution of the preview.
 * @return {Array<String>} list of preview url
 * @api
 */
ol_layer_Group.prototype.getPreview = function(lonlat, resolution) {
  if (this.get("preview")) return [ this.get("preview") ];
  var t = [];
  if (this.getLayers) {
    var l = this.getLayers().getArray();
    for (var i=0; i<l.length; i++) {
      t = t.concat(l[i].getPreview(lonlat, resolution));
    }
  }
  return t;
};
