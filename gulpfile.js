/* Gulp file to create dist
*/
var gulp = require("gulp");
var concat = require("gulp-concat");
var minify = require("gulp-minify")
var header = require('gulp-header');

var autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');

/* Prevent error for reload */
function swallowError (error) {
  // Show error in the console
  console.log(error.toString())
  this.emit('end')
}

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
        // change ol_namespace_Class_Att => ol.namespace.Class.Att
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z]*)_([a-z,A-Z]*))/g,"ol.$2.$3.$4");
        // change ol_namespace_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z]*))/g,"ol.$2.$3");
        // change ol_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*))/g,"ol.$2");
        // change var ol.Class => ol.Class
        content = content.replace(/(\bvar ol\.([a-z,A-Z]*))/g,"ol.$2");
        // remove import / export
        content = content.replace(/\bimport (.*)|\bexport (.*)/g,"");
        // remove empty lines
        content = content.replace(/\r/gm, '');
        content = content.replace(/^\s*[\n]/gm, '');
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
  ' * @author <%= pkg.author.name %>',
  ' * @see <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Build css. Use --debug to build in debug mode
gulp.task('css', function () {
  gulp.src([
		"./src/control/*.css", "!./src/control/PirateMap.css",
		"./src/featureanimation/*.css", 
		"./src/filter/*.css",
		"./src/interaction/*.css",
		"./src/layer/*.css",
		"./src/overlay/*.css", 
		"./src/style/*.css",
		"./src/utils/*.css"
		])
  .pipe(autoprefixer('last 2 versions'))
  .pipe(concat(name+'.css'))
  .pipe(gulp.dest('./dist'));

  gulp.src([
		"./src/control/*.css", "!./src/control/PirateMap.css",
		"./src/featureanimation/*.css", 
		"./src/filter/*.css",
		"./src/interaction/*.css",
		"./src/layer/*.css",
		"./src/overlay/*.css", 
		"./src/style/*.css",
		"./src/utils/*.css"
		])
  .pipe(autoprefixer('last 2 versions'))
  .pipe(concat(name+'.min.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('./dist'));
});

// Build js
gulp.task("js", function() {
	gulp.src([
		"./src/control/Search.js","./src/control/SearchJSON.js","./src/control/SearchPhoton.js",
    "./src/control/LayerSwitcher.js", "./src/control/*.js", "!./src/control/PirateMap.js",
		"./src/featureanimation/FeatureAnimation.js", "./src/featureanimation/*.js",
		"./src/filter/Base.js", "./src/filter/Mask.js", "./src/filter/*.js",
		"./src/interaction/*.js",
		"./src/source/*.js",
		"./src/layer/*.js",
		"./src/overlay/*.js",
    "./src/geom/*.js",
    "./src/render/*.js",
    "./src/style/*.js", "!./src/style/FontMakiDef.js", "!./src/style/FontAwesomeDef.js",
    // Utils in extrajs
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
  .on('error', swallowError)
	.pipe(header(banner, { pkg : pkg } ))
  .pipe(gulp.dest("dist"))
  .on('end', function(){ console.log('\x1b[32m','\n>>> Terminated...','\x1b[0m')});
});

/* Watch for modification to recreate the dist */
gulp.task('watch', function() {
  gulp.watch(['./src/*/*.js','./src/*/*.css'], ['default']);
});

// Build extra js files to be used individually
gulp.task("extrajs", function() {
	gulp.src([
    "./src/style/FontMakiDef.js", "./src/style/FontAwesomeDef.js",
    "./src/utils/*.js",
    "./src/filter/TextureImage.js"
		])
	.pipe(transform())
  .pipe(gulp.dest("dist/extra"))
});

/**
 * Move the files into root
 * for packaging
 */
gulp.task ("prepublish", function(){
  gulp.src(["./src/*/*.*"], { base: './src' })
    .pipe(gulp.dest('./'));
});

/**
 * Remove files after packaging
 */
gulp.task ("postpublish", function(){
  var clean = require('gulp-clean');
  gulp.src([
      "./control",
      "./featureanimation",
      "./filter",
      "./geom",
      "./interaction",
      "./layer",
      "./overlay",
      "./render",
      "./source",
      "./style",
      "./utils"
    ])
    .pipe(clean());
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
gulp.task("dist", ["js","extrajs","css"]);

// The default task that will be run if no task is supplied
gulp.task("default", ["js","extrajs","css"]);
