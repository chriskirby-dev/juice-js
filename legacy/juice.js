(function (global, win, doc) {

	"use strict";

	var scripts = doc.getElementsByTagName("script");
	var script = scripts[scripts.length - 1];

	const CONSTANTS = {
		timeout: 3,
		preload: ['config', 'require', 'onready'],
		core: ['client', 'dom', 'events', 'http', 'stylesheet', 'util', 'utils'],
		types: {
			'javascript': ['js'],
			'stylesheet': ['css'],
			'image': ['jpg', 'png', 'gif', 'bmp'],
			'font': ['ttf', 'woff'],
			'document': ['html']
		},
		schemas: {
			stylesheet: { e: 'link', t: 'text/css', r: 'stylesheet', a: 'href' },
			javascript: { e: 'script', t: 'text/javascript', a: 'src' },
		}
	};

	let state = {
		docready: false
	};

	let hooks = {
		docready: []
	};

	let CONFIG = {
		debug: false,
		paths: {
			app: '../',
			core: '/core'
		}
	};

	if( global.JuiceCFG ) merge( CONFIG, JuiceCFG );

	function resolveDependantName(defined, root) {

		var self = this;
		if (defined.indexOf('.') !== 0) return defined;
		var parts = (root + '/' + defined).split('/');
		var resolved = [];

		while (parts.length > 0) {
			var part = parts.shift();
			if (part == '.') continue;
			if (part == '..') {
				resolved.pop();
				continue;
			}
			resolved.push(part);
		}

		return resolved.join('/');

	}

	function isType(o, is_type) {
		var t = Object.prototype.toString.call(o).split(' ').pop().replace(']', '').toLowerCase();
		return is_type ? is_type === t : t;
	};

	function intersect(arr1, arr2) {
		return arr1.filter(value => -1 !== arr2.indexOf(value));
	};

	function notIntersect(arr1, arr2) {
		return arr1.filter(value => -1 === arr2.indexOf(value));
	};

	function extract(data, properties, format) {
		var d = {};
		while (properties.length > 0) {
			var prop = properties.shift();
			d[prop] = format ? format(data[prop]) : data[prompt];
		}
		return d;
	};

	function merge(a, b) {
		for (var prop in b) {
			if (isType(b[prop], 'object')) {
				a[prop] = merge(a[prop] || {}, b[prop])
			} else {
				a[prop] = b[prop];
			}
		}
		return a;
	}

	function cancel() { return false; }

	function debug() {
		if (!CONFIG.debug) return false;
		console.log.apply( null, arguments);
	}

	function EventEmitter(obj) {

		var self = this;
		var exports = obj || {};
		exports.events = {};
		exports.events.listeners = {};

		exports.events.addEvent = function (event, fn, params) {
			exports.events.listeners[event] = exports.events.listeners[event] || [];
			var e = { fn: fn };
			if (params) e = Object.assign(e, params);
			exports.events.listeners[event].push(e);
			if (exports.events.listeners['listener']) {
				exports.emit('listener', event);
			}
			return false;
		};

		exports.removeListener = function (event, fn) {
			if (exports.events.listeners[event]) {
				if (fn) {
					for (var i = 0; i < exports.events.listeners[event].length; i++) {
						if (exports.events.listeners[event][i].fn === fn) {
							exports.events.listeners[event].splice(i, 1);
						}
					}
				} else {
					delete exports.events.listeners[event];
				}
			}
		}

		exports.hasListener = function (event) {
			return exports.events.listeners[event] ? true : false;
		};

		exports.emit = function () {
			var event = arguments[0];

			var args = Array.prototype.slice.call(arguments, 1);
			if (exports.events.listeners[event] && exports.events.listeners[event].length > 0) {
				var rc = 0;
				var newE = [];
				for (var l = 0; l < exports.events.listeners[event].length; l++) {
					var indx = (l - rc);
					//console.log( exports );
					exports.events.listeners[event][l].fn.apply( exports, args);
					if (!exports.events.listeners[event][l].once) {
						newE.push(exports.events.listeners[event][l]);
					}
				}
				if (newE.length == 0) delete exports.events.listeners[event];
				if (exports.events.listeners[event]) exports.events.listeners[event] = newE;
			}
			return false;
		};

		exports.once = function (event, fn) {
			new exports.events.addEvent(event, fn, { once: true });
			return false;
		};

		exports.on = function (event, fn) {
			new exports.events.addEvent(event, fn, null);
			return exports;
		};

		return exports;
	}


	//END Event Emitter

	function eventListener( emitters, event, callback ) {

		var check = function () { 
			return emitters.filter( emitter => !emitter[event] ).length == 0 ? callback() : false;
		};

		if (!check()) emitters.map( emitter => emitter.on( event, check ) );
		
		return;
	}

	//TODO JuiceStorage
	var JuceStorage = function () {
		var self = this;
		this.store = win.localStorage;
	}

	JuceStorage.prototype.exists = function () {

	}

	JuceStorage.prototype.decode = function (data) {
		var self = this;
		if (typeof data == 'string') data = JSON.decode(data);
	}

	JuceStorage.prototype.save = function (key, value) {
		var self = this;
		store.setItem(key, value);
	}

	JuceStorage.prototype.get = function (key) {
		var self = this;
		var data = self.store.getItem(key);
		return self.decode(data);

	}

	let JuiceJS = function () {

		new EventEmitter(this);

		this.registry = {
			loaded: [],
			loading: [],
			modules: {}
		};
		
		this.hooks = {};
		this.modules = {};
		this.config = {};

		this.page = {};

		this.root = {
			doc: script.baseURI.substring(0, script.baseURI.lastIndexOf("/")),
			script: script.src.substring(0, script.src.lastIndexOf("/")),
			data: script.dataset
		};

		this.root.modules = this.root.script + '/modules/';

		this.preload = this.root.data;

	};

	var juice = new JuiceJS();

	const App = function () { 
		new EventEmitter(this);
		this.path = {
			doc: juice.root.doc
		};
		this.hook = {};
	
	};
	juice.app = new App();

	//Juice Paths
	var JuicePath = function (input, root) {

		var self = this;
		debug(input, root);
		self.module = false;
		self.defined = input;
		self.type = 'relative';
		if (win.location.hostname !== "" && input.indexOf(win.location.hostname) !== -1) input = input.split(document.domain).pop();
		self.filename = input.split('/').pop();
		self.ext = self.filename.indexOf('.') !== -1 ? self.filename.split('.').pop() : null;
		//if (!self.ext)
		 self.module = true;

		if (input.slice(0, 4) === 'http:') self.type = 'url';
		if (input.charAt(0) === '.') self.type = 'relative';
		if (input.charAt(0) === '/') self.type = 'absolute';

		if (self.module) {
			self.root = root ? '' + root : ''+juice.root.script;
			var parts = input.split('/');

			if (parts.length == 1 || ( parts.length == 2 && CONFIG.paths[parts[0]] && !self.ext ) ) input += '/base';

			if (CONFIG.paths[parts[0]])
				self.root += '/' + CONFIG.paths[parts[0]];
			else if( parts[0] == '..' )
				self.root;
			else if (CONSTANTS.core.indexOf(parts[0]) !== -1)
				self.root += CONFIG.paths.core || '/modules/core';
			else //self.root += '/modules';
			self.root += CONFIG.paths.core || '/modules/core';

			if (self.type == 'relative' && input.slice(0, 2) === './') input = input.replace('./', self.root);
		}

		self.input = input;

		if (self.type == 'relative') {
			self.url = self.resolve();
		} else {
			self.url = self.input;
		}

	}

	JuicePath.prototype.resolve = function () {

		var self = this;
		var path = self.type == 'relative' ? self.root + '/' + self.input : self.input;
		var parts = path.split('/');
		var resolved = [];

		if (parts[parts.length - 1].indexOf('.') === -1) parts[parts.length - 1] += '.js';

		while (parts.length > 0) {
			var part = parts.shift();
			if (part == '.') continue;
			if (part == '..') {
				resolved.pop();
				continue;
			}
			resolved.push(part);
		}

		return resolved.join('/');

	}




	juice.storage = new JuceStorage();


	var loaderIndex = 0;

	var JuiceLoader = function (urls) {

		var self = this;
		new EventEmitter(this);

		function LoaderJob(url) {
			this.url = url;
			this.status = null;
			this.complete = false;
		}

		self.jobs = (typeof urls == 'string' ? [urls] : urls).map(url => new LoaderJob(url));

		self.id = 'loader-' + loaderIndex;
		loaderIndex++;
		self.index = 0;

		for (var i = 0; i < self.jobs.length; i++) {
			self.addJob(self.jobs[i]);
		}

	}

	JuiceLoader.prototype.addJob = function (job) {

		var self = this;
		var ext = job.url.split('.').pop();
		var type;

		for (var t in CONSTANTS.types) {
			if (CONSTANTS.types[t].indexOf(ext) !== -1) {
				type = t;
				break;
			}
		}

		//Default to Jvascript
		if (!type || type == 'module') type = 'javascript';
		job.type = type;
		var loadFn = CONSTANTS.schemas[type] || type == 'module' ? 'loadDom' : 'loadJS';
		self[loadFn](job);
	}

	JuiceLoader.prototype.success = function () {
		var self = this;
		clearTimeout(self.TO);
		self.emit('success');
		return;
	}

	JuiceLoader.prototype.fail = function (errors) {
		var self = this;
		debug( this.jobs );
		console.warn('error ' + this.id + ' failed to load in the allowed time.');
		self.emit('fail');
		return false;
	}

	JuiceLoader.prototype.update = function () {

		var self = this;

		var incomplete = this.jobs.filter(job => !job.complete);
		if (incomplete == 0) return self.success();

		var errors = this.jobs.filter(job => job.error);
		if (errors.length > 0) return self.fail(errors);

		return false;
	}

	JuiceLoader.prototype.ioadImage = function () {

		var item = new Image();

		itm.onload = function () {

		};

		item.src = '';
	}

	JuiceLoader.prototype.loadJS = function () {

	}

	JuiceLoader.prototype.loadDom = function (job) {
		var self = this;
		var TO;

		var url = job.url;
		var type = job.type;
		var nodeType = CONSTANTS.schemas[type];
		var id = self.id + '-' + self.index;
		self.index++;

		function success() {
			delete job.loading;
			job.complete = true;
			clearTimeout(TO);
			self.update();
		}

		function fail() {
			job.error = true;
			clearTimeout(TO);
			self.update();
		}

		var node;
		//Create Element
		if (nodeType.e) node = doc.createElement(nodeType.e);
		if (nodeType.t) node.type = nodeType.t;
		if (nodeType.r) node.rel = nodeType.r;
		//Set Attributes
		node.id = id;
		node.charset = 'utf-8';
		node.async = true;

		//Load Node Element
		if (node.readyState) {//IE
			node.onreadystatechange = function () {
				if (node.readyState === "loaded" || node.readyState === "complete") {
					node.onreadystatechange = null;
					success();
				}
			};
		} else {//Others
			node.onerror = function () {
				fail();
			}
			node.onload = function () {
				success();
			};
		}

		var nocache = true;

		if (nocache) url += '?t=' + new Date().getTime();
		node[nodeType.a] = url;

		//Add Script To Document
		doc.getElementsByTagName("head")[0].appendChild(node);

		job.loading = true;
		job.node = node;

		TO = setTimeout(fail, CONSTANTS.timeout * 1000);

		return;
	}


	function JuiceExports() {

	}


	function JuiceModule(path) {

		var self = this;
		//If Module Loaded use it
		if (juice.modules[path]) return juice.modules[path];
		new EventEmitter(self);

		debug('Created JuiceModule', path);
		juice.modules[path] = this;
		self.path = new JuicePath(path);

		self.load();
	}


	JuiceModule.prototype.define = function (path, dependants, fn, options, script ) {
		var self = this;
		debug('DEFINE', self.path.defined, arguments);
		self.dependants = dependants;
		self.fn = fn;
		self.options = options || {};
		self.extend = options.extend || [];
		self.persist = options.persist || false;
		self.require = options.require || [];
		self.include = options.include || [];
		self.prototype = options.prototype || [];
		self.script = script;
		self.defined = true;
		self.emit('defined');


		self.onAssetsReady(function () {
			debug('READY', path);
			self.ready = true;
			self.emit('ready');
			return;
		});

		return false;
	}

	JuiceModule.prototype.load = function (callback) {
		var self = this;
		debug('Mmodule Load', self.path.defined);

		new JuiceLoader(self.path.url).on('success', function () {
			debug('Mmodule Load Success', self.path.defined);
			self.loaded = true;
			self.emit('loaded');
			return false;
		}).on('fail', function () {
			self.error = 'load fail';
			debug('Mmodule Loade Fail', self.path.defined);
			return false;
		});

		return false;
	}

	JuiceModule.prototype.onAssetsReady = function (callback) {

		var self = this;
		//Create array of all deps, requires and includes
		var uses = self.extend.concat( self.dependants, self.require, self.include, self.prototype );
		debug('USES', uses);

		function loadNextDependant() {

			if (uses.length == 0) return callback();
			var path = uses.shift();

			var dependant = juice.modules[path] || new JuiceModule(path);
			
			if( dependant.ready ) return loadNextDependant();

			dependant.on('ready', loadNextDependant );

			dependant.on('fail', function () {

			});
			return false;
		}

		loadNextDependant();
		return;
	}
	
	JuiceModule.prototype.build = function ( exports, options ) {

		var self = this;
		if( !options ) options = {};
		var isRoot = !exports;
		//If module persists return previous scope
		if( self.persist && self.persistant ) return self.persistant.exports;
		

		//Define New Scope
		var scope = {
			path: self.path.defined,
			exports: exports || new JuiceExports(),
			Constructor: self.fn,
			script: self.path.url
		};

		//If "options" property of options is set re prototype it
		let proto;
		if( self.options.prototype ){
			proto = juice.modules[self.options.prototype].build();
			console.log(self.path.defined, "Proto",proto);
			//scope.exports.name = self.path.defined
			//scope.Constructor.prototype = Object.create( proto );
			
			//console.log(scope.exports);
		}

		//Set Parent
		if( options.parent ) scope.parent = options.parent;
		debug('BUILD', self.path.defined, scope);
		//Get all include modules
		var includes = self.include.map( inc => juice.modules[inc]);
		//Get all extended modules
		var extend = self.extend ? self.extend.map( ex => juice.modules[ex]) : [];
		//Get all dependants as args
		var args = self.dependants ? self.dependants.map( dep => juice.modules[dep]) : [];


		//Apply direct attrs to scope
		Object.defineProperty( scope, 'app', {
			get: function () { return juice.app; },
			set: function () { return false; }
		});

		Object.defineProperty( scope, 'module', {
			get: function () { return self; },
			set: function () { return false; }
		});

		Object.defineProperty( scope, 'juice', {
			get: function () { return juice; },
			set: function () { return false; }
		});

		Object.defineProperty( scope, 'global', {
			get: function () { return global; },
			set: function () { return false; }
		});

		Object.defineProperty( scope, 'window', {
			get: function () { return win; },
			set: cancel
		});

		Object.defineProperty( scope, 'docready', {
			get: function (  ) { 
				return false;
			},
			set: function( fn ){
				if( state.docready ) return fn();
				return hooks.docready.push( fn ); 
			}
		});

		//END Apply direct attrs to scope

		var mscope =  (function (_scope, _extend, _args, _defined, _proto ) {
			
			//If No Name is set then set name to path
			if (!_scope.exports.name) _scope.exports.name = _scope.path;
			
			//Extend Exports object
			for (var i = 0; i < _extend.length; i++) _scope.exports = _extend[i].build(_scope.exports);

			//Compile Modue Dependant Args
			var args = _args.map( dep => dep.build( undefined, { parent: _scope.exports } ) );
			
			if(_proto){
				_scope.Constructor.prototype = Object.create( _proto );
				console.log(_scope);
			}

			//Call Module Constructor and Build
			_scope.exports = _scope.Constructor.apply( _scope, args );
			
			//Defined Props: add to exports as properties
			if( _defined ){
				for( var prop in _defined ) _scope.exports[prop] = _defined[prop];
				if( _scope.exports.on ){
					_scope.exports.emit('defined');
				}
			}

			return _scope;

		})( scope, extend, args, options.define, proto );

		if( self.persist && !self.persistant ){
			//Set persistant mod for later recall
			self.persistant = mscope;
		}

		if( isRoot ){
			Object.defineProperty(mscope.exports, 'J', {
				get: function () { return mscope; },
				set: cancel
			});
		}

		return mscope.exports;

	}


	global.run = function (path) {
		return juice.registry.modules[path].build();
	}

	//Modules, Callback 
	juice.require = function ( ...args ) {
		debug( args );

		var callback;
		if (isType(args[args.length - 1], 'function')) callback = args.pop();

		//Previous Ver. Module Array
		if (isType(args[0], 'array' ) ) args = args[0];
		//Grab all Base Modules
		var assets = args.map(uri => juice.modules[uri] || new JuiceModule(uri));
		
		debug('Require Assets', assets);
		eventListener( assets, 'ready', function () {
			if (callback)
				return callback.apply(null, assets.map(asset => asset.build()));
		});

		return;
	}

	juice.app.require = juice.require;
	//path, dependants, module, options

	global.juice = juice;

	juice.new = function(dep){
		return juice.modules[dep].build();
	}

	global.define = function (...args) {

		scripts = doc.getElementsByTagName("script");
		script = scripts[scripts.length - 1];

		//If dependnts missing insert empty
		if (typeof args[1] == 'function') args.splice(1, 0, []);

		for (var i = 0; i < args[1].length; i++)
			args[1][i] = resolveDependantName(args[1][i], args[0]);

		//Insert Params If Not Defined
		if (!args[3]) args[3] = {};
		if( !args[3].extend ) args[3].extend = [];
		if (typeof args[3].extend == 'string') args[3].extend = [args[3].extend];

		for (var i = 0; i < args[3].extend.length; i++)
			args[3].extend[i] = resolveDependantName(args[3].extend[i], args[0]);

		//Initialize All Dependants
		if (args[1].length > 0) juice.require( args[1] );
		
		//Call Module Define
		juice.modules[args[0]].define( ...args );

		return false;
	}

	var preloadList = CONSTANTS.preload.slice(0);

	if (juice.preload) {

		var nextPreload = function () {

			debug('nextPreload', preloadList);
			if (preloadList.length == 0) {
				return;
			}

			var next = preloadList.shift();
			debug( next );
			if (juice.preload[next]) {

				var premodule = new JuiceModule(juice.preload[next]);
				
				premodule.once('ready', function () {
					var exports = premodule.build();
					

					if (next == 'config') CONFIG = merge(CONFIG, exports);
					debug(CONFIG);

					if( exports.ready !== undefined && !exports.ready ){
						exports.on('ready', function(){
							nextPreload();
						});
					}else{
						return nextPreload();
					}
				});

			}
		}

		nextPreload();

	}

	function callAll( fns ){
		for( var i=0;i<fns.length;i++ ) fns[i]();
	}

	function onDocReady(){

		document.removeEventListener("DOMContentLoaded", onDocReady );
		juice.page.document = document;
		juice.page.body = document.body;
		if( hooks.docready.length > 0 ){
			callAll( hooks.docready );
		}

		state.docready = true;
	}

	document.addEventListener("DOMContentLoaded", onDocReady );


})(this, window, document);
