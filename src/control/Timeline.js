import {inherits as ol_inherits} from 'ol'
import { ol_Feature } from 'ol/Feature';
import ol_control_Control from 'ol/control/Control'
import ol_has_TOUCH from 'ol/has'
import ol_ext_element from '../util/element'

/** Timeline control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires 
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 */
var ol_control_Timeline = function(options) {

  var element = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-timeline'
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

  // Remove selection
  this.element.addEventListener('mouseover', function(){
    if (this._select) this._select.elt.classList.remove('select');
  }.bind(this));

  // Scroll timeline
  this._setScrolling();

  // Parameters
  this.set('maxWidth', options.maxWidth || 2000);
  this.set('minDate', options.minDate || Infinity);
  this.set('maxDate', options.maxDate || -Infinity);
  if (options.getHTML) this._getHTML =  options.getHTML;
  if (options.getFeatureDate) this._getFeatureDate =  options.getFeatureDate;
  if (options.endFeatureDate) this._endFeatureDate =  options.endFeatureDate;

  this.refresh();
};
ol_inherits(ol_control_Timeline, ol_control_Control);

/** Set element scrolling with a acceleration effect on desktop
 * (on mobile it uses the scroll of the browser)
 */
ol_control_Timeline.prototype._setScrolling = function() {
  var pos = false;
  var speed = 0;
  var dt = 0;
  
  // Start scrolling
  ol_ext_element.addListener(this.element, ['mousedown'], function(e) {
    pos = e.pageX;
    dt = new Date();
    this.element.classList.add('ol-move');
  }.bind(this));
  
  // Register scroll
  ol_ext_element.addListener(window, ['mousemove'], function(e) {
    if (pos !== false) {
      var delta = pos - e.pageX;
      this.element.scrollLeft += delta;
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
    this.element.classList.remove('ol-move');
    dt = new Date() - dt;
    if (dt>100) {
      // User stop: no speed
      speed = 0;
    } else if (dt>0) {
      // Calculate new speed
      speed = (speed + (pos - e.pageX) / dt) / 2;
    } 
    this.element.scrollLeft += speed*100;
    pos = false;
    speed = 0;
  }.bind(this));
};

/** Get html to show in the line
 * @param {ol.Feature} feature
 * @return {DOMElement|string}
 */
ol_control_Timeline.prototype._getHTML = function(feature) {
  return feature.get('name') || '';
};

/** Get the date of a feature
 * @param {ol.Feature} feature
 * @return {Data|string}
 */
ol_control_Timeline.prototype._getFeatureDate = function(feature) {
  return f.get('date');
};

/** Get the end date of a feature, default return undefined
 * @param {ol.Feature} feature
 * @return {Data|string}
 */
ol_control_Timeline.prototype._endFeatureDate = function(feature) {
  return undefined;
};


/**
 * Get features
 * @return {Array<ol.Feature>}
 */
ol_control_Timeline.prototype.getFeatures = function() {
  return this._source.getFeatures();
}

/**
 * Refresh the timeline with new data
 * @param {Number} zoom Zoom factor from 0.5 to 3, default 1
 */
ol_control_Timeline.prototype.refresh = function(zoom) {
  zoom = Math.min(3, Math.max(.5, zoom || 1));
  this.element.innerHTML = '';
  var features = this.getFeatures();
  var d, d2;

  // Get features sorted by date
  var tline = this._tline = [];
  features.forEach(function(f) {
    if (d = this._getFeatureDate(f)) {
      if (!(d instanceof Date)) {
        d = new Date(d)
      }
      if (this._endFeatureDate) {
        d2 = this._endFeatureDate(f);
        if (!(d2 instanceof Date)) {
          d2 = new Date(d2)
        }
      }
      if (!isNaN(d)) {
        tline.push({
          date: d,
          end: isNaN(d2) ? null : d2,
          feature: f
        });
      }
    }
  }.bind(this));
  if (!tline.length) return;

  tline.sort(function(a,b) { 
    return (a.date < b.date ? -1 : (a.date===b.date ? 0: 1))
  });

  // Draw
  var div = ol_ext_element.create('DIV', {
    parent: this.element
  });

  // Calculate width
  var min = this._minDate = Math.min(this.get('minDate'), tline[0].date);
  var max = this._maxDate = Math.max(this.get('maxDate'), tline[tline.length-1].date);
  var delta = (max-min);
  var maxWidth = this.get('maxWidth');
  var scale = this._scale = (delta > maxWidth ? maxWidth/delta : 1) * zoom;
  // Leave 10px on right
  min = this._minDate = this._minDate - 10/scale;
  delta = (max-min) * scale;
  ol_ext_element.setStyle(div, {
    width: delta,
    maxWidth: 'unset'
  });

  // Draw time's bar
  this._drawTime(div, min, max, scale);

  // Draw features
  var line = [];
  var lineHeight = ol_ext_element.getStyle(this.element, 'lineHeight');
  
  // Wrapper
  var fdiv = ol_ext_element.create('DIV', {
      className: 'ol-features',
      parent: div
  });

  // Add features on the line
  tline.forEach(function(f) {
    var d = f.date;
    var t = f.elt = ol_ext_element.create('DIV', {
      className: 'ol-feature',
      style: {
        left: Math.round((d-min)*scale),
      },
      html: this._getHTML(f.feature),
      parent: fdiv
    });
    // Prevent image dragging
    var img = t.querySelectorAll('img');
    for (var i=0; i<img.length; i++) {
      img[i].ondragstart = function(){ return false; };
    };

    // Calculate image width
    if (f.end) {
      ol_ext_element.setStyle(t, { 
        minWidth: (f.end-d) * scale, 
        maxWidth: 'unset'
      });
    }
    var left = ol_ext_element.getStyle(t, 'left');
    // Select on click
    t.addEventListener('click', function(){
      if (!this._moving) {
        this.dispatchEvent({type: 'select', feature: f.feature });
        this.element.scrollLeft = left - ol_ext_element.getStyle(this.element, 'width')/2;
      }
    }.bind(this));

    // Find first free Y position
    var pos, l;
    for (pos=0; l=line[pos]; pos++) {
      if (left > l) {
        break;
      };
    }
    line[pos] = left + ol_ext_element.getStyle(t, 'width');
    ol_ext_element.setStyle(t, { top: pos*lineHeight });
  }.bind(this));
  this._nbline = line.length;
};

/**
 * Draw date time line
 * @private
 */
ol_control_Timeline.prototype._drawTime = function(div, min, max, scale) {
  var year = (new Date(this._minDate)).getFullYear();
  var tdiv = ol_ext_element.create('DIV', {
    className: 'ol-times',
    parent: div
  });
  var dx = ol_ext_element.getStyle(tdiv, 'left');
  while(true) {
    var d = new Date(String(year));
    if (d > this._maxDate) break;
    ol_ext_element.create('DIV', {
      className: 'ol-time',
      style: {
        left: Math.round((d-this._minDate)*scale) - dx
      },
      html: year,
      parent: tdiv
    });
    year++;
  }
};

/** Center timeline on a date
 * @param {Date|String|ol.feature} feature a date or a feature with a date
 */
ol_control_Timeline.prototype.setDate = function(feature) {
  var date;
  // Get date from Feature
  if (feature instanceof ol_Feature) {
    date = this._getFeatureDate(feature);
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
  } else if (feature instanceof Date) {
    date = feature;
  } else {
    date = new Date(String(feature));
  }
  if (!isNaN(date)) {
    this.element.scrollLeft = (date-this._minDate)*this._scale - ol_ext_element.getStyle(this.element, 'width')/2;
    if (feature) {
      for (var i=0, f; f = this._tline[i]; i++) {
        if (f.feature === feature) {
          f.elt.classList.add('select');
          this._select = f;
        } else {
          f.elt.classList.remove('select');
        }
      }
    }
  }
};

/** Get the date of the center
 * @return {Date}
 */
ol_control_Timeline.prototype.getDate = function() {
  var d = (this.element.scrollLeft + ol_ext_element.getStyle(this.element, 'width')/2)/this._scale + this._minDate;
  return new Date(d);
};

export default ol_control_Timeline