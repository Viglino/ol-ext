import ol_geom_Geometry from 'ol/geom/Geometry'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element';

/** Feature list control
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires dblclick
 * @fires resize
 * @param {Object=} options
 */
var ol_control_FeatureList = class olcontrolFeatureList extends ol_control_Control {
  constructor(options) {
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
    this.collapse(!!options.collapsed);
    this._bottomScroll = element.classList.contains('ol-bottom');

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
        parent: content
      })
    });
    this._head = ol_ext_element.create('THEAD', {
      parent: list
    })
    this._listbody = ol_ext_element.create('TBODY', {
      parent: list
    })

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

/** Scroll at botton
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
 * @param {ol_Feature|string} feature a featue or 'select' to scroll at selected row
 */
ol_control_FeatureList.prototype.scrollTo = function(feature) {
  if (feature === 'select') {
    var tr = this._listbody.querySelector('.ol-selected');
    if (tr) {
      this._scrollAt(tr);
      return tr;
    }
  } else {
    // Select
    var list = this._listFeatures;
    if (list) {
      for (let i=0; i<list.length; i++) {
        if (list[i].feature === feature) {
          this._scrollAt(list[i].tr);
          return list[i].tr
        }
      }
    }
  }
  return false;
}

/** Scroll list at a row
 * @param {Element} elt row element (TR)
 * @private
 */
ol_control_FeatureList.prototype._scrollAt = function(elt) {
  if (this.isCollapsed()) return;
  if (!elt || elt.parentNode.parentNode !== this._list) return;
  // Scroll
  var scrollDiv = this._list.parentNode;
  scrollDiv.scrollTo(scrollDiv.scrollLeft, elt.offsetTop - scrollDiv.getBoundingClientRect().height/2)
}

/** Find a row given a feature
 * @param {ol_Feature} feature
 */
ol_control_FeatureList.prototype._findRow = function(feature) {
  var list = this._listFeatures;
  if (list) {
    for (let i=0; i<list.length; i++) {
      if (list[i].feature === feature) {
        return list[i];
      }
    }
  }
  return false
}

/** Collapse the table
 * @param {boolean} [b] if no parameters toggle it
 */
ol_control_FeatureList.prototype.collapse = function(b) {
  if (b === undefined) b = !this._collapsed;
  if (b!==this._collapsed) {
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
  }
}

/** Is the control collapsed
 */
ol_control_FeatureList.prototype.isCollapsed = function() {
  return this._collapsed;
}

/** Set the features to list
 * @param {ol_source_Vector|ol_Collection} source a vector source or a collection of features to list
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
  this.sort();
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

/** Enable sort list by properties
 * @param {...string} propName 
 */
ol_control_FeatureList.prototype.enableSort = function() {
  this._canSort = [...arguments];
  Object.keys(this._sort).forEach(function(s) {
    if (this._canSort.indexOf(s) < 0) {
      changed = true;
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
    var tr = ol_ext_element.create('TR', {
      on: {
        click: function (e) {
          this.dispatchEvent({
            type: 'select',
            property: e.target.dataset.prop,
            feature: f
          })
          this._list.querySelectorAll('.ol-selected').forEach(function(li) {
            li.classList.remove('ol-selected')
          })
          tr.classList.add('ol-selected')
        }.bind(this),
        dblclick: function(e) {
          this.dispatchEvent({
            type: 'dblclick',
            property: e.target.dataset.prop,
            feature: f
          })
        }.bind(this)
      }
    })
    this._listFeatures.push({
      feature: f,
      tr: tr
    })
    this._updateFeature(f, tr);
  }.bind(this))
  // Sort
  this.sort();
}

/** Update a feature line in the table (attribute changed)
 * @param {ol_Feature} feature
 * @returns {boolean}
 */
ol_control_FeatureList.prototype.updateFeature = function(feature) {
  for (var i=0; i<this._listFeatures.length; i++) {
    if (this._listFeatures[i].feature === feature) {
      this._updateFeature(this._listFeatures[i].feature, this._listFeatures[i].tr)
      return true;
    }
  }
  return false;
}

/** Update a feature line in the table
 * @param {ol_Feature} feature
 * @param {Element} tr
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

/** Sort the list of features
 */
ol_control_FeatureList.prototype.sort = function() {
  var sort = Object.keys(this._sort)
  if (sort.length) {
    this._listFeatures.sort(function(a, b) {
      for (let i=0; i<sort.length; i++) {
        var p = sort[i];
        var s = this.sortFn(a.feature, b.feature, p);
        if (s) return this._sort[p] ? s : -s;
      }
      return 0;
    }.bind(this));
  }
  // Refresh list
  this.refresh()
}

/** Refresh the list
 */
ol_control_FeatureList.prototype.refresh = function() {
  // Draw Head
  this._drawHead();
  // Draw list
  this._listbody.innerHTML = '';
  this._listFeatures.forEach(function(l) {
    this._listbody.appendChild(l.tr)
  }.bind(this))
  // resize
  this.resize();
}

/** A sort function to compare 2 properties
 * @param {ol_Feature} f1
 * @param {ol_Feature} f2
 * @param {string} prop property name
 * @return number -1: v1 < v2, 1: v1 > v2, 0: v1 = v2
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
 * @param {Array<ol_Feature>} [features] a list of features to retrieve columns (if no columns defined by setColumns)
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
 * @param {number} [height] 
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
    //this._list.parentNode.style.minHeight = Math.min(100, this._list.getBoundingClientRect().height)  + 'px';
  }
  var h = this._list.parentNode.getBoundingClientRect().height;
  if (h !== h0) {
    this.dispatchEvent({
      type: 'resize',
      height: this._list.parentNode.getBoundingClientRect().height
    })
  }
}

/** Select a feature in the list
 * @param {ol_Feature} [feature] if none remove selection
 * @param {boolean} [noScroll=false] prevent scrolling to the selected row
 */
ol_control_FeatureList.prototype.select = function(feature, noScroll) {
  this._listbody.querySelectorAll('.ol-selected').forEach(function(li) {
    li.classList.remove('ol-selected') 
  })
  if (!noScroll && feature) {
    var tr = this.scrollTo(feature)
    if (tr) {
      tr.classList.add('ol-selected');
    }
  }
}

/** Add a button to the list header
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