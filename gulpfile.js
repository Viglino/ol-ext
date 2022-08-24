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
        // Prevent ol_has_DEVICE_PIXEL_RATIO
        //content = content.replace(/ol_has_DEVICE_PIXEL_RATIO/g,"ol.has.DEVICE_PIXEL_RATIO");
        // change ol_namespace_Class_Att => ol.namespace.Class.Att
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z,4]*)_([a-z,A-Z]*)\b)/g, "ol.$2.$3.$4");
        // change ol_namespace_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z]*))/g, "ol.$2.$3");
        // change ol_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*))/g, "ol.$2");
        // change var ol.Class => ol.Class
        content = content.replace(/(\bvar ol\.([a-z,A-Z]*))/g, "ol.$2");
        // remove import / export
        content = content.replace(/\bimport (.*)|\bexport (.*)/g, "");
        // remove empty lines
        content = content.replace(/\r/gm, '');
        content = content.replace(/^\s*[\n]/gm, '');
        // let and const => var (for IE)
        content = content.replace(/\blet\b/g, 'var');
        content = content.replace(/\bconst\b/g, 'var');
        // return content
        file.contents = Buffer.from(content);// new Buffer(content);
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
gulp.task('css0', function () {
  return gulp.src([
    "./src/control/*.css", "!./src/control/PirateMap.css",
    "./src/featureanimation/*.css", 
    "./src/filter/*.css",
    "./src/interaction/*.css",
    "./src/layer/*.css",
    "./src/map/*.css",
    "./src/overlay/*.css", 
    "./src/style/*.css",
    "./src/legend/*.css",
    "./src/ext/*.css",
    "./src/util/*.css",
    "./src/util/input/*.css",
    "./src/utils/*.css"
    ])
  .pipe(autoprefixer('last 2 versions'))
  .pipe(concat(name+'.css'))
  .pipe(gulp.dest('./dist'));
});

gulp.task('cssmin', function () {

  return gulp.src([
    "./src/control/*.css", "!./src/control/PirateMap.css",
    "./src/featureanimation/*.css", 
    "./src/filter/*.css",
    "./src/interaction/*.css",
    "./src/layer/*.css",
    "./src/map/*.css",
    "./src/overlay/*.css", 
    "./src/style/*.css",
    "./src/legend/*.css",
    "./src/util/*.css",
    "./src/util/input/*.css",
    "./src/utils/*.css"
    ])
  .pipe(autoprefixer('last 2 versions'))
  .pipe(concat(name+'.min.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('./dist'));
});

gulp.task('css', gulp.parallel('css0','cssmin'));

// Build js
gulp.task("js", function() {
  return gulp.src([
    "./src/util/ext.js", "./src/util/*.js", "./src/util/SVGFilter/*.js", 
    "./src/util/input/Base.js", "./src/util/input/Slider.js", "./src/util/input/PopupBase.js", "./src/util/input/*.js",
    "!./src/util/getVectorContext.js", 
    "./src/ext/*.js",
    "./src/legend/Legend.js","./src/legend/*.js",
    "./src/control/CanvasBase.js","./src/control/SelectBase.js","./src/control/Button.js","./src/control/Toggle.js","./src/control/Search.js","./src/control/SearchJSON.js","./src/control/SearchPhoton.js","./src/control/SearchGeoportail.js",
    "./src/control/LayerSwitcher.js", "./src/control/*.js", 
    "!./src/control/PirateMap.js", "!./src/control/Cloud.js",
    "./src/featureanimation/FeatureAnimation.js", "./src/featureanimation/*.js",
    "./src/filter/Base.js", "./src/filter/Mask.js", "./src/filter/*.js",
    "./src/format/GeoJSONX.js", "./src/format/*.js",
    "./src/interaction/Clip.js", "./src/interaction/CurrentMap.js", "./src/interaction/*.js",
    "./src/source/*.js",
    "./src/layer/*.js",
    "./src/map/*.js",
    "./src/particule/*.js",
    "./src/overlay/Popup.js", "./src/overlay/*.js",
    "./src/geom/*.js",
    "./src/render/*.js",
    "./src/style/*.js", 
    "!./src/style/*Def.js",
    // Export utils in extrajs
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

/* Start a server and watch for modification for live reload */
gulp.task('serve', function() {
  var liveServer = require("live-server");

  var params = {
    port: 8181,             // Set the server port. Defaults to 8080.
    host: "0.0.0.0",        // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    open: false,            // When false, it won't load your browser by default.
    watch: ['dist','examples'], // comma-separated string for paths to watch
//    ignore: '',             // comma-separated string for paths to ignore
    file: "index.html",     // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000,             // Waits for all changes, before reloading. Defaults to 0 sec.
    logLevel: 2             // 0 = errors only, 1 = some, 2 = lots
  };
  liveServer.start(params);

  //return gulp.watch(['./src/*/*.js','./src/*/*.css'], gulp.series('default'));
  return gulp.watch(['src/*/*', 'src/*/*/*'], gulp.series('default'));
});


// Build extra js files to be used individually
gulp.task("extrajs", function() {
  return gulp.src([
    "./src/control/Cloud.js",
    "./src/style/*Def.js",
    "./src/utils/*.js",
    "./src/filter/TextureImage.js"
    ])
  .pipe(transform())
  .pipe(gulp.dest("dist/extra"))
});

// Build files to be used individually
gulp.task("lib", function(done) {
  var src = ['control','featureanimation','filter','format','geom','interaction','layer','overlay','render','source','style','util','utils','ext'];
  for (var i=0; i<src.length; i++) {
    gulp.src("./src/"+src[i]+"/*.js")
      .pipe(transform())
      .pipe(gulp.dest("lib/"+src[i]));
    gulp.src("./src/"+src[i]+"/*.css")
      .pipe(autoprefixer('last 2 versions'))
      .pipe(gulp.dest("lib/"+src[i]));
  }
  done();
});


/**
 * Move the files into root
 * for packaging
 */
gulp.task ("prepublish", function(){
  return gulp.src(["./src/*/*.*", "./src/*/*/*.*"], { base: './src' })
    .pipe(gulp.dest('./'));
});

/**
 * Remove files after packaging
 */
gulp.task ("postpublish", function(){
  var clean = require('gulp-clean');
  return gulp.src([
      "./control",
      "./featureanimation",
      "./filter",
      "./format",
      "./geom",
      "./interaction",
      "./layer",
      "./map",
      "./overlay",
      "./particule",
      "./render",
      "./source",
      "./style",
      "./legend",
      "./util",
      "./utils"
    ])
    .pipe(clean());
});


/** Build the doc */
gulp.task('doc', function (cb) {
  var jsdoc = require('gulp-jsdoc3');
  var config = require('./doc/jsdoc.json');
  return gulp.src([
    "doc/doc.md", "doc/namespace.js",
    "./dist/ol-ext.js"
    ], {read: false})
    .pipe(jsdoc(config, cb));
});

// build the dist
gulp.task("dist", gulp.parallel("js","extrajs","css"));

// The default task that will be run if no task is supplied
gulp.task("default", gulp.parallel("js","extrajs","css"));
