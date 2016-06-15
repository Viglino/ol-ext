/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Water ripple effect.
 * Original code (Java) by Neil Wallis 
 * @link http://www.neilwallis.com/java/water.html
 * 
 * Original code (JS) by Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * @link http://media.chikuyonok.ru/ripple/
 */
/** Add a watter ripple effect on a map
*	@param {false|ol.ripple.option} false to stop animation or options
*		- radius {integer} radius for rain drop
*		- delay {integer} delay on each rain drop, 0 mean no drop, default:1000;
*/
(function(){

// prevent multiple add
var onmouse, onrain, oncompose = null;

ol.Map.prototype.ripple = function(options)
{	options = options || {};

	// Remove previous effect
	if (oncompose)
	{	var map = oncompose.target;
		ol.Observable.unByKey(oncompose); 
		ol.Observable.unByKey(onmouse); 
		clearTimeout (onrain);
	}
	// Stop animation
	if (options===false) return;
    var riprad = options.radius || 3;

	var vdelay = (typeof(options.delay)=="number" ? options.delay : 1000)/2;
	var delay = 3*vdelay/2;
	
	var width,
        height,
        half_width,
        half_height,
        size,
        oldind,
        newind,
        ripplemap = [],
        last_map = [],
        ripple,
        texture;
    
    
	/**
     * Disturb water at specified point
     */
    function disturb(dx, dy) 
	{   dx <<= 0;
        dy <<= 0;
        
        for (var j = dy - riprad; j < dy + riprad; j++) 
		{   for (var k = dx - riprad; k < dx + riprad; k++) 
			{   ripplemap[oldind + (j * width) + k] += 128;
            }
        }
    }
	
	// For render on move
	onmouse = this.on('pointermove', function(e) 
	{	disturb(e.pixel[0],e.pixel[1]);
	}, this);
	
	// Show animation on postcompose
	oncompose = this.on('postcompose', function(e)
	{	var ctx = e.context;
		var canvas = ctx.canvas;
		// Initialize
		if (!width)
		{	width = canvas.width;
			height = canvas.height;
			half_width = width >> 1;
			half_height = height >> 1;
			size = width * (height + 2) * 2;
			oldind = width;
			newind = width * (height + 3);
			for (var i = 0; i < size; i++) {
				last_map[i] = ripplemap[i] = 0;
			}
		}
		ripple = ctx.getImageData(0, 0, width, height);	
		texture = ctx.getImageData(0, 0, width, height);

		// Run
		var a, b, data, cur_pixel, new_pixel, old_data;
        
        var t = oldind; oldind = newind; newind = t;
        var i = 0;
        
        // create local copies of variables to decrease
        // scope lookup time in Firefox
        var _width = width,
            _height = height,
            _ripplemap = ripplemap,
            _last_map = last_map,
            _rd = ripple.data,
            _td = texture.data,
            _half_width = half_width,
            _half_height = half_height;
        
        for (var y = 0; y < _height; y++) {
            for (var x = 0; x < _width; x++) {
                var _newind = newind + i,
					_mapind = oldind + i;
                data = (
                    _ripplemap[_mapind - _width] + 
                    _ripplemap[_mapind + _width] + 
                    _ripplemap[_mapind - 1] + 
                    _ripplemap[_mapind + 1]) >> 1;
                    
                data -= _ripplemap[_newind];
                data -= data >> 5;
                
                _ripplemap[_newind] = data;

                //where data=0 then still, where data>0 then wave
                data = 1024 - data;
                
                if (_last_map[i] != data) 
				{   old_data = _last_map[i];
					_last_map[i] = data;
					
					//offsets
                    a = (((x - _half_width) * data / 1024) << 0) + _half_width;
                    b = (((y - _half_height) * data / 1024) << 0) + _half_height;
    
                    //bounds check
                    if (a >= _width) a = _width - 1;
                    if (a < 0) a = 0;
                    if (b >= _height) b = _height - 1;
                    if (b < 0) b = 0;
    
                    new_pixel = (a + (b * _width)) * 4;
                    cur_pixel = i * 4;

					/**/
                    _rd[cur_pixel] = _td[new_pixel];
                    _rd[cur_pixel + 1] = _td[new_pixel + 1];
                    _rd[cur_pixel + 2] = _td[new_pixel + 2];

					/*/
					// only in blue pixels 
                    if (_td[new_pixel + 2]>_td[new_pixel + 1]
						&& _td[new_pixel + 2]>_td[new_pixel])
					{
                    _rd[cur_pixel] = _td[new_pixel];
                    _rd[cur_pixel + 1] = _td[new_pixel + 1];
                    _rd[cur_pixel + 2] = _td[new_pixel + 2];
					}
					else _ripplemap[_newind] = 0;
					/**/
                }
                
                ++i;
            }
        }
		ctx.putImageData(ripple, 0, 0);
		
		// tell OL3 to continue postcompose animation
		this.render(); 

	}, this);
	// Force refresh
	this.renderSync();

	// Generate random ripples
	var rnd = Math.random;
	function rain() 
	{	disturb(rnd() * width, rnd() * height);
		onrain = setTimeout (rain, rnd()*vdelay + delay);
		console.log(rain)
	};
	// Start raining
	if (delay) rain();

	return;
}

})();