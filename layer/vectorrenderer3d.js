/** ol.layer.Vector.prototype.setRender3D
 * @extends {ol.layer.Vector}
 * @param {ol.render3D} 
 */
ol.layer.Vector.prototype.setRender3D = function (r)
{	r.setLayer(this);
}

/** 
 *	@classdesc
 *	ol.render3D 3D vector layer rendering
 *	@constructor
 *	@param {olx.render3DOption}
 *		- masResolution {number} max resolution to render 3D
 *		- defaultHeight {number} default height if none is return by a propertie
 *		- height {function|string|Number} a height function (return height giving a feature) or a popertie name for the height or a fixed value
 */
ol.render3D = function (options)
{	var options = options || {};
	
	this.maxResolution_ = options.maxResolution || 100
	this.defaultHeight_ = options.defaultHeight || 0;
	this.height_ = this.getHfn (options.height);
}

/** Calculate 3D at potcompose
*/
ol.render3D.prototype.onPostcompose_ = function(e)
{	var res = e.frameState.viewState.resolution;
	if (res > this.maxResolution_) return;
	this.res_ = res*400;

	if (this.animate_) 
	{	var elapsed = e.frameState.time - this.animate_;
		if (elapsed < this.animateDuration_)
		{	this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_);
			// tell OL3 to continue postcompose animation
			e.frameState.animate = true;
		}
		else
		{	this.animate_ = false;
			this.height_ = this.toHeight_
		}
	}

	var ratio = e.frameState.pixelRatio;
	var ctx = e.context;
	var m = this.matrix_ = e.frameState.coordinateToPixelTransform;
	// Old version (matrix)
	if (!m)
	{	m = e.frameState.coordinateToPixelMatrix,
		m[2] = m[4];
		m[3] = m[5];
		m[4] = m[12];
		m[5] = m[13];
	}
	this.center_ = [ctx.canvas.width/2/ratio, ctx.canvas.height/ratio];

	var f = this.layer_.getSource().getFeaturesInExtent(e.frameState.extent);
		
	ctx.save();
	ctx.scale(ratio,ratio);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "red";
	ctx.fillStyle = "rgba(0,0,255,0.5)";
	var builds = [];
	for (var i=0; i<f.length; i++)
	{	builds.push (this.getFeature3D_ (f[i], this.getFeatureHeight(f[i])));
	}
	this.drawFeature3D_ (ctx, builds);
	ctx.restore();
}

/** Set layer to render 3D
*/
ol.render3D.prototype.setLayer = function(l)
{	if (this.layer_) this.layer_.un ('postcompose', this.onPostcompose_, this);
	this.layer_ = l;
	l.on ('postcompose', this.onPostcompose_, this);
}

/** Create a function that return height of a feature
*	@param {function|string|number} a height function or a popertie name or a fixed value
*	@return {function} function(f) return height of the feature f
*/
ol.render3D.prototype.getHfn= function(h)
{	switch (typeof(h))
	{	case 'function': return h;
		case 'string': 
			{	var dh = this.defaultHeight_;
				return (function(f) 
				{	return (Number(f.get(h)) || dh); 
				});
			}
		case 'number': return (function(f) { return h; });
		default: return (function(f) { return 10; });
	}
}

/** Animate rendering
*	@param {olx.render3D.animateOptions}
*		- height {string|function|number} an attribute name or a function returning height of a feature or a fixed value
*		- durtion {number} the duration of the animatioin ms, default 1000
*		- easing {ol.easing} an ol easing function
*	@api
*/
ol.render3D.prototype.animate = function(options)
{	options = options || {};
	this.toHeight_ = this.getHfn(options.height);
	this.animate_ = new Date().getTime();
	this.animateDuration_ = options.duration ||1000;
	this.easing_ = options.easing || ol.easing.easeOut;
	// Force redraw
	this.layer_.changed();
}

/** Check if animation is on
*	@return {bool}
*/
ol.render3D.prototype.animating = function()
{	if (this.animate_ && new Date().getTime() - this.animate_ > this.animateDuration_) 
	{	this.animate_ = false;
	}
	return !!this.animate_;
}

/** 
*/
ol.render3D.prototype.getFeatureHeight = function (f)
{	if (this.animate_)
	{	var h1 = this.height_(f);
		var h2 = this.toHeight_(f);
		return (h1*(1-this.elapsedRatio_)+this.elapsedRatio_*h2);
	}
	else return this.height_(f);
}

/**
*/
ol.render3D.prototype.hvector_ = function (pt, h)
{	p0 = [	pt[0]*this.matrix_[0] + pt[1]*this.matrix_[1] + this.matrix_[4],
			pt[0]*this.matrix_[2] + pt[1]*this.matrix_[3] + this.matrix_[5]
		];
	p1 = [	p0[0] + h/this.res_*(p0[0]-this.center_[0]),
			p0[1] + h/this.res_*(p0[1]-this.center_[1])
		];
	return {p0:p0, p1:p1};
}

/**
*/
ol.render3D.prototype.getFeature3D_ = function (f, h)
{	var c = f.getGeometry().getCoordinates();
	switch (f.getGeometry().getType())
	{	case "Polygon":
			c = [c];
		case "MultiPolygon":
			var build = [];
			for (var i=0; i<c.length; i++) 
			{	var p0, p1;
				for (var j=0; j<c[i].length; j++)
				{	var b = [];
					for (var k=0; k<c[i][j].length; k++)
					{	b.push( this.hvector_(c[i][j][k], h) );
					}
					build.push(b);
				}
			}
			return { type:"MultiPolygon", feature:f, geom:build };
		case "Point":
			return { type:"Point", feature:f, geom:this.hvector_(c,h) };
		default: return {};
	}
}

/**
*/
ol.render3D.prototype.drawFeature3D_ = function(ctx, build)
{	// Construct
	for (var i=0; i<build.length; i++) 
	{	
		switch (build[i].type)
		{	case "MultiPolygon":
				for (var j=0; j<build[i].geom.length; j++)
				{	var b = build[i].geom[j];
					for (var k=0; k < b.length; k++)
					{	ctx.beginPath();
						ctx.moveTo(b[k].p0[0], b[k].p0[1]);
						ctx.lineTo(b[k].p1[0], b[k].p1[1]);
						ctx.stroke();
					}
				}
				break;
			case "Point":
				{	var g = build[i].geom;
					ctx.beginPath();
					ctx.moveTo(g.p0[0], g.p0[1]);
					ctx.lineTo(g.p1[0], g.p1[1]);
					ctx.stroke();
					break;
				}
			default: break;
		}
	}
	// Roof
	for (var i=0; i<build.length; i++) 
	{	switch (build[i].type)
		{	case "MultiPolygon":
			{	ctx.beginPath();
				for (var j=0; j<build[i].geom.length; j++)
				{	var b = build[i].geom[j];
					if (j==0)
					{	ctx.moveTo(b[0].p1[0], b[0].p1[1]);
						for (var k=1; k < b.length; k++)
						{	ctx.lineTo(b[k].p1[0], b[k].p1[1]);
						}
					}
					else
					{	ctx.moveTo(b[0].p1[0], b[0].p1[1]);
						for (var k=b.length-2; k>=0; k--)
						{	ctx.lineTo(b[k].p1[0], b[k].p1[1]);
						}
					}
					ctx.closePath();
				}
				ctx.fill("evenodd");
				ctx.stroke();
				break;
			}
			case "Point":
			{	var b = build[i];
				var t = b.feature.get('label');
				var p = b.geom.p1;
				var f = ctx.fillStyle;
				ctx.fillStyle = ctx.strokeStyle;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';
				ctx.fillText ( t, p[0], p[1] );
				var m = ctx.measureText(t);
				var h = Number (ctx.font.match(/\d+(\.\d+)?/g).join([]));
				ctx.fillStyle = "rgba(255,255,255,0.5)";
				ctx.fillRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
				ctx.strokeRect (p[0]-m.width/2 -5, p[1]-h -5, m.width +10, h +10)
				ctx.fillStyle = f;
				//console.log(build[i].feature.getProperties())
			}
			default: break;
		}
	}
}
