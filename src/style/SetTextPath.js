import ol_ext_inherits from '../util/ext.js'
import ol_layer_Vector from 'ol/layer/Vector.js'
import ol_style_Style from 'ol/style/Style.js'
import ol_style_Text from 'ol/style/Text.js'

/** Add a setTextPath style to draw text along linestrings
@toto letterpadding/spacing, wordpadding/spacing
*/
;(function()
{
/** Internal drawing function called on postcompose
* @param {ol.eventPoscompose} e postcompose event
*/
function drawTextPath (e)
{	// Prent drawing at large resolution
	if (e.frameState.viewState.resolution > this.textPathMaxResolution_) return;
	
	var extent = e.frameState.extent;
	var c2p = e.frameState.coordinateToPixelTransform;

	// Get pixel path with coordinates
	var k;
	function getPath(c, readable)
	{	var path1 = [];
		for (k=0; k<c.length; k++) 
		{	path1.push(c2p[0]*c[k][0]+c2p[1]*c[k][1]+c2p[4]);
			path1.push(c2p[2]*c[k][0]+c2p[3]*c[k][1]+c2p[5]);
		}
		// Revert line ?
		if (readable && path1[0]>path1[path1.length-2])
		{	var path2 = [];
			for (k=path1.length-2; k>=0; k-=2)
			{	path2.push(path1[k]);
				path2.push(path1[k+1]);
			}
			return path2;
		}
		else return path1;
	}

	var ctx = e.context;
	ctx.save();
	ctx.scale(e.frameState.pixelRatio,e.frameState.pixelRatio);

	var features = this.getSource().getFeaturesInExtent(extent);
	for (var i=0, f; f=features[i]; i++)
	{	{	var style = this.textPathStyle_(f,e.frameState.viewState.resolution);
			for (var s,j=0; s=style[j]; j++)
			{	
				var g = s.getGeometry() || f.getGeometry();
				var c;
				switch (g.getType())
				{	case "LineString": c = g.getCoordinates(); break;
					case "MultiLineString": c = g.getLineString(0).getCoordinates(); break;
					default: continue;
				}

				var st = s.getText();
				var path = getPath(c, st.getRotateWithView() );
				
				ctx.font = st.getFont();
				ctx.textBaseline = st.getTextBaseline();
				ctx.textAlign = st.getTextAlign();
				ctx.lineWidth = st.getStroke() ? (st.getStroke().getWidth()||0) : 0;
				ctx.strokeStyle = st.getStroke() ? (st.getStroke().getColor()||"#fff") : "#fff";
				ctx.fillStyle = st.getFill() ? st.getFill().getColor()||"#000" : "#000";
				// New params
				ctx.textJustify = st.getTextAlign()=="justify";
				ctx.textOverflow = st.getTextOverflow ? st.getTextOverflow():"";
				ctx.minWidth = st.getMinWidth ? st.getMinWidth():0;
				// Draw textpath
				ctx.textPath(st.getText()||f.get("name"), path);
			}
		}
	}

	ctx.restore();
}

/** Set the style for features. 
*	This can be a single style object, an array of styles, or a function that takes a feature and resolution and 
*	returns an array of styles. If it is undefined the default style is used. 
*	If it is null the layer has no style (a null style). 
*	See ol.style for information on the default style.
* @deprecated use ol/style/Text with placement:line
*	@param {ol.style.Style|Array.<ol.style.Style>|ol.StyleFunction} style
*	@param {Number} maxResolution to display text, default: 0
*/
ol_layer_Vector.prototype.setTextPathStyle = function(style, maxResolution)
{
	// Remove existing style
	if (style===null)
	{	if (this.textPath_) this.unByKey(this.textPath_);
		this.textPath_ = null;
		this.changed();
		return;
	}
	// New postcompose
	if (!this.textPath_)
	{	this.textPath_ = this.on(['postcompose','postrender'], drawTextPath.bind(this));
	}
	// Set textPathStyle
	if (style===undefined)
	{	style = [ new ol_style_Style({ text: new ol_style_Text()}) ];
	}
	if (typeof(style) == "function") this.textPathStyle_ = style;
	else this.textPathStyle_ = function() { return style; };
	this.textPathMaxResolution_ = Number(maxResolution) || Number.MAX_VALUE;

	// Force redraw
	this.changed();
}


/** Add new properties to ol.style.Text
* to use with ol.layer.Vector.prototype.setTextPathStyle
* @constructor
* @param {} options
*	@param {visible|ellipsis|string} textOverflow
*	@param {number} minWidth minimum width (px) to draw text, default 0
*/
var ol_style_TextPath = function(options)
{	if (!options) options={};
	ol_style_Text.call (this, options);
	this.textOverflow_ = typeof(options.textOverflow)!="undefined" ?  options.textOverflow : "visible";
	this.minWidth_ = options.minWidth || 0;
}
ol_ext_inherits(ol_style_TextPath, ol_style_Text);

ol_style_TextPath.prototype.getTextOverflow = function()
{	return this.textOverflow_; 
};

ol_style_TextPath.prototype.getMinWidth = function()
{	return this.minWidth_; 
};

/**/

})();


/** CanvasRenderingContext2D: draw text along path
* @param {string} text
* @param {Array<Number>} path
*/
CanvasRenderingContext2D.prototype.textPath = function (text, path)
{
	var ctx = this;

	function dist2D(x1,y1,x2,y2)
	{	var dx = x2-x1;
		var dy = y2-y1;
		return Math.sqrt(dx*dx+dy*dy);
	}
  
	var di, dpos=0;
	var pos=2;
	function getPoint(path, dl)
	{	if (!di || dpos+di<dl)
		{ for (; pos<path.length; )
			{	di = dist2D(path[pos-2],path[pos-1],path[pos],path[pos+1]);
				if (dpos+di>dl) break;
				pos += 2;
				if (pos>=path.length) break;
				dpos += di;
			}
		}
   
		var x, y, a, dt = dl-dpos;
		if (pos>=path.length) 
		{	pos = path.length-2;
		}

		if (!dt) 
		{	x = path[pos-2];
			y = path[pos-1];
			a = Math.atan2(path[pos+1]-path[pos-1], path[pos]-path[pos-2]);
		}
		else
		{	x = path[pos-2]+ (path[pos]-path[pos-2])*dt/di;
			y = path[pos-1]+(path[pos+1]-path[pos-1])*dt/di;
			a = Math.atan2(path[pos+1]-path[pos-1], path[pos]-path[pos-2]);
		}
		return [x,y,a];
	}

	var letterPadding = ctx.measureText(" ").width *0.25;
  
	var start = 0;

	var d = 0;
	for (var i=2; i<path.length; i+=2)
	{	d += dist2D(path[i-2],path[i-1],path[i],path[i+1])
	}
	if (d < ctx.minWidth) return;
	var nbspace = text.split(" ").length -1;

	// Remove char for overflow
	if (ctx.textOverflow != "visible")
	{	if (d < ctx.measureText(text).width + (text.length-1 + nbspace) * letterPadding)
		{	var overflow = (ctx.textOverflow=="ellipsis") ? '\u2026' : ctx.textOverflow;
			do
			{	nbspace = text.split(" ").length -1;
				text = text.slice(0,text.length-1);
			} while (text && d < ctx.measureText(text+overflow).width + (text.length + overflow.length-1 + nbspace) * letterPadding)
			text += overflow;
		}
	}

	switch (ctx.textJustify || ctx.textAlign)
	{	case true: // justify
		case "center":
		case "end":
		case "right":
		{	// Text align
			if (ctx.textJustify) 
			{	start = 0;
				letterPadding = (d - ctx.measureText(text).width) / (text.length-1 + nbspace);
			}
			else
			{	start = d - ctx.measureText(text).width - (text.length + nbspace) * letterPadding;
				if (ctx.textAlign == "center") start /= 2;
			}
			break;
		}
		default: break;
	}
  
	for (var t=0; t<text.length; t++)
	{	var letter = text[t];
		var wl = ctx.measureText(letter).width;
    
		var p = getPoint(path, start+wl/2);

		ctx.save();
		ctx.textAlign = "center";
		ctx.translate(p[0], p[1]);
		ctx.rotate(p[2]);
		if (ctx.lineWidth) ctx.strokeText(letter,0,0);
		ctx.fillText(letter,0,0);
		ctx.restore();
		start += wl+letterPadding*(letter==" "?2:1);
	}
  
};
