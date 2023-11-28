import ol_geom_Geometry from 'ol/geom/Geometry'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element';

/** Feature list control
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires resize
 * @param {Object=} options
 */
var ol_control_FeatureList = class olcontrolFeatureList extends ol_control_Control {
  constructor(options) {
    // Control element
    var element = ol_ext_element.create('DIV', {
      className: ((options.className || '') + ' ol-feature-list').trim()
    })
    if (options.collapsed !== false) {
      element.classList.add('ol-collapsed')
    }
    if (!options.target) {
      element.classList.add('ol-unselectable');
      element.classList.add('ol-control');
      element.dataset.control = 1;
    }

    super({
      element: element,
      target: options.target
    });

    // Enable sort
    this._canSort = [];
    this._sort = {};

    // Button
    if (!options.target) {
      ol_ext_element.create('BUTTON', {
        type: 'button',
        click: function() {
          element.classList.toggle('ol-collapsed');
        },
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
        html: '<i></i>',
        type: 'button',
        click: function() {
          element.classList.toggle('ol-collapsed');
        },
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
  this._drawList();
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
  this._drawList();
}

/** Enable sort list by properties
 * @param {...string} propName 
 */
ol_control_FeatureList.prototype.enableSort = function() {
  this._canSort = [...arguments];
  Object.keys(this._sort).forEach(function(s) {
    if (this._canSort.indexOf(s) < 0) delete this._sort[s];
  }.bind(this))
  this._drawList();
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
  // Columns
  var columns = this.getColumns(features);
  // Head
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
  // List
  var body = this._listbody
  this._listbody.innerHTML = '';
  this._listFeatures = [];
  features.forEach(function (f) {
    var tr = ol_ext_element.create('TR', {
      click: function (e) {
        this.dispatchEvent({
          type: 'select',
          property: e.target.dataset.prop,
          feature: f
        })
        body.querySelectorAll('.ol-selected').forEach(function(li) {
          li.classList.remove('ol-selected')
        })
        tr.classList.add('ol-selected')
      }.bind(this),
    })
    this._listFeatures.push({
      feature: f,
      tr: tr
    })
    columns.forEach(function(c) {
      var p = this.formatProperty(f, c);
      ol_ext_element.create('TD', {
        text: p.val,
        html: p.html,
        className: p.type,
        'data-prop': c,
        parent: tr
      })
    }.bind(this))
  }.bind(this))
  // Sort
  var sort = Object.keys(this._sort)
  if (sort.length) {
    this._listFeatures.sort(function(a, b) {
      for (let i=0; i<sort.length; i++) {
        var p = sort[i];
        var v1 = a.feature.get(p) || '';
        var v2 = b.feature.get(p) || '';
        if (v1 < v2) return this._sort[p] ? -1 : 1;
        if (v1 > v2) return this._sort[p] ? 1 : -1;
      }
      return 0;
    }.bind(this));
  }
  this._listFeatures.forEach(function(l) {
    body.appendChild(l.tr)
  })
  // resize
  this.resize();
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
  var columns = this._columns || [];
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
  this._columns = columns || [];
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
      console.log(self._contentHeight)
      self._pageY =  e.pageY
        || (e.touches && e.touches.length && e.touches[0].pageY)
        || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);;
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
        self.resize(self._contentHeight - pageY + self._pageY);
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
  this.dispatchEvent({
    type: 'resize',
    height: this._list.parentNode.getBoundingClientRect().height
  })
}

/** Select a feature in the list
 * @param {ol_Feature} feature
 */
ol_control_FeatureList.prototype.select = function(feature) {
  var list = this._listFeatures;
  if (list) {
    for (let i=0; i<list.length; i++) {
      if (list[i].feature === feature) {
        this._listbody.querySelectorAll('.ol-selected').forEach(function(li) { li.classList.remove('ol-selected') })
        list[i].tr.classList.add('ol-selected')
        this._list.parentNode.scrollTo(this._list.parentNode.scrollLeft, list[i].tr.offsetTop - this._list.parentNode.getBoundingClientRect().height/2)
        break;
      }
    }
  }
}

/** Add a button to the list header
 * @param {Object} options
 *  @param {string} className
 *  @param {string} [title]
 *  @param {string} [html]
 *  @param {function} click on click function
 */
ol_control_FeatureList.prototype.addButton = function(options) {
  ol_ext_element.create('BUTTON', {
    className: options.className,
    title: options.title,
    html: options.html || '<i></i>',
    click: options.click,
    parent: this._menu.querySelector('.ol-buttons')
  })
}

export default ol_control_FeatureList