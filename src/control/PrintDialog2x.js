import ol_control_PrintDialog from "./PrintDialog"
import ol_control_Print from './Print.js'
import ol_ext_element from "../util/element"

/** Print control to get an image of the map
 * @constructor
 * @fire show
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol_control_PrintDialog}
 */
var ol_control_PrintDialog2x = class olcontrolPrintDialog2x extends ol_control_PrintDialog {
  constructor(options) {
    options = options || {}

    super(options);
    this._printDialog.element.classList.add('ol-ext-print-dialog2x')

    // Add printmap
    var printMap = ol_ext_element.create('DIV', {
      className: 'ol-map2',
      parent: this._pages[0]
    })

    // Print control
    var printCtrl2 = this._printCtrl2 = new ol_control_Print(options)
    printCtrl2.on(['print', 'error', 'printing'], function (e) {
      if (e.type === 'print') {
        var canvas = document.createElement('canvas');
        if (this.getOrientation() === 'landscape') {
          canvas.width = this._canvas1.width + e.canvas.width;
          canvas.height = this._canvas1.height;
        } else {
          canvas.width = this._canvas1.width;
          canvas.height = this._canvas1.height + e.canvas.height;
        }
        var ctx = canvas.getContext('2d');
        ctx.drawImage(this._canvas1, 0, 0);
        ctx.drawImage(e.canvas, 
          (this.getOrientation() === 'landscape' ? this._canvas1.width : 0), 
          (this.getOrientation() !== 'landscape' ? this._canvas1.height : 0), 
        );
        e.canvas = canvas;
        e.image = canvas.toDataURL(e.imageType, e.quality);
        var w = canvas.width / 96 * 25.4
        var h = canvas.height / 96 * 25.4
        var size = e.print.size
        if (this.getOrientation() === 'landscape') size = [size[1], size[0]]
        e.print.position = [
          (size[0] - w) / 2,
          (size[1] - h) / 2
        ]
        e.print.imageWidth = w;
        e.print.imageHeight = h;
      }
      if (this._clipboard) {
        try {
          e.canvas.toBlob(function (blob) {
            try {
              navigator.clipboard.write([
                new window.ClipboardItem(
                  Object.defineProperty({}, blob.type, {
                    value: blob,
                    enumerable: true
                  })
                )
              ]);
              //this.dispatchEvent(e)
              // Show copy
              var copied = this._printDialog.element.querySelector('.ol-clipboard-copy')
              copied.classList.add('visible')
              setTimeout(function () { copied.classList.remove('visible') }, 1000)
              // OK
            } catch (err) {
              // this.dispatchEvent(e)
            }
          }.bind(this));
        } catch (err) {
          // this.dispatchEvent(e)
        }
      } else {
        this.dispatchEvent(e)
      }
    }.bind(this))

    // Show map 2
    var originalTarget
    this._printDialog.on('show', function() {
      if (this.getMap2()) {
        originalTarget = this.getMap2().getTargetElement()
        this.getMap2().setTarget(printMap)
      }
    }.bind(this))
    this._printDialog.on('hide', function () {
      if (!originalTarget) return
      if (this.getMap2()) {
        this.getMap2().setTarget(originalTarget)
      }
      originalTarget = null
    }.bind(this))
  }
  /** Set the second map to print
   * @param {ol.Map} map
   * @API
   */
  setMap2(map) {
    if (this.getMap2()) {
      this.getMap2().removeControl(this._printCtrl2)
    }
    this._map2 = map;
    if (map) {
      this.getMap2().addControl(this._printCtrl2)
    }
  }
  /** Set the second map to print
   * @returns {ol.Map}
   * @API
   */
  getMap2() {
    return this._map2;
  }
  /** First map printing
   * @private
   */
  _printing(e) {
    this._printDialog.getContentElement().dataset.status = e.type
    if (e.type === 'print') {
      this._canvas1 = e.canvas
      this._clipboard = e.clipboard
      this._printCtrl2.print({
        format: e.print.format,
        imageType: e.imageType,
        margin: e.margin,
        pdf: e.pdf,
        orient: e.print.orientation,
        quality: e.quality,
        size: e.print.size,
        title: e.title
      })
    } else if (!e.clipboard) {
      this.dispatchEvent(e)
    }
  }
  /** Prevent first copy
   * @private
   */
  _copyMap(format) { 
    /* prevent first copy */ 
    return false
  }
}

export default ol_control_PrintDialog2x