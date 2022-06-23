/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_Feature from 'ol/Feature'
import ol_ext_inherits from '../util/ext'
import ol_Overlay_Popup from './Popup'
import ol_ext_element from '../util/element'


/** Template attributes for popup
 * @typedef {Object} TemplateAttributes
 * @property {string} title
 * @property {function} format a function that takes an attribute and a feature and returns the formated attribute
 * @property {string} before string to instert before the attribute (prefix)
 * @property {string} after string to instert after the attribute (sudfix)
 * @property {boolean|function} visible boolean or a function (feature, value) that decides the visibility of a attribute entry
 */

/** Template 
 * @typedef {Object} Template
 * @property {string|function} title title of the popup, attribute name or a function that takes a feature and returns the title
 * @property {Object.<TemplateAttributes>} attributes a list of template attributes 
 */

/**
 * A popup element to be displayed on a feature.
 *
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @fires show
 * @fires hide
 * @fires select
 * @param {} options Extend Popup options 
 *  @param {String} options.popupClass the a class of the overlay to style the popup.
 *  @param {bool} options.closeBox popup has a close box, default false.
 *  @param {function|undefined} options.onclose: callback function when popup is closed
 *  @param {function|undefined} options.onshow callback function when popup is shown
 *  @param {Number|Array<number>} options.offsetBox an offset box
 *  @param {ol.OverlayPositioning | string | undefined} options.positionning 
 *    the 'auto' positioning var the popup choose its positioning to stay on the map.
 *  @param {Template|function} [options.template] A template with a list of properties to use in the popup or a function that takes a feature and returns a Template, default use all feature properties
 *  @param {ol.interaction.Select} options.select a select interaction to get features from
 *  @param {boolean} options.keepSelection keep original selection, otherwise set selection to the current popup feature and add a counter to change current feature, default false
 *  @param {boolean} options.canFix Enable popup to be fixed, default false
 *  @param {boolean} options.showImage display image url as image, default false
 *  @param {boolean} options.maxChar max char to display in a cell, default 200
 *  @api stable
 */
var ol_Overlay_PopupFeature = function (options) {
  options = options || {};

  ol_Overlay_Popup.call(this, options);

  this.setTemplate(options.template);
  this.set('canFix', options.canFix)
  this.set('showImage', options.showImage)
  this.set('maxChar', options.maxChar||200)
  this.set('keepSelection', options.keepSelection)

  // Bind with a select interaction
  if (options.select && (typeof options.select.on ==='function')) {
    this._select = options.select;
    options.select.on('select', function(e){
      if (!this._noselect) {
        if (e.selected[0]) {
          this.show(e.mapBrowserEvent.coordinate, options.select.getFeatures().getArray(), e.selected[0]);
        } else {
          this.hide();
        }
      }
    }.bind(this));
  }
};
ol_ext_inherits(ol_Overlay_PopupFeature, ol_Overlay_Popup);

/** Set the template
 * @param {Template} [template] A template with a list of properties to use in the popup, default use all features properties
 */
ol_Overlay_PopupFeature.prototype.setTemplate = function(template) {
  if (!template) {
    template = function(f) {
      var prop = f.getProperties();
      delete prop[f.getGeometryName()];
      return {
        attributes: Object.keys(prop)
      }
    }
  }
  this._template = template;
  this._attributeObject(this._template);
}

/**
 * @private
 */
 ol_Overlay_PopupFeature.prototype._attributeObject = function (temp) {
  if (temp && temp.attributes instanceof Array) {
    var att = {};
    temp.attributes.forEach(function (a) {
      att[a] = true;
    });
    temp.attributes = att;
  }
  return temp.attributes;
};

/** Show the popup on the map
 * @param {ol.coordinate|undefined} coordinate Position of the popup
 * @param {ol.Feature|Array<ol.Feature>} features The features on the popup
 * @param {ol.Feature} current The current feature if keepSelection = true, otherwise get the first feature
 */
ol_Overlay_PopupFeature.prototype.show = function(coordinate, features, current) {
  if (coordinate instanceof ol_Feature 
    || (coordinate instanceof Array && coordinate[0] instanceof ol_Feature)) {
    features = coordinate;
    coordinate = null;
  }
  if (!(features instanceof Array)) features = [features];
  this._features = features.slice();
  if (!this._count) this._count = 1;

  // Calculate html upon feaures attributes
  this._count = 1;
  var f = this.get('keepSelection') ? current || features[0] : features[0];
  var html = this._getHtml(f);
  if (html) {
    if (!this.element.classList.contains('ol-fixed')) this.hide();
    if (!coordinate || features[0].getGeometry().getType()==='Point') {
      coordinate = features[0].getGeometry().getFirstCoordinate();
    }
    ol_Overlay_Popup.prototype.show.call(this, coordinate, html);
  } else {
    this.hide();
  }
};

/**
 * @private
 */
ol_Overlay_PopupFeature.prototype._getHtml = function(feature) {
  if (!feature) return '';
  var html = ol_ext_element.create('DIV', { className: 'ol-popupfeature' });
  if (this.get('canFix')) {
    ol_ext_element.create('I', { className:'ol-fix', parent: html })
      .addEventListener('click', function(){
        this.element.classList.toggle('ol-fixed');
      }.bind(this));
  }
  var template = this._template;
  // calculate template
  if (typeof(template) === 'function') {
    template = template(feature, this._count, this._features.length);
  } else if (!template || !template.attributes) {
    template = template || {};
    template. attributes = {};
    for (var i in feature.getProperties()) if (i!='geometry') {
      template.attributes[i] = i;
    }
  }  
  // Display title
  if (template.title) {
    var title;
    if (typeof template.title === 'function') {
      title = template.title(feature);
    } else {
      title = feature.get(template.title);
    }
    ol_ext_element.create('H1', { html:title, parent: html });
  }
  // Display properties in a table
  if (template.attributes) {
    var tr, table = ol_ext_element.create('TABLE', { parent: html });
    var atts = this._attributeObject(template);
    var featureAtts = feature.getProperties();
    for (var att in atts) {
      if (featureAtts.hasOwnProperty(att)) {
        var a = atts[att];
        var content, val = featureAtts[att];
        // Get calculated value
        if (typeof(a.format)==='function') {
          val = a.format(val, feature);
        }

        // Is entry visible?
        var visible = true;
        if (typeof(a.visible)==='boolean') {
          visible = a.visible;
        } else if (typeof(a.visible)==='function') {
          visible = a.visible(feature, val);
        }

        if (visible) {
          tr = ol_ext_element.create('TR', { parent: table });
          ol_ext_element.create('TD', { html: a.title || att, parent: tr });

          // Show image or content
          if (this.get('showImage') && /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/.test(val)) {
            content = ol_ext_element.create('IMG',{
              src: val
            });
          } else {
            content = (a.before||'') + val + (a.after||'');
            var maxc = this.get('maxChar') || 200;
            if (typeof(content) === 'string' && content.length>maxc) content = content.substr(0,maxc)+'[...]';
          }

          // Add value
          ol_ext_element.create('TD', {
            html: content,
            parent: tr
          });
        }
      }
    }
  }
  // Zoom button
  ol_ext_element.create('BUTTON', { className: 'ol-zoombt', parent: html })
    .addEventListener('click', function() {
      if (feature.getGeometry().getType()==='Point') {
        this.getMap().getView().animate({
          center: feature.getGeometry().getFirstCoordinate(),
          zoom:  Math.max(this.getMap().getView().getZoom(), 18)
        });
      } else  {
        var ext = feature.getGeometry().getExtent();
        this.getMap().getView().fit(ext, { duration:1000 });
      }
    }.bind(this));

  // Counter
  if (!this.get('keepSelection') && this._features.length > 1) {
    var div = ol_ext_element.create('DIV', { className: 'ol-count', parent: html });
    ol_ext_element.create('DIV', { 
      className: 'ol-prev', 
      parent: div,
      click: function() {
        this._count--;
        if (this._count<1) this._count = this._features.length;
        html = this._getHtml(this._features[this._count-1]);
        setTimeout(function() { 
          ol_Overlay_Popup.prototype.show.call(this, this.getPosition(), html); 
        }.bind(this), 350 );
      }.bind(this)
    });
    ol_ext_element.create('TEXT', { html:this._count+'/'+this._features.length, parent: div });
    ol_ext_element.create('DIV', { 
      className: 'ol-next', 
      parent: div,
      click: function() {
        this._count++;
        if (this._count>this._features.length) this._count = 1;
        html = this._getHtml(this._features[this._count-1]);
        setTimeout(function() { 
          ol_Overlay_Popup.prototype.show.call(this, this.getPosition(), html); 
        }.bind(this), 350 );
      }.bind(this)
    });
  }
  // Use select interaction
  if (this._select && !this.get('keepSelection')) {
    this._noselect = true;
    this._select.getFeatures().clear();
    this._select.getFeatures().push(feature);
    this._noselect = false;
  }
  this.dispatchEvent({ type: 'select', feature: feature, index: this._count })
  return html;
};

/** Fix the popup
 * @param {boolean} fix
 */
ol_Overlay_PopupFeature.prototype.setFix = function (fix) {
  if (fix) this.element.classList.add('ol-fixed');
  else this.element.classList.remove('ol-fixed');
};

/** Is a popup fixed
 * @return {boolean} 
 */
ol_Overlay_PopupFeature.prototype.getFix = function () {
  return this.element.classList.contains('ol-fixed');
};

/** Get a function to use as format to get local string for an attribute
 * if the attribute is a number: Number.toLocaleString()
 * if the attribute is a date: Date.toLocaleString()
 * otherwise the attibute itself
 * @param {string} locales string with a BCP 47 language tag, or an array of such strings
 * @param {*} options Number or Date toLocaleString options
 * @return {function} a function that takes an attribute and return the formated attribute
 */
var ol_Overlay_PopupFeature_localString = function (locales , options) {
  return function (a) {
    if (a && a.toLocaleString) {
      return a.toLocaleString(locales , options);
    } else {
      // Try to get a date from a string
      var date = new Date(a);
      if (isNaN(date)) return a;
      else return date.toLocaleString(locales , options);
    }
  };
};

export {ol_Overlay_PopupFeature_localString}
export default ol_Overlay_PopupFeature
