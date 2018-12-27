/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import {inherits as ol_inherits} from 'ol'
import ol_source_Vector from 'ol/source/Vector'
import { ol_Feature } from 'ol/Feature';
import ol_control_Control from 'ol/control/Control'
import ol_has_TOUCH from 'ol/has'
import ol_ext_element from '../util/element'

/** Timeline control
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires select
 * @fires scroll
 * @fires collapse
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {Array<ol.Feature>} options.features Features to show in the timeline
 *	@param {ol.SourceImageOptions.vector} options.source class of the control
 *	@param {String} options.maxWidth width of the time line in px, default 2000px
 *	@param {String} options.minDate minimum date 
 *	@param {String} options.maxDate maximum date 
 *	@param {Number} options.minZoom Minimum zoom for the line, default .2
 *	@param {Number} options.maxZoom Maximum zoom for the line, default 4
 *	@param {boolean} options.zoomButton Are zoom buttons avaliable, default false
 *	@param {function} options.getHTML a function that takes a feature and returns the html to display
 *	@param {function} options.getFeatureDate a function that takes a feature and returns its date, default the date propertie
 *	@param {function} options.endFeatureDate a function that takes a feature and returns its end date, default no end date
 *	@param {String} options.graduation day|month to show month or day graduation, default show only years
 *	@param {String} options.scrollTimeout Time in milliseconds to get a scroll event, default 15ms
 */
var ol_control_Timeline = function(options) {

  var element = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-timeline'
      + (options.target ? '': ' ol-unselectable ol-control')
      + (options.zoomButton ? ' ol-hasbutton':'')
      + (ol_has_TOUCH ? ' ol-touch' : '')
  });

  // Initialize
  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  // Scroll div
  this._scrollDiv = ol_ext_element.create('DIV', {
    className: 'ol-scroll',
    parent: this.element
  });

  // Add a button bar
  this._buttons = ol_ext_element.create('DIV', {
    className: 'ol-buttons',
    parent: this.element
  });
  // Zoom buttons
  if (options.zoomButton) {
    // Zoom in
    this.addButton({
      className: 'ol-zoom-in',
      handleClick: function(){
        var zoom = this.get('zoom');
        if (zoom>=1) {
          zoom++;
        } else {
          zoom = Math.min(1, zoom + 0.1);
        }
        zoom = Math.round(zoom*100)/100;
        this.refresh(zoom);
      }.bind(this)
    });
    // Zoom out
    this.addButton({
      className: 'ol-zoom-out',
      handleClick: function(){
        var zoom = this.get('zoom');
        if (zoom>1) {
          zoom--;
        } else {
          zoom -= 0.1;
        }
        zoom = Math.round(zoom*100)/100;
        this.refresh(zoom);
      }.bind(this)
    });
  }

  // Draw center date
  ol_ext_element.create('DIV', {
    className: 'ol-center-date',
    parent: this.element
  });

  // Remove selection
  this.element.addEventListener('mouseover', function(){
    if (this._select) this._select.elt.classList.remove('ol-select');
  }.bind(this));

  // Trigger scroll event
  var scrollListener = null;
  this._scrollDiv.addEventListener('scroll', function() {
    if (scrollListener) {
      clearTimeout(scrollListener);
      scrollListener = null;
    }
    scrollListener = setTimeout(function() {
      this.dispatchEvent({ 
        type: 'scroll', 
        date: this.getDate(), 
        dateStart: this.getDate('start'), 
        dateEnd: this.getDate('end')
      });
    }.bind(this), options.scrollTimeout || 15);
  }.bind(this));

  // Scroll timeline
  ol_ext_element.scrollDiv(this._scrollDiv, {
    onmove: function(b) {
      // Prevent selection on moving
      this._moving = b; 
    }.bind(this)
  });

  this._tline = [];

  // Parameters
  this.set('maxWidth', options.maxWidth || 2000);
  this.set('minDate', options.minDate || Infinity);
  this.set('maxDate', options.maxDate || -Infinity);
  this.set('graduation', options.graduation);
  this.set('minZoom', options.minZoom || .2);
  this.set('maxZoom', options.maxZoom || 4);
  if (options.getHTML) this._getHTML =  options.getHTML;
  if (options.getFeatureDate) this._getFeatureDate =  options.getFeatureDate;
  if (options.endFeatureDate) this._endFeatureDate =  options.endFeatureDate;

  // Feature source 
  this.setFeatures(options.features || options.source, options.zoom);
};
ol_inherits(ol_control_Timeline, ol_control_Control);

/**
 * Set the map instance the control is associated with
 * and add interaction attached to it to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol_control_Timeline.prototype.setMap = function(map) {
  ol_control_Control.prototype.setMap.call(this, map);
  this.refresh();
};

ol_control_Timeline.prototype.addButton = function(button) {
  this.element.classList.add('ol-hasbutton');
  ol_ext_element.create('BUTTON', {
    className: button.className || undefined,
    title: button.title,
    html : button.html,
    click: button.handleClick,
    parent: this._buttons
  })
};

/** Default html to show in the line
 * @param {ol.Feature} feature
 * @return {DOMElement|string}
 * @private
 */
ol_control_Timeline.prototype._getHTML = function(feature) {
  return feature.get('name') || '';
};

/** Default function to get the date of a feature, returns the date attribute
 * @param {ol.Feature} feature
 * @return {Data|string}
 * @private
 */
ol_control_Timeline.prototype._getFeatureDate = function(feature) {
  return feature.get('date');
};

/** Default function to get the end date of a feature, return undefined
 * @param {ol.Feature} feature
 * @return {Data|string}
 * @private
 */
ol_control_Timeline.prototype._endFeatureDate = function(/* feature */) {
  return undefined;
};

/** Is the line collapsed
 * @return {boolean}
 */
ol_control_Timeline.prototype.isCollapsed = function() {
  return this.element.classList.contains('ol-collapsed');
};

/** Collapse the line
 * @param {boolean} b
 */
ol_control_Timeline.prototype.collapse = function(b) {
  if (b) this.element.classList.add('ol-collapsed');
  else this.element.classList.remove('ol-collapsed');
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};

/** Collapse the line
 */
ol_control_Timeline.prototype.toggle = function() {
  this.element.classList.toggle('ol-collapsed');
  this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
};

/** Set the features to display in the timeline
 * @param {Array<ol.Features>|ol.source.Vector} features An array of features or a vector source
 * @param {number} zoom zoom to draw the line default 1
 */
ol_control_Timeline.prototype.setFeatures = function(features, zoom) {
  this._features = this._source = null;
  if (features instanceof ol_source_Vector) this._source = features;
  else if (features instanceof Array) this._features = features;
  else this._features = [];
  this.refresh(zoom);
};

/**
 * Get features
 * @return {Array<ol.Feature>}
 */
ol_control_Timeline.prototype.getFeatures = function() {
  return this._features || this._source.getFeatures();
}

/**
 * Refresh the timeline with new data
 * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
 */
ol_control_Timeline.prototype.refresh = function(zoom) {
  if (!this.getMap()) return;
  if (!zoom) zoom = this.get('zoom');
  zoom = Math.min(this.get('maxZoom'), Math.max(this.get('minZoom'), zoom || 1));
  this.set('zoom', zoom);
  this._scrollDiv.innerHTML = '';
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

  tline.sort(function(a,b) { 
    return (a.date < b.date ? -1 : (a.date===b.date ? 0: 1))
  });

  // Draw
  var div = ol_ext_element.create('DIV', {
    parent: this._scrollDiv
  });

  // Calculate width
  var min = this._minDate = Math.min(this.get('minDate'), tline.length ? tline[0].date : Infinity);
  var max = this._maxDate = Math.max(this.get('maxDate'), tline.length ? tline[tline.length-1].date : -Infinity);
  if (!isFinite(min)) this._minDate = min = new Date();
  if (!isFinite(max)) this._maxDate = max = new Date();

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
  var lineHeight = ol_ext_element.getStyle(this._scrollDiv, 'lineHeight');
  
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
    }

    // Calculate image width
    if (f.end) {
      ol_ext_element.setStyle(t, { 
        minWidth: (f.end-d) * scale, 
        width: (f.end-d) * scale, 
        maxWidth: 'unset'
      });
    }
    var left = ol_ext_element.getStyle(t, 'left');
    // Select on click
    t.addEventListener('click', function(){
      if (!this._moving) {
        this.dispatchEvent({type: 'select', feature: f.feature });
      }
    }.bind(this));

    // Find first free Y position
    var pos, l;
    for (pos=0; l=line[pos]; pos++) {
      if (left > l) {
        break;
      }
    }
    line[pos] = left + ol_ext_element.getStyle(t, 'width');
    ol_ext_element.setStyle(t, { top: pos*lineHeight });
  }.bind(this));
  this._nbline = line.length;

  // Dispatch scroll event
  this.dispatchEvent({ 
    type: 'scroll', 
    date: this.getDate(), 
    dateStart: this.getDate('start'), 
    dateEnd: this.getDate('end')
  });
};

/**
 * Draw dates on line
 * @private
 */
ol_control_Timeline.prototype._drawTime = function(div, min, max, scale) {
  // Times div
  var tdiv = ol_ext_element.create('DIV', {
    className: 'ol-times',
    parent: div
  });
  var d, dt, month, dmonth;
  var dx = ol_ext_element.getStyle(tdiv, 'left');
  var heigth = ol_ext_element.getStyle(tdiv, 'height');
  // Year
  var year = (new Date(this._minDate)).getFullYear();
  while(true) {
    d = new Date(String(year));
    if (d > this._maxDate) break;
    ol_ext_element.create('DIV', {
      className: 'ol-time ol-year',
      style: {
        left: Math.round((d-this._minDate)*scale) - dx
      },
      html: year,
      parent: tdiv
    });
    year++;
  }
  // Month
  if (/day|month/.test(this.get('graduation'))) {
    dt = (new Date(String(year)) - new Date(String(year-1))) * scale;
    dmonth = Math.max(1, Math.round(12 / Math.round(dt/heigth/2)));
    if (dmonth < 12) {
      year = (new Date(this._minDate)).getFullYear();
      month = dmonth+1;
      while(true) {
        d = new Date(year+'/'+month+'/01');
        if (d > this._maxDate) break;
        ol_ext_element.create('DIV', {
          className: 'ol-time ol-month',
          style: {
            left: Math.round((d-this._minDate)*scale) - dx
          },
          html: d.toLocaleDateString(undefined, { month: 'short'}),
          parent: tdiv
        });
        month += dmonth;
        if (month > 12) {
          year++;
          month = dmonth+1;
        }
      }
    }
  }
  // Day
  if (this.get('graduation')==='day') {
    dt = (new Date(year+'/02/01') - new Date(year+'/01/01')) * scale;
    var dday = Math.max(1, Math.round(31 / Math.round(dt/heigth/2)));
    if (dday < 31) {
      year = (new Date(this._minDate)).getFullYear();
      month = 1;
      var day = dday;
      while(true) {
        d = new Date(year+'/'+month+'/'+day);
        if (isNaN(d)) {
          month++;
          if (month>12) {
            month = 1;
            year++;
          }
          day=dday;
        } else {
          if (d > this._maxDate) break;
          ol_ext_element.create('DIV', {
            className: 'ol-time ol-day',
            style: {
              left: Math.round((d-this._minDate)*scale) - dx
            },
            html: day,
            parent: tdiv
          });
          day += dday;
          if (day+dday/2>31) day=32;
        }
      }
    }
  }
};

/** Center timeline on a date
 * @param {Date|String|ol.feature} feature a date or a feature with a date
 * @param {boolean} anim animate scroll
 */
ol_control_Timeline.prototype.setDate = function(feature, anim) {
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
    if (anim === false) this._scrollDiv.classList.add('ol-move');
    this._scrollDiv.scrollLeft = (date-this._minDate)*this._scale - ol_ext_element.getStyle(this._scrollDiv, 'width')/2;
    if (anim === false) this._scrollDiv.classList.remove('ol-move');
    if (feature) {
      for (var i=0, f; f = this._tline[i]; i++) {
        if (f.feature === feature) {
          f.elt.classList.add('ol-select');
          this._select = f;
        } else {
          f.elt.classList.remove('ol-select');
        }
      }
    }
  }
};

/** Get the date of the center
 * @param {string} position start, end or middle, default middle
 * @return {Date}
 */
ol_control_Timeline.prototype.getDate = function(position) {
  var pos;
  switch (position) {
    case 'start': {
      pos = 0;
      break;
    }
    case 'end': {
      pos = ol_ext_element.getStyle(this._scrollDiv, 'width');
      break;
    }
    default: {
      pos = ol_ext_element.getStyle(this._scrollDiv, 'width')/2;
      break;
    }
  }
  var d = (this._scrollDiv.scrollLeft + pos)/this._scale + this._minDate;
  return new Date(d);
};

export default ol_control_Timeline