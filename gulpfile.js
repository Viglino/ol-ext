/* Gulp file to create dist
*/
var gulp = require("gulp");
var concat = require("gulp-concat");
var cssnext = require("gulp-cssnext");
var minify = require("gulp-minify")
var header = require('gulp-header');

/* Transform ES6 to create the ./dist */
var PluginError = require('plugin-error');
var through = require('through2');

function transform() {
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
        // nothing to do
        return callback(null, file);
    }
    if (file.isStream()) {
        // file.contents is a Stream - https://nodejs.org/api/stream.html
        this.emit('error', new PluginError("BUILD", 'Streams not supported!'));

    } else if (file.isBuffer()) {
      // file content
      content = file.contents.toString();
      if (content) {
        // change ol_namespace_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z]*))/g,"ol.$2.$3");
        // change ol_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*))/g,"ol.$2");
        // change var ol.Class => ol.Class
        content = content.replace(/(\bvar ol\.([a-z,A-Z]*))/g,"ol.$2");
        // remove import / export
        content = content.replace(/\bimport (.*)|\bexport (.*)/g,"");
        // return content
        file.contents = new Buffer(content);
      }
      return callback(null, file);
    }
  });
};

// Retrieve option (--debug for css)
var options = require("minimist")(process.argv.slice(2));
var name = "ol-ext";

// using data from package.json 
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @description <%= pkg.keywords %>',
  ' * @version v<%= pkg.version %>',
  ' * @author <%= pkg.author %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Build css. Use --debug to build in debug mode
gulp.task("css", function() {
	gulp.src([
		"./src/control/*.css", "!./src/control/PirateMap.css",
		"./src/featureanimation/*.css", 
		"./src/filter/*.css",
		"./src/interaction/*.css",
		"./src/layer/*.css",
		"./src/overlay/*.css", "!./src/overlay/Popup.anim.css",
		"./src/style/*.css",
		"./src/utils/*.css"
		])
    .pipe(cssnext({
      compress: !options.debug,
      sourcemap: options.debug
    }))
	.pipe(concat(name+(!options.debug?".min.css":".css")))
    .pipe(gulp.dest("./dist/"))
});

// Build css in debug mode
gulp.task("cssd", function() {
	options.debug = true;
	gulp.start("css");
});

// Build js
gulp.task("js", function() {
	gulp.src([
		"./src/control/Search.js","./src/control/SearchPhoton.js",
    "./src/control/LayerSwitcher.js", "./src/control/*.js", "!./src/control/PirateMap.js",
		"./src/featureanimation/FeatureAnimation.js", "./src/featureanimation/*.js",
		"./src/filter/Base.js", "./src/filter/Mask.js", "./src/filter/*.js",
		"./src/interaction/*.js",
		"./src/layer/*.js",
		"./src/overlay/*.js",
    "./src/geom/*.js",
    "./src/render/*.js",
		"./src/style/FontSymbol.js", "./src/style/*.js", "!./src/style/FontMakiDef.js", "!./src/style/FontSymbol.js",
    //"./src/utils/*.js", "!./src/render/Pulse.js", "!./src/render/Markup.js",
		"!./*/*.min.js",
		"!./src/filter/TextureImage.js"
		])
	.pipe(transform())
	.pipe(concat(name+".js"))
  .pipe(minify(
		{	ext: { 
				src:".js", 
				min:".min.js" 
			}
		}))
	.pipe(header(banner, { pkg : pkg } ))
  .pipe(gulp.dest("dist"))
});

// Build extra js files to use individually
gulp.task("extrajs", function() {
	gulp.src([
    "./src/style/FontMakiDef.js", "./src/style/FontSymbol.js",
    "./src/utils/*.js",
    "./src/filter/TextureImage.js"
		])
	.pipe(transform())
  .pipe(gulp.dest("dist/extra"))
});

/** Build the doc */
gulp.task('doc', function (cb) {
	var jsdoc = require('gulp-jsdoc3');
    var config = require('./doc/jsdoc.json');
    gulp.src([
		"doc/doc.md", "doc/namespace.js",
		"./dist/ol-ext.js"
		], {read: false})
    .pipe(jsdoc(config, cb));
});

// build the dist
gulp.task("dist", ["js","extrajs","css","cssd"]);

// The default task that will be run if no task is supplied
gulp.task("default", ["js","extrajs","css","cssd"]);
