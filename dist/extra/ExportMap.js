//TODO: Rewrite pdf 
/** jQuery plugin to 
*
* Export PDF :
* @uses jspdf
* by gingerik
* https://github.com/gingerik/ol3/blob/gh-pages/examples/export-pdf.html
* http://gingerik.github.io/ol3/examples/export-pdf.html
*
* @param: {ol.Map} map to export
* @param: {Object=} {format, quality, dpi} 
*		format {String}: png/jpeg/webp, default find the extension in the download attribut
*		quality {Number}: between 0 and 1 indicating image quality if the requested type is jpeg or webp
*		dpi {Number}: resolution of the map
*/
$.fn.exportMap = function(map, options)
{	if (!options) options={};
	function saveCanvas(input, canvas, ext)
	{	if (ext=='pdf')
		{	var data = canvas.toDataURL('image/jpeg');
			var size, w, h, orient, format = 'a4';
			var margin = Number($(input).data('margin'))||0;
			// Calculate size
			if (canvas.width > canvas.height)
			{	orient = 'landscape';
				size = [297,210];
			}
			else
			{	orient = 'portrait';
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
	if (!this.each) return;
	return this.each(function()
	{	// Force download on HTML5
		if ('download' in this)
		{	var self = this;
			$(this).on('click',function()
			{	// Get extension in the download
				var ext = $(this).attr("download").split('.').pop();
				if (ext=='jpg') ext = 'jpeg';
				// Try to change resolution
				if (options.dpi)
				{	map.once('precompose', function(event) 
					{	var canvas = event.context.canvas;
						var scaleFactor = options.dpi / 96;
						canvas.width = Math.ceil(canvas.width * scaleFactor);
						canvas.height = Math.ceil(canvas.height * scaleFactor);
						event.context.scale(scaleFactor, scaleFactor);
					});
				}
				var label = $(this).text();
				// Draw a white background before draw (transparent background)
				if (ext!='png')
				{	map.once('precompose', function(e)
					{	e.context.fillStyle = "white";
						e.context.fillRect(0,0,e.context.canvas.width,e.context.canvas.height);
					})
				}
				// Copy the map
				map.once('postcompose', function(event) 
				{	saveCanvas (self, event.context.canvas, ext);
					// Redraw map (if dpi change)
					setTimeout(function(){ map.renderSync() }, 500);
				});
				map.renderSync();
			});
		}
		else 
		{	//$(this).hide();
			$(this).on('click',function(){ alert ("Export functions are not supported by your browser...");});
		}
	});
};
