/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_layer_Base from 'ol/layer/Base'
import ol_Object from 'ol/Object'
import ol_Map from 'ol/Map'

/* Namespace */
var ol_filter = {};
export {ol_filter};

/**
 * @classdesc 
 * Abstract base class; normally only used for creating subclasses and not instantiated in apps.    
 * Used to create filters    
 * Use {@link _ol_Map_#addFilter}, {@link _ol_Map_#removeFilter} or {@link _ol_Map_#getFilters} to handle filters on a map.
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * to handle filters on layers.
 *
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options Extend {@link _ol_control_Control_} options.
 *  @param {boolean} [options.active]
 */
var ol_filter_Base = function(options) {
  ol_Object.call(this);
  // Array of postcompose listener
  this._listener = [];
  if (options && options.active===false) this.set('active', false);
  else this.set('active', true);
};
ol_ext_inherits(ol_filter_Base, ol_Object);

/** Activate / deactivate filter
*	@param {boolean} b
*/
ol_filter_Base.prototype.setActive = function (b) {
  this.set('active', b===true);
};

/** Get filter active
*	@return {boolean}
*/
ol_filter_Base.prototype.getActive = function () {
  return this.get('active');
};

(function(){

/** Internal function
* @this {ol.filter} this the filter
* @private
*/
function precompose_(e) {
  if (this.get('active') && e.context) this.precompose(e);
}
/** Internal function
* @this {ol.filter} this the filter
* @private
*/
function postcompose_(e) {
  if (this.get('active') && e.context) this.postcompose(e);
}

/** Force filter redraw / Internal function
* @this {ol.Map|ol.layer.Layer} this: the map or layer the filter is added to
* @private
*/
function filterRedraw_() {
  if (this.renderSync) this.renderSync();
  else this.changed(); 
}

/** Add a filter to an ol object
* @this {ol.Map|ol.layer.Layer} this: the map or layer the filter is added to
* @private
*/
function addFilter_(filter) {
  if (!this.filters_) this.filters_ = [];
  this.filters_.push(filter);
  if (filter.precompose) filter._listener.push ( { listener: this.on(['precompose','prerender'], precompose_.bind(filter)), target: this });
  if (filter.postcompose) filter._listener.push ( { listener: this.on(['postcompose','postrender'], postcompose_.bind(filter)), target: this });
  filter._listener.push ( { listener: filter.on('propertychange', filterRedraw_.bind(this)), target: this });
  filterRedraw_.call (this);
}

/** Remove a filter to an ol object
* @this {ol.Map|ol.layer.Layer} this: the map or layer the filter is added to
* @private
*/
function removeFilter_(filter) {
  var i
  if (!this.filters_) this.filters_ = [];
  for (i=this.filters_.length-1; i>=0; i--) {
    if (this.filters_[i]===filter) this.filters_.splice(i,11);
  }
  for (i=filter._listener.length-1; i>=0; i--) {
    // Remove listener on this object
    if (filter._listener[i].target === this) {
      ol_Observable_unByKey(filter._listener[i].listener);
      filter._listener.splice(i,11);
    }
  }
  filterRedraw_.call (this);
}

/** Add a filter to an ol.Map
*	@param {ol.filter}
*/
ol_Map.prototype.addFilter = function (filter) {
  console.warn('[OL-EXT] addFilter deprecated on map.')
  addFilter_.call (this, filter);
};
/** Remove a filter to an ol.Map
*	@param {ol.filter}
*/
ol_Map.prototype.removeFilter = function (filter) {
  removeFilter_.call (this, filter);
};
/** Get filters associated with an ol.Map
*	@return {Array<ol.filter>}
*/
ol_Map.prototype.getFilters = function () {
  return this.filters_ || [];
};

/** Add a filter to an ol.Layer
*	@param {ol.filter}
*/
ol_layer_Base.prototype.addFilter = function (filter) {
  addFilter_.call (this, filter);
};
/** Remove a filter to an ol.Layer
*	@param {ol.filter}
*/
ol_layer_Base.prototype.removeFilter = function (filter) {
  removeFilter_.call (this, filter);
};

/** Get filters associated with an ol.Map
*	@return {Array<ol.filter>}
*/
ol_layer_Base.prototype.getFilters = function () {
  return this.filters_ || [];
};

})();

export default ol_filter_Base
