import ol_geom_Geometry from 'ol/geom/Geometry.js'
import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js';

/** Feature list control
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires dblclick
 * @fires collapse
 * @fires resize
 * @fires sort
 * @param {Object=} options
 *  @param {number} [options.title] table title
 *  @param {Element} [options.target] to display the control outside the map
 *  @param {string} [options.className] use `ol-bottom` to scroll at bottom (default top)
 *  @param {boolean} [options.collapsed=true] collapse the list on start, default true
 *  @param {Array<ol_Feature>|ol_Collection<ol_Feature>|ol_source_Vector} [features] a set of feature to display. If provided as Source or Collection the features will stay in sync.
 *  @param {number} [options.pageLength=100] number of row to display in the table (page optimzation)
 */
var ol_control_FeatureList = class olcontrolFeatureList extends ol_control_Control {
  constructor(options) {
    options = options || {};
    // Control element
    var element = ol_ext_element.create('DIV', {
      className: ((options.className || '') + ' ol-feature-list').trim()
    })
    if (!options.target) {
      element.classList.add('ol-unselectable');
      element.classList.add('ol-control');
      element.dataset.control = 1;
    }

    super({
      element: element,
      target: options.target
    });
    // List of features / sort
    this._listFeatures = [];
    // Current columns
    this._columns = [];
    // Bottom scroll
    this._bottomScroll = element.classList.contains('ol-bottom');
    // Page lengeh
    this.set('pageLength', options.pageLength || 100);

    // Enable sort
    this._canSort = [];
    this._sort = {};

    // Button
    if (!options.target) {
      ol_ext_element.create('BUTTON', {
        type: 'button',
        click: function() {
          this.collapse()
        }.bind(this),
        parent: element
      })
    }

    // List
    var content = ol_ext_element.create('DIV', {
      className: 'ol-content',
      parent: element
    });
    // Menu header
    this._menu = ol_ext_element.create('DIV', {
      className: 'ol-header',
      html: '<div class="ol-buttons"></div>',
      parent: content
    })
    ol_ext_element.create('P', {
      text: options.title || '',
      parent: this._menu
    })
    this.addButton({
        className: 'ol-closebox',
        type: 'button',
        click: function() {
          this.collapse()
        }.bind(this),
        parent: this._menu
    })
    // Sizer
    var sizer = ol_ext_element.create('DIV', {
      className: 'ol-sizer',
      parent: content
    })
    sizer.addEventListener('mousedown', this._dragSizer.bind(this));
    sizer.addEventListener('touchstart', this._dragSizer.bind(this));

    // List array
    var list = this._list = ol_ext_element.create('TABLE', {
      className: 'ol-list',
      parent: ol_ext_element.create('DIV', {
        className: 'ol-scroll-container',
        tabindex: -1,
        parent: content
      })
    });
    list.parentNode.addEventListener('scroll', this._drawPage.bind(this))
    this._head = ol_ext_element.create('THEAD', {
      parent: list
    })
    this._listbody = ol_ext_element.create('TBODY', {
      parent: list
    })

    // Collapse
    this.collapse(options.collapsed !== false);

    // Source
    this.setFeatures(options.features)
  }

  /**
   * Set the map instance the control is associated with
   * and add its controls associated to this map.
   * @param {ol_Map} map The map instance.
   */
  setMap(map) {
    super.setMap(map);
    map.addEventListener('change:size', this.resize.bind(this));
    this.resize();
  }
};

/** Scroll resize at botton
 * @param {boolean} b
 */
ol_control_FeatureList.prototype.setBottomScroll = function(b) {
  this._bottomScroll = !!b
  if (this._bottomScroll) {
    this.element.classList.add('ol-bottom')
  } else {
    this.element.classList.remove('ol-bottom')
  }
}

/** Scroll to an element / feature
 * @param {ol_Feature|string} feature a featue or `select` to scroll at the selected row
 */
ol_control_FeatureList.prototype.scrollTo = function(feature) {
  if (feature === 'select') {
    if (this._curSelection) return this.scrollTo(this._curSelection.feature);
    else return false;
  } else {
    var i = this._findFeatureIndex(feature)
    if (i >= 0) {
      var scrollDiv = this._list.parentNode;
      scrollDiv.scrollTo(scrollDiv.scrollLeft, (i+1.5)*this.getRowHeight() - scrollDiv.getBoundingClientRect().height/2)
      var fpage = this._findInPage(feature)
      return {
        feature: feature,
        tr: fpage ? fpage.tr : ol_ext_element.create('TR')
      }
    }
  }
  return false;
}

/** Find the feature index in the list
 * @param {ol_Feature} feature
 * @returns {Object}
 * @private
 */
ol_control_FeatureList.prototype._findFeatureIndex = function(feature) {
  var list = this._listFeatures;
  if (list) {
    for (var i=0; i<list.length; i++) {
      if (list[i] === feature) {
        return i
      }
    }
  }
  return -1;
}

/** Find a feature in the current page
 * @param {ol_Feature} feature
 * @returns {Object} 
 */
ol_control_FeatureList.prototype._findInPage = function(feature) {
  var list = this._page;
  if (list) {
    for (var i=0; i<list.length; i++) {
      if (list[i].feature === feature) {
        return list[i]
      }
    }
  }
  return false;
}

/** Collapse the table
 * @param {boolean} [b] if no parameters toggle it
 */
ol_control_FeatureList.prototype.collapse = function(b) {
  if (b === undefined) b = !this._collapsed;
  if (b !== this._collapsed) {
    this._collapsed = b;
    if (this._collapsed) {
      this.element.classList.add('ol-collapsed')
    } else {
      this.element.classList.remove('ol-collapsed')
    }
    this.dispatchEvent({
      type: 'collapse',
      collapsed: this._collapsed
    })
    if (!this._collapsed) this.refresh();
  }
}

/** Is the control collapsed
 */
ol_control_FeatureList.prototype.isCollapsed = function() {
  return this._collapsed;
}

/** Set the features list
 * @param {ol_source_Vector|ol_Collection<ol_Feature>|Array<ol_Feature>} source a vector source or a collection of features to list
 */
ol_control_FeatureList.prototype.setFeatures = function(source) {
  if (!this._drawbind) {
    this._drawbind = this._drawList.bind(this)
  }
  // Remove listeners
  if (this._source && this._source.un) {
    this._source.un(['loadend', 'addfeature', 'removefeature', 'add', 'remove'], this._drawbind)
  }
  // New source
  this._source = source || [];
  this._drawList();
  // Refresh on change
  if (this._source.on) {
    this._source.on(['loadend', 'addfeature', 'removefeature', 'add', 'remove'], this._drawbind)
  }
}

/** Sort list by properties
 * @param {string} prop property name
 * @param {string} [sort] 'up' or 'down', default remove sort
 * 
 */
ol_control_FeatureList.prototype.sortBy = function(prop, sort) {
  if (!sort) {
    delete this._sort[prop]
  } else {
    this._sort[prop] = (sort !== 'down');
  }
  this.sort(true);
  this.dispatchEvent({ type: 'sort', property: prop, sort: sort });
}

/** Get sorted properties list
 * @return Object
 */
ol_control_FeatureList.prototype.getSort = function() {
  return this._sort;
}

/** Reset all sorts
 */
ol_control_FeatureList.prototype.resetSort = function() {
  this._sort = {};
  this.sort();
}

/** Enable sort list by properties in the header
 * @param {...string} propName 
 */
ol_control_FeatureList.prototype.enableSort = function() {
  this._canSort = [...arguments];
  Object.keys(this._sort).forEach(function(s) {
    if (this._canSort.indexOf(s) < 0) {
      delete this._sort[s];
    }
  }.bind(this))
  this.sort();
}

/** Draw the list
 * @param {boolean} delay to prevent to many redraw
 * @private
 */
ol_control_FeatureList.prototype._drawList = function(delay) {
  if (delay) {
    clearTimeout(this._drawout);
    this._drawout = setTimeout(this._drawList.bind(this), 100);
    return;
  }
  var features = this._source.getFeatures ? this._source.getFeatures() : this._source;
  this._columns = this.getColumns(features);
  // Head
  this._drawHead()
  // List of features
  this._listFeatures = [];
  features.forEach(function (f) {
    this._listFeatures.push(f)
  }.bind(this))
  // Sort
  this.sort();
}

/** Update a feature line in the table (attribute changed)
 * @param {ol_Feature} feature
 * @returns {boolean}
 */
ol_control_FeatureList.prototype.updateFeature = function(feature) {
  var pfeature = this._findInPage(feature)
  if (pfeature) {
    this._updateFeature(pfeature.feature, pfeature.tr)
    return true;
  }
  return false;
}

/** Update a feature line in the table
 * @param {ol_Feature} feature
 * @param {Element} tr
 * @private
 */
ol_control_FeatureList.prototype._updateFeature = function(f, tr) {
  tr.innerHTML = '';
  this._columns.forEach(function(c) {
    var p = this.formatProperty(f, c);
    ol_ext_element.create('TD', {
      text: p.val,
      html: p.html,
      className: p.type,
      'data-prop': c,
      parent: tr
    })
  }.bind(this))
  // Selected ?
  if (this._curSelection && this._curSelection.feature === f) {
    this._curSelection.tr = tr;
    tr.classList.add('ol-selected')
  }
}

/** Get the list element
 * @param {ol.Feature} f
 * @returns {Element}
 */
ol_control_FeatureList.prototype._getLi = function(f) {
  var tr = ol_ext_element.create('TR', {
    on: {
      click: function (e) {
        var td = e.target.closest('TD');
        this.dispatchEvent({
          type: 'select',
          property: td.dataset.prop,
          feature: f,
          row: e.target.closest('TR'),
          col: td,
          originalEvent: e
        })
        this.select(f, true)
      }.bind(this),
      dblclick: function(e) {
        var td = e.target.closest('TD');
        this.dispatchEvent({
          type: 'dblclick',
          property: td.dataset.prop,
          feature: f,
          row: e.target.closest('TR'),
          col: td,
          originalEvent: e
        })
      }.bind(this)
    }
  })
  this._updateFeature(f, tr)
  return tr;
}


/** Draw columns heads
 * @private
 */
ol_control_FeatureList.prototype._drawHead = function() {
  var columns = this._columns;
  this._head.innerHTML = '';
  var tr = ol_ext_element.create('TR', {
    parent: this._head
  })
  columns.forEach(function(c) {
    var td = ol_ext_element.create('TD', {
      html: ol_ext_element.create('P', { text: c }),
      parent: tr
    })
    if (this._canSort.length && this._canSort.indexOf(c) >= 0) {
      td.classList.add('sort')
      var b = ol_ext_element.create('BUTTON', {
        className: 'sort' + (this._sort[c]===true ? ' sortup' : this._sort[c]===false ? ' sortdown' : ''),
        click: function() {
          var sort;
          if (b.classList.contains('sortup')) {
            sort = 'down';
          } else if (!b.classList.contains('sortdown')) {
            sort = 'up';
          } 
          this.sortBy(c, sort);
        }.bind(this),
        parent: td
      })
    }
  }.bind(this))
}

/** Sort features in the table
 * @param {boolean} [silent] sort without triggering an event
 */
ol_control_FeatureList.prototype.sort = function(silent) {
  var sort = Object.keys(this._sort)
  if (sort.length) {
    this._listFeatures.sort(function(a, b) {
      for (let i=0; i<sort.length; i++) {
        var p = sort[i];
        var s = this.sortFn(a, b, p);
        if (s) return this._sort[p] ? s : -s;
      }
      return 0;
    }.bind(this));
  }
  // Refresh list
  this.refresh(true)
  if (!silent) this.dispatchEvent({ type: 'sort' });
}

/** Refresh the list draw + resize use update if features have changed
 * @param {boolean} [force]
 */
ol_control_FeatureList.prototype.refresh = function(force) {
  if (force) this._curPage = -1;
  // Draw Head
  this._drawHead();
  // Draw list
  this._drawPage()
  // resize
  this.resize();
}

/** Update the list (when features have changed without dispatching event).
 */
ol_control_FeatureList.prototype.update = function() {
  this._drawList();
  if (this._curSelection && this._curSelection.feature) {
    this.select(this._curSelection.feature, true)
  }
}

/** Get height of a row
 * @return {number}
 */
ol_control_FeatureList.prototype.getRowHeight = function() {
  return this._head.getBoundingClientRect().height;
}

/** Pagination draw
 * @private
 */
ol_control_FeatureList.prototype._drawPage = function() {
  // Page length
  var nb = Math.round(this.get('pageLength') / 2);
  var nb2 = Math.round(nb/2);
  // Get current page on scrollTop
  var top = this._list.parentNode.scrollTop;
  var h = this.getRowHeight();
  var page = Math.round((top / h - nb2) / nb);
  if (page*nb > this._listFeatures.length) page = 0;
  // No changes
  if (page === this._curPage) return;
  // Draw page
  this._curPage = page;
  this._listbody.innerHTML = '';
  // Fist row to preserve space
  this._listbody.appendChild(ol_ext_element.create('TR', {
    style: {
      height: Math.max(0, (page*nb - nb2)*h) + 'px'
    }
  }))
  // Page list
  var nmax = Math.min(this._listFeatures.length, (page+1)*nb + nb2)
  this._page = [];
  for (var i = Math.max(0, page*nb - nb2); i < nmax; i++) {
    // this._listbody.appendChild(this._listFeatures[i].tr)
    var tr = this._getLi(this._listFeatures[i])
    this._page.push({
      feature: this._listFeatures[i],
      tr: tr
    })
    if (this._curSelection && this._listFeatures[i] === this._curSelection.feature) {
      this._curSelection.tr = tr;
      tr.classList.add('ol-selected')
    }
    this._listbody.appendChild(tr)
  }
  // Last row to preserve space
  this._listbody.appendChild(ol_ext_element.create('TR', {
    style: {
      height: Math.max(0, (this._listFeatures.length - nmax) * h) + 'px'
    }
  }))
  // force focus on list
  if (this.get('focus') !== false) this._listbody.focus();
}


/** A sort function to compare 2 properties
 * @param {ol_Feature} f1
 * @param {ol_Feature} f2
 * @param {string} prop property name to sort at
 * @return number -1: v1 < v2, 1: v1 > v2, 0: v1 = v2
 * @api
 */
ol_control_FeatureList.prototype.sortFn = function(f1, f2, p) {
  var v1 = f1.get(p) || '';
  var v2 = f2.get(p) || '';
  if (v1 < v2) return -1;
  if (v1 > v2) return 1;
  return 0;
}

/** Format feature property
 * @param {ol_Feature} feature,
 * @param {string} prop property name
 * @api
 */
ol_control_FeatureList.prototype.formatProperty = function(feature, prop) {
  var p = feature.get(prop);
  return {
    val: p === undefined ? '-' : p,
    type: typeof(p)
  }
}

/** Get the list of columns
 * @param {Array<ol_Feature>} [features] a list of features to retrieve columns (if none, returns columns defined by setColumns)
 */
ol_control_FeatureList.prototype.getColumns = function(features) {
  var columns = this.columns || [];
  if (!columns.length && features) {
    var col = {}
    features.forEach(function (f) {
      // Get properties but geom
      Object.keys(f.getProperties()).forEach(function(p) {
        if (!(f.get(p) instanceof ol_geom_Geometry)) {
          col[p] = true;
        }
      })
    })
    columns = Object.keys(col);
  }
  return columns;
}

/** Set the list of columns to display
 * @param {Array<string>} columns
 */
ol_control_FeatureList.prototype.setColumns = function(columns) {
  this.columns = columns || [];
  this._drawList();
  if (this._curSelection && this._curSelection.feature) {
    this.select(this._curSelection.feature, true)
  }
}

/** Dragging sizer
 * @private
 */
ol_control_FeatureList.prototype._dragSizer = function(e) {
  var self = this;
  if (!this._movefn) {
    this._movefn = this._dragSizer.bind(this);
  }
  e.stopPropagation();
  e.preventDefault();
  switch (e.type) {
    case 'touchcancel':
    case 'touchend':
    case 'mouseup': {
      self._pageY = false;
      ["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
        .forEach(function (eventName) {
          document.removeEventListener(eventName, self._movefn);
        });
      break;
    }
    case 'mousedown':
    case 'touchstart': {
      self._contentHeight = self._list.parentNode.getBoundingClientRect().height;
      self._pageY =  e.pageY
        || (e.touches && e.touches.length && e.touches[0].pageY)
        || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
      ["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
        .forEach(function (eventName) {
          document.addEventListener(eventName, self._movefn);
        });
    }
    // fallthrough
    case 'mousemove':
    case 'touchmove': {
      if (self.pageY !== false) {
        var pageY = e.pageY
          || (e.touches && e.touches.length && e.touches[0].pageY)
          || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
        if (this._bottomScroll) {
          self.resize(self._contentHeight + pageY - self._pageY);
        } else {
          self.resize(self._contentHeight - pageY + self._pageY);
        }
      }
      break;
    }
    default: break;
  }
}

/** Resize the control to the map
 * @param {number} [height] the table height (if in a map sticks to the viewport height)
 */
ol_control_FeatureList.prototype.resize = function(height) {
  if (!this.getMap()) return;
  var h0 = this._list.parentNode.getBoundingClientRect().height
  // Set new height
  if (height !== undefined) {
    this._list.parentNode.style.height = height + 'px';
  }
  // Prevent getting out of the map
  if (this.element.dataset.control) {
    var h = this.getMap().getTargetElement().getBoundingClientRect().height 
      - this._head.getBoundingClientRect().height;
    this._list.parentNode.style.maxHeight = Math.min(h, this._list.getBoundingClientRect().height)  + 'px';
  }
  // Has changed?
  if (h0 !== this._list.parentNode.getBoundingClientRect().height) {
    this.dispatchEvent({
      type: 'resize',
      height: this._list.parentNode.getBoundingClientRect().height
    })
  }
}

/** Get the current selection in the list
 * @returns {ol_Feature} 
 */
ol_control_FeatureList.prototype.getSelection = function() {
  if (this._curSelection) {
    return this._curSelection.feature || null;
  }
  return null;
}

/** Select a feature in the list
 * @param {ol_Feature} [feature] if none remove selection
 * @param {boolean} [noScroll=false] prevent scrolling to the selected row
 */
ol_control_FeatureList.prototype.select = function(feature, noScroll) {
  // Remove previous
  if (this._curSelection) {
    this._curSelection.tr.classList.remove('ol-selected');
  }
  this._curSelection = null;
  // New selection
  if (feature) {
    if (noScroll) {
      var f = this._findInPage(feature)
      this._curSelection = {
        feature: feature,
        tr: f ? f.tr : ol_ext_element.create('TR')
      };
    } else {
      this._curSelection = this.scrollTo(feature)
    }
  }
  if (this._curSelection) {
    this._curSelection.tr.classList.add('ol-selected');
  }
}

/** Add a button to the list header menu
 * @param {Object} options
 *  @param {string} className
 *  @param {string} [title]
 *  @param {string} [html]
 *  @param {function} click on click function
 * @returns {Element}
 */
ol_control_FeatureList.prototype.addButton = function(options) {
  return ol_ext_element.create('BUTTON', {
    className: options.className,
    title: options.title || '',
    html: options.html || '',
    click: options.click,
    parent: this._menu.querySelector('.ol-buttons')
  })
}

export default ol_control_FeatureList