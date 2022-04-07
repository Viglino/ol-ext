/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Control from 'ol/control/Control'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_ext_inherits from '../util/ext'
import ol_ext_element from '../util/element'
import ol_control_Dialog from './Dialog'
import ol_control_Legend from './Legend'
import ol_control_Print from './Print'
import ol_control_CanvasTitle from './CanvasTitle'
import {getMapScale as ol_sphere_getMapScale} from '../geom/sphere'
import {setMapScale as ol_sphere_setMapScale} from '../geom/sphere'
import ol_control_Compass from './Compass';

/** Print control to get an image of the map
 * @constructor
 * @fire show
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {string} options.className class of the control
 *	@param {String} options.title button title
 *  @param {string} [options.lang=en] control language, default en
 *	@param {string} options.imageType A string indicating the image format, default image/jpeg
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
 *	@param {boolean} options.immediate force print even if render is not complete,  default false
 *	@param {boolean} [options.openWindow=false] open the file in a new window on print
 *	@param {boolean} [options.copy=true] add a copy select option
 *	@param {boolean} [options.print=true] add a print select option
 *	@param {boolean} [options.pdf=true] add a pdf select option
 *	@param {function} [options.saveAs] a function to save the image as blob
 *	@param {*} [options.jsPDF] jsPDF object to save map as pdf
 */
var ol_control_PrintDialog = function(options) {
  if (!options) options = {};
  this._lang = options.lang || 'en';

  var element = ol_ext_element.create('DIV', {
    className: (options.className || 'ol-print') + ' ol-unselectable ol-control'
  });
  ol_ext_element.create('BUTTON', {
    type: 'button',
    title: options.title || 'Print',
    click: function() { 
      this.print(); 
    }.bind(this),
    parent: element
  });
  ol_control_Control.call(this, {
    element: element
  });
  // Open in a new window
  if (options.openWindow) {
    this.on('print', function(e) {
      // Print success
      if (e.canvas) {
        window.open().document.write('<img src="'+e.canvas.toDataURL()+'"/>');
      }
    });
  }
  
  // Print control
  options.target = ol_ext_element.create('DIV');
  var printCtrl = this._printCtrl = new ol_control_Print(options);
  printCtrl.on(['print','error','printing'], function(e) {
    content.setAttribute('data-status', e.type);
    if (!e.clipboard) {
      this.dispatchEvent(e);
    }
  }.bind(this));

  // North arrow
  this._compass = new ol_control_Compass({ 
    src: options.northImage || 'compact', 
    visible: false, 
    className: 'olext-print-compass',
    style: new ol_style_Stroke({ color: '#333', width: 0 })
  });

  // Print dialog
  var printDialog = this._printDialog = new ol_control_Dialog({
    target: document.body,
    closeBox: true,
    className: 'ol-ext-print-dialog'
  });
  var content = printDialog.getContentElement();
  this._input = {};
  var param = ol_ext_element.create('DIV',{
    className: 'ol-print-param',
    parent: content
  });
  this._pages = [ ol_ext_element.create('DIV', { 
    className: 'ol-page'
  })];
  var printMap = ol_ext_element.create('DIV', {
    className: 'ol-map',
    parent: this._pages[0]
  });
  ol_ext_element.create('DIV', {
    html: this._pages[0],
    className: 'ol-print-map',
    parent: content
  });
  ol_ext_element.create('H2',{
    html: this.i18n('title'),
    parent: param
  });
  var ul = ol_ext_element.create('UL',{ parent: param });

  // Orientation
  var li = ol_ext_element.create('LI', { 
    /*
    html: ol_ext_element.create('LABEL', {
      html: this.18n('orientation')
    }),
    */
    className: 'ol-orientation',
    parent: ul 
  });

  this._input.orientation = { list: li };
  var label = ol_ext_element.create('LABEL', {
    className: 'portrait',
    parent: li
  });
  this._input.orientation.portrait = ol_ext_element.create('INPUT', {
    type: 'radio',
    name: 'ol-print-orientation',
    value: 'portrait',
    checked: true,
    on: { change: function(e) { 
      this.setOrientation(e.target.value);
    }.bind(this) },
    parent: label
  });
  ol_ext_element.create('SPAN', { 
    html: this.i18n('portrait'),
    parent: label
  });

  label = ol_ext_element.create('LABEL', {
    className: 'landscape',
    parent: li
  });
  this._input.orientation.landscape = ol_ext_element.create('INPUT',{
    type: 'radio',
    name: 'ol-print-orientation',
    value: 'landscape',
    on: { change: function(e) { 
      this.setOrientation(e.target.value);
    }.bind(this) },
    parent: label
  });
  ol_ext_element.create('SPAN', { 
    html: this.i18n('landscape'),
    parent: label 
  });

  // Page size
  var s; 
  li = ol_ext_element.create('LI',{ 
    html: ol_ext_element.create('LABEL', {
      html: this.i18n('size'),
    }),
    className: 'ol-size',
    parent: ul 
  });
  var size = this._input.size = ol_ext_element.create('SELECT', {
    on: { change: function(){
      this.setSize(size.value || originalSize);
    }.bind(this) },
    parent: li
  });
  for (s in this.paperSize) {
    ol_ext_element.create('OPTION', {
      html: s + (this.paperSize[s] ? ' - '+this.paperSize[s][0]+'x'+this.paperSize[s][1]+' mm' : this.i18n('custom')),
      value: s,
      parent: size
    });
  }

  // Margin
  li = ol_ext_element.create('LI',{ 
    html: ol_ext_element.create('LABEL', {
      html: this.i18n('margin'),
    }),
    className: 'ol-margin',
    parent: ul 
  });
  var margin = this._input.margin = ol_ext_element.create('SELECT', {
    on: { change: function(){
      this.setMargin(margin.value);
    }.bind(this) },
    parent: li
  });
  for (s in this.marginSize) {
    ol_ext_element.create('OPTION', {
      html: this.i18n(s) + ' - ' + this.marginSize[s] + ' mm',
      value: this.marginSize[s],
      parent: margin
    });
  }

  // Scale
  li = ol_ext_element.create('LI',{ 
    html: ol_ext_element.create('LABEL', {
      html: this.i18n('scale'),
    }),
    className: 'ol-scale',
    parent: ul 
  });
  var scale = this._input.scale = ol_ext_element.create('SELECT', {
    on: { change: function() {
      this.setScale(parseInt(scale.value))
    }.bind(this) },
    parent: li
  });
  Object.keys(this.scales).forEach(function(s) {
    ol_ext_element.create('OPTION', {
      html: this.scales[s],
      value: s,
      parent: scale
    });
  }.bind(this));

  // Legend
  li = ol_ext_element.create('LI',{ 
    className: 'ol-legend',
    parent: ul 
  });
  var legend = ol_ext_element.createSwitch({ 
    html: (this.i18n('legend')),
    checked: false,
    on: { change: function() {
      extraCtrl.legend.control.setCanvas(legend.checked);
    }.bind(this) },
    parent: li 
  });

  // North
  li = ol_ext_element.create('LI',{ 
    className: 'ol-print-north',
    parent: ul 
  });
  var north = this._input.north = ol_ext_element.createSwitch({ 
    html: this.i18n('north'),
    checked: 'checked',
    on:  { change: function() {
      if (north.checked) this._compass.element.classList.add('ol-print-compass');
      else this._compass.element.classList.remove('ol-print-compass');
      this.getMap().render();
    }.bind(this)},
    parent: li 
  });

  // Title
  li = ol_ext_element.create('LI',{ 
    className: 'ol-print-title',
    parent: ul 
  });
  var title = ol_ext_element.createSwitch({ 
    html: this.i18n('mapTitle'),
    checked: false,
    on: { change: function(e) {
      extraCtrl.title.control.setVisible(e.target.checked);
    }.bind(this) },
    parent: li 
  });
  var titleText = ol_ext_element.create('INPUT', {
    type: 'text',
    placeholder: this.i18n('mapTitle'),
    on: {
      keydown: function(e) { 
        if (e.keyCode === 13) e.preventDefault();
      },
      keyup: function() { 
        extraCtrl.title.control.setTitle(titleText.value);
      },
      change: function() {
        extraCtrl.title.control.setTitle(titleText.value);
      }.bind(this)
    },
    parent: li
  });
  
  // User div element
  var userElt = ol_ext_element.create('DIV', {
    className: 'ol-user-param',
    parent: param
  });

  // Save as
  li = ol_ext_element.create('LI',{ 
    className: 'ol-saveas',
    parent: ul 
  });
  var copied = ol_ext_element.create('DIV', {
    html: this.i18n('copied'),
    className: 'ol-clipboard-copy',
    parent: li
  });
  var save = ol_ext_element.create('SELECT', {
    on: { change: function() {
      // Copy to clipboard
      if (this.formats[save.value].clipboard) {
        printCtrl.copyMap(this.formats[save.value], function(isok) {
          if (isok) {
            copied.classList.add('visible');
            setTimeout(function() { copied.classList.remove('visible'); }, 1000);
          }
        });
      } else {
        // Print to file
        var format = (typeof(this.getSize())==='string' ? this.getSize() : null);
        var opt = Object.assign({
          format: format,
          size: format ? this.paperSize[format] : null,
          orient: this.getOrientation(),
          margin: this.getMargin(),
        }, this.formats[save.value]);
        printCtrl.print(opt);
      }
      save.value = '';
    }.bind(this) },
    parent: li
  });
  ol_ext_element.create('OPTION', {
    html: this.i18n('saveas'),
    style: { display: 'none' },
    value: '',
    parent: save
  });
  this.formats.forEach(function(format, i) {
    if (format.pdf) {
      if (options.pdf === false) return;
    } else if (format.clipboard) {
      if (options.copy === false) return;
    } else if (options.save === false) {
      return;
    }
    ol_ext_element.create('OPTION', {
      html: this.i18n(format.title),
      value: i,
      parent: save
    });
  }.bind(this));

  // Save Legend
  li = ol_ext_element.create('LI',{ 
    className: 'ol-savelegend',
    parent: ul 
  });
  var copylegend = ol_ext_element.create('DIV', {
    html: this.i18n('copied'),
    className: 'ol-clipboard-copy',
    parent: li
  });
  var saveLegend = ol_ext_element.create('SELECT', {
    on: { change: function() {
      // Print canvas (with white background)
      var clegend = extraCtrl.legend.control.getLegend().getCanvas();
      var canvas = document.createElement('CANVAS');
      canvas.width = clegend.width;
      canvas.height = clegend.height;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(clegend, 0, 0);

      // Copy to clipboard
      if (this.formats[saveLegend.value].clipboard) {
        canvas.toBlob(function(blob) {
          try {
            navigator.clipboard.write([
              new window.ClipboardItem(
                Object.defineProperty({}, blob.type, {
                  value: blob,
                  enumerable: true
                })
              )
            ])
            copylegend.classList.add('visible');
            setTimeout(function() { copylegend.classList.remove('visible'); }, 1000);
          } catch (err) { /* errror */ }
        }, 'image/png');
      } else {
        var image;
        try {
          image = canvas.toDataURL(this.formats[saveLegend.value].imageType, this.formats[saveLegend.value].quality);
          var format = (typeof(this.getSize())==='string' ? this.getSize() : 'A4');
          var w = canvas.width / 96 * 25.4;
          var h = canvas.height / 96 * 25.4;
          var size = this.paperSize[format];
          if (this.getOrientation()==='landscape') size = [size[1], size[0]];
          var position = [
            (size[0] - w) /2,
            (size[1] - h) /2
          ]; 
          this.dispatchEvent({
            type: 'print',
            print: {
              legend: true,
              format: format,
              orientation: this.getOrientation(),
              unit: 'mm',
              size: this.paperSize[format],
              position: position,
              imageWidth: w,
              imageHeight: h
            },
            image: image,
            imageType: this.formats[saveLegend.value].imageType,
            pdf: this.formats[saveLegend.value].pdf,
            quality: this.formats[saveLegend.value].quality,
            canvas: canvas
          })
        } catch(err) { /* error */ }
      }
      saveLegend.value = '';
    }.bind(this) },
    parent: li
  });
  ol_ext_element.create('OPTION', {
    html: this.i18n('saveLegend'),
    style: { display: 'none' },
    value: '',
    parent: saveLegend
  });
  this.formats.forEach(function(format, i) {
    ol_ext_element.create('OPTION', {
      html: this.i18n(format.title),
      value: i,
      parent: saveLegend
    });
  }.bind(this));

  // Print
  var prButtons = ol_ext_element.create('DIV', {
    className: 'ol-ext-buttons',
    parent: param
  });
  ol_ext_element.create('BUTTON', {
    html: this.i18n('printBt'),
    type: 'submit',
    click: function(e) {
      e.preventDefault();
      window.print();
    },
    parent: prButtons
  });
  ol_ext_element.create('BUTTON', {
    html: this.i18n('cancel'),
    type: 'button',
    click: function() { printDialog.hide(); },
    parent: prButtons
  });
  ol_ext_element.create('DIV', {
    html: this.i18n('errorMsg'),
    className: 'ol-error',
    parent: param
  });

  // Handle dialog show/hide
  var originalTarget;
  var originalSize;
  var scalelistener;
  var extraCtrl = {};
  printDialog.on('show', function() {
    // Dialog is showing
    this.dispatchEvent({ type: 'show', userElement: userElt, dialog: this._printDialog, page: this.getPage() });
    //
    var map = this.getMap();
    if (!map) return;
    // Print document
    document.body.classList.add('ol-print-document');
    originalTarget = map.getTargetElement();
    originalSize = map.getSize();
    if (typeof(this.getSize()) === 'string') this.setSize(this.getSize());
    else this.setSize(originalSize);
    map.setTarget(printMap);
    // Refresh on move end
    if (scalelistener) ol_Observable_unByKey(scalelistener);
    scalelistener = map.on('moveend', function() {
      this.setScale(ol_sphere_getMapScale(map));
    }.bind(this));
    this.setScale(ol_sphere_getMapScale(map));
    // Get extra controls
    extraCtrl = {};
    this.getMap().getControls().forEach(function(c) {
      if (c instanceof ol_control_Legend) {
        extraCtrl.legend = { control: c };
      }
      if (c instanceof ol_control_CanvasTitle) {
        extraCtrl.title = { control: c };
      }
      if (c instanceof ol_control_Compass) {
        if (extraCtrl.compass) {
          c.element.classList.remove('ol-print-compass')
        } else {
          if (this._input.north.checked) c.element.classList.add('ol-print-compass')
          else c.element.classList.remove('ol-print-compass')
          this._compass = c;
          extraCtrl.compass = { control: c };
        }
      }
    }.bind(this));
    // Show hide title
    if (extraCtrl.title) {
      title.checked = extraCtrl.title.isVisible = extraCtrl.title.control.getVisible();
      titleText.value = extraCtrl.title.control.getTitle();
      title.parentNode.parentNode.classList.remove('hidden');
    } else {
      title.parentNode.parentNode.classList.add('hidden');
    }
    // Show hide legend
    if (extraCtrl.legend) {
      extraCtrl.legend.ison = extraCtrl.legend.control.onCanvas();
      extraCtrl.legend.collapsed = extraCtrl.legend.control.isCollapsed();
      extraCtrl.legend.control.collapse(false);
      saveLegend.parentNode.classList.remove('hidden');
      legend.parentNode.parentNode.classList.remove('hidden');
      legend.checked = !extraCtrl.legend.collapsed;
      extraCtrl.legend.control.setCanvas(!extraCtrl.legend.collapsed);
    } else {
      saveLegend.parentNode.classList.add('hidden');
      legend.parentNode.parentNode.classList.add('hidden');
    }
  }.bind(this));

  printDialog.on('hide', function() {
    // No print
    document.body.classList.remove('ol-print-document');
    if (!originalTarget) return;
    this.getMap().setTarget(originalTarget);
    originalTarget = null;
    if (scalelistener) ol_Observable_unByKey(scalelistener);
    // restore
    if (extraCtrl.title) {
      extraCtrl.title.control.setVisible(extraCtrl.title.isVisible);
    }
    if (extraCtrl.legend) {
      extraCtrl.legend.control.setCanvas(extraCtrl.legend.ison);
      extraCtrl.legend.control.collapse(extraCtrl.legend.collapsed);
    }
    this.dispatchEvent({ type: 'hide' });
  }.bind(this));

  // Update preview on resize
  window.addEventListener('resize', function() {
    this.setSize();
  }.bind(this));

  // Save or print
  if (options.saveAs) {
    this.on('print', function(e) {
      if (!e.pdf) {
        // Save image as file
        e.canvas.toBlob(function(blob) {
          var name = (e.print.legend ? 'legend.' : 'map.')+e.imageType.replace('image/','');
          options.saveAs(blob, name);
        }, e.imageType, e.quality);
      }
    });
  }
  // Save or print
  if (options.jsPDF) {
    this.on('print', function(e) {
      if (e.pdf) {
        // Export pdf using the print info
        var pdf = new options.jsPDF({
          orientation: e.print.orientation,
          unit: e.print.unit,
          format: e.print.size
        });
        pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[0], e.print.imageWidth, e.print.imageHeight);
        pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
      } 
    });
  }
};
ol_ext_inherits(ol_control_PrintDialog, ol_control_Control);

/** Check if the dialog is oprn
 * @return {boolean}
 */
 ol_control_PrintDialog.prototype.isOpen = function() {
  return this._printDialog.isOpen();
};

/** Add a new language
 * @param {string} lang lang id
 * @param {Objetct} labels
 */
ol_control_PrintDialog.addLang = function(lang, labels) {
  ol_control_PrintDialog.prototype._labels[lang] = labels;
};

/** Translate 
 * @param {string} what
 * @returns {string}
 */
ol_control_PrintDialog.prototype.i18n = function(what) {
  var rep = this._labels.en[what] || 'bad param';
  if (this._labels[this._lang] && this._labels[this._lang][what]) {
    rep = this._labels[this._lang][what];
  }
  return rep;
};

/** Print dialog labels (for customisation) */
ol_control_PrintDialog.prototype._labels = {
  en: {
    title: 'Print',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    size: 'Page size',
    custom: 'screen size',
    margin: 'Margin',
    scale: 'Scale',
    legend: 'Legend',
    north: 'North arrow',
    mapTitle: 'Map title',
    saveas: 'Save as...',
    saveLegend: 'Save legend...',
    copied: '✔ Copied to clipboard',
    errorMsg: 'Can\'t save map canvas...',
    printBt: 'Print...',
    clipboardFormat: 'copy to clipboard...',
    jpegFormat: 'save as jpeg',
    pngFormat: 'save as png',
    pdfFormat: 'save as pdf',
    none: 'none',
    small: 'small',
    large: 'large',  
    cancel: 'cancel'
  },
  fr: {
    title: 'Imprimer',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Paysage',
    size: 'Taille du papier',
    custom: 'taille écran',
    margin: 'Marges',
    scale: 'Echelle',
    legend: 'Légende',
    north: 'Flèche du nord',
    mapTitle: 'Titre de la carte',
    saveas: 'Enregistrer sous...',
    saveLegend: 'Enregistrer la légende...',
    copied: '✔ Carte copiée',
    errorMsg: 'Impossible d\'enregistrer la carte',
    printBt: 'Imprimer',
    clipboardFormat: 'copier dans le presse-papier...',
    jpegFormat: 'enregistrer un jpeg',
    pngFormat: 'enregistrer un png',
    pdfFormat: 'enregistrer un pdf',
    none: 'aucune',
    small: 'petites',
    large: 'larges',  
    cancel: 'annuler'
  },
  de: {
    title: 'Drucken',
    orientation: 'Ausrichtung',
    portrait: 'Hochformat',
    landscape: 'Querformat',
    size: 'Papierformat',
    custom: 'Bildschirmgröße',
    margin: 'Rand',
    scale: 'Maßstab',
    legend: 'Legende',
    north: 'Nordpfeil',
    mapTitle: 'Kartentitel',
    saveas: 'Speichern als...',
    saveLegend: 'Legende speichern...',
    copied: '✔ In die Zwischenablage kopiert',
    errorMsg: 'Kann Karte nicht speichern...',
    printBt: 'Drucken...',
    clipboardFormat: 'in die Zwischenablage kopieren...',
    jpegFormat: 'speichern als jpeg',
    pngFormat: 'speichern als png',
    pdfFormat: 'speichern als pdf',
    none: 'kein',
    small: 'klein',
    large: 'groß',  
    cancel: 'abbrechen'
  },
  zh:{
    title: '打印',
    orientation: '方向',
    portrait: '纵向',
    landscape: '横向',
    size: '页面大小',
    custom: '屏幕大小',
    margin: '外边距',
    scale: '尺度',
    legend: '图例',
    north: '指北针',
    mapTitle: '地图名字',
    saveas: '保存为...',
    saveLegend: '保存图例为...',
    copied: '✔ 已复制到剪贴板',
    errorMsg: '无法保存地图...',
    printBt: '打印...',
    cancel: '取消'
  }
};

/** List of paper size */
ol_control_PrintDialog.prototype.paperSize = {
  '': null,
  'A0': [841,1189],
  'A1': [594,841],
  'A2': [420,594],
  'A3': [297,420],
  'A4': [210,297],
  'US Letter': [215.9,279.4],
  'A5': [148,210],
  'B4': [257,364],
  'B5': [182,257]
};

/** List of margin size */
ol_control_PrintDialog.prototype.marginSize = {
  none: 0,
  small: 5,
  large: 10
};

/** List of legeng options * /
ol_control_PrintDialog.prototype.legendOptions = {
  off: 'Hide legend',
  on: 'Show legend'
};

/** List of print image file formats */
ol_control_PrintDialog.prototype.formats = [{
    title: 'clipboardFormat',
    imageType: 'image/png',
    clipboard: true
  }, {
    title: 'jpegFormat',
    imageType: 'image/jpeg',
    quality: .8
  }, {
    title: 'pngFormat',
    imageType: 'image/png',
    quality: .8
  }, {
    title: 'pdfFormat',
    imageType: 'image/jpeg',
    pdf: true
  }
];

/** List of print scale */
ol_control_PrintDialog.prototype.scales = {
  ' 5000': '1/5.000',
  ' 10000': '1/10.000',
  ' 25000': '1/25.000',
  ' 50000': '1/50.000',
  ' 100000': '1/100.000',
  ' 250000': '1/250.000',
  ' 1000000': '1/1.000.000'
};

/** Get print orientation
 * @returns {string}
 */
ol_control_PrintDialog.prototype.getOrientation = function () {
  return this._orientation || 'portrait';
};

/** Set print orientation
 * @param {string} ori landscape or portrait
 */
ol_control_PrintDialog.prototype.setOrientation = function (ori) {
  this._orientation = (ori==='landscape' ? 'landscape' : 'portrait');
  this._input.orientation[this._orientation].checked = true;
  this.setSize();
};

/** Get print margin
 * @returns {number}
 */
ol_control_PrintDialog.prototype.getMargin = function () {
  return this._margin || 0;
};

/** Set print margin
 * @param {number}
 */
ol_control_PrintDialog.prototype.setMargin = function (margin) {
  this._margin = margin;
  this._input.margin.value = margin;
  this.setSize();
};

/** Get print size
 * @returns {ol.size}
 */
ol_control_PrintDialog.prototype.getSize = function () {
  return this._size;
};

/** Set map print size
 * @param {ol/size|string} size map size as ol/size or A4, etc.
 */
ol_control_PrintDialog.prototype.setSize = function (size) {
  // reset status
  this._printDialog.getContentElement().setAttribute('data-status','');
  
  if (size) this._size = size;
  else size = this._size;
  if (!size) return;

  if (typeof(size) === 'string') {
    // Test uppercase
    for (var k in this.paperSize) {
      if (k && new RegExp(k, 'i').test(size)) {
        size = k;
      }
    }
    // Default
    if (!this.paperSize[size]) size = this._size = 'A4';
    this._input.size.value = size;
    size = [
      Math.trunc(this.paperSize[size][0]* 96/25.4),
      Math.trunc(this.paperSize[size][1]* 96/25.4)
    ]
    if (this.getOrientation() === 'landscape') {
      size = [size[1], size[0]];
    }
    this.getPage().classList.remove('margin');
  } else {
    this._input.size.value = '';
    this.getPage().classList.add('margin');
  }

  var printElement = this.getPage();
  var s = printElement.parentNode.getBoundingClientRect();
  var scx = (s.width - 40) / size[0];
  var scy = (s.height - 40) / size[1];
  var sc = Math.min(scx, scy, 1);
  printElement.style.width = size[0]+'px';
  printElement.style.height = size[1]+'px';
  printElement.style['-webkit-transform'] = 
  printElement.style.transform = 'translate(-50%,-50%) scale('+sc+')';
  var px = Math.round(5/sc);
  printElement.style['-webkit-box-shadow'] = 
  printElement.style['box-shadow'] = px+'px '+px+'px '+px+'px rgba(0,0,0,.6)';
  printElement.style['padding'] = (this.getMargin() * 96/25.4)+'px';

  if (this.getMap()) {
    this.getMap().updateSize();
  }

  this.dispatchEvent({ type: 'dialog:refresh' });
};

/** Get dialog content element 
 * @return {Element}
 */
ol_control_PrintDialog.prototype.getContentElement = function () {
  return this._printDialog.getContentElement();
};

/** Get dialog user element 
 * @return {Element}
 */
ol_control_PrintDialog.prototype.getUserElement = function () {
  return this._printDialog.getContentElement().querySelector('.ol-user-param');
};

/** Get page element
 * @return {Element}
 */
ol_control_PrintDialog.prototype.getPage = function () {
  return this._pages[0]
};

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_PrintDialog.prototype.setMap = function (map) {
  if (this.getMap()) {
    this.getMap().removeControl(this._compass);
    this.getMap().removeControl(this._printCtrl);
    this.getMap().removeControl(this._printDialog);
  }
  ol_control_Control.prototype.setMap.call(this, map);
  if (this.getMap()) {
    this.getMap().addControl(this._compass);
    this.getMap().addControl(this._printCtrl);
    this.getMap().addControl(this._printDialog);
  }
};

/** Set the current scale (will change the scale of the map)
 * @param {number|string} value the scale factor or a scale string as 1/xxx
 */
ol_control_PrintDialog.prototype.setScale = function (value) {
  ol_sphere_setMapScale(this.getMap(), value);
  this._input.scale.value = ' '+(Math.round(value/100) * 100);
};

/** Get the current map scale factor
 * @return {number} 
 */
ol_control_PrintDialog.prototype.getScale = function () {
  return ol_sphere_getMapScale(this.getMap());
};

/** Show print dialog 
 * @param {*}
 *  @param {ol/size|string} options.size map size as ol/size or A4, etc.
 *  @param {number|string} options.value the scale factor or a scale string as 1/xxx
 *  @param {string} options.orientation landscape or portrait
 *  @param {number} options.margin
 */
ol_control_PrintDialog.prototype.print = function(options) {
  options = options || {};
  if (options.size) this.setSize(options.size);
  if (options.scale) this.setScale(options.scale);
  if (options.orientation) this.setOrientation(options.orientation);
  if (options.margin) this.setMargin(options.margin);
  this._printDialog.show();
};

/** Get print control
 * @returns {ol_control_Print}
 */
ol_control_PrintDialog.prototype.getrintControl = function() {
  return this._printCtrl;
}

export default ol_control_PrintDialog
