import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element'
import ol_ext_getMapCanvas from '../util/getMapCanvas'

/** Image line control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Array<ol.source.Vector>|ol.source.Vector} options.source vector sources that contains the images
 *	@param {Array<ol.layer.Vector>} options.layers A list of layers to display images. If no source and no layers, all visible layers will be considered.
 *	@param {function} options.getImage a function that gets a feature and return the image url or false if no image to Show, default return the img propertie
 *	@param {function} options.getTitle a function that gets a feature and return the title, default return an empty string
 *	@param {boolean} options.collapsed the line is collapse, default false
 *	@param {boolean} options.collapsible the line is collapsible, default false
 *	@param {number} options.maxFeatures the maximum image element in the line, default 100
 *	@param {number} options.useExtent only show feature in the current extent
 *	@param {boolean} options.hover select image on hover, default false
 *	@param {string|boolean} options.linkColor link color or false if no link, default false
 */
var ol_control_Imageline = function(options) {

  var element = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-imageline'
      + (options.target ? '': ' ol-unselectable ol-control')
      + (options.collapsed && options.collapsible ? 'ol-collapsed' : '')
  });

  if (!options.target && options.collapsible) {
    ol_ext_element.create('BUTTON', {
      type: 'button',
      click: function() {
        this.toggle();
      }.bind(this),
      parent: element
    });
  }

  // Source 
  if (options.source) this._sources = options.source.forEach ? options.source : [options.source];
  if (options.layers) {
    this.setLayers(options.layers);
  }
  
  // Initialize
  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  // Scroll imageline
  this._setScrolling();
  this._scrolldiv.addEventListener("scroll", function() {
    if (this.getMap()) this.getMap().render();
  }.bind(this));

  // Parameters
  if (typeof(options.getImage)==='function') this._getImage =  options.getImage;
  if (typeof(options.getTitle)==='function') this._getTitle =  options.getTitle;

  this.set('maxFeatures', options.maxFeatures || 100);
  this.set('linkColor', options.linkColor || false);
  this.set('hover', options.hover || false);
  this.set('useExtent', options.useExtent || false);

  this.refresh();
};
ol_ext_inherits(ol_control_Imageline, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_Imageline.prototype.setMap = function (map) {
	if (this._listener) {
    this._listener.forEach(function(l) {
      ol_Observable_unByKey(l);
    }.bind(this));
  }
	this._listener = null;

	ol_control_Control.prototype.setMap.call(this, map);

  if (map) {	
    this._listener = [
      map.on('postcompose', this._drawLink.bind(this)),
      map.on('moveend', function() { 
        if (this.get('useExtent')) this.refresh();
      }.bind(this))
    ]
    this.refresh();
	}
};

/** Set layers to use in the control
 * @param {Array<ol.Layer} layers
 */
ol_control_Imageline.prototype.setLayers = function (layers) {
  this._sources = this._getSources(layers);
};

/** Get source from a set of layers
 * @param {Array<ol.Layer} layers
 * @returns {Array<ol.source.Vector}
 * @private
 */
ol_control_Imageline.prototype._getSources = function (layers) {
  var sources = [];
  layers.forEach(function(l) {
    if (l.getVisible()) {
      if (l.getSource() && l.getSource().getFeatures) sources.push(l.getSource());
      else if (l.getLayers) this._getSources(l.getLayers());
    }
  }.bind(this));
  return sources;
};

/** Set useExtent param and refresh the line
 * @param {boolean} b
 */
ol_control_Imageline.prototype.useExtent = function(b) {
  this.set('useExtent', b);
  this.refresh();
};

/** Is the line collapsed
 * @return {boolean}
 */
ol_control_Imageline.prototype.isCollapsed = function() {
  return this.element.classList.contains('ol-collapsed');
};

/** Collapse the line
 * @param {boolean} b
 */
ol_control_Imageline.prototype.collapse = function(b) {
  if (b) this.element.classList.add('ol-collapsed');
  else this.element.classList.remove('ol-collapsed');
  if (this.getMap()) {
    setTimeout ( function() {
      this.getMap().render();
    }.bind(this), this.isCollapsed() ? 0 : 250);
  }
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};

/** Collapse the line
 */
ol_control_Imageline.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
  if (this.getMap()) {
    setTimeout ( function() {
      this.getMap().render();
    }.bind(this), this.isCollapsed() ? 0 : 250);
  }
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};

/** Default function to get an image of a feature
 * @param {ol.Feature} f
 * @private
 */
ol_control_Imageline.prototype._getImage = function(f) {
  return f.get('img');
};

/** Default function to get an image title
 * @param {ol.Feature} f
 * @private
 */
ol_control_Imageline.prototype._getTitle = function(/* f */) {
  return '';
};

/**
 * Get features
 * @return {Array<ol.Feature>}
 */
ol_control_Imageline.prototype.getFeatures = function() {
  var map = this.getMap();
  if (!map) return [];
  var features = [];
  var sources = this._sources || this._getSources(map.getLayers());
  sources.forEach(function(s) {
    if (features.length < this.get('maxFeatures')) {
      if (!this.get('useExtent') || !map) {
        features.push(s.getFeatures());
      } else {
        var extent = map.getView().calculateExtent(map.getSize());
        features.push(s.getFeaturesInExtent(extent));
      }
    }
  }.bind(this))
  return features;
};

/** Set element scrolling with a acceleration effect on desktop
 * (on mobile it uses the scroll of the browser)
 * @private
 */
ol_control_Imageline.prototype._setScrolling = function() {
  var elt = this._scrolldiv = ol_ext_element.create('DIV', {
    parent: this.element
  });

  ol_ext_element.scrollDiv(elt, {
    // Prevent selection when moving
    onmove: function(b) {
      this._moving = b;
    }.bind(this)
  });
  elt.addEventListener('scroll', this._updateScrollBounds.bind(this));
  this._updateScrollBounds();
};

/** Set element scrolling with a acceleration effect on desktop
 * (on mobile it uses the scroll of the browser)
 * @private
 */
ol_control_Imageline.prototype._updateScrollBounds = function() {
  var elt = this._scrolldiv;
  if (elt.scrollLeft < 5) {
    this.element.classList.add('ol-scroll0')
  } else {
    this.element.classList.remove('ol-scroll0');
  }
  if (elt.scrollWidth - elt.scrollLeft - elt.offsetWidth < 5) {
    this.element.classList.add('ol-scroll1');
  } else {
    this.element.classList.remove('ol-scroll1');
  }
};

/**
 * Refresh the imageline with new data
 */
ol_control_Imageline.prototype.refresh = function() {
  this._scrolldiv.innerHTML = '';
  var allFeatures = this.getFeatures();
  var current = this._select ? this._select.feature : null;
  
  if (this._select) this._select.elt = null;
  this._iline = [];
  if (this.getMap()) this.getMap().render();

  // Add a new image
  var addImage = function(f) {
    if (this._getImage(f)) {
      var img = ol_ext_element.create('DIV', {
        className: 'ol-image',
        parent: this._scrolldiv
      });
      ol_ext_element.create('IMG', {
        src: this._getImage(f),
        parent: img
      }).addEventListener('load', function(){
        this.classList.add('ol-loaded');
      });
      ol_ext_element.create('SPAN', {
        html: this._getTitle(f),
        parent: img
      });
      // Current image
      var sel = { elt: img, feature: f };
      // On click > dispatch event
      img.addEventListener('click', function(){
        if (!this._moving) {
          this.dispatchEvent({type: 'select', feature: f });
          this._scrolldiv.scrollLeft = img.offsetLeft 
            + ol_ext_element.getStyle(img, 'width')/2
            - ol_ext_element.getStyle(this.element, 'width')/2;
            if (this._select) this._select.elt.classList.remove('select');
            this._select = sel;
            this._select.elt.classList.add('select');
          }
      }.bind(this));
      // Show link
      img.addEventListener('mouseover', function(e) {
        if (this.get('hover')) {
          if (this._select) this._select.elt.classList.remove('select');
          this._select = sel;
          this._select.elt.classList.add('select');
          this.getMap().render();
          e.stopPropagation();
        }
      }.bind(this));
      // Remove link
      img.addEventListener('mouseout', function(e) {
        if (this.get('hover')) {
          if (this._select) this._select.elt.classList.remove('select');
          this._select = false;
          this.getMap().render();
          e.stopPropagation();
        }
      }.bind(this));
      // Prevent image dragging
      img.ondragstart = function(){ return false; };
      // Add image
      this._iline.push(sel);
      if (current===f) {
        this._select = sel;
        sel.elt.classList.add('select');
      }
    }
  }.bind(this);
  
  // Add images 
  var nb = this.get('maxFeatures');
  allFeatures.forEach(function(features) {
    for (var i=0, f; f=features[i]; i++) {
      if (nb-- < 0) break;
      addImage(f);
    }
  }.bind(this));
  // Add the selected one
  if (this._select && this._select.feature && !this._select.elt) {
    addImage(this._select.feature);
  }
  this._updateScrollBounds();
};

/** Center image line on a feature
 * @param {ol.feature} feature
 * @param {boolean} scroll scroll the line to center on the image, default true
 * @api
 */
ol_control_Imageline.prototype.select = function(feature, scroll) {
  this._select = false;
  // Find the image
  this._iline.forEach(function (f) {
    if (f.feature === feature) {
      f.elt.classList.add('select');
      this._select = f;
      if (scroll!==false) {
        this._scrolldiv.scrollLeft = f.elt.offsetLeft 
          + ol_ext_element.getStyle(f.elt, 'width')/2
          - ol_ext_element.getStyle(this.element, 'width')/2;
      }
    } else {
      f.elt.classList.remove('select');
    }
  }.bind(this));
};

/** Draw link on the map
 * @private
 */
ol_control_Imageline.prototype._drawLink = function(e) {
  if (!this.get('linkColor') | this.isCollapsed()) return;
  var map = this.getMap();
  if (map && this._select && this._select.elt) {
    var ctx = e.context || ol_ext_getMapCanvas(this.getMap()).getContext('2d');
    var ratio = e.frameState.pixelRatio;
 
    var pt = [ 
      this._select.elt.offsetLeft 
      - this._scrolldiv.scrollLeft
      + ol_ext_element.getStyle(this._select.elt, 'width')/2, 
      parseFloat(ol_ext_element.getStyle(this.element, 'top')) || this.getMap().getSize()[1]
    ];
    var geom = this._select.feature.getGeometry().getFirstCoordinate();
    geom = this.getMap().getPixelFromCoordinate(geom);

    ctx.save();
    ctx.fillStyle = this.get('linkColor');
    ctx.beginPath();
      if (geom[0]>pt[0]) {
        ctx.moveTo((pt[0]-5)*ratio, pt[1]*ratio);
        ctx.lineTo((pt[0]+5)*ratio, (pt[1]+5)*ratio);
      } else {
        ctx.moveTo((pt[0]-5)*ratio, (pt[1]+5)*ratio);
        ctx.lineTo((pt[0]+5)*ratio, pt[1]*ratio);
      }
      ctx.lineTo(geom[0]*ratio, geom[1]*ratio);
    ctx.fill();
    ctx.restore();
  }
};


export default ol_control_Imageline