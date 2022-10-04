/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import ol_source_Vector from 'ol/source/Vector.js'
import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js'

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
 *	@param {Number} options.interval time interval length in ms or a text with a format d, h, mn, s (31 days = '31d'), default none
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
var ol_control_Timeline = class olcontrolTimeline extends ol_control_Control {
  constructor(options) {

    var element = ol_ext_element.create('DIV', {
      className: (options.className || '') + ' ol-timeline'
        + (options.target ? '' : ' ol-unselectable ol-control')
        + (options.zoomButton ? ' ol-hasbutton' : '')
    });

    // Initialize
    super({
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
        handleClick: function () {
          var zoom = this.get('zoom');
          if (zoom >= 1) {
            zoom++;
          } else {
            zoom = Math.min(1, zoom + 0.1);
          }
          zoom = Math.round(zoom * 100) / 100;
          this.refresh(zoom);
        }.bind(this)
      });
      // Zoom out
      this.addButton({
        className: 'ol-zoom-out',
        handleClick: function () {
          var zoom = this.get('zoom');
          if (zoom > 1) {
            zoom--;
          } else {
            zoom -= 0.1;
          }
          zoom = Math.round(zoom * 100) / 100;
          this.refresh(zoom);
        }.bind(this)
      });
    }

    // Draw center date
    this._intervalDiv = ol_ext_element.create('DIV', {
      className: 'ol-center-date',
      parent: this.element
    });

    // Remove selection
    this.element.addEventListener('mouseover', function () {
      if (this._select)
        this._select.elt.classList.remove('ol-select');
    }.bind(this));

    // Trigger scroll event
    var scrollListener = null;
    this._scrollDiv.addEventListener('scroll', function () {
      this._setScrollLeft();
      if (scrollListener) {
        clearTimeout(scrollListener);
        scrollListener = null;
      }
      scrollListener = setTimeout(function () {
        this.dispatchEvent({
          type: 'scroll',
          date: this.getDate(),
          dateStart: this.getDate('start'),
          dateEnd: this.getDate('end')
        });
      }.bind(this), options.scrollTimeout || 15);
    }.bind(this));
    // Magic to give "live" scroll events on touch devices
    // this._scrollDiv.addEventListener('gesturechange', function() {});
    // Scroll timeline
    ol_ext_element.scrollDiv(this._scrollDiv, {
      onmove: function (b) {
        // Prevent selection on moving
        this._moving = b;
      }.bind(this)
    });

    this._tline = [];

    // Parameters
    this._scrollLeft = 0;
    this.set('maxWidth', options.maxWidth || 2000);
    this.set('minDate', options.minDate || Infinity);
    this.set('maxDate', options.maxDate || -Infinity);
    this.set('graduation', options.graduation);
    this.set('minZoom', options.minZoom || .2);
    this.set('maxZoom', options.maxZoom || 4);
    this.setInterval(options.interval);
    if (options.getHTML)
      this._getHTML = options.getHTML;
    if (options.getFeatureDate)
      this._getFeatureDate = options.getFeatureDate;
    if (options.endFeatureDate)
      this._endFeatureDate = options.endFeatureDate;

    // Feature source 
    this.setFeatures(options.features || options.source, options.zoom);
  }
  /**
   * Set the map instance the control is associated with
   * and add interaction attached to it to this map.
   * @param {_ol_Map_} map The map instance.
   */
  setMap(map) {
    super.setMap(map);
    this.refresh(this.get('zoom') || 1, true);
  }
  /** Add a button on the timeline
   * @param {*} button
   *  @param {string} button.className
   *  @param {title} button.className
   *  @param {Element|string} button.html Content of the element
   *  @param {function} button.click a function called when the button is clicked
   */
  addButton(button) {
    this.element.classList.add('ol-hasbutton');
    ol_ext_element.create('BUTTON', {
      className: button.className || undefined,
      title: button.title,
      html: button.html,
      click: button.handleClick,
      parent: this._buttons
    });
  }
  /** Set an interval
   * @param {number|string} length the interval length in ms or a farmatted text ie. end with y, 1d, h, mn, s (31 days = '31d'), default none
   */
  setInterval(length) {
    if (typeof (length) === 'string') {
      if (/s$/.test(length)) {
        length = parseFloat(length) * 1000;
      } else if (/mn$/.test(length)) {
        length = parseFloat(length) * 1000 * 60;
      } else if (/h$/.test(length)) {
        length = parseFloat(length) * 1000 * 3600;
      } else if (/d$/.test(length)) {
        length = parseFloat(length) * 1000 * 3600 * 24;
      } else if (/y$/.test(length)) {
        length = parseFloat(length) * 1000 * 3600 * 24 * 365;
      } else {
        length = 0;
      }
    }
    this.set('interval', length || 0);
    if (length)
      this.element.classList.add('ol-interval');
    else
      this.element.classList.remove('ol-interval');
    this.refresh(this.get('zoom'));
  }
  /** Default html to show in the line
   * @param {ol.Feature} feature
   * @return {DOMElement|string}
   * @private
   */
  _getHTML(feature) {
    return feature.get('name') || '';
  }
  /** Default function to get the date of a feature, returns the date attribute
   * @param {ol.Feature} feature
   * @return {Data|string}
   * @private
   */
  _getFeatureDate(feature) {
    return (feature && feature.get) ? feature.get('date') : null;
  }
  /** Default function to get the end date of a feature, return undefined
   * @param {ol.Feature} feature
   * @return {Data|string}
   * @private
   */
  _endFeatureDate( /* feature */) {
    return undefined;
  }
  /** Is the line collapsed
   * @return {boolean}
   */
  isCollapsed() {
    return this.element.classList.contains('ol-collapsed');
  }
  /** Collapse the line
   * @param {boolean} b
   */
  collapse(b) {
    if (b)
      this.element.classList.add('ol-collapsed');
    else
      this.element.classList.remove('ol-collapsed');
    this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
  }
  /** Collapse the line
   */
  toggle() {
    this.element.classList.toggle('ol-collapsed');
    this.dispatchEvent({ type: 'collapse', collapsed: this.isCollapsed() });
  }
  /** Set the features to display in the timeline
   * @param {Array<ol.Features>|ol.source.Vector} features An array of features or a vector source
   * @param {number} zoom zoom to draw the line default 1
   */
  setFeatures(features, zoom) {
    this._features = this._source = null;
    if (features instanceof ol_source_Vector)
      this._source = features;
    else if (features instanceof Array)
      this._features = features;
    else
      this._features = [];
    this.refresh(zoom);
  }
  /**
   * Get features
   * @return {Array<ol.Feature>}
   */
  getFeatures() {
    return this._features || this._source.getFeatures();
  }
  /**
   * Refresh the timeline with new data
   * @param {Number} zoom Zoom factor from 0.25 to 10, default 1
   */
  refresh(zoom, first) {
    if (!this.getMap())
      return;
    if (!zoom)
      zoom = this.get('zoom');
    zoom = Math.min(this.get('maxZoom'), Math.max(this.get('minZoom'), zoom || 1));
    this.set('zoom', zoom);
    this._scrollDiv.innerHTML = '';
    var features = this.getFeatures();
    var d, d2;

    // Get features sorted by date
    var tline = this._tline = [];
    features.forEach(function (f) {
      if (d = this._getFeatureDate(f)) {
        if (!(d instanceof Date)) {
          d = new Date(d);
        }
        if (this._endFeatureDate) {
          d2 = this._endFeatureDate(f);
          if (!(d2 instanceof Date)) {
            d2 = new Date(d2);
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

    tline.sort(function (a, b) {
      return (a.date < b.date ? -1 : (a.date === b.date ? 0 : 1));
    });

    // Draw
    var div = ol_ext_element.create('DIV', {
      parent: this._scrollDiv
    });

    // Calculate width
    var min = this._minDate = Math.min(this.get('minDate'), tline.length ? tline[0].date : Infinity);
    var max = this._maxDate = Math.max(this.get('maxDate'), tline.length ? tline[tline.length - 1].date : -Infinity);
    if (!isFinite(min))
      this._minDate = min = new Date();
    if (!isFinite(max))
      this._maxDate = max = new Date();
    var delta = (max - min);
    var maxWidth = this.get('maxWidth');
    var scale = this._scale = (delta > maxWidth ? maxWidth / delta : 1) * zoom;
    // Leave 10px on right
    min = this._minDate = this._minDate - 10 / scale;
    delta = (max - min) * scale;
    ol_ext_element.setStyle(div, {
      width: delta,
      maxWidth: 'unset'
    });

    // Draw time's bar
    this._drawTime(div, min, max, scale);

    // Set interval
    if (this.get('interval')) {
      ol_ext_element.setStyle(this._intervalDiv, { width: this.get('interval') * scale });
    } else {
      ol_ext_element.setStyle(this._intervalDiv, { width: '' });
    }

    // Draw features
    var line = [];
    var lineHeight = ol_ext_element.getStyle(this._scrollDiv, 'lineHeight');

    // Wrapper
    var fdiv = ol_ext_element.create('DIV', {
      className: 'ol-features',
      parent: div
    });

    // Add features on the line
    tline.forEach(function (f) {
      var d = f.date;
      var t = f.elt = ol_ext_element.create('DIV', {
        className: 'ol-feature',
        style: {
          left: Math.round((d - min) * scale),
        },
        html: this._getHTML(f.feature),
        parent: fdiv
      });
      // Prevent image dragging
      var img = t.querySelectorAll('img');
      for (var i = 0; i < img.length; i++) {
        img[i].ondragstart = function () { return false; };
      }

      // Calculate image width
      if (f.end) {
        ol_ext_element.setStyle(t, {
          minWidth: (f.end - d) * scale,
          width: (f.end - d) * scale,
          maxWidth: 'unset'
        });
      }
      var left = ol_ext_element.getStyle(t, 'left');
      // Select on click
      t.addEventListener('click', function () {
        if (!this._moving) {
          this.dispatchEvent({ type: 'select', feature: f.feature });
        }
      }.bind(this));

      // Find first free Y position
      var pos, l;
      for (pos = 0; l = line[pos]; pos++) {
        if (left > l) {
          break;
        }
      }
      line[pos] = left + ol_ext_element.getStyle(t, 'width');
      ol_ext_element.setStyle(t, { top: pos * lineHeight });
    }.bind(this));
    this._nbline = line.length;

    if (first)
      this.setDate(this._minDate, { anim: false, position: 'start' });
    // Dispatch scroll event
    this.dispatchEvent({
      type: 'scroll',
      date: this.getDate(),
      dateStart: this.getDate('start'),
      dateEnd: this.getDate('end')
    });
  }
  /** Get offset given a date
   * @param {Date} date
   * @return {number}
   * @private
   */
  _getOffsetFromDate(date) {
    return (date - this._minDate) * this._scale;
  }
  /** Get date given an offset
   * @param {Date} date
   * @return {number}
   * @private
   */
  _getDateFromOffset(offset) {
    return offset / this._scale + this._minDate;
  }
  /** Set the current position
   * @param {number} scrollLeft current position (undefined when scrolling)
   * @returns {number}
   * @private
   */
  _setScrollLeft(scrollLeft) {
    this._scrollLeft = scrollLeft;
    if (scrollLeft !== undefined) {
      this._scrollDiv.scrollLeft = scrollLeft;
    }
  }
  /** Get the current position
   * @returns {number}
   * @private
   */
  _getScrollLeft() {
    // Unset when scrolling
    if (this._scrollLeft === undefined) {
      return this._scrollDiv.scrollLeft;
    } else {
      // St by user
      return this._scrollLeft;
    }
  }
  /**
   * Draw dates on line
   * @private
   */
  _drawTime(div, min, max, scale) {
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
    dt = ((new Date(0)).setFullYear(String(year)) - new Date(0).setFullYear(String(year - 1))) * scale;
    var dyear = Math.round(2 * heigth / dt) + 1;
    while (true) {
      d = new Date(0).setFullYear(year);
      if (d > this._maxDate)
        break;
      ol_ext_element.create('DIV', {
        className: 'ol-time ol-year',
        style: {
          left: this._getOffsetFromDate(d) - dx
        },
        html: year,
        parent: tdiv
      });
      year += dyear;
    }
    // Month
    if (/day|month/.test(this.get('graduation'))) {
      dt = ((new Date(0, 0, 1)).setFullYear(String(year)) - new Date(0, 0, 1).setFullYear(String(year - 1))) * scale;
      dmonth = Math.max(1, Math.round(12 / Math.round(dt / heigth / 2)));
      if (dmonth < 12) {
        year = (new Date(this._minDate)).getFullYear();
        month = dmonth + 1;
        while (true) {
          d = new Date(0, 0, 1);
          d.setFullYear(year);
          d.setMonth(month - 1);
          if (d > this._maxDate)
            break;
          ol_ext_element.create('DIV', {
            className: 'ol-time ol-month',
            style: {
              left: this._getOffsetFromDate(d) - dx
            },
            html: d.toLocaleDateString(undefined, { month: 'short' }),
            parent: tdiv
          });
          month += dmonth;
          if (month > 12) {
            year++;
            month = dmonth + 1;
          }
        }
      }
    }
    // Day
    if (this.get('graduation') === 'day') {
      dt = (new Date(0, 1, 1) - new Date(0, 0, 1)) * scale;
      var dday = Math.max(1, Math.round(31 / Math.round(dt / heigth / 2)));
      if (dday < 31) {
        year = (new Date(this._minDate)).getFullYear();
        month = 0;
        var day = dday;
        while (true) {
          d = new Date(0, 0, 1);
          d.setFullYear(year);
          d.setMonth(month);
          d.setDate(day);
          if (isNaN(d)) {
            month++;
            if (month > 12) {
              month = 1;
              year++;
            }
            day = dday;
          } else {
            if (d > this._maxDate)
              break;
            if (day > 1) {
              var offdate = this._getOffsetFromDate(d);
              if (this._getOffsetFromDate(new Date(year, month + 1, 1)) - offdate > heigth) {
                ol_ext_element.create('DIV', {
                  className: 'ol-time ol-day',
                  style: {
                    left: offdate - dx
                  },
                  html: day,
                  parent: tdiv
                });
              }
            }
            year = d.getFullYear();
            month = d.getMonth();
            day = d.getDate() + dday;
            if (day > new Date(year, month + 1, 0).getDate()) {
              month++;
              day = dday;
            }
          }
        }
      }
    }
  }
  /** Center timeline on a date
   * @param {Date|String|ol.feature} feature a date or a feature with a date
   * @param {Object} options
   *  @param {boolean} options.anim animate scroll
   *  @param {string} options.position start, end or middle, default middle
   */
  setDate(feature, options) {
    var date;
    options = options || {};
    // It's a date
    if (feature instanceof Date) {
      date = feature;
    } else {
      // Get date from Feature
      if (this.getFeatures().indexOf(feature) >= 0) {
        date = this._getFeatureDate(feature);
      }
      if (date && !(date instanceof Date)) {
        date = new Date(date);
      }
      if (!date || isNaN(date)) {
        date = new Date(String(feature));
      }
    }
    if (!isNaN(date)) {
      if (options.anim === false)
        this._scrollDiv.classList.add('ol-move');
      var scrollLeft = this._getOffsetFromDate(date);
      if (options.position === 'start') {
        scrollLeft += ol_ext_element.outerWidth(this._scrollDiv) / 2 - ol_ext_element.getStyle(this._scrollDiv, 'marginLeft') / 2;
      } else if (options.position === 'end') {
        scrollLeft -= ol_ext_element.outerWidth(this._scrollDiv) / 2 - ol_ext_element.getStyle(this._scrollDiv, 'marginLeft') / 2;
      }
      this._setScrollLeft(scrollLeft);
      if (options.anim === false)
        this._scrollDiv.classList.remove('ol-move');
      if (feature) {
        for (var i = 0, f; f = this._tline[i]; i++) {
          if (f.feature === feature) {
            f.elt.classList.add('ol-select');
            this._select = f;
          } else {
            f.elt.classList.remove('ol-select');
          }
        }
      }
    }
  }
  /** Get round date (sticked to mn, hour day or month)
   * @param {Date} d
   * @param {string} stick sticking option to stick date to: 'mn', 'hour', 'day', 'month', default no stick
   * @return {Date}
   */
  roundDate(d, stick) {
    switch (stick) {
      case 'mn': {
        return new Date(this._roundTo(d, 60 * 1000));
      }
      case 'hour': {
        return new Date(this._roundTo(d, 60 * 60 * 1000));
      }
      case 'day': {
        return new Date(this._roundTo(d, 24 * 60 * 60 * 1000));
      }
      case 'month': {
        d = new Date(this._roundTo(d, 24 * 60 * 60 * 1000));
        if (d.getDate() > 15) {
          d = new Date(d.setMonth(d.getMonth() + 1));
        }
        d = d.setDate(1);
        return new Date(d);
      }
      default: return new Date(d);
    }
  }
  /** Get the date of the center
   * @param {string} position position to get 'start', 'end' or 'middle', default middle
   * @param {string} stick sticking option to stick date to: 'mn', 'hour', 'day', 'month', default no stick
   * @return {Date}
   */
  getDate(position, stick) {
    var pos;
    if (!stick)
      stick = position;
    switch (position) {
      case 'start': {
        if (this.get('interval')) {
          pos = -ol_ext_element.getStyle(this._intervalDiv, 'width') / 2 + ol_ext_element.getStyle(this._scrollDiv, 'marginLeft') / 2;
        } else {
          pos = -ol_ext_element.outerWidth(this._scrollDiv) / 2 + ol_ext_element.getStyle(this._scrollDiv, 'marginLeft') / 2;
        }
        break;
      }
      case 'end': {
        if (this.get('interval')) {
          pos = ol_ext_element.getStyle(this._intervalDiv, 'width') / 2 - ol_ext_element.getStyle(this._scrollDiv, 'marginLeft') / 2;
        } else {
          pos = ol_ext_element.outerWidth(this._scrollDiv) / 2 - ol_ext_element.getStyle(this._scrollDiv, 'marginLeft') / 2;
        }
        break;
      }
      default: {
        pos = 0;
        break;
      }
    }
    var d = this._getDateFromOffset(this._getScrollLeft() + pos);
    d = this.roundDate(d, stick);
    return new Date(d);
  }
  /** Round number to
   * @param {number} d
   * @param {number} r
   * @return {number}
   * @private
   */
  _roundTo(d, r) {
    return Math.round(d / r) * r;
  }
  /** Get the start date of the control
   * @return {Date}
   */
  getStartDate() {
    return new Date(this.get('minDate'));
  }
  /** Get the end date of the control
   * @return {Date}
   */
  getEndDate() {
    return new Date(this.get('maxDate'));
  }
}

export default ol_control_Timeline