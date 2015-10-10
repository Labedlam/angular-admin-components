var source = './src/';
var build = './build/';
var compile = './compile/';
var root = './';
var index = 'index.html';
var temp = './temp/';
var gulp_dir = './Gulp';

module.exports = {
	source: source,
	gulp_dir: gulp_dir,
	banner: ['/**',
		' * <%= pkg.name %> - <%= pkg.description %>',
		' * @version v<%= pkg.version %>',
		' * @link <%= pkg.homepage %>',
		' * @license <%= pkg.licenses.url %>',
		' */',
		''].join('\n'),
	allCSS: [
		source + '**/*.css',
		source + '**/*.less',
		source + '**/*.sass'
	],
	allHTML: [
		source + '**/*.html'
	],
	allJS: [
		source + '**/*.js',
		'./*.js',
		'./gulp/**/*.js'
	],
	build: build,
	compile: compile,
	fonts: [
		source + 'assets/fonts/**.*'
	],
	htmlTemplates: [
		source + '**/*.html',
		'!' + source + index
	],
	index: index,
	npm_pkg: './package.json',
	bower_pkg: './bower.json',
	src: source,
	supportedStyles: [
		source + '**/*.css',
		source + '**/*.less',
		source + '**/*.sass',
		source + '**/*.scss'
	],
	temp: temp,
	root: root,
	app_files: {
		js: [ source + '**/*.js', '!' + source + '**/*.spec.js', '!' + source + 'assets/**/*.js' ],
		assets: [source + 'assets/**'],
		jsunit: [ source + '**/*.spec.js' ],

		atpl: [ source + 'app/**/*.tpl.html' ],

		html: [ source + 'index.html' ],
		import_less: [ source + 'app/**/*.less' ]
	},
	vendor_files: {
		import_less: ['vendor/font-awesome/less/font-awesome.less'],
		css: [],
		js: [
			'vendor/ace-builds/src/ace.js',
			'vendor/ace-builds/src/mode-javascript.js',
			'vendor/ace-builds/src/mode-markdown.js',
			'vendor/ace-builds/src/mode-json.js',
			'vendor/ace-builds/src/theme-twilight.js',
			'vendor/ace-builds/src/theme-idle_fingers.js',
			'vendor/ordercloud-angular-sdk/dist/ordercloud-angular-sdk.js',
			'vendor/ace-builds/src/worker-json.js',
			'vendor/ace-builds/src/worker-javascript.js',
			'vendor/ace-builds/src/worker-html.js'
		],
		exclude_js: [
			'!vendor/ordercloud-angular-sdk/dist/ordercloud-angular-sdk.min.js'
		]
	}
};