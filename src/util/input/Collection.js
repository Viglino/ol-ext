import ol_Object from 'ol/Object';
import ol_ext_element from '../element'
import ol_ext_inherits from '../ext';

/** A list element synchronize with a Collection. 
 * Element in the list can be reordered interactively and the associated Collection is kept up to date.
 * @constructor
 * @fires item:select
 * @fires item:dblclick
 * @fires item:order
 * @extends {ol_Object}
 * @param {*} options
 *  @param {Element} [options.target] 
 *  @param {Collection} [options.collection]  the collection to display in the list
 *  @param {function} [options.getTitle] a function that takes a collection item and returns an Element or a string
 */
var ol_ext_input_Collection = function(options) {
  ol_Object.call(this);
  this.element = ol_ext_element.create('UL', {
    className: ('ol-collection-list '+(options.className||'')).trim(),
    parent: options.target
  })
  this.collection = options.collection;
  this._title = (typeof(options.getTitle) === 'function' ? options.getTitle : function(elt) { return elt.title });
  this.refresh();
  this.collection.on('change:length', function() { 
    if (!this._reorder) {
      this.refresh();
      var pos = this.getSelectPosition();
      if (pos < 0) {
        this.dispatchEvent({ type: 'item:select', position: -1, item: null });
      } else {
        this.dispatchEvent({ type: 'item:order', position: pos, item: this._currentItem });
      }
    }
  }.bind(this));
};
ol_ext_inherits(ol_ext_input_Collection, ol_Object);

/** Select an item
 * @param {*} item
 */
ol_ext_input_Collection.prototype.select = function(item) {
  if (item === this._currentItem) return;
  var pos = -1;
  this._listElt.forEach(function (l, i) {
    if (l.item !== item) {
      l.li.classList.remove('ol-select');
    } else {
      l.li.classList.add('ol-select');
      pos = i;
    }
  })
  this._currentItem = (pos >= 0 ? item : null);
  this.dispatchEvent({ type: 'item:select', position: pos, item: this._currentItem });
};

/** Select an item at
 * @param {number} n
 */
ol_ext_input_Collection.prototype.selectAt = function(n) {
  this.select(this.collection.item(n));
};

/** Get current selection
 * @returns {*}
 */
ol_ext_input_Collection.prototype.getSelect = function() {
  return this._currentItem;
};

/** Get current selection
 * @returns {number}
 */
ol_ext_input_Collection.prototype.getSelectPosition = function() {
  return this.collection.getArray().indexOf(this._currentItem);
};

/** Redraw the list
 */
ol_ext_input_Collection.prototype.refresh = function() {
  this.element.innerHTML = '';
  this._listElt = [];

  this.collection.forEach((item, pos) => {
    var li = ol_ext_element.create('LI', {
      html: this._title(item),
      className: this._currentItem === item ? 'ol-select' : '',
      'data-position': pos,
      on: {
        click: function() {
          this.select(item);
        }.bind(this),
        dblclick: function() {
          this.dispatchEvent({ type: 'item:dblclick', position: pos, item: item });
        }.bind(this),
      },
      parent: this.element
    });
    this._listElt.push({ li: li, item: item });
    var order = ol_ext_element.create('DIV', {
      className: 'ol-noscroll ol-order',
      parent: li
    });
    var current = pos;
    var move = function(e) {
      // Get target
      var target = e.pointerType==='touch' ? document.elementFromPoint(e.clientX, e.clientY) : e.target;
      while (target && target.parentNode !== this.element) {
        target = target.parentNode;
      }
      if (target && target !== li) {
        var over = parseInt(target.getAttribute('data-position'));
        if (target.getAttribute('data-position') < current) {
          target.insertAdjacentElement('beforebegin', li);
          current = over;
        } else {
          target.insertAdjacentElement('afterend', li);
          current = over+1;
        }
      }
    }.bind(this);
    var stop = function() {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', stop);
      document.removeEventListener('pointercancel', stop);
      if (current !== pos) {
        this._reorder = true;
        this.collection.removeAt(pos);
        this.collection.insertAt(current>pos ? current-1 : current, item);
        this._reorder = false;
        this.dispatchEvent({ type: 'item:order', position: current>pos ? current-1 : current, oldPosition: pos, item: item })
        this.refresh();
      }
    }.bind(this);
    order.addEventListener('pointerdown', function() {
      this.select(item)
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop)
      document.addEventListener('pointercancel', stop)
    }.bind(this));
  });
}

export default ol_ext_input_Collection