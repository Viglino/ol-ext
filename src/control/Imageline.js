import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'
import ol_has_TOUCH from 'ol/has'
import ol_ext_element from '../util/element'

/** Image line control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires 
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {ol.source.Vector} options.source a vector source that contains the images
 *	@param {function} options.getImage a function that gets a feature and return the image url, default return the img propertie
 *	@param {function} options.getTitle a function that gets a feature and return the title, default return an empty string
 *	@param {number} options.maxFeatures the maximum image element in the line, default 100
 *	@param {boolean} options.hover select image on hover, default false
 *	@param {string|boolean} options.linkColor link color or false if no link, default false
 */
var ol_control_Imageline = function(options) {

  var element = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-imageline'
      + (options.target ? '': ' ol-unselectable ol-control')
      + (ol_has_TOUCH ? ' ol-touch' : '')
  });

  // Source 
  this._source = options.source;

  // Initialize
  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  /*
  // Remove selection
  this.element.addEventListener('mouseover', function(){
    if (this._select) {
      this._select.elt.classList.remove('select');
      this._select = false;
    }
  }.bind(this));
  */

  // Scroll imageline
  this._setScrolling();
  this._scrolldiv.addEventListener("scroll", function(e) {
    if (this.getMap()) this.getMap().render();
  }.bind(this));

  // Parameters
  if (typeof(options.getImage)==='function') this._getImage =  options.getImage;
  if (typeof(options.getTitle)==='function') this._getTitle =  options.getTitle;

  this.set('maxFeatures', options.maxFeatures || 100);
  this.set('linkColor', options.linkColor || false);
  this.set('hover', options.hover || false);

  this.refresh();
};
ol_inherits(ol_control_Imageline, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_Imageline.prototype.setMap = function (map) {
	if (this._listener) ol_Observable_unByKey(this._listener);
	this._listener = null;

	ol_control_Control.prototype.setMap.call(this, map);

	if (map) {	
    this._listener = map.on('postcompose', this._drawLink.bind(this));
	}
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
ol_control_Imageline.prototype._getTitle = function(f) {
  return '';
};

/**
 * Get features
 * @return {Array<ol.Feature>}
 */
ol_control_Imageline.prototype.getFeatures = function(useExtent) {
  var map = this.getMap();
  if (!useExtent || !map) {
    return this._source.getFeatures();
  }
  else {
    var extent = map.getView().calculateExtent(map.getSize());
    return this._source.getFeaturesInExtent(extent);
  }
};

/** Set element scrolling with a acceleration effect on desktop
 * (on mobile it uses the scroll of the browser)
 * @private
 */
ol_control_Imageline.prototype._setScrolling = function() {
  var pos = false;
  var speed = 0;
  var dt = 0;

  var elt = this._scrolldiv = ol_ext_element.create('DIV', {
    parent: this.element
  });
  
  // Start scrolling
  ol_ext_element.addListener(elt, ['mousedown'], function(e) {
    pos = e.pageX;
    dt = new Date();
    elt.classList.add('ol-move');
  }.bind(this));
  
  // Register scroll
  ol_ext_element.addListener(window, ['mousemove'], function(e) {
    if (pos !== false) {
      var delta = pos - e.pageX;
      elt.scrollLeft += delta;
      speed = (speed + delta / (new Date() - dt))/2;
      pos = e.pageX;
      dt = new Date();
      // Prevent selection when moving
      if (delta) this._moving = true;
    } else {
      // Restoe selection
      this._moving = false;
    }
  }.bind(this));
  // Stop scrolling
  ol_ext_element.addListener(window, ['mouseup'], function(e) {
    elt.classList.remove('ol-move');
    dt = new Date() - dt;
    if (dt>100) {
      // User stop: no speed
      speed = 0;
    } else if (dt>0) {
      // Calculate new speed
      speed = (speed + (pos - e.pageX) / dt) / 2;
    } 
    elt.scrollLeft += speed*100;
    pos = false;
    speed = 0;
  }.bind(this));
};

/**
 * Refresh the imageline with new data
 */
ol_control_Imageline.prototype.refresh = function(useExtent) {
  this._scrolldiv.innerHTML = '';
  var features = this.getFeatures(useExtent);

  this._select = false;
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
      });
      ol_ext_element.create('SPAN', {
        html: this._getTitle(f),
        parent: img
      });
      var sel = { elt: img, feature: f };
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
      img.addEventListener('mouseover', function(e) {
        if (this.get('hover')) {
          if (this._select) this._select.elt.classList.remove('select');
          this._select = sel;
          this._select.elt.classList.add('select');
          this.getMap().render();
          e.stopPropagation();
        }
      }.bind(this));
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
      this._iline.push(sel);
    }
  }.bind(this);
  
  var nb = this.get('maxFeatures');
  for (var i=0, f; f=features[i]; i++) {
    if (nb--<0) break;
    addImage(f);
  };
};

/** Center image line on a feature
 * @param {ol.feature} feature
 * @param {boolean} scroll scroll the line to center on the image, default true
 * @api
 */
ol_control_Imageline.prototype.showImage = function(feature, scroll) {
  this._select = false;
  if (feature) {
    for (var i=0, f; f = this._iline[i]; i++) {
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
    }
  }
};

/** Draw link on the map
 * @private
 */
ol_control_Imageline.prototype._drawLink = function(e) {
  if (!this.get('linkColor')) return;
  var map = this.getMap()
  if (map && this._select) {
    var ctx = e.context;
    var ratio = e.frameState.pixelRatio;
 
    var pt = [ 
      this._select.elt.offsetLeft 
      - this._scrolldiv.scrollLeft
      + ol_ext_element.getStyle(this._select.elt, 'width')/2, 
      ol_ext_element.getStyle(this.element, 'top')
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