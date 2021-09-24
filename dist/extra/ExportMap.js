//TODO: Rewrite pdf 
/** Function to 
 *
 * Export PDF :
 * @uses jspdf
 * by gingerik
 * https://github.com/gingerik/ol3/blob/gh-pages/examples/export-pdf.html
 * http://gingerik.github.io/ol3/examples/export-pdf.html
 *
 * @param: {Array<HTMLElement>} elements an array of <A> elements with a download attribute
 * @param: {ol.Map} map the map to export
 * @param: {Object=} options
 *  @param {String} option.format image format: png/jpeg/webp, default find the extension in the download attribut
 *	@param {Number} options.quality quality between 0 and 1 indicating image quality if the requested type is jpeg or webp
*  @param {Number} options.dpi resolution of the map
*/
var exportMap = function(elements, map, options){
  if (!options) options={};
  function saveCanvas(input, canvas, ext) {
    if (ext=='pdf') {
      var data = canvas.toDataURL('image/jpeg');
      var size, w, h, orient, format = 'a4';
      var margin = input.getAttribute('data-margin') ? Number(input.getAttribute('data-margin')) : 0;
      // Calculate size
      if (canvas.width > canvas.height) {
        orient = 'landscape';
        size = [297,210];
      } else {
        orient = 'portrait';
        size = [210,297];
      }
      var sc = Math.min ((size[0]-2*margin)/canvas.width,(size[1]-2*margin)/canvas.height);
      w = sc * canvas.width;
      h = sc * canvas.height;
      // Center
      var mx = (size[0] - w)/2;
      var my = (size[1] - h)/2;
      // Export!
      var pdf = new jsPDF(orient, "mm", format);
      pdf.addImage(data, 'JPEG', mx, my, w, h);
      // pdf.save('map.pdf');
      input.href = pdf.output('datauristring');
    }
    else input.href = canvas.toDataURL('image/'+(options.format||ext), options.quality);
  }
  if (elements.length == 0) return;
  return elements.forEach(function(element) {
    // Force download on HTML5
    if ('download' in element && element.download.length > 0) {
      var self = element;
      element.addEventListener('click',function() {
        // Get extension in the download
        var ext = element.download.split('.').pop();
        if (ext=='jpg') ext = 'jpeg';
        // Try to change resolution
        if (options.dpi) {
          map.once('precompose', function(event){
            var canvas = event.context.canvas;
            var scaleFactor = options.dpi / 96;
            canvas.width = Math.ceil(canvas.width * scaleFactor);
            canvas.height = Math.ceil(canvas.height * scaleFactor);
            event.context.scale(scaleFactor, scaleFactor);
          });
        }
        // Draw a white background before draw (transparent background)
        if (ext!='png') {
          map.once('precompose', function(e) {
            e.context.fillStyle = "white";
            e.context.fillRect(0,0,e.context.canvas.width,e.context.canvas.height);
          })
        }
        // Copy the map
        map.once('postcompose', function(event) {
          saveCanvas (self, event.context.canvas, ext);
          // Redraw map (if dpi change)
          setTimeout(function(){ try { map.renderSync(); } catch(e) { /* ok */ } }, 500);
        });
        try { map.renderSync(); } catch(e) { /* ok */ }
      });
    } else {
      element.addEventListener('click',function(){ alert ("Export functions are not supported by your browser...");});
    }
  });
};
