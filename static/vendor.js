(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

// Make it safe to do console.log() always.
(function (con) {
  var method;
  var dummy = function() {};
  var methods = ('assert,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' + 
     'time,timeEnd,trace,warn').split(',');
  while (method = methods.pop()) {
    con[method] = con[method] || dummy;
  }
})(window.console = window.console || {});
;

/*!
 * jQuery JavaScript Library v1.8.2
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Thu Sep 20 2012 21:13:05 GMT-0400 (Eastern Daylight Time)
 */
(function( window, undefined ) {
var
  // A central reference to the root jQuery(document)
  rootjQuery,

  // The deferred used on DOM ready
  readyList,

  // Use the correct document accordingly with window argument (sandbox)
  document = window.document,
  location = window.location,
  navigator = window.navigator,

  // Map over jQuery in case of overwrite
  _jQuery = window.jQuery,

  // Map over the $ in case of overwrite
  _$ = window.$,

  // Save a reference to some core methods
  core_push = Array.prototype.push,
  core_slice = Array.prototype.slice,
  core_indexOf = Array.prototype.indexOf,
  core_toString = Object.prototype.toString,
  core_hasOwn = Object.prototype.hasOwnProperty,
  core_trim = String.prototype.trim,

  // Define a local copy of jQuery
  jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector, context, rootjQuery );
  },

  // Used for matching numbers
  core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

  // Used for detecting and trimming whitespace
  core_rnotwhite = /\S/,
  core_rspace = /\s+/,

  // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
  rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

  // A simple way to check for HTML strings
  // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
  rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

  // Match a standalone tag
  rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

  // JSON RegExp
  rvalidchars = /^[\],:{}\s]*$/,
  rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
  rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
  rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

  // Matches dashed string for camelizing
  rmsPrefix = /^-ms-/,
  rdashAlpha = /-([\da-z])/gi,

  // Used by jQuery.camelCase as callback to replace()
  fcamelCase = function( all, letter ) {
    return ( letter + "" ).toUpperCase();
  },

  // The ready event handler and self cleanup method
  DOMContentLoaded = function() {
    if ( document.addEventListener ) {
      document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
      jQuery.ready();
    } else if ( document.readyState === "complete" ) {
      // we're here because readyState === "complete" in oldIE
      // which is good enough for us to call the dom ready!
      document.detachEvent( "onreadystatechange", DOMContentLoaded );
      jQuery.ready();
    }
  },

  // [[Class]] -> type pairs
  class2type = {};

jQuery.fn = jQuery.prototype = {
  constructor: jQuery,
  init: function( selector, context, rootjQuery ) {
    var match, elem, ret, doc;

    // Handle $(""), $(null), $(undefined), $(false)
    if ( !selector ) {
      return this;
    }

    // Handle $(DOMElement)
    if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;
    }

    // Handle HTML strings
    if ( typeof selector === "string" ) {
      if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
        // Assume that strings that start and end with <> are HTML and skip the regex check
        match = [ null, selector, null ];

      } else {
        match = rquickExpr.exec( selector );
      }

      // Match html or make sure no context is specified for #id
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> $(array)
        if ( match[1] ) {
          context = context instanceof jQuery ? context[0] : context;
          doc = ( context && context.nodeType ? context.ownerDocument || context : document );

          // scripts is true for back-compat
          selector = jQuery.parseHTML( match[1], doc, true );
          if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
            this.attr.call( selector, context, true );
          }

          return jQuery.merge( this, selector );

        // HANDLE: $(#id)
        } else {
          elem = document.getElementById( match[2] );

          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE and Opera return items
            // by name instead of ID
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // Otherwise, we inject the element directly into the jQuery object
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

      // HANDLE: $(expr, $(...))
      } else if ( !context || context.jquery ) {
        return ( context || rootjQuery ).find( selector );

      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return this.constructor( context ).find( selector );
      }

    // HANDLE: $(function)
    // Shortcut for document ready
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    if ( selector.selector !== undefined ) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    return jQuery.makeArray( selector, this );
  },

  // Start with an empty selector
  selector: "",

  // The current version of jQuery being used
  jquery: "1.8.2",

  // The default length of a jQuery object is 0
  length: 0,

  // The number of elements contained in the matched element set
  size: function() {
    return this.length;
  },

  toArray: function() {
    return core_slice.call( this );
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function( num ) {
    return num == null ?

      // Return a 'clean' array
      this.toArray() :

      // Return just the object
      ( num < 0 ? this[ this.length + num ] : this[ num ] );
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function( elems, name, selector ) {

    // Build a new jQuery matched element set
    var ret = jQuery.merge( this.constructor(), elems );

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    ret.context = this.context;

    if ( name === "find" ) {
      ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
    } else if ( name ) {
      ret.selector = this.selector + "." + name + "(" + selector + ")";
    }

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  // (You can seed the arguments with an array of args, but this is
  // only used internally.)
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  ready: function( fn ) {
    // Add the callback
    jQuery.ready.promise().done( fn );

    return this;
  },

  eq: function( i ) {
    i = +i;
    return i === -1 ?
      this.slice( i ) :
      this.slice( i, i + 1 );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  slice: function() {
    return this.pushStack( core_slice.apply( this, arguments ),
      "slice", core_slice.call(arguments).join(",") );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function( elem, i ) {
      return callback.call( elem, i, elem );
    }));
  },

  end: function() {
    return this.prevObject || this.constructor(null);
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: core_push,
  sort: [].sort,
  splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  noConflict: function( deep ) {
    if ( window.$ === jQuery ) {
      window.$ = _$;
    }

    if ( deep && window.jQuery === jQuery ) {
      window.jQuery = _jQuery;
    }

    return jQuery;
  },

  // Is the DOM ready to be used? Set to true once it occurs.
  isReady: false,

  // A counter to track how many items to wait for before
  // the ready event fires. See #6781
  readyWait: 1,

  // Hold (or release) the ready event
  holdReady: function( hold ) {
    if ( hold ) {
      jQuery.readyWait++;
    } else {
      jQuery.ready( true );
    }
  },

  // Handle when the DOM is ready
  ready: function( wait ) {

    // Abort if there are pending holds or we're already ready
    if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
      return;
    }

    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
    if ( !document.body ) {
      return setTimeout( jQuery.ready, 1 );
    }

    // Remember that the DOM is ready
    jQuery.isReady = true;

    // If a normal DOM Ready event fired, decrement, and wait if need be
    if ( wait !== true && --jQuery.readyWait > 0 ) {
      return;
    }

    // If there are functions bound, to execute
    readyList.resolveWith( document, [ jQuery ] );

    // Trigger any bound ready events
    if ( jQuery.fn.trigger ) {
      jQuery( document ).trigger("ready").off("ready");
    }
  },

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  isFunction: function( obj ) {
    return jQuery.type(obj) === "function";
  },

  isArray: Array.isArray || function( obj ) {
    return jQuery.type(obj) === "array";
  },

  isWindow: function( obj ) {
    return obj != null && obj == obj.window;
  },

  isNumeric: function( obj ) {
    return !isNaN( parseFloat(obj) ) && isFinite( obj );
  },

  type: function( obj ) {
    return obj == null ?
      String( obj ) :
      class2type[ core_toString.call(obj) ] || "object";
  },

  isPlainObject: function( obj ) {
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      return false;
    }

    try {
      // Not own constructor property must be Object
      if ( obj.constructor &&
        !core_hasOwn.call(obj, "constructor") &&
        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for ( key in obj ) {}

    return key === undefined || core_hasOwn.call( obj, key );
  },

  isEmptyObject: function( obj ) {
    var name;
    for ( name in obj ) {
      return false;
    }
    return true;
  },

  error: function( msg ) {
    throw new Error( msg );
  },

  // data: string of html
  // context (optional): If specified, the fragment will be created in this context, defaults to document
  // scripts (optional): If true, will include scripts passed in the html string
  parseHTML: function( data, context, scripts ) {
    var parsed;
    if ( !data || typeof data !== "string" ) {
      return null;
    }
    if ( typeof context === "boolean" ) {
      scripts = context;
      context = 0;
    }
    context = context || document;

    // Single tag
    if ( (parsed = rsingleTag.exec( data )) ) {
      return [ context.createElement( parsed[1] ) ];
    }

    parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
    return jQuery.merge( [],
      (parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
  },

  parseJSON: function( data ) {
    if ( !data || typeof data !== "string") {
      return null;
    }

    // Make sure leading/trailing whitespace is removed (IE can't handle it)
    data = jQuery.trim( data );

    // Attempt to parse using the native JSON parser first
    if ( window.JSON && window.JSON.parse ) {
      return window.JSON.parse( data );
    }

    // Make sure the incoming data is actual JSON
    // Logic borrowed from http://json.org/json2.js
    if ( rvalidchars.test( data.replace( rvalidescape, "@" )
      .replace( rvalidtokens, "]" )
      .replace( rvalidbraces, "")) ) {

      return ( new Function( "return " + data ) )();

    }
    jQuery.error( "Invalid JSON: " + data );
  },

  // Cross-browser xml parsing
  parseXML: function( data ) {
    var xml, tmp;
    if ( !data || typeof data !== "string" ) {
      return null;
    }
    try {
      if ( window.DOMParser ) { // Standard
        tmp = new DOMParser();
        xml = tmp.parseFromString( data , "text/xml" );
      } else { // IE
        xml = new ActiveXObject( "Microsoft.XMLDOM" );
        xml.async = "false";
        xml.loadXML( data );
      }
    } catch( e ) {
      xml = undefined;
    }
    if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
      jQuery.error( "Invalid XML: " + data );
    }
    return xml;
  },

  noop: function() {},

  // Evaluates a script in a global context
  // Workarounds based on findings by Jim Driscoll
  // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
  globalEval: function( data ) {
    if ( data && core_rnotwhite.test( data ) ) {
      // We use execScript on Internet Explorer
      // We use an anonymous function so that context is window
      // rather than jQuery in Firefox
      ( window.execScript || function( data ) {
        window[ "eval" ].call( window, data );
      } )( data );
    }
  },

  // Convert dashed to camelCase; used by the css and data modules
  // Microsoft forgot to hump their vendor prefix (#9572)
  camelCase: function( string ) {
    return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
  },

  nodeName: function( elem, name ) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
  },

  // args is for internal usage only
  each: function( obj, callback, args ) {
    var name,
      i = 0,
      length = obj.length,
      isObj = length === undefined || jQuery.isFunction( obj );

    if ( args ) {
      if ( isObj ) {
        for ( name in obj ) {
          if ( callback.apply( obj[ name ], args ) === false ) {
            break;
          }
        }
      } else {
        for ( ; i < length; ) {
          if ( callback.apply( obj[ i++ ], args ) === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isObj ) {
        for ( name in obj ) {
          if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
            break;
          }
        }
      } else {
        for ( ; i < length; ) {
          if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
            break;
          }
        }
      }
    }

    return obj;
  },

  // Use native String.trim function wherever possible
  trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
    function( text ) {
      return text == null ?
        "" :
        core_trim.call( text );
    } :

    // Otherwise use our own trimming functionality
    function( text ) {
      return text == null ?
        "" :
        ( text + "" ).replace( rtrim, "" );
    },

  // results is for internal usage only
  makeArray: function( arr, results ) {
    var type,
      ret = results || [];

    if ( arr != null ) {
      // The window, strings (and functions) also have 'length'
      // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
      type = jQuery.type( arr );

      if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
        core_push.call( ret, arr );
      } else {
        jQuery.merge( ret, arr );
      }
    }

    return ret;
  },

  inArray: function( elem, arr, i ) {
    var len;

    if ( arr ) {
      if ( core_indexOf ) {
        return core_indexOf.call( arr, elem, i );
      }

      len = arr.length;
      i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

      for ( ; i < len; i++ ) {
        // Skip accessing in sparse arrays
        if ( i in arr && arr[ i ] === elem ) {
          return i;
        }
      }
    }

    return -1;
  },

  merge: function( first, second ) {
    var l = second.length,
      i = first.length,
      j = 0;

    if ( typeof l === "number" ) {
      for ( ; j < l; j++ ) {
        first[ i++ ] = second[ j ];
      }

    } else {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  },

  grep: function( elems, callback, inv ) {
    var retVal,
      ret = [],
      i = 0,
      length = elems.length;
    inv = !!inv;

    // Go through the array, only saving the items
    // that pass the validator function
    for ( ; i < length; i++ ) {
      retVal = !!callback( elems[ i ], i );
      if ( inv !== retVal ) {
        ret.push( elems[ i ] );
      }
    }

    return ret;
  },

  // arg is for internal usage only
  map: function( elems, callback, arg ) {
    var value, key,
      ret = [],
      i = 0,
      length = elems.length,
      // jquery objects are treated as arrays
      isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

    // Go through the array, translating each of the items to their
    if ( isArray ) {
      for ( ; i < length; i++ ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }

    // Go through every key on the object,
    } else {
      for ( key in elems ) {
        value = callback( elems[ key ], key, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }
    }

    // Flatten any nested arrays
    return ret.concat.apply( [], ret );
  },

  // A global GUID counter for objects
  guid: 1,

  // Bind a function to a context, optionally partially applying any
  // arguments.
  proxy: function( fn, context ) {
    var tmp, args, proxy;

    if ( typeof context === "string" ) {
      tmp = fn[ context ];
      context = fn;
      fn = tmp;
    }

    // Quick check to determine if target is callable, in the spec
    // this throws a TypeError, but we will just return undefined.
    if ( !jQuery.isFunction( fn ) ) {
      return undefined;
    }

    // Simulated bind
    args = core_slice.call( arguments, 2 );
    proxy = function() {
      return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
    };

    // Set the guid of unique handler to the same of original handler, so it can be removed
    proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    return proxy;
  },

  // Multifunctional method to get and set values of a collection
  // The value/s can optionally be executed if it's a function
  access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
    var exec,
      bulk = key == null,
      i = 0,
      length = elems.length;

    // Sets many values
    if ( key && typeof key === "object" ) {
      for ( i in key ) {
        jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
      }
      chainable = 1;

    // Sets one value
    } else if ( value !== undefined ) {
      // Optionally, function values get executed if exec is true
      exec = pass === undefined && jQuery.isFunction( value );

      if ( bulk ) {
        // Bulk operations only iterate when executing function values
        if ( exec ) {
          exec = fn;
          fn = function( elem, key, value ) {
            return exec.call( jQuery( elem ), value );
          };

        // Otherwise they run against the entire set
        } else {
          fn.call( elems, value );
          fn = null;
        }
      }

      if ( fn ) {
        for (; i < length; i++ ) {
          fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
        }
      }

      chainable = 1;
    }

    return chainable ?
      elems :

      // Gets
      bulk ?
        fn.call( elems ) :
        length ? fn( elems[0], key ) : emptyGet;
  },

  now: function() {
    return ( new Date() ).getTime();
  }
});

jQuery.ready.promise = function( obj ) {
  if ( !readyList ) {

    readyList = jQuery.Deferred();

    // Catch cases where $(document).ready() is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if ( document.readyState === "complete" ) {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      setTimeout( jQuery.ready, 1 );

    // Standards-based browsers support DOMContentLoaded
    } else if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", jQuery.ready, false );

    // If IE event model is used
    } else {
      // Ensure firing before onload, maybe late but safe also for iframes
      document.attachEvent( "onreadystatechange", DOMContentLoaded );

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", jQuery.ready );

      // If IE and not a frame
      // continually check to see if the document is ready
      var top = false;

      try {
        top = window.frameElement == null && document.documentElement;
      } catch(e) {}

      if ( top && top.doScroll ) {
        (function doScrollCheck() {
          if ( !jQuery.isReady ) {

            try {
              // Use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              top.doScroll("left");
            } catch(e) {
              return setTimeout( doScrollCheck, 50 );
            }

            // and execute any waiting functions
            jQuery.ready();
          }
        })();
      }
    }
  }
  return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
  var object = optionsCache[ options ] = {};
  jQuery.each( options.split( core_rspace ), function( _, flag ) {
    object[ flag ] = true;
  });
  return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *      the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:     will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:     will keep track of previous values and will call any callback added
 *          after the list has been fired right away with the latest "memorized"
 *          values (like a Deferred)
 *
 *  unique:     will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:  interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

  // Convert options from String-formatted to Object-formatted if needed
  // (we check in cache first)
  options = typeof options === "string" ?
    ( optionsCache[ options ] || createOptions( options ) ) :
    jQuery.extend( {}, options );

  var // Last fire value (for non-forgettable lists)
    memory,
    // Flag to know if list was already fired
    fired,
    // Flag to know if list is currently firing
    firing,
    // First callback to fire (used internally by add and fireWith)
    firingStart,
    // End of the loop when firing
    firingLength,
    // Index of currently firing callback (modified by remove if needed)
    firingIndex,
    // Actual callback list
    list = [],
    // Stack of fire calls for repeatable lists
    stack = !options.once && [],
    // Fire callbacks
    fire = function( data ) {
      memory = options.memory && data;
      fired = true;
      firingIndex = firingStart || 0;
      firingStart = 0;
      firingLength = list.length;
      firing = true;
      for ( ; list && firingIndex < firingLength; firingIndex++ ) {
        if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
          memory = false; // To prevent further calls using add
          break;
        }
      }
      firing = false;
      if ( list ) {
        if ( stack ) {
          if ( stack.length ) {
            fire( stack.shift() );
          }
        } else if ( memory ) {
          list = [];
        } else {
          self.disable();
        }
      }
    },
    // Actual Callbacks object
    self = {
      // Add a callback or a collection of callbacks to the list
      add: function() {
        if ( list ) {
          // First, we save the current length
          var start = list.length;
          (function add( args ) {
            jQuery.each( args, function( _, arg ) {
              var type = jQuery.type( arg );
              if ( type === "function" && ( !options.unique || !self.has( arg ) ) ) {
                list.push( arg );
              } else if ( arg && arg.length && type !== "string" ) {
                // Inspect recursively
                add( arg );
              }
            });
          })( arguments );
          // Do we need to add the callbacks to the
          // current firing batch?
          if ( firing ) {
            firingLength = list.length;
          // With memory, if we're not firing then
          // we should call right away
          } else if ( memory ) {
            firingStart = start;
            fire( memory );
          }
        }
        return this;
      },
      // Remove a callback from the list
      remove: function() {
        if ( list ) {
          jQuery.each( arguments, function( _, arg ) {
            var index;
            while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
              list.splice( index, 1 );
              // Handle firing indexes
              if ( firing ) {
                if ( index <= firingLength ) {
                  firingLength--;
                }
                if ( index <= firingIndex ) {
                  firingIndex--;
                }
              }
            }
          });
        }
        return this;
      },
      // Control if a given callback is in the list
      has: function( fn ) {
        return jQuery.inArray( fn, list ) > -1;
      },
      // Remove all callbacks from the list
      empty: function() {
        list = [];
        return this;
      },
      // Have the list do nothing anymore
      disable: function() {
        list = stack = memory = undefined;
        return this;
      },
      // Is it disabled?
      disabled: function() {
        return !list;
      },
      // Lock the list in its current state
      lock: function() {
        stack = undefined;
        if ( !memory ) {
          self.disable();
        }
        return this;
      },
      // Is it locked?
      locked: function() {
        return !stack;
      },
      // Call all callbacks with the given context and arguments
      fireWith: function( context, args ) {
        args = args || [];
        args = [ context, args.slice ? args.slice() : args ];
        if ( list && ( !fired || stack ) ) {
          if ( firing ) {
            stack.push( args );
          } else {
            fire( args );
          }
        }
        return this;
      },
      // Call all the callbacks with the given arguments
      fire: function() {
        self.fireWith( this, arguments );
        return this;
      },
      // To know if the callbacks have already been called at least once
      fired: function() {
        return !!fired;
      }
    };

  return self;
};
jQuery.extend({

  Deferred: function( func ) {
    var tuples = [
        // action, add listener, listener list, final state
        [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
        [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
        [ "notify", "progress", jQuery.Callbacks("memory") ]
      ],
      state = "pending",
      promise = {
        state: function() {
          return state;
        },
        always: function() {
          deferred.done( arguments ).fail( arguments );
          return this;
        },
        then: function( /* fnDone, fnFail, fnProgress */ ) {
          var fns = arguments;
          return jQuery.Deferred(function( newDefer ) {
            jQuery.each( tuples, function( i, tuple ) {
              var action = tuple[ 0 ],
                fn = fns[ i ];
              // deferred[ done | fail | progress ] for forwarding actions to newDefer
              deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
                function() {
                  var returned = fn.apply( this, arguments );
                  if ( returned && jQuery.isFunction( returned.promise ) ) {
                    returned.promise()
                      .done( newDefer.resolve )
                      .fail( newDefer.reject )
                      .progress( newDefer.notify );
                  } else {
                    newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
                  }
                } :
                newDefer[ action ]
              );
            });
            fns = null;
          }).promise();
        },
        // Get a promise for this deferred
        // If obj is provided, the promise aspect is added to the object
        promise: function( obj ) {
          return obj != null ? jQuery.extend( obj, promise ) : promise;
        }
      },
      deferred = {};

    // Keep pipe for back-compat
    promise.pipe = promise.then;

    // Add list-specific methods
    jQuery.each( tuples, function( i, tuple ) {
      var list = tuple[ 2 ],
        stateString = tuple[ 3 ];

      // promise[ done | fail | progress ] = list.add
      promise[ tuple[1] ] = list.add;

      // Handle state
      if ( stateString ) {
        list.add(function() {
          // state = [ resolved | rejected ]
          state = stateString;

        // [ reject_list | resolve_list ].disable; progress_list.lock
        }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
      }

      // deferred[ resolve | reject | notify ] = list.fire
      deferred[ tuple[0] ] = list.fire;
      deferred[ tuple[0] + "With" ] = list.fireWith;
    });

    // Make the deferred a promise
    promise.promise( deferred );

    // Call given func if any
    if ( func ) {
      func.call( deferred, deferred );
    }

    // All done!
    return deferred;
  },

  // Deferred helper
  when: function( subordinate /* , ..., subordinateN */ ) {
    var i = 0,
      resolveValues = core_slice.call( arguments ),
      length = resolveValues.length,

      // the count of uncompleted subordinates
      remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

      // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
      deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

      // Update function for both resolve and progress values
      updateFunc = function( i, contexts, values ) {
        return function( value ) {
          contexts[ i ] = this;
          values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
          if( values === progressValues ) {
            deferred.notifyWith( contexts, values );
          } else if ( !( --remaining ) ) {
            deferred.resolveWith( contexts, values );
          }
        };
      },

      progressValues, progressContexts, resolveContexts;

    // add listeners to Deferred subordinates; treat others as resolved
    if ( length > 1 ) {
      progressValues = new Array( length );
      progressContexts = new Array( length );
      resolveContexts = new Array( length );
      for ( ; i < length; i++ ) {
        if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
          resolveValues[ i ].promise()
            .done( updateFunc( i, resolveContexts, resolveValues ) )
            .fail( deferred.reject )
            .progress( updateFunc( i, progressContexts, progressValues ) );
        } else {
          --remaining;
        }
      }
    }

    // if we're not waiting on anything, resolve the master
    if ( !remaining ) {
      deferred.resolveWith( resolveContexts, resolveValues );
    }

    return deferred.promise();
  }
});
jQuery.support = (function() {

  var support,
    all,
    a,
    select,
    opt,
    input,
    fragment,
    eventName,
    i,
    isSupported,
    clickFn,
    div = document.createElement("div");

  // Preliminary tests
  div.setAttribute( "className", "t" );
  div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

  all = div.getElementsByTagName("*");
  a = div.getElementsByTagName("a")[ 0 ];
  a.style.cssText = "top:1px;float:left;opacity:.5";

  // Can't get basic test support
  if ( !all || !all.length ) {
    return {};
  }

  // First batch of supports tests
  select = document.createElement("select");
  opt = select.appendChild( document.createElement("option") );
  input = div.getElementsByTagName("input")[ 0 ];

  support = {
    // IE strips leading whitespace when .innerHTML is used
    leadingWhitespace: ( div.firstChild.nodeType === 3 ),

    // Make sure that tbody elements aren't automatically inserted
    // IE will insert them into empty tables
    tbody: !div.getElementsByTagName("tbody").length,

    // Make sure that link elements get serialized correctly by innerHTML
    // This requires a wrapper element in IE
    htmlSerialize: !!div.getElementsByTagName("link").length,

    // Get the style information from getAttribute
    // (IE uses .cssText instead)
    style: /top/.test( a.getAttribute("style") ),

    // Make sure that URLs aren't manipulated
    // (IE normalizes it by default)
    hrefNormalized: ( a.getAttribute("href") === "/a" ),

    // Make sure that element opacity exists
    // (IE uses filter instead)
    // Use a regex to work around a WebKit issue. See #5145
    opacity: /^0.5/.test( a.style.opacity ),

    // Verify style float existence
    // (IE uses styleFloat instead of cssFloat)
    cssFloat: !!a.style.cssFloat,

    // Make sure that if no value is specified for a checkbox
    // that it defaults to "on".
    // (WebKit defaults to "" instead)
    checkOn: ( input.value === "on" ),

    // Make sure that a selected-by-default option has a working selected property.
    // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
    optSelected: opt.selected,

    // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
    getSetAttribute: div.className !== "t",

    // Tests for enctype support on a form(#6743)
    enctype: !!document.createElement("form").enctype,

    // Makes sure cloning an html5 element does not cause problems
    // Where outerHTML is undefined, this still works
    html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

    // jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
    boxModel: ( document.compatMode === "CSS1Compat" ),

    // Will be defined later
    submitBubbles: true,
    changeBubbles: true,
    focusinBubbles: false,
    deleteExpando: true,
    noCloneEvent: true,
    inlineBlockNeedsLayout: false,
    shrinkWrapBlocks: false,
    reliableMarginRight: true,
    boxSizingReliable: true,
    pixelPosition: false
  };

  // Make sure checked status is properly cloned
  input.checked = true;
  support.noCloneChecked = input.cloneNode( true ).checked;

  // Make sure that the options inside disabled selects aren't marked as disabled
  // (WebKit marks them as disabled)
  select.disabled = true;
  support.optDisabled = !opt.disabled;

  // Test to see if it's possible to delete an expando from an element
  // Fails in Internet Explorer
  try {
    delete div.test;
  } catch( e ) {
    support.deleteExpando = false;
  }

  if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
    div.attachEvent( "onclick", clickFn = function() {
      // Cloning a node shouldn't copy over any
      // bound event handlers (IE does this)
      support.noCloneEvent = false;
    });
    div.cloneNode( true ).fireEvent("onclick");
    div.detachEvent( "onclick", clickFn );
  }

  // Check if a radio maintains its value
  // after being appended to the DOM
  input = document.createElement("input");
  input.value = "t";
  input.setAttribute( "type", "radio" );
  support.radioValue = input.value === "t";

  input.setAttribute( "checked", "checked" );

  // #11217 - WebKit loses check when the name is after the checked attribute
  input.setAttribute( "name", "t" );

  div.appendChild( input );
  fragment = document.createDocumentFragment();
  fragment.appendChild( div.lastChild );

  // WebKit doesn't clone checked state correctly in fragments
  support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

  // Check if a disconnected checkbox will retain its checked
  // value of true after appended to the DOM (IE6/7)
  support.appendChecked = input.checked;

  fragment.removeChild( input );
  fragment.appendChild( div );

  // Technique from Juriy Zaytsev
  // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
  // We only care about the case where non-standard event systems
  // are used, namely in IE. Short-circuiting here helps us to
  // avoid an eval call (in setAttribute) which can cause CSP
  // to go haywire. See: https://developer.mozilla.org/en/Security/CSP
  if ( div.attachEvent ) {
    for ( i in {
      submit: true,
      change: true,
      focusin: true
    }) {
      eventName = "on" + i;
      isSupported = ( eventName in div );
      if ( !isSupported ) {
        div.setAttribute( eventName, "return;" );
        isSupported = ( typeof div[ eventName ] === "function" );
      }
      support[ i + "Bubbles" ] = isSupported;
    }
  }

  // Run tests that need a body at doc ready
  jQuery(function() {
    var container, div, tds, marginDiv,
      divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
      body = document.getElementsByTagName("body")[0];

    if ( !body ) {
      // Return for frameset docs that don't have a body
      return;
    }

    container = document.createElement("div");
    container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
    body.insertBefore( container, body.firstChild );

    // Construct the test element
    div = document.createElement("div");
    container.appendChild( div );

    // Check if table cells still have offsetWidth/Height when they are set
    // to display:none and there are still other visible table cells in a
    // table row; if so, offsetWidth/Height are not reliable for use when
    // determining if an element has been hidden directly using
    // display:none (it is still safe to use offsets if a parent element is
    // hidden; don safety goggles and see bug #4512 for more information).
    // (only IE 8 fails this test)
    div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
    tds = div.getElementsByTagName("td");
    tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
    isSupported = ( tds[ 0 ].offsetHeight === 0 );

    tds[ 0 ].style.display = "";
    tds[ 1 ].style.display = "none";

    // Check if empty table cells still have offsetWidth/Height
    // (IE <= 8 fail this test)
    support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

    // Check box-sizing and margin behavior
    div.innerHTML = "";
    div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
    support.boxSizing = ( div.offsetWidth === 4 );
    support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

    // NOTE: To any future maintainer, we've window.getComputedStyle
    // because jsdom on node.js will break without it.
    if ( window.getComputedStyle ) {
      support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
      support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

      // Check if div with explicit width and no margin-right incorrectly
      // gets computed margin-right based on width of container. For more
      // info see bug #3333
      // Fails in WebKit before Feb 2011 nightlies
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      marginDiv = document.createElement("div");
      marginDiv.style.cssText = div.style.cssText = divReset;
      marginDiv.style.marginRight = marginDiv.style.width = "0";
      div.style.width = "1px";
      div.appendChild( marginDiv );
      support.reliableMarginRight =
        !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
    }

    if ( typeof div.style.zoom !== "undefined" ) {
      // Check if natively block-level elements act like inline-block
      // elements when setting their display to 'inline' and giving
      // them layout
      // (IE < 8 does this)
      div.innerHTML = "";
      div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
      support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

      // Check if elements with layout shrink-wrap their children
      // (IE 6 does this)
      div.style.display = "block";
      div.style.overflow = "visible";
      div.innerHTML = "<div></div>";
      div.firstChild.style.width = "5px";
      support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

      container.style.zoom = 1;
    }

    // Null elements to avoid leaks in IE
    body.removeChild( container );
    container = div = tds = marginDiv = null;
  });

  // Null elements to avoid leaks in IE
  fragment.removeChild( div );
  all = a = select = opt = input = fragment = div = null;

  return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
  rmultiDash = /([A-Z])/g;

jQuery.extend({
  cache: {},

  deletedIds: [],

  // Remove at next major release (1.9/2.0)
  uuid: 0,

  // Unique for each copy of jQuery on the page
  // Non-digits removed to match rinlinejQuery
  expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

  // The following elements throw uncatchable exceptions if you
  // attempt to add expando properties to them.
  noData: {
    "embed": true,
    // Ban all objects except for Flash (which handle expandos)
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
    "applet": true
  },

  hasData: function( elem ) {
    elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
    return !!elem && !isEmptyDataObject( elem );
  },

  data: function( elem, name, data, pvt /* Internal Use Only */ ) {
    if ( !jQuery.acceptData( elem ) ) {
      return;
    }

    var thisCache, ret,
      internalKey = jQuery.expando,
      getByName = typeof name === "string",

      // We have to handle DOM nodes and JS objects differently because IE6-7
      // can't GC object references properly across the DOM-JS boundary
      isNode = elem.nodeType,

      // Only DOM nodes need the global jQuery cache; JS object data is
      // attached directly to the object so GC can occur automatically
      cache = isNode ? jQuery.cache : elem,

      // Only defining an ID for JS objects if its cache already exists allows
      // the code to shortcut on the same path as a DOM node with no cache
      id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

    // Avoid doing any more work than we need to when trying to get data on an
    // object that has no data at all
    if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
      return;
    }

    if ( !id ) {
      // Only DOM nodes need a new unique ID for each element since their data
      // ends up in the global cache
      if ( isNode ) {
        elem[ internalKey ] = id = jQuery.deletedIds.pop() || jQuery.guid++;
      } else {
        id = internalKey;
      }
    }

    if ( !cache[ id ] ) {
      cache[ id ] = {};

      // Avoids exposing jQuery metadata on plain JS objects when the object
      // is serialized using JSON.stringify
      if ( !isNode ) {
        cache[ id ].toJSON = jQuery.noop;
      }
    }

    // An object can be passed to jQuery.data instead of a key/value pair; this gets
    // shallow copied over onto the existing cache
    if ( typeof name === "object" || typeof name === "function" ) {
      if ( pvt ) {
        cache[ id ] = jQuery.extend( cache[ id ], name );
      } else {
        cache[ id ].data = jQuery.extend( cache[ id ].data, name );
      }
    }

    thisCache = cache[ id ];

    // jQuery data() is stored in a separate object inside the object's internal data
    // cache in order to avoid key collisions between internal data and user-defined
    // data.
    if ( !pvt ) {
      if ( !thisCache.data ) {
        thisCache.data = {};
      }

      thisCache = thisCache.data;
    }

    if ( data !== undefined ) {
      thisCache[ jQuery.camelCase( name ) ] = data;
    }

    // Check for both converted-to-camel and non-converted data property names
    // If a data property was specified
    if ( getByName ) {

      // First Try to find as-is property data
      ret = thisCache[ name ];

      // Test for null|undefined property data
      if ( ret == null ) {

        // Try to find the camelCased property
        ret = thisCache[ jQuery.camelCase( name ) ];
      }
    } else {
      ret = thisCache;
    }

    return ret;
  },

  removeData: function( elem, name, pvt /* Internal Use Only */ ) {
    if ( !jQuery.acceptData( elem ) ) {
      return;
    }

    var thisCache, i, l,

      isNode = elem.nodeType,

      // See jQuery.data for more information
      cache = isNode ? jQuery.cache : elem,
      id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

    // If there is already no cache entry for this object, there is no
    // purpose in continuing
    if ( !cache[ id ] ) {
      return;
    }

    if ( name ) {

      thisCache = pvt ? cache[ id ] : cache[ id ].data;

      if ( thisCache ) {

        // Support array or space separated string names for data keys
        if ( !jQuery.isArray( name ) ) {

          // try the string as a key before any manipulation
          if ( name in thisCache ) {
            name = [ name ];
          } else {

            // split the camel cased version by spaces unless a key with the spaces exists
            name = jQuery.camelCase( name );
            if ( name in thisCache ) {
              name = [ name ];
            } else {
              name = name.split(" ");
            }
          }
        }

        for ( i = 0, l = name.length; i < l; i++ ) {
          delete thisCache[ name[i] ];
        }

        // If there is no data left in the cache, we want to continue
        // and let the cache object itself get destroyed
        if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
          return;
        }
      }
    }

    // See jQuery.data for more information
    if ( !pvt ) {
      delete cache[ id ].data;

      // Don't destroy the parent cache unless the internal data object
      // had been the only thing left in it
      if ( !isEmptyDataObject( cache[ id ] ) ) {
        return;
      }
    }

    // Destroy the cache
    if ( isNode ) {
      jQuery.cleanData( [ elem ], true );

    // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
    } else if ( jQuery.support.deleteExpando || cache != cache.window ) {
      delete cache[ id ];

    // When all else fails, null
    } else {
      cache[ id ] = null;
    }
  },

  // For internal use only.
  _data: function( elem, name, data ) {
    return jQuery.data( elem, name, data, true );
  },

  // A method for determining if a DOM node can handle the data expando
  acceptData: function( elem ) {
    var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

    // nodes accept data unless otherwise specified; rejection can be conditional
    return !noData || noData !== true && elem.getAttribute("classid") === noData;
  }
});

jQuery.fn.extend({
  data: function( key, value ) {
    var parts, part, attr, name, l,
      elem = this[0],
      i = 0,
      data = null;

    // Gets all values
    if ( key === undefined ) {
      if ( this.length ) {
        data = jQuery.data( elem );

        if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
          attr = elem.attributes;
          for ( l = attr.length; i < l; i++ ) {
            name = attr[i].name;

            if ( !name.indexOf( "data-" ) ) {
              name = jQuery.camelCase( name.substring(5) );

              dataAttr( elem, name, data[ name ] );
            }
          }
          jQuery._data( elem, "parsedAttrs", true );
        }
      }

      return data;
    }

    // Sets multiple values
    if ( typeof key === "object" ) {
      return this.each(function() {
        jQuery.data( this, key );
      });
    }

    parts = key.split( ".", 2 );
    parts[1] = parts[1] ? "." + parts[1] : "";
    part = parts[1] + "!";

    return jQuery.access( this, function( value ) {

      if ( value === undefined ) {
        data = this.triggerHandler( "getData" + part, [ parts[0] ] );

        // Try to fetch any internally stored data first
        if ( data === undefined && elem ) {
          data = jQuery.data( elem, key );
          data = dataAttr( elem, key, data );
        }

        return data === undefined && parts[1] ?
          this.data( parts[0] ) :
          data;
      }

      parts[1] = value;
      this.each(function() {
        var self = jQuery( this );

        self.triggerHandler( "setData" + part, parts );
        jQuery.data( this, key, value );
        self.triggerHandler( "changeData" + part, parts );
      });
    }, null, value, arguments.length > 1, null, false );
  },

  removeData: function( key ) {
    return this.each(function() {
      jQuery.removeData( this, key );
    });
  }
});

function dataAttr( elem, key, data ) {
  // If nothing was found internally, try to fetch any
  // data from the HTML5 data-* attribute
  if ( data === undefined && elem.nodeType === 1 ) {

    var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

    data = elem.getAttribute( name );

    if ( typeof data === "string" ) {
      try {
        data = data === "true" ? true :
        data === "false" ? false :
        data === "null" ? null :
        // Only convert to a number if it doesn't change the string
        +data + "" === data ? +data :
        rbrace.test( data ) ? jQuery.parseJSON( data ) :
          data;
      } catch( e ) {}

      // Make sure we set the data so it isn't changed later
      jQuery.data( elem, key, data );

    } else {
      data = undefined;
    }
  }

  return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
  var name;
  for ( name in obj ) {

    // if the public data object is empty, the private is still empty
    if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
      continue;
    }
    if ( name !== "toJSON" ) {
      return false;
    }
  }

  return true;
}
jQuery.extend({
  queue: function( elem, type, data ) {
    var queue;

    if ( elem ) {
      type = ( type || "fx" ) + "queue";
      queue = jQuery._data( elem, type );

      // Speed up dequeue by getting out quickly if this is just a lookup
      if ( data ) {
        if ( !queue || jQuery.isArray(data) ) {
          queue = jQuery._data( elem, type, jQuery.makeArray(data) );
        } else {
          queue.push( data );
        }
      }
      return queue || [];
    }
  },

  dequeue: function( elem, type ) {
    type = type || "fx";

    var queue = jQuery.queue( elem, type ),
      startLength = queue.length,
      fn = queue.shift(),
      hooks = jQuery._queueHooks( elem, type ),
      next = function() {
        jQuery.dequeue( elem, type );
      };

    // If the fx queue is dequeued, always remove the progress sentinel
    if ( fn === "inprogress" ) {
      fn = queue.shift();
      startLength--;
    }

    if ( fn ) {

      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      if ( type === "fx" ) {
        queue.unshift( "inprogress" );
      }

      // clear up the last queue stop function
      delete hooks.stop;
      fn.call( elem, next, hooks );
    }

    if ( !startLength && hooks ) {
      hooks.empty.fire();
    }
  },

  // not intended for public consumption - generates a queueHooks object, or returns the current one
  _queueHooks: function( elem, type ) {
    var key = type + "queueHooks";
    return jQuery._data( elem, key ) || jQuery._data( elem, key, {
      empty: jQuery.Callbacks("once memory").add(function() {
        jQuery.removeData( elem, type + "queue", true );
        jQuery.removeData( elem, key, true );
      })
    });
  }
});

jQuery.fn.extend({
  queue: function( type, data ) {
    var setter = 2;

    if ( typeof type !== "string" ) {
      data = type;
      type = "fx";
      setter--;
    }

    if ( arguments.length < setter ) {
      return jQuery.queue( this[0], type );
    }

    return data === undefined ?
      this :
      this.each(function() {
        var queue = jQuery.queue( this, type, data );

        // ensure a hooks for this queue
        jQuery._queueHooks( this, type );

        if ( type === "fx" && queue[0] !== "inprogress" ) {
          jQuery.dequeue( this, type );
        }
      });
  },
  dequeue: function( type ) {
    return this.each(function() {
      jQuery.dequeue( this, type );
    });
  },
  // Based off of the plugin by Clint Helfers, with permission.
  // http://blindsignals.com/index.php/2009/07/jquery-delay/
  delay: function( time, type ) {
    time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
    type = type || "fx";

    return this.queue( type, function( next, hooks ) {
      var timeout = setTimeout( next, time );
      hooks.stop = function() {
        clearTimeout( timeout );
      };
    });
  },
  clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
  },
  // Get a promise resolved when queues of a certain type
  // are emptied (fx is the type by default)
  promise: function( type, obj ) {
    var tmp,
      count = 1,
      defer = jQuery.Deferred(),
      elements = this,
      i = this.length,
      resolve = function() {
        if ( !( --count ) ) {
          defer.resolveWith( elements, [ elements ] );
        }
      };

    if ( typeof type !== "string" ) {
      obj = type;
      type = undefined;
    }
    type = type || "fx";

    while( i-- ) {
      tmp = jQuery._data( elements[ i ], type + "queueHooks" );
      if ( tmp && tmp.empty ) {
        count++;
        tmp.empty.add( resolve );
      }
    }
    resolve();
    return defer.promise( obj );
  }
});
var nodeHook, boolHook, fixSpecified,
  rclass = /[\t\r\n]/g,
  rreturn = /\r/g,
  rtype = /^(?:button|input)$/i,
  rfocusable = /^(?:button|input|object|select|textarea)$/i,
  rclickable = /^a(?:rea|)$/i,
  rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
  getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
  attr: function( name, value ) {
    return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
  },

  removeAttr: function( name ) {
    return this.each(function() {
      jQuery.removeAttr( this, name );
    });
  },

  prop: function( name, value ) {
    return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
  },

  removeProp: function( name ) {
    name = jQuery.propFix[ name ] || name;
    return this.each(function() {
      // try/catch handles cases where IE balks (such as removing a property on window)
      try {
        this[ name ] = undefined;
        delete this[ name ];
      } catch( e ) {}
    });
  },

  addClass: function( value ) {
    var classNames, i, l, elem,
      setClass, c, cl;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).addClass( value.call(this, j, this.className) );
      });
    }

    if ( value && typeof value === "string" ) {
      classNames = value.split( core_rspace );

      for ( i = 0, l = this.length; i < l; i++ ) {
        elem = this[ i ];

        if ( elem.nodeType === 1 ) {
          if ( !elem.className && classNames.length === 1 ) {
            elem.className = value;

          } else {
            setClass = " " + elem.className + " ";

            for ( c = 0, cl = classNames.length; c < cl; c++ ) {
              if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
                setClass += classNames[ c ] + " ";
              }
            }
            elem.className = jQuery.trim( setClass );
          }
        }
      }
    }

    return this;
  },

  removeClass: function( value ) {
    var removes, className, elem, c, cl, i, l;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).removeClass( value.call(this, j, this.className) );
      });
    }
    if ( (value && typeof value === "string") || value === undefined ) {
      removes = ( value || "" ).split( core_rspace );

      for ( i = 0, l = this.length; i < l; i++ ) {
        elem = this[ i ];
        if ( elem.nodeType === 1 && elem.className ) {

          className = (" " + elem.className + " ").replace( rclass, " " );

          // loop over each item in the removal list
          for ( c = 0, cl = removes.length; c < cl; c++ ) {
            // Remove until there is nothing to remove,
            while ( className.indexOf(" " + removes[ c ] + " ") >= 0 ) {
              className = className.replace( " " + removes[ c ] + " " , " " );
            }
          }
          elem.className = value ? jQuery.trim( className ) : "";
        }
      }
    }

    return this;
  },

  toggleClass: function( value, stateVal ) {
    var type = typeof value,
      isBool = typeof stateVal === "boolean";

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( i ) {
        jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
      });
    }

    return this.each(function() {
      if ( type === "string" ) {
        // toggle individual class names
        var className,
          i = 0,
          self = jQuery( this ),
          state = stateVal,
          classNames = value.split( core_rspace );

        while ( (className = classNames[ i++ ]) ) {
          // check each className given, space separated list
          state = isBool ? state : !self.hasClass( className );
          self[ state ? "addClass" : "removeClass" ]( className );
        }

      } else if ( type === "undefined" || type === "boolean" ) {
        if ( this.className ) {
          // store className if set
          jQuery._data( this, "__className__", this.className );
        }

        // toggle whole className
        this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
      }
    });
  },

  hasClass: function( selector ) {
    var className = " " + selector + " ",
      i = 0,
      l = this.length;
    for ( ; i < l; i++ ) {
      if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
        return true;
      }
    }

    return false;
  },

  val: function( value ) {
    var hooks, ret, isFunction,
      elem = this[0];

    if ( !arguments.length ) {
      if ( elem ) {
        hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

        if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
          return ret;
        }

        ret = elem.value;

        return typeof ret === "string" ?
          // handle most common string cases
          ret.replace(rreturn, "") :
          // handle cases where value is null/undef or number
          ret == null ? "" : ret;
      }

      return;
    }

    isFunction = jQuery.isFunction( value );

    return this.each(function( i ) {
      var val,
        self = jQuery(this);

      if ( this.nodeType !== 1 ) {
        return;
      }

      if ( isFunction ) {
        val = value.call( this, i, self.val() );
      } else {
        val = value;
      }

      // Treat null/undefined as ""; convert numbers to string
      if ( val == null ) {
        val = "";
      } else if ( typeof val === "number" ) {
        val += "";
      } else if ( jQuery.isArray( val ) ) {
        val = jQuery.map(val, function ( value ) {
          return value == null ? "" : value + "";
        });
      }

      hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

      // If set returns undefined, fall back to normal setting
      if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
        this.value = val;
      }
    });
  }
});

jQuery.extend({
  valHooks: {
    option: {
      get: function( elem ) {
        // attributes.value is undefined in Blackberry 4.7 but
        // uses .value. See #6932
        var val = elem.attributes.value;
        return !val || val.specified ? elem.value : elem.text;
      }
    },
    select: {
      get: function( elem ) {
        var value, i, max, option,
          index = elem.selectedIndex,
          values = [],
          options = elem.options,
          one = elem.type === "select-one";

        // Nothing was selected
        if ( index < 0 ) {
          return null;
        }

        // Loop through all the selected options
        i = one ? index : 0;
        max = one ? index + 1 : options.length;
        for ( ; i < max; i++ ) {
          option = options[ i ];

          // Don't return options that are disabled or in a disabled optgroup
          if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
              (!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

            // Get the specific value for the option
            value = jQuery( option ).val();

            // We don't need an array for one selects
            if ( one ) {
              return value;
            }

            // Multi-Selects return an array
            values.push( value );
          }
        }

        // Fixes Bug #2551 -- select.val() broken in IE after form.reset()
        if ( one && !values.length && options.length ) {
          return jQuery( options[ index ] ).val();
        }

        return values;
      },

      set: function( elem, value ) {
        var values = jQuery.makeArray( value );

        jQuery(elem).find("option").each(function() {
          this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
        });

        if ( !values.length ) {
          elem.selectedIndex = -1;
        }
        return values;
      }
    }
  },

  // Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
  attrFn: {},

  attr: function( elem, name, value, pass ) {
    var ret, hooks, notxml,
      nType = elem.nodeType;

    // don't get/set attributes on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
      return jQuery( elem )[ name ]( value );
    }

    // Fallback to prop when attributes are not supported
    if ( typeof elem.getAttribute === "undefined" ) {
      return jQuery.prop( elem, name, value );
    }

    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    // All attributes are lowercase
    // Grab necessary hook if one is defined
    if ( notxml ) {
      name = name.toLowerCase();
      hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
    }

    if ( value !== undefined ) {

      if ( value === null ) {
        jQuery.removeAttr( elem, name );
        return;

      } else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        elem.setAttribute( name, value + "" );
        return value;
      }

    } else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
      return ret;

    } else {

      ret = elem.getAttribute( name );

      // Non-existent attributes return null, we normalize to undefined
      return ret === null ?
        undefined :
        ret;
    }
  },

  removeAttr: function( elem, value ) {
    var propName, attrNames, name, isBool,
      i = 0;

    if ( value && elem.nodeType === 1 ) {

      attrNames = value.split( core_rspace );

      for ( ; i < attrNames.length; i++ ) {
        name = attrNames[ i ];

        if ( name ) {
          propName = jQuery.propFix[ name ] || name;
          isBool = rboolean.test( name );

          // See #9699 for explanation of this approach (setting first, then removal)
          // Do not do this for boolean attributes (see #10870)
          if ( !isBool ) {
            jQuery.attr( elem, name, "" );
          }
          elem.removeAttribute( getSetAttribute ? name : propName );

          // Set corresponding property to false for boolean attributes
          if ( isBool && propName in elem ) {
            elem[ propName ] = false;
          }
        }
      }
    }
  },

  attrHooks: {
    type: {
      set: function( elem, value ) {
        // We can't allow the type property to be changed (since it causes problems in IE)
        if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
          jQuery.error( "type property can't be changed" );
        } else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
          // Setting the type on a radio button after the value resets the value in IE6-9
          // Reset value to it's default in case type is set after value
          // This is for element creation
          var val = elem.value;
          elem.setAttribute( "type", value );
          if ( val ) {
            elem.value = val;
          }
          return value;
        }
      }
    },
    // Use the value property for back compat
    // Use the nodeHook for button elements in IE6/7 (#1954)
    value: {
      get: function( elem, name ) {
        if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
          return nodeHook.get( elem, name );
        }
        return name in elem ?
          elem.value :
          null;
      },
      set: function( elem, value, name ) {
        if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
          return nodeHook.set( elem, value, name );
        }
        // Does not return so that setAttribute is also used
        elem.value = value;
      }
    }
  },

  propFix: {
    tabindex: "tabIndex",
    readonly: "readOnly",
    "for": "htmlFor",
    "class": "className",
    maxlength: "maxLength",
    cellspacing: "cellSpacing",
    cellpadding: "cellPadding",
    rowspan: "rowSpan",
    colspan: "colSpan",
    usemap: "useMap",
    frameborder: "frameBorder",
    contenteditable: "contentEditable"
  },

  prop: function( elem, name, value ) {
    var ret, hooks, notxml,
      nType = elem.nodeType;

    // don't get/set properties on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    if ( notxml ) {
      // Fix name and attach hooks
      name = jQuery.propFix[ name ] || name;
      hooks = jQuery.propHooks[ name ];
    }

    if ( value !== undefined ) {
      if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        return ( elem[ name ] = value );
      }

    } else {
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
        return ret;

      } else {
        return elem[ name ];
      }
    }
  },

  propHooks: {
    tabIndex: {
      get: function( elem ) {
        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        var attributeNode = elem.getAttributeNode("tabindex");

        return attributeNode && attributeNode.specified ?
          parseInt( attributeNode.value, 10 ) :
          rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
            0 :
            undefined;
      }
    }
  }
});

// Hook for boolean attributes
boolHook = {
  get: function( elem, name ) {
    // Align boolean attributes with corresponding properties
    // Fall back to attribute presence where some booleans are not supported
    var attrNode,
      property = jQuery.prop( elem, name );
    return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
      name.toLowerCase() :
      undefined;
  },
  set: function( elem, value, name ) {
    var propName;
    if ( value === false ) {
      // Remove boolean attributes when set to false
      jQuery.removeAttr( elem, name );
    } else {
      // value is true since we know at this point it's type boolean and not false
      // Set boolean attributes to the same name and set the DOM property
      propName = jQuery.propFix[ name ] || name;
      if ( propName in elem ) {
        // Only set the IDL specifically if it already exists on the element
        elem[ propName ] = true;
      }

      elem.setAttribute( name, name.toLowerCase() );
    }
    return name;
  }
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

  fixSpecified = {
    name: true,
    id: true,
    coords: true
  };

  // Use this for any attribute in IE6/7
  // This fixes almost every IE6/7 issue
  nodeHook = jQuery.valHooks.button = {
    get: function( elem, name ) {
      var ret;
      ret = elem.getAttributeNode( name );
      return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
        ret.value :
        undefined;
    },
    set: function( elem, value, name ) {
      // Set the existing or create a new attribute node
      var ret = elem.getAttributeNode( name );
      if ( !ret ) {
        ret = document.createAttribute( name );
        elem.setAttributeNode( ret );
      }
      return ( ret.value = value + "" );
    }
  };

  // Set width and height to auto instead of 0 on empty string( Bug #8150 )
  // This is for removals
  jQuery.each([ "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
      set: function( elem, value ) {
        if ( value === "" ) {
          elem.setAttribute( name, "auto" );
          return value;
        }
      }
    });
  });

  // Set contenteditable to false on removals(#10429)
  // Setting to empty string throws an error as an invalid value
  jQuery.attrHooks.contenteditable = {
    get: nodeHook.get,
    set: function( elem, value, name ) {
      if ( value === "" ) {
        value = "false";
      }
      nodeHook.set( elem, value, name );
    }
  };
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
  jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
      get: function( elem ) {
        var ret = elem.getAttribute( name, 2 );
        return ret === null ? undefined : ret;
      }
    });
  });
}

if ( !jQuery.support.style ) {
  jQuery.attrHooks.style = {
    get: function( elem ) {
      // Return undefined in the case of empty string
      // Normalize to lowercase since IE uppercases css property names
      return elem.style.cssText.toLowerCase() || undefined;
    },
    set: function( elem, value ) {
      return ( elem.style.cssText = value + "" );
    }
  };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
  jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
    get: function( elem ) {
      var parent = elem.parentNode;

      if ( parent ) {
        parent.selectedIndex;

        // Make sure that it also works with optgroups, see #5701
        if ( parent.parentNode ) {
          parent.parentNode.selectedIndex;
        }
      }
      return null;
    }
  });
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
  jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
  jQuery.each([ "radio", "checkbox" ], function() {
    jQuery.valHooks[ this ] = {
      get: function( elem ) {
        // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
        return elem.getAttribute("value") === null ? "on" : elem.value;
      }
    };
  });
}
jQuery.each([ "radio", "checkbox" ], function() {
  jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
    set: function( elem, value ) {
      if ( jQuery.isArray( value ) ) {
        return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
      }
    }
  });
});
var rformElems = /^(?:textarea|input|select)$/i,
  rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
  rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
  rkeyEvent = /^key/,
  rmouseEvent = /^(?:mouse|contextmenu)|click/,
  rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
  hoverHack = function( events ) {
    return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
  };

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

  add: function( elem, types, handler, data, selector ) {

    var elemData, eventHandle, events,
      t, tns, type, namespaces, handleObj,
      handleObjIn, handlers, special;

    // Don't attach events to noData or text/comment nodes (allow plain objects tho)
    if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
      return;
    }

    // Caller can pass in an object of custom data in lieu of the handler
    if ( handler.handler ) {
      handleObjIn = handler;
      handler = handleObjIn.handler;
      selector = handleObjIn.selector;
    }

    // Make sure that the handler has a unique ID, used to find/remove it later
    if ( !handler.guid ) {
      handler.guid = jQuery.guid++;
    }

    // Init the element's event structure and main handler, if this is the first
    events = elemData.events;
    if ( !events ) {
      elemData.events = events = {};
    }
    eventHandle = elemData.handle;
    if ( !eventHandle ) {
      elemData.handle = eventHandle = function( e ) {
        // Discard the second event of a jQuery.event.trigger() and
        // when an event is called after a page has unloaded
        return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
          jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
          undefined;
      };
      // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
      eventHandle.elem = elem;
    }

    // Handle multiple events separated by a space
    // jQuery(...).bind("mouseover mouseout", fn);
    types = jQuery.trim( hoverHack(types) ).split( " " );
    for ( t = 0; t < types.length; t++ ) {

      tns = rtypenamespace.exec( types[t] ) || [];
      type = tns[1];
      namespaces = ( tns[2] || "" ).split( "." ).sort();

      // If event changes its type, use the special event handlers for the changed type
      special = jQuery.event.special[ type ] || {};

      // If selector defined, determine special event api type, otherwise given type
      type = ( selector ? special.delegateType : special.bindType ) || type;

      // Update special based on newly reset type
      special = jQuery.event.special[ type ] || {};

      // handleObj is passed to all event handlers
      handleObj = jQuery.extend({
        type: type,
        origType: tns[1],
        data: data,
        handler: handler,
        guid: handler.guid,
        selector: selector,
        needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
        namespace: namespaces.join(".")
      }, handleObjIn );

      // Init the event handler queue if we're the first
      handlers = events[ type ];
      if ( !handlers ) {
        handlers = events[ type ] = [];
        handlers.delegateCount = 0;

        // Only use addEventListener/attachEvent if the special events handler returns false
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
          // Bind the global event handler to the element
          if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );

          } else if ( elem.attachEvent ) {
            elem.attachEvent( "on" + type, eventHandle );
          }
        }
      }

      if ( special.add ) {
        special.add.call( elem, handleObj );

        if ( !handleObj.handler.guid ) {
          handleObj.handler.guid = handler.guid;
        }
      }

      // Add to the element's handler list, delegates in front
      if ( selector ) {
        handlers.splice( handlers.delegateCount++, 0, handleObj );
      } else {
        handlers.push( handleObj );
      }

      // Keep track of which events have ever been used, for event optimization
      jQuery.event.global[ type ] = true;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = null;
  },

  global: {},

  // Detach an event or set of events from an element
  remove: function( elem, types, handler, selector, mappedTypes ) {

    var t, tns, type, origType, namespaces, origCount,
      j, events, special, eventType, handleObj,
      elemData = jQuery.hasData( elem ) && jQuery._data( elem );

    if ( !elemData || !(events = elemData.events) ) {
      return;
    }

    // Once for each type.namespace in types; type may be omitted
    types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
    for ( t = 0; t < types.length; t++ ) {
      tns = rtypenamespace.exec( types[t] ) || [];
      type = origType = tns[1];
      namespaces = tns[2];

      // Unbind all events (on this namespace, if provided) for the element
      if ( !type ) {
        for ( type in events ) {
          jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
        }
        continue;
      }

      special = jQuery.event.special[ type ] || {};
      type = ( selector? special.delegateType : special.bindType ) || type;
      eventType = events[ type ] || [];
      origCount = eventType.length;
      namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

      // Remove matching events
      for ( j = 0; j < eventType.length; j++ ) {
        handleObj = eventType[ j ];

        if ( ( mappedTypes || origType === handleObj.origType ) &&
           ( !handler || handler.guid === handleObj.guid ) &&
           ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
           ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
          eventType.splice( j--, 1 );

          if ( handleObj.selector ) {
            eventType.delegateCount--;
          }
          if ( special.remove ) {
            special.remove.call( elem, handleObj );
          }
        }
      }

      // Remove generic event handler if we removed something and no more handlers exist
      // (avoids potential for endless recursion during removal of special event handlers)
      if ( eventType.length === 0 && origCount !== eventType.length ) {
        if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
          jQuery.removeEvent( elem, type, elemData.handle );
        }

        delete events[ type ];
      }
    }

    // Remove the expando if it's no longer used
    if ( jQuery.isEmptyObject( events ) ) {
      delete elemData.handle;

      // removeData also checks for emptiness and clears the expando if empty
      // so use it instead of delete
      jQuery.removeData( elem, "events", true );
    }
  },

  // Events that are safe to short-circuit if no handlers are attached.
  // Native DOM events should not be added, they may have inline handlers.
  customEvent: {
    "getData": true,
    "setData": true,
    "changeData": true
  },

  trigger: function( event, data, elem, onlyHandlers ) {
    // Don't do events on text and comment nodes
    if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
      return;
    }

    // Event object or event type
    var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
      type = event.type || event,
      namespaces = [];

    // focus/blur morphs to focusin/out; ensure we're not firing them right now
    if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
      return;
    }

    if ( type.indexOf( "!" ) >= 0 ) {
      // Exclusive events trigger only for the exact event (no namespaces)
      type = type.slice(0, -1);
      exclusive = true;
    }

    if ( type.indexOf( "." ) >= 0 ) {
      // Namespaced trigger; create a regexp to match event type in handle()
      namespaces = type.split(".");
      type = namespaces.shift();
      namespaces.sort();
    }

    if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
      // No jQuery handlers for this event type, and it can't have inline handlers
      return;
    }

    // Caller can pass in an Event, Object, or just an event type string
    event = typeof event === "object" ?
      // jQuery.Event object
      event[ jQuery.expando ] ? event :
      // Object literal
      new jQuery.Event( type, event ) :
      // Just the event type (string)
      new jQuery.Event( type );

    event.type = type;
    event.isTrigger = true;
    event.exclusive = exclusive;
    event.namespace = namespaces.join( "." );
    event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
    ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

    // Handle a global trigger
    if ( !elem ) {

      // TODO: Stop taunting the data cache; remove global events and always attach to document
      cache = jQuery.cache;
      for ( i in cache ) {
        if ( cache[ i ].events && cache[ i ].events[ type ] ) {
          jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
        }
      }
      return;
    }

    // Clean up the event in case it is being reused
    event.result = undefined;
    if ( !event.target ) {
      event.target = elem;
    }

    // Clone any incoming data and prepend the event, creating the handler arg list
    data = data != null ? jQuery.makeArray( data ) : [];
    data.unshift( event );

    // Allow special events to draw outside the lines
    special = jQuery.event.special[ type ] || {};
    if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
      return;
    }

    // Determine event propagation path in advance, per W3C events spec (#9951)
    // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
    eventPath = [[ elem, special.bindType || type ]];
    if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

      bubbleType = special.delegateType || type;
      cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
      for ( old = elem; cur; cur = cur.parentNode ) {
        eventPath.push([ cur, bubbleType ]);
        old = cur;
      }

      // Only add window if we got to document (e.g., not plain obj or detached DOM)
      if ( old === (elem.ownerDocument || document) ) {
        eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
      }
    }

    // Fire handlers on the event path
    for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

      cur = eventPath[i][0];
      event.type = eventPath[i][1];

      handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
      if ( handle ) {
        handle.apply( cur, data );
      }
      // Note that this is a bare JS function and not a jQuery handler
      handle = ontype && cur[ ontype ];
      if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
        event.preventDefault();
      }
    }
    event.type = type;

    // If nobody prevented the default action, do it now
    if ( !onlyHandlers && !event.isDefaultPrevented() ) {

      if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
        !(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

        // Call a native DOM method on the target with the same name name as the event.
        // Can't use an .isFunction() check here because IE6/7 fails that test.
        // Don't do default actions on window, that's where global variables be (#6170)
        // IE<9 dies on focus/blur to hidden element (#1486)
        if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

          // Don't re-trigger an onFOO event when we call its FOO() method
          old = elem[ ontype ];

          if ( old ) {
            elem[ ontype ] = null;
          }

          // Prevent re-triggering of the same event, since we already bubbled it above
          jQuery.event.triggered = type;
          elem[ type ]();
          jQuery.event.triggered = undefined;

          if ( old ) {
            elem[ ontype ] = old;
          }
        }
      }
    }

    return event.result;
  },

  dispatch: function( event ) {

    // Make a writable jQuery.Event from the native event object
    event = jQuery.event.fix( event || window.event );

    var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
      handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
      delegateCount = handlers.delegateCount,
      args = core_slice.call( arguments ),
      run_all = !event.exclusive && !event.namespace,
      special = jQuery.event.special[ event.type ] || {},
      handlerQueue = [];

    // Use the fix-ed jQuery.Event rather than the (read-only) native event
    args[0] = event;
    event.delegateTarget = this;

    // Call the preDispatch hook for the mapped type, and let it bail if desired
    if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
      return;
    }

    // Determine handlers that should run if there are delegated events
    // Avoid non-left-click bubbling in Firefox (#3861)
    if ( delegateCount && !(event.button && event.type === "click") ) {

      for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

        // Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
        if ( cur.disabled !== true || event.type !== "click" ) {
          selMatch = {};
          matches = [];
          for ( i = 0; i < delegateCount; i++ ) {
            handleObj = handlers[ i ];
            sel = handleObj.selector;

            if ( selMatch[ sel ] === undefined ) {
              selMatch[ sel ] = handleObj.needsContext ?
                jQuery( sel, this ).index( cur ) >= 0 :
                jQuery.find( sel, this, null, [ cur ] ).length;
            }
            if ( selMatch[ sel ] ) {
              matches.push( handleObj );
            }
          }
          if ( matches.length ) {
            handlerQueue.push({ elem: cur, matches: matches });
          }
        }
      }
    }

    // Add the remaining (directly-bound) handlers
    if ( handlers.length > delegateCount ) {
      handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
    }

    // Run delegates first; they may want to stop propagation beneath us
    for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
      matched = handlerQueue[ i ];
      event.currentTarget = matched.elem;

      for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
        handleObj = matched.matches[ j ];

        // Triggered event must either 1) be non-exclusive and have no namespace, or
        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
        if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

          event.data = handleObj.data;
          event.handleObj = handleObj;

          ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
              .apply( matched.elem, args );

          if ( ret !== undefined ) {
            event.result = ret;
            if ( ret === false ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }
        }
      }
    }

    // Call the postDispatch hook for the mapped type
    if ( special.postDispatch ) {
      special.postDispatch.call( this, event );
    }

    return event.result;
  },

  // Includes some event props shared by KeyEvent and MouseEvent
  // *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
  props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

  fixHooks: {},

  keyHooks: {
    props: "char charCode key keyCode".split(" "),
    filter: function( event, original ) {

      // Add which for key events
      if ( event.which == null ) {
        event.which = original.charCode != null ? original.charCode : original.keyCode;
      }

      return event;
    }
  },

  mouseHooks: {
    props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
    filter: function( event, original ) {
      var eventDoc, doc, body,
        button = original.button,
        fromElement = original.fromElement;

      // Calculate pageX/Y if missing and clientX/Y available
      if ( event.pageX == null && original.clientX != null ) {
        eventDoc = event.target.ownerDocument || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
      }

      // Add relatedTarget, if necessary
      if ( !event.relatedTarget && fromElement ) {
        event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
      }

      // Add which for click: 1 === left; 2 === middle; 3 === right
      // Note: button is not normalized, so don't use it
      if ( !event.which && button !== undefined ) {
        event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
      }

      return event;
    }
  },

  fix: function( event ) {
    if ( event[ jQuery.expando ] ) {
      return event;
    }

    // Create a writable copy of the event object and normalize some properties
    var i, prop,
      originalEvent = event,
      fixHook = jQuery.event.fixHooks[ event.type ] || {},
      copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

    event = jQuery.Event( originalEvent );

    for ( i = copy.length; i; ) {
      prop = copy[ --i ];
      event[ prop ] = originalEvent[ prop ];
    }

    // Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
    if ( !event.target ) {
      event.target = originalEvent.srcElement || document;
    }

    // Target should not be a text node (#504, Safari)
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
    event.metaKey = !!event.metaKey;

    return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
  },

  special: {
    load: {
      // Prevent triggered image.load events from bubbling to window.load
      noBubble: true
    },

    focus: {
      delegateType: "focusin"
    },
    blur: {
      delegateType: "focusout"
    },

    beforeunload: {
      setup: function( data, namespaces, eventHandle ) {
        // We only want to do this special case on windows
        if ( jQuery.isWindow( this ) ) {
          this.onbeforeunload = eventHandle;
        }
      },

      teardown: function( namespaces, eventHandle ) {
        if ( this.onbeforeunload === eventHandle ) {
          this.onbeforeunload = null;
        }
      }
    }
  },

  simulate: function( type, elem, event, bubble ) {
    // Piggyback on a donor event to simulate a different one.
    // Fake originalEvent to avoid donor's stopPropagation, but if the
    // simulated event prevents default then we do the same on the donor.
    var e = jQuery.extend(
      new jQuery.Event(),
      event,
      { type: type,
        isSimulated: true,
        originalEvent: {}
      }
    );
    if ( bubble ) {
      jQuery.event.trigger( e, null, elem );
    } else {
      jQuery.event.dispatch.call( elem, e );
    }
    if ( e.isDefaultPrevented() ) {
      event.preventDefault();
    }
  }
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
  function( elem, type, handle ) {
    if ( elem.removeEventListener ) {
      elem.removeEventListener( type, handle, false );
    }
  } :
  function( elem, type, handle ) {
    var name = "on" + type;

    if ( elem.detachEvent ) {

      // #8545, #7054, preventing memory leaks for custom events in IE6-8 –
      // detachEvent needed property on element, by name of that event, to properly expose it to GC
      if ( typeof elem[ name ] === "undefined" ) {
        elem[ name ] = null;
      }

      elem.detachEvent( name, handle );
    }
  };

jQuery.Event = function( src, props ) {
  // Allow instantiation without the 'new' keyword
  if ( !(this instanceof jQuery.Event) ) {
    return new jQuery.Event( src, props );
  }

  // Event object
  if ( src && src.type ) {
    this.originalEvent = src;
    this.type = src.type;

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
      src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

  // Event type
  } else {
    this.type = src;
  }

  // Put explicitly provided properties onto the event object
  if ( props ) {
    jQuery.extend( this, props );
  }

  // Create a timestamp if incoming event doesn't have one
  this.timeStamp = src && src.timeStamp || jQuery.now();

  // Mark it as fixed
  this[ jQuery.expando ] = true;
};

function returnFalse() {
  return false;
}
function returnTrue() {
  return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
  preventDefault: function() {
    this.isDefaultPrevented = returnTrue;

    var e = this.originalEvent;
    if ( !e ) {
      return;
    }

    // if preventDefault exists run it on the original event
    if ( e.preventDefault ) {
      e.preventDefault();

    // otherwise set the returnValue property of the original event to false (IE)
    } else {
      e.returnValue = false;
    }
  },
  stopPropagation: function() {
    this.isPropagationStopped = returnTrue;

    var e = this.originalEvent;
    if ( !e ) {
      return;
    }
    // if stopPropagation exists run it on the original event
    if ( e.stopPropagation ) {
      e.stopPropagation();
    }
    // otherwise set the cancelBubble property of the original event to true (IE)
    e.cancelBubble = true;
  },
  stopImmediatePropagation: function() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  },
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
  mouseenter: "mouseover",
  mouseleave: "mouseout"
}, function( orig, fix ) {
  jQuery.event.special[ orig ] = {
    delegateType: fix,
    bindType: fix,

    handle: function( event ) {
      var ret,
        target = this,
        related = event.relatedTarget,
        handleObj = event.handleObj,
        selector = handleObj.selector;

      // For mousenter/leave call the handler if related is outside the target.
      // NB: No relatedTarget if the mouse left/entered the browser window
      if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
        event.type = handleObj.origType;
        ret = handleObj.handler.apply( this, arguments );
        event.type = fix;
      }
      return ret;
    }
  };
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

  jQuery.event.special.submit = {
    setup: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Lazy-add a submit handler when a descendant form may potentially be submitted
      jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
        // Node name check avoids a VML-related crash in IE (#9807)
        var elem = e.target,
          form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
        if ( form && !jQuery._data( form, "_submit_attached" ) ) {
          jQuery.event.add( form, "submit._submit", function( event ) {
            event._submit_bubble = true;
          });
          jQuery._data( form, "_submit_attached", true );
        }
      });
      // return undefined since we don't need an event listener
    },

    postDispatch: function( event ) {
      // If form was submitted by the user, bubble the event up the tree
      if ( event._submit_bubble ) {
        delete event._submit_bubble;
        if ( this.parentNode && !event.isTrigger ) {
          jQuery.event.simulate( "submit", this.parentNode, event, true );
        }
      }
    },

    teardown: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
      jQuery.event.remove( this, "._submit" );
    }
  };
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

  jQuery.event.special.change = {

    setup: function() {

      if ( rformElems.test( this.nodeName ) ) {
        // IE doesn't fire change on a check/radio until blur; trigger it on click
        // after a propertychange. Eat the blur-change in special.change.handle.
        // This still fires onchange a second time for check/radio after blur.
        if ( this.type === "checkbox" || this.type === "radio" ) {
          jQuery.event.add( this, "propertychange._change", function( event ) {
            if ( event.originalEvent.propertyName === "checked" ) {
              this._just_changed = true;
            }
          });
          jQuery.event.add( this, "click._change", function( event ) {
            if ( this._just_changed && !event.isTrigger ) {
              this._just_changed = false;
            }
            // Allow triggered, simulated change events (#11500)
            jQuery.event.simulate( "change", this, event, true );
          });
        }
        return false;
      }
      // Delegated event; lazy-add a change handler on descendant inputs
      jQuery.event.add( this, "beforeactivate._change", function( e ) {
        var elem = e.target;

        if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
          jQuery.event.add( elem, "change._change", function( event ) {
            if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
              jQuery.event.simulate( "change", this.parentNode, event, true );
            }
          });
          jQuery._data( elem, "_change_attached", true );
        }
      });
    },

    handle: function( event ) {
      var elem = event.target;

      // Swallow native change events from checkbox/radio, we already triggered them above
      if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
        return event.handleObj.handler.apply( this, arguments );
      }
    },

    teardown: function() {
      jQuery.event.remove( this, "._change" );

      return !rformElems.test( this.nodeName );
    }
  };
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
  jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    // Attach a single capturing handler while someone wants focusin/focusout
    var attaches = 0,
      handler = function( event ) {
        jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
      };

    jQuery.event.special[ fix ] = {
      setup: function() {
        if ( attaches++ === 0 ) {
          document.addEventListener( orig, handler, true );
        }
      },
      teardown: function() {
        if ( --attaches === 0 ) {
          document.removeEventListener( orig, handler, true );
        }
      }
    };
  });
}

jQuery.fn.extend({

  on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
    var origFn, type;

    // Types can be a map of types/handlers
    if ( typeof types === "object" ) {
      // ( types-Object, selector, data )
      if ( typeof selector !== "string" ) { // && selector != null
        // ( types-Object, data )
        data = data || selector;
        selector = undefined;
      }
      for ( type in types ) {
        this.on( type, selector, data, types[ type ], one );
      }
      return this;
    }

    if ( data == null && fn == null ) {
      // ( types, fn )
      fn = selector;
      data = selector = undefined;
    } else if ( fn == null ) {
      if ( typeof selector === "string" ) {
        // ( types, selector, fn )
        fn = data;
        data = undefined;
      } else {
        // ( types, data, fn )
        fn = data;
        data = selector;
        selector = undefined;
      }
    }
    if ( fn === false ) {
      fn = returnFalse;
    } else if ( !fn ) {
      return this;
    }

    if ( one === 1 ) {
      origFn = fn;
      fn = function( event ) {
        // Can use an empty set, since event contains the info
        jQuery().off( event );
        return origFn.apply( this, arguments );
      };
      // Use same guid so caller can remove using origFn
      fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
    }
    return this.each( function() {
      jQuery.event.add( this, types, fn, data, selector );
    });
  },
  one: function( types, selector, data, fn ) {
    return this.on( types, selector, data, fn, 1 );
  },
  off: function( types, selector, fn ) {
    var handleObj, type;
    if ( types && types.preventDefault && types.handleObj ) {
      // ( event )  dispatched jQuery.Event
      handleObj = types.handleObj;
      jQuery( types.delegateTarget ).off(
        handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
        handleObj.selector,
        handleObj.handler
      );
      return this;
    }
    if ( typeof types === "object" ) {
      // ( types-object [, selector] )
      for ( type in types ) {
        this.off( type, selector, types[ type ] );
      }
      return this;
    }
    if ( selector === false || typeof selector === "function" ) {
      // ( types [, fn] )
      fn = selector;
      selector = undefined;
    }
    if ( fn === false ) {
      fn = returnFalse;
    }
    return this.each(function() {
      jQuery.event.remove( this, types, fn, selector );
    });
  },

  bind: function( types, data, fn ) {
    return this.on( types, null, data, fn );
  },
  unbind: function( types, fn ) {
    return this.off( types, null, fn );
  },

  live: function( types, data, fn ) {
    jQuery( this.context ).on( types, this.selector, data, fn );
    return this;
  },
  die: function( types, fn ) {
    jQuery( this.context ).off( types, this.selector || "**", fn );
    return this;
  },

  delegate: function( selector, types, data, fn ) {
    return this.on( types, selector, data, fn );
  },
  undelegate: function( selector, types, fn ) {
    // ( namespace ) or ( selector, types [, fn] )
    return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
  },

  trigger: function( type, data ) {
    return this.each(function() {
      jQuery.event.trigger( type, data, this );
    });
  },
  triggerHandler: function( type, data ) {
    if ( this[0] ) {
      return jQuery.event.trigger( type, data, this[0], true );
    }
  },

  toggle: function( fn ) {
    // Save reference to arguments for access in closure
    var args = arguments,
      guid = fn.guid || jQuery.guid++,
      i = 0,
      toggler = function( event ) {
        // Figure out which function to execute
        var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
        jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

        // Make sure that clicks stop
        event.preventDefault();

        // and execute the function
        return args[ lastToggle ].apply( this, arguments ) || false;
      };

    // link all the functions, so any of them can unbind this click handler
    toggler.guid = guid;
    while ( i < args.length ) {
      args[ i++ ].guid = guid;
    }

    return this.click( toggler );
  },

  hover: function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
  }
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

  // Handle event binding
  jQuery.fn[ name ] = function( data, fn ) {
    if ( fn == null ) {
      fn = data;
      data = null;
    }

    return arguments.length > 0 ?
      this.on( name, null, data, fn ) :
      this.trigger( name );
  };

  if ( rkeyEvent.test( name ) ) {
    jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
  }

  if ( rmouseEvent.test( name ) ) {
    jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
  }
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var cachedruns,
  assertGetIdNotName,
  Expr,
  getText,
  isXML,
  contains,
  compile,
  sortOrder,
  hasDuplicate,
  outermostContext,

  baseHasDuplicate = true,
  strundefined = "undefined",

  expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

  Token = String,
  document = window.document,
  docElem = document.documentElement,
  dirruns = 0,
  done = 0,
  pop = [].pop,
  push = [].push,
  slice = [].slice,
  // Use a stripped-down indexOf if a native one is unavailable
  indexOf = [].indexOf || function( elem ) {
    var i = 0,
      len = this.length;
    for ( ; i < len; i++ ) {
      if ( this[i] === elem ) {
        return i;
      }
    }
    return -1;
  },

  // Augment a function for special use by Sizzle
  markFunction = function( fn, value ) {
    fn[ expando ] = value == null || value;
    return fn;
  },

  createCache = function() {
    var cache = {},
      keys = [];

    return markFunction(function( key, value ) {
      // Only keep the most recent entries
      if ( keys.push( key ) > Expr.cacheLength ) {
        delete cache[ keys.shift() ];
      }

      return (cache[ key ] = value);
    }, cache );
  },

  classCache = createCache(),
  tokenCache = createCache(),
  compilerCache = createCache(),

  // Regex

  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
  whitespace = "[\\x20\\t\\r\\n\\f]",
  // http://www.w3.org/TR/css3-syntax/#characters
  characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

  // Loosely modeled on CSS identifier characters
  // An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
  identifier = characterEncoding.replace( "w", "w#" ),

  // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
  operators = "([*^$|!~]?=)",
  attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
    "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

  // Prefer arguments not in parens/brackets,
  //   then attribute selectors and non-pseudos (denoted by :),
  //   then anything else
  // These preferences are here to reduce the number of selectors
  //   needing tokenize in the PSEUDO preFilter
  pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

  // For matchExpr.POS and matchExpr.needsContext
  pos = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
    "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)",

  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
  rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

  rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
  rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
  rpseudo = new RegExp( pseudos ),

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
  rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

  rnot = /^:not/,
  rsibling = /[\x20\t\r\n\f]*[+~]/,
  rendsWithNot = /:not\($/,

  rheader = /h\d/i,
  rinputs = /input|select|textarea|button/i,

  rbackslash = /\\(?!\\)/g,

  matchExpr = {
    "ID": new RegExp( "^#(" + characterEncoding + ")" ),
    "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
    "NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
    "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
    "ATTR": new RegExp( "^" + attributes ),
    "PSEUDO": new RegExp( "^" + pseudos ),
    "POS": new RegExp( pos, "i" ),
    "CHILD": new RegExp( "^:(only|nth|first|last)-child(?:\\(" + whitespace +
      "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
    // For use in libraries implementing .is()
    "needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
  },

  // Support

  // Used for testing something on an element
  assert = function( fn ) {
    var div = document.createElement("div");

    try {
      return fn( div );
    } catch (e) {
      return false;
    } finally {
      // release memory in IE
      div = null;
    }
  },

  // Check if getElementsByTagName("*") returns only elements
  assertTagNameNoComments = assert(function( div ) {
    div.appendChild( document.createComment("") );
    return !div.getElementsByTagName("*").length;
  }),

  // Check if getAttribute returns normalized href attributes
  assertHrefNotNormalized = assert(function( div ) {
    div.innerHTML = "<a href='#'></a>";
    return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
      div.firstChild.getAttribute("href") === "#";
  }),

  // Check if attributes should be retrieved by attribute nodes
  assertAttributes = assert(function( div ) {
    div.innerHTML = "<select></select>";
    var type = typeof div.lastChild.getAttribute("multiple");
    // IE8 returns a string for some attributes even when not present
    return type !== "boolean" && type !== "string";
  }),

  // Check if getElementsByClassName can be trusted
  assertUsableClassName = assert(function( div ) {
    // Opera can't find a second classname (in 9.6)
    div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
    if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
      return false;
    }

    // Safari 3.2 caches class attributes and doesn't catch changes
    div.lastChild.className = "e";
    return div.getElementsByClassName("e").length === 2;
  }),

  // Check if getElementById returns elements by name
  // Check if getElementsByName privileges form controls or returns elements by ID
  assertUsableName = assert(function( div ) {
    // Inject content
    div.id = expando + 0;
    div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
    docElem.insertBefore( div, docElem.firstChild );

    // Test
    var pass = document.getElementsByName &&
      // buggy browsers will return fewer than the correct 2
      document.getElementsByName( expando ).length === 2 +
      // buggy browsers will return more than the correct 0
      document.getElementsByName( expando + 0 ).length;
    assertGetIdNotName = !document.getElementById( expando );

    // Cleanup
    docElem.removeChild( div );

    return pass;
  });

// If slice is not available, provide a backup
try {
  slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
  slice = function( i ) {
    var elem,
      results = [];
    for ( ; (elem = this[i]); i++ ) {
      results.push( elem );
    }
    return results;
  };
}

function Sizzle( selector, context, results, seed ) {
  results = results || [];
  context = context || document;
  var match, elem, xml, m,
    nodeType = context.nodeType;

  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  if ( nodeType !== 1 && nodeType !== 9 ) {
    return [];
  }

  xml = isXML( context );

  if ( !xml && !seed ) {
    if ( (match = rquickExpr.exec( selector )) ) {
      // Speed-up: Sizzle("#ID")
      if ( (m = match[1]) ) {
        if ( nodeType === 9 ) {
          elem = context.getElementById( m );
          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE, Opera, and Webkit return items
            // by name instead of ID
            if ( elem.id === m ) {
              results.push( elem );
              return results;
            }
          } else {
            return results;
          }
        } else {
          // Context is not a document
          if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
            contains( context, elem ) && elem.id === m ) {
            results.push( elem );
            return results;
          }
        }

      // Speed-up: Sizzle("TAG")
      } else if ( match[2] ) {
        push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
        return results;

      // Speed-up: Sizzle(".CLASS")
      } else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
        push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
        return results;
      }
    }
  }

  // All others
  return select( selector.replace( rtrim, "$1" ), context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
  return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
  return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return name === "input" && elem.type === type;
  };
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return (name === "input" || name === "button") && elem.type === type;
  };
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
  return markFunction(function( argument ) {
    argument = +argument;
    return markFunction(function( seed, matches ) {
      var j,
        matchIndexes = fn( [], seed.length, argument ),
        i = matchIndexes.length;

      // Match elements found at the specified indexes
      while ( i-- ) {
        if ( seed[ (j = matchIndexes[i]) ] ) {
          seed[j] = !(matches[j] = seed[j]);
        }
      }
    });
  });
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
  var node,
    ret = "",
    i = 0,
    nodeType = elem.nodeType;

  if ( nodeType ) {
    if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
      // Use textContent for elements
      // innerText usage removed for consistency of new lines (see #11153)
      if ( typeof elem.textContent === "string" ) {
        return elem.textContent;
      } else {
        // Traverse its children
        for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
          ret += getText( elem );
        }
      }
    } else if ( nodeType === 3 || nodeType === 4 ) {
      return elem.nodeValue;
    }
    // Do not include comment or processing instruction nodes
  } else {

    // If no nodeType, this is expected to be an array
    for ( ; (node = elem[i]); i++ ) {
      // Do not traverse comment nodes
      ret += getText( node );
    }
  }
  return ret;
};

isXML = Sizzle.isXML = function( elem ) {
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833)
  var documentElement = elem && (elem.ownerDocument || elem).documentElement;
  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
  function( a, b ) {
    var adown = a.nodeType === 9 ? a.documentElement : a,
      bup = b && b.parentNode;
    return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
  } :
  docElem.compareDocumentPosition ?
  function( a, b ) {
    return b && !!( a.compareDocumentPosition( b ) & 16 );
  } :
  function( a, b ) {
    while ( (b = b.parentNode) ) {
      if ( b === a ) {
        return true;
      }
    }
    return false;
  };

Sizzle.attr = function( elem, name ) {
  var val,
    xml = isXML( elem );

  if ( !xml ) {
    name = name.toLowerCase();
  }
  if ( (val = Expr.attrHandle[ name ]) ) {
    return val( elem );
  }
  if ( xml || assertAttributes ) {
    return elem.getAttribute( name );
  }
  val = elem.getAttributeNode( name );
  return val ?
    typeof elem[ name ] === "boolean" ?
      elem[ name ] ? name : null :
      val.specified ? val.value : null :
    null;
};

Expr = Sizzle.selectors = {

  // Can be adjusted by the user
  cacheLength: 50,

  createPseudo: markFunction,

  match: matchExpr,

  // IE6/7 return a modified href
  attrHandle: assertHrefNotNormalized ?
    {} :
    {
      "href": function( elem ) {
        return elem.getAttribute( "href", 2 );
      },
      "type": function( elem ) {
        return elem.getAttribute("type");
      }
    },

  find: {
    "ID": assertGetIdNotName ?
      function( id, context, xml ) {
        if ( typeof context.getElementById !== strundefined && !xml ) {
          var m = context.getElementById( id );
          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          return m && m.parentNode ? [m] : [];
        }
      } :
      function( id, context, xml ) {
        if ( typeof context.getElementById !== strundefined && !xml ) {
          var m = context.getElementById( id );

          return m ?
            m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
              [m] :
              undefined :
            [];
        }
      },

    "TAG": assertTagNameNoComments ?
      function( tag, context ) {
        if ( typeof context.getElementsByTagName !== strundefined ) {
          return context.getElementsByTagName( tag );
        }
      } :
      function( tag, context ) {
        var results = context.getElementsByTagName( tag );

        // Filter out possible comments
        if ( tag === "*" ) {
          var elem,
            tmp = [],
            i = 0;

          for ( ; (elem = results[i]); i++ ) {
            if ( elem.nodeType === 1 ) {
              tmp.push( elem );
            }
          }

          return tmp;
        }
        return results;
      },

    "NAME": assertUsableName && function( tag, context ) {
      if ( typeof context.getElementsByName !== strundefined ) {
        return context.getElementsByName( name );
      }
    },

    "CLASS": assertUsableClassName && function( className, context, xml ) {
      if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
        return context.getElementsByClassName( className );
      }
    }
  },

  relative: {
    ">": { dir: "parentNode", first: true },
    " ": { dir: "parentNode" },
    "+": { dir: "previousSibling", first: true },
    "~": { dir: "previousSibling" }
  },

  preFilter: {
    "ATTR": function( match ) {
      match[1] = match[1].replace( rbackslash, "" );

      // Move the given value to match[3] whether quoted or unquoted
      match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

      if ( match[2] === "~=" ) {
        match[3] = " " + match[3] + " ";
      }

      return match.slice( 0, 4 );
    },

    "CHILD": function( match ) {
      /* matches from matchExpr["CHILD"]
        1 type (only|nth|...)
        2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
        3 xn-component of xn+y argument ([+-]?\d*n|)
        4 sign of xn-component
        5 x of xn-component
        6 sign of y-component
        7 y of y-component
      */
      match[1] = match[1].toLowerCase();

      if ( match[1] === "nth" ) {
        // nth-child requires argument
        if ( !match[2] ) {
          Sizzle.error( match[0] );
        }

        // numeric x and y parameters for Expr.filter.CHILD
        // remember that false/true cast respectively to 0/1
        match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
        match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

      // other types prohibit arguments
      } else if ( match[2] ) {
        Sizzle.error( match[0] );
      }

      return match;
    },

    "PSEUDO": function( match ) {
      var unquoted, excess;
      if ( matchExpr["CHILD"].test( match[0] ) ) {
        return null;
      }

      if ( match[3] ) {
        match[2] = match[3];
      } else if ( (unquoted = match[4]) ) {
        // Only check arguments that contain a pseudo
        if ( rpseudo.test(unquoted) &&
          // Get excess from tokenize (recursively)
          (excess = tokenize( unquoted, true )) &&
          // advance to the next closing parenthesis
          (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

          // excess is a negative index
          unquoted = unquoted.slice( 0, excess );
          match[0] = match[0].slice( 0, excess );
        }
        match[2] = unquoted;
      }

      // Return only captures needed by the pseudo filter method (type and argument)
      return match.slice( 0, 3 );
    }
  },

  filter: {
    "ID": assertGetIdNotName ?
      function( id ) {
        id = id.replace( rbackslash, "" );
        return function( elem ) {
          return elem.getAttribute("id") === id;
        };
      } :
      function( id ) {
        id = id.replace( rbackslash, "" );
        return function( elem ) {
          var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
          return node && node.value === id;
        };
      },

    "TAG": function( nodeName ) {
      if ( nodeName === "*" ) {
        return function() { return true; };
      }
      nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

      return function( elem ) {
        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      };
    },

    "CLASS": function( className ) {
      var pattern = classCache[ expando ][ className ];
      if ( !pattern ) {
        pattern = classCache( className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)") );
      }
      return function( elem ) {
        return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
      };
    },

    "ATTR": function( name, operator, check ) {
      return function( elem, context ) {
        var result = Sizzle.attr( elem, name );

        if ( result == null ) {
          return operator === "!=";
        }
        if ( !operator ) {
          return true;
        }

        result += "";

        return operator === "=" ? result === check :
          operator === "!=" ? result !== check :
          operator === "^=" ? check && result.indexOf( check ) === 0 :
          operator === "*=" ? check && result.indexOf( check ) > -1 :
          operator === "$=" ? check && result.substr( result.length - check.length ) === check :
          operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
          operator === "|=" ? result === check || result.substr( 0, check.length + 1 ) === check + "-" :
          false;
      };
    },

    "CHILD": function( type, argument, first, last ) {

      if ( type === "nth" ) {
        return function( elem ) {
          var node, diff,
            parent = elem.parentNode;

          if ( first === 1 && last === 0 ) {
            return true;
          }

          if ( parent ) {
            diff = 0;
            for ( node = parent.firstChild; node; node = node.nextSibling ) {
              if ( node.nodeType === 1 ) {
                diff++;
                if ( elem === node ) {
                  break;
                }
              }
            }
          }

          // Incorporate the offset (or cast to NaN), then check against cycle size
          diff -= last;
          return diff === first || ( diff % first === 0 && diff / first >= 0 );
        };
      }

      return function( elem ) {
        var node = elem;

        switch ( type ) {
          case "only":
          case "first":
            while ( (node = node.previousSibling) ) {
              if ( node.nodeType === 1 ) {
                return false;
              }
            }

            if ( type === "first" ) {
              return true;
            }

            node = elem;

            /* falls through */
          case "last":
            while ( (node = node.nextSibling) ) {
              if ( node.nodeType === 1 ) {
                return false;
              }
            }

            return true;
        }
      };
    },

    "PSEUDO": function( pseudo, argument ) {
      // pseudo-class names are case-insensitive
      // http://www.w3.org/TR/selectors/#pseudo-classes
      // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
      // Remember that setFilters inherits from pseudos
      var args,
        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
          Sizzle.error( "unsupported pseudo: " + pseudo );

      // The user may use createPseudo to indicate that
      // arguments are needed to create the filter function
      // just as Sizzle does
      if ( fn[ expando ] ) {
        return fn( argument );
      }

      // But maintain support for old signatures
      if ( fn.length > 1 ) {
        args = [ pseudo, pseudo, "", argument ];
        return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
          markFunction(function( seed, matches ) {
            var idx,
              matched = fn( seed, argument ),
              i = matched.length;
            while ( i-- ) {
              idx = indexOf.call( seed, matched[i] );
              seed[ idx ] = !( matches[ idx ] = matched[i] );
            }
          }) :
          function( elem ) {
            return fn( elem, 0, args );
          };
      }

      return fn;
    }
  },

  pseudos: {
    "not": markFunction(function( selector ) {
      // Trim the selector passed to compile
      // to avoid treating leading and trailing
      // spaces as combinators
      var input = [],
        results = [],
        matcher = compile( selector.replace( rtrim, "$1" ) );

      return matcher[ expando ] ?
        markFunction(function( seed, matches, context, xml ) {
          var elem,
            unmatched = matcher( seed, null, xml, [] ),
            i = seed.length;

          // Match elements unmatched by `matcher`
          while ( i-- ) {
            if ( (elem = unmatched[i]) ) {
              seed[i] = !(matches[i] = elem);
            }
          }
        }) :
        function( elem, context, xml ) {
          input[0] = elem;
          matcher( input, null, xml, results );
          return !results.pop();
        };
    }),

    "has": markFunction(function( selector ) {
      return function( elem ) {
        return Sizzle( selector, elem ).length > 0;
      };
    }),

    "contains": markFunction(function( text ) {
      return function( elem ) {
        return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
      };
    }),

    "enabled": function( elem ) {
      return elem.disabled === false;
    },

    "disabled": function( elem ) {
      return elem.disabled === true;
    },

    "checked": function( elem ) {
      // In CSS3, :checked should return both checked and selected elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      var nodeName = elem.nodeName.toLowerCase();
      return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
    },

    "selected": function( elem ) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if ( elem.parentNode ) {
        elem.parentNode.selectedIndex;
      }

      return elem.selected === true;
    },

    "parent": function( elem ) {
      return !Expr.pseudos["empty"]( elem );
    },

    "empty": function( elem ) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
      // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
      //   not comment, processing instructions, or others
      // Thanks to Diego Perini for the nodeName shortcut
      //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
      var nodeType;
      elem = elem.firstChild;
      while ( elem ) {
        if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
          return false;
        }
        elem = elem.nextSibling;
      }
      return true;
    },

    "header": function( elem ) {
      return rheader.test( elem.nodeName );
    },

    "text": function( elem ) {
      var type, attr;
      // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
      // use getAttribute instead to test this case
      return elem.nodeName.toLowerCase() === "input" &&
        (type = elem.type) === "text" &&
        ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
    },

    // Input types
    "radio": createInputPseudo("radio"),
    "checkbox": createInputPseudo("checkbox"),
    "file": createInputPseudo("file"),
    "password": createInputPseudo("password"),
    "image": createInputPseudo("image"),

    "submit": createButtonPseudo("submit"),
    "reset": createButtonPseudo("reset"),

    "button": function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && elem.type === "button" || name === "button";
    },

    "input": function( elem ) {
      return rinputs.test( elem.nodeName );
    },

    "focus": function( elem ) {
      var doc = elem.ownerDocument;
      return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
    },

    "active": function( elem ) {
      return elem === elem.ownerDocument.activeElement;
    },

    // Positional types
    "first": createPositionalPseudo(function( matchIndexes, length, argument ) {
      return [ 0 ];
    }),

    "last": createPositionalPseudo(function( matchIndexes, length, argument ) {
      return [ length - 1 ];
    }),

    "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
      return [ argument < 0 ? argument + length : argument ];
    }),

    "even": createPositionalPseudo(function( matchIndexes, length, argument ) {
      for ( var i = 0; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "odd": createPositionalPseudo(function( matchIndexes, length, argument ) {
      for ( var i = 1; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      for ( var i = argument < 0 ? argument + length : argument; --i >= 0; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      for ( var i = argument < 0 ? argument + length : argument; ++i < length; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    })
  }
};

function siblingCheck( a, b, ret ) {
  if ( a === b ) {
    return ret;
  }

  var cur = a.nextSibling;

  while ( cur ) {
    if ( cur === b ) {
      return -1;
    }

    cur = cur.nextSibling;
  }

  return 1;
}

sortOrder = docElem.compareDocumentPosition ?
  function( a, b ) {
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
      a.compareDocumentPosition :
      a.compareDocumentPosition(b) & 4
    ) ? -1 : 1;
  } :
  function( a, b ) {
    // The nodes are identical, we can exit early
    if ( a === b ) {
      hasDuplicate = true;
      return 0;

    // Fallback to using sourceIndex (in IE) if it's available on both nodes
    } else if ( a.sourceIndex && b.sourceIndex ) {
      return a.sourceIndex - b.sourceIndex;
    }

    var al, bl,
      ap = [],
      bp = [],
      aup = a.parentNode,
      bup = b.parentNode,
      cur = aup;

    // If the nodes are siblings (or identical) we can do a quick check
    if ( aup === bup ) {
      return siblingCheck( a, b );

    // If no parents were found then the nodes are disconnected
    } else if ( !aup ) {
      return -1;

    } else if ( !bup ) {
      return 1;
    }

    // Otherwise they're somewhere else in the tree so we need
    // to build up a full list of the parentNodes for comparison
    while ( cur ) {
      ap.unshift( cur );
      cur = cur.parentNode;
    }

    cur = bup;

    while ( cur ) {
      bp.unshift( cur );
      cur = cur.parentNode;
    }

    al = ap.length;
    bl = bp.length;

    // Start walking down the tree looking for a discrepancy
    for ( var i = 0; i < al && i < bl; i++ ) {
      if ( ap[i] !== bp[i] ) {
        return siblingCheck( ap[i], bp[i] );
      }
    }

    // We ended someplace up the tree so do a sibling check
    return i === al ?
      siblingCheck( a, bp[i], -1 ) :
      siblingCheck( ap[i], b, 1 );
  };

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
  var elem,
    i = 1;

  hasDuplicate = baseHasDuplicate;
  results.sort( sortOrder );

  if ( hasDuplicate ) {
    for ( ; (elem = results[i]); i++ ) {
      if ( elem === results[ i - 1 ] ) {
        results.splice( i--, 1 );
      }
    }
  }

  return results;
};

Sizzle.error = function( msg ) {
  throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, parseOnly ) {
  var matched, match, tokens, type, soFar, groups, preFilters,
    cached = tokenCache[ expando ][ selector ];

  if ( cached ) {
    return parseOnly ? 0 : cached.slice( 0 );
  }

  soFar = selector;
  groups = [];
  preFilters = Expr.preFilter;

  while ( soFar ) {

    // Comma and first run
    if ( !matched || (match = rcomma.exec( soFar )) ) {
      if ( match ) {
        soFar = soFar.slice( match[0].length );
      }
      groups.push( tokens = [] );
    }

    matched = false;

    // Combinators
    if ( (match = rcombinators.exec( soFar )) ) {
      tokens.push( matched = new Token( match.shift() ) );
      soFar = soFar.slice( matched.length );

      // Cast descendant combinators to space
      matched.type = match[0].replace( rtrim, " " );
    }

    // Filters
    for ( type in Expr.filter ) {
      if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
        // The last two arguments here are (context, xml) for backCompat
        (match = preFilters[ type ]( match, document, true ))) ) {

        tokens.push( matched = new Token( match.shift() ) );
        soFar = soFar.slice( matched.length );
        matched.type = type;
        matched.matches = match;
      }
    }

    if ( !matched ) {
      break;
    }
  }

  // Return the length of the invalid excess
  // if we're just parsing
  // Otherwise, throw an error or return tokens
  return parseOnly ?
    soFar.length :
    soFar ?
      Sizzle.error( selector ) :
      // Cache the tokens
      tokenCache( selector, groups ).slice( 0 );
}

function addCombinator( matcher, combinator, base ) {
  var dir = combinator.dir,
    checkNonElements = base && combinator.dir === "parentNode",
    doneName = done++;

  return combinator.first ?
    // Check against closest ancestor/preceding element
    function( elem, context, xml ) {
      while ( (elem = elem[ dir ]) ) {
        if ( checkNonElements || elem.nodeType === 1  ) {
          return matcher( elem, context, xml );
        }
      }
    } :

    // Check against all ancestor/preceding elements
    function( elem, context, xml ) {
      // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
      if ( !xml ) {
        var cache,
          dirkey = dirruns + " " + doneName + " ",
          cachedkey = dirkey + cachedruns;
        while ( (elem = elem[ dir ]) ) {
          if ( checkNonElements || elem.nodeType === 1 ) {
            if ( (cache = elem[ expando ]) === cachedkey ) {
              return elem.sizset;
            } else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
              if ( elem.sizset ) {
                return elem;
              }
            } else {
              elem[ expando ] = cachedkey;
              if ( matcher( elem, context, xml ) ) {
                elem.sizset = true;
                return elem;
              }
              elem.sizset = false;
            }
          }
        }
      } else {
        while ( (elem = elem[ dir ]) ) {
          if ( checkNonElements || elem.nodeType === 1 ) {
            if ( matcher( elem, context, xml ) ) {
              return elem;
            }
          }
        }
      }
    };
}

function elementMatcher( matchers ) {
  return matchers.length > 1 ?
    function( elem, context, xml ) {
      var i = matchers.length;
      while ( i-- ) {
        if ( !matchers[i]( elem, context, xml ) ) {
          return false;
        }
      }
      return true;
    } :
    matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
  var elem,
    newUnmatched = [],
    i = 0,
    len = unmatched.length,
    mapped = map != null;

  for ( ; i < len; i++ ) {
    if ( (elem = unmatched[i]) ) {
      if ( !filter || filter( elem, context, xml ) ) {
        newUnmatched.push( elem );
        if ( mapped ) {
          map.push( i );
        }
      }
    }
  }

  return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
  if ( postFilter && !postFilter[ expando ] ) {
    postFilter = setMatcher( postFilter );
  }
  if ( postFinder && !postFinder[ expando ] ) {
    postFinder = setMatcher( postFinder, postSelector );
  }
  return markFunction(function( seed, results, context, xml ) {
    // Positional selectors apply to seed elements, so it is invalid to follow them with relative ones
    if ( seed && postFinder ) {
      return;
    }

    var i, elem, postFilterIn,
      preMap = [],
      postMap = [],
      preexisting = results.length,

      // Get initial elements from seed or context
      elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [], seed ),

      // Prefilter to get matcher input, preserving a map for seed-results synchronization
      matcherIn = preFilter && ( seed || !selector ) ?
        condense( elems, preMap, preFilter, context, xml ) :
        elems,

      matcherOut = matcher ?
        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

          // ...intermediate processing is necessary
          [] :

          // ...otherwise use results directly
          results :
        matcherIn;

    // Find primary matches
    if ( matcher ) {
      matcher( matcherIn, matcherOut, context, xml );
    }

    // Apply postFilter
    if ( postFilter ) {
      postFilterIn = condense( matcherOut, postMap );
      postFilter( postFilterIn, [], context, xml );

      // Un-match failing elements by moving them back to matcherIn
      i = postFilterIn.length;
      while ( i-- ) {
        if ( (elem = postFilterIn[i]) ) {
          matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
        }
      }
    }

    // Keep seed and results synchronized
    if ( seed ) {
      // Ignore postFinder because it can't coexist with seed
      i = preFilter && matcherOut.length;
      while ( i-- ) {
        if ( (elem = matcherOut[i]) ) {
          seed[ preMap[i] ] = !(results[ preMap[i] ] = elem);
        }
      }
    } else {
      matcherOut = condense(
        matcherOut === results ?
          matcherOut.splice( preexisting, matcherOut.length ) :
          matcherOut
      );
      if ( postFinder ) {
        postFinder( null, results, matcherOut, xml );
      } else {
        push.apply( results, matcherOut );
      }
    }
  });
}

function matcherFromTokens( tokens ) {
  var checkContext, matcher, j,
    len = tokens.length,
    leadingRelative = Expr.relative[ tokens[0].type ],
    implicitRelative = leadingRelative || Expr.relative[" "],
    i = leadingRelative ? 1 : 0,

    // The foundational matcher ensures that elements are reachable from top-level context(s)
    matchContext = addCombinator( function( elem ) {
      return elem === checkContext;
    }, implicitRelative, true ),
    matchAnyContext = addCombinator( function( elem ) {
      return indexOf.call( checkContext, elem ) > -1;
    }, implicitRelative, true ),
    matchers = [ function( elem, context, xml ) {
      return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
        (checkContext = context).nodeType ?
          matchContext( elem, context, xml ) :
          matchAnyContext( elem, context, xml ) );
    } ];

  for ( ; i < len; i++ ) {
    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
      matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
    } else {
      // The concatenated values are (context, xml) for backCompat
      matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

      // Return special upon seeing a positional matcher
      if ( matcher[ expando ] ) {
        // Find the next relative operator (if any) for proper handling
        j = ++i;
        for ( ; j < len; j++ ) {
          if ( Expr.relative[ tokens[j].type ] ) {
            break;
          }
        }
        return setMatcher(
          i > 1 && elementMatcher( matchers ),
          i > 1 && tokens.slice( 0, i - 1 ).join("").replace( rtrim, "$1" ),
          matcher,
          i < j && matcherFromTokens( tokens.slice( i, j ) ),
          j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
          j < len && tokens.join("")
        );
      }
      matchers.push( matcher );
    }
  }

  return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
  var bySet = setMatchers.length > 0,
    byElement = elementMatchers.length > 0,
    superMatcher = function( seed, context, xml, results, expandContext ) {
      var elem, j, matcher,
        setMatched = [],
        matchedCount = 0,
        i = "0",
        unmatched = seed && [],
        outermost = expandContext != null,
        contextBackup = outermostContext,
        // We must always have either seed elements or context
        elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
        // Nested matchers should use non-integer dirruns
        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.E);

      if ( outermost ) {
        outermostContext = context !== document && context;
        cachedruns = superMatcher.el;
      }

      // Add elements passing elementMatchers directly to results
      for ( ; (elem = elems[i]) != null; i++ ) {
        if ( byElement && elem ) {
          for ( j = 0; (matcher = elementMatchers[j]); j++ ) {
            if ( matcher( elem, context, xml ) ) {
              results.push( elem );
              break;
            }
          }
          if ( outermost ) {
            dirruns = dirrunsUnique;
            cachedruns = ++superMatcher.el;
          }
        }

        // Track unmatched elements for set filters
        if ( bySet ) {
          // They will have gone through all possible matchers
          if ( (elem = !matcher && elem) ) {
            matchedCount--;
          }

          // Lengthen the array for every element, matched or not
          if ( seed ) {
            unmatched.push( elem );
          }
        }
      }

      // Apply set filters to unmatched elements
      matchedCount += i;
      if ( bySet && i !== matchedCount ) {
        for ( j = 0; (matcher = setMatchers[j]); j++ ) {
          matcher( unmatched, setMatched, context, xml );
        }

        if ( seed ) {
          // Reintegrate element matches to eliminate the need for sorting
          if ( matchedCount > 0 ) {
            while ( i-- ) {
              if ( !(unmatched[i] || setMatched[i]) ) {
                setMatched[i] = pop.call( results );
              }
            }
          }

          // Discard index placeholder values to get only actual matches
          setMatched = condense( setMatched );
        }

        // Add matches to results
        push.apply( results, setMatched );

        // Seedless set matches succeeding multiple successful matchers stipulate sorting
        if ( outermost && !seed && setMatched.length > 0 &&
          ( matchedCount + setMatchers.length ) > 1 ) {

          Sizzle.uniqueSort( results );
        }
      }

      // Override manipulation of globals by nested matchers
      if ( outermost ) {
        dirruns = dirrunsUnique;
        outermostContext = contextBackup;
      }

      return unmatched;
    };

  superMatcher.el = 0;
  return bySet ?
    markFunction( superMatcher ) :
    superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
  var i,
    setMatchers = [],
    elementMatchers = [],
    cached = compilerCache[ expando ][ selector ];

  if ( !cached ) {
    // Generate a function of recursive functions that can be used to check each element
    if ( !group ) {
      group = tokenize( selector );
    }
    i = group.length;
    while ( i-- ) {
      cached = matcherFromTokens( group[i] );
      if ( cached[ expando ] ) {
        setMatchers.push( cached );
      } else {
        elementMatchers.push( cached );
      }
    }

    // Cache the compiled function
    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
  }
  return cached;
};

function multipleContexts( selector, contexts, results, seed ) {
  var i = 0,
    len = contexts.length;
  for ( ; i < len; i++ ) {
    Sizzle( selector, contexts[i], results, seed );
  }
  return results;
}

function select( selector, context, results, seed, xml ) {
  var i, tokens, token, type, find,
    match = tokenize( selector ),
    j = match.length;

  if ( !seed ) {
    // Try to minimize operations if there is only one group
    if ( match.length === 1 ) {

      // Take a shortcut and set the context if the root selector is an ID
      tokens = match[0] = match[0].slice( 0 );
      if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
          context.nodeType === 9 && !xml &&
          Expr.relative[ tokens[1].type ] ) {

        context = Expr.find["ID"]( token.matches[0].replace( rbackslash, "" ), context, xml )[0];
        if ( !context ) {
          return results;
        }

        selector = selector.slice( tokens.shift().length );
      }

      // Fetch a seed set for right-to-left matching
      for ( i = matchExpr["POS"].test( selector ) ? -1 : tokens.length - 1; i >= 0; i-- ) {
        token = tokens[i];

        // Abort if we hit a combinator
        if ( Expr.relative[ (type = token.type) ] ) {
          break;
        }
        if ( (find = Expr.find[ type ]) ) {
          // Search, expanding context for leading sibling combinators
          if ( (seed = find(
            token.matches[0].replace( rbackslash, "" ),
            rsibling.test( tokens[0].type ) && context.parentNode || context,
            xml
          )) ) {

            // If seed is empty or no tokens remain, we can return early
            tokens.splice( i, 1 );
            selector = seed.length && tokens.join("");
            if ( !selector ) {
              push.apply( results, slice.call( seed, 0 ) );
              return results;
            }

            break;
          }
        }
      }
    }
  }

  // Compile and execute a filtering function
  // Provide `match` to avoid retokenization if we modified the selector above
  compile( selector, match )(
    seed,
    context,
    xml,
    results,
    rsibling.test( selector )
  );
  return results;
}

if ( document.querySelectorAll ) {
  (function() {
    var disconnectedMatch,
      oldSelect = select,
      rescape = /'|\\/g,
      rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

      // qSa(:focus) reports false when true (Chrome 21),
      // A support test would require too much code (would include document ready)
      rbuggyQSA = [":focus"],

      // matchesSelector(:focus) reports false when true (Chrome 21),
      // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
      // A support test would require too much code (would include document ready)
      // just skip matchesSelector for :active
      rbuggyMatches = [ ":active", ":focus" ],
      matches = docElem.matchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.webkitMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector;

    // Build QSA regex
    // Regex strategy adopted from Diego Perini
    assert(function( div ) {
      // Select is set to empty string on purpose
      // This is to test IE's treatment of not explictly
      // setting a boolean content attribute,
      // since its presence should be enough
      // http://bugs.jquery.com/ticket/12359
      div.innerHTML = "<select><option selected=''></option></select>";

      // IE8 - Some boolean attributes are not treated correctly
      if ( !div.querySelectorAll("[selected]").length ) {
        rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
      }

      // Webkit/Opera - :checked should return selected option elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      // IE8 throws error here (do not put tests after this one)
      if ( !div.querySelectorAll(":checked").length ) {
        rbuggyQSA.push(":checked");
      }
    });

    assert(function( div ) {

      // Opera 10-12/IE9 - ^= $= *= and empty values
      // Should not select anything
      div.innerHTML = "<p test=''></p>";
      if ( div.querySelectorAll("[test^='']").length ) {
        rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
      }

      // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
      // IE8 throws error here (do not put tests after this one)
      div.innerHTML = "<input type='hidden'/>";
      if ( !div.querySelectorAll(":enabled").length ) {
        rbuggyQSA.push(":enabled", ":disabled");
      }
    });

    // rbuggyQSA always contains :focus, so no need for a length check
    rbuggyQSA = /* rbuggyQSA.length && */ new RegExp( rbuggyQSA.join("|") );

    select = function( selector, context, results, seed, xml ) {
      // Only use querySelectorAll when not filtering,
      // when this is not xml,
      // and when no QSA bugs apply
      if ( !seed && !xml && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
        var groups, i,
          old = true,
          nid = expando,
          newContext = context,
          newSelector = context.nodeType === 9 && selector;

        // qSA works strangely on Element-rooted queries
        // We can work around this by specifying an extra ID on the root
        // and working up from there (Thanks to Andrew Dupont for the technique)
        // IE 8 doesn't work on object elements
        if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
          groups = tokenize( selector );

          if ( (old = context.getAttribute("id")) ) {
            nid = old.replace( rescape, "\\$&" );
          } else {
            context.setAttribute( "id", nid );
          }
          nid = "[id='" + nid + "'] ";

          i = groups.length;
          while ( i-- ) {
            groups[i] = nid + groups[i].join("");
          }
          newContext = rsibling.test( selector ) && context.parentNode || context;
          newSelector = groups.join(",");
        }

        if ( newSelector ) {
          try {
            push.apply( results, slice.call( newContext.querySelectorAll(
              newSelector
            ), 0 ) );
            return results;
          } catch(qsaError) {
          } finally {
            if ( !old ) {
              context.removeAttribute("id");
            }
          }
        }
      }

      return oldSelect( selector, context, results, seed, xml );
    };

    if ( matches ) {
      assert(function( div ) {
        // Check to see if it's possible to do matchesSelector
        // on a disconnected node (IE 9)
        disconnectedMatch = matches.call( div, "div" );

        // This should fail with an exception
        // Gecko does not error, returns false instead
        try {
          matches.call( div, "[test!='']:sizzle" );
          rbuggyMatches.push( "!=", pseudos );
        } catch ( e ) {}
      });

      // rbuggyMatches always contains :active and :focus, so no need for a length check
      rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

      Sizzle.matchesSelector = function( elem, expr ) {
        // Make sure that attribute selectors are quoted
        expr = expr.replace( rattributeQuotes, "='$1']" );

        // rbuggyMatches always contains :active, so no need for an existence check
        if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && (!rbuggyQSA || !rbuggyQSA.test( expr )) ) {
          try {
            var ret = matches.call( elem, expr );

            // IE 9's matchesSelector returns false on disconnected nodes
            if ( ret || disconnectedMatch ||
                // As well, disconnected nodes are said to be in a document
                // fragment in IE 9
                elem.document && elem.document.nodeType !== 11 ) {
              return ret;
            }
          } catch(e) {}
        }

        return Sizzle( expr, null, null, [ elem ] ).length > 0;
      };
    }
  })();
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Back-compat
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
  rparentsprev = /^(?:parents|prev(?:Until|All))/,
  isSimple = /^.[^:#\[\.,]*$/,
  rneedsContext = jQuery.expr.match.needsContext,
  // methods guaranteed to produce a unique set when starting from a unique set
  guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true
  };

jQuery.fn.extend({
  find: function( selector ) {
    var i, l, length, n, r, ret,
      self = this;

    if ( typeof selector !== "string" ) {
      return jQuery( selector ).filter(function() {
        for ( i = 0, l = self.length; i < l; i++ ) {
          if ( jQuery.contains( self[ i ], this ) ) {
            return true;
          }
        }
      });
    }

    ret = this.pushStack( "", "find", selector );

    for ( i = 0, l = this.length; i < l; i++ ) {
      length = ret.length;
      jQuery.find( selector, this[i], ret );

      if ( i > 0 ) {
        // Make sure that the results are unique
        for ( n = length; n < ret.length; n++ ) {
          for ( r = 0; r < length; r++ ) {
            if ( ret[r] === ret[n] ) {
              ret.splice(n--, 1);
              break;
            }
          }
        }
      }
    }

    return ret;
  },

  has: function( target ) {
    var i,
      targets = jQuery( target, this ),
      len = targets.length;

    return this.filter(function() {
      for ( i = 0; i < len; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  not: function( selector ) {
    return this.pushStack( winnow(this, selector, false), "not", selector);
  },

  filter: function( selector ) {
    return this.pushStack( winnow(this, selector, true), "filter", selector );
  },

  is: function( selector ) {
    return !!selector && (
      typeof selector === "string" ?
        // If this is a positional/relative selector, check membership in the returned set
        // so $("p:first").is("p:last") won't return true for a doc with two "p".
        rneedsContext.test( selector ) ?
          jQuery( selector, this.context ).index( this[0] ) >= 0 :
          jQuery.filter( selector, this ).length > 0 :
        this.filter( selector ).length > 0 );
  },

  closest: function( selectors, context ) {
    var cur,
      i = 0,
      l = this.length,
      ret = [],
      pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
        jQuery( selectors, context || this.context ) :
        0;

    for ( ; i < l; i++ ) {
      cur = this[i];

      while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
        if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
          ret.push( cur );
          break;
        }
        cur = cur.parentNode;
      }
    }

    ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

    return this.pushStack( ret, "closest", selectors );
  },

  // Determine the position of an element within
  // the matched set of elements
  index: function( elem ) {

    // No argument, return index in parent
    if ( !elem ) {
      return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
    }

    // index in selector
    if ( typeof elem === "string" ) {
      return jQuery.inArray( this[0], jQuery( elem ) );
    }

    // Locate the position of the desired element
    return jQuery.inArray(
      // If it receives a jQuery object, the first element is used
      elem.jquery ? elem[0] : elem, this );
  },

  add: function( selector, context ) {
    var set = typeof selector === "string" ?
        jQuery( selector, context ) :
        jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
      all = jQuery.merge( this.get(), set );

    return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
      all :
      jQuery.unique( all ) );
  },

  addBack: function( selector ) {
    return this.add( selector == null ?
      this.prevObject : this.prevObject.filter(selector)
    );
  }
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
  return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
  do {
    cur = cur[ dir ];
  } while ( cur && cur.nodeType !== 1 );

  return cur;
}

jQuery.each({
  parent: function( elem ) {
    var parent = elem.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },
  parents: function( elem ) {
    return jQuery.dir( elem, "parentNode" );
  },
  parentsUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "parentNode", until );
  },
  next: function( elem ) {
    return sibling( elem, "nextSibling" );
  },
  prev: function( elem ) {
    return sibling( elem, "previousSibling" );
  },
  nextAll: function( elem ) {
    return jQuery.dir( elem, "nextSibling" );
  },
  prevAll: function( elem ) {
    return jQuery.dir( elem, "previousSibling" );
  },
  nextUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "nextSibling", until );
  },
  prevUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "previousSibling", until );
  },
  siblings: function( elem ) {
    return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
  },
  children: function( elem ) {
    return jQuery.sibling( elem.firstChild );
  },
  contents: function( elem ) {
    return jQuery.nodeName( elem, "iframe" ) ?
      elem.contentDocument || elem.contentWindow.document :
      jQuery.merge( [], elem.childNodes );
  }
}, function( name, fn ) {
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until );

    if ( !runtil.test( name ) ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

    if ( this.length > 1 && rparentsprev.test( name ) ) {
      ret = ret.reverse();
    }

    return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
  };
});

jQuery.extend({
  filter: function( expr, elems, not ) {
    if ( not ) {
      expr = ":not(" + expr + ")";
    }

    return elems.length === 1 ?
      jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
      jQuery.find.matches(expr, elems);
  },

  dir: function( elem, dir, until ) {
    var matched = [],
      cur = elem[ dir ];

    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

  // Can't pass null or undefined to indexOf in Firefox 4
  // Set to 0 to skip string check
  qualifier = qualifier || 0;

  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep(elements, function( elem, i ) {
      var retVal = !!qualifier.call( elem, i, elem );
      return retVal === keep;
    });

  } else if ( qualifier.nodeType ) {
    return jQuery.grep(elements, function( elem, i ) {
      return ( elem === qualifier ) === keep;
    });

  } else if ( typeof qualifier === "string" ) {
    var filtered = jQuery.grep(elements, function( elem ) {
      return elem.nodeType === 1;
    });

    if ( isSimple.test( qualifier ) ) {
      return jQuery.filter(qualifier, filtered, !keep);
    } else {
      qualifier = jQuery.filter( qualifier, filtered );
    }
  }

  return jQuery.grep(elements, function( elem, i ) {
    return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
  });
}
function createSafeFragment( document ) {
  var list = nodeNames.split( "|" ),
  safeFrag = document.createDocumentFragment();

  if ( safeFrag.createElement ) {
    while ( list.length ) {
      safeFrag.createElement(
        list.pop()
      );
    }
  }
  return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
    "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
  rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
  rleadingWhitespace = /^\s+/,
  rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  rtagName = /<([\w:]+)/,
  rtbody = /<tbody/i,
  rhtml = /<|&#?\w+;/,
  rnoInnerhtml = /<(?:script|style|link)/i,
  rnocache = /<(?:script|object|embed|option|style)/i,
  rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
  rcheckableType = /^(?:checkbox|radio)$/,
  // checked="checked" or checked
  rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
  rscriptType = /\/(java|ecma)script/i,
  rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
  wrapMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    area: [ 1, "<map>", "</map>" ],
    _default: [ 0, "", "" ]
  },
  safeFragment = createSafeFragment( document ),
  fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
  wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
  text: function( value ) {
    return jQuery.access( this, function( value ) {
      return value === undefined ?
        jQuery.text( this ) :
        this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
    }, null, value, arguments.length );
  },

  wrapAll: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapAll( html.call(this, i) );
      });
    }

    if ( this[0] ) {
      // The elements to wrap the target around
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

      if ( this[0].parentNode ) {
        wrap.insertBefore( this[0] );
      }

      wrap.map(function() {
        var elem = this;

        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
          elem = elem.firstChild;
        }

        return elem;
      }).append( this );
    }

    return this;
  },

  wrapInner: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapInner( html.call(this, i) );
      });
    }

    return this.each(function() {
      var self = jQuery( this ),
        contents = self.contents();

      if ( contents.length ) {
        contents.wrapAll( html );

      } else {
        self.append( html );
      }
    });
  },

  wrap: function( html ) {
    var isFunction = jQuery.isFunction( html );

    return this.each(function(i) {
      jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
    });
  },

  unwrap: function() {
    return this.parent().each(function() {
      if ( !jQuery.nodeName( this, "body" ) ) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    }).end();
  },

  append: function() {
    return this.domManip(arguments, true, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 ) {
        this.appendChild( elem );
      }
    });
  },

  prepend: function() {
    return this.domManip(arguments, true, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 ) {
        this.insertBefore( elem, this.firstChild );
      }
    });
  },

  before: function() {
    if ( !isDisconnected( this[0] ) ) {
      return this.domManip(arguments, false, function( elem ) {
        this.parentNode.insertBefore( elem, this );
      });
    }

    if ( arguments.length ) {
      var set = jQuery.clean( arguments );
      return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
    }
  },

  after: function() {
    if ( !isDisconnected( this[0] ) ) {
      return this.domManip(arguments, false, function( elem ) {
        this.parentNode.insertBefore( elem, this.nextSibling );
      });
    }

    if ( arguments.length ) {
      var set = jQuery.clean( arguments );
      return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
    }
  },

  // keepData is for internal use only--do not document
  remove: function( selector, keepData ) {
    var elem,
      i = 0;

    for ( ; (elem = this[i]) != null; i++ ) {
      if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
        if ( !keepData && elem.nodeType === 1 ) {
          jQuery.cleanData( elem.getElementsByTagName("*") );
          jQuery.cleanData( [ elem ] );
        }

        if ( elem.parentNode ) {
          elem.parentNode.removeChild( elem );
        }
      }
    }

    return this;
  },

  empty: function() {
    var elem,
      i = 0;

    for ( ; (elem = this[i]) != null; i++ ) {
      // Remove element nodes and prevent memory leaks
      if ( elem.nodeType === 1 ) {
        jQuery.cleanData( elem.getElementsByTagName("*") );
      }

      // Remove any remaining nodes
      while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
      }
    }

    return this;
  },

  clone: function( dataAndEvents, deepDataAndEvents ) {
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    return this.map( function () {
      return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    });
  },

  html: function( value ) {
    return jQuery.access( this, function( value ) {
      var elem = this[0] || {},
        i = 0,
        l = this.length;

      if ( value === undefined ) {
        return elem.nodeType === 1 ?
          elem.innerHTML.replace( rinlinejQuery, "" ) :
          undefined;
      }

      // See if we can take a shortcut and just use innerHTML
      if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
        ( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
        ( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
        !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

        value = value.replace( rxhtmlTag, "<$1></$2>" );

        try {
          for (; i < l; i++ ) {
            // Remove element nodes and prevent memory leaks
            elem = this[i] || {};
            if ( elem.nodeType === 1 ) {
              jQuery.cleanData( elem.getElementsByTagName( "*" ) );
              elem.innerHTML = value;
            }
          }

          elem = 0;

        // If using innerHTML throws an exception, use the fallback method
        } catch(e) {}
      }

      if ( elem ) {
        this.empty().append( value );
      }
    }, null, value, arguments.length );
  },

  replaceWith: function( value ) {
    if ( !isDisconnected( this[0] ) ) {
      // Make sure that the elements are removed from the DOM before they are inserted
      // this can help fix replacing a parent with child elements
      if ( jQuery.isFunction( value ) ) {
        return this.each(function(i) {
          var self = jQuery(this), old = self.html();
          self.replaceWith( value.call( this, i, old ) );
        });
      }

      if ( typeof value !== "string" ) {
        value = jQuery( value ).detach();
      }

      return this.each(function() {
        var next = this.nextSibling,
          parent = this.parentNode;

        jQuery( this ).remove();

        if ( next ) {
          jQuery(next).before( value );
        } else {
          jQuery(parent).append( value );
        }
      });
    }

    return this.length ?
      this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
      this;
  },

  detach: function( selector ) {
    return this.remove( selector, true );
  },

  domManip: function( args, table, callback ) {

    // Flatten any nested arrays
    args = [].concat.apply( [], args );

    var results, first, fragment, iNoClone,
      i = 0,
      value = args[0],
      scripts = [],
      l = this.length;

    // We can't cloneNode fragments that contain checked, in WebKit
    if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
      return this.each(function() {
        jQuery(this).domManip( args, table, callback );
      });
    }

    if ( jQuery.isFunction(value) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        args[0] = value.call( this, i, table ? self.html() : undefined );
        self.domManip( args, table, callback );
      });
    }

    if ( this[0] ) {
      results = jQuery.buildFragment( args, this, scripts );
      fragment = results.fragment;
      first = fragment.firstChild;

      if ( fragment.childNodes.length === 1 ) {
        fragment = first;
      }

      if ( first ) {
        table = table && jQuery.nodeName( first, "tr" );

        // Use the original fragment for the last item instead of the first because it can end up
        // being emptied incorrectly in certain situations (#8070).
        // Fragments from the fragment cache must always be cloned and never used in place.
        for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
          callback.call(
            table && jQuery.nodeName( this[i], "table" ) ?
              findOrAppend( this[i], "tbody" ) :
              this[i],
            i === iNoClone ?
              fragment :
              jQuery.clone( fragment, true, true )
          );
        }
      }

      // Fix #11809: Avoid leaking memory
      fragment = first = null;

      if ( scripts.length ) {
        jQuery.each( scripts, function( i, elem ) {
          if ( elem.src ) {
            if ( jQuery.ajax ) {
              jQuery.ajax({
                url: elem.src,
                type: "GET",
                dataType: "script",
                async: false,
                global: false,
                "throws": true
              });
            } else {
              jQuery.error("no ajax");
            }
          } else {
            jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
          }

          if ( elem.parentNode ) {
            elem.parentNode.removeChild( elem );
          }
        });
      }
    }

    return this;
  }
});

function findOrAppend( elem, tag ) {
  return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

  if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
    return;
  }

  var type, i, l,
    oldData = jQuery._data( src ),
    curData = jQuery._data( dest, oldData ),
    events = oldData.events;

  if ( events ) {
    delete curData.handle;
    curData.events = {};

    for ( type in events ) {
      for ( i = 0, l = events[ type ].length; i < l; i++ ) {
        jQuery.event.add( dest, type, events[ type ][ i ] );
      }
    }
  }

  // make the cloned public data object a copy from the original
  if ( curData.data ) {
    curData.data = jQuery.extend( {}, curData.data );
  }
}

function cloneFixAttributes( src, dest ) {
  var nodeName;

  // We do not need to do anything for non-Elements
  if ( dest.nodeType !== 1 ) {
    return;
  }

  // clearAttributes removes the attributes, which we don't want,
  // but also removes the attachEvent events, which we *do* want
  if ( dest.clearAttributes ) {
    dest.clearAttributes();
  }

  // mergeAttributes, in contrast, only merges back on the
  // original attributes, not the events
  if ( dest.mergeAttributes ) {
    dest.mergeAttributes( src );
  }

  nodeName = dest.nodeName.toLowerCase();

  if ( nodeName === "object" ) {
    // IE6-10 improperly clones children of object elements using classid.
    // IE10 throws NoModificationAllowedError if parent is null, #12132.
    if ( dest.parentNode ) {
      dest.outerHTML = src.outerHTML;
    }

    // This path appears unavoidable for IE9. When cloning an object
    // element in IE9, the outerHTML strategy above is not sufficient.
    // If the src has innerHTML and the destination does not,
    // copy the src.innerHTML into the dest.innerHTML. #10324
    if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
      dest.innerHTML = src.innerHTML;
    }

  } else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
    // IE6-8 fails to persist the checked state of a cloned checkbox
    // or radio button. Worse, IE6-7 fail to give the cloned element
    // a checked appearance if the defaultChecked value isn't also set

    dest.defaultChecked = dest.checked = src.checked;

    // IE6-7 get confused and end up setting the value of a cloned
    // checkbox/radio button to an empty string instead of "on"
    if ( dest.value !== src.value ) {
      dest.value = src.value;
    }

  // IE6-8 fails to return the selected option to the default selected
  // state when cloning options
  } else if ( nodeName === "option" ) {
    dest.selected = src.defaultSelected;

  // IE6-8 fails to set the defaultValue to the correct value when
  // cloning other types of input fields
  } else if ( nodeName === "input" || nodeName === "textarea" ) {
    dest.defaultValue = src.defaultValue;

  // IE blanks contents when cloning scripts
  } else if ( nodeName === "script" && dest.text !== src.text ) {
    dest.text = src.text;
  }

  // Event data gets referenced instead of copied if the expando
  // gets copied too
  dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
  var fragment, cacheable, cachehit,
    first = args[ 0 ];

  // Set context from what may come in as undefined or a jQuery collection or a node
  // Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
  // also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
  context = context || document;
  context = !context.nodeType && context[0] || context;
  context = context.ownerDocument || context;

  // Only cache "small" (1/2 KB) HTML strings that are associated with the main document
  // Cloning options loses the selected state, so don't cache them
  // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
  // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
  // Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
  if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
    first.charAt(0) === "<" && !rnocache.test( first ) &&
    (jQuery.support.checkClone || !rchecked.test( first )) &&
    (jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

    // Mark cacheable and look for a hit
    cacheable = true;
    fragment = jQuery.fragments[ first ];
    cachehit = fragment !== undefined;
  }

  if ( !fragment ) {
    fragment = context.createDocumentFragment();
    jQuery.clean( args, context, fragment, scripts );

    // Update the cache, but only store false
    // unless this is a second parsing of the same content
    if ( cacheable ) {
      jQuery.fragments[ first ] = cachehit && fragment;
    }
  }

  return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
  appendTo: "append",
  prependTo: "prepend",
  insertBefore: "before",
  insertAfter: "after",
  replaceAll: "replaceWith"
}, function( name, original ) {
  jQuery.fn[ name ] = function( selector ) {
    var elems,
      i = 0,
      ret = [],
      insert = jQuery( selector ),
      l = insert.length,
      parent = this.length === 1 && this[0].parentNode;

    if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
      insert[ original ]( this[0] );
      return this;
    } else {
      for ( ; i < l; i++ ) {
        elems = ( i > 0 ? this.clone(true) : this ).get();
        jQuery( insert[i] )[ original ]( elems );
        ret = ret.concat( elems );
      }

      return this.pushStack( ret, name, insert.selector );
    }
  };
});

function getAll( elem ) {
  if ( typeof elem.getElementsByTagName !== "undefined" ) {
    return elem.getElementsByTagName( "*" );

  } else if ( typeof elem.querySelectorAll !== "undefined" ) {
    return elem.querySelectorAll( "*" );

  } else {
    return [];
  }
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
  if ( rcheckableType.test( elem.type ) ) {
    elem.defaultChecked = elem.checked;
  }
}

jQuery.extend({
  clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    var srcElements,
      destElements,
      i,
      clone;

    if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
      clone = elem.cloneNode( true );

    // IE<=8 does not properly clone detached, unknown element nodes
    } else {
      fragmentDiv.innerHTML = elem.outerHTML;
      fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
    }

    if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
        (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
      // IE copies events bound via attachEvent when using cloneNode.
      // Calling detachEvent on the clone will also remove the events
      // from the original. In order to get around this, we use some
      // proprietary methods to clear the events. Thanks to MooTools
      // guys for this hotness.

      cloneFixAttributes( elem, clone );

      // Using Sizzle here is crazy slow, so we use getElementsByTagName instead
      srcElements = getAll( elem );
      destElements = getAll( clone );

      // Weird iteration because IE will replace the length property
      // with an element if you are cloning the body and one of the
      // elements on the page has a name or id of "length"
      for ( i = 0; srcElements[i]; ++i ) {
        // Ensure that the destination node is not null; Fixes #9587
        if ( destElements[i] ) {
          cloneFixAttributes( srcElements[i], destElements[i] );
        }
      }
    }

    // Copy the events from the original to the clone
    if ( dataAndEvents ) {
      cloneCopyEvent( elem, clone );

      if ( deepDataAndEvents ) {
        srcElements = getAll( elem );
        destElements = getAll( clone );

        for ( i = 0; srcElements[i]; ++i ) {
          cloneCopyEvent( srcElements[i], destElements[i] );
        }
      }
    }

    srcElements = destElements = null;

    // Return the cloned set
    return clone;
  },

  clean: function( elems, context, fragment, scripts ) {
    var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
      safe = context === document && safeFragment,
      ret = [];

    // Ensure that context is a document
    if ( !context || typeof context.createDocumentFragment === "undefined" ) {
      context = document;
    }

    // Use the already-created safe fragment if context permits
    for ( i = 0; (elem = elems[i]) != null; i++ ) {
      if ( typeof elem === "number" ) {
        elem += "";
      }

      if ( !elem ) {
        continue;
      }

      // Convert html string into DOM nodes
      if ( typeof elem === "string" ) {
        if ( !rhtml.test( elem ) ) {
          elem = context.createTextNode( elem );
        } else {
          // Ensure a safe container in which to render the html
          safe = safe || createSafeFragment( context );
          div = context.createElement("div");
          safe.appendChild( div );

          // Fix "XHTML"-style tags in all browsers
          elem = elem.replace(rxhtmlTag, "<$1></$2>");

          // Go to html and back, then peel off extra wrappers
          tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
          wrap = wrapMap[ tag ] || wrapMap._default;
          depth = wrap[0];
          div.innerHTML = wrap[1] + elem + wrap[2];

          // Move to the right depth
          while ( depth-- ) {
            div = div.lastChild;
          }

          // Remove IE's autoinserted <tbody> from table fragments
          if ( !jQuery.support.tbody ) {

            // String was a <table>, *may* have spurious <tbody>
            hasBody = rtbody.test(elem);
              tbody = tag === "table" && !hasBody ?
                div.firstChild && div.firstChild.childNodes :

                // String was a bare <thead> or <tfoot>
                wrap[1] === "<table>" && !hasBody ?
                  div.childNodes :
                  [];

            for ( j = tbody.length - 1; j >= 0 ; --j ) {
              if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
                tbody[ j ].parentNode.removeChild( tbody[ j ] );
              }
            }
          }

          // IE completely kills leading whitespace when innerHTML is used
          if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
            div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
          }

          elem = div.childNodes;

          // Take out of fragment container (we need a fresh div each time)
          div.parentNode.removeChild( div );
        }
      }

      if ( elem.nodeType ) {
        ret.push( elem );
      } else {
        jQuery.merge( ret, elem );
      }
    }

    // Fix #11356: Clear elements from safeFragment
    if ( div ) {
      elem = div = safe = null;
    }

    // Reset defaultChecked for any radios and checkboxes
    // about to be appended to the DOM in IE 6/7 (#8060)
    if ( !jQuery.support.appendChecked ) {
      for ( i = 0; (elem = ret[i]) != null; i++ ) {
        if ( jQuery.nodeName( elem, "input" ) ) {
          fixDefaultChecked( elem );
        } else if ( typeof elem.getElementsByTagName !== "undefined" ) {
          jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
        }
      }
    }

    // Append elements to a provided document fragment
    if ( fragment ) {
      // Special handling of each script element
      handleScript = function( elem ) {
        // Check if we consider it executable
        if ( !elem.type || rscriptType.test( elem.type ) ) {
          // Detach the script and store it in the scripts array (if provided) or the fragment
          // Return truthy to indicate that it has been handled
          return scripts ?
            scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
            fragment.appendChild( elem );
        }
      };

      for ( i = 0; (elem = ret[i]) != null; i++ ) {
        // Check if we're done after handling an executable script
        if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
          // Append to fragment and handle embedded scripts
          fragment.appendChild( elem );
          if ( typeof elem.getElementsByTagName !== "undefined" ) {
            // handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
            jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

            // Splice the scripts into ret after their former ancestor and advance our index beyond them
            ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
            i += jsTags.length;
          }
        }
      }
    }

    return ret;
  },

  cleanData: function( elems, /* internal */ acceptData ) {
    var data, id, elem, type,
      i = 0,
      internalKey = jQuery.expando,
      cache = jQuery.cache,
      deleteExpando = jQuery.support.deleteExpando,
      special = jQuery.event.special;

    for ( ; (elem = elems[i]) != null; i++ ) {

      if ( acceptData || jQuery.acceptData( elem ) ) {

        id = elem[ internalKey ];
        data = id && cache[ id ];

        if ( data ) {
          if ( data.events ) {
            for ( type in data.events ) {
              if ( special[ type ] ) {
                jQuery.event.remove( elem, type );

              // This is a shortcut to avoid jQuery.event.remove's overhead
              } else {
                jQuery.removeEvent( elem, type, data.handle );
              }
            }
          }

          // Remove cache only if it was not already removed by jQuery.event.remove
          if ( cache[ id ] ) {

            delete cache[ id ];

            // IE does not allow us to delete expando properties from nodes,
            // nor does it have a removeAttribute function on Document nodes;
            // we must handle all of these cases
            if ( deleteExpando ) {
              delete elem[ internalKey ];

            } else if ( elem.removeAttribute ) {
              elem.removeAttribute( internalKey );

            } else {
              elem[ internalKey ] = null;
            }

            jQuery.deletedIds.push( id );
          }
        }
      }
    }
  }
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
  ua = ua.toLowerCase();

  var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
    /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
    /(msie) ([\w.]+)/.exec( ua ) ||
    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
    [];

  return {
    browser: match[ 1 ] || "",
    version: match[ 2 ] || "0"
  };
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
  browser[ matched.browser ] = true;
  browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
  browser.webkit = true;
} else if ( browser.webkit ) {
  browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
  function jQuerySub( selector, context ) {
    return new jQuerySub.fn.init( selector, context );
  }
  jQuery.extend( true, jQuerySub, this );
  jQuerySub.superclass = this;
  jQuerySub.fn = jQuerySub.prototype = this();
  jQuerySub.fn.constructor = jQuerySub;
  jQuerySub.sub = this.sub;
  jQuerySub.fn.init = function init( selector, context ) {
    if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
      context = jQuerySub( context );
    }

    return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
  };
  jQuerySub.fn.init.prototype = jQuerySub.fn;
  var rootjQuerySub = jQuerySub(document);
  return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
  ralpha = /alpha\([^)]*\)/i,
  ropacity = /opacity=([^)]*)/,
  rposition = /^(top|right|bottom|left)$/,
  // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
  // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
  rdisplayswap = /^(none|table(?!-c[ea]).+)/,
  rmargin = /^margin/,
  rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
  rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
  rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
  elemdisplay = {},

  cssShow = { position: "absolute", visibility: "hidden", display: "block" },
  cssNormalTransform = {
    letterSpacing: 0,
    fontWeight: 400
  },

  cssExpand = [ "Top", "Right", "Bottom", "Left" ],
  cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

  eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

  // shortcut for names that are not vendor prefixed
  if ( name in style ) {
    return name;
  }

  // check for vendor prefixed names
  var capName = name.charAt(0).toUpperCase() + name.slice(1),
    origName = name,
    i = cssPrefixes.length;

  while ( i-- ) {
    name = cssPrefixes[ i ] + capName;
    if ( name in style ) {
      return name;
    }
  }

  return origName;
}

function isHidden( elem, el ) {
  elem = el || elem;
  return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
  var elem, display,
    values = [],
    index = 0,
    length = elements.length;

  for ( ; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }
    values[ index ] = jQuery._data( elem, "olddisplay" );
    if ( show ) {
      // Reset the inline display of this element to learn if it is
      // being hidden by cascaded rules or not
      if ( !values[ index ] && elem.style.display === "none" ) {
        elem.style.display = "";
      }

      // Set elements which have been overridden with display: none
      // in a stylesheet to whatever the default browser style is
      // for such an element
      if ( elem.style.display === "" && isHidden( elem ) ) {
        values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
      }
    } else {
      display = curCSS( elem, "display" );

      if ( !values[ index ] && display !== "none" ) {
        jQuery._data( elem, "olddisplay", display );
      }
    }
  }

  // Set the display of most of the elements in a second loop
  // to avoid the constant reflow
  for ( index = 0; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }
    if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
      elem.style.display = show ? values[ index ] || "" : "none";
    }
  }

  return elements;
}

jQuery.fn.extend({
  css: function( name, value ) {
    return jQuery.access( this, function( elem, name, value ) {
      return value !== undefined ?
        jQuery.style( elem, name, value ) :
        jQuery.css( elem, name );
    }, name, value, arguments.length > 1 );
  },
  show: function() {
    return showHide( this, true );
  },
  hide: function() {
    return showHide( this );
  },
  toggle: function( state, fn2 ) {
    var bool = typeof state === "boolean";

    if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
      return eventsToggle.apply( this, arguments );
    }

    return this.each(function() {
      if ( bool ? state : isHidden( this ) ) {
        jQuery( this ).show();
      } else {
        jQuery( this ).hide();
      }
    });
  }
});

jQuery.extend({
  // Add in style property hooks for overriding the default
  // behavior of getting and setting a style property
  cssHooks: {
    opacity: {
      get: function( elem, computed ) {
        if ( computed ) {
          // We should always get a number back from opacity
          var ret = curCSS( elem, "opacity" );
          return ret === "" ? "1" : ret;

        }
      }
    }
  },

  // Exclude the following css properties to add px
  cssNumber: {
    "fillOpacity": true,
    "fontWeight": true,
    "lineHeight": true,
    "opacity": true,
    "orphans": true,
    "widows": true,
    "zIndex": true,
    "zoom": true
  },

  // Add in properties whose names you wish to fix before
  // setting or getting the value
  cssProps: {
    // normalize float css property
    "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
  },

  // Get and set the style property on a DOM Node
  style: function( elem, name, value, extra ) {
    // Don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
      return;
    }

    // Make sure that we're working with the right name
    var ret, type, hooks,
      origName = jQuery.camelCase( name ),
      style = elem.style;

    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // Check if we're setting a value
    if ( value !== undefined ) {
      type = typeof value;

      // convert relative number strings (+= or -=) to relative numbers. #7345
      if ( type === "string" && (ret = rrelNum.exec( value )) ) {
        value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
        // Fixes bug #9237
        type = "number";
      }

      // Make sure that NaN and null values aren't set. See: #7116
      if ( value == null || type === "number" && isNaN( value ) ) {
        return;
      }

      // If a number was passed in, add 'px' to the (except for certain CSS properties)
      if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
        value += "px";
      }

      // If a hook was provided, use that value, otherwise just set the specified value
      if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
        // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
        // Fixes bug #5509
        try {
          style[ name ] = value;
        } catch(e) {}
      }

    } else {
      // If a hook was provided get the non-computed value from there
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
        return ret;
      }

      // Otherwise just get the value from the style object
      return style[ name ];
    }
  },

  css: function( elem, name, numeric, extra ) {
    var val, num, hooks,
      origName = jQuery.camelCase( name );

    // Make sure that we're working with the right name
    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // If a hook was provided get the computed value from there
    if ( hooks && "get" in hooks ) {
      val = hooks.get( elem, true, extra );
    }

    // Otherwise, if a way to get the computed value exists, use that
    if ( val === undefined ) {
      val = curCSS( elem, name );
    }

    //convert "normal" to computed value
    if ( val === "normal" && name in cssNormalTransform ) {
      val = cssNormalTransform[ name ];
    }

    // Return, converting to number if forced or a qualifier was provided and val looks numeric
    if ( numeric || extra !== undefined ) {
      num = parseFloat( val );
      return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
    }
    return val;
  },

  // A method for quickly swapping in/out CSS properties to get correct calculations
  swap: function( elem, options, callback ) {
    var ret, name,
      old = {};

    // Remember the old values, and insert the new ones
    for ( name in options ) {
      old[ name ] = elem.style[ name ];
      elem.style[ name ] = options[ name ];
    }

    ret = callback.call( elem );

    // Revert the old values
    for ( name in options ) {
      elem.style[ name ] = old[ name ];
    }

    return ret;
  }
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
  curCSS = function( elem, name ) {
    var ret, width, minWidth, maxWidth,
      computed = window.getComputedStyle( elem, null ),
      style = elem.style;

    if ( computed ) {

      ret = computed[ name ];
      if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
        ret = jQuery.style( elem, name );
      }

      // A tribute to the "awesome hack by Dean Edwards"
      // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
      // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
      // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
      if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
        width = style.width;
        minWidth = style.minWidth;
        maxWidth = style.maxWidth;

        style.minWidth = style.maxWidth = style.width = ret;
        ret = computed.width;

        style.width = width;
        style.minWidth = minWidth;
        style.maxWidth = maxWidth;
      }
    }

    return ret;
  };
} else if ( document.documentElement.currentStyle ) {
  curCSS = function( elem, name ) {
    var left, rsLeft,
      ret = elem.currentStyle && elem.currentStyle[ name ],
      style = elem.style;

    // Avoid setting ret to empty string here
    // so we don't default to auto
    if ( ret == null && style && style[ name ] ) {
      ret = style[ name ];
    }

    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels
    // but not position css attributes, as those are proportional to the parent element instead
    // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
    if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

      // Remember the original values
      left = style.left;
      rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

      // Put in the new values to get a computed value out
      if ( rsLeft ) {
        elem.runtimeStyle.left = elem.currentStyle.left;
      }
      style.left = name === "fontSize" ? "1em" : ret;
      ret = style.pixelLeft + "px";

      // Revert the changed values
      style.left = left;
      if ( rsLeft ) {
        elem.runtimeStyle.left = rsLeft;
      }
    }

    return ret === "" ? "auto" : ret;
  };
}

function setPositiveNumber( elem, value, subtract ) {
  var matches = rnumsplit.exec( value );
  return matches ?
      Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
      value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
  var i = extra === ( isBorderBox ? "border" : "content" ) ?
    // If we already have the right measurement, avoid augmentation
    4 :
    // Otherwise initialize for horizontal or vertical properties
    name === "width" ? 1 : 0,

    val = 0;

  for ( ; i < 4; i += 2 ) {
    // both box models exclude margin, so add it if we want it
    if ( extra === "margin" ) {
      // we use jQuery.css instead of curCSS here
      // because of the reliableMarginRight CSS hook!
      val += jQuery.css( elem, extra + cssExpand[ i ], true );
    }

    // From this point on we use curCSS for maximum performance (relevant in animations)
    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === "content" ) {
        val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== "margin" ) {
        val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== "padding" ) {
        val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
      }
    }
  }

  return val;
}

function getWidthOrHeight( elem, name, extra ) {

  // Start with offset property, which is equivalent to the border-box value
  var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
    valueIsBorderBox = true,
    isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if ( val <= 0 || val == null ) {
    // Fall back to computed then uncomputed css if necessary
    val = curCSS( elem, name );
    if ( val < 0 || val == null ) {
      val = elem.style[ name ];
    }

    // Computed unit is not pixels. Stop here and return.
    if ( rnumnonpx.test(val) ) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable elem.style
    valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

    // Normalize "", auto, and prepare for extra
    val = parseFloat( val ) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  return ( val +
    augmentWidthOrHeight(
      elem,
      name,
      extra || ( isBorderBox ? "border" : "content" ),
      valueIsBorderBox
    )
  ) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
  if ( elemdisplay[ nodeName ] ) {
    return elemdisplay[ nodeName ];
  }

  var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
    display = elem.css("display");
  elem.remove();

  // If the simple way fails,
  // get element's real default display by attaching it to a temp iframe
  if ( display === "none" || display === "" ) {
    // Use the already-created iframe if possible
    iframe = document.body.appendChild(
      iframe || jQuery.extend( document.createElement("iframe"), {
        frameBorder: 0,
        width: 0,
        height: 0
      })
    );

    // Create a cacheable copy of the iframe document on first call.
    // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
    // document to it; WebKit & Firefox won't allow reusing the iframe document.
    if ( !iframeDoc || !iframe.createElement ) {
      iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
      iframeDoc.write("<!doctype html><html><body>");
      iframeDoc.close();
    }

    elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

    display = curCSS( elem, "display" );
    document.body.removeChild( iframe );
  }

  // Store the correct default display
  elemdisplay[ nodeName ] = display;

  return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
  jQuery.cssHooks[ name ] = {
    get: function( elem, computed, extra ) {
      if ( computed ) {
        // certain elements can have dimension info if we invisibly show them
        // however, it must have a current display style that would benefit from this
        if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
          return jQuery.swap( elem, cssShow, function() {
            return getWidthOrHeight( elem, name, extra );
          });
        } else {
          return getWidthOrHeight( elem, name, extra );
        }
      }
    },

    set: function( elem, value, extra ) {
      return setPositiveNumber( elem, value, extra ?
        augmentWidthOrHeight(
          elem,
          name,
          extra,
          jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
        ) : 0
      );
    }
  };
});

if ( !jQuery.support.opacity ) {
  jQuery.cssHooks.opacity = {
    get: function( elem, computed ) {
      // IE uses filters for opacity
      return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
        ( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
        computed ? "1" : "";
    },

    set: function( elem, value ) {
      var style = elem.style,
        currentStyle = elem.currentStyle,
        opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
        filter = currentStyle && currentStyle.filter || style.filter || "";

      // IE has trouble with opacity if it does not have layout
      // Force it by setting the zoom level
      style.zoom = 1;

      // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
      if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
        style.removeAttribute ) {

        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
        // if "filter:" is present at all, clearType is disabled, we want to avoid this
        // style.removeAttribute is IE Only, but so apparently is this code path...
        style.removeAttribute( "filter" );

        // if there there is no filter style applied in a css rule, we are done
        if ( currentStyle && !currentStyle.filter ) {
          return;
        }
      }

      // otherwise, set new filter values
      style.filter = ralpha.test( filter ) ?
        filter.replace( ralpha, opacity ) :
        filter + " " + opacity;
    }
  };
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
  if ( !jQuery.support.reliableMarginRight ) {
    jQuery.cssHooks.marginRight = {
      get: function( elem, computed ) {
        // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
        // Work around by temporarily setting element display to inline-block
        return jQuery.swap( elem, { "display": "inline-block" }, function() {
          if ( computed ) {
            return curCSS( elem, "marginRight" );
          }
        });
      }
    };
  }

  // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
  // getComputedStyle returns percent when specified for top/left/bottom/right
  // rather than make the css module depend on the offset module, we just check for it here
  if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
    jQuery.each( [ "top", "left" ], function( i, prop ) {
      jQuery.cssHooks[ prop ] = {
        get: function( elem, computed ) {
          if ( computed ) {
            var ret = curCSS( elem, prop );
            // if curCSS returns percentage, fallback to offset
            return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
          }
        }
      };
    });
  }

});

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.hidden = function( elem ) {
    return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
  };

  jQuery.expr.filters.visible = function( elem ) {
    return !jQuery.expr.filters.hidden( elem );
  };
}

// These hooks are used by animate to expand properties
jQuery.each({
  margin: "",
  padding: "",
  border: "Width"
}, function( prefix, suffix ) {
  jQuery.cssHooks[ prefix + suffix ] = {
    expand: function( value ) {
      var i,

        // assumes a single number if not a string
        parts = typeof value === "string" ? value.split(" ") : [ value ],
        expanded = {};

      for ( i = 0; i < 4; i++ ) {
        expanded[ prefix + cssExpand[ i ] + suffix ] =
          parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
      }

      return expanded;
    }
  };

  if ( !rmargin.test( prefix ) ) {
    jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
  }
});
var r20 = /%20/g,
  rbracket = /\[\]$/,
  rCRLF = /\r?\n/g,
  rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
  rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
  serialize: function() {
    return jQuery.param( this.serializeArray() );
  },
  serializeArray: function() {
    return this.map(function(){
      return this.elements ? jQuery.makeArray( this.elements ) : this;
    })
    .filter(function(){
      return this.name && !this.disabled &&
        ( this.checked || rselectTextarea.test( this.nodeName ) ||
          rinput.test( this.type ) );
    })
    .map(function( i, elem ){
      var val = jQuery( this ).val();

      return val == null ?
        null :
        jQuery.isArray( val ) ?
          jQuery.map( val, function( val, i ){
            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
          }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    }).get();
  }
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
  var prefix,
    s = [],
    add = function( key, value ) {
      // If value is a function, invoke it and return its value
      value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
      s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
    };

  // Set traditional to true for jQuery <= 1.3.2 behavior.
  if ( traditional === undefined ) {
    traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
  }

  // If an array was passed in, assume that it is an array of form elements.
  if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
    // Serialize the form elements
    jQuery.each( a, function() {
      add( this.name, this.value );
    });

  } else {
    // If traditional, encode the "old" way (the way 1.3.2 or older
    // did it), otherwise encode params recursively.
    for ( prefix in a ) {
      buildParams( prefix, a[ prefix ], traditional, add );
    }
  }

  // Return the resulting serialization
  return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
  var name;

  if ( jQuery.isArray( obj ) ) {
    // Serialize array item.
    jQuery.each( obj, function( i, v ) {
      if ( traditional || rbracket.test( prefix ) ) {
        // Treat each array item as a scalar.
        add( prefix, v );

      } else {
        // If array item is non-scalar (array or object), encode its
        // numeric index to resolve deserialization ambiguity issues.
        // Note that rack (as of 1.0.0) can't currently deserialize
        // nested arrays properly, and attempting to do so may cause
        // a server error. Possible fixes are to modify rack's
        // deserialization algorithm or to provide an option or flag
        // to force array serialization to be shallow.
        buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
      }
    });

  } else if ( !traditional && jQuery.type( obj ) === "object" ) {
    // Serialize object item.
    for ( name in obj ) {
      buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    }

  } else {
    // Serialize scalar item.
    add( prefix, obj );
  }
}
var
  // Document location
  ajaxLocParts,
  ajaxLocation,

  rhash = /#.*$/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
  // #7653, #8125, #8152: local protocol detection
  rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  rquery = /\?/,
  rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  rts = /([?&])_=[^&]*/,
  rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

  // Keep a copy of the old load method
  _load = jQuery.fn.load,

  /* Prefilters
   * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
   * 2) These are called:
   *    - BEFORE asking for a transport
   *    - AFTER param serialization (s.data is a string if s.processData is true)
   * 3) key is the dataType
   * 4) the catchall symbol "*" can be used
   * 5) execution will start with transport dataType and THEN continue down to "*" if needed
   */
  prefilters = {},

  /* Transports bindings
   * 1) key is the dataType
   * 2) the catchall symbol "*" can be used
   * 3) selection will start with transport dataType and THEN go to "*" if needed
   */
  transports = {},

  // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
  allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
  ajaxLocation = location.href;
} catch( e ) {
  // Use the href attribute of an A element
  // since IE will modify it given document.location
  ajaxLocation = document.createElement( "a" );
  ajaxLocation.href = "";
  ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

  // dataTypeExpression is optional and defaults to "*"
  return function( dataTypeExpression, func ) {

    if ( typeof dataTypeExpression !== "string" ) {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    var dataType, list, placeBefore,
      dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
      i = 0,
      length = dataTypes.length;

    if ( jQuery.isFunction( func ) ) {
      // For each dataType in the dataTypeExpression
      for ( ; i < length; i++ ) {
        dataType = dataTypes[ i ];
        // We control if we're asked to add before
        // any existing element
        placeBefore = /^\+/.test( dataType );
        if ( placeBefore ) {
          dataType = dataType.substr( 1 ) || "*";
        }
        list = structure[ dataType ] = structure[ dataType ] || [];
        // then we add to the structure accordingly
        list[ placeBefore ? "unshift" : "push" ]( func );
      }
    }
  };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
    dataType /* internal */, inspected /* internal */ ) {

  dataType = dataType || options.dataTypes[ 0 ];
  inspected = inspected || {};

  inspected[ dataType ] = true;

  var selection,
    list = structure[ dataType ],
    i = 0,
    length = list ? list.length : 0,
    executeOnly = ( structure === prefilters );

  for ( ; i < length && ( executeOnly || !selection ); i++ ) {
    selection = list[ i ]( options, originalOptions, jqXHR );
    // If we got redirected to another dataType
    // we try there if executing only and not done already
    if ( typeof selection === "string" ) {
      if ( !executeOnly || inspected[ selection ] ) {
        selection = undefined;
      } else {
        options.dataTypes.unshift( selection );
        selection = inspectPrefiltersOrTransports(
            structure, options, originalOptions, jqXHR, selection, inspected );
      }
    }
  }
  // If we're only executing or nothing was selected
  // we try the catchall dataType if not done already
  if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
    selection = inspectPrefiltersOrTransports(
        structure, options, originalOptions, jqXHR, "*", inspected );
  }
  // unnecessary when only executing (prefilters)
  // but it'll be ignored by the caller in that case
  return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
  var key, deep,
    flatOptions = jQuery.ajaxSettings.flatOptions || {};
  for ( key in src ) {
    if ( src[ key ] !== undefined ) {
      ( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
    }
  }
  if ( deep ) {
    jQuery.extend( true, target, deep );
  }
}

jQuery.fn.load = function( url, params, callback ) {
  if ( typeof url !== "string" && _load ) {
    return _load.apply( this, arguments );
  }

  // Don't do a request if no elements are being requested
  if ( !this.length ) {
    return this;
  }

  var selector, type, response,
    self = this,
    off = url.indexOf(" ");

  if ( off >= 0 ) {
    selector = url.slice( off, url.length );
    url = url.slice( 0, off );
  }

  // If it's a function
  if ( jQuery.isFunction( params ) ) {

    // We assume that it's the callback
    callback = params;
    params = undefined;

  // Otherwise, build a param string
  } else if ( params && typeof params === "object" ) {
    type = "POST";
  }

  // Request the remote document
  jQuery.ajax({
    url: url,

    // if "type" variable is undefined, then "GET" method will be used
    type: type,
    dataType: "html",
    data: params,
    complete: function( jqXHR, status ) {
      if ( callback ) {
        self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
      }
    }
  }).done(function( responseText ) {

    // Save response for use in complete callback
    response = arguments;

    // See if a selector was specified
    self.html( selector ?

      // Create a dummy div to hold the results
      jQuery("<div>")

        // inject the contents of the document in, removing the scripts
        // to avoid any 'Permission Denied' errors in IE
        .append( responseText.replace( rscript, "" ) )

        // Locate the specified elements
        .find( selector ) :

      // If not, just inject the full result
      responseText );

  });

  return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
  jQuery.fn[ o ] = function( f ){
    return this.on( o, f );
  };
});

jQuery.each( [ "get", "post" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      type: method,
      url: url,
      data: data,
      success: callback,
      dataType: type
    });
  };
});

jQuery.extend({

  getScript: function( url, callback ) {
    return jQuery.get( url, undefined, callback, "script" );
  },

  getJSON: function( url, data, callback ) {
    return jQuery.get( url, data, callback, "json" );
  },

  // Creates a full fledged settings object into target
  // with both ajaxSettings and settings fields.
  // If target is omitted, writes into ajaxSettings.
  ajaxSetup: function( target, settings ) {
    if ( settings ) {
      // Building a settings object
      ajaxExtend( target, jQuery.ajaxSettings );
    } else {
      // Extending ajaxSettings
      settings = target;
      target = jQuery.ajaxSettings;
    }
    ajaxExtend( target, settings );
    return target;
  },

  ajaxSettings: {
    url: ajaxLocation,
    isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
    global: true,
    type: "GET",
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    async: true,
    /*
    timeout: 0,
    data: null,
    dataType: null,
    username: null,
    password: null,
    cache: null,
    throws: false,
    traditional: false,
    headers: {},
    */

    accepts: {
      xml: "application/xml, text/xml",
      html: "text/html",
      text: "text/plain",
      json: "application/json, text/javascript",
      "*": allTypes
    },

    contents: {
      xml: /xml/,
      html: /html/,
      json: /json/
    },

    responseFields: {
      xml: "responseXML",
      text: "responseText"
    },

    // List of data converters
    // 1) key format is "source_type destination_type" (a single space in-between)
    // 2) the catchall symbol "*" can be used for source_type
    converters: {

      // Convert anything to text
      "* text": window.String,

      // Text to html (true = no transformation)
      "text html": true,

      // Evaluate text as a json expression
      "text json": jQuery.parseJSON,

      // Parse text as xml
      "text xml": jQuery.parseXML
    },

    // For options that shouldn't be deep extended:
    // you can add your own custom options here if
    // and when you create one that shouldn't be
    // deep extended (see ajaxExtend)
    flatOptions: {
      context: true,
      url: true
    }
  },

  ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
  ajaxTransport: addToPrefiltersOrTransports( transports ),

  // Main method
  ajax: function( url, options ) {

    // If url is an object, simulate pre-1.5 signature
    if ( typeof url === "object" ) {
      options = url;
      url = undefined;
    }

    // Force options to be an object
    options = options || {};

    var // ifModified key
      ifModifiedKey,
      // Response headers
      responseHeadersString,
      responseHeaders,
      // transport
      transport,
      // timeout handle
      timeoutTimer,
      // Cross-domain detection vars
      parts,
      // To know if global events are to be dispatched
      fireGlobals,
      // Loop variable
      i,
      // Create the final options object
      s = jQuery.ajaxSetup( {}, options ),
      // Callbacks context
      callbackContext = s.context || s,
      // Context for global events
      // It's the callbackContext if one was provided in the options
      // and if it's a DOM node or a jQuery collection
      globalEventContext = callbackContext !== s &&
        ( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
            jQuery( callbackContext ) : jQuery.event,
      // Deferreds
      deferred = jQuery.Deferred(),
      completeDeferred = jQuery.Callbacks( "once memory" ),
      // Status-dependent callbacks
      statusCode = s.statusCode || {},
      // Headers (they are sent all at once)
      requestHeaders = {},
      requestHeadersNames = {},
      // The jqXHR state
      state = 0,
      // Default abort message
      strAbort = "canceled",
      // Fake xhr
      jqXHR = {

        readyState: 0,

        // Caches the header
        setRequestHeader: function( name, value ) {
          if ( !state ) {
            var lname = name.toLowerCase();
            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
            requestHeaders[ name ] = value;
          }
          return this;
        },

        // Raw string
        getAllResponseHeaders: function() {
          return state === 2 ? responseHeadersString : null;
        },

        // Builds headers hashtable if needed
        getResponseHeader: function( key ) {
          var match;
          if ( state === 2 ) {
            if ( !responseHeaders ) {
              responseHeaders = {};
              while( ( match = rheaders.exec( responseHeadersString ) ) ) {
                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
              }
            }
            match = responseHeaders[ key.toLowerCase() ];
          }
          return match === undefined ? null : match;
        },

        // Overrides response content-type header
        overrideMimeType: function( type ) {
          if ( !state ) {
            s.mimeType = type;
          }
          return this;
        },

        // Cancel the request
        abort: function( statusText ) {
          statusText = statusText || strAbort;
          if ( transport ) {
            transport.abort( statusText );
          }
          done( 0, statusText );
          return this;
        }
      };

    // Callback for when everything is done
    // It is defined here because jslint complains if it is declared
    // at the end of the function (which would be more logical and readable)
    function done( status, nativeStatusText, responses, headers ) {
      var isSuccess, success, error, response, modified,
        statusText = nativeStatusText;

      // Called once
      if ( state === 2 ) {
        return;
      }

      // State is "done" now
      state = 2;

      // Clear timeout if it exists
      if ( timeoutTimer ) {
        clearTimeout( timeoutTimer );
      }

      // Dereference transport for early garbage collection
      // (no matter how long the jqXHR object will be used)
      transport = undefined;

      // Cache response headers
      responseHeadersString = headers || "";

      // Set readyState
      jqXHR.readyState = status > 0 ? 4 : 0;

      // Get response data
      if ( responses ) {
        response = ajaxHandleResponses( s, jqXHR, responses );
      }

      // If successful, handle type chaining
      if ( status >= 200 && status < 300 || status === 304 ) {

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {

          modified = jqXHR.getResponseHeader("Last-Modified");
          if ( modified ) {
            jQuery.lastModified[ ifModifiedKey ] = modified;
          }
          modified = jqXHR.getResponseHeader("Etag");
          if ( modified ) {
            jQuery.etag[ ifModifiedKey ] = modified;
          }
        }

        // If not modified
        if ( status === 304 ) {

          statusText = "notmodified";
          isSuccess = true;

        // If we have data
        } else {

          isSuccess = ajaxConvert( s, response );
          statusText = isSuccess.state;
          success = isSuccess.data;
          error = isSuccess.error;
          isSuccess = !error;
        }
      } else {
        // We extract error from statusText
        // then normalize statusText and status for non-aborts
        error = statusText;
        if ( !statusText || status ) {
          statusText = "error";
          if ( status < 0 ) {
            status = 0;
          }
        }
      }

      // Set data for the fake xhr object
      jqXHR.status = status;
      jqXHR.statusText = ( nativeStatusText || statusText ) + "";

      // Success/Error
      if ( isSuccess ) {
        deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
      } else {
        deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
      }

      // Status-dependent callbacks
      jqXHR.statusCode( statusCode );
      statusCode = undefined;

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
            [ jqXHR, s, isSuccess ? success : error ] );
      }

      // Complete
      completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
        // Handle the global AJAX counter
        if ( !( --jQuery.active ) ) {
          jQuery.event.trigger( "ajaxStop" );
        }
      }
    }

    // Attach deferreds
    deferred.promise( jqXHR );
    jqXHR.success = jqXHR.done;
    jqXHR.error = jqXHR.fail;
    jqXHR.complete = completeDeferred.add;

    // Status-dependent callbacks
    jqXHR.statusCode = function( map ) {
      if ( map ) {
        var tmp;
        if ( state < 2 ) {
          for ( tmp in map ) {
            statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
          }
        } else {
          tmp = map[ jqXHR.status ];
          jqXHR.always( tmp );
        }
      }
      return this;
    };

    // Remove hash character (#7531: and string promotion)
    // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
    // We also use the url parameter if available
    s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

    // Extract dataTypes list
    s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

    // A cross-domain request is in order when we have a protocol:host:port mismatch
    if ( s.crossDomain == null ) {
      parts = rurl.exec( s.url.toLowerCase() ) || false;
      s.crossDomain = parts && ( parts.join(":") + ( parts[ 3 ] ? "" : parts[ 1 ] === "http:" ? 80 : 443 ) ) !==
        ( ajaxLocParts.join(":") + ( ajaxLocParts[ 3 ] ? "" : ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) );
    }

    // Convert data if not already a string
    if ( s.data && s.processData && typeof s.data !== "string" ) {
      s.data = jQuery.param( s.data, s.traditional );
    }

    // Apply prefilters
    inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    // If request was aborted inside a prefilter, stop there
    if ( state === 2 ) {
      return jqXHR;
    }

    // We can fire global events as of now if asked to
    fireGlobals = s.global;

    // Uppercase the type
    s.type = s.type.toUpperCase();

    // Determine if request has content
    s.hasContent = !rnoContent.test( s.type );

    // Watch for a new set of requests
    if ( fireGlobals && jQuery.active++ === 0 ) {
      jQuery.event.trigger( "ajaxStart" );
    }

    // More options handling for requests with no content
    if ( !s.hasContent ) {

      // If data is available, append data to url
      if ( s.data ) {
        s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
        // #9682: remove data so that it's not used in an eventual retry
        delete s.data;
      }

      // Get ifModifiedKey before adding the anti-cache parameter
      ifModifiedKey = s.url;

      // Add anti-cache in url if needed
      if ( s.cache === false ) {

        var ts = jQuery.now(),
          // try replacing _= if it is there
          ret = s.url.replace( rts, "$1_=" + ts );

        // if nothing was replaced, add timestamp to the end
        s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
      }
    }

    // Set the correct header, if data is being sent
    if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
      jqXHR.setRequestHeader( "Content-Type", s.contentType );
    }

    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    if ( s.ifModified ) {
      ifModifiedKey = ifModifiedKey || s.url;
      if ( jQuery.lastModified[ ifModifiedKey ] ) {
        jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
      }
      if ( jQuery.etag[ ifModifiedKey ] ) {
        jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
      }
    }

    // Set the Accepts header for the server, depending on the dataType
    jqXHR.setRequestHeader(
      "Accept",
      s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
        s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
        s.accepts[ "*" ]
    );

    // Check for headers option
    for ( i in s.headers ) {
      jqXHR.setRequestHeader( i, s.headers[ i ] );
    }

    // Allow custom headers/mimetypes and early abort
    if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
        // Abort if not done already and return
        return jqXHR.abort();

    }

    // aborting is no longer a cancellation
    strAbort = "abort";

    // Install callbacks on deferreds
    for ( i in { success: 1, error: 1, complete: 1 } ) {
      jqXHR[ i ]( s[ i ] );
    }

    // Get transport
    transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    // If no transport, we auto-abort
    if ( !transport ) {
      done( -1, "No Transport" );
    } else {
      jqXHR.readyState = 1;
      // Send global event
      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
      }
      // Timeout
      if ( s.async && s.timeout > 0 ) {
        timeoutTimer = setTimeout( function(){
          jqXHR.abort( "timeout" );
        }, s.timeout );
      }

      try {
        state = 1;
        transport.send( requestHeaders, done );
      } catch (e) {
        // Propagate exception as error if not done
        if ( state < 2 ) {
          done( -1, e );
        // Simply rethrow otherwise
        } else {
          throw e;
        }
      }
    }

    return jqXHR;
  },

  // Counter for holding the number of active queries
  active: 0,

  // Last-Modified header cache for next request
  lastModified: {},
  etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

  var ct, type, finalDataType, firstDataType,
    contents = s.contents,
    dataTypes = s.dataTypes,
    responseFields = s.responseFields;

  // Fill responseXXX fields
  for ( type in responseFields ) {
    if ( type in responses ) {
      jqXHR[ responseFields[type] ] = responses[ type ];
    }
  }

  // Remove auto dataType and get content-type in the process
  while( dataTypes[ 0 ] === "*" ) {
    dataTypes.shift();
    if ( ct === undefined ) {
      ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
    }
  }

  // Check if we're dealing with a known content-type
  if ( ct ) {
    for ( type in contents ) {
      if ( contents[ type ] && contents[ type ].test( ct ) ) {
        dataTypes.unshift( type );
        break;
      }
    }
  }

  // Check to see if we have a response for the expected dataType
  if ( dataTypes[ 0 ] in responses ) {
    finalDataType = dataTypes[ 0 ];
  } else {
    // Try convertible dataTypes
    for ( type in responses ) {
      if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
        finalDataType = type;
        break;
      }
      if ( !firstDataType ) {
        firstDataType = type;
      }
    }
    // Or just use first one
    finalDataType = finalDataType || firstDataType;
  }

  // If we found a dataType
  // We add the dataType to the list if needed
  // and return the corresponding response
  if ( finalDataType ) {
    if ( finalDataType !== dataTypes[ 0 ] ) {
      dataTypes.unshift( finalDataType );
    }
    return responses[ finalDataType ];
  }
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

  var conv, conv2, current, tmp,
    // Work with a copy of dataTypes in case we need to modify it for conversion
    dataTypes = s.dataTypes.slice(),
    prev = dataTypes[ 0 ],
    converters = {},
    i = 0;

  // Apply the dataFilter if provided
  if ( s.dataFilter ) {
    response = s.dataFilter( response, s.dataType );
  }

  // Create converters map with lowercased keys
  if ( dataTypes[ 1 ] ) {
    for ( conv in s.converters ) {
      converters[ conv.toLowerCase() ] = s.converters[ conv ];
    }
  }

  // Convert to each sequential dataType, tolerating list modification
  for ( ; (current = dataTypes[++i]); ) {

    // There's only work to do if current dataType is non-auto
    if ( current !== "*" ) {

      // Convert response if prev dataType is non-auto and differs from current
      if ( prev !== "*" && prev !== current ) {

        // Seek a direct converter
        conv = converters[ prev + " " + current ] || converters[ "* " + current ];

        // If none found, seek a pair
        if ( !conv ) {
          for ( conv2 in converters ) {

            // If conv2 outputs current
            tmp = conv2.split(" ");
            if ( tmp[ 1 ] === current ) {

              // If prev can be converted to accepted input
              conv = converters[ prev + " " + tmp[ 0 ] ] ||
                converters[ "* " + tmp[ 0 ] ];
              if ( conv ) {
                // Condense equivalence converters
                if ( conv === true ) {
                  conv = converters[ conv2 ];

                // Otherwise, insert the intermediate dataType
                } else if ( converters[ conv2 ] !== true ) {
                  current = tmp[ 0 ];
                  dataTypes.splice( i--, 0, current );
                }

                break;
              }
            }
          }
        }

        // Apply converter (if not an equivalence)
        if ( conv !== true ) {

          // Unless errors are allowed to bubble, catch and return them
          if ( conv && s["throws"] ) {
            response = conv( response );
          } else {
            try {
              response = conv( response );
            } catch ( e ) {
              return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
            }
          }
        }
      }

      // Update prev for next iteration
      prev = current;
    }
  }

  return { state: "success", data: response };
}
var oldCallbacks = [],
  rquestion = /\?/,
  rjsonp = /(=)\?(?=&|$)|\?\?/,
  nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
  jsonp: "callback",
  jsonpCallback: function() {
    var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
    this[ callback ] = true;
    return callback;
  }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

  var callbackName, overwritten, responseContainer,
    data = s.data,
    url = s.url,
    hasCallback = s.jsonp !== false,
    replaceInUrl = hasCallback && rjsonp.test( url ),
    replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
      !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
      rjsonp.test( data );

  // Handle iff the expected data type is "jsonp" or we have a parameter to set
  if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

    // Get callback name, remembering preexisting value associated with it
    callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
      s.jsonpCallback() :
      s.jsonpCallback;
    overwritten = window[ callbackName ];

    // Insert callback into url or form data
    if ( replaceInUrl ) {
      s.url = url.replace( rjsonp, "$1" + callbackName );
    } else if ( replaceInData ) {
      s.data = data.replace( rjsonp, "$1" + callbackName );
    } else if ( hasCallback ) {
      s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
    }

    // Use data converter to retrieve json after script execution
    s.converters["script json"] = function() {
      if ( !responseContainer ) {
        jQuery.error( callbackName + " was not called" );
      }
      return responseContainer[ 0 ];
    };

    // force json dataType
    s.dataTypes[ 0 ] = "json";

    // Install callback
    window[ callbackName ] = function() {
      responseContainer = arguments;
    };

    // Clean-up function (fires after converters)
    jqXHR.always(function() {
      // Restore preexisting value
      window[ callbackName ] = overwritten;

      // Save back as free
      if ( s[ callbackName ] ) {
        // make sure that re-using the options doesn't screw things around
        s.jsonpCallback = originalSettings.jsonpCallback;

        // save the callback name for future use
        oldCallbacks.push( callbackName );
      }

      // Call if it was a function and we have a response
      if ( responseContainer && jQuery.isFunction( overwritten ) ) {
        overwritten( responseContainer[ 0 ] );
      }

      responseContainer = overwritten = undefined;
    });

    // Delegate to script
    return "script";
  }
});
// Install script dataType
jQuery.ajaxSetup({
  accepts: {
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  },
  contents: {
    script: /javascript|ecmascript/
  },
  converters: {
    "text script": function( text ) {
      jQuery.globalEval( text );
      return text;
    }
  }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
  if ( s.cache === undefined ) {
    s.cache = false;
  }
  if ( s.crossDomain ) {
    s.type = "GET";
    s.global = false;
  }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

  // This transport only deals with cross domain requests
  if ( s.crossDomain ) {

    var script,
      head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

    return {

      send: function( _, callback ) {

        script = document.createElement( "script" );

        script.async = "async";

        if ( s.scriptCharset ) {
          script.charset = s.scriptCharset;
        }

        script.src = s.url;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function( _, isAbort ) {

          if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;

            // Remove the script
            if ( head && script.parentNode ) {
              head.removeChild( script );
            }

            // Dereference the script
            script = undefined;

            // Callback if not abort
            if ( !isAbort ) {
              callback( 200, "success" );
            }
          }
        };
        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        // This arises when a base node is used (#2709 and #4378).
        head.insertBefore( script, head.firstChild );
      },

      abort: function() {
        if ( script ) {
          script.onload( 0, 1 );
        }
      }
    };
  }
});
var xhrCallbacks,
  // #5280: Internet Explorer will keep connections alive if we don't abort on unload
  xhrOnUnloadAbort = window.ActiveXObject ? function() {
    // Abort all pending requests
    for ( var key in xhrCallbacks ) {
      xhrCallbacks[ key ]( 0, 1 );
    }
  } : false,
  xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch( e ) {}
}

function createActiveXHR() {
  try {
    return new window.ActiveXObject( "Microsoft.XMLHTTP" );
  } catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
  /* Microsoft failed to properly
   * implement the XMLHttpRequest in IE7 (can't request local files),
   * so we use the ActiveXObject when it is available
   * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
   * we need a fallback.
   */
  function() {
    return !this.isLocal && createStandardXHR() || createActiveXHR();
  } :
  // For all other browsers, use the standard XMLHttpRequest object
  createStandardXHR;

// Determine support properties
(function( xhr ) {
  jQuery.extend( jQuery.support, {
    ajax: !!xhr,
    cors: !!xhr && ( "withCredentials" in xhr )
  });
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

  jQuery.ajaxTransport(function( s ) {
    // Cross domain only allowed if supported through XMLHttpRequest
    if ( !s.crossDomain || jQuery.support.cors ) {

      var callback;

      return {
        send: function( headers, complete ) {

          // Get a new xhr
          var handle, i,
            xhr = s.xhr();

          // Open the socket
          // Passing null username, generates a login popup on Opera (#2865)
          if ( s.username ) {
            xhr.open( s.type, s.url, s.async, s.username, s.password );
          } else {
            xhr.open( s.type, s.url, s.async );
          }

          // Apply custom fields if provided
          if ( s.xhrFields ) {
            for ( i in s.xhrFields ) {
              xhr[ i ] = s.xhrFields[ i ];
            }
          }

          // Override mime type if needed
          if ( s.mimeType && xhr.overrideMimeType ) {
            xhr.overrideMimeType( s.mimeType );
          }

          // X-Requested-With header
          // For cross-domain requests, seeing as conditions for a preflight are
          // akin to a jigsaw puzzle, we simply never set it to be sure.
          // (it can always be set on a per-request basis or even using ajaxSetup)
          // For same-domain requests, won't change header if already provided.
          if ( !s.crossDomain && !headers["X-Requested-With"] ) {
            headers[ "X-Requested-With" ] = "XMLHttpRequest";
          }

          // Need an extra try/catch for cross domain requests in Firefox 3
          try {
            for ( i in headers ) {
              xhr.setRequestHeader( i, headers[ i ] );
            }
          } catch( _ ) {}

          // Do send the request
          // This may raise an exception which is actually
          // handled in jQuery.ajax (so no try/catch here)
          xhr.send( ( s.hasContent && s.data ) || null );

          // Listener
          callback = function( _, isAbort ) {

            var status,
              statusText,
              responseHeaders,
              responses,
              xml;

            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occurred
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {

              // Was never called and is aborted or complete
              if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                // Only called once
                callback = undefined;

                // Do not keep as active anymore
                if ( handle ) {
                  xhr.onreadystatechange = jQuery.noop;
                  if ( xhrOnUnloadAbort ) {
                    delete xhrCallbacks[ handle ];
                  }
                }

                // If it's an abort
                if ( isAbort ) {
                  // Abort it manually if needed
                  if ( xhr.readyState !== 4 ) {
                    xhr.abort();
                  }
                } else {
                  status = xhr.status;
                  responseHeaders = xhr.getAllResponseHeaders();
                  responses = {};
                  xml = xhr.responseXML;

                  // Construct response list
                  if ( xml && xml.documentElement /* #4958 */ ) {
                    responses.xml = xml;
                  }

                  // When requesting binary data, IE6-9 will throw an exception
                  // on any attempt to access responseText (#11426)
                  try {
                    responses.text = xhr.responseText;
                  } catch( _ ) {
                  }

                  // Firefox throws an exception when accessing
                  // statusText for faulty cross-domain requests
                  try {
                    statusText = xhr.statusText;
                  } catch( e ) {
                    // We normalize with Webkit giving an empty statusText
                    statusText = "";
                  }

                  // Filter status for non standard behaviors

                  // If the request is local and we have data: assume a success
                  // (success with no data won't get notified, that's the best we
                  // can do given current implementations)
                  if ( !status && s.isLocal && !s.crossDomain ) {
                    status = responses.text ? 200 : 404;
                  // IE - #1450: sometimes returns 1223 when it should be 204
                  } else if ( status === 1223 ) {
                    status = 204;
                  }
                }
              }
            } catch( firefoxAccessException ) {
              if ( !isAbort ) {
                complete( -1, firefoxAccessException );
              }
            }

            // Call complete if needed
            if ( responses ) {
              complete( status, statusText, responses, responseHeaders );
            }
          };

          if ( !s.async ) {
            // if we're in sync mode we fire the callback
            callback();
          } else if ( xhr.readyState === 4 ) {
            // (IE6 & IE7) if it's in cache and has been
            // retrieved directly we need to fire the callback
            setTimeout( callback, 0 );
          } else {
            handle = ++xhrId;
            if ( xhrOnUnloadAbort ) {
              // Create the active xhrs callbacks list if needed
              // and attach the unload handler
              if ( !xhrCallbacks ) {
                xhrCallbacks = {};
                jQuery( window ).unload( xhrOnUnloadAbort );
              }
              // Add to list of active xhrs callbacks
              xhrCallbacks[ handle ] = callback;
            }
            xhr.onreadystatechange = callback;
          }
        },

        abort: function() {
          if ( callback ) {
            callback(0,1);
          }
        }
      };
    }
  });
}
var fxNow, timerId,
  rfxtypes = /^(?:toggle|show|hide)$/,
  rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
  rrun = /queueHooks$/,
  animationPrefilters = [ defaultPrefilter ],
  tweeners = {
    "*": [function( prop, value ) {
      var end, unit,
        tween = this.createTween( prop, value ),
        parts = rfxnum.exec( value ),
        target = tween.cur(),
        start = +target || 0,
        scale = 1,
        maxIterations = 20;

      if ( parts ) {
        end = +parts[2];
        unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

        // We need to compute starting value
        if ( unit !== "px" && start ) {
          // Iteratively approximate from a nonzero starting point
          // Prefer the current property, because this process will be trivial if it uses the same units
          // Fallback to end or a simple constant
          start = jQuery.css( tween.elem, prop, true ) || end || 1;

          do {
            // If previous iteration zeroed out, double until we get *something*
            // Use a string for doubling factor so we don't accidentally see scale as unchanged below
            scale = scale || ".5";

            // Adjust and apply
            start = start / scale;
            jQuery.style( tween.elem, prop, start + unit );

          // Update scale, tolerating zero or NaN from tween.cur()
          // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
          } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
        }

        tween.unit = unit;
        tween.start = start;
        // If a +=/-= token was provided, we're doing a relative animation
        tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
      }
      return tween;
    }]
  };

// Animations created synchronously will run synchronously
function createFxNow() {
  setTimeout(function() {
    fxNow = undefined;
  }, 0 );
  return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
  jQuery.each( props, function( prop, value ) {
    var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
      index = 0,
      length = collection.length;
    for ( ; index < length; index++ ) {
      if ( collection[ index ].call( animation, prop, value ) ) {

        // we're done with this property
        return;
      }
    }
  });
}

function Animation( elem, properties, options ) {
  var result,
    index = 0,
    tweenerIndex = 0,
    length = animationPrefilters.length,
    deferred = jQuery.Deferred().always( function() {
      // don't match elem in the :animated selector
      delete tick.elem;
    }),
    tick = function() {
      var currentTime = fxNow || createFxNow(),
        remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
        percent = 1 - ( remaining / animation.duration || 0 ),
        index = 0,
        length = animation.tweens.length;

      for ( ; index < length ; index++ ) {
        animation.tweens[ index ].run( percent );
      }

      deferred.notifyWith( elem, [ animation, percent, remaining ]);

      if ( percent < 1 && length ) {
        return remaining;
      } else {
        deferred.resolveWith( elem, [ animation ] );
        return false;
      }
    },
    animation = deferred.promise({
      elem: elem,
      props: jQuery.extend( {}, properties ),
      opts: jQuery.extend( true, { specialEasing: {} }, options ),
      originalProperties: properties,
      originalOptions: options,
      startTime: fxNow || createFxNow(),
      duration: options.duration,
      tweens: [],
      createTween: function( prop, end, easing ) {
        var tween = jQuery.Tween( elem, animation.opts, prop, end,
            animation.opts.specialEasing[ prop ] || animation.opts.easing );
        animation.tweens.push( tween );
        return tween;
      },
      stop: function( gotoEnd ) {
        var index = 0,
          // if we are going to the end, we want to run all the tweens
          // otherwise we skip this part
          length = gotoEnd ? animation.tweens.length : 0;

        for ( ; index < length ; index++ ) {
          animation.tweens[ index ].run( 1 );
        }

        // resolve when we played the last frame
        // otherwise, reject
        if ( gotoEnd ) {
          deferred.resolveWith( elem, [ animation, gotoEnd ] );
        } else {
          deferred.rejectWith( elem, [ animation, gotoEnd ] );
        }
        return this;
      }
    }),
    props = animation.props;

  propFilter( props, animation.opts.specialEasing );

  for ( ; index < length ; index++ ) {
    result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
    if ( result ) {
      return result;
    }
  }

  createTweens( animation, props );

  if ( jQuery.isFunction( animation.opts.start ) ) {
    animation.opts.start.call( elem, animation );
  }

  jQuery.fx.timer(
    jQuery.extend( tick, {
      anim: animation,
      queue: animation.opts.queue,
      elem: elem
    })
  );

  // attach callbacks from options
  return animation.progress( animation.opts.progress )
    .done( animation.opts.done, animation.opts.complete )
    .fail( animation.opts.fail )
    .always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
  var index, name, easing, value, hooks;

  // camelCase, specialEasing and expand cssHook pass
  for ( index in props ) {
    name = jQuery.camelCase( index );
    easing = specialEasing[ name ];
    value = props[ index ];
    if ( jQuery.isArray( value ) ) {
      easing = value[ 1 ];
      value = props[ index ] = value[ 0 ];
    }

    if ( index !== name ) {
      props[ name ] = value;
      delete props[ index ];
    }

    hooks = jQuery.cssHooks[ name ];
    if ( hooks && "expand" in hooks ) {
      value = hooks.expand( value );
      delete props[ name ];

      // not quite $.extend, this wont overwrite keys already present.
      // also - reusing 'index' from above because we have the correct "name"
      for ( index in value ) {
        if ( !( index in props ) ) {
          props[ index ] = value[ index ];
          specialEasing[ index ] = easing;
        }
      }
    } else {
      specialEasing[ name ] = easing;
    }
  }
}

jQuery.Animation = jQuery.extend( Animation, {

  tweener: function( props, callback ) {
    if ( jQuery.isFunction( props ) ) {
      callback = props;
      props = [ "*" ];
    } else {
      props = props.split(" ");
    }

    var prop,
      index = 0,
      length = props.length;

    for ( ; index < length ; index++ ) {
      prop = props[ index ];
      tweeners[ prop ] = tweeners[ prop ] || [];
      tweeners[ prop ].unshift( callback );
    }
  },

  prefilter: function( callback, prepend ) {
    if ( prepend ) {
      animationPrefilters.unshift( callback );
    } else {
      animationPrefilters.push( callback );
    }
  }
});

function defaultPrefilter( elem, props, opts ) {
  var index, prop, value, length, dataShow, tween, hooks, oldfire,
    anim = this,
    style = elem.style,
    orig = {},
    handled = [],
    hidden = elem.nodeType && isHidden( elem );

  // handle queue: false promises
  if ( !opts.queue ) {
    hooks = jQuery._queueHooks( elem, "fx" );
    if ( hooks.unqueued == null ) {
      hooks.unqueued = 0;
      oldfire = hooks.empty.fire;
      hooks.empty.fire = function() {
        if ( !hooks.unqueued ) {
          oldfire();
        }
      };
    }
    hooks.unqueued++;

    anim.always(function() {
      // doing this makes sure that the complete handler will be called
      // before this completes
      anim.always(function() {
        hooks.unqueued--;
        if ( !jQuery.queue( elem, "fx" ).length ) {
          hooks.empty.fire();
        }
      });
    });
  }

  // height/width overflow pass
  if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
    // Make sure that nothing sneaks out
    // Record all 3 overflow attributes because IE does not
    // change the overflow attribute when overflowX and
    // overflowY are set to the same value
    opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

    // Set display property to inline-block for height/width
    // animations on inline elements that are having width/height animated
    if ( jQuery.css( elem, "display" ) === "inline" &&
        jQuery.css( elem, "float" ) === "none" ) {

      // inline-level elements accept inline-block;
      // block-level elements need to be inline with layout
      if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
        style.display = "inline-block";

      } else {
        style.zoom = 1;
      }
    }
  }

  if ( opts.overflow ) {
    style.overflow = "hidden";
    if ( !jQuery.support.shrinkWrapBlocks ) {
      anim.done(function() {
        style.overflow = opts.overflow[ 0 ];
        style.overflowX = opts.overflow[ 1 ];
        style.overflowY = opts.overflow[ 2 ];
      });
    }
  }


  // show/hide pass
  for ( index in props ) {
    value = props[ index ];
    if ( rfxtypes.exec( value ) ) {
      delete props[ index ];
      if ( value === ( hidden ? "hide" : "show" ) ) {
        continue;
      }
      handled.push( index );
    }
  }

  length = handled.length;
  if ( length ) {
    dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
    if ( hidden ) {
      jQuery( elem ).show();
    } else {
      anim.done(function() {
        jQuery( elem ).hide();
      });
    }
    anim.done(function() {
      var prop;
      jQuery.removeData( elem, "fxshow", true );
      for ( prop in orig ) {
        jQuery.style( elem, prop, orig[ prop ] );
      }
    });
    for ( index = 0 ; index < length ; index++ ) {
      prop = handled[ index ];
      tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
      orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

      if ( !( prop in dataShow ) ) {
        dataShow[ prop ] = tween.start;
        if ( hidden ) {
          tween.end = tween.start;
          tween.start = prop === "width" || prop === "height" ? 1 : 0;
        }
      }
    }
  }
}

function Tween( elem, options, prop, end, easing ) {
  return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
  constructor: Tween,
  init: function( elem, options, prop, end, easing, unit ) {
    this.elem = elem;
    this.prop = prop;
    this.easing = easing || "swing";
    this.options = options;
    this.start = this.now = this.cur();
    this.end = end;
    this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
  },
  cur: function() {
    var hooks = Tween.propHooks[ this.prop ];

    return hooks && hooks.get ?
      hooks.get( this ) :
      Tween.propHooks._default.get( this );
  },
  run: function( percent ) {
    var eased,
      hooks = Tween.propHooks[ this.prop ];

    if ( this.options.duration ) {
      this.pos = eased = jQuery.easing[ this.easing ](
        percent, this.options.duration * percent, 0, 1, this.options.duration
      );
    } else {
      this.pos = eased = percent;
    }
    this.now = ( this.end - this.start ) * eased + this.start;

    if ( this.options.step ) {
      this.options.step.call( this.elem, this.now, this );
    }

    if ( hooks && hooks.set ) {
      hooks.set( this );
    } else {
      Tween.propHooks._default.set( this );
    }
    return this;
  }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
  _default: {
    get: function( tween ) {
      var result;

      if ( tween.elem[ tween.prop ] != null &&
        (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
        return tween.elem[ tween.prop ];
      }

      // passing any value as a 4th parameter to .css will automatically
      // attempt a parseFloat and fallback to a string if the parse fails
      // so, simple values such as "10px" are parsed to Float.
      // complex values such as "rotate(1rad)" are returned as is.
      result = jQuery.css( tween.elem, tween.prop, false, "" );
      // Empty strings, null, undefined and "auto" are converted to 0.
      return !result || result === "auto" ? 0 : result;
    },
    set: function( tween ) {
      // use step hook for back compat - use cssHook if its there - use .style if its
      // available and use plain properties where available
      if ( jQuery.fx.step[ tween.prop ] ) {
        jQuery.fx.step[ tween.prop ]( tween );
      } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
        jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
      } else {
        tween.elem[ tween.prop ] = tween.now;
      }
    }
  }
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
  set: function( tween ) {
    if ( tween.elem.nodeType && tween.elem.parentNode ) {
      tween.elem[ tween.prop ] = tween.now;
    }
  }
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
  var cssFn = jQuery.fn[ name ];
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return speed == null || typeof speed === "boolean" ||
      // special check for .toggle( handler, handler, ... )
      ( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
      cssFn.apply( this, arguments ) :
      this.animate( genFx( name, true ), speed, easing, callback );
  };
});

jQuery.fn.extend({
  fadeTo: function( speed, to, easing, callback ) {

    // show any hidden elements after setting opacity to 0
    return this.filter( isHidden ).css( "opacity", 0 ).show()

      // animate to the value specified
      .end().animate({ opacity: to }, speed, easing, callback );
  },
  animate: function( prop, speed, easing, callback ) {
    var empty = jQuery.isEmptyObject( prop ),
      optall = jQuery.speed( speed, easing, callback ),
      doAnimation = function() {
        // Operate on a copy of prop so per-property easing won't be lost
        var anim = Animation( this, jQuery.extend( {}, prop ), optall );

        // Empty animations resolve immediately
        if ( empty ) {
          anim.stop( true );
        }
      };

    return empty || optall.queue === false ?
      this.each( doAnimation ) :
      this.queue( optall.queue, doAnimation );
  },
  stop: function( type, clearQueue, gotoEnd ) {
    var stopQueue = function( hooks ) {
      var stop = hooks.stop;
      delete hooks.stop;
      stop( gotoEnd );
    };

    if ( typeof type !== "string" ) {
      gotoEnd = clearQueue;
      clearQueue = type;
      type = undefined;
    }
    if ( clearQueue && type !== false ) {
      this.queue( type || "fx", [] );
    }

    return this.each(function() {
      var dequeue = true,
        index = type != null && type + "queueHooks",
        timers = jQuery.timers,
        data = jQuery._data( this );

      if ( index ) {
        if ( data[ index ] && data[ index ].stop ) {
          stopQueue( data[ index ] );
        }
      } else {
        for ( index in data ) {
          if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
            stopQueue( data[ index ] );
          }
        }
      }

      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
          timers[ index ].anim.stop( gotoEnd );
          dequeue = false;
          timers.splice( index, 1 );
        }
      }

      // start the next in the queue if the last step wasn't forced
      // timers currently will call their complete callbacks, which will dequeue
      // but only if they were gotoEnd
      if ( dequeue || !gotoEnd ) {
        jQuery.dequeue( this, type );
      }
    });
  }
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
  var which,
    attrs = { height: type },
    i = 0;

  // if we include width, step value is 1 to do all cssExpand values,
  // if we don't include width, step value is 2 to skip over Left and Right
  includeWidth = includeWidth? 1 : 0;
  for( ; i < 4 ; i += 2 - includeWidth ) {
    which = cssExpand[ i ];
    attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
  }

  if ( includeWidth ) {
    attrs.opacity = attrs.width = type;
  }

  return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
  slideDown: genFx("show"),
  slideUp: genFx("hide"),
  slideToggle: genFx("toggle"),
  fadeIn: { opacity: "show" },
  fadeOut: { opacity: "hide" },
  fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return this.animate( props, speed, easing, callback );
  };
});

jQuery.speed = function( speed, easing, fn ) {
  var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
    complete: fn || !fn && easing ||
      jQuery.isFunction( speed ) && speed,
    duration: speed,
    easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
  };

  opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
    opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

  // normalize opt.queue - true/undefined/null -> "fx"
  if ( opt.queue == null || opt.queue === true ) {
    opt.queue = "fx";
  }

  // Queueing
  opt.old = opt.complete;

  opt.complete = function() {
    if ( jQuery.isFunction( opt.old ) ) {
      opt.old.call( this );
    }

    if ( opt.queue ) {
      jQuery.dequeue( this, opt.queue );
    }
  };

  return opt;
};

jQuery.easing = {
  linear: function( p ) {
    return p;
  },
  swing: function( p ) {
    return 0.5 - Math.cos( p*Math.PI ) / 2;
  }
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
  var timer,
    timers = jQuery.timers,
    i = 0;

  for ( ; i < timers.length; i++ ) {
    timer = timers[ i ];
    // Checks the timer has not already been removed
    if ( !timer() && timers[ i ] === timer ) {
      timers.splice( i--, 1 );
    }
  }

  if ( !timers.length ) {
    jQuery.fx.stop();
  }
};

jQuery.fx.timer = function( timer ) {
  if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
    timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
  }
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
  clearInterval( timerId );
  timerId = null;
};

jQuery.fx.speeds = {
  slow: 600,
  fast: 200,
  // Default speed
  _default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.animated = function( elem ) {
    return jQuery.grep(jQuery.timers, function( fn ) {
      return elem === fn.elem;
    }).length;
  };
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
  if ( arguments.length ) {
    return options === undefined ?
      this :
      this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
  }

  var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
    box = { top: 0, left: 0 },
    elem = this[ 0 ],
    doc = elem && elem.ownerDocument;

  if ( !doc ) {
    return;
  }

  if ( (body = doc.body) === elem ) {
    return jQuery.offset.bodyOffset( elem );
  }

  docElem = doc.documentElement;

  // Make sure it's not a disconnected DOM node
  if ( !jQuery.contains( docElem, elem ) ) {
    return box;
  }

  // If we don't have gBCR, just use 0,0 rather than error
  // BlackBerry 5, iOS 3 (original iPhone)
  if ( typeof elem.getBoundingClientRect !== "undefined" ) {
    box = elem.getBoundingClientRect();
  }
  win = getWindow( doc );
  clientTop  = docElem.clientTop  || body.clientTop  || 0;
  clientLeft = docElem.clientLeft || body.clientLeft || 0;
  scrollTop  = win.pageYOffset || docElem.scrollTop;
  scrollLeft = win.pageXOffset || docElem.scrollLeft;
  return {
    top: box.top  + scrollTop  - clientTop,
    left: box.left + scrollLeft - clientLeft
  };
};

jQuery.offset = {

  bodyOffset: function( body ) {
    var top = body.offsetTop,
      left = body.offsetLeft;

    if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
      top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
      left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
    }

    return { top: top, left: left };
  },

  setOffset: function( elem, options, i ) {
    var position = jQuery.css( elem, "position" );

    // set position first, in-case top/left are set even on static elem
    if ( position === "static" ) {
      elem.style.position = "relative";
    }

    var curElem = jQuery( elem ),
      curOffset = curElem.offset(),
      curCSSTop = jQuery.css( elem, "top" ),
      curCSSLeft = jQuery.css( elem, "left" ),
      calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
      props = {}, curPosition = {}, curTop, curLeft;

    // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if ( calculatePosition ) {
      curPosition = curElem.position();
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat( curCSSTop ) || 0;
      curLeft = parseFloat( curCSSLeft ) || 0;
    }

    if ( jQuery.isFunction( options ) ) {
      options = options.call( elem, i, curOffset );
    }

    if ( options.top != null ) {
      props.top = ( options.top - curOffset.top ) + curTop;
    }
    if ( options.left != null ) {
      props.left = ( options.left - curOffset.left ) + curLeft;
    }

    if ( "using" in options ) {
      options.using.call( elem, props );
    } else {
      curElem.css( props );
    }
  }
};


jQuery.fn.extend({

  position: function() {
    if ( !this[0] ) {
      return;
    }

    var elem = this[0],

    // Get *real* offsetParent
    offsetParent = this.offsetParent(),

    // Get correct offsets
    offset       = this.offset(),
    parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

    // Subtract element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
    offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

    // Add offsetParent borders
    parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
    parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

    // Subtract the two offsets
    return {
      top:  offset.top  - parentOffset.top,
      left: offset.left - parentOffset.left
    };
  },

  offsetParent: function() {
    return this.map(function() {
      var offsetParent = this.offsetParent || document.body;
      while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || document.body;
    });
  }
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
  var top = /Y/.test( prop );

  jQuery.fn[ method ] = function( val ) {
    return jQuery.access( this, function( elem, method, val ) {
      var win = getWindow( elem );

      if ( val === undefined ) {
        return win ? (prop in win) ? win[ prop ] :
          win.document.documentElement[ method ] :
          elem[ method ];
      }

      if ( win ) {
        win.scrollTo(
          !top ? val : jQuery( win ).scrollLeft(),
           top ? val : jQuery( win ).scrollTop()
        );

      } else {
        elem[ method ] = val;
      }
    }, method, val, arguments.length, null );
  };
});

function getWindow( elem ) {
  return jQuery.isWindow( elem ) ?
    elem :
    elem.nodeType === 9 ?
      elem.defaultView || elem.parentWindow :
      false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
  jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
    // margin is only for outerHeight, outerWidth
    jQuery.fn[ funcName ] = function( margin, value ) {
      var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
        extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

      return jQuery.access( this, function( elem, type, value ) {
        var doc;

        if ( jQuery.isWindow( elem ) ) {
          // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
          // isn't a whole lot we can do. See pull request at this URL for discussion:
          // https://github.com/jquery/jquery/pull/764
          return elem.document.documentElement[ "client" + name ];
        }

        // Get document width or height
        if ( elem.nodeType === 9 ) {
          doc = elem.documentElement;

          // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
          // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
          return Math.max(
            elem.body[ "scroll" + name ], doc[ "scroll" + name ],
            elem.body[ "offset" + name ], doc[ "offset" + name ],
            doc[ "client" + name ]
          );
        }

        return value === undefined ?
          // Get width or height on the element, requesting but not forcing parseFloat
          jQuery.css( elem, type, value, extra ) :

          // Set width or height on the element
          jQuery.style( elem, type, value, extra );
      }, type, chainable ? margin : undefined, chainable, null );
    };
  });
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
  define( "jquery", [], function () { return jQuery; } );
}

})( window );
;

//     Underscore.js 1.4.0
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.4.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return arguments.length > 2 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    var found = false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // with specific `key:value` pairs.
  _.where = function(obj, attrs) {
    if (_.isEmpty(attrs)) return [];
    return _.filter(obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (obj.length === +obj.length) return slice.call(obj);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, fromIndex) {
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item, fromIndex);
    var i = (fromIndex != null ? fromIndex : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) {
          result = func.apply(context, args);
        }
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + (0 | Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });
      source +=
        escape ? "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" :
        interpolate ? "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" :
        evaluate ? "';\n" + evaluate + "\n__p+='" : '';
      index = offset + match.length;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
;

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);;

/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	function converted(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		return config.json ? JSON.parse(s) : s;
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		var result = key ? undefined : {};
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = decode(parts.join('='));

			if (key && key === name) {
				result = converted(cookie);
				break;
			}

			if (!key) {
				result[name] = converted(cookie);
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== undefined) {
			$.cookie(key, '', $.extend(options, { expires: -1 }));
			return true;
		}
		return false;
	};

}));;

var jrequire = function (file, cwd) {
    var resolved = jrequire.resolve(file, cwd || '/');
    var mod = jrequire.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

jrequire.paths = [];
jrequire.modules = {};
jrequire.extensions = [".js",".coffee"];

jrequire._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

jrequire.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (jrequire._core[x]) return x;
        var path = jrequire.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (jrequire.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < jrequire.extensions.length; i++) {
                var ext = jrequire.extensions[i];
                if (jrequire.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (jrequire.modules[pkgfile]) {
                var pkg = jrequire.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

jrequire.alias = function (from, to) {
    var path = jrequire.modules.path();
    var res = null;
    try {
        res = jrequire.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = jrequire.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    })(jrequire.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            jrequire.modules[to + f] = jrequire.modules[basedir + f];
        }
        else if (key === basedir) {
            jrequire.modules[to] = jrequire.modules[basedir];
        }
    }
};

jrequire.define = function (filename, fn) {
    var dirname = jrequire._core[filename]
        ? ''
        : jrequire.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return jrequire(file, dirname)
    };
    require_.resolve = function (name) {
        return jrequire.resolve(name, dirname);
    };
    require_.modules = jrequire.modules;
    require_.define = jrequire.define;
    var module_ = { exports : {} };
    
    jrequire.modules[filename] = function () {
        jrequire.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        jrequire.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return jrequire('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

jrequire.define("path", function (require, module, exports, __dirname, __filename) {
function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

jrequire.define("/parser.js", function (require, module, exports, __dirname, __filename) {
(function(){
  var Lexer, NodeComment, NodeList, NodePrint, default_nodes, tk_tag_open, tk_tag_open_spc, tk_tag_close, tk_tag_close_spc, tk_tag_single, tk_comment_open, tk_comment_open_spc, tk_comment_close, tk_comment_close_spc, tk_comment_single, tk_print_open, tk_print_close, tk_new_line, default_tokens, Parser, _ref, _tag_search;
  Lexer = jrequire('./lexer').Lexer;
  _ref = jrequire('./nodes'), NodeComment = _ref.NodeComment, NodeList = _ref.NodeList, NodePrint = _ref.NodePrint, default_nodes = _ref.default_nodes;
  tk_tag_open = "{%";
  tk_tag_open_spc = "{%-";
  tk_tag_close = "%}";
  tk_tag_close_spc = "-%}";
  tk_tag_single = "%";
  tk_comment_open = "{#";
  tk_comment_open_spc = "{#-";
  tk_comment_close = "#}";
  tk_comment_close_spc = "-#}";
  tk_comment_single = "#";
  tk_print_open = "{{";
  tk_print_close = "}}";
  tk_new_line = "\n";
  default_tokens = [tk_tag_open, tk_tag_open_spc, tk_tag_close, tk_tag_close_spc, tk_comment_open, tk_comment_open_spc, tk_comment_close, tk_comment_close_spc, tk_print_open, tk_print_close, tk_new_line];
  /**
   *  @param str A string
   *  @returns    A trimmed string, without leading nor ending spaces.
   */
  function trim(str){
    if (str === null) {
      return null;
    }
    return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
  }
  _tag_search = /\s*([a-zA-Z][-a-zA-Z0-9_]*)\s+((.|\n)*)/m;
  /**
   *  @param stmt The contents between {% and %}
   *  @returns    An object containing the tag portion and the contents.
   */
  function parse_tag(stmt){
    var m, _ref;
    m = _tag_search.exec(stmt);
    return [m[1], (_ref = m[2]) != null ? _ref : ""];
  }
  function remove_spaces(str){
    var i, _ref;
    i = 0;
    while ((_ref = str[i]) === ' ' || _ref === "\t") {
      i += 1;
    }
    return [str.substr(0, i), str.substr(i)];
  }
  /**
   *  The parser is used to build a node tree : this node tree will present a compile () method
   *  that generates javascript code ready to be compiled.
   */
  Parser = (function(){
    Parser.displayName = 'Parser';
    var prototype = Parser.prototype, constructor = Parser;
    function Parser(specs){
      var _ref;
      specs == null && (specs = {});
      this.nodes = (_ref = specs.nodes) != null ? _ref : default_nodes;
      this.lexer = new Lexer({
        tokens: default_tokens
      });
      this.root = NodeList();
      this.trim_blocks = (_ref = specs.trim_blocks) != null ? _ref : true;
      this._discard_next_space = false;
      this._discard_next_newline = false;
      this._cached_next = null;
    }
    prototype._nextToken = (function(){
      function _nextToken(){
        var acc, spaces, tok, _ref;
        if (this._cached_next != null) {
          this.current_token = this._cached_next;
          this._cached_next = null;
          return;
        }
        acc = '';
        do {
          this.current_token = this.lexer.next();
          if (this.current_token === tk_new_line) {
            acc += this.current_token;
            this.current_token = '';
          } else if (this.current_token != null) {
            _ref = remove_spaces(this.current_token), spaces = _ref[0], tok = _ref[1];
            acc += spaces;
            this.current_token = tok;
          }
        } while (this.current_token === '' && this.current_token !== null);
        if (acc === '' && this.current_token === null) {
          return;
        }
        if (this._discard_next_space || ((_ref = this.current_token) === tk_tag_open_spc || _ref === tk_comment_open_spc)) {
          this._discard_next_space = false;
          return;
        }
        if ((_ref = this.current_token) === tk_comment_close_spc || _ref === tk_tag_close_spc) {
          this._discard_next_space = true;
        }
        if (acc) {
          this._cached_next = this.current_token;
          return this.current_token = acc;
        }
      }
      return _nextToken;
    }());
    prototype.nextToken = (function(){
      function nextToken(){
        var i, _ref, _to, _ref2;
        this._nextToken();
        if (this.current_token == null) {
          return;
        }
        _ref = this.current_token;
        if (this._discard_next_newline) {
          for (i = 0, _to = _ref.length - 1; i <= _to; ++i) {
            if (_ref[i] == '\n') {
              this.current_token = _ref.substr(i + 1);
              break;
            }
          }
          if (!this.current_token) {
            this.nextToken();
            return;
          }
          this._discard_next_newline = false;
        }
        if (this.trim_blocks && ((_ref2 = this.current_token) === tk_comment_close || _ref2 === tk_tag_close)) {
          return this._discard_next_newline = true;
        }
      }
      return nextToken;
    }());
    /**
     *  Parse comments in the input.
     *  @return nothing ! We ditch everything inside.
     */
    prototype.parseComment = (function(){
      function parseComment(){
        var balance, comment;
        balance = 1;
        comment = "";
        do {
          this.nextToken();
          if (this.current_token == tk_comment_close || this.current_token == tk_comment_close_spc) {
            balance -= 1;
            continue;
          }
          if (this.current_token == tk_comment_open || this.current_token == tk_comment_open_spc) {
            balance += 1;
            continue;
          }
          comment += this.current_token;
        } while (this.current_token != null && balance > 0);
        if (balance != 0) {
          throw new Error("Unclosed Comment at line " + _lexer.lineno);
        }
      }
      return parseComment;
    }());
    /**
     *  Parse a print statement. Usually delimited by {{ and }}
     *  The insides of the print statement are in turn parsed to escape
     *  variables and filters with the ctx. and env.filters. prefix respectively.
     *
     *  @return a PrintNode
     */
    prototype.parsePrintStatement = (function(){
      function parsePrintStatement(){
        var statement;
        statement = "";
        do {
          this.current_token = this.lexer.next();
          if (this.current_token && this.current_token != tk_print_close) {
            statement += this.current_token;
          }
        } while (this.current_token != null && this.current_token != tk_print_close);
        if (this.current_token === null) {
          throw new Error("Waiting for '" + tk_print_close + "' at line " + this.lexer.lineno);
        }
        return new NodePrint({
          contents: trim(statement)
        });
      }
      return parsePrintStatement;
    }());
    /**
     *
     */
    prototype.parseTag = (function(){
      function parseTag(waiting_for){
        var tag_contents, name, contents, stop_clause, until_clause, inside_clause, child_node, tag, inside_name, inside_contents, inside_cls, inside_tag, _ref;
        tag_contents = "";
        this.nextToken();
        while (this.current_token != null && this.current_token != tk_tag_close && this.current_token != tk_tag_close_spc) {
          tag_contents += this.current_token;
          this.nextToken();
        }
        if (this.current_token === null) {
          throw new Error("Waiting for '" + tk_tag_close + "' on line " + this.lexer.lineno);
        }
        _ref = parse_tag(tag_contents), name = _ref[0], contents = _ref[1];
        if (name in waiting_for) {
          this.last_tag = [name, contents];
          return;
        }
        if (!this.nodes[name]) {
          throw new Error("Unexpected tag : '" + name + "' at line " + this.lexer.lineno);
        }
        stop_clause = {};
        until_clause = this.nodes[name]['until'];
        stop_clause[until_clause] = true;
        inside_clause = this.nodes[name]['inside'];
        __import(stop_clause, inside_clause);
        if (until_clause == "__endfile__") {
          child_node = this.parseLevel();
        } else if (until_clause) {
          child_node = this.parseLevel(stop_clause);
        }
        tag = new this.nodes[name]({
          name: trim(name),
          contents: trim(contents),
          child_node: child_node
        });
        if (!until_clause) {
          return tag;
        }
        while (this.last_tag != null && this.last_tag[0] != until_clause) {
          _ref = [this.last_tag[0], this.last_tag[1]], inside_name = _ref[0], inside_contents = _ref[1];
          inside_cls = this.nodes[name].inside[inside_name];
          inside_clause = inside_cls['inside'];
          stop_clause = (_ref = __import((_ref = {}, _ref[until_clause + ""] = true, _ref), inside_clause)) != null
            ? _ref
            : {};
          inside_tag = this.parseLevel(stop_clause);
          tag.push(new inside_cls({
            name: inside_name,
            contents: inside_contents,
            child_node: inside_tag
          }));
        }
        return tag;
      }
      return parseTag;
    }());
    /**
     *  Parse the input file.
     *  @return the root NodeList
     */
    prototype.parseLevel = (function(){
      function parseLevel(waiting_for){
        var result, tag;
        waiting_for == null && (waiting_for = {});
        if (waiting_for != null && !typeof waiting_for == 'object') {
          waiting_for = {
            waiting_for: true
          };
        }
        result = new NodeList();
        for (;;) {
          this.nextToken();
          if (!this.current_token) {
            break;
          }
          if (this.current_token == tk_tag_open || this.current_token == tk_tag_open_spc) {
            tag = this.parseTag(waiting_for);
            if (!tag) {
              return result;
            }
            result.push(tag);
            continue;
          }
          if (this.current_token == tk_print_open) {
            result.push(this.parsePrintStatement());
            continue;
          }
          if (this.current_token == tk_comment_open || this.current_token == tk_comment_open_spc) {
            result.push(this.parseComment());
            continue;
          }
          result.push(this.current_token);
        }
        return result;
      }
      return parseLevel;
    }());
    /**
     *  Holder function for _parse_global
     *  @return _parse_global's result
     */
    prototype.parse = (function(){
      function parse(str){
        this.lexer.feed(str);
        this.current = this.root;
        this.current_token = "";
        return this.parseLevel();
      }
      return parse;
    }());
    return Parser;
  }());
  exports.Parser = Parser;
  exports.default_tokens = default_tokens;
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

});

jrequire.define("/lexer.js", function (require, module, exports, __dirname, __filename) {
/**
 *  A Lexer.
 *
 *  Use Lexer.feed (str) to input a string for it to break it down.
 *  Use Lexer.next () to get the next token.
 *  Use Lexer.peek () to see a future token without advancing in the stream.
 *
 *  This Lexer does NOT use regular expression but simple strings for speed.
 */
(function(){
  var Lexer;
  Lexer = (function(){
    /**
     *  Sort function for token sorting. Orders the array so that
     *  the first element in the next token in the string (aka, its
     *  position is the lowest one). In case of having two tokens
     *  at the same position - because they start the same - put first
     *  the longest one, so that, for exemple, == comes before =.
     *
     *  @param a: First Operand
     *  @param b: Second Operand
     *  @returns 1, 0 or -1
     */
    Lexer.displayName = 'Lexer';
    var __token_sort, prototype = Lexer.prototype, constructor = Lexer;
    __token_sort = (function(){
      function __token_sort(a, b){
        if (a.pos == -1) {
          return 1;
        }
        if (b.pos == -1) {
          return -1;
        }
        if (a.pos < b.pos) {
          return -1;
        }
        if (a.pos == b.pos) {
          if (a.tok.length > b.tok.length) {
            return -1;
          }
          if (a.tok.length < b.tok.length) {
            return 1;
          }
          return 0;
        }
        return 1;
      }
      return __token_sort;
    }());
    /**
     *
     */
    function Lexer(specs){
      var token, _res, _i, _ref, _len;
      this.input = null;
      this.position = 0;
      this.lineno = 0;
      _res = [];
      for (_i = 0, _len = (_ref = specs.tokens).length; _i < _len; ++_i) {
        token = _ref[_i];
        _res.push({
          tok: token,
          pos: -1
        });
      }
      this.tokens_order = _res;
    }
    prototype.computeTokenPositions = (function(){
      function computeTokenPositions(){
        var token, _i, _ref, _len;
        for (_i = 0, _len = (_ref = this.tokens_order).length; _i < _len; ++_i) {
          token = _ref[_i];
          token.pos = this.input.indexOf(token.tok, this.position);
        }
        return this.tokens_order.sort(__token_sort);
      }
      return computeTokenPositions;
    }());
    prototype.feed = (function(){
      function feed(str){
        this.input = str;
        this.position = 0;
        this.lineno = 0;
        return this.computeTokenPositions();
      }
      return feed;
    }());
    prototype.advance = (function(){
      function advance(to_position){
        var res;
        res = this.input.slice(this.position, to_position);
        this.position = to_position;
        return res;
      }
      return advance;
    }());
    prototype.advanceCurrentToken = (function(){
      function advanceCurrentToken(){
        var next_token, res;
        next_token = this.tokens_order[0];
        if (next_token.tok == "\n") {
          this.lineno += 1;
        }
        res = this.advance(this.position + next_token.tok.length);
        this.computeTokenPositions();
        return res;
      }
      return advanceCurrentToken;
    }());
    /**
     *  Return the next token in the input stream.
     */
    prototype.next = (function(){
      function next(){
        var result, next_token;
        if (this.input == null) {
          throw {
            message: "Lexer has not been fed an input."
          };
        }
        if (this._cached_next !== undefined) {
          result = this._cached_next;
          this._cached_next = undefined;
          return result;
        }
        if (this.position >= this.input.length) {
          return null;
        }
        next_token = this.tokens_order[0];
        if (next_token.pos == -1) {
          return this.advance(this.input.length);
        }
        if (next_token.pos == this.position) {
          return this.advanceCurrentToken();
        } else {
          return this.advance(next_token.pos);
        }
      }
      return next;
    }());
    /**
     *  Return the next token in the input stream, and cache its result, so that
     *  every subsequents call to peek and the next call to next() return the same token
     */
    prototype.peek = (function(){
      function peek(){
        if (this._cached_next == undefined) {
          this._cached_next = this.next();
        }
        return this._cached_next;
      }
      return peek;
    }());
    return Lexer;
  }());
  exports.Lexer = Lexer;
}).call(this);

});

jrequire.define("/nodes.js", function (require, module, exports, __dirname, __filename) {
(function(){
  var make_expression, make_parse_rule, parse_for, parse_let, parse_macro, parse_extends, parse_block, parse_import, parse_string, Node, NodeBasic, NodeComment, NodeList, NodePrint, NodeTag, NodeExtends, NodeImport, NodeFromImport, NodeInclude, NodeAbspath, NodeLet, NodeDo, NodeTagContainer, NodeMacro, NodeCall, NodeBlock, NodeElse, NodeElseIf, NodeElIf, NodeIf, NodeElseFor, NodeContinue, NodeBreak, NodeFor;
  make_expression = jrequire('./expression').parse;
  make_parse_rule = function(rule_name){
    return function(contents, ctx){
      return make_expression(contents, rule_name, ctx);
    };
  };
  parse_for = make_parse_rule('tag_for');
  parse_let = make_parse_rule('tag_let');
  parse_macro = make_parse_rule('tag_macro');
  parse_extends = make_expression;
  parse_block = make_parse_rule('tag_block');
  parse_import = make_parse_rule('tag_import');
  parse_string = make_parse_rule('string');
  function trim(string){
    return !string
      ? ""
      : string.replace(/^\s*|\s*$/, '');
  }
  /**
   *  @param str  a string
   *  @returns    an escaped string suitable to be quoted.
   */
  function escape(str){
    return str.replace(/\\/g, '\\\\').replace(/["']/g, function(str){
      return "\\" + str;
    }).replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  }
  function template_expr_is_string(expr){
    try {
      parse_string(expr);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   *
   */
  Node = (function(){
    Node.displayName = 'Node';
    var prototype = Node.prototype, constructor = Node;
    function Node(specs){
      this.contents = (specs != null
        ? specs
        : {}).contents;
    }
    prototype.compile = (function(){
      function compile(){
        throw new Error("This function should never be called.");
      }
      return compile;
    }());
    prototype.ind = (function(){
      function ind(opts){
        var ind;
        opts.__indent__ == null && (opts.__indent__ = 0);
        opts.__indent__ = opts.__indent__ + 1;
        ind = opts.__indent__ * 4;
        return "\n" + __repeatString(" ", ind);
      }
      return ind;
    }());
    prototype.ded = (function(){
      function ded(opts){
        var ind;
        opts.__indent__ == null && (opts.__indent__ = 1);
        opts.__indent__ = opts.__indent__ - 1;
        ind = opts.__indent__ * 4;
        return "\n" + __repeatString(" ", ind);
      }
      return ded;
    }());
    prototype.cur = (function(){
      function cur(opts){
        var ind, _ref;
        ind = ((_ref = opts.__indent__) != null ? _ref : 0) * 4;
        return "\n" + __repeatString(" ", ind);
      }
      return cur;
    }());
    return Node;
  }());
  /**
   *
   */
  NodeBasic = (function(_super){
    NodeBasic.displayName = 'NodeBasic';
    var prototype = __extends(NodeBasic, _super).prototype, constructor = NodeBasic;
    function NodeBasic(specs){
      NodeBasic.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        return "_res += '" + escape(this.contents) + "';";
      }
      return compile;
    }());
    prototype.append = (function(){
      function append(contents){
        return this.contents += contents;
      }
      return append;
    }());
    return NodeBasic;
  }(Node));
  NodeComment = (function(_super){
    NodeComment.displayName = 'NodeComment';
    var prototype = __extends(NodeComment, _super).prototype, constructor = NodeComment;
    function NodeComment(_arg){
      var _ref;
      this.contents = (_ref = _arg.contents) != null ? _ref : "";
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        return "/*" + this.contents + "*/";
      }
      return compile;
    }());
    return NodeComment;
  }(Node));
  /**
   *  A collection of Nodes.
   */
  NodeList = (function(_super){
    NodeList.displayName = 'NodeList';
    var prototype = __extends(NodeList, _super).prototype, constructor = NodeList;
    function NodeList(specs){
      this.nodes = [];
      NodeList.superclass.apply(this, arguments);
    }
    prototype.push = (function(){
      function push(node){
        var last_node;
        if (node == null) {
          return;
        }
        if (typeof node == 'string') {
          last_node = this.nodes[this.nodes.length - 1];
          if (last_node instanceof NodeBasic) {
            return last_node.append(node);
          } else {
            return this.nodes.push(new NodeBasic({
              contents: node
            }));
          }
        } else {
          return this.nodes.push(node);
        }
      }
      return push;
    }());
    prototype.compile = (function(){
      function compile(opts, ctx){
        var res, node, _i, _ref, _len;
        ctx == null && (ctx = {});
        res = "";
        for (_i = 0, _len = (_ref = this.nodes).length; _i < _len; ++_i) {
          node = _ref[_i];
          res += node.compile(opts, ctx);
        }
        return res;
      }
      return compile;
    }());
    return NodeList;
  }(Node));
  /**
   *
   */
  NodePrint = (function(_super){
    NodePrint.displayName = 'NodePrint';
    var prototype = __extends(NodePrint, _super).prototype, constructor = NodePrint;
    function NodePrint(specs){
      NodePrint.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        return "_res += ((_ref = " + make_expression(this.contents, ctx) + ") !== undefined && _ref !== null ? _ref : '').toString();";
      }
      return compile;
    }());
    return NodePrint;
  }(Node));
  NodeTag = (function(_super){
    NodeTag.displayName = 'NodeTag';
    var prototype = __extends(NodeTag, _super).prototype, constructor = NodeTag;
    NodeTag.tag = '__tag__';
    function NodeTag(specs){
      NodeTag.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(){
        throw new JinJSUnimplementedException("The NodeTag is not meant to be used !");
      }
      return compile;
    }());
    prototype.toString = (function(){
      function toString(){
        return "Node: " + this.constructor.displayName;
      }
      return toString;
    }());
    return NodeTag;
  }(Node));
  /**
   *
   */
  NodeExtends = (function(_super){
    NodeExtends.displayName = 'NodeExtends';
    var prototype = __extends(NodeExtends, _super).prototype, constructor = NodeExtends;
    NodeExtends.tag = 'extends';
    function NodeExtends(specs){
      NodeExtends.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var tpl_name;
        opts['extends'] = true;
        tpl_name = parse_extends(this.contents, opts);
        if (template_expr_is_string(tpl_name)) {
          return "__extends__ = jrequire(" + tpl_name + ");";
        } else {
          return "__extends__ = " + tpl_name + ";\nif (__extends__ === null || __extends__ === undefined) throw new Error ('Cant extend a null template.');";
        }
      }
      return compile;
    }());
    return NodeExtends;
  }(NodeTag));
  NodeImport = (function(_super){
    NodeImport.displayName = 'NodeImport';
    var prototype = __extends(NodeImport, _super).prototype, constructor = NodeImport;
    NodeImport.tag = 'import';
    function NodeImport(specs){
      NodeImport.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var tpl, as, imports, with_context, result;
        tpl = parse_import.tpl, as = parse_import.as, imports = parse_import.imports, with_context = parse_import.with_context;
        opts['clone'] = true;
        result = "(function(){\nvar __new_ctx = " + (!with_context ? '{}' : '__import({}, $$)') + ";\n// __new_ctx now gets populated with the new exported variables.\njrequire(" + tpl + ").render(__new_ctx);";
        if (as) {
          result += common + "$$." + as + " = __new_ctx;";
        } else {
          result += "var names = ['" + imports.join("', '") + "'];\nfor (var i = 0; i < names.length; i++) {\n    $$[names[i]] = __new_ctx[names[i]];\n}";
        }
        result += "})();";
        return result;
      }
      return compile;
    }());
    return NodeImport;
  }(NodeTag));
  NodeFromImport = (function(_super){
    NodeFromImport.displayName = 'NodeFromImport';
    var prototype = __extends(NodeFromImport, _super).prototype, constructor = NodeFromImport;
    NodeFromImport.tag = 'from';
    function NodeFromImport(specs){
      NodeFromImport.superclass.apply(this, arguments);
    }
    return NodeFromImport;
  }(NodeImport));
  /**
   *
   */
  NodeInclude = (function(_super){
    NodeInclude.displayName = 'NodeInclude';
    var prototype = __extends(NodeInclude, _super).prototype, constructor = NodeInclude;
    NodeInclude.tag = 'include';
    function NodeInclude(specs){
      NodeInclude.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var tpl_name, tpl_exp;
        tpl_name = parse_extends(this.contents, opts);
        if (template_expr_is_string(tpl_name)) {
          tpl_exp = "jrequire(" + tpl_name + ")";
        } else {
          tpl_exp = tpl_name;
        }
        return "_res += (" + tpl_exp + ").render($$);";
      }
      return compile;
    }());
    return NodeInclude;
  }(NodeTag));
  NodeImport = (function(_super){
    NodeImport.displayName = 'NodeImport';
    var prototype = __extends(NodeImport, _super).prototype, constructor = NodeImport;
    NodeImport.tag = 'import';
    function NodeImport(specs){
      NodeImport.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var template, as_name, variables, with_context, tpl_exp, result, _ref;
        _ref = parse_import(this.contents, ctx), template = _ref.template, as_name = _ref.as_name, variables = _ref.variables, with_context = _ref.with_context;
        opts['clone'] = true;
        if (template_expr_is_string(template)) {
          tpl_exp = "jrequire(" + template + ")";
        } else {
          tpl_exp = template;
        }
        result = "(function(){ ";
        if (with_context) {
          result += "var __new_ctx = __import({}, $$);\n// __new_ctx now gets populated with the new exported variables.\n(" + tpl_exp + ").render(__new_ctx);";
        } else {
          result += "var __new_ctx = (" + tpl_exp + ")._cached_ctx();";
        }
        if (as_name) {
          result += "$$." + as_name + " = __new_ctx;";
        } else {
          result += "var names = ['" + variables.join("', '") + "'];\nfor (var i = 0; i < names.length; i++) {\n    $$[names[i]] = __new_ctx[names[i]];\n}";
        }
        result += "})();";
        return result;
      }
      return compile;
    }());
    return NodeImport;
  }(NodeTag));
  NodeFromImport = (function(_super){
    NodeFromImport.displayName = 'NodeFromImport';
    var prototype = __extends(NodeFromImport, _super).prototype, constructor = NodeFromImport;
    NodeFromImport.tag = 'from';
    function NodeFromImport(specs){
      NodeFromImport.superclass.apply(this, arguments);
    }
    return NodeFromImport;
  }(NodeImport));
  NodeAbspath = (function(_super){
    NodeAbspath.displayName = 'NodeAbspath';
    var prototype = __extends(NodeAbspath, _super).prototype, constructor = NodeAbspath;
    NodeAbspath.tag = 'abspath';
    function NodeAbspath(specs){
      NodeAbspath.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var path;
        path = parse_string(this.contents, ctx);
        return "_res += _jrequire('path').join(__dirname, " + path + ");";
      }
      return compile;
    }());
    return NodeAbspath;
  }(NodeTag));
  /**
   *
   */
  NodeLet = (function(_super){
    NodeLet.displayName = 'NodeLet';
    var prototype = __extends(NodeLet, _super).prototype, constructor = NodeLet;
    NodeLet.tag = 'let';
    function NodeLet(specs){
      NodeLet.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var variable_name, expression, res, _ref;
        _ref = parse_let(this.contents, ctx), variable_name = _ref.variable_name, expression = _ref.expression;
        ctx[variable_name] = true;
        return res = "var " + variable_name + " = ($$." + variable_name + " = " + expression + ");";
      }
      return compile;
    }());
    return NodeLet;
  }(NodeTag));
  NodeDo = (function(_super){
    NodeDo.displayName = 'NodeDo';
    var prototype = __extends(NodeDo, _super).prototype, constructor = NodeDo;
    NodeDo.tag = 'do';
    function NodeDo(specs){
      NodeDo.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        return make_expression(this.contents, ctx) + ";";
      }
      return compile;
    }());
    return NodeDo;
  }(NodeTag));
  /**
   */
  NodeTagContainer = (function(_super){
    NodeTagContainer.displayName = 'NodeTagContainer';
    var prototype = __extends(NodeTagContainer, _super).prototype, constructor = NodeTagContainer;
    function NodeTagContainer(specs){
      NodeTagContainer.superclass.apply(this, arguments);
      this.child_node = specs.child_node;
    }
    prototype.child_code = (function(){
      function child_code(opts, ctx){
        var ind, _ref;
        ind = 0;
        return ((_ref = (_ref = this.child_node) != null ? _ref.compile(opts, ctx) : void 8) != null ? _ref : "").replace(/^/g, function(){
          ind = ind + 1;
          return ind == 1 ? "" : "    ";
        });
      }
      return child_code;
    }());
    return NodeTagContainer;
  }(NodeList));
  /**
   *
   */
  NodeMacro = (function(_super){
    NodeMacro.displayName = 'NodeMacro';
    var prototype = __extends(NodeMacro, _super).prototype, constructor = NodeMacro;
    NodeMacro.tag = 'macro';
    NodeMacro.until = 'endmacro';
    function NodeMacro(specs){
      NodeMacro.superclass.apply(this, arguments);
    }
    prototype.init_defaults = (function(){
      function init_defaults(opts, args){
        var res, a, _i, _len;
        res = "";
        for (_i = 0, _len = args.length; _i < _len; ++_i) {
          a = args[_i];
          if (a.default_value) {
            res += a.name + " = (" + a.name + " === undefined) ? (" + a.default_value + ") : " + a.name + ";";
          }
        }
        return res;
      }
      return init_defaults;
    }());
    prototype.compile = (function(){
      function compile(opts, ctx){
        var args, function_name, backup, argcode, argendcode, a, res, _ref, _i, _len;
        _ref = parse_macro(this.contents, ctx), args = _ref.args, function_name = _ref.function_name;
        args.push({
          name: "caller",
          default_value: "(function(){ return \"\"; })"
        });
        backup = [];
        argcode = [];
        argendcode = [];
        for (_i = 0, _len = args.length; _i < _len; ++_i) {
          a = args[_i];
          backup.push("__" + a.name + " = " + a.name);
          argcode.push("$$." + a.name + " = " + a.name);
          argendcode.push("if (__" + a.name + " !== undefined) $$." + a.name + " = __" + a.name + ";");
        }
        if (args) {
          backup = "var " + backup.join(",") + ";";
          argcode = argcode.join(",") + ";";
          argendcode = argendcode.join(" ");
        }
        res = "function " + function_name + "(" + (function(){
          var _i, _ref, _len, _results = [];
          for (_i = 0, _len = (_ref = args).length; _i < _len; ++_i) {
            a = _ref[_i];
            _results.push(a.name);
          }
          return _results;
        }()).join(", ") + ") {\n    var _res = '';\n    " + this.init_defaults(opts, args) + "\n    " + backup + "\n    " + argcode + "\n    " + this.child_code(opts, ctx) + "\n    " + argendcode + "\n    return _res;\n}\n$$." + function_name + " = " + function_name + ";";
        return res;
      }
      return compile;
    }());
    return NodeMacro;
  }(NodeTagContainer));
  NodeCall = (function(_super){
    NodeCall.displayName = 'NodeCall';
    var prototype = __extends(NodeCall, _super).prototype, constructor = NodeCall;
    NodeCall.tag = 'call';
    NodeCall.until = 'endcall';
    NodeCall.call_re = /([a-zA-Z$_0-9]+)\s*\(\s*(.*)\s*\)\s*/;
    function NodeCall(specs){
      NodeCall.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var m, fname, args, a, callerblock, thecall, _res, _i, _ref, _len;
        m = this.contents.match(NodeCall.call_re);
        if (!m) {
          throw new Error("call tag is malformed");
        }
        fname = m[1];
        args = m[2];
        _res = [];
        for (_i = 0, _len = (_ref = args.split(",")).length; _i < _len; ++_i) {
          a = _ref[_i];
          if (a) {
            _res.push(a.replace(/^\s*|\s*$/g, ''));
          }
        }
        args = _res;
        callerblock = "(function () {\n    var _res = '';\n    " + this.child_code(opts, ctx) + "\n    return _res;\n})";
        args.push(callerblock);
        args = args.join(", ");
        thecall = "_res += " + fname + "(" + args + ");";
        return thecall;
      }
      return compile;
    }());
    return NodeCall;
  }(NodeTagContainer));
  /**
   *
   */
  NodeBlock = (function(_super){
    NodeBlock.displayName = 'NodeBlock';
    var prototype = __extends(NodeBlock, _super).prototype, constructor = NodeBlock;
    NodeBlock.tag = 'block';
    NodeBlock.until = 'endblock';
    function NodeBlock(specs){
      NodeBlock.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var block_name, indent;
        block_name = parse_block(this.contents, ctx);
        opts.blocks == null && (opts.blocks = {});
        indent = opts.__indent__;
        opts.__indent__ = 4;
        opts.blocks[block_name] = this.child_code(opts, ctx) + "";
        opts.__indent__ = indent;
        return "// Adding the current block as the super of the currently defined block with the same name.\nif (_b['" + block_name + "'] !== undefined) {\n    _b['" + block_name + "'] = (function (original) {\n        return function ($$) {\n            var prevsuper = $$.super;\n            $$.super = function() {\n                return __block_" + block_name + "($$);\n            };\n            var res = original($$);\n            if (prevsuper !== undefined)\n                $$.super = prevsuper;\n            return res; };\n    })(_b['" + block_name + "']);\n} else { _b['" + block_name + "'] = __block_" + block_name + "; }\nif (__extends__ === null) _res += _b['" + block_name + "']($$);\n";
      }
      return compile;
    }());
    return NodeBlock;
  }(NodeTagContainer));
  NodeElse = (function(_super){
    NodeElse.displayName = 'NodeElse';
    var prototype = __extends(NodeElse, _super).prototype, constructor = NodeElse;
    NodeElse.tag = 'else';
    NodeElse.parse = (function(){
      function parse(pd){
        return new NodeElse({
          child_node: pd.child_node
        });
      }
      return parse;
    }());
    function NodeElse(specs){
      NodeElse.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var res;
        res = "} else {";
        this.ind(opts);
        res += this.child_code(opts, ctx) + "";
        return res;
      }
      return compile;
    }());
    return NodeElse;
  }(NodeTagContainer));
  NodeElseIf = (function(_super){
    NodeElseIf.displayName = 'NodeElseIf';
    var prototype = __extends(NodeElseIf, _super).prototype, constructor = NodeElseIf;
    NodeElseIf.tag = 'elseif';
    NodeElseIf.inside = {
      elseif: NodeElseIf,
      'else': NodeElse
    };
    function NodeElseIf(specs){
      NodeElseIf.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var res;
        if (!trim(this.contents)) {
          throw new Error("{% elseif <condition> %}: condition can't be empty.");
        }
        res = "} else if (" + make_expression(this.contents, ctx) + ") {";
        this.ind(opts);
        res += this.child_code(opts, ctx) + "";
        return res;
      }
      return compile;
    }());
    return NodeElseIf;
  }(NodeTagContainer));
  NodeElIf = (function(_super){
    NodeElIf.displayName = 'NodeElIf';
    var prototype = __extends(NodeElIf, _super).prototype, constructor = NodeElIf;
    NodeElIf.tag = 'elif';
    NodeElIf.inside = {
      elif: NodeElIf,
      'else': NodeElse
    };
    function NodeElIf(specs){
      NodeElIf.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var res;
        if (!trim(this.contents)) {
          throw new Error("{% elif <condition> %}: condition can't be empty.");
        }
        res = "} else if (" + make_expression(this.contents, ctx) + ") {";
        this.ind(opts);
        res += this.child_code(opts, ctx) + "";
        return res;
      }
      return compile;
    }());
    return NodeElIf;
  }(NodeTagContainer));
  NodeIf = (function(_super){
    NodeIf.displayName = 'NodeIf';
    var prototype = __extends(NodeIf, _super).prototype, constructor = NodeIf;
    NodeIf.tag = 'if';
    NodeIf.until = 'endif';
    NodeIf.inside = {
      'else': NodeElse,
      elseif: NodeElseIf,
      elif: NodeElIf
    };
    function NodeIf(specs){
      NodeIf.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var res;
        if (!trim(this.contents)) {
          throw new Error("{% if <condition> %}: condition can't be empty.");
        }
        res = "if (" + make_expression(this.contents, ctx) + ") {\n    " + this.child_code(opts, ctx) + "\n    " + NodeIf.superclass.prototype.compile.call(this, this, opts, ctx) + "\n}";
        return res;
      }
      return compile;
    }());
    return NodeIf;
  }(NodeTagContainer));
  NodeElseFor = (function(_super){
    NodeElseFor.displayName = 'NodeElseFor';
    var prototype = __extends(NodeElseFor, _super).prototype, constructor = NodeElseFor;
    NodeElseFor.tag = 'else';
    NodeElseFor.until = 'endfor';
    function NodeElseFor(specs){
      NodeElseFor.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var res;
        res = this.child_code(opts, ctx) + "";
        return res;
      }
      return compile;
    }());
    return NodeElseFor;
  }(NodeTagContainer));
  NodeContinue = (function(_super){
    NodeContinue.displayName = 'NodeContinue';
    var prototype = __extends(NodeContinue, _super).prototype, constructor = NodeContinue;
    NodeContinue.tag = 'continue';
    function NodeContinue(specs){
      NodeContinue.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        return "continue;";
      }
      return compile;
    }());
    return NodeContinue;
  }(NodeTag));
  NodeBreak = (function(_super){
    NodeBreak.displayName = 'NodeBreak';
    var prototype = __extends(NodeBreak, _super).prototype, constructor = NodeBreak;
    NodeBreak.tag = 'break';
    function NodeBreak(specs){
      NodeBreak.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        return "break;";
      }
      return compile;
    }());
    return NodeBreak;
  }(NodeTag));
  NodeFor = (function(_super){
    NodeFor.displayName = 'NodeFor';
    var prototype = __extends(NodeFor, _super).prototype, constructor = NodeFor;
    NodeFor.tag = 'for';
    NodeFor.until = 'endfor';
    NodeFor.inside = {
      'else': NodeElseFor
    };
    function NodeFor(specs){
      NodeFor.superclass.apply(this, arguments);
    }
    prototype.compile = (function(){
      function compile(opts, ctx){
        var key, value, condition, k, v, l, _ref;
        _ref = parse_for(this.contents, ctx), key = _ref.key, value = _ref.value, condition = _ref.condition;
        opts.forblock = true;
        if (!value) {
          value = '';
        }
        k = "$$['" + key + "']";
        v = value ? "$$['" + value + "']" : "null";
        l = "$$.loop";
        return "(function() {\nvar _fref = " + condition + " || [], _prev_loop = " + l + ", _prev_key = " + k + ", _prev_value = " + v + ", k = null, v = null, i = 0, l = 0, x = null, last_v = null, last_k = null;\n" + l + " = { };\nif (_fref instanceof Array) {\n    l = _fref.length;\n    for (i = 0; i < l; i++) {\n        " + l + ".last = (i == l - 1);\n        " + l + ".first = (i == 0);\n        " + l + ".index0 = i;\n        " + l + ".index = i + 1;\n        " + k + " = _fref[i]; " + (value ? v + " = i;" : "") + "\n        " + this.child_code(opts, ctx) + "\n    }\n} else {\n    " + l + " = { first: true, last: false };\n    l = Object.keys(_fref).length;\n\n    for (x in _fref) { if (_fref.hasOwnProperty(x)) {\n        " + l + ".last = (i == l - 1);\n        " + k + " = x;\n        " + (value ? v + " = _fref[x];" : "") + "\n        " + l + ".index0 = i;\n        " + l + ".index = i + 1;\n        " + this.child_code(opts, ctx) + "\n        i += 1;\n        " + l + ".first = false;\n    } }\n}\nif (" + l + ".index == undefined) {\n    " + NodeFor.superclass.prototype.compile.call(this, this, opts, ctx) + "\n}\n" + l + " = _prev_loop; " + k + " = _prev_key; " + (value ? v + " = _prev_value;" : "") + "\n})();";
      }
      return compile;
    }());
    return NodeFor;
  }(NodeTagContainer));
  exports.NodeIf = NodeIf;
  exports.NodeDo = NodeDo;
  exports.NodeLet = NodeLet;
  exports.NodeFor = NodeFor;
  exports.NodeMacro = NodeMacro;
  exports.NodeList = NodeList;
  exports.NodeBasic = NodeBasic;
  exports.NodePrint = NodePrint;
  exports.NodeComment = NodeComment;
  exports.NodeExtends = NodeExtends;
  exports.NodeInclude = NodeInclude;
  exports.NodeImport = NodeImport;
  exports.NodeFromImport = NodeFromImport;
  exports.NodeContinue = NodeContinue;
  exports.NodeCall = NodeCall;
  exports.default_nodes = {
    'if': NodeIf,
    'do': NodeDo,
    'let': NodeLet,
    'for': NodeFor,
    'macro': NodeMacro,
    'extends': NodeExtends,
    'block': NodeBlock,
    'include': NodeInclude,
    'from': NodeFromImport,
    'import': NodeImport,
    'abspath': NodeAbspath,
    'continue': NodeContinue,
    'break': NodeBreak,
    'call': NodeCall
  };
  function __repeatString(str, n){
    for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
    return r;
  }
  function __extends(sub, sup){
    function ctor(){} ctor.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new ctor).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
}).call(this);

});

jrequire.define("/expression.js", function (require, module, exports, __dirname, __filename) {
module.exports = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "ASSIGN": parse_ASSIGN,
        "BINARY_OPERATOR": parse_BINARY_OPERATOR,
        "COLON": parse_COLON,
        "COMMA": parse_COMMA,
        "DOT": parse_DOT,
        "IN": parse_IN,
        "LBRACE": parse_LBRACE,
        "LBRACKET": parse_LBRACKET,
        "LPAREN": parse_LPAREN,
        "MINUS": parse_MINUS,
        "NEW": parse_NEW,
        "PIPE": parse_PIPE,
        "POST_UNARY_OPERATOR": parse_POST_UNARY_OPERATOR,
        "QUESTION_MARK": parse_QUESTION_MARK,
        "RBRACE": parse_RBRACE,
        "RBRACKET": parse_RBRACKET,
        "RPAREN": parse_RPAREN,
        "SPECIAL": parse_SPECIAL,
        "TEXT_BINARY_OPERATOR": parse_TEXT_BINARY_OPERATOR,
        "UNARY_OPERATOR": parse_UNARY_OPERATOR,
        "array_index": parse_array_index,
        "array_indexing_rec": parse_array_indexing_rec,
        "array_literal": parse_array_literal,
        "binary": parse_binary,
        "call_arguments": parse_call_arguments,
        "double_quoted_contents": parse_double_quoted_contents,
        "double_quoted_terminal": parse_double_quoted_terminal,
        "expression": parse_expression,
        "filter_expression": parse_filter_expression,
        "filter_identifier": parse_filter_identifier,
        "filter_literal": parse_filter_literal,
        "filter_name": parse_filter_name,
        "filter_rec": parse_filter_rec,
        "function_call": parse_function_call,
        "function_call_rec": parse_function_call_rec,
        "ic_member_expression": parse_ic_member_expression,
        "ic_member_expression_rec": parse_ic_member_expression_rec,
        "ic_primary_expression": parse_ic_primary_expression,
        "identifier": parse_identifier,
        "macro_argument": parse_macro_argument,
        "macro_call_arguments": parse_macro_call_arguments,
        "member_expression": parse_member_expression,
        "number": parse_number,
        "object_argument": parse_object_argument,
        "object_arguments": parse_object_arguments,
        "object_literal": parse_object_literal,
        "ooc_primary_expression": parse_ooc_primary_expression,
        "operation": parse_operation,
        "post_unary": parse_post_unary,
        "primary_expression": parse_primary_expression,
        "primary_identifier": parse_primary_identifier,
        "regexp": parse_regexp,
        "regexp_contents": parse_regexp_contents,
        "regexp_terminal": parse_regexp_terminal,
        "single_quoted_contents": parse_single_quoted_contents,
        "single_quoted_terminal": parse_single_quoted_terminal,
        "space": parse_space,
        "special_value": parse_special_value,
        "string": parse_string,
        "tag_block": parse_tag_block,
        "tag_for": parse_tag_for,
        "tag_import": parse_tag_import,
        "tag_let": parse_tag_let,
        "tag_macro": parse_tag_macro,
        "ternary_operator": parse_ternary_operator,
        "unary": parse_unary,
        "variable_list": parse_variable_list
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "expression";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_expression() {
        var cacheKey = 'expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        var result12 = parse_space();
        var result8 = result12 !== null ? result12 : '';
        if (result8 !== null) {
          var result9 = parse_ternary_operator();
          if (result9 !== null) {
            var result11 = parse_space();
            var result10 = result11 !== null ? result11 : '';
            if (result10 !== null) {
              var result6 = [result8, result9, result10];
            } else {
              var result6 = null;
              pos = savedPos2;
            }
          } else {
            var result6 = null;
            pos = savedPos2;
          }
        } else {
          var result6 = null;
          pos = savedPos2;
        }
        var result7 = result6 !== null
          ? (function(t) {
            return t;
          })(result6[1])
          : null;
        if (result7 !== null) {
          var result5 = result7;
        } else {
          var result5 = null;
          pos = savedPos1;
        }
        if (result5 !== null) {
          var result0 = result5;
        } else {
          var savedPos0 = pos;
          var result4 = parse_space();
          var result2 = result4 !== null ? result4 : '';
          var result3 = result2 !== null
            ? (function() {
              return '';
            })()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ternary_operator() {
        var cacheKey = 'ternary_operator@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_operation();
        if (result5 !== null) {
          var result6 = parse_QUESTION_MARK();
          if (result6 !== null) {
            var result7 = parse_ternary_operator();
            if (result7 !== null) {
              var result8 = parse_COLON();
              if (result8 !== null) {
                var result9 = parse_ternary_operator();
                if (result9 !== null) {
                  var result3 = [result5, result6, result7, result8, result9];
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(p, e1, e2) {
            return "(" + p + " ? " + e1 + " : " + e2 + ")";
          })(result3[0], result3[2], result3[4])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_operation();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_operation() {
        var cacheKey = 'operation@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos6 = pos;
        var savedPos7 = pos;
        var result22 = parse_unary();
        if (result22 !== null) {
          var result23 = parse_expression();
          if (result23 !== null) {
            var result20 = [result22, result23];
          } else {
            var result20 = null;
            pos = savedPos7;
          }
        } else {
          var result20 = null;
          pos = savedPos7;
        }
        var result21 = result20 !== null
          ? (function(u, p) {
            return u + "" + p;
          })(result20[0], result20[1])
          : null;
        if (result21 !== null) {
          var result19 = result21;
        } else {
          var result19 = null;
          pos = savedPos6;
        }
        if (result19 !== null) {
          var result0 = result19;
        } else {
          var savedPos4 = pos;
          var savedPos5 = pos;
          var result16 = parse_filter_expression();
          if (result16 !== null) {
            var result17 = parse_binary();
            if (result17 !== null) {
              var result18 = parse_operation();
              if (result18 !== null) {
                var result14 = [result16, result17, result18];
              } else {
                var result14 = null;
                pos = savedPos5;
              }
            } else {
              var result14 = null;
              pos = savedPos5;
            }
          } else {
            var result14 = null;
            pos = savedPos5;
          }
          var result15 = result14 !== null
            ? (function(p, o, s) {
              return p + "" + o + s;
            })(result14[0], result14[1], result14[2])
            : null;
          if (result15 !== null) {
            var result13 = result15;
          } else {
            var result13 = null;
            pos = savedPos4;
          }
          if (result13 !== null) {
            var result0 = result13;
          } else {
            var savedPos2 = pos;
            var savedPos3 = pos;
            var result10 = parse_filter_expression();
            if (result10 !== null) {
              var result11 = parse_IN();
              if (result11 !== null) {
                var result12 = parse_operation();
                if (result12 !== null) {
                  var result8 = [result10, result11, result12];
                } else {
                  var result8 = null;
                  pos = savedPos3;
                }
              } else {
                var result8 = null;
                pos = savedPos3;
              }
            } else {
              var result8 = null;
              pos = savedPos3;
            }
            var result9 = result8 !== null
              ? (function(p, s) {
                return "__in(" + p + ", " + s + ")";
              })(result8[0], result8[2])
              : null;
            if (result9 !== null) {
              var result7 = result9;
            } else {
              var result7 = null;
              pos = savedPos2;
            }
            if (result7 !== null) {
              var result0 = result7;
            } else {
              var savedPos0 = pos;
              var savedPos1 = pos;
              var result5 = parse_filter_expression();
              if (result5 !== null) {
                var result6 = parse_post_unary();
                if (result6 !== null) {
                  var result3 = [result5, result6];
                } else {
                  var result3 = null;
                  pos = savedPos1;
                }
              } else {
                var result3 = null;
                pos = savedPos1;
              }
              var result4 = result3 !== null
                ? (function(p, o) {
                  return p + "" + o;
                })(result3[0], result3[1])
                : null;
              if (result4 !== null) {
                var result2 = result4;
              } else {
                var result2 = null;
                pos = savedPos0;
              }
              if (result2 !== null) {
                var result0 = result2;
              } else {
                var result1 = parse_filter_expression();
                if (result1 !== null) {
                  var result0 = result1;
                } else {
                  var result0 = null;;
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_filter_expression() {
        var cacheKey = 'filter_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_member_expression();
        if (result5 !== null) {
          var result6 = parse_filter_rec();
          if (result6 !== null) {
            var result3 = [result5, result6];
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(expr, f) {
            return make_filter(expr, f);
          })(result3[0], result3[1])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_member_expression();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_filter_rec() {
        var cacheKey = 'filter_rec@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_filter_literal();
        if (result5 !== null) {
          var result6 = parse_filter_rec();
          if (result6 !== null) {
            var result3 = [result5, result6];
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(lit, r) {
            return [].concat(lit, r);
          })(result3[0], result3[1])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_filter_literal();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_filter_literal() {
        var cacheKey = 'filter_literal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result9 = parse_PIPE();
        if (result9 !== null) {
          var result10 = parse_filter_name();
          if (result10 !== null) {
            var result11 = parse_LPAREN();
            if (result11 !== null) {
              var result14 = parse_call_arguments();
              var result12 = result14 !== null ? result14 : '';
              if (result12 !== null) {
                var result13 = parse_RPAREN();
                if (result13 !== null) {
                  var result7 = [result9, result10, result11, result12, result13];
                } else {
                  var result7 = null;
                  pos = savedPos3;
                }
              } else {
                var result7 = null;
                pos = savedPos3;
              }
            } else {
              var result7 = null;
              pos = savedPos3;
            }
          } else {
            var result7 = null;
            pos = savedPos3;
          }
        } else {
          var result7 = null;
          pos = savedPos3;
        }
        var result8 = result7 !== null
          ? (function(name, args) {
            return [{
            name: name,
            args: args
          }];
          })(result7[1], result7[3])
          : null;
        if (result8 !== null) {
          var result6 = result8;
        } else {
          var result6 = null;
          pos = savedPos2;
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result4 = parse_PIPE();
          if (result4 !== null) {
            var result5 = parse_filter_name();
            if (result5 !== null) {
              var result2 = [result4, result5];
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(name) {
              return [{
              name: name
            }];
            })(result2[1])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_call_arguments() {
        var cacheKey = 'call_arguments@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_expression();
        if (result5 !== null) {
          var result6 = parse_COMMA();
          if (result6 !== null) {
            var result7 = parse_call_arguments();
            if (result7 !== null) {
              var result3 = [result5, result6, result7];
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(e, c) {
            return e + ", " + c;
          })(result3[0], result3[2])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_expression();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_function_call() {
        var cacheKey = 'function_call@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_LPAREN();
        if (result3 !== null) {
          var result6 = parse_call_arguments();
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            var result5 = parse_RPAREN();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(args) {
            return "(" + args + ")";
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_function_call_rec() {
        var cacheKey = 'function_call_rec@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos4 = pos;
        var savedPos5 = pos;
        var result16 = parse_function_call();
        if (result16 !== null) {
          var result17 = parse_function_call_rec();
          if (result17 !== null) {
            var result14 = [result16, result17];
          } else {
            var result14 = null;
            pos = savedPos5;
          }
        } else {
          var result14 = null;
          pos = savedPos5;
        }
        var result15 = result14 !== null
          ? (function(f, rec) {
            return f + rec;
          })(result14[0], result14[1])
          : null;
        if (result15 !== null) {
          var result13 = result15;
        } else {
          var result13 = null;
          pos = savedPos4;
        }
        if (result13 !== null) {
          var result0 = result13;
        } else {
          var savedPos2 = pos;
          var savedPos3 = pos;
          var result10 = parse_function_call();
          if (result10 !== null) {
            var result11 = parse_DOT();
            if (result11 !== null) {
              var result12 = parse_ic_member_expression_rec();
              if (result12 !== null) {
                var result8 = [result10, result11, result12];
              } else {
                var result8 = null;
                pos = savedPos3;
              }
            } else {
              var result8 = null;
              pos = savedPos3;
            }
          } else {
            var result8 = null;
            pos = savedPos3;
          }
          var result9 = result8 !== null
            ? (function(f, member) {
              return f + "." + member;
            })(result8[0], result8[2])
            : null;
          if (result9 !== null) {
            var result7 = result9;
          } else {
            var result7 = null;
            pos = savedPos2;
          }
          if (result7 !== null) {
            var result0 = result7;
          } else {
            var savedPos0 = pos;
            var savedPos1 = pos;
            var result5 = parse_function_call();
            if (result5 !== null) {
              var result6 = parse_array_indexing_rec();
              if (result6 !== null) {
                var result3 = [result5, result6];
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
            var result4 = result3 !== null
              ? (function(f, a) {
                return f + a;
              })(result3[0], result3[1])
              : null;
            if (result4 !== null) {
              var result2 = result4;
            } else {
              var result2 = null;
              pos = savedPos0;
            }
            if (result2 !== null) {
              var result0 = result2;
            } else {
              var result1 = parse_function_call();
              if (result1 !== null) {
                var result0 = result1;
              } else {
                var result0 = null;;
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_array_index() {
        var cacheKey = 'array_index@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_LBRACKET();
        if (result3 !== null) {
          var result4 = parse_call_arguments();
          if (result4 !== null) {
            var result5 = parse_RBRACKET();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(contents) {
            return "[" + contents + "]";
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_array_indexing_rec() {
        var cacheKey = 'array_indexing_rec@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos4 = pos;
        var savedPos5 = pos;
        var result16 = parse_array_index();
        if (result16 !== null) {
          var result17 = parse_array_indexing_rec();
          if (result17 !== null) {
            var result14 = [result16, result17];
          } else {
            var result14 = null;
            pos = savedPos5;
          }
        } else {
          var result14 = null;
          pos = savedPos5;
        }
        var result15 = result14 !== null
          ? (function(a, rec) {
            return a + rec;
          })(result14[0], result14[1])
          : null;
        if (result15 !== null) {
          var result13 = result15;
        } else {
          var result13 = null;
          pos = savedPos4;
        }
        if (result13 !== null) {
          var result0 = result13;
        } else {
          var savedPos2 = pos;
          var savedPos3 = pos;
          var result10 = parse_array_index();
          if (result10 !== null) {
            var result11 = parse_DOT();
            if (result11 !== null) {
              var result12 = parse_ic_member_expression_rec();
              if (result12 !== null) {
                var result8 = [result10, result11, result12];
              } else {
                var result8 = null;
                pos = savedPos3;
              }
            } else {
              var result8 = null;
              pos = savedPos3;
            }
          } else {
            var result8 = null;
            pos = savedPos3;
          }
          var result9 = result8 !== null
            ? (function(a, member) {
              return a + "." + member;
            })(result8[0], result8[2])
            : null;
          if (result9 !== null) {
            var result7 = result9;
          } else {
            var result7 = null;
            pos = savedPos2;
          }
          if (result7 !== null) {
            var result0 = result7;
          } else {
            var savedPos0 = pos;
            var savedPos1 = pos;
            var result5 = parse_array_index();
            if (result5 !== null) {
              var result6 = parse_function_call_rec();
              if (result6 !== null) {
                var result3 = [result5, result6];
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
            var result4 = result3 !== null
              ? (function(a, f) {
                return a + f;
              })(result3[0], result3[1])
              : null;
            if (result4 !== null) {
              var result2 = result4;
            } else {
              var result2 = null;
              pos = savedPos0;
            }
            if (result2 !== null) {
              var result0 = result2;
            } else {
              var result1 = parse_array_index();
              if (result1 !== null) {
                var result0 = result1;
              } else {
                var result0 = null;;
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_member_expression() {
        var cacheKey = 'member_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos4 = pos;
        var savedPos5 = pos;
        var result15 = parse_ooc_primary_expression();
        if (result15 !== null) {
          var result16 = parse_DOT();
          if (result16 !== null) {
            var result17 = parse_ic_member_expression_rec();
            if (result17 !== null) {
              var result13 = [result15, result16, result17];
            } else {
              var result13 = null;
              pos = savedPos5;
            }
          } else {
            var result13 = null;
            pos = savedPos5;
          }
        } else {
          var result13 = null;
          pos = savedPos5;
        }
        var result14 = result13 !== null
          ? (function(p, i) {
            return p + "." + i;
          })(result13[0], result13[2])
          : null;
        if (result14 !== null) {
          var result12 = result14;
        } else {
          var result12 = null;
          pos = savedPos4;
        }
        if (result12 !== null) {
          var result0 = result12;
        } else {
          var savedPos2 = pos;
          var savedPos3 = pos;
          var result10 = parse_ooc_primary_expression();
          if (result10 !== null) {
            var result11 = parse_array_indexing_rec();
            if (result11 !== null) {
              var result8 = [result10, result11];
            } else {
              var result8 = null;
              pos = savedPos3;
            }
          } else {
            var result8 = null;
            pos = savedPos3;
          }
          var result9 = result8 !== null
            ? (function(p, arr) {
              return p + "" + arr;
            })(result8[0], result8[1])
            : null;
          if (result9 !== null) {
            var result7 = result9;
          } else {
            var result7 = null;
            pos = savedPos2;
          }
          if (result7 !== null) {
            var result0 = result7;
          } else {
            var savedPos0 = pos;
            var savedPos1 = pos;
            var result5 = parse_ooc_primary_expression();
            if (result5 !== null) {
              var result6 = parse_function_call_rec();
              if (result6 !== null) {
                var result3 = [result5, result6];
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
            var result4 = result3 !== null
              ? (function(expr, f) {
                return expr + "" + f;
              })(result3[0], result3[1])
              : null;
            if (result4 !== null) {
              var result2 = result4;
            } else {
              var result2 = null;
              pos = savedPos0;
            }
            if (result2 !== null) {
              var result0 = result2;
            } else {
              var result1 = parse_ooc_primary_expression();
              if (result1 !== null) {
                var result0 = result1;
              } else {
                var result0 = null;;
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ooc_primary_expression() {
        var cacheKey = 'ooc_primary_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result4 = parse_primary_expression();
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          var result2 = parse_primary_identifier();
          var result3 = result2 !== null
            ? (function(i) {
              return i;
            })(result2)
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ic_member_expression_rec() {
        var cacheKey = 'ic_member_expression_rec@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_ic_member_expression();
        if (result5 !== null) {
          var result6 = parse_DOT();
          if (result6 !== null) {
            var result7 = parse_ic_member_expression_rec();
            if (result7 !== null) {
              var result3 = [result5, result6, result7];
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(xp, rec) {
            return xp + "" + rec;
          })(result3[0], result3[2])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_ic_member_expression();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ic_member_expression() {
        var cacheKey = 'ic_member_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos4 = pos;
        var savedPos5 = pos;
        var result15 = parse_ic_primary_expression();
        if (result15 !== null) {
          var result16 = parse_DOT();
          if (result16 !== null) {
            var result17 = parse_ic_member_expression();
            if (result17 !== null) {
              var result13 = [result15, result16, result17];
            } else {
              var result13 = null;
              pos = savedPos5;
            }
          } else {
            var result13 = null;
            pos = savedPos5;
          }
        } else {
          var result13 = null;
          pos = savedPos5;
        }
        var result14 = result13 !== null
          ? (function(p, i) {
            return p + "." + i;
          })(result13[0], result13[2])
          : null;
        if (result14 !== null) {
          var result12 = result14;
        } else {
          var result12 = null;
          pos = savedPos4;
        }
        if (result12 !== null) {
          var result0 = result12;
        } else {
          var savedPos2 = pos;
          var savedPos3 = pos;
          var result10 = parse_ic_primary_expression();
          if (result10 !== null) {
            var result11 = parse_array_indexing_rec();
            if (result11 !== null) {
              var result8 = [result10, result11];
            } else {
              var result8 = null;
              pos = savedPos3;
            }
          } else {
            var result8 = null;
            pos = savedPos3;
          }
          var result9 = result8 !== null
            ? (function(p, arr) {
              return p + "" + arr;
            })(result8[0], result8[1])
            : null;
          if (result9 !== null) {
            var result7 = result9;
          } else {
            var result7 = null;
            pos = savedPos2;
          }
          if (result7 !== null) {
            var result0 = result7;
          } else {
            var savedPos0 = pos;
            var savedPos1 = pos;
            var result5 = parse_ic_primary_expression();
            if (result5 !== null) {
              var result6 = parse_function_call_rec();
              if (result6 !== null) {
                var result3 = [result5, result6];
              } else {
                var result3 = null;
                pos = savedPos1;
              }
            } else {
              var result3 = null;
              pos = savedPos1;
            }
            var result4 = result3 !== null
              ? (function(expr, f) {
                return expr + "" + f;
              })(result3[0], result3[1])
              : null;
            if (result4 !== null) {
              var result2 = result4;
            } else {
              var result2 = null;
              pos = savedPos0;
            }
            if (result2 !== null) {
              var result0 = result2;
            } else {
              var result1 = parse_ic_primary_expression();
              if (result1 !== null) {
                var result0 = result1;
              } else {
                var result0 = null;;
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ic_primary_expression() {
        var cacheKey = 'ic_primary_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result4 = parse_primary_expression();
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          var result2 = parse_identifier();
          var result3 = result2 !== null
            ? (function(i) {
              return i;
            })(result2)
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_primary_expression() {
        var cacheKey = 'primary_expression@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result12 = parse_special_value();
        if (result12 !== null) {
          var result0 = result12;
        } else {
          var result11 = parse_object_literal();
          if (result11 !== null) {
            var result0 = result11;
          } else {
            var result10 = parse_array_literal();
            if (result10 !== null) {
              var result0 = result10;
            } else {
              var result9 = parse_number();
              if (result9 !== null) {
                var result0 = result9;
              } else {
                var result8 = parse_string();
                if (result8 !== null) {
                  var result0 = result8;
                } else {
                  var result7 = parse_regexp();
                  if (result7 !== null) {
                    var result0 = result7;
                  } else {
                    var savedPos0 = pos;
                    var savedPos1 = pos;
                    var result4 = parse_LPAREN();
                    if (result4 !== null) {
                      var result5 = parse_expression();
                      if (result5 !== null) {
                        var result6 = parse_RPAREN();
                        if (result6 !== null) {
                          var result2 = [result4, result5, result6];
                        } else {
                          var result2 = null;
                          pos = savedPos1;
                        }
                      } else {
                        var result2 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result2 = null;
                      pos = savedPos1;
                    }
                    var result3 = result2 !== null
                      ? (function(e) {
                        return "(" + e + ")";
                      })(result2[1])
                      : null;
                    if (result3 !== null) {
                      var result1 = result3;
                    } else {
                      var result1 = null;
                      pos = savedPos0;
                    }
                    if (result1 !== null) {
                      var result0 = result1;
                    } else {
                      var result0 = null;;
                    };
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_object_literal() {
        var cacheKey = 'object_literal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_LBRACE();
        if (result3 !== null) {
          var result6 = parse_object_arguments();
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            var result5 = parse_RBRACE();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(args) {
            return "{" + (args ? " " + args + " " : '') + "}";
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_object_arguments() {
        var cacheKey = 'object_arguments@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_object_argument();
        if (result5 !== null) {
          var result6 = parse_COMMA();
          if (result6 !== null) {
            var result7 = parse_object_arguments();
            if (result7 !== null) {
              var result3 = [result5, result6, result7];
            } else {
              var result3 = null;
              pos = savedPos1;
            }
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(a, args) {
            return a + ", " + args;
          })(result3[0], result3[2])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_object_argument();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_object_argument() {
        var cacheKey = 'object_argument@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result10 = parse_identifier();
        if (result10 !== null) {
          var result11 = parse_COLON();
          if (result11 !== null) {
            var result12 = parse_expression();
            if (result12 !== null) {
              var result8 = [result10, result11, result12];
            } else {
              var result8 = null;
              pos = savedPos3;
            }
          } else {
            var result8 = null;
            pos = savedPos3;
          }
        } else {
          var result8 = null;
          pos = savedPos3;
        }
        var result9 = result8 !== null
          ? (function(i, e) {
            return i + ": " + e;
          })(result8[0], result8[2])
          : null;
        if (result9 !== null) {
          var result7 = result9;
        } else {
          var result7 = null;
          pos = savedPos2;
        }
        if (result7 !== null) {
          var result0 = result7;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result4 = parse_string();
          if (result4 !== null) {
            var result5 = parse_COLON();
            if (result5 !== null) {
              var result6 = parse_expression();
              if (result6 !== null) {
                var result2 = [result4, result5, result6];
              } else {
                var result2 = null;
                pos = savedPos1;
              }
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(s, e) {
              return s + ": " + e;
            })(result2[0], result2[2])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_array_literal() {
        var cacheKey = 'array_literal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_LBRACKET();
        if (result3 !== null) {
          var result6 = parse_call_arguments();
          var result4 = result6 !== null ? result6 : '';
          if (result4 !== null) {
            var result5 = parse_RBRACKET();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(args) {
            return "[" + args + "]";
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_identifier() {
        var cacheKey = 'identifier@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos).match(/^[$a-zA-Z_]/) !== null) {
          var result3 = input.charAt(pos);
          pos++;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("[$a-zA-Z_]");
          }
        }
        if (result3 !== null) {
          var result4 = [];
          if (input.substr(pos).match(/^[$a-zA-Z_0-9]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[$a-zA-Z_0-9]");
            }
          }
          while (result5 !== null) {
            result4.push(result5);
            if (input.substr(pos).match(/^[$a-zA-Z_0-9]/) !== null) {
              var result5 = input.charAt(pos);
              pos++;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("[$a-zA-Z_0-9]");
              }
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first, rest) {
            var ident, __indexOf = [].indexOf || function(x){
            var i = -1, l = this.length;
            while (++i < l) if (this.hasOwnProperty(i) && this[i] === x) return i;
            return -1;
          };
          ident = first + "" + (rest ? rest.join("") : "");
          if (__indexOf.call(reserved_words, ident) >= 0) {
            throw new Error("can't use '" + ident + "' as a variable name");
          }
          return ident;
          })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_primary_identifier() {
        var cacheKey = 'primary_identifier@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = parse_identifier();
        var result2 = result1 !== null
          ? (function(ident) {
            return "$$." + ident;
          })(result1)
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_filter_name() {
        var cacheKey = 'filter_name@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = parse_filter_identifier();
        var result2 = result1 !== null
          ? (function(ident) {
            var ident, filters, id, _i, _ref, _ref2, _len;
          ident = '$' + ident;
          filters = compilation_ctx.filters;
          if (!filters[ident]) {
            throw new Error("No such filter: " + ident);
          }
          if (filters[ident].alias) {
            ident = filters[ident].alias;
          }
          for (_i = 0, _len = (_ref = (_ref2 = filters[ident].dependencies) != null
            ? _ref2
            : []).length; _i < _len; ++_i) {
            id = _ref[_i];
            compilation_ctx.filters_used[id] = filters[id];
          }
          compilation_ctx.filters_used[ident] = filters[ident];
          return ident;
          })(result1)
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_filter_identifier() {
        var cacheKey = 'filter_identifier@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos).match(/^[_a-zA-Z]/) !== null) {
          var result3 = input.charAt(pos);
          pos++;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("[_a-zA-Z]");
          }
        }
        if (result3 !== null) {
          var result4 = [];
          if (input.substr(pos).match(/^[_a-zA-Z0-9]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[_a-zA-Z0-9]");
            }
          }
          while (result5 !== null) {
            result4.push(result5);
            if (input.substr(pos).match(/^[_a-zA-Z0-9]/) !== null) {
              var result5 = input.charAt(pos);
              pos++;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("[_a-zA-Z0-9]");
              }
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first, next) {
            return first + "" + (next ? next.join("") : "");
          })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_number() {
        var cacheKey = 'number@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos3 = pos;
        var savedPos4 = pos;
        if (input.substr(pos).match(/^[0-9]/) !== null) {
          var result17 = input.charAt(pos);
          pos++;
        } else {
          var result17 = null;
          if (reportMatchFailures) {
            matchFailed("[0-9]");
          }
        }
        if (result17 !== null) {
          var result13 = [];
          while (result17 !== null) {
            result13.push(result17);
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result17 = input.charAt(pos);
              pos++;
            } else {
              var result17 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
          }
        } else {
          var result13 = null;
        }
        if (result13 !== null) {
          if (input.substr(pos, 1) === ".") {
            var result14 = ".";
            pos += 1;
          } else {
            var result14 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result14 !== null) {
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result16 = input.charAt(pos);
              pos++;
            } else {
              var result16 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
            if (result16 !== null) {
              var result15 = [];
              while (result16 !== null) {
                result15.push(result16);
                if (input.substr(pos).match(/^[0-9]/) !== null) {
                  var result16 = input.charAt(pos);
                  pos++;
                } else {
                  var result16 = null;
                  if (reportMatchFailures) {
                    matchFailed("[0-9]");
                  }
                }
              }
            } else {
              var result15 = null;
            }
            if (result15 !== null) {
              var result11 = [result13, result14, result15];
            } else {
              var result11 = null;
              pos = savedPos4;
            }
          } else {
            var result11 = null;
            pos = savedPos4;
          }
        } else {
          var result11 = null;
          pos = savedPos4;
        }
        var result12 = result11 !== null
          ? (function(f, d, s) {
            return f.join("") + "" + d + s.join("");
          })(result11[0], result11[1], result11[2])
          : null;
        if (result12 !== null) {
          var result10 = result12;
        } else {
          var result10 = null;
          pos = savedPos3;
        }
        if (result10 !== null) {
          var result0 = result10;
        } else {
          var savedPos2 = pos;
          if (input.substr(pos).match(/^[0-9]/) !== null) {
            var result9 = input.charAt(pos);
            pos++;
          } else {
            var result9 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9]");
            }
          }
          if (result9 !== null) {
            var result7 = [];
            while (result9 !== null) {
              result7.push(result9);
              if (input.substr(pos).match(/^[0-9]/) !== null) {
                var result9 = input.charAt(pos);
                pos++;
              } else {
                var result9 = null;
                if (reportMatchFailures) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            var result7 = null;
          }
          var result8 = result7 !== null
            ? (function(n) {
              return n.join("") + "";
            })(result7)
            : null;
          if (result8 !== null) {
            var result6 = result8;
          } else {
            var result6 = null;
            pos = savedPos2;
          }
          if (result6 !== null) {
            var result0 = result6;
          } else {
            var savedPos0 = pos;
            var savedPos1 = pos;
            var result4 = parse_MINUS();
            if (result4 !== null) {
              var result5 = parse_number();
              if (result5 !== null) {
                var result2 = [result4, result5];
              } else {
                var result2 = null;
                pos = savedPos1;
              }
            } else {
              var result2 = null;
              pos = savedPos1;
            }
            var result3 = result2 !== null
              ? (function(n) {
                return "-" + n;
              })(result2[1])
              : null;
            if (result3 !== null) {
              var result1 = result3;
            } else {
              var result1 = null;
              pos = savedPos0;
            }
            if (result1 !== null) {
              var result0 = result1;
            } else {
              var result0 = null;;
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_string() {
        var cacheKey = 'string@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result22 = parse_space();
        var result15 = result22 !== null ? result22 : '';
        if (result15 !== null) {
          if (input.substr(pos, 1) === "'") {
            var result16 = "'";
            pos += 1;
          } else {
            var result16 = null;
            if (reportMatchFailures) {
              matchFailed("\"'\"");
            }
          }
          if (result16 !== null) {
            var result21 = parse_single_quoted_contents();
            var result17 = result21 !== null ? result21 : '';
            if (result17 !== null) {
              if (input.substr(pos, 1) === "'") {
                var result18 = "'";
                pos += 1;
              } else {
                var result18 = null;
                if (reportMatchFailures) {
                  matchFailed("\"'\"");
                }
              }
              if (result18 !== null) {
                var result20 = parse_space();
                var result19 = result20 !== null ? result20 : '';
                if (result19 !== null) {
                  var result13 = [result15, result16, result17, result18, result19];
                } else {
                  var result13 = null;
                  pos = savedPos3;
                }
              } else {
                var result13 = null;
                pos = savedPos3;
              }
            } else {
              var result13 = null;
              pos = savedPos3;
            }
          } else {
            var result13 = null;
            pos = savedPos3;
          }
        } else {
          var result13 = null;
          pos = savedPos3;
        }
        var result14 = result13 !== null
          ? (function(sglcnt) {
            return "'" + sglcnt + "'";
          })(result13[2])
          : null;
        if (result14 !== null) {
          var result12 = result14;
        } else {
          var result12 = null;
          pos = savedPos2;
        }
        if (result12 !== null) {
          var result0 = result12;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result11 = parse_space();
          var result4 = result11 !== null ? result11 : '';
          if (result4 !== null) {
            if (input.substr(pos, 1) === "\"") {
              var result5 = "\"";
              pos += 1;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result5 !== null) {
              var result10 = parse_double_quoted_contents();
              var result6 = result10 !== null ? result10 : '';
              if (result6 !== null) {
                if (input.substr(pos, 1) === "\"") {
                  var result7 = "\"";
                  pos += 1;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"\\\"\"");
                  }
                }
                if (result7 !== null) {
                  var result9 = parse_space();
                  var result8 = result9 !== null ? result9 : '';
                  if (result8 !== null) {
                    var result2 = [result4, result5, result6, result7, result8];
                  } else {
                    var result2 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result2 = null;
                  pos = savedPos1;
                }
              } else {
                var result2 = null;
                pos = savedPos1;
              }
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(dblcnt) {
              return "\"" + dblcnt + "\"";
            })(result2[2])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_regexp() {
        var cacheKey = 'regexp@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result13 = parse_space();
        var result3 = result13 !== null ? result13 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "/") {
            var result4 = "/";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"/\"");
            }
          }
          if (result4 !== null) {
            var result12 = parse_regexp_contents();
            var result5 = result12 !== null ? result12 : '';
            if (result5 !== null) {
              if (input.substr(pos, 1) === "/") {
                var result6 = "/";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"/\"");
                }
              }
              if (result6 !== null) {
                if (input.substr(pos).match(/^[a-z]/) !== null) {
                  var result11 = input.charAt(pos);
                  pos++;
                } else {
                  var result11 = null;
                  if (reportMatchFailures) {
                    matchFailed("[a-z]");
                  }
                }
                if (result11 !== null) {
                  var result10 = [];
                  while (result11 !== null) {
                    result10.push(result11);
                    if (input.substr(pos).match(/^[a-z]/) !== null) {
                      var result11 = input.charAt(pos);
                      pos++;
                    } else {
                      var result11 = null;
                      if (reportMatchFailures) {
                        matchFailed("[a-z]");
                      }
                    }
                  }
                } else {
                  var result10 = null;
                }
                var result7 = result10 !== null ? result10 : '';
                if (result7 !== null) {
                  var result9 = parse_space();
                  var result8 = result9 !== null ? result9 : '';
                  if (result8 !== null) {
                    var result1 = [result3, result4, result5, result6, result7, result8];
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(regcnt, modifs) {
            return "/" + regcnt + "/" + (modifs ? modifs.join("") : "");
          })(result1[2], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_single_quoted_contents() {
        var cacheKey = 'single_quoted_contents@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_single_quoted_terminal();
        if (result5 !== null) {
          var result6 = parse_single_quoted_contents();
          if (result6 !== null) {
            var result3 = [result5, result6];
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(s1, s2) {
            return s1 + s2;
          })(result3[0], result3[1])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_single_quoted_terminal();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_single_quoted_terminal() {
        var cacheKey = 'single_quoted_terminal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "\\'") {
          var result2 = "\\'";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\\\'\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos).match(/^[^']/) !== null) {
            var result1 = input.charAt(pos);
            pos++;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("[^']");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_double_quoted_contents() {
        var cacheKey = 'double_quoted_contents@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_double_quoted_terminal();
        if (result5 !== null) {
          var result6 = parse_double_quoted_contents();
          if (result6 !== null) {
            var result3 = [result5, result6];
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(s1, s2) {
            return s1 + s2;
          })(result3[0], result3[1])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_double_quoted_terminal();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_double_quoted_terminal() {
        var cacheKey = 'double_quoted_terminal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "\\\"") {
          var result2 = "\\\"";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\\\\\\"\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos).match(/^[^"]/) !== null) {
            var result1 = input.charAt(pos);
            pos++;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("[^\"]");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_regexp_contents() {
        var cacheKey = 'regexp_contents@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_regexp_terminal();
        if (result5 !== null) {
          var result6 = parse_regexp_contents();
          if (result6 !== null) {
            var result3 = [result5, result6];
          } else {
            var result3 = null;
            pos = savedPos1;
          }
        } else {
          var result3 = null;
          pos = savedPos1;
        }
        var result4 = result3 !== null
          ? (function(s1, s2) {
            return s1 + s2;
          })(result3[0], result3[1])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos0;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result1 = parse_regexp_terminal();
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_regexp_terminal() {
        var cacheKey = 'regexp_terminal@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "\\/") {
          var result2 = "\\/";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\\\/\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos).match(/^[^\/]/) !== null) {
            var result1 = input.charAt(pos);
            pos++;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("[^\\/]");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_space() {
        var cacheKey = 'space@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        if (input.substr(pos).match(/^[	\n\r ]/) !== null) {
          var result3 = input.charAt(pos);
          pos++;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("[	\\n\\r ]");
          }
        }
        if (result3 !== null) {
          var result1 = [];
          while (result3 !== null) {
            result1.push(result3);
            if (input.substr(pos).match(/^[	\n\r ]/) !== null) {
              var result3 = input.charAt(pos);
              pos++;
            } else {
              var result3 = null;
              if (reportMatchFailures) {
                matchFailed("[	\\n\\r ]");
              }
            }
          }
        } else {
          var result1 = null;
        }
        var result2 = result1 !== null
          ? (function() {
            return " ";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_MINUS() {
        var cacheKey = 'MINUS@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "-") {
            var result4 = "-";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"-\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "-";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_COMMA() {
        var cacheKey = 'COMMA@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === ",") {
            var result4 = ",";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\",\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return ",";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_COLON() {
        var cacheKey = 'COLON@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === ":") {
            var result4 = ":";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\":\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return ":";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_QUESTION_MARK() {
        var cacheKey = 'QUESTION_MARK@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "?") {
            var result4 = "?";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"?\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "?";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_LPAREN() {
        var cacheKey = 'LPAREN@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "(") {
            var result4 = "(";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"(\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "(";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_RPAREN() {
        var cacheKey = 'RPAREN@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === ")") {
            var result4 = ")";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\")\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return ")";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_LBRACE() {
        var cacheKey = 'LBRACE@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "{") {
            var result4 = "{";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"{\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "\u007B";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_RBRACE() {
        var cacheKey = 'RBRACE@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "}") {
            var result4 = "}";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"}\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "\u007D";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_LBRACKET() {
        var cacheKey = 'LBRACKET@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "[") {
            var result4 = "[";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"[\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "[";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_RBRACKET() {
        var cacheKey = 'RBRACKET@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "]") {
            var result4 = "]";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"]\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "]";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_PIPE() {
        var cacheKey = 'PIPE@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result5 = parse_space();
        var result3 = result5 !== null ? result5 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "|") {
            var result4 = "|";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"|\"");
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "|";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_DOT() {
        var cacheKey = 'DOT@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === ".") {
            var result4 = ".";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return ".";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_IN() {
        var cacheKey = 'IN@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 2) === "in") {
            var result4 = "in";
            pos += 2;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"in\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return " in ";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_ASSIGN() {
        var cacheKey = 'ASSIGN@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 1) === "=") {
            var result4 = "=";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"=\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return " = ";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_unary() {
        var cacheKey = 'unary@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          var result4 = parse_UNARY_OPERATOR();
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(op) {
            return op + " ";
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_UNARY_OPERATOR() {
        var cacheKey = 'UNARY_OPERATOR@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 1) === "!") {
          var result11 = "!";
          pos += 1;
        } else {
          var result11 = null;
          if (reportMatchFailures) {
            matchFailed("\"!\"");
          }
        }
        if (result11 !== null) {
          var result0 = result11;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 3) === "not") {
            var result9 = "not";
            pos += 3;
          } else {
            var result9 = null;
            if (reportMatchFailures) {
              matchFailed("\"not\"");
            }
          }
          var result10 = result9 !== null
            ? (function() {
              return "!";
            })()
            : null;
          if (result10 !== null) {
            var result8 = result10;
          } else {
            var result8 = null;
            pos = savedPos0;
          }
          if (result8 !== null) {
            var result0 = result8;
          } else {
            if (input.substr(pos, 1) === "~") {
              var result7 = "~";
              pos += 1;
            } else {
              var result7 = null;
              if (reportMatchFailures) {
                matchFailed("\"~\"");
              }
            }
            if (result7 !== null) {
              var result0 = result7;
            } else {
              if (input.substr(pos, 2) === "++") {
                var result6 = "++";
                pos += 2;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"++\"");
                }
              }
              if (result6 !== null) {
                var result0 = result6;
              } else {
                if (input.substr(pos, 2) === "--") {
                  var result5 = "--";
                  pos += 2;
                } else {
                  var result5 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"--\"");
                  }
                }
                if (result5 !== null) {
                  var result0 = result5;
                } else {
                  if (input.substr(pos, 6) === "typeof") {
                    var result4 = "typeof";
                    pos += 6;
                  } else {
                    var result4 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"typeof\"");
                    }
                  }
                  if (result4 !== null) {
                    var result0 = result4;
                  } else {
                    if (input.substr(pos, 4) === "void") {
                      var result3 = "void";
                      pos += 4;
                    } else {
                      var result3 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"void\"");
                      }
                    }
                    if (result3 !== null) {
                      var result0 = result3;
                    } else {
                      if (input.substr(pos, 3) === "new") {
                        var result2 = "new";
                        pos += 3;
                      } else {
                        var result2 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"new\"");
                        }
                      }
                      if (result2 !== null) {
                        var result0 = result2;
                      } else {
                        if (input.substr(pos, 6) === "delete") {
                          var result1 = "delete";
                          pos += 6;
                        } else {
                          var result1 = null;
                          if (reportMatchFailures) {
                            matchFailed("\"delete\"");
                          }
                        }
                        if (result1 !== null) {
                          var result0 = result1;
                        } else {
                          var result0 = null;;
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_post_unary() {
        var cacheKey = 'post_unary@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          var result4 = parse_POST_UNARY_OPERATOR();
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(op) {
            return " " + op;
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_POST_UNARY_OPERATOR() {
        var cacheKey = 'POST_UNARY_OPERATOR@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 2) === "++") {
          var result2 = "++";
          pos += 2;
        } else {
          var result2 = null;
          if (reportMatchFailures) {
            matchFailed("\"++\"");
          }
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          if (input.substr(pos, 2) === "--") {
            var result1 = "--";
            pos += 2;
          } else {
            var result1 = null;
            if (reportMatchFailures) {
              matchFailed("\"--\"");
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_binary() {
        var cacheKey = 'binary@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result16 = parse_space();
        var result12 = result16 !== null ? result16 : '';
        if (result12 !== null) {
          var result13 = parse_TEXT_BINARY_OPERATOR();
          if (result13 !== null) {
            var result15 = parse_space();
            var result14 = result15 !== null ? result15 : '';
            if (result14 !== null) {
              var result10 = [result12, result13, result14];
            } else {
              var result10 = null;
              pos = savedPos3;
            }
          } else {
            var result10 = null;
            pos = savedPos3;
          }
        } else {
          var result10 = null;
          pos = savedPos3;
        }
        var result11 = result10 !== null
          ? (function(op) {
            return " " + op + " ";
          })(result10[1])
          : null;
        if (result11 !== null) {
          var result9 = result11;
        } else {
          var result9 = null;
          pos = savedPos2;
        }
        if (result9 !== null) {
          var result0 = result9;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result8 = parse_space();
          var result4 = result8 !== null ? result8 : '';
          if (result4 !== null) {
            var result5 = parse_BINARY_OPERATOR();
            if (result5 !== null) {
              var result7 = parse_space();
              var result6 = result7 !== null ? result7 : '';
              if (result6 !== null) {
                var result2 = [result4, result5, result6];
              } else {
                var result2 = null;
                pos = savedPos1;
              }
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(op) {
              return " " + op + " ";
            })(result2[1])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_TEXT_BINARY_OPERATOR() {
        var cacheKey = 'TEXT_BINARY_OPERATOR@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 10) === "instanceof") {
          var result7 = "instanceof";
          pos += 10;
        } else {
          var result7 = null;
          if (reportMatchFailures) {
            matchFailed("\"instanceof\"");
          }
        }
        if (result7 !== null) {
          var result0 = result7;
        } else {
          var savedPos1 = pos;
          if (input.substr(pos, 3) === "and") {
            var result5 = "and";
            pos += 3;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("\"and\"");
            }
          }
          var result6 = result5 !== null
            ? (function() {
              return "&&";
            })()
            : null;
          if (result6 !== null) {
            var result4 = result6;
          } else {
            var result4 = null;
            pos = savedPos1;
          }
          if (result4 !== null) {
            var result0 = result4;
          } else {
            var savedPos0 = pos;
            if (input.substr(pos, 2) === "or") {
              var result2 = "or";
              pos += 2;
            } else {
              var result2 = null;
              if (reportMatchFailures) {
                matchFailed("\"or\"");
              }
            }
            var result3 = result2 !== null
              ? (function() {
                return "||";
              })()
              : null;
            if (result3 !== null) {
              var result1 = result3;
            } else {
              var result1 = null;
              pos = savedPos0;
            }
            if (result1 !== null) {
              var result0 = result1;
            } else {
              var result0 = null;;
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_BINARY_OPERATOR() {
        var cacheKey = 'BINARY_OPERATOR@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 3) === ">>>") {
          var result28 = ">>>";
          pos += 3;
        } else {
          var result28 = null;
          if (reportMatchFailures) {
            matchFailed("\">>>\"");
          }
        }
        if (result28 !== null) {
          var result0 = result28;
        } else {
          if (input.substr(pos, 3) === "===") {
            var result27 = "===";
            pos += 3;
          } else {
            var result27 = null;
            if (reportMatchFailures) {
              matchFailed("\"===\"");
            }
          }
          if (result27 !== null) {
            var result0 = result27;
          } else {
            if (input.substr(pos, 3) === "!==") {
              var result26 = "!==";
              pos += 3;
            } else {
              var result26 = null;
              if (reportMatchFailures) {
                matchFailed("\"!==\"");
              }
            }
            if (result26 !== null) {
              var result0 = result26;
            } else {
              if (input.substr(pos, 2) === "==") {
                var result25 = "==";
                pos += 2;
              } else {
                var result25 = null;
                if (reportMatchFailures) {
                  matchFailed("\"==\"");
                }
              }
              if (result25 !== null) {
                var result0 = result25;
              } else {
                if (input.substr(pos, 2) === "!=") {
                  var result24 = "!=";
                  pos += 2;
                } else {
                  var result24 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"!=\"");
                  }
                }
                if (result24 !== null) {
                  var result0 = result24;
                } else {
                  if (input.substr(pos, 2) === ">=") {
                    var result23 = ">=";
                    pos += 2;
                  } else {
                    var result23 = null;
                    if (reportMatchFailures) {
                      matchFailed("\">=\"");
                    }
                  }
                  if (result23 !== null) {
                    var result0 = result23;
                  } else {
                    if (input.substr(pos, 2) === "<=") {
                      var result22 = "<=";
                      pos += 2;
                    } else {
                      var result22 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"<=\"");
                      }
                    }
                    if (result22 !== null) {
                      var result0 = result22;
                    } else {
                      if (input.substr(pos, 2) === "&&") {
                        var result21 = "&&";
                        pos += 2;
                      } else {
                        var result21 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"&&\"");
                        }
                      }
                      if (result21 !== null) {
                        var result0 = result21;
                      } else {
                        if (input.substr(pos, 2) === "||") {
                          var result20 = "||";
                          pos += 2;
                        } else {
                          var result20 = null;
                          if (reportMatchFailures) {
                            matchFailed("\"||\"");
                          }
                        }
                        if (result20 !== null) {
                          var result0 = result20;
                        } else {
                          if (input.substr(pos, 2) === "<<") {
                            var result19 = "<<";
                            pos += 2;
                          } else {
                            var result19 = null;
                            if (reportMatchFailures) {
                              matchFailed("\"<<\"");
                            }
                          }
                          if (result19 !== null) {
                            var result0 = result19;
                          } else {
                            if (input.substr(pos, 2) === ">>") {
                              var result18 = ">>";
                              pos += 2;
                            } else {
                              var result18 = null;
                              if (reportMatchFailures) {
                                matchFailed("\">>\"");
                              }
                            }
                            if (result18 !== null) {
                              var result0 = result18;
                            } else {
                              if (input.substr(pos, 2) === "+=") {
                                var result17 = "+=";
                                pos += 2;
                              } else {
                                var result17 = null;
                                if (reportMatchFailures) {
                                  matchFailed("\"+=\"");
                                }
                              }
                              if (result17 !== null) {
                                var result0 = result17;
                              } else {
                                if (input.substr(pos, 2) === "-=") {
                                  var result16 = "-=";
                                  pos += 2;
                                } else {
                                  var result16 = null;
                                  if (reportMatchFailures) {
                                    matchFailed("\"-=\"");
                                  }
                                }
                                if (result16 !== null) {
                                  var result0 = result16;
                                } else {
                                  if (input.substr(pos, 2) === "%=") {
                                    var result15 = "%=";
                                    pos += 2;
                                  } else {
                                    var result15 = null;
                                    if (reportMatchFailures) {
                                      matchFailed("\"%=\"");
                                    }
                                  }
                                  if (result15 !== null) {
                                    var result0 = result15;
                                  } else {
                                    if (input.substr(pos, 2) === "/=") {
                                      var result14 = "/=";
                                      pos += 2;
                                    } else {
                                      var result14 = null;
                                      if (reportMatchFailures) {
                                        matchFailed("\"/=\"");
                                      }
                                    }
                                    if (result14 !== null) {
                                      var result0 = result14;
                                    } else {
                                      if (input.substr(pos, 2) === "*=") {
                                        var result13 = "*=";
                                        pos += 2;
                                      } else {
                                        var result13 = null;
                                        if (reportMatchFailures) {
                                          matchFailed("\"*=\"");
                                        }
                                      }
                                      if (result13 !== null) {
                                        var result0 = result13;
                                      } else {
                                        if (input.substr(pos, 1) === "=") {
                                          var result12 = "=";
                                          pos += 1;
                                        } else {
                                          var result12 = null;
                                          if (reportMatchFailures) {
                                            matchFailed("\"=\"");
                                          }
                                        }
                                        if (result12 !== null) {
                                          var result0 = result12;
                                        } else {
                                          if (input.substr(pos, 1) === "|") {
                                            var result11 = "|";
                                            pos += 1;
                                          } else {
                                            var result11 = null;
                                            if (reportMatchFailures) {
                                              matchFailed("\"|\"");
                                            }
                                          }
                                          if (result11 !== null) {
                                            var result0 = result11;
                                          } else {
                                            if (input.substr(pos, 1) === "/") {
                                              var result10 = "/";
                                              pos += 1;
                                            } else {
                                              var result10 = null;
                                              if (reportMatchFailures) {
                                                matchFailed("\"/\"");
                                              }
                                            }
                                            if (result10 !== null) {
                                              var result0 = result10;
                                            } else {
                                              if (input.substr(pos, 1) === "^") {
                                                var result9 = "^";
                                                pos += 1;
                                              } else {
                                                var result9 = null;
                                                if (reportMatchFailures) {
                                                  matchFailed("\"^\"");
                                                }
                                              }
                                              if (result9 !== null) {
                                                var result0 = result9;
                                              } else {
                                                if (input.substr(pos, 1) === "&") {
                                                  var result8 = "&";
                                                  pos += 1;
                                                } else {
                                                  var result8 = null;
                                                  if (reportMatchFailures) {
                                                    matchFailed("\"&\"");
                                                  }
                                                }
                                                if (result8 !== null) {
                                                  var result0 = result8;
                                                } else {
                                                  if (input.substr(pos, 1) === "|") {
                                                    var result7 = "|";
                                                    pos += 1;
                                                  } else {
                                                    var result7 = null;
                                                    if (reportMatchFailures) {
                                                      matchFailed("\"|\"");
                                                    }
                                                  }
                                                  if (result7 !== null) {
                                                    var result0 = result7;
                                                  } else {
                                                    if (input.substr(pos, 1) === "+") {
                                                      var result6 = "+";
                                                      pos += 1;
                                                    } else {
                                                      var result6 = null;
                                                      if (reportMatchFailures) {
                                                        matchFailed("\"+\"");
                                                      }
                                                    }
                                                    if (result6 !== null) {
                                                      var result0 = result6;
                                                    } else {
                                                      if (input.substr(pos, 1) === ">") {
                                                        var result5 = ">";
                                                        pos += 1;
                                                      } else {
                                                        var result5 = null;
                                                        if (reportMatchFailures) {
                                                          matchFailed("\">\"");
                                                        }
                                                      }
                                                      if (result5 !== null) {
                                                        var result0 = result5;
                                                      } else {
                                                        if (input.substr(pos, 1) === "<") {
                                                          var result4 = "<";
                                                          pos += 1;
                                                        } else {
                                                          var result4 = null;
                                                          if (reportMatchFailures) {
                                                            matchFailed("\"<\"");
                                                          }
                                                        }
                                                        if (result4 !== null) {
                                                          var result0 = result4;
                                                        } else {
                                                          if (input.substr(pos, 1) === "%") {
                                                            var result3 = "%";
                                                            pos += 1;
                                                          } else {
                                                            var result3 = null;
                                                            if (reportMatchFailures) {
                                                              matchFailed("\"%\"");
                                                            }
                                                          }
                                                          if (result3 !== null) {
                                                            var result0 = result3;
                                                          } else {
                                                            if (input.substr(pos, 1) === "-") {
                                                              var result2 = "-";
                                                              pos += 1;
                                                            } else {
                                                              var result2 = null;
                                                              if (reportMatchFailures) {
                                                                matchFailed("\"-\"");
                                                              }
                                                            }
                                                            if (result2 !== null) {
                                                              var result0 = result2;
                                                            } else {
                                                              if (input.substr(pos, 1) === "*") {
                                                                var result1 = "*";
                                                                pos += 1;
                                                              } else {
                                                                var result1 = null;
                                                                if (reportMatchFailures) {
                                                                  matchFailed("\"*\"");
                                                                }
                                                              }
                                                              if (result1 !== null) {
                                                                var result0 = result1;
                                                              } else {
                                                                var result0 = null;;
                                                              };
                                                            };
                                                          };
                                                        };
                                                      };
                                                    };
                                                  };
                                                };
                                              };
                                            };
                                          };
                                        };
                                      };
                                    };
                                  };
                                };
                              };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_NEW() {
        var cacheKey = 'NEW@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          if (input.substr(pos, 3) === "new") {
            var result4 = "new";
            pos += 3;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"new\"");
            }
          }
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function() {
            return "new";
          })()
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_special_value() {
        var cacheKey = 'special_value@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result7 = parse_space();
        var result3 = result7 !== null ? result7 : '';
        if (result3 !== null) {
          var result4 = parse_SPECIAL();
          if (result4 !== null) {
            var result6 = parse_space();
            var result5 = result6 !== null ? result6 : '';
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(s) {
            return s;
          })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_SPECIAL() {
        var cacheKey = 'SPECIAL@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos, 5) === "false") {
          var result6 = "false";
          pos += 5;
        } else {
          var result6 = null;
          if (reportMatchFailures) {
            matchFailed("\"false\"");
          }
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          if (input.substr(pos, 4) === "true") {
            var result5 = "true";
            pos += 4;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("\"true\"");
            }
          }
          if (result5 !== null) {
            var result0 = result5;
          } else {
            if (input.substr(pos, 4) === "this") {
              var result4 = "this";
              pos += 4;
            } else {
              var result4 = null;
              if (reportMatchFailures) {
                matchFailed("\"this\"");
              }
            }
            if (result4 !== null) {
              var result0 = result4;
            } else {
              if (input.substr(pos, 4) === "void") {
                var result3 = "void";
                pos += 4;
              } else {
                var result3 = null;
                if (reportMatchFailures) {
                  matchFailed("\"void\"");
                }
              }
              if (result3 !== null) {
                var result0 = result3;
              } else {
                if (input.substr(pos, 4) === "null") {
                  var result2 = "null";
                  pos += 4;
                } else {
                  var result2 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"null\"");
                  }
                }
                if (result2 !== null) {
                  var result0 = result2;
                } else {
                  if (input.substr(pos, 9) === "undefined") {
                    var result1 = "undefined";
                    pos += 9;
                  } else {
                    var result1 = null;
                    if (reportMatchFailures) {
                      matchFailed("\"undefined\"");
                    }
                  }
                  if (result1 !== null) {
                    var result0 = result1;
                  } else {
                    var result0 = null;;
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_tag_for() {
        var cacheKey = 'tag_for@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        var result12 = parse_identifier();
        if (result12 !== null) {
          var result13 = parse_IN();
          if (result13 !== null) {
            var result14 = parse_expression();
            if (result14 !== null) {
              var result10 = [result12, result13, result14];
            } else {
              var result10 = null;
              pos = savedPos3;
            }
          } else {
            var result10 = null;
            pos = savedPos3;
          }
        } else {
          var result10 = null;
          pos = savedPos3;
        }
        var result11 = result10 !== null
          ? (function(key, exp) {
            return {
            key: key,
            condition: exp
          };
          })(result10[0], result10[2])
          : null;
        if (result11 !== null) {
          var result9 = result11;
        } else {
          var result9 = null;
          pos = savedPos2;
        }
        if (result9 !== null) {
          var result0 = result9;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result4 = parse_identifier();
          if (result4 !== null) {
            var result5 = parse_COMMA();
            if (result5 !== null) {
              var result6 = parse_identifier();
              if (result6 !== null) {
                var result7 = parse_IN();
                if (result7 !== null) {
                  var result8 = parse_expression();
                  if (result8 !== null) {
                    var result2 = [result4, result5, result6, result7, result8];
                  } else {
                    var result2 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result2 = null;
                  pos = savedPos1;
                }
              } else {
                var result2 = null;
                pos = savedPos1;
              }
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(key, value, exp) {
              return {
              key: key,
              value: value,
              condition: exp
            };
            })(result2[0], result2[2], result2[4])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_tag_let() {
        var cacheKey = 'tag_let@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_identifier();
        if (result3 !== null) {
          var result4 = parse_ASSIGN();
          if (result4 !== null) {
            var result5 = parse_expression();
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(variable_name, expression) {
            return {
            variable_name: variable_name,
            expression: expression
          };
          })(result1[0], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_tag_macro() {
        var cacheKey = 'tag_macro@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_identifier();
        if (result3 !== null) {
          var result4 = parse_LPAREN();
          if (result4 !== null) {
            var result7 = parse_macro_call_arguments();
            var result5 = result7 !== null ? result7 : '';
            if (result5 !== null) {
              var result6 = parse_RPAREN();
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(function_name, args) {
            return {
            function_name: function_name,
            args: args == '' ? [] : args
          };
          })(result1[0], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_macro_call_arguments() {
        var cacheKey = 'macro_call_arguments@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_macro_argument();
        if (result3 !== null) {
          var result4 = [];
          var savedPos2 = pos;
          var savedPos3 = pos;
          var result8 = parse_COMMA();
          if (result8 !== null) {
            var result9 = parse_macro_argument();
            if (result9 !== null) {
              var result6 = [result8, result9];
            } else {
              var result6 = null;
              pos = savedPos3;
            }
          } else {
            var result6 = null;
            pos = savedPos3;
          }
          var result7 = result6 !== null
            ? (function(arg) { return arg; })(result6[1])
            : null;
          if (result7 !== null) {
            var result5 = result7;
          } else {
            var result5 = null;
            pos = savedPos2;
          }
          while (result5 !== null) {
            result4.push(result5);
            var savedPos2 = pos;
            var savedPos3 = pos;
            var result8 = parse_COMMA();
            if (result8 !== null) {
              var result9 = parse_macro_argument();
              if (result9 !== null) {
                var result6 = [result8, result9];
              } else {
                var result6 = null;
                pos = savedPos3;
              }
            } else {
              var result6 = null;
              pos = savedPos3;
            }
            var result7 = result6 !== null
              ? (function(arg) { return arg; })(result6[1])
              : null;
            if (result7 !== null) {
              var result5 = result7;
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first, other_args) {
            var arg, res;
          res = [first].concat((function(){
            var _i, _ref, _len, _results = [];
            for (_i = 0, _len = (_ref = other_args).length; _i < _len; ++_i) {
              arg = _ref[_i];
              _results.push(arg);
            }
            return _results;
          }()));
          return res;
          })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_macro_argument() {
        var cacheKey = 'macro_argument@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        var result7 = parse_identifier();
        if (result7 !== null) {
          var result8 = parse_ASSIGN();
          if (result8 !== null) {
            var result9 = parse_expression();
            if (result9 !== null) {
              var result5 = [result7, result8, result9];
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(name, exp) {
            return {
            name: name,
            default_value: exp
          };
          })(result5[0], result5[2])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          var result2 = parse_identifier();
          var result3 = result2 !== null
            ? (function(name) {
              return {
              name: name
            };
            })(result2)
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_tag_block() {
        var cacheKey = 'tag_block@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result9 = parse_space();
        var result3 = result9 !== null ? result9 : '';
        if (result3 !== null) {
          if (input.substr(pos).match(/^[a-zA-Z_]/) !== null) {
            var result4 = input.charAt(pos);
            pos++;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("[a-zA-Z_]");
            }
          }
          if (result4 !== null) {
            var result5 = [];
            if (input.substr(pos).match(/^[\-a-zA-Z0-9_]/) !== null) {
              var result8 = input.charAt(pos);
              pos++;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed("[\\-a-zA-Z0-9_]");
              }
            }
            while (result8 !== null) {
              result5.push(result8);
              if (input.substr(pos).match(/^[\-a-zA-Z0-9_]/) !== null) {
                var result8 = input.charAt(pos);
                pos++;
              } else {
                var result8 = null;
                if (reportMatchFailures) {
                  matchFailed("[\\-a-zA-Z0-9_]");
                }
              }
            }
            if (result5 !== null) {
              var result7 = parse_space();
              var result6 = result7 !== null ? result7 : '';
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first_letter, next_letters) {
            return first_letter + "" + (next_letters ? next_letters.join("") : '');
          })(result1[1], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_tag_import() {
        var cacheKey = 'tag_import@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos3 = pos;
        var savedPos4 = pos;
        var result20 = parse_expression();
        if (result20 !== null) {
          var result32 = parse_space();
          var result21 = result32 !== null ? result32 : '';
          if (result21 !== null) {
            if (input.substr(pos, 6) === "import") {
              var result22 = "import";
              pos += 6;
            } else {
              var result22 = null;
              if (reportMatchFailures) {
                matchFailed("\"import\"");
              }
            }
            if (result22 !== null) {
              var result31 = parse_space();
              var result23 = result31 !== null ? result31 : '';
              if (result23 !== null) {
                var result24 = parse_variable_list();
                if (result24 !== null) {
                  var savedPos5 = pos;
                  var result27 = parse_space();
                  if (result27 !== null) {
                    if (input.substr(pos, 4) === "with") {
                      var result28 = "with";
                      pos += 4;
                    } else {
                      var result28 = null;
                      if (reportMatchFailures) {
                        matchFailed("\"with\"");
                      }
                    }
                    if (result28 !== null) {
                      var result29 = parse_space();
                      if (result29 !== null) {
                        if (input.substr(pos, 7) === "context") {
                          var result30 = "context";
                          pos += 7;
                        } else {
                          var result30 = null;
                          if (reportMatchFailures) {
                            matchFailed("\"context\"");
                          }
                        }
                        if (result30 !== null) {
                          var result26 = [result27, result28, result29, result30];
                        } else {
                          var result26 = null;
                          pos = savedPos5;
                        }
                      } else {
                        var result26 = null;
                        pos = savedPos5;
                      }
                    } else {
                      var result26 = null;
                      pos = savedPos5;
                    }
                  } else {
                    var result26 = null;
                    pos = savedPos5;
                  }
                  var result25 = result26 !== null ? result26 : '';
                  if (result25 !== null) {
                    var result18 = [result20, result21, result22, result23, result24, result25];
                  } else {
                    var result18 = null;
                    pos = savedPos4;
                  }
                } else {
                  var result18 = null;
                  pos = savedPos4;
                }
              } else {
                var result18 = null;
                pos = savedPos4;
              }
            } else {
              var result18 = null;
              pos = savedPos4;
            }
          } else {
            var result18 = null;
            pos = savedPos4;
          }
        } else {
          var result18 = null;
          pos = savedPos4;
        }
        var result19 = result18 !== null
          ? (function(exp, args, ctx) {
            return {
            template: exp,
            variables: args,
            with_context: ctx !== ""
          };
          })(result18[0], result18[4], result18[5])
          : null;
        if (result19 !== null) {
          var result17 = result19;
        } else {
          var result17 = null;
          pos = savedPos3;
        }
        if (result17 !== null) {
          var result0 = result17;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          var result4 = parse_expression();
          if (result4 !== null) {
            var result16 = parse_space();
            var result5 = result16 !== null ? result16 : '';
            if (result5 !== null) {
              if (input.substr(pos, 2) === "as") {
                var result6 = "as";
                pos += 2;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"as\"");
                }
              }
              if (result6 !== null) {
                var result15 = parse_space();
                var result7 = result15 !== null ? result15 : '';
                if (result7 !== null) {
                  var result8 = parse_identifier();
                  if (result8 !== null) {
                    var savedPos2 = pos;
                    var result11 = parse_space();
                    if (result11 !== null) {
                      if (input.substr(pos, 4) === "with") {
                        var result12 = "with";
                        pos += 4;
                      } else {
                        var result12 = null;
                        if (reportMatchFailures) {
                          matchFailed("\"with\"");
                        }
                      }
                      if (result12 !== null) {
                        var result13 = parse_space();
                        if (result13 !== null) {
                          if (input.substr(pos, 7) === "context") {
                            var result14 = "context";
                            pos += 7;
                          } else {
                            var result14 = null;
                            if (reportMatchFailures) {
                              matchFailed("\"context\"");
                            }
                          }
                          if (result14 !== null) {
                            var result10 = [result11, result12, result13, result14];
                          } else {
                            var result10 = null;
                            pos = savedPos2;
                          }
                        } else {
                          var result10 = null;
                          pos = savedPos2;
                        }
                      } else {
                        var result10 = null;
                        pos = savedPos2;
                      }
                    } else {
                      var result10 = null;
                      pos = savedPos2;
                    }
                    var result9 = result10 !== null ? result10 : '';
                    if (result9 !== null) {
                      var result2 = [result4, result5, result6, result7, result8, result9];
                    } else {
                      var result2 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result2 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result2 = null;
                  pos = savedPos1;
                }
              } else {
                var result2 = null;
                pos = savedPos1;
              }
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(exp, id, ctx) {
              return {
              template: exp,
              as_name: id,
              with_context: ctx !== ""
            };
            })(result2[0], result2[4], result2[5])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_variable_list() {
        var cacheKey = 'variable_list@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        var result7 = parse_identifier();
        if (result7 !== null) {
          var result8 = parse_COMMA();
          if (result8 !== null) {
            var result9 = parse_variable_list();
            if (result9 !== null) {
              var result5 = [result7, result8, result9];
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(id, list) {
            list.push(id);
          return list;
          })(result5[0], result5[2])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          var result2 = parse_identifier();
          var result3 = result2 !== null
            ? (function(id) {
              return [id];
            })(result2)
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
    var compilation_ctx, make_filter, reserved_words, _ref;
      
  compilation_ctx = (_ref = arguments[2]) != null
      
    ? _ref
      
    : {};
      
  compilation_ctx.filters == null && (compilation_ctx.filters = {});
      
  compilation_ctx.filters_used == null && (compilation_ctx.filters_used = {});
      
  make_filter = function(expression, filters){
      
    var res, f, args, _i, _len;
      
    res = expression;
      
    for (_i = 0, _len = filters.length; _i < _len; ++_i) {
      
      f = filters[_i];
      
      args = "";
      
      if (f.args) {
      
        args = ", " + f.args;
      
      }
      
      res = f.name + ".call($$," + res + args + ")";
      
    }
      
    return res;
      
  };
      
  reserved_words = ["abstract", "as", "boolean", "break", "byte", "case", "catch", "char", "class", "continue", "const", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "is", "long", "namespace", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "use", "var", "void", "volatile", "while", "with"];
      
  
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})(); var _parse = module.exports.parse; module.exports.parse = function (input, startRule, options) {if (startRule instanceof Object) { options = startRule; startRule = undefined; }return _parse (input, startRule, options);};
});

jrequire.define("/module_template.js", function (require, module, exports, __dirname, __filename) {
var _require = jrequire;
var require = (function (_require) {
    return function (mod) { 
        if ((typeof mod === "object") && (mod.render != null))
            return mod;
        return jrequire(mod);
    };
})(_require);
var __last_ctx__ = null;

var __indexOf = [].indexOf || function(x) {
    for (var i = this.length - 1; i >= 0; i--)
        if (this[i] === x) return i;
};

if (!Object.keys) Object.keys = function(o){
 if (o !== Object(o))
      throw new TypeError('Object.keys called on non-object');
 var ret=[],p;
 for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
 return ret;
}

function __in(obj, container){
    if (obj instanceof Array) {
      return __indexOf.call(container, obj) > -1;
    }
    return container[obj] != null;
  }function __import(obj, src){
    var own, key;
    own = {}.hasOwnProperty;
    for (key in src) {
      if (own.call(src, key)) {
        obj[key] = src[key];
      }
    }
    return obj;
  }
function $default(value, default_value){
        if (value == null) {
          return default_value;
        }
        return value;
      }

// RENDERING FUNCTION, EVERYTHING HAPPENS HERE.
function render ($$) {
    $$ = ($$ === undefined || $$ === null) ? {} : $$;
    var _ref = undefined;
    var _res = '';
    var _i = 0;
    var __extends__ = null;
        
    _res += 'var _require = function (mod) { \n    if ((typeof mod === \"object\") && (mod.render != null))\n        return mod;\n    return ';
    _res += ((_ref = $default.call($$,$$.require_exp, "require")) !== undefined && _ref !== null ? _ref : '').toString();
    _res += '(mod);\n};\nvar __last_ctx__ = null;\n\nvar __indexOf = [].indexOf || function(x) {\n    for (var i = this.length - 1; i >= 0; i--)\n        if (this[i] === x) return i;\n};\n\nif (!Object.keys) Object.keys = function(o){\n if (o !== Object(o))\n      throw new TypeError(\'Object.keys called on non-object\');\n var ret=[],p;\n for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);\n return ret;\n}\n\n';
    (function() {var _fref = $$.utils || [], _prev_loop = $$.loop, _prev_key = $$['fname'], _prev_value = $$['fn'], k = null, v = null, i = 0, l = 0, x = null, last_v = null, last_k = null;$$.loop = { };
    if (_fref instanceof Array) {l = _fref.length;for (i = 0; i < l; i++) {$$.loop.last = (i == l - 1);$$.loop.first = (i == 0);$$.loop.index0 = i;$$.loop.index = i + 1;$$['fname'] = _fref[i]; $$['fn'] = i;
    _res += ((_ref = $$.fn) !== undefined && _ref !== null ? _ref : '').toString();}
    } else {$$.loop = { first: true, last: false };l = Object.keys(_fref).length;for (x in _fref) { if (_fref.hasOwnProperty(x)) {$$.loop.last = (i == l - 1);$$['fname'] = x;$$['fn'] = _fref[x];$$.loop.index0 = i;$$.loop.index = i + 1;
    _res += ((_ref = $$.fn) !== undefined && _ref !== null ? _ref : '').toString();i += 1;$$.loop.first = false;} }}
    if ($$.loop.index == undefined) {}$$.loop = _prev_loop; $$['fname'] = _prev_key; $$['fn'] = _prev_value;})();
    _res += '\n';
    (function() {var _fref = $$.filters_used || [], _prev_loop = $$.loop, _prev_key = $$['fn_name'], _prev_value = $$['decl'], k = null, v = null, i = 0, l = 0, x = null, last_v = null, last_k = null;$$.loop = { };
    if (_fref instanceof Array) {l = _fref.length;for (i = 0; i < l; i++) {$$.loop.last = (i == l - 1);$$.loop.first = (i == 0);$$.loop.index0 = i;$$.loop.index = i + 1;$$['fn_name'] = _fref[i]; $$['decl'] = i;
    _res += ((_ref = $$.decl) !== undefined && _ref !== null ? _ref : '').toString();
    _res += '\n';}
    } else {$$.loop = { first: true, last: false };l = Object.keys(_fref).length;for (x in _fref) { if (_fref.hasOwnProperty(x)) {$$.loop.last = (i == l - 1);$$['fn_name'] = x;$$['decl'] = _fref[x];$$.loop.index0 = i;$$.loop.index = i + 1;
    _res += ((_ref = $$.decl) !== undefined && _ref !== null ? _ref : '').toString();
    _res += '\n';i += 1;$$.loop.first = false;} }}
    if ($$.loop.index == undefined) {}$$.loop = _prev_loop; $$['fn_name'] = _prev_key; $$['decl'] = _prev_value;})();
    _res += '\n';
    if ($$.blocks) {
        _res += '// Start Block Definitions\n\n';
        (function() {var _fref = $$.blocks || [], _prev_loop = $$.loop, _prev_key = $$['name'], _prev_value = $$['contents'], k = null, v = null, i = 0, l = 0, x = null, last_v = null, last_k = null;$$.loop = { };
        if (_fref instanceof Array) {l = _fref.length;for (i = 0; i < l; i++) {$$.loop.last = (i == l - 1);$$.loop.first = (i == 0);$$.loop.index0 = i;$$.loop.index = i + 1;$$['name'] = _fref[i]; $$['contents'] = i;
        _res += '// Block declaration of \"';
        _res += ((_ref = $$.name) !== undefined && _ref !== null ? _ref : '').toString();
        _res += '\"\nfunction __block_';
        _res += ((_ref = $$.name) !== undefined && _ref !== null ? _ref : '').toString();
        _res += ' ($$) {\n    var require = _require;\n    var _b = ($$ ? $$.__blocks__ : {});\n    var _res = \"\";\n    var __extends__ = null;\n    ';
        _res += ((_ref = $$.contents) !== undefined && _ref !== null ? _ref : '').toString();
        _res += '\n    return _res;\n}\n';}
        } else {$$.loop = { first: true, last: false };l = Object.keys(_fref).length;for (x in _fref) { if (_fref.hasOwnProperty(x)) {$$.loop.last = (i == l - 1);$$['name'] = x;$$['contents'] = _fref[x];$$.loop.index0 = i;$$.loop.index = i + 1;
        _res += '// Block declaration of \"';
        _res += ((_ref = $$.name) !== undefined && _ref !== null ? _ref : '').toString();
        _res += '\"\nfunction __block_';
        _res += ((_ref = $$.name) !== undefined && _ref !== null ? _ref : '').toString();
        _res += ' ($$) {\n    var require = _require;\n    var _b = ($$ ? $$.__blocks__ : {});\n    var _res = \"\";\n    var __extends__ = null;\n    ';
        _res += ((_ref = $$.contents) !== undefined && _ref !== null ? _ref : '').toString();
        _res += '\n    return _res;\n}\n';i += 1;$$.loop.first = false;} }}
        if ($$.loop.index == undefined) {}$$.loop = _prev_loop; $$['name'] = _prev_key; $$['contents'] = _prev_value;})();
        _res += '\n// End Block Definitions\n';
    }
    _res += '// RENDERING FUNCTION, EVERYTHING HAPPENS HERE.\nfunction render ($$) {\n    $$ = ($$ === undefined || $$ === null) ? {} : $$;\n    var _ref = undefined;\n    var _res = \'\';\n    var _i = 0;\n    var __extends__ = null;\n    var require = _require;\n    ';
    if ($$.blocks) {
        _res += '    var _b = null;\n    ($$.__blocks__ == null) && ($$.__blocks__ = {});\n    _b = $$.__blocks__;\n    var __newblocks__ = {};\n    var _block_iterator = null;\n    ';
    }
    _res += '    ';
    _res += ((_ref = $$.body) !== undefined && _ref !== null ? _ref : '').toString();
    _res += '\n    if (__extends__ !== undefined && __extends__ !== null) return __extends__.render($$);\n    return _res;\n}\nexports.render = render;\n\nfunction _cached_ctx () {\n    if (!__last_ctx__) {\n        __last_ctx__ = {};\n        render(__last_ctx__);\n    }\n    return __last_ctx__;\n}\nexports._cached_ctx = _cached_ctx;\n';
    if (__extends__ !== undefined && __extends__ !== null) return __extends__.render($$);
    return _res;
}
exports.render = render;

function _cached_ctx () {
    if (!__last_ctx__) {
        __last_ctx__ = {};
        render(__last_ctx__);
    }
    return __last_ctx__;
}
exports._cached_ctx = _cached_ctx;

});

jrequire.define("fs", function (require, module, exports, __dirname, __filename) {
// nothing to see here... no file methods for the browser

});

jrequire.define("/utils.js", function (require, module, exports, __dirname, __filename) {
(function(){
  function __in(obj, container){
    if (obj instanceof Array) {
      return __indexOf.call(container, obj) > -1;
    }
    return container[obj] != null;
  }
  function __import(obj, src){
    var own, key;
    own = {}.hasOwnProperty;
    for (key in src) {
      if (own.call(src, key)) {
        obj[key] = src[key];
      }
    }
    return obj;
  }
  exports.__in = __in;
  exports.__import = __import;
}).call(this);

});

jrequire.define("/filters.js", function (require, module, exports, __dirname, __filename) {
/**
    BEWARE : In this module, you can't have any jrequire() out of the functions, nor
    can you use all of coco's shortcuts : all of these are meant to be used with .toString() !
**/
(function(){
  __import(exports, {
    /**
     * Return the absolute value of the argument.
     */
    $abs: (function(){
      function $abs(num){
        if (num < 0) {
          return -num;
        }
        return num;
      }
      return $abs;
    }())
    /**
     * A filter that batches items. It works pretty much like slice just the other way round. 
     * It returns a list of lists with the given number of items. 
     * If you provide a second parameter this is used to fill missing items.
     */,
    $batch: (function(){
      function $batch(value, linecount, fill_with){
        var result, i, tmpres, j, _to, _to2;
        fill_with == null && (fill_with = null);
        result = [];
        for (i = 0, _to = value.length - 1; linecount < 0 ? i >= _to : i <= _to; i += linecount) {
          tmpres = [];
          for (j = 0, _to2 = linecount - 1; j <= _to2; ++j) {
            if (!(i + j in value)) {
              if (fill_with == null) {
                break;
              }
              tmpres.push(fill_with);
            } else {
              tmpres.push(value[i + j]);
            }
          }
          result.push(tmpres);
        }
        return result;
      }
      return $batch;
    }())
    /**
     *  Capitalize a string.
     */,
    $capitalize: (function(){
      function $capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      return $capitalize;
    }())
    /**
     *  Center monospaced text.
     */,
    $center: (function(){
      function $center(value, width){
        var leading;
        width == null && (width = 80);
        if (value.length >= width - 1) {
          return value;
        }
        leading = $repeat(" ", (width - value.length) / 2);
        return leading + value;
      }
      return $center;
    }()),
    $count: (function(){
      function $count(){
        return exports.length.apply(this, arguments);
      }
      return $count;
    }())
    /**
     *  Formats a date.
     *  TODO : not completely done.
     */,
    $date: (function(){
      function $date(d, format){
        var _pad;
        _pad = function(v){
          if (v < 10) {
            return "0" + v;
          }
          return v;
        };
        return format.replace(/%[%cdfHIjmMpSUwWxXyYzZ]/g, function(s){
          var y;
          switch (s[1]) {
          case 'c':
            return d.toLocaleDateString() + " " + d.toLocaleTimeString();
          case 'd':
            return _pad(d.getDate());
          case 'f':
            return d.getMilliseconds();
          case 'H':
            return _pad(d.getHours());
          case 'I':
            return _pad(d.getHours() % 12);
          case 'j':
            return '';
          case 'm':
            return _pad(d.getMonth() + 1);
          case 'M':
            return _pad(d.getMinutes());
          case 'p':
            return '';
          case 'S':
            return _pad(d.getSeconds());
          case 'U':
            return '';
          case 'w':
            return d.getDay();
          case 'W':
            return '';
          case 'x':
            return d.toLocaleDateString();
          case 'X':
            return d.toLocalTimeString();
          case 'y':
            y = d.getFullYear();
            return "" + _pad(Math.round((y / 100 - Math.floor(y / 100)) * 100));
          case 'Y':
            return d.getFullYear();
          case 'z':
            return d.getTimezoneOffset();
          case 'Z':
            try {
              return d.getTimezone();
            } catch (e) {
              return '';
            }
            break;
          case '%':
            return '%';
          default:
            return '#error';
          }
        });
      }
      return $date;
    }())
    /**
     *  Alias for default.
     */,
    $d: (function(){
      function $d(){
        return exports['default'].apply(this, arguments);
      }
      return $d;
    }())
    /**
     *  Return a default value.
     *  @param default_value: The value to return
     *      when `value` is null.
     */,
    $default: (function(){
      function $default(value, default_value){
        if (value == null) {
          return default_value;
        }
        return value;
      }
      return $default;
    }())
    /**
     *  Return a list with 
     */,
    $dictsort: (function(){
      function $dictsort(value, case_sensitive, _by){
        var result, k, v;
        case_sensitive == null && (case_sensitive = false);
        _by == null && (_by = 'key');
        result = [];
        for (k in value) {
          v = value[k];
          result.push([k, v]);
        }
        result.sort(function(a, b){
          var i;
          if (_by === 'value') {
            i = 1;
          } else {
            i = 0;
          }
          a = a[i];
          b = b[i];
          if (!case_sensitive) {
            a = a.toString().toUpperCase();
            b = b.toString().toUpperCase();
          }
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        return result;
      }
      return $dictsort;
    }()),
    $e: {
      alias: "$escape"
    },
    $escape: (function(){
      function $escape(value){
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
      }
      return $escape;
    }())
    /**
     *  Escape a string to make it Javascript/JSON compliant.
     */,
    $escapejs: (function(){
      function $escapejs(value){
        var _unicode;
        _unicode = function(s){
          s = s.charCodeAt(0).toString(16);
          return "\\u" + $repeat("0", 4 - s.length) + s;
        };
        return value.replace(/./g, function(s){
          if (('a' <= s && s <= 'z') || ('A' <= s && s <= 'Z') || ('0' <= s && s <= '9')) {
            return s;
          }
          return _unicode(s);
        });
      }
      return $escapejs;
    }()),
    $filesizeformat: (function(){
      function $filesizeformat(value){
        var val, unit, strval;
        if (value < 1024) {
          return value + "";
        }
        if (value < 1024 * 1024) {
          val = val / 1024;
          unit = "Kb";
        } else if (value < 1024 * 1024 * 1024) {
          val = val / (1024 * 1024);
          unit = "Mb";
        } else {
          val = val / (1024 * 1024 * 1024);
          unit = "Gb";
        }
        strval = Math.round(val) + "";
        return val.toPrecision(strval.length + 3) + "Kb";
      }
      return $filesizeformat;
    }()),
    $first: (function(){
      function $first(arr){
        return arr != null ? arr[0] : void 8;
      }
      return $first;
    }()),
    $float: (function(){
      function $float(value){
        var res;
        res = parseFloat(value);
        if (res === NaN) {
          return 0.0;
        }
        return res;
      }
      return $float;
    }()),
    $forceescape: (function(){
      function $forceescape(value){
        throw new Error('unimplemented');
      }
      return $forceescape;
    }()),
    $format: (function(){
      function $format(value, args, kwargs){
        args == null && (args = []);
        kwargs == null && (kwargs = {});
        throw new Error('unimplemented');
      }
      return $format;
    }())
    /**
     *  NOTE: only usable in the {% for grouper, list %} notation.
     *  @param attribute: The attribute to group by.
     */,
    $groupby: (function(){
      function $groupby(arr, attribute){
        var result, obj, grouper, _i, _len;
        result = {};
        for (_i = 0, _len = arr.length; _i < _len; ++_i) {
          obj = arr[_i];
          grouper = $resolve_attr(obj, attribute);
          result[grouper] == null && (result[grouper] = []);
          result[grouper].push(obj);
        }
        return result;
      }
      return $groupby;
    }()),
    $in: (function(){
      function $in(obj, arr){
        var x;
        x = null;
        for (x in arr) {
          if (arr.hasOwnProperty(x) && obj === arr[x]) {
            return true;
          }
        }
        return false;
      }
      return $in;
    }()),
    $indent: (function(){
      function $indent(value, width, indentfirst){
        var first;
        width == null && (width = 4);
        indentfirst == null && (indentfirst = false);
        first = true;
        return value.replace(/^/gm, function(s){
          if (!first || indentfirst) {
            return $repeat(" ", width) + s;
          }
          first = false;
          return s;
        });
      }
      return $indent;
    }()),
    $join: (function(){
      function $join(arr, string, attribute){
        var o, _res, _i, _len;
        string == null && (string = "");
        attribute == null && (attribute = null);
        if ((arr != null ? arr.length : void 8) > 0) {
          if (attribute) {
            _res = [];
            for (_i = 0, _len = arr.length; _i < _len; ++_i) {
              o = arr[_i];
              _res.push($resolve_attr(o, attribute).toString());
            }
            arr = _res;
          }
          return arr.join(string);
        }
        return "";
      }
      return $join;
    }()),
    $last: (function(){
      function $last(arr){
        if (!(arr != null && arr.length)) {
          return null;
        }
        return arr[arr.length - 1];
      }
      return $last;
    }()),
    $length: (function(){
      function $length(arr){
        if (arr == null) {
          return 0;
        }
        return arr.length;
      }
      return $length;
    }()),
    $lower: (function(){
      function $lower(value){
        return value.toString().toLowerCase();
      }
      return $lower;
    }()),
    $pprint_: (function(){
      function $pprint_(node, fmter){
        function real_pprint(node, fmter, met){
          var index, is_array, props, k, v, i, prop, _len;
          met == null && (met = []);
          if (node instanceof Function) {
            return fmter('function', node);
          } else if (node instanceof RegExp) {
            return fmter('regexp', node);
          } else if (node instanceof Object) {
            index = met.indexOf(node);
            if (index != -1) {
              fmter('obj-already', index);
              return;
            }
            met.push(node);
            index = met.length - 1;
            is_array = node instanceof Array;
            fmter('obj-pre', is_array, index);
            props = [];
            for (k in node) {
              v = node[k];
              if (node.hasOwnProperty(k)) {
                if (v instanceof String) {
                  console.log(v);
                }
                props.push({
                  lbl: k,
                  node: v
                });
              }
            }
            props.sort(function(a, b){
              if (a < b) {
                return -1;
              }
              if (a > b) {
                return 1;
              }
              return 0;
            });
            for (i = 0, _len = props.length; i < _len; ++i) {
              prop = props[i];
              if (i != 0) {
                fmter('obj-sep');
              }
              if (!is_array) {
                fmter('obj-label', prop.lbl);
              }
              real_pprint(prop.node, fmter, met);
            }
            return fmter('obj-post', node instanceof Array);
          } else if (node instanceof String || typeof node === 'string') {
            return fmter('string', node);
          } else if (node instanceof Number || typeof node === 'number') {
            return fmter('number', node);
          } else if (node instanceof Boolean || typeof node === 'boolean') {
            return fmter('boolean', node);
          } else if (node == null) {
            return fmter('empty');
          }
        }
        return real_pprint(node, fmter);
      }
      return $pprint_;
    }()),
    $pprint: (function(){
      function $pprint(value, verbose, depth){
        var res;
        verbose == null && (verbose = false);
        depth == null && (depth = 0);
        res = [];
        $pprint_(value, function(type, node){
          switch (type) {
          case 'obj-pre':
            return res.push(node ? "[ " : "{ ");
          case 'obj-post':
            return res.push(node ? " ]" : " }");
          case 'obj-already':
            return res.push("[cycle]");
          case 'obj-sep':
            return res.push(", ");
          case 'obj-label':
            return res.push(node + ": ");
          case 'string':
            return res.push("\"" + node + "\"");
          case 'number':
            return res.push(node + "");
          case 'regexp':
            return res.push("/" + node + "/");
          case 'function':
            return res.push("[function]");
          case 'boolean':
            return res.push(node + "");
          case 'empty':
            return res.push("\u2205");
          default:
            return res.push(node);
          }
        });
        return res.join("");
      }
      return $pprint;
    }()),
    $hprint: (function(){
      function $hprint(value, verbose, depth){
        var unique, res, cur_depth, fmt;
        verbose == null && (verbose = false);
        depth == null && (depth = 0);
        unique = "hprint-" + Date.now();
        res = [];
        cur_depth = 0;
        res.push("<span class='hprint-value'>");
        fmt = (function(){
          function fmt(val, type, color, morestyle){
            morestyle == null && (morestyle = "");
            return "<span class='hprint-" + type + "' style='color:" + color + ";" + morestyle + "'>" + val + "</span>";
          }
          return fmt;
        }());
        $pprint_(value, function(type, node, index){
          if (type === 'obj-pre') {
            cur_depth = cur_depth + 1;
          }
          if (type === 'obj-post') {
            cur_depth = cur_depth - 1;
          }
          if (depth > 0 && cur_depth >= depth) {
            return;
          }
          switch (type) {
          case 'obj-pre':
            res.push(fmt(node ? "[ " : "{ ", 'open', 'gray', "font-weight: bold;"));
            return res.push("<span id='" + unique + "-" + index + "' class='hprint-object hprint-depth-" + cur_depth + "'>");
          case 'obj-post':
            res.push("</span>");
            return res.push(fmt(node ? " ]" : " }", 'close', 'gray', "font-weight: bold;"));
          case 'obj-already':
            return res.push(fmt("<a href='#" + unique + "-" + node + "'>[cycle]</a>", 'cycle', 'cyan'));
          case 'obj-sep':
            return res.push(", ");
          case 'obj-label':
            return res.push("<span class='hprint-label'>" + node + ": </span>");
          case 'string':
            return res.push(fmt("\"" + $escape(node) + "\"", 'string', 'goldenrod'));
          case 'number':
            return res.push(fmt(node + "", 'number', 'magenta'));
          case 'regexp':
            return res.push(fmt($escape(node.toString()) + "", 'regexp', 'lightgreen'));
          case 'function':
            return res.push(fmt("[function]", 'function', 'salmon'));
          case 'boolean':
            return res.push(fmt(node + "", 'boolean', 'magenta'));
          case 'empty':
            return res.push(fmt("\u2205", 'empty', 'magenta'));
          default:
            return res.push(node);
          }
        });
        res.push("</span>");
        return res.join("");
      }
      return $hprint;
    }()),
    $random: (function(){
      function $random(list){
        var index;
        if ((list != null ? list.length : void 8) > 0) {
          index = Math.floor(Math.random() * (list.length - 1) + 1);
          return list[index];
        }
        return "";
      }
      return $random;
    }()),
    $repeat: (function(){
      function $repeat(str, n){
        var r, i, _to;
        r = '';
        for (i = 0, _to = n - 1; i <= _to; ++i) {
          r += str;
        }
        return r;
      }
      return $repeat;
    }()),
    $replace: (function(){
      function $replace(string, regexp, newvalue, count){
        count == null && (count = null);
        if (typeof regexp === 'string') {
          regexp = new RegExp(regexp, 'g');
        }
        return string.replace(regexp, function(s){
          if (count != null) {
            if (count <= 0) {
              return s;
            }
            count = count - 1;
          }
          return s.replace(regexp, newvalue);
        });
      }
      return $replace;
    }()),
    $resolve_attr: (function(){
      function $resolve_attr(obj, att){
        var attrs, a, _i, _len;
        attrs = att.split('.');
        for (_i = 0, _len = attrs.length; _i < _len; ++_i) {
          a = attrs[_i];
          obj = obj[a];
        }
        return obj;
      }
      return $resolve_attr;
    }()),
    $reverse: (function(){
      function $reverse(arr){
        var new_arr;
        new_arr = arr.splice(0);
        new_arr.reverse();
        return new_arr;
      }
      return $reverse;
    }()),
    $round: (function(){
      function $round(value, precision, method){
        var factor;
        precision == null && (precision = 0);
        method == null && (method = 'common');
        if (method === 'common') {
          return value.toFixed(precision);
        } else {
          factor = Math.pow(10, precision);
          value *= factor;
          if (method === 'floor') {
            value = Math.floor(value);
          }
          if (method === 'ceil') {
            value = Math.ceil(value);
          }
          return (value / factor).toFixed(precision);
        }
      }
      return $round;
    }()),
    $safe: (function(){
      function $safe(value){
        throw new Error("Escaping is not yet implemented");
      }
      return $safe;
    }()),
    $slice: (function(){
      function $slice(value, slices, fill_with){
        var result, slice_length, i, tmpres, j, pos, _to, _to2;
        fill_with == null && (fill_with = null);
        result = [];
        slice_length = Math.ceil(value.length / slices);
        for (i = 0, _to = slices - 1; i <= _to; ++i) {
          tmpres = [];
          for (j = 0, _to2 = slice_length - 1; j <= _to2; ++j) {
            pos = i * slice_length + j;
            if (!(pos in value)) {
              if (fill_with == null) {
                break;
              }
              tmpres.push(fill_with);
            } else {
              tmpres.push(value[pos]);
            }
          }
          result.push(tmpres);
        }
        return result;
      }
      return $slice;
    }()),
    $sort: (function(){
      function $sort(value, reverse, case_sensitive, attribute){
        var new_arr;
        reverse == null && (reverse = false);
        case_sensitive == null && (case_sensitive = false);
        attribute == null && (attribute = null);
        new_arr = value.splice(0);
        new_arr.sort(function(a, b){
          if (attribute) {
            a = $resolve_attr(a, attribute);
            b = $resolve_attr(b, attribute);
          }
          if (!case_sensitive) {
            a = a.toString().toUpperCase();
            b = b.toString().toUpperCase();
          }
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        if (reverse) {
          new_arr.reverse();
        }
        return new_arr;
      }
      return $sort;
    }()),
    $string: (function(){
      function $string(s){
        return s.toString();
      }
      return $string;
    }()),
    $striptags: (function(){
      function $striptags(val){
        return val.replace(/<('(\'|[^'])*'|"(\"|[^"])*"|[^>])+>/g, '');
      }
      return $striptags;
    }()),
    $sum: (function(){
      function $sum(container, attribute, start){
        var res, o, _i, _len;
        attribute == null && (attribute = null);
        start == null && (start = 0);
        res = 0;
        for (_i = 0, _len = container.length; _i < _len; ++_i) {
          o = container[_i];
          if (attribute) {
            res += $resolve_attr(o, attribute);
          } else {
            res += o;
          }
        }
        return res + start;
      }
      return $sum;
    }()),
    $title: (function(){
      function $title(s){
        var o;
        return (function(){
          var _i, _ref, _len, _results = [];
          for (_i = 0, _len = (_ref = s.split(/\s/)).length; _i < _len; ++_i) {
            o = _ref[_i];
            _results.push($capitalize(o));
          }
          return _results;
        }()).join(" ");
      }
      return $title;
    }()),
    $trim: (function(){
      function $trim(value){
        var _ref;
        return (_ref = value != null ? value.trim() : void 8) != null ? _ref : "";
      }
      return $trim;
    }()),
    $truncate: (function(){
      function $truncate(s, length, killwords, ellipsis){
        var end;
        length == null && (length = 255);
        killwords == null && (killwords = false);
        ellipsis == null && (ellipsis = '...');
        end = length - 1;
        if (end < s.length && !killwords) {
          while (end + 1 < s.length && !/\B/.test(s[end + 1])) {
            end += 1;
          }
        }
        if (end == s.length - 1) {
          ellipsis = "";
        }
        return s.slice(0, end + 1) + ellipsis;
      }
      return $truncate;
    }()),
    $upper: (function(){
      function $upper(value){
        return value.toString().toUpperCase();
      }
      return $upper;
    }()),
    $urlize: (function(){
      function $urlize(value, trim_url_limit, nofollow){
        trim_url_limit == null && (trim_url_limit = null);
        nofollow == null && (nofollow = false);
        return value.replace(/([a-z]+:\/\/\w([-\w\.]+)*|\w+(\.\w+)+)(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?/g, function(u){
          var trimmed_u;
          if (trim_url_limit != null) {
            trimmed_u = u.slice(0, trim_url_limit);
            if (trimmed_u.length < u.length) {
              trimmed_u += "...";
            }
          } else {
            trimmed_u = u;
          }
          return "<a href=\"" + u + "\"" + (nofollow ? " rel=\"nofollow\"" : "") + ">" + trimmed_u + "</a>";
        });
      }
      return $urlize;
    }()),
    $wordwrap: (function(){
      function $wordwrap(s, width, break_long_words){
        var res, actual, sp, words, w, i, _i, _ref, _len, _to;
        width == null && (width = 79);
        break_long_words == null && (break_long_words = true);
        res = [];
        actual = "";
        sp = /^\s+$/;
        words = [];
        for (_i = 0, _len = (_ref = s.split(/\b/)).length; _i < _len; ++_i) {
          w = _ref[_i];
          if (break_long_words && w.length > width) {
            for (i = 0, _to = w.length - 1; width < 0 ? i >= _to : i <= _to; i += width) {
              words.push(w.slice(i, i + width));
            }
          } else {
            words.push(w);
          }
        }
        for (_i = 0, _len = words.length; _i < _len; ++_i) {
          w = words[_i];
          if (actual.length + w.length <= width || sp.test(w) || actual === "") {
            actual += w;
          } else {
            res.push(actual);
            actual = w;
          }
        }
        res.push(actual);
        return res.join("\n");
      }
      return $wordwrap;
    }()),
    $xmlattr: (function(){
      function $xmlattr(d, autospace){
        var res, k, v;
        autospace == null && (autospace = true);
        res = [];
        for (k in d) {
          v = d[k];
          if (v != null) {
            res.push((autospace ? " " : "") + "" + k + "=\"" + $escape(v.toString()) + "\"");
          }
        }
        return res.join("");
      }
      return $xmlattr;
    }())
  });
  exports['$center'].dependencies = ['$repeat'];
  exports['$escapejs'].dependencies = ['$repeat'];
  exports['$groupby'].dependencies = ['$resolve_attr'];
  exports['$indent'].dependencies = ['$repeat'];
  exports['$join'].dependencies = ['$resolve_attr'];
  exports['$sort'].dependencies = ['$resolve_attr'];
  exports['$sum'].dependencies = ['$resolve_attr'];
  exports['$title'].dependencies = ['$capitalize'];
  exports['$xmlattr'].dependencies = ['$escape'];
  exports['$pprint'].dependencies = ['$pprint_', '$escape'];
  exports['$hprint'].dependencies = ['$pprint_', '$escape'];
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

});

jrequire.define("/environment.js", function (require, module, exports, __dirname, __filename) {
    (function(){
  var Parser, render_template, watchFile, readFileSync, join, dirname, Environment, BasicFileEnvironment, _ref;
  Parser = jrequire('./parser').Parser;
  render_template = jrequire('./module_template').render;
  _ref = jrequire('fs'), watchFile = _ref.watchFile, readFileSync = _ref.readFileSync;
  _ref = jrequire('path'), join = _ref.join, dirname = _ref.dirname;
  /**
   *  A very basic environment.
   */
  Environment = (function(){
    Environment.displayName = 'Environment';
    var $evalTemplateObject, prototype = Environment.prototype, constructor = Environment;
    $evalTemplateObject = function(t, env){
      var environment;
      environment = env;
      return eval(t);
    };
    function Environment(_arg){
      var _ref, _ref2;
      _ref = _arg != null
        ? _arg
        : {}, this.utils = (_ref2 = _ref.utils) != null
        ? _ref2
        : jrequire("./utils"), this.filters = (_ref2 = _ref.filters) != null
        ? _ref2
        : jrequire("./filters"), this.parser = (_ref2 = _ref.parser) != null
        ? _ref2
        : new Parser(), this.pre_compile_func = (_ref2 = _ref.pre_compile_func) != null ? _ref2 : "", this.require_exp = (_ref2 = _ref.require_exp) != null ? _ref2 : 'require';
    }
    prototype.getTemplateFromString = (function(){
      function getTemplateFromString(str){
        var exports, compiled;
        try {
          exports = {};
          compiled = this.getTemplateSourceFromString(str);
          eval(compiled);
          return exports;
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.log(compiled);
          }
          throw e;
        }
      }
      return getTemplateFromString;
    }());
    prototype.getTemplateSourceFromString = (function(){
      function getTemplateSourceFromString(str){
        var ast, opts, compilation_ctx, body, _ref;
        if (this.pre_compile_func) {
          str = this.pre_compile_func(str);
        }
        ast = this.parser.parse(str, compilation_ctx);
        opts = {
          __indent__: 1,
          utils: this.utils,
          filters: this.filters
        };
        compilation_ctx = {
          filters_used: {}
        };
        compilation_ctx.filters = this.filters;
        compilation_ctx.utils = this.utils;
        body = ast.compile(opts, compilation_ctx);
        _ref = __import(opts, compilation_ctx);
        _ref.body = body;
        _ref.require_exp = this.require_exp;
        return render_template(opts);
      }
      return getTemplateSourceFromString;
    }());
    return Environment;
  }());
  /**
   *  A basic file compilation environment. It has no notion of template
   *  directories to look in ; it expects getTemplate() to be provided with
   *  an absolute path to its template.
   *
   *  Inside templates, templates can be called by relative paths however.
   *
   *  If a file doesn't exist, this environment will just crash and burn, as
   *  it makes no checks whatsoever.
   */
  BasicFileEnvironment = (function(_super){
    /**
     *  Constructor.
     */
    BasicFileEnvironment.displayName = 'BasicFileEnvironment';
    var prototype = __extends(BasicFileEnvironment, _super).prototype, constructor = BasicFileEnvironment;
    function BasicFileEnvironment(specs){
      specs.require_exp = "__load_template";
      BasicFileEnvironment.superclass.apply(this, arguments);
      this.cache = {};
      this.tracked = {};
      this.deps = {};
    }
    /**
     *  Invalidate the files that depend on the template at path.
     *  @param path: The base template.
     */
    prototype.invalidateDeps = function(path){
      var file, deps, _ref, _ref2;
      for (file in _ref = this.deps) {
        deps = _ref[file];
        if (path in deps) {
          delete this.cache[file];
          this.invalidateDeps(file);
        }
      }
      return _ref2 = (_ref = this.deps)[path], delete _ref[path], _ref2;
    };
    /**
     *  @param path: The path to monitor for changes.
     */
    prototype.trackFile = function(path){
      var _this = this;
      if (!(path in this.tracked)) {
        this.tracked[path] = true;
        return watchFile(path, function(curr, prev){
          if (curr.mtime > prev.mtime) {
            delete _this.cache[path];
          }
          return _this.invalidateDeps(path);
        });
      }
    };
    /**
     *  @param  path: An absolute path.
     *  @throws Error if the path does not exist.
     */
    prototype.getTemplate = function(path){
      var result;
      if (path in this.cache) {
        return this.cache[path];
      }
      result = readFileSync(path, 'utf-8');
      result = this.getTemplateFromString(result, {
        filename: path,
        root: dirname(path)
      });
      this.cache[path] = result;
      return result;
    };
    /**
     *  @param str: The text contents of the template.
     *  @param opts: An object containing at least "filename" as the path
     *      to the template, and "root" as its basedir.
     */
    prototype.getTemplateFromString = function(str, opts){
      var exports, compiled, __filename, __dirname, __load_template, _this = this;
      __filename = opts.filename;
      __dirname = opts.root;
      this.trackFile(__filename);
      this.deps[__filename] = {};
      __load_template = function(path){
        if (path[0] != '/') {
          path = join(__dirname, path);
        }
        _this.deps[__filename][path] = true;
        return _this.getTemplate(path);
      };
      try {
        exports = {};
        compiled = this.getTemplateSourceFromString(str);
        eval(compiled);
        return exports;
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log(compiled);
        }
        throw e;
      }
    };
    return BasicFileEnvironment;
  }(Environment));
  exports.defaultEnvironment = new Environment({
    filters: jrequire("/filters"),
    utils: jrequire("/utils")
  });
  exports.Environment = Environment;
  exports.BasicFileEnvironment = BasicFileEnvironment;
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function __extends(sub, sup){
    function ctor(){} ctor.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new ctor).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
}).call(this);

});
jrequire("/environment.js");

jrequire.define("/parser.js", function (require, module, exports, __dirname, __filename) {
    (function(){
  var Lexer, NodeComment, NodeList, NodePrint, default_nodes, tk_tag_open, tk_tag_open_spc, tk_tag_close, tk_tag_close_spc, tk_tag_single, tk_comment_open, tk_comment_open_spc, tk_comment_close, tk_comment_close_spc, tk_comment_single, tk_print_open, tk_print_close, tk_new_line, default_tokens, Parser, _ref, _tag_search;
  Lexer = jrequire('./lexer').Lexer;
  _ref = jrequire('./nodes'), NodeComment = _ref.NodeComment, NodeList = _ref.NodeList, NodePrint = _ref.NodePrint, default_nodes = _ref.default_nodes;
  tk_tag_open = "{%";
  tk_tag_open_spc = "{%-";
  tk_tag_close = "%}";
  tk_tag_close_spc = "-%}";
  tk_tag_single = "%";
  tk_comment_open = "{#";
  tk_comment_open_spc = "{#-";
  tk_comment_close = "#}";
  tk_comment_close_spc = "-#}";
  tk_comment_single = "#";
  tk_print_open = "{{";
  tk_print_close = "}}";
  tk_new_line = "\n";
  default_tokens = [tk_tag_open, tk_tag_open_spc, tk_tag_close, tk_tag_close_spc, tk_comment_open, tk_comment_open_spc, tk_comment_close, tk_comment_close_spc, tk_print_open, tk_print_close, tk_new_line];
  /**
   *  @param str A string
   *  @returns    A trimmed string, without leading nor ending spaces.
   */
  function trim(str){
    if (str === null) {
      return null;
    }
    return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
  }
  _tag_search = /\s*([a-zA-Z][-a-zA-Z0-9_]*)\s+((.|\n)*)/m;
  /**
   *  @param stmt The contents between {% and %}
   *  @returns    An object containing the tag portion and the contents.
   */
  function parse_tag(stmt){
    var m, _ref;
    m = _tag_search.exec(stmt);
    return [m[1], (_ref = m[2]) != null ? _ref : ""];
  }
  function remove_spaces(str){
    var i, _ref;
    i = 0;
    while ((_ref = str[i]) === ' ' || _ref === "\t") {
      i += 1;
    }
    return [str.substr(0, i), str.substr(i)];
  }
  /**
   *  The parser is used to build a node tree : this node tree will present a compile () method
   *  that generates javascript code ready to be compiled.
   */
  Parser = (function(){
    Parser.displayName = 'Parser';
    var prototype = Parser.prototype, constructor = Parser;
    function Parser(specs){
      var _ref;
      specs == null && (specs = {});
      this.nodes = (_ref = specs.nodes) != null ? _ref : default_nodes;
      this.lexer = new Lexer({
        tokens: default_tokens
      });
      this.root = NodeList();
      this.trim_blocks = (_ref = specs.trim_blocks) != null ? _ref : true;
      this._discard_next_space = false;
      this._discard_next_newline = false;
      this._cached_next = null;
    }
    prototype._nextToken = (function(){
      function _nextToken(){
        var acc, spaces, tok, _ref;
        if (this._cached_next != null) {
          this.current_token = this._cached_next;
          this._cached_next = null;
          return;
        }
        acc = '';
        do {
          this.current_token = this.lexer.next();
          if (this.current_token === tk_new_line) {
            acc += this.current_token;
            this.current_token = '';
          } else if (this.current_token != null) {
            _ref = remove_spaces(this.current_token), spaces = _ref[0], tok = _ref[1];
            acc += spaces;
            this.current_token = tok;
          }
        } while (this.current_token === '' && this.current_token !== null);
        if (acc === '' && this.current_token === null) {
          return;
        }
        if (this._discard_next_space || ((_ref = this.current_token) === tk_tag_open_spc || _ref === tk_comment_open_spc)) {
          this._discard_next_space = false;
          return;
        }
        if ((_ref = this.current_token) === tk_comment_close_spc || _ref === tk_tag_close_spc) {
          this._discard_next_space = true;
        }
        if (acc) {
          this._cached_next = this.current_token;
          return this.current_token = acc;
        }
      }
      return _nextToken;
    }());
    prototype.nextToken = (function(){
      function nextToken(){
        var i, _ref, _to, _ref2;
        this._nextToken();
        if (this.current_token == null) {
          return;
        }
        _ref = this.current_token;
        if (this._discard_next_newline) {
          for (i = 0, _to = _ref.length - 1; i <= _to; ++i) {
            if (_ref[i] == '\n') {
              this.current_token = _ref.substr(i + 1);
              break;
            }
          }
          if (!this.current_token) {
            this.nextToken();
            return;
          }
          this._discard_next_newline = false;
        }
        if (this.trim_blocks && ((_ref2 = this.current_token) === tk_comment_close || _ref2 === tk_tag_close)) {
          return this._discard_next_newline = true;
        }
      }
      return nextToken;
    }());
    /**
     *  Parse comments in the input.
     *  @return nothing ! We ditch everything inside.
     */
    prototype.parseComment = (function(){
      function parseComment(){
        var balance, comment;
        balance = 1;
        comment = "";
        do {
          this.nextToken();
          if (this.current_token == tk_comment_close || this.current_token == tk_comment_close_spc) {
            balance -= 1;
            continue;
          }
          if (this.current_token == tk_comment_open || this.current_token == tk_comment_open_spc) {
            balance += 1;
            continue;
          }
          comment += this.current_token;
        } while (this.current_token != null && balance > 0);
        if (balance != 0) {
          throw new Error("Unclosed Comment at line " + _lexer.lineno);
        }
      }
      return parseComment;
    }());
    /**
     *  Parse a print statement. Usually delimited by {{ and }}
     *  The insides of the print statement are in turn parsed to escape
     *  variables and filters with the ctx. and env.filters. prefix respectively.
     *
     *  @return a PrintNode
     */
    prototype.parsePrintStatement = (function(){
      function parsePrintStatement(){
        var statement;
        statement = "";
        do {
          this.current_token = this.lexer.next();
          if (this.current_token && this.current_token != tk_print_close) {
            statement += this.current_token;
          }
        } while (this.current_token != null && this.current_token != tk_print_close);
        if (this.current_token === null) {
          throw new Error("Waiting for '" + tk_print_close + "' at line " + this.lexer.lineno);
        }
        return new NodePrint({
          contents: trim(statement)
        });
      }
      return parsePrintStatement;
    }());
    /**
     *
     */
    prototype.parseTag = (function(){
      function parseTag(waiting_for){
        var tag_contents, name, contents, stop_clause, until_clause, inside_clause, child_node, tag, inside_name, inside_contents, inside_cls, inside_tag, _ref;
        tag_contents = "";
        this.nextToken();
        while (this.current_token != null && this.current_token != tk_tag_close && this.current_token != tk_tag_close_spc) {
          tag_contents += this.current_token;
          this.nextToken();
        }
        if (this.current_token === null) {
          throw new Error("Waiting for '" + tk_tag_close + "' on line " + this.lexer.lineno);
        }
        _ref = parse_tag(tag_contents), name = _ref[0], contents = _ref[1];
        if (name in waiting_for) {
          this.last_tag = [name, contents];
          return;
        }
        if (!this.nodes[name]) {
          throw new Error("Unexpected tag : '" + name + "' at line " + this.lexer.lineno);
        }
        stop_clause = {};
        until_clause = this.nodes[name]['until'];
        stop_clause[until_clause] = true;
        inside_clause = this.nodes[name]['inside'];
        __import(stop_clause, inside_clause);
        if (until_clause == "__endfile__") {
          child_node = this.parseLevel();
        } else if (until_clause) {
          child_node = this.parseLevel(stop_clause);
        }
        tag = new this.nodes[name]({
          name: trim(name),
          contents: trim(contents),
          child_node: child_node
        });
        if (!until_clause) {
          return tag;
        }
        while (this.last_tag != null && this.last_tag[0] != until_clause) {
          _ref = [this.last_tag[0], this.last_tag[1]], inside_name = _ref[0], inside_contents = _ref[1];
          inside_cls = this.nodes[name].inside[inside_name];
          inside_clause = inside_cls['inside'];
          stop_clause = (_ref = __import((_ref = {}, _ref[until_clause + ""] = true, _ref), inside_clause)) != null
            ? _ref
            : {};
          inside_tag = this.parseLevel(stop_clause);
          tag.push(new inside_cls({
            name: inside_name,
            contents: inside_contents,
            child_node: inside_tag
          }));
        }
        return tag;
      }
      return parseTag;
    }());
    /**
     *  Parse the input file.
     *  @return the root NodeList
     */
    prototype.parseLevel = (function(){
      function parseLevel(waiting_for){
        var result, tag;
        waiting_for == null && (waiting_for = {});
        if (waiting_for != null && !typeof waiting_for == 'object') {
          waiting_for = {
            waiting_for: true
          };
        }
        result = new NodeList();
        for (;;) {
          this.nextToken();
          if (!this.current_token) {
            break;
          }
          if (this.current_token == tk_tag_open || this.current_token == tk_tag_open_spc) {
            tag = this.parseTag(waiting_for);
            if (!tag) {
              return result;
            }
            result.push(tag);
            continue;
          }
          if (this.current_token == tk_print_open) {
            result.push(this.parsePrintStatement());
            continue;
          }
          if (this.current_token == tk_comment_open || this.current_token == tk_comment_open_spc) {
            result.push(this.parseComment());
            continue;
          }
          result.push(this.current_token);
        }
        return result;
      }
      return parseLevel;
    }());
    /**
     *  Holder function for _parse_global
     *  @return _parse_global's result
     */
    prototype.parse = (function(){
      function parse(str){
        this.lexer.feed(str);
        this.current = this.root;
        this.current_token = "";
        return this.parseLevel();
      }
      return parse;
    }());
    return Parser;
  }());
  exports.Parser = Parser;
  exports.default_tokens = default_tokens;
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

});
jrequire("/parser.js");

jrequire.define("/utils.js", function (require, module, exports, __dirname, __filename) {
    (function(){
  function __in(obj, container){
    if (obj instanceof Array) {
      return __indexOf.call(container, obj) > -1;
    }
    return container[obj] != null;
  }
  function __import(obj, src){
    var own, key;
    own = {}.hasOwnProperty;
    for (key in src) {
      if (own.call(src, key)) {
        obj[key] = src[key];
      }
    }
    return obj;
  }
  exports.__in = __in;
  exports.__import = __import;
}).call(this);

});
jrequire("/utils.js");

jrequire.define("/filters.js", function (require, module, exports, __dirname, __filename) {
    /**
    BEWARE : In this module, you can't have any jrequire() out of the functions, nor
    can you use all of coco's shortcuts : all of these are meant to be used with .toString() !
**/
(function(){
  __import(exports, {
    /**
     * Return the absolute value of the argument.
     */
    $abs: (function(){
      function $abs(num){
        if (num < 0) {
          return -num;
        }
        return num;
      }
      return $abs;
    }())
    /**
     * A filter that batches items. It works pretty much like slice just the other way round. 
     * It returns a list of lists with the given number of items. 
     * If you provide a second parameter this is used to fill missing items.
     */,
    $batch: (function(){
      function $batch(value, linecount, fill_with){
        var result, i, tmpres, j, _to, _to2;
        fill_with == null && (fill_with = null);
        result = [];
        for (i = 0, _to = value.length - 1; linecount < 0 ? i >= _to : i <= _to; i += linecount) {
          tmpres = [];
          for (j = 0, _to2 = linecount - 1; j <= _to2; ++j) {
            if (!(i + j in value)) {
              if (fill_with == null) {
                break;
              }
              tmpres.push(fill_with);
            } else {
              tmpres.push(value[i + j]);
            }
          }
          result.push(tmpres);
        }
        return result;
      }
      return $batch;
    }())
    /**
     *  Capitalize a string.
     */,
    $capitalize: (function(){
      function $capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      return $capitalize;
    }())
    /**
     *  Center monospaced text.
     */,
    $center: (function(){
      function $center(value, width){
        var leading;
        width == null && (width = 80);
        if (value.length >= width - 1) {
          return value;
        }
        leading = $repeat(" ", (width - value.length) / 2);
        return leading + value;
      }
      return $center;
    }()),
    $count: (function(){
      function $count(){
        return exports.length.apply(this, arguments);
      }
      return $count;
    }())
    /**
     *  Formats a date.
     *  TODO : not completely done.
     */,
    $date: (function(){
      function $date(d, format){
        var _pad;
        _pad = function(v){
          if (v < 10) {
            return "0" + v;
          }
          return v;
        };
        return format.replace(/%[%cdfHIjmMpSUwWxXyYzZ]/g, function(s){
          var y;
          switch (s[1]) {
          case 'c':
            return d.toLocaleDateString() + " " + d.toLocaleTimeString();
          case 'd':
            return _pad(d.getDate());
          case 'f':
            return d.getMilliseconds();
          case 'H':
            return _pad(d.getHours());
          case 'I':
            return _pad(d.getHours() % 12);
          case 'j':
            return '';
          case 'm':
            return _pad(d.getMonth() + 1);
          case 'M':
            return _pad(d.getMinutes());
          case 'p':
            return '';
          case 'S':
            return _pad(d.getSeconds());
          case 'U':
            return '';
          case 'w':
            return d.getDay();
          case 'W':
            return '';
          case 'x':
            return d.toLocaleDateString();
          case 'X':
            return d.toLocalTimeString();
          case 'y':
            y = d.getFullYear();
            return "" + _pad(Math.round((y / 100 - Math.floor(y / 100)) * 100));
          case 'Y':
            return d.getFullYear();
          case 'z':
            return d.getTimezoneOffset();
          case 'Z':
            try {
              return d.getTimezone();
            } catch (e) {
              return '';
            }
            break;
          case '%':
            return '%';
          default:
            return '#error';
          }
        });
      }
      return $date;
    }())
    /**
     *  Alias for default.
     */,
    $d: (function(){
      function $d(){
        return exports['default'].apply(this, arguments);
      }
      return $d;
    }())
    /**
     *  Return a default value.
     *  @param default_value: The value to return
     *      when `value` is null.
     */,
    $default: (function(){
      function $default(value, default_value){
        if (value == null) {
          return default_value;
        }
        return value;
      }
      return $default;
    }())
    /**
     *  Return a list with 
     */,
    $dictsort: (function(){
      function $dictsort(value, case_sensitive, _by){
        var result, k, v;
        case_sensitive == null && (case_sensitive = false);
        _by == null && (_by = 'key');
        result = [];
        for (k in value) {
          v = value[k];
          result.push([k, v]);
        }
        result.sort(function(a, b){
          var i;
          if (_by === 'value') {
            i = 1;
          } else {
            i = 0;
          }
          a = a[i];
          b = b[i];
          if (!case_sensitive) {
            a = a.toString().toUpperCase();
            b = b.toString().toUpperCase();
          }
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        return result;
      }
      return $dictsort;
    }()),
    $e: {
      alias: "$escape"
    },
    $escape: (function(){
      function $escape(value){
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
      }
      return $escape;
    }())
    /**
     *  Escape a string to make it Javascript/JSON compliant.
     */,
    $escapejs: (function(){
      function $escapejs(value){
        var _unicode;
        _unicode = function(s){
          s = s.charCodeAt(0).toString(16);
          return "\\u" + $repeat("0", 4 - s.length) + s;
        };
        return value.replace(/./g, function(s){
          if (('a' <= s && s <= 'z') || ('A' <= s && s <= 'Z') || ('0' <= s && s <= '9')) {
            return s;
          }
          return _unicode(s);
        });
      }
      return $escapejs;
    }()),
    $filesizeformat: (function(){
      function $filesizeformat(value){
        var val, unit, strval;
        if (value < 1024) {
          return value + "";
        }
        if (value < 1024 * 1024) {
          val = val / 1024;
          unit = "Kb";
        } else if (value < 1024 * 1024 * 1024) {
          val = val / (1024 * 1024);
          unit = "Mb";
        } else {
          val = val / (1024 * 1024 * 1024);
          unit = "Gb";
        }
        strval = Math.round(val) + "";
        return val.toPrecision(strval.length + 3) + "Kb";
      }
      return $filesizeformat;
    }()),
    $first: (function(){
      function $first(arr){
        return arr != null ? arr[0] : void 8;
      }
      return $first;
    }()),
    $float: (function(){
      function $float(value){
        var res;
        res = parseFloat(value);
        if (res === NaN) {
          return 0.0;
        }
        return res;
      }
      return $float;
    }()),
    $forceescape: (function(){
      function $forceescape(value){
        throw new Error('unimplemented');
      }
      return $forceescape;
    }()),
    $format: (function(){
      function $format(value, args, kwargs){
        args == null && (args = []);
        kwargs == null && (kwargs = {});
        throw new Error('unimplemented');
      }
      return $format;
    }())
    /**
     *  NOTE: only usable in the {% for grouper, list %} notation.
     *  @param attribute: The attribute to group by.
     */,
    $groupby: (function(){
      function $groupby(arr, attribute){
        var result, obj, grouper, _i, _len;
        result = {};
        for (_i = 0, _len = arr.length; _i < _len; ++_i) {
          obj = arr[_i];
          grouper = $resolve_attr(obj, attribute);
          result[grouper] == null && (result[grouper] = []);
          result[grouper].push(obj);
        }
        return result;
      }
      return $groupby;
    }()),
    $in: (function(){
      function $in(obj, arr){
        var x;
        x = null;
        for (x in arr) {
          if (arr.hasOwnProperty(x) && obj === arr[x]) {
            return true;
          }
        }
        return false;
      }
      return $in;
    }()),
    $indent: (function(){
      function $indent(value, width, indentfirst){
        var first;
        width == null && (width = 4);
        indentfirst == null && (indentfirst = false);
        first = true;
        return value.replace(/^/gm, function(s){
          if (!first || indentfirst) {
            return $repeat(" ", width) + s;
          }
          first = false;
          return s;
        });
      }
      return $indent;
    }()),
    $join: (function(){
      function $join(arr, string, attribute){
        var o, _res, _i, _len;
        string == null && (string = "");
        attribute == null && (attribute = null);
        if ((arr != null ? arr.length : void 8) > 0) {
          if (attribute) {
            _res = [];
            for (_i = 0, _len = arr.length; _i < _len; ++_i) {
              o = arr[_i];
              _res.push($resolve_attr(o, attribute).toString());
            }
            arr = _res;
          }
          return arr.join(string);
        }
        return "";
      }
      return $join;
    }()),
    $last: (function(){
      function $last(arr){
        if (!(arr != null && arr.length)) {
          return null;
        }
        return arr[arr.length - 1];
      }
      return $last;
    }()),
    $length: (function(){
      function $length(arr){
        if (arr == null) {
          return 0;
        }
        return arr.length;
      }
      return $length;
    }()),
    $lower: (function(){
      function $lower(value){
        return value.toString().toLowerCase();
      }
      return $lower;
    }()),
    $pprint_: (function(){
      function $pprint_(node, fmter){
        function real_pprint(node, fmter, met){
          var index, is_array, props, k, v, i, prop, _len;
          met == null && (met = []);
          if (node instanceof Function) {
            return fmter('function', node);
          } else if (node instanceof RegExp) {
            return fmter('regexp', node);
          } else if (node instanceof Object) {
            index = met.indexOf(node);
            if (index != -1) {
              fmter('obj-already', index);
              return;
            }
            met.push(node);
            index = met.length - 1;
            is_array = node instanceof Array;
            fmter('obj-pre', is_array, index);
            props = [];
            for (k in node) {
              v = node[k];
              if (node.hasOwnProperty(k)) {
                if (v instanceof String) {
                  console.log(v);
                }
                props.push({
                  lbl: k,
                  node: v
                });
              }
            }
            props.sort(function(a, b){
              if (a < b) {
                return -1;
              }
              if (a > b) {
                return 1;
              }
              return 0;
            });
            for (i = 0, _len = props.length; i < _len; ++i) {
              prop = props[i];
              if (i != 0) {
                fmter('obj-sep');
              }
              if (!is_array) {
                fmter('obj-label', prop.lbl);
              }
              real_pprint(prop.node, fmter, met);
            }
            return fmter('obj-post', node instanceof Array);
          } else if (node instanceof String || typeof node === 'string') {
            return fmter('string', node);
          } else if (node instanceof Number || typeof node === 'number') {
            return fmter('number', node);
          } else if (node instanceof Boolean || typeof node === 'boolean') {
            return fmter('boolean', node);
          } else if (node == null) {
            return fmter('empty');
          }
        }
        return real_pprint(node, fmter);
      }
      return $pprint_;
    }()),
    $pprint: (function(){
      function $pprint(value, verbose, depth){
        var res;
        verbose == null && (verbose = false);
        depth == null && (depth = 0);
        res = [];
        $pprint_(value, function(type, node){
          switch (type) {
          case 'obj-pre':
            return res.push(node ? "[ " : "{ ");
          case 'obj-post':
            return res.push(node ? " ]" : " }");
          case 'obj-already':
            return res.push("[cycle]");
          case 'obj-sep':
            return res.push(", ");
          case 'obj-label':
            return res.push(node + ": ");
          case 'string':
            return res.push("\"" + node + "\"");
          case 'number':
            return res.push(node + "");
          case 'regexp':
            return res.push("/" + node + "/");
          case 'function':
            return res.push("[function]");
          case 'boolean':
            return res.push(node + "");
          case 'empty':
            return res.push("\u2205");
          default:
            return res.push(node);
          }
        });
        return res.join("");
      }
      return $pprint;
    }()),
    $hprint: (function(){
      function $hprint(value, verbose, depth){
        var unique, res, cur_depth, fmt;
        verbose == null && (verbose = false);
        depth == null && (depth = 0);
        unique = "hprint-" + Date.now();
        res = [];
        cur_depth = 0;
        res.push("<span class='hprint-value'>");
        fmt = (function(){
          function fmt(val, type, color, morestyle){
            morestyle == null && (morestyle = "");
            return "<span class='hprint-" + type + "' style='color:" + color + ";" + morestyle + "'>" + val + "</span>";
          }
          return fmt;
        }());
        $pprint_(value, function(type, node, index){
          if (type === 'obj-pre') {
            cur_depth = cur_depth + 1;
          }
          if (type === 'obj-post') {
            cur_depth = cur_depth - 1;
          }
          if (depth > 0 && cur_depth >= depth) {
            return;
          }
          switch (type) {
          case 'obj-pre':
            res.push(fmt(node ? "[ " : "{ ", 'open', 'gray', "font-weight: bold;"));
            return res.push("<span id='" + unique + "-" + index + "' class='hprint-object hprint-depth-" + cur_depth + "'>");
          case 'obj-post':
            res.push("</span>");
            return res.push(fmt(node ? " ]" : " }", 'close', 'gray', "font-weight: bold;"));
          case 'obj-already':
            return res.push(fmt("<a href='#" + unique + "-" + node + "'>[cycle]</a>", 'cycle', 'cyan'));
          case 'obj-sep':
            return res.push(", ");
          case 'obj-label':
            return res.push("<span class='hprint-label'>" + node + ": </span>");
          case 'string':
            return res.push(fmt("\"" + $escape(node) + "\"", 'string', 'goldenrod'));
          case 'number':
            return res.push(fmt(node + "", 'number', 'magenta'));
          case 'regexp':
            return res.push(fmt($escape(node.toString()) + "", 'regexp', 'lightgreen'));
          case 'function':
            return res.push(fmt("[function]", 'function', 'salmon'));
          case 'boolean':
            return res.push(fmt(node + "", 'boolean', 'magenta'));
          case 'empty':
            return res.push(fmt("\u2205", 'empty', 'magenta'));
          default:
            return res.push(node);
          }
        });
        res.push("</span>");
        return res.join("");
      }
      return $hprint;
    }()),
    $random: (function(){
      function $random(list){
        var index;
        if ((list != null ? list.length : void 8) > 0) {
          index = Math.floor(Math.random() * (list.length - 1) + 1);
          return list[index];
        }
        return "";
      }
      return $random;
    }()),
    $repeat: (function(){
      function $repeat(str, n){
        var r, i, _to;
        r = '';
        for (i = 0, _to = n - 1; i <= _to; ++i) {
          r += str;
        }
        return r;
      }
      return $repeat;
    }()),
    $replace: (function(){
      function $replace(string, regexp, newvalue, count){
        count == null && (count = null);
        if (typeof regexp === 'string') {
          regexp = new RegExp(regexp, 'g');
        }
        return string.replace(regexp, function(s){
          if (count != null) {
            if (count <= 0) {
              return s;
            }
            count = count - 1;
          }
          return s.replace(regexp, newvalue);
        });
      }
      return $replace;
    }()),
    $resolve_attr: (function(){
      function $resolve_attr(obj, att){
        var attrs, a, _i, _len;
        attrs = att.split('.');
        for (_i = 0, _len = attrs.length; _i < _len; ++_i) {
          a = attrs[_i];
          obj = obj[a];
        }
        return obj;
      }
      return $resolve_attr;
    }()),
    $reverse: (function(){
      function $reverse(arr){
        var new_arr;
        new_arr = arr.splice(0);
        new_arr.reverse();
        return new_arr;
      }
      return $reverse;
    }()),
    $round: (function(){
      function $round(value, precision, method){
        var factor;
        precision == null && (precision = 0);
        method == null && (method = 'common');
        if (method === 'common') {
          return value.toFixed(precision);
        } else {
          factor = Math.pow(10, precision);
          value *= factor;
          if (method === 'floor') {
            value = Math.floor(value);
          }
          if (method === 'ceil') {
            value = Math.ceil(value);
          }
          return (value / factor).toFixed(precision);
        }
      }
      return $round;
    }()),
    $safe: (function(){
      function $safe(value){
        throw new Error("Escaping is not yet implemented");
      }
      return $safe;
    }()),
    $slice: (function(){
      function $slice(value, slices, fill_with){
        var result, slice_length, i, tmpres, j, pos, _to, _to2;
        fill_with == null && (fill_with = null);
        result = [];
        slice_length = Math.ceil(value.length / slices);
        for (i = 0, _to = slices - 1; i <= _to; ++i) {
          tmpres = [];
          for (j = 0, _to2 = slice_length - 1; j <= _to2; ++j) {
            pos = i * slice_length + j;
            if (!(pos in value)) {
              if (fill_with == null) {
                break;
              }
              tmpres.push(fill_with);
            } else {
              tmpres.push(value[pos]);
            }
          }
          result.push(tmpres);
        }
        return result;
      }
      return $slice;
    }()),
    $sort: (function(){
      function $sort(value, reverse, case_sensitive, attribute){
        var new_arr;
        reverse == null && (reverse = false);
        case_sensitive == null && (case_sensitive = false);
        attribute == null && (attribute = null);
        new_arr = value.splice(0);
        new_arr.sort(function(a, b){
          if (attribute) {
            a = $resolve_attr(a, attribute);
            b = $resolve_attr(b, attribute);
          }
          if (!case_sensitive) {
            a = a.toString().toUpperCase();
            b = b.toString().toUpperCase();
          }
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        if (reverse) {
          new_arr.reverse();
        }
        return new_arr;
      }
      return $sort;
    }()),
    $string: (function(){
      function $string(s){
        return s.toString();
      }
      return $string;
    }()),
    $striptags: (function(){
      function $striptags(val){
        return val.replace(/<('(\'|[^'])*'|"(\"|[^"])*"|[^>])+>/g, '');
      }
      return $striptags;
    }()),
    $sum: (function(){
      function $sum(container, attribute, start){
        var res, o, _i, _len;
        attribute == null && (attribute = null);
        start == null && (start = 0);
        res = 0;
        for (_i = 0, _len = container.length; _i < _len; ++_i) {
          o = container[_i];
          if (attribute) {
            res += $resolve_attr(o, attribute);
          } else {
            res += o;
          }
        }
        return res + start;
      }
      return $sum;
    }()),
    $title: (function(){
      function $title(s){
        var o;
        return (function(){
          var _i, _ref, _len, _results = [];
          for (_i = 0, _len = (_ref = s.split(/\s/)).length; _i < _len; ++_i) {
            o = _ref[_i];
            _results.push($capitalize(o));
          }
          return _results;
        }()).join(" ");
      }
      return $title;
    }()),
    $trim: (function(){
      function $trim(value){
        var _ref;
        return (_ref = value != null ? value.trim() : void 8) != null ? _ref : "";
      }
      return $trim;
    }()),
    $truncate: (function(){
      function $truncate(s, length, killwords, ellipsis){
        var end;
        length == null && (length = 255);
        killwords == null && (killwords = false);
        ellipsis == null && (ellipsis = '...');
        end = length - 1;
        if (end < s.length && !killwords) {
          while (end + 1 < s.length && !/\B/.test(s[end + 1])) {
            end += 1;
          }
        }
        if (end == s.length - 1) {
          ellipsis = "";
        }
        return s.slice(0, end + 1) + ellipsis;
      }
      return $truncate;
    }()),
    $upper: (function(){
      function $upper(value){
        return value.toString().toUpperCase();
      }
      return $upper;
    }()),
    $urlize: (function(){
      function $urlize(value, trim_url_limit, nofollow){
        trim_url_limit == null && (trim_url_limit = null);
        nofollow == null && (nofollow = false);
        return value.replace(/([a-z]+:\/\/\w([-\w\.]+)*|\w+(\.\w+)+)(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?/g, function(u){
          var trimmed_u;
          if (trim_url_limit != null) {
            trimmed_u = u.slice(0, trim_url_limit);
            if (trimmed_u.length < u.length) {
              trimmed_u += "...";
            }
          } else {
            trimmed_u = u;
          }
          return "<a href=\"" + u + "\"" + (nofollow ? " rel=\"nofollow\"" : "") + ">" + trimmed_u + "</a>";
        });
      }
      return $urlize;
    }()),
    $wordwrap: (function(){
      function $wordwrap(s, width, break_long_words){
        var res, actual, sp, words, w, i, _i, _ref, _len, _to;
        width == null && (width = 79);
        break_long_words == null && (break_long_words = true);
        res = [];
        actual = "";
        sp = /^\s+$/;
        words = [];
        for (_i = 0, _len = (_ref = s.split(/\b/)).length; _i < _len; ++_i) {
          w = _ref[_i];
          if (break_long_words && w.length > width) {
            for (i = 0, _to = w.length - 1; width < 0 ? i >= _to : i <= _to; i += width) {
              words.push(w.slice(i, i + width));
            }
          } else {
            words.push(w);
          }
        }
        for (_i = 0, _len = words.length; _i < _len; ++_i) {
          w = words[_i];
          if (actual.length + w.length <= width || sp.test(w) || actual === "") {
            actual += w;
          } else {
            res.push(actual);
            actual = w;
          }
        }
        res.push(actual);
        return res.join("\n");
      }
      return $wordwrap;
    }()),
    $xmlattr: (function(){
      function $xmlattr(d, autospace){
        var res, k, v;
        autospace == null && (autospace = true);
        res = [];
        for (k in d) {
          v = d[k];
          if (v != null) {
            res.push((autospace ? " " : "") + "" + k + "=\"" + $escape(v.toString()) + "\"");
          }
        }
        return res.join("");
      }
      return $xmlattr;
    }())
  });
  exports['$center'].dependencies = ['$repeat'];
  exports['$escapejs'].dependencies = ['$repeat'];
  exports['$groupby'].dependencies = ['$resolve_attr'];
  exports['$indent'].dependencies = ['$repeat'];
  exports['$join'].dependencies = ['$resolve_attr'];
  exports['$sort'].dependencies = ['$resolve_attr'];
  exports['$sum'].dependencies = ['$resolve_attr'];
  exports['$title'].dependencies = ['$capitalize'];
  exports['$xmlattr'].dependencies = ['$escape'];
  exports['$pprint'].dependencies = ['$pprint_', '$escape'];
  exports['$hprint'].dependencies = ['$pprint_', '$escape'];
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

});
jrequire("/filters.js");
jrequire.define('jinja.js', function(require, module, exports) {
    var __initialized   = false;
    var env             = jrequire('/environment').defaultEnvironment;
    var templateIdMap = {};

    exports.init = function() {
        var scripts     = document.getElementsByTagName('script');

        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];

            if ('text/jinja' === script.getAttribute('type')) {
                // Setup each template #id with `require`
                templateIdMap[script.id] = script.innerHTML;

                jrequire.define(script.id, function(trequire, tmodule, texports, dirname, filename) {
                    texports.render = function(context) {
                        return exports.render(templateIdMap[filename], context);
                    };
                });
            }
        }

        __initialized  = true;
    };

    exports.render = function(content, context) {
        // Lazy-load any templates that may be included
        if (!__initialized) {
            exports.init();
        }

        return env.getTemplateFromString(content).render(context);
    };
});

window.Jinja = jrequire('jinja.js');
;

// lib/handlebars/base.js
var Handlebars = {};

Handlebars.VERSION = "1.0.beta.6";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});
;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
;

d3 = function() {
  var π = Math.PI, ε = 1e-6, d3 = {
    version: "3.0.6"
  }, d3_radians = π / 180, d3_degrees = 180 / π, d3_document = document, d3_window = window;
  function d3_target(d) {
    return d.target;
  }
  function d3_source(d) {
    return d.source;
  }
  var d3_format_decimalPoint = ".", d3_format_thousandsSeparator = ",", d3_format_grouping = [ 3, 3 ];
  if (!Date.now) Date.now = function() {
    return +new Date();
  };
  try {
    d3_document.createElement("div").style.setProperty("opacity", 0, "");
  } catch (error) {
    var d3_style_prototype = d3_window.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
    d3_style_prototype.setProperty = function(name, value, priority) {
      d3_style_setProperty.call(this, name, value + "", priority);
    };
  }
  function d3_class(ctor, properties) {
    try {
      for (var key in properties) {
        Object.defineProperty(ctor.prototype, key, {
          value: properties[key],
          enumerable: false
        });
      }
    } catch (e) {
      ctor.prototype = properties;
    }
  }
  var d3_array = d3_arraySlice;
  function d3_arrayCopy(pseudoarray) {
    var i = -1, n = pseudoarray.length, array = [];
    while (++i < n) array.push(pseudoarray[i]);
    return array;
  }
  function d3_arraySlice(pseudoarray) {
    return Array.prototype.slice.call(pseudoarray);
  }
  try {
    d3_array(d3_document.documentElement.childNodes)[0].nodeType;
  } catch (e) {
    d3_array = d3_arrayCopy;
  }
  var d3_arraySubclass = [].__proto__ ? function(array, prototype) {
    array.__proto__ = prototype;
  } : function(array, prototype) {
    for (var property in prototype) array[property] = prototype[property];
  };
  d3.map = function(object) {
    var map = new d3_Map();
    for (var key in object) map.set(key, object[key]);
    return map;
  };
  function d3_Map() {}
  d3_class(d3_Map, {
    has: function(key) {
      return d3_map_prefix + key in this;
    },
    get: function(key) {
      return this[d3_map_prefix + key];
    },
    set: function(key, value) {
      return this[d3_map_prefix + key] = value;
    },
    remove: function(key) {
      key = d3_map_prefix + key;
      return key in this && delete this[key];
    },
    keys: function() {
      var keys = [];
      this.forEach(function(key) {
        keys.push(key);
      });
      return keys;
    },
    values: function() {
      var values = [];
      this.forEach(function(key, value) {
        values.push(value);
      });
      return values;
    },
    entries: function() {
      var entries = [];
      this.forEach(function(key, value) {
        entries.push({
          key: key,
          value: value
        });
      });
      return entries;
    },
    forEach: function(f) {
      for (var key in this) {
        if (key.charCodeAt(0) === d3_map_prefixCode) {
          f.call(this, key.substring(1), this[key]);
        }
      }
    }
  });
  var d3_map_prefix = "\0", d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
  function d3_identity(d) {
    return d;
  }
  function d3_true() {
    return true;
  }
  function d3_functor(v) {
    return typeof v === "function" ? v : function() {
      return v;
    };
  }
  d3.functor = d3_functor;
  d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return arguments.length ? target : value;
    };
  }
  d3.ascending = function(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  };
  d3.descending = function(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  };
  d3.mean = function(array, f) {
    var n = array.length, a, m = 0, i = -1, j = 0;
    if (arguments.length === 1) {
      while (++i < n) if (d3_number(a = array[i])) m += (a - m) / ++j;
    } else {
      while (++i < n) if (d3_number(a = f.call(array, array[i], i))) m += (a - m) / ++j;
    }
    return j ? m : undefined;
  };
  d3.median = function(array, f) {
    if (arguments.length > 1) array = array.map(f);
    array = array.filter(d3_number);
    return array.length ? d3.quantile(array.sort(d3.ascending), .5) : undefined;
  };
  d3.min = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n && ((a = array[i]) == null || a != a)) a = undefined;
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    } else {
      while (++i < n && ((a = f.call(array, array[i], i)) == null || a != a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
    }
    return a;
  };
  d3.max = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n && ((a = array[i]) == null || a != a)) a = undefined;
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    } else {
      while (++i < n && ((a = f.call(array, array[i], i)) == null || a != a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
    }
    return a;
  };
  d3.extent = function(array, f) {
    var i = -1, n = array.length, a, b, c;
    if (arguments.length === 1) {
      while (++i < n && ((a = c = array[i]) == null || a != a)) a = c = undefined;
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    } else {
      while (++i < n && ((a = c = f.call(array, array[i], i)) == null || a != a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }
    return [ a, c ];
  };
  d3.random = {
    normal: function(µ, σ) {
      var n = arguments.length;
      if (n < 2) σ = 1;
      if (n < 1) µ = 0;
      return function() {
        var x, y, r;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
      };
    },
    logNormal: function() {
      var random = d3.random.normal.apply(d3, arguments);
      return function() {
        return Math.exp(random());
      };
    },
    irwinHall: function(m) {
      return function() {
        for (var s = 0, j = 0; j < m; j++) s += Math.random();
        return s / m;
      };
    }
  };
  function d3_number(x) {
    return x != null && !isNaN(x);
  }
  d3.sum = function(array, f) {
    var s = 0, n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (!isNaN(a = +array[i])) s += a;
    } else {
      while (++i < n) if (!isNaN(a = +f.call(array, array[i], i))) s += a;
    }
    return s;
  };
  d3.quantile = function(values, p) {
    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
    return e ? v + e * (values[h] - v) : v;
  };
  d3.shuffle = function(array) {
    var m = array.length, t, i;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m], array[m] = array[i], array[i] = t;
    }
    return array;
  };
  d3.transpose = function(matrix) {
    return d3.zip.apply(d3, matrix);
  };
  d3.zip = function() {
    if (!(n = arguments.length)) return [];
    for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m; ) {
      for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n; ) {
        zip[j] = arguments[j][i];
      }
    }
    return zips;
  };
  function d3_zipLength(d) {
    return d.length;
  }
  d3.bisector = function(f) {
    return {
      left: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (f.call(a, a[mid], mid) < x) lo = mid + 1; else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (x < f.call(a, a[mid], mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
      }
    };
  };
  var d3_bisector = d3.bisector(function(d) {
    return d;
  });
  d3.bisectLeft = d3_bisector.left;
  d3.bisect = d3.bisectRight = d3_bisector.right;
  d3.nest = function() {
    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
    function map(array, depth) {
      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
      var i = -1, n = array.length, key = keys[depth++], keyValue, object, valuesByKey = new d3_Map(), values, o = {};
      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [ object ]);
        }
      }
      valuesByKey.forEach(function(keyValue, values) {
        o[keyValue] = map(values, depth);
      });
      return o;
    }
    function entries(map, depth) {
      if (depth >= keys.length) return map;
      var a = [], sortKey = sortKeys[depth++], key;
      for (key in map) {
        a.push({
          key: key,
          values: entries(map[key], depth)
        });
      }
      if (sortKey) a.sort(function(a, b) {
        return sortKey(a.key, b.key);
      });
      return a;
    }
    nest.map = function(array) {
      return map(array, 0);
    };
    nest.entries = function(array) {
      return entries(map(array, 0), 0);
    };
    nest.key = function(d) {
      keys.push(d);
      return nest;
    };
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };
    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };
    return nest;
  };
  d3.keys = function(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  };
  d3.values = function(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  };
  d3.entries = function(map) {
    var entries = [];
    for (var key in map) entries.push({
      key: key,
      value: map[key]
    });
    return entries;
  };
  d3.permute = function(array, indexes) {
    var permutes = [], i = -1, n = indexes.length;
    while (++i < n) permutes[i] = array[indexes[i]];
    return permutes;
  };
  d3.merge = function(arrays) {
    return Array.prototype.concat.apply([], arrays);
  };
  function d3_collapse(s) {
    return s.trim().replace(/\s+/g, " ");
  }
  d3.range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(Math.abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }
  d3.requote = function(s) {
    return s.replace(d3_requote_re, "\\$&");
  };
  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  d3.round = function(x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
  };
  d3.xhr = function(url, mimeType, callback) {
    var xhr = {}, dispatch = d3.dispatch("progress", "load", "error"), headers = {}, response = d3_identity, request = new (d3_window.XDomainRequest && /^(http(s)?:)?\/\//.test(url) ? XDomainRequest : XMLHttpRequest)();
    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
      request.readyState > 3 && respond();
    };
    function respond() {
      var s = request.status;
      !s && request.responseText || s >= 200 && s < 300 || s === 304 ? dispatch.load.call(xhr, response.call(xhr, request)) : dispatch.error.call(xhr, request);
    }
    request.onprogress = function(event) {
      var o = d3.event;
      d3.event = event;
      try {
        dispatch.progress.call(xhr, request);
      } finally {
        d3.event = o;
      }
    };
    xhr.header = function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers[name];
      if (value == null) delete headers[name]; else headers[name] = value + "";
      return xhr;
    };
    xhr.mimeType = function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return xhr;
    };
    xhr.response = function(value) {
      response = value;
      return xhr;
    };
    [ "get", "post" ].forEach(function(method) {
      xhr[method] = function() {
        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
      };
    });
    xhr.send = function(method, data, callback) {
      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
      request.open(method, url, true);
      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
      if (callback != null) xhr.on("error", callback).on("load", function(request) {
        callback(null, request);
      });
      request.send(data == null ? null : data);
      return xhr;
    };
    xhr.abort = function() {
      request.abort();
      return xhr;
    };
    d3.rebind(xhr, dispatch, "on");
    if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
    mimeType = null;
    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
  };
  function d3_xhr_fixCallback(callback) {
    return callback.length === 1 ? function(error, request) {
      callback(error == null ? request : null);
    } : callback;
  }
  d3.text = function() {
    return d3.xhr.apply(d3, arguments).response(d3_text);
  };
  function d3_text(request) {
    return request.responseText;
  }
  d3.json = function(url, callback) {
    return d3.xhr(url, "application/json", callback).response(d3_json);
  };
  function d3_json(request) {
    return JSON.parse(request.responseText);
  }
  d3.html = function(url, callback) {
    return d3.xhr(url, "text/html", callback).response(d3_html);
  };
  function d3_html(request) {
    var range = d3_document.createRange();
    range.selectNode(d3_document.body);
    return range.createContextualFragment(request.responseText);
  }
  d3.xml = function() {
    return d3.xhr.apply(d3, arguments).response(d3_xml);
  };
  function d3_xml(request) {
    return request.responseXML;
  }
  var d3_nsPrefix = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  d3.ns = {
    prefix: d3_nsPrefix,
    qualify: function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0) {
        prefix = name.substring(0, i);
        name = name.substring(i + 1);
      }
      return d3_nsPrefix.hasOwnProperty(prefix) ? {
        space: d3_nsPrefix[prefix],
        local: name
      } : name;
    }
  };
  d3.dispatch = function() {
    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    return dispatch;
  };
  function d3_dispatch() {}
  d3_dispatch.prototype.on = function(type, listener) {
    var i = type.indexOf("."), name = "";
    if (i > 0) {
      name = type.substring(i + 1);
      type = type.substring(0, i);
    }
    return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
  };
  function d3_dispatch_event(dispatch) {
    var listeners = [], listenerByName = new d3_Map();
    function event() {
      var z = listeners, i = -1, n = z.length, l;
      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
      return dispatch;
    }
    event.on = function(name, listener) {
      var l = listenerByName.get(name), i;
      if (arguments.length < 2) return l && l.on;
      if (l) {
        l.on = null;
        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
        listenerByName.remove(name);
      }
      if (listener) listeners.push(listenerByName.set(name, {
        on: listener
      }));
      return dispatch;
    };
    return event;
  }
  d3.format = function(specifier) {
    var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "", basePrefix = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, suffix = "", integer = false;
    if (precision) precision = +precision.substring(1);
    if (zfill || fill === "0" && align === "=") {
      zfill = fill = "0";
      align = "=";
      if (comma) width -= Math.floor((width - 1) / 4);
    }
    switch (type) {
     case "n":
      comma = true;
      type = "g";
      break;

     case "%":
      scale = 100;
      suffix = "%";
      type = "f";
      break;

     case "p":
      scale = 100;
      suffix = "%";
      type = "r";
      break;

     case "b":
     case "o":
     case "x":
     case "X":
      if (basePrefix) basePrefix = "0" + type.toLowerCase();

     case "c":
     case "d":
      integer = true;
      precision = 0;
      break;

     case "s":
      scale = -1;
      type = "r";
      break;
    }
    if (basePrefix === "#") basePrefix = "";
    if (type == "r" && !precision) type = "g";
    type = d3_format_types.get(type) || d3_format_typeDefault;
    var zcomma = zfill && comma;
    return function(value) {
      if (integer && value % 1) return "";
      var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;
      if (scale < 0) {
        var prefix = d3.formatPrefix(value, precision);
        value = prefix.scale(value);
        suffix = prefix.symbol;
      } else {
        value *= scale;
      }
      value = type(value, precision);
      if (!zfill && comma) value = d3_format_group(value);
      var length = basePrefix.length + value.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
      if (zcomma) value = d3_format_group(padding + value);
      if (d3_format_decimalPoint) value.replace(".", d3_format_decimalPoint);
      negative += basePrefix;
      return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + suffix;
    };
  };
  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?([0-9]+)?(,)?(\.[0-9]+)?([a-zA-Z%])?/;
  var d3_format_types = d3.map({
    b: function(x) {
      return x.toString(2);
    },
    c: function(x) {
      return String.fromCharCode(x);
    },
    o: function(x) {
      return x.toString(8);
    },
    x: function(x) {
      return x.toString(16);
    },
    X: function(x) {
      return x.toString(16).toUpperCase();
    },
    g: function(x, p) {
      return x.toPrecision(p);
    },
    e: function(x, p) {
      return x.toExponential(p);
    },
    f: function(x, p) {
      return x.toFixed(p);
    },
    r: function(x, p) {
      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
    }
  });
  function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
  function d3_format_typeDefault(x) {
    return x + "";
  }
  var d3_format_group = d3_identity;
  if (d3_format_grouping) {
    var d3_format_groupingLength = d3_format_grouping.length;
    d3_format_group = function(value) {
      var i = value.lastIndexOf("."), f = i >= 0 ? "." + value.substring(i + 1) : (i = value.length, 
      ""), t = [], j = 0, g = d3_format_grouping[0];
      while (i > 0 && g > 0) {
        t.push(value.substring(i -= g, i + g));
        g = d3_format_grouping[j = (j + 1) % d3_format_groupingLength];
      }
      return t.reverse().join(d3_format_thousandsSeparator || "") + f;
    };
  }
  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
  d3.formatPrefix = function(value, precision) {
    var i = 0;
    if (value) {
      if (value < 0) value *= -1;
      if (precision) value = d3.round(value, d3_format_precision(value, precision));
      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
      i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
    }
    return d3_formatPrefixes[8 + i / 3];
  };
  function d3_formatPrefix(d, i) {
    var k = Math.pow(10, Math.abs(8 - i) * 3);
    return {
      scale: i > 8 ? function(d) {
        return d / k;
      } : function(d) {
        return d * k;
      },
      symbol: d
    };
  }
  var d3_ease_default = function() {
    return d3_identity;
  };
  var d3_ease = d3.map({
    linear: d3_ease_default,
    poly: d3_ease_poly,
    quad: function() {
      return d3_ease_quad;
    },
    cubic: function() {
      return d3_ease_cubic;
    },
    sin: function() {
      return d3_ease_sin;
    },
    exp: function() {
      return d3_ease_exp;
    },
    circle: function() {
      return d3_ease_circle;
    },
    elastic: d3_ease_elastic,
    back: d3_ease_back,
    bounce: function() {
      return d3_ease_bounce;
    }
  });
  var d3_ease_mode = d3.map({
    "in": d3_identity,
    out: d3_ease_reverse,
    "in-out": d3_ease_reflect,
    "out-in": function(f) {
      return d3_ease_reflect(d3_ease_reverse(f));
    }
  });
  d3.ease = function(name) {
    var i = name.indexOf("-"), t = i >= 0 ? name.substring(0, i) : name, m = i >= 0 ? name.substring(i + 1) : "in";
    t = d3_ease.get(t) || d3_ease_default;
    m = d3_ease_mode.get(m) || d3_identity;
    return d3_ease_clamp(m(t.apply(null, Array.prototype.slice.call(arguments, 1))));
  };
  function d3_ease_clamp(f) {
    return function(t) {
      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
    };
  }
  function d3_ease_reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }
  function d3_ease_reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
    };
  }
  function d3_ease_quad(t) {
    return t * t;
  }
  function d3_ease_cubic(t) {
    return t * t * t;
  }
  function d3_ease_cubicInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
  }
  function d3_ease_poly(e) {
    return function(t) {
      return Math.pow(t, e);
    };
  }
  function d3_ease_sin(t) {
    return 1 - Math.cos(t * π / 2);
  }
  function d3_ease_exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }
  function d3_ease_circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  function d3_ease_elastic(a, p) {
    var s;
    if (arguments.length < 2) p = .45;
    if (arguments.length) s = p / (2 * π) * Math.asin(1 / a); else a = 1, s = p / 4;
    return function(t) {
      return 1 + a * Math.pow(2, 10 * -t) * Math.sin((t - s) * 2 * π / p);
    };
  }
  function d3_ease_back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }
  function d3_ease_bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
  d3.event = null;
  function d3_eventCancel() {
    d3.event.stopPropagation();
    d3.event.preventDefault();
  }
  function d3_eventSource() {
    var e = d3.event, s;
    while (s = e.sourceEvent) e = s;
    return e;
  }
  function d3_eventDispatch(target) {
    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    dispatch.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 = e1.sourceEvent = d3.event;
          e1.target = target;
          d3.event = e1;
          dispatch[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };
    return dispatch;
  }
  d3.transform = function(string) {
    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
    return (d3.transform = function(string) {
      g.setAttribute("transform", string);
      var t = g.transform.baseVal.consolidate();
      return new d3_transform(t ? t.matrix : d3_transformIdentity);
    })(string);
  };
  function d3_transform(m) {
    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }
    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
    this.translate = [ m.e, m.f ];
    this.scale = [ kx, ky ];
    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
  }
  d3_transform.prototype.toString = function() {
    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
  };
  function d3_transformDot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function d3_transformNormalize(a) {
    var k = Math.sqrt(d3_transformDot(a, a));
    if (k) {
      a[0] /= k;
      a[1] /= k;
    }
    return k;
  }
  function d3_transformCombine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }
  var d3_transformIdentity = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
  };
  d3.interpolate = function(a, b) {
    var i = d3.interpolators.length, f;
    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
    return f;
  };
  d3.interpolateNumber = function(a, b) {
    b -= a;
    return function(t) {
      return a + b * t;
    };
  };
  d3.interpolateRound = function(a, b) {
    b -= a;
    return function(t) {
      return Math.round(a + b * t);
    };
  };
  d3.interpolateString = function(a, b) {
    var m, i, j, s0 = 0, s1 = 0, s = [], q = [], n, o;
    d3_interpolate_number.lastIndex = 0;
    for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
      if (m.index) s.push(b.substring(s0, s1 = m.index));
      q.push({
        i: s.length,
        x: m[0]
      });
      s.push(null);
      s0 = d3_interpolate_number.lastIndex;
    }
    if (s0 < b.length) s.push(b.substring(s0));
    for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
      o = q[i];
      if (o.x == m[0]) {
        if (o.i) {
          if (s[o.i + 1] == null) {
            s[o.i - 1] += o.x;
            s.splice(o.i, 1);
            for (j = i + 1; j < n; ++j) q[j].i--;
          } else {
            s[o.i - 1] += o.x + s[o.i + 1];
            s.splice(o.i, 2);
            for (j = i + 1; j < n; ++j) q[j].i -= 2;
          }
        } else {
          if (s[o.i + 1] == null) {
            s[o.i] = o.x;
          } else {
            s[o.i] = o.x + s[o.i + 1];
            s.splice(o.i + 1, 1);
            for (j = i + 1; j < n; ++j) q[j].i--;
          }
        }
        q.splice(i, 1);
        n--;
        i--;
      } else {
        o.x = d3.interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
      }
    }
    while (i < n) {
      o = q.pop();
      if (s[o.i + 1] == null) {
        s[o.i] = o.x;
      } else {
        s[o.i] = o.x + s[o.i + 1];
        s.splice(o.i + 1, 1);
      }
      n--;
    }
    if (s.length === 1) {
      return s[0] == null ? q[0].x : function() {
        return b;
      };
    }
    return function(t) {
      for (i = 0; i < n; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
  d3.interpolateTransform = function(a, b) {
    var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
    if (ta[0] != tb[0] || ta[1] != tb[1]) {
      s.push("translate(", null, ",", null, ")");
      q.push({
        i: 1,
        x: d3.interpolateNumber(ta[0], tb[0])
      }, {
        i: 3,
        x: d3.interpolateNumber(ta[1], tb[1])
      });
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    } else {
      s.push("");
    }
    if (ra != rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
      q.push({
        i: s.push(s.pop() + "rotate(", null, ")") - 2,
        x: d3.interpolateNumber(ra, rb)
      });
    } else if (rb) {
      s.push(s.pop() + "rotate(" + rb + ")");
    }
    if (wa != wb) {
      q.push({
        i: s.push(s.pop() + "skewX(", null, ")") - 2,
        x: d3.interpolateNumber(wa, wb)
      });
    } else if (wb) {
      s.push(s.pop() + "skewX(" + wb + ")");
    }
    if (ka[0] != kb[0] || ka[1] != kb[1]) {
      n = s.push(s.pop() + "scale(", null, ",", null, ")");
      q.push({
        i: n - 4,
        x: d3.interpolateNumber(ka[0], kb[0])
      }, {
        i: n - 2,
        x: d3.interpolateNumber(ka[1], kb[1])
      });
    } else if (kb[0] != 1 || kb[1] != 1) {
      s.push(s.pop() + "scale(" + kb + ")");
    }
    n = q.length;
    return function(t) {
      var i = -1, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
  d3.interpolateRgb = function(a, b) {
    a = d3.rgb(a);
    b = d3.rgb(b);
    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
    return function(t) {
      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
    };
  };
  d3.interpolateHsl = function(a, b) {
    a = d3.hsl(a);
    b = d3.hsl(b);
    var h0 = a.h, s0 = a.s, l0 = a.l, h1 = b.h - h0, s1 = b.s - s0, l1 = b.l - l0;
    if (h1 > 180) h1 -= 360; else if (h1 < -180) h1 += 360;
    return function(t) {
      return d3_hsl_rgb(h0 + h1 * t, s0 + s1 * t, l0 + l1 * t) + "";
    };
  };
  d3.interpolateLab = function(a, b) {
    a = d3.lab(a);
    b = d3.lab(b);
    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
    return function(t) {
      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  };
  d3.interpolateHcl = function(a, b) {
    a = d3.hcl(a);
    b = d3.hcl(b);
    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
    if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
    };
  };
  d3.interpolateArray = function(a, b) {
    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
    for (i = 0; i < n0; ++i) x.push(d3.interpolate(a[i], b[i]));
    for (;i < na; ++i) c[i] = a[i];
    for (;i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  };
  d3.interpolateObject = function(a, b) {
    var i = {}, c = {}, k;
    for (k in a) {
      if (k in b) {
        i[k] = d3_interpolateByName(k)(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  };
  var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  function d3_interpolateByName(name) {
    return name == "transform" ? d3.interpolateTransform : d3.interpolate;
  }
  d3.interpolators = [ d3.interpolateObject, function(a, b) {
    return b instanceof Array && d3.interpolateArray(a, b);
  }, function(a, b) {
    return (typeof a === "string" || typeof b === "string") && d3.interpolateString(a + "", b + "");
  }, function(a, b) {
    return (typeof b === "string" ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) : b instanceof d3_Color) && d3.interpolateRgb(a, b);
  }, function(a, b) {
    return !isNaN(a = +a) && !isNaN(b = +b) && d3.interpolateNumber(a, b);
  } ];
  function d3_uninterpolateNumber(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      return (x - a) * b;
    };
  }
  function d3_uninterpolateClamp(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) * b));
    };
  }
  function d3_Color() {}
  d3_Color.prototype.toString = function() {
    return this.rgb() + "";
  };
  d3.rgb = function(r, g, b) {
    return arguments.length === 1 ? r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : d3_rgb(~~r, ~~g, ~~b);
  };
  function d3_rgb(r, g, b) {
    return new d3_Rgb(r, g, b);
  }
  function d3_Rgb(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color();
  d3_rgbPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return d3_rgb(Math.min(255, Math.floor(r / k)), Math.min(255, Math.floor(g / k)), Math.min(255, Math.floor(b / k)));
  };
  d3_rgbPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_rgb(Math.floor(k * this.r), Math.floor(k * this.g), Math.floor(k * this.b));
  };
  d3_rgbPrototype.hsl = function() {
    return d3_rgb_hsl(this.r, this.g, this.b);
  };
  d3_rgbPrototype.toString = function() {
    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
  };
  function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
  }
  function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, name;
    m1 = /([a-z]+)\((.*)\)/i.exec(format);
    if (m1) {
      m2 = m1[2].split(",");
      switch (m1[1]) {
       case "hsl":
        {
          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
        }

       case "rgb":
        {
          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
        }
      }
    }
    if (name = d3_rgb_names.get(format)) return rgb(name.r, name.g, name.b);
    if (format != null && format.charAt(0) === "#") {
      if (format.length === 4) {
        r = format.charAt(1);
        r += r;
        g = format.charAt(2);
        g += g;
        b = format.charAt(3);
        b += b;
      } else if (format.length === 7) {
        r = format.substring(1, 3);
        g = format.substring(3, 5);
        b = format.substring(5, 7);
      }
      r = parseInt(r, 16);
      g = parseInt(g, 16);
      b = parseInt(b, 16);
    }
    return rgb(r, g, b);
  }
  function d3_rgb_hsl(r, g, b) {
    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
    if (d) {
      s = l < .5 ? d / (max + min) : d / (2 - max - min);
      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    } else {
      s = h = 0;
    }
    return d3_hsl(h, s, l);
  }
  function d3_rgb_lab(r, g, b) {
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }
  function d3_rgb_xyz(r) {
    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
  }
  function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
  }
  var d3_rgb_names = d3.map({
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkgrey: "#a9a9a9",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  });
  d3_rgb_names.forEach(function(key, value) {
    d3_rgb_names.set(key, d3_rgb_parse(value, d3_rgb, d3_hsl_rgb));
  });
  d3.hsl = function(h, s, l) {
    return arguments.length === 1 ? h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : d3_hsl(+h, +s, +l);
  };
  function d3_hsl(h, s, l) {
    return new d3_Hsl(h, s, l);
  }
  function d3_Hsl(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
  }
  var d3_hslPrototype = d3_Hsl.prototype = new d3_Color();
  d3_hslPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_hsl(this.h, this.s, this.l / k);
  };
  d3_hslPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_hsl(this.h, this.s, k * this.l);
  };
  d3_hslPrototype.rgb = function() {
    return d3_hsl_rgb(this.h, this.s, this.l);
  };
  function d3_hsl_rgb(h, s, l) {
    var m1, m2;
    h = h % 360;
    if (h < 0) h += 360;
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
    m1 = 2 * l - m2;
    function v(h) {
      if (h > 360) h -= 360; else if (h < 0) h += 360;
      if (h < 60) return m1 + (m2 - m1) * h / 60;
      if (h < 180) return m2;
      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
      return m1;
    }
    function vv(h) {
      return Math.round(v(h) * 255);
    }
    return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
  }
  d3.hcl = function(h, c, l) {
    return arguments.length === 1 ? h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l) : h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : d3_hcl(+h, +c, +l);
  };
  function d3_hcl(h, c, l) {
    return new d3_Hcl(h, c, l);
  }
  function d3_Hcl(h, c, l) {
    this.h = h;
    this.c = c;
    this.l = l;
  }
  var d3_hclPrototype = d3_Hcl.prototype = new d3_Color();
  d3_hclPrototype.brighter = function(k) {
    return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.darker = function(k) {
    return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.rgb = function() {
    return d3_hcl_lab(this.h, this.c, this.l).rgb();
  };
  function d3_hcl_lab(h, c, l) {
    return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
  }
  d3.lab = function(l, a, b) {
    return arguments.length === 1 ? l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b) : l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h) : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b) : d3_lab(+l, +a, +b);
  };
  function d3_lab(l, a, b) {
    return new d3_Lab(l, a, b);
  }
  function d3_Lab(l, a, b) {
    this.l = l;
    this.a = a;
    this.b = b;
  }
  var d3_lab_K = 18;
  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
  var d3_labPrototype = d3_Lab.prototype = new d3_Color();
  d3_labPrototype.brighter = function(k) {
    return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.darker = function(k) {
    return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.rgb = function() {
    return d3_lab_rgb(this.l, this.a, this.b);
  };
  function d3_lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = d3_lab_xyz(x) * d3_lab_X;
    y = d3_lab_xyz(y) * d3_lab_Y;
    z = d3_lab_xyz(z) * d3_lab_Z;
    return d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
  }
  function d3_lab_hcl(l, a, b) {
    return d3_hcl(Math.atan2(b, a) / π * 180, Math.sqrt(a * a + b * b), l);
  }
  function d3_lab_xyz(x) {
    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }
  function d3_xyz_lab(x) {
    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }
  function d3_xyz_rgb(r) {
    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
  }
  function d3_selection(groups) {
    d3_arraySubclass(groups, d3_selectionPrototype);
    return groups;
  }
  var d3_select = function(s, n) {
    return n.querySelector(s);
  }, d3_selectAll = function(s, n) {
    return n.querySelectorAll(s);
  }, d3_selectRoot = d3_document.documentElement, d3_selectMatcher = d3_selectRoot.matchesSelector || d3_selectRoot.webkitMatchesSelector || d3_selectRoot.mozMatchesSelector || d3_selectRoot.msMatchesSelector || d3_selectRoot.oMatchesSelector, d3_selectMatches = function(n, s) {
    return d3_selectMatcher.call(n, s);
  };
  if (typeof Sizzle === "function") {
    d3_select = function(s, n) {
      return Sizzle(s, n)[0] || null;
    };
    d3_selectAll = function(s, n) {
      return Sizzle.uniqueSort(Sizzle(s, n));
    };
    d3_selectMatches = Sizzle.matchesSelector;
  }
  var d3_selectionPrototype = [];
  d3.selection = function() {
    return d3_selectionRoot;
  };
  d3.selection.prototype = d3_selectionPrototype;
  d3_selectionPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, group, node;
    if (typeof selector !== "function") selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(subnode = selector.call(node, node.__data__, i));
          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selector(selector) {
    return function() {
      return d3_select(selector, this);
    };
  }
  d3_selectionPrototype.selectAll = function(selector) {
    var subgroups = [], subgroup, node;
    if (typeof selector !== "function") selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i)));
          subgroup.parentNode = node;
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selectorAll(selector) {
    return function() {
      return d3_selectAll(selector, this);
    };
  }
  d3_selectionPrototype.attr = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node();
        name = d3.ns.qualify(name);
        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
      }
      for (value in name) this.each(d3_selection_attr(value, name[value]));
      return this;
    }
    return this.each(d3_selection_attr(name, value));
  };
  function d3_selection_attr(name, value) {
    name = d3.ns.qualify(name);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrConstant() {
      this.setAttribute(name, value);
    }
    function attrConstantNS() {
      this.setAttributeNS(name.space, name.local, value);
    }
    function attrFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
    }
    function attrFunctionNS() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
    }
    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
  }
  d3_selectionPrototype.classed = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node(), n = (name = name.trim().split(/^|\s+/g)).length, i = -1;
        if (value = node.classList) {
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.className;
          if (value.baseVal != null) value = value.baseVal;
          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
        }
        return true;
      }
      for (value in name) this.each(d3_selection_classed(value, name[value]));
      return this;
    }
    return this.each(d3_selection_classed(name, value));
  };
  function d3_selection_classedRe(name) {
    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
  }
  function d3_selection_classed(name, value) {
    name = name.trim().split(/\s+/).map(d3_selection_classedName);
    var n = name.length;
    function classedConstant() {
      var i = -1;
      while (++i < n) name[i](this, value);
    }
    function classedFunction() {
      var i = -1, x = value.apply(this, arguments);
      while (++i < n) name[i](this, x);
    }
    return typeof value === "function" ? classedFunction : classedConstant;
  }
  function d3_selection_classedName(name) {
    var re = d3_selection_classedRe(name);
    return function(node, value) {
      if (c = node.classList) return value ? c.add(name) : c.remove(name);
      var c = node.className, cb = c.baseVal != null, cv = cb ? c.baseVal : c;
      if (value) {
        re.lastIndex = 0;
        if (!re.test(cv)) {
          cv = d3_collapse(cv + " " + name);
          if (cb) c.baseVal = cv; else node.className = cv;
        }
      } else if (cv) {
        cv = d3_collapse(cv.replace(re, " "));
        if (cb) c.baseVal = cv; else node.className = cv;
      }
    };
  }
  d3_selectionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
        return this;
      }
      if (n < 2) return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);
      priority = "";
    }
    return this.each(d3_selection_style(name, value, priority));
  };
  function d3_selection_style(name, value, priority) {
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleConstant() {
      this.style.setProperty(name, value, priority);
    }
    function styleFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
    }
    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
  }
  d3_selectionPrototype.property = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") return this.node()[name];
      for (value in name) this.each(d3_selection_property(value, name[value]));
      return this;
    }
    return this.each(d3_selection_property(name, value));
  };
  function d3_selection_property(name, value) {
    function propertyNull() {
      delete this[name];
    }
    function propertyConstant() {
      this[name] = value;
    }
    function propertyFunction() {
      var x = value.apply(this, arguments);
      if (x == null) delete this[name]; else this[name] = x;
    }
    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
  }
  d3_selectionPrototype.text = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    } : value == null ? function() {
      this.textContent = "";
    } : function() {
      this.textContent = value;
    }) : this.node().textContent;
  };
  d3_selectionPrototype.html = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    } : value == null ? function() {
      this.innerHTML = "";
    } : function() {
      this.innerHTML = value;
    }) : this.node().innerHTML;
  };
  d3_selectionPrototype.append = function(name) {
    name = d3.ns.qualify(name);
    function append() {
      return this.appendChild(d3_document.createElementNS(this.namespaceURI, name));
    }
    function appendNS() {
      return this.appendChild(d3_document.createElementNS(name.space, name.local));
    }
    return this.select(name.local ? appendNS : append);
  };
  d3_selectionPrototype.insert = function(name, before) {
    name = d3.ns.qualify(name);
    function insert() {
      return this.insertBefore(d3_document.createElementNS(this.namespaceURI, name), d3_select(before, this));
    }
    function insertNS() {
      return this.insertBefore(d3_document.createElementNS(name.space, name.local), d3_select(before, this));
    }
    return this.select(name.local ? insertNS : insert);
  };
  d3_selectionPrototype.remove = function() {
    return this.each(function() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    });
  };
  d3_selectionPrototype.data = function(value, key) {
    var i = -1, n = this.length, group, node;
    if (!arguments.length) {
      value = new Array(n = (group = this[0]).length);
      while (++i < n) {
        if (node = group[i]) {
          value[i] = node.__data__;
        }
      }
      return value;
    }
    function bind(group, groupData) {
      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
      if (key) {
        var nodeByKeyValue = new d3_Map(), dataByKeyValue = new d3_Map(), keyValues = [], keyValue;
        for (i = -1; ++i < n; ) {
          keyValue = key.call(node = group[i], node.__data__, i);
          if (nodeByKeyValue.has(keyValue)) {
            exitNodes[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
          keyValues.push(keyValue);
        }
        for (i = -1; ++i < m; ) {
          keyValue = key.call(groupData, nodeData = groupData[i], i);
          if (node = nodeByKeyValue.get(keyValue)) {
            updateNodes[i] = node;
            node.__data__ = nodeData;
          } else if (!dataByKeyValue.has(keyValue)) {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
          dataByKeyValue.set(keyValue, nodeData);
          nodeByKeyValue.remove(keyValue);
        }
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.has(keyValues[i])) {
            exitNodes[i] = group[i];
          }
        }
      } else {
        for (i = -1; ++i < n0; ) {
          node = group[i];
          nodeData = groupData[i];
          if (node) {
            node.__data__ = nodeData;
            updateNodes[i] = node;
          } else {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
        }
        for (;i < m; ++i) {
          enterNodes[i] = d3_selection_dataNode(groupData[i]);
        }
        for (;i < n; ++i) {
          exitNodes[i] = group[i];
        }
      }
      enterNodes.update = updateNodes;
      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
      enter.push(enterNodes);
      update.push(updateNodes);
      exit.push(exitNodes);
    }
    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
    if (typeof value === "function") {
      while (++i < n) {
        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
      }
    } else {
      while (++i < n) {
        bind(group = this[i], value);
      }
    }
    update.enter = function() {
      return enter;
    };
    update.exit = function() {
      return exit;
    };
    return update;
  };
  function d3_selection_dataNode(data) {
    return {
      __data__: data
    };
  }
  d3_selectionPrototype.datum = function(value) {
    return arguments.length ? this.property("__data__", value) : this.property("__data__");
  };
  d3_selectionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i)) {
          subgroup.push(node);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_filter(selector) {
    return function() {
      return d3_selectMatches(this, selector);
    };
  }
  d3_selectionPrototype.order = function() {
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  };
  d3_selectionPrototype.sort = function(comparator) {
    comparator = d3_selection_sortComparator.apply(this, arguments);
    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
    return this.order();
  };
  function d3_selection_sortComparator(comparator) {
    if (!arguments.length) comparator = d3.ascending;
    return function(a, b) {
      return !a - !b || comparator(a.__data__, b.__data__);
    };
  }
  d3_selectionPrototype.on = function(type, listener, capture) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof type !== "string") {
        if (n < 2) listener = false;
        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
        return this;
      }
      if (n < 2) return (n = this.node()["__on" + type]) && n._;
      capture = false;
    }
    return this.each(d3_selection_on(type, listener, capture));
  };
  function d3_selection_on(type, listener, capture) {
    var name = "__on" + type, i = type.indexOf(".");
    if (i > 0) type = type.substring(0, i);
    function onRemove() {
      var wrapper = this[name];
      if (wrapper) {
        this.removeEventListener(type, wrapper, wrapper.$);
        delete this[name];
      }
    }
    function onAdd() {
      var node = this, args = d3_array(arguments);
      onRemove.call(this);
      this.addEventListener(type, this[name] = wrapper, wrapper.$ = capture);
      wrapper._ = listener;
      function wrapper(e) {
        var o = d3.event;
        d3.event = e;
        args[0] = node.__data__;
        try {
          listener.apply(node, args);
        } finally {
          d3.event = o;
        }
      }
    }
    return listener ? onAdd : onRemove;
  }
  d3_selectionPrototype.each = function(callback) {
    return d3_selection_each(this, function(node, i, j) {
      callback.call(node, node.__data__, i, j);
    });
  };
  function d3_selection_each(groups, callback) {
    for (var j = 0, m = groups.length; j < m; j++) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
        if (node = group[i]) callback(node, i, j);
      }
    }
    return groups;
  }
  d3_selectionPrototype.call = function(callback) {
    var args = d3_array(arguments);
    callback.apply(args[0] = this, args);
    return this;
  };
  d3_selectionPrototype.empty = function() {
    return !this.node();
  };
  d3_selectionPrototype.node = function() {
    for (var j = 0, m = this.length; j < m; j++) {
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  };
  d3_selectionPrototype.transition = function() {
    var id = d3_transitionInheritId || ++d3_transitionId, subgroups = [], subgroup, node, transition = Object.create(d3_transitionInherit);
    transition.time = Date.now();
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) d3_transitionNode(node, i, id, transition);
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, id);
  };
  var d3_selectionRoot = d3_selection([ [ d3_document ] ]);
  d3_selectionRoot[0].parentNode = d3_selectRoot;
  d3.select = function(selector) {
    return typeof selector === "string" ? d3_selectionRoot.select(selector) : d3_selection([ [ selector ] ]);
  };
  d3.selectAll = function(selector) {
    return typeof selector === "string" ? d3_selectionRoot.selectAll(selector) : d3_selection([ d3_array(selector) ]);
  };
  function d3_selection_enter(selection) {
    d3_arraySubclass(selection, d3_selection_enterPrototype);
    return selection;
  }
  var d3_selection_enterPrototype = [];
  d3.selection.enter = d3_selection_enter;
  d3.selection.enter.prototype = d3_selection_enterPrototype;
  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
  d3_selection_enterPrototype.insert = d3_selectionPrototype.insert;
  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
  d3_selection_enterPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, upgroup, group, node;
    for (var j = -1, m = this.length; ++j < m; ) {
      upgroup = (group = this[j]).update;
      subgroups.push(subgroup = []);
      subgroup.parentNode = group.parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i));
          subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_transition(groups, id) {
    d3_arraySubclass(groups, d3_transitionPrototype);
    groups.id = id;
    return groups;
  }
  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit = {
    ease: d3_ease_cubicInOut,
    delay: 0,
    duration: 250
  };
  d3_transitionPrototype.call = d3_selectionPrototype.call;
  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
  d3_transitionPrototype.node = d3_selectionPrototype.node;
  d3.transition = function(selection) {
    return arguments.length ? d3_transitionInheritId ? selection.transition() : selection : d3_selectionRoot.transition();
  };
  d3.transition.prototype = d3_transitionPrototype;
  function d3_transitionNode(node, i, id, inherit) {
    var lock = node.__transition__ || (node.__transition__ = {
      active: 0,
      count: 0
    }), transition = lock[id];
    if (!transition) {
      var time = inherit.time;
      transition = lock[id] = {
        tween: new d3_Map(),
        event: d3.dispatch("start", "end"),
        time: time,
        ease: inherit.ease,
        delay: inherit.delay,
        duration: inherit.duration
      };
      ++lock.count;
      d3.timer(function(elapsed) {
        var d = node.__data__, ease = transition.ease, event = transition.event, delay = transition.delay, duration = transition.duration, tweened = [];
        return delay <= elapsed ? start(elapsed) : d3.timer(start, delay, time), 1;
        function start(elapsed) {
          if (lock.active > id) return stop();
          lock.active = id;
          event.start.call(node, d, i);
          transition.tween.forEach(function(key, value) {
            if (value = value.call(node, d, i)) {
              tweened.push(value);
            }
          });
          if (!tick(elapsed)) d3.timer(tick, 0, time);
          return 1;
        }
        function tick(elapsed) {
          if (lock.active !== id) return stop();
          var t = (elapsed - delay) / duration, e = ease(t), n = tweened.length;
          while (n > 0) {
            tweened[--n].call(node, e);
          }
          if (t >= 1) {
            stop();
            event.end.call(node, d, i);
            return 1;
          }
        }
        function stop() {
          if (--lock.count) delete lock[id]; else delete node.__transition__;
          return 1;
        }
      }, 0, time);
      return transition;
    }
  }
  d3_transitionPrototype.select = function(selector) {
    var id = this.id, subgroups = [], subgroup, subnode, node;
    if (typeof selector !== "function") selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          d3_transitionNode(subnode, i, id, node.__transition__[id]);
          subgroup.push(subnode);
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_transitionPrototype.selectAll = function(selector) {
    var id = this.id, subgroups = [], subgroup, subnodes, node, subnode, transition;
    if (typeof selector !== "function") selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          transition = node.__transition__[id];
          subnodes = selector.call(node, node.__data__, i);
          subgroups.push(subgroup = []);
          for (var k = -1, o = subnodes.length; ++k < o; ) {
            d3_transitionNode(subnode = subnodes[k], k, id, transition);
            subgroup.push(subnode);
          }
        }
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_transitionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i)) {
          subgroup.push(node);
        }
      }
    }
    return d3_transition(subgroups, this.id, this.time).ease(this.ease());
  };
  d3_transitionPrototype.attr = function(nameNS, value) {
    if (arguments.length < 2) {
      for (value in nameNS) this.attr(value, nameNS[value]);
      return this;
    }
    var interpolate = d3_interpolateByName(nameNS), name = d3.ns.qualify(nameNS);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    return d3_transition_tween(this, "attr." + nameNS, value, function(b) {
      function attrString() {
        var a = this.getAttribute(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttribute(name, i(t));
        });
      }
      function attrStringNS() {
        var a = this.getAttributeNS(name.space, name.local), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttributeNS(name.space, name.local, i(t));
        });
      }
      return b == null ? name.local ? attrNullNS : attrNull : (b += "", name.local ? attrStringNS : attrString);
    });
  };
  d3_transitionPrototype.attrTween = function(nameNS, tween) {
    var name = d3.ns.qualify(nameNS);
    function attrTween(d, i) {
      var f = tween.call(this, d, i, this.getAttribute(name));
      return f && function(t) {
        this.setAttribute(name, f(t));
      };
    }
    function attrTweenNS(d, i) {
      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
      return f && function(t) {
        this.setAttributeNS(name.space, name.local, f(t));
      };
    }
    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.style(priority, name[priority], value);
        return this;
      }
      priority = "";
    }
    var interpolate = d3_interpolateByName(name);
    function styleNull() {
      this.style.removeProperty(name);
    }
    return d3_transition_tween(this, "style." + name, value, function(b) {
      function styleString() {
        var a = d3_window.getComputedStyle(this, null).getPropertyValue(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.style.setProperty(name, i(t), priority);
        });
      }
      return b == null ? styleNull : (b += "", styleString);
    });
  };
  d3_transitionPrototype.styleTween = function(name, tween, priority) {
    if (arguments.length < 3) priority = "";
    return this.tween("style." + name, function(d, i) {
      var f = tween.call(this, d, i, d3_window.getComputedStyle(this, null).getPropertyValue(name));
      return f && function(t) {
        this.style.setProperty(name, f(t), priority);
      };
    });
  };
  d3_transitionPrototype.text = function(value) {
    return d3_transition_tween(this, "text", value, d3_transition_text);
  };
  function d3_transition_text(b) {
    if (b == null) b = "";
    return function() {
      this.textContent = b;
    };
  }
  d3_transitionPrototype.remove = function() {
    return this.each("end.transition", function() {
      var p;
      if (!this.__transition__ && (p = this.parentNode)) p.removeChild(this);
    });
  };
  d3_transitionPrototype.ease = function(value) {
    var id = this.id;
    if (arguments.length < 1) return this.node().__transition__[id].ease;
    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
    return d3_selection_each(this, function(node) {
      node.__transition__[id].ease = value;
    });
  };
  d3_transitionPrototype.delay = function(value) {
    var id = this.id;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].delay = value.call(node, node.__data__, i, j) | 0;
    } : (value |= 0, function(node) {
      node.__transition__[id].delay = value;
    }));
  };
  d3_transitionPrototype.duration = function(value) {
    var id = this.id;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].duration = Math.max(1, value.call(node, node.__data__, i, j) | 0);
    } : (value = Math.max(1, value | 0), function(node) {
      node.__transition__[id].duration = value;
    }));
  };
  d3_transitionPrototype.each = function(type, listener) {
    var id = this.id;
    if (arguments.length < 2) {
      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
      d3_transitionInheritId = id;
      d3_selection_each(this, function(node, i, j) {
        d3_transitionInherit = node.__transition__[id];
        type.call(node, node.__data__, i, j);
      });
      d3_transitionInherit = inherit;
      d3_transitionInheritId = inheritId;
    } else {
      d3_selection_each(this, function(node) {
        node.__transition__[id].event.on(type, listener);
      });
    }
    return this;
  };
  d3_transitionPrototype.transition = function() {
    var id0 = this.id, id1 = ++d3_transitionId, subgroups = [], subgroup, group, node, transition;
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if (node = group[i]) {
          transition = Object.create(node.__transition__[id0]);
          transition.delay += transition.duration;
          d3_transitionNode(node, i, id1, transition);
        }
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, id1);
  };
  d3_transitionPrototype.tween = function(name, tween) {
    var id = this.id;
    if (arguments.length < 2) return this.node().__transition__[id].tween.get(name);
    return d3_selection_each(this, tween == null ? function(node) {
      node.__transition__[id].tween.remove(name);
    } : function(node) {
      node.__transition__[id].tween.set(name, tween);
    });
  };
  function d3_transition_tween(groups, name, value, tween) {
    var id = groups.id;
    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
    } : (value = tween(value), function(node) {
      node.__transition__[id].tween.set(name, value);
    }));
  }
  var d3_timer_id = 0, d3_timer_byId = {}, d3_timer_queue = null, d3_timer_interval, d3_timer_timeout;
  d3.timer = function(callback, delay, then) {
    if (arguments.length < 3) {
      if (arguments.length < 2) delay = 0; else if (!isFinite(delay)) return;
      then = Date.now();
    }
    var timer = d3_timer_byId[callback.id];
    if (timer && timer.callback === callback) {
      timer.then = then;
      timer.delay = delay;
    } else d3_timer_byId[callback.id = ++d3_timer_id] = d3_timer_queue = {
      callback: callback,
      then: then,
      delay: delay,
      next: d3_timer_queue
    };
    if (!d3_timer_interval) {
      d3_timer_timeout = clearTimeout(d3_timer_timeout);
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  };
  function d3_timer_step() {
    var elapsed, now = Date.now(), t1 = d3_timer_queue;
    while (t1) {
      elapsed = now - t1.then;
      if (elapsed >= t1.delay) t1.flush = t1.callback(elapsed);
      t1 = t1.next;
    }
    var delay = d3_timer_flush() - now;
    if (delay > 24) {
      if (isFinite(delay)) {
        clearTimeout(d3_timer_timeout);
        d3_timer_timeout = setTimeout(d3_timer_step, delay);
      }
      d3_timer_interval = 0;
    } else {
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  }
  d3.timer.flush = function() {
    var elapsed, now = Date.now(), t1 = d3_timer_queue;
    while (t1) {
      elapsed = now - t1.then;
      if (!t1.delay) t1.flush = t1.callback(elapsed);
      t1 = t1.next;
    }
    d3_timer_flush();
  };
  function d3_timer_flush() {
    var t0 = null, t1 = d3_timer_queue, then = Infinity;
    while (t1) {
      if (t1.flush) {
        delete d3_timer_byId[t1.callback.id];
        t1 = t0 ? t0.next = t1.next : d3_timer_queue = t1.next;
      } else {
        then = Math.min(then, t1.then + t1.delay);
        t1 = (t0 = t1).next;
      }
    }
    return then;
  }
  var d3_timer_frame = d3_window.requestAnimationFrame || d3_window.webkitRequestAnimationFrame || d3_window.mozRequestAnimationFrame || d3_window.oRequestAnimationFrame || d3_window.msRequestAnimationFrame || function(callback) {
    setTimeout(callback, 17);
  };
  d3.mouse = function(container) {
    return d3_mousePoint(container, d3_eventSource());
  };
  var d3_mouse_bug44083 = /WebKit/.test(d3_window.navigator.userAgent) ? -1 : 0;
  function d3_mousePoint(container, e) {
    var svg = container.ownerSVGElement || container;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      if (d3_mouse_bug44083 < 0 && (d3_window.scrollX || d3_window.scrollY)) {
        svg = d3.select(d3_document.body).append("svg").style("position", "absolute").style("top", 0).style("left", 0);
        var ctm = svg[0][0].getScreenCTM();
        d3_mouse_bug44083 = !(ctm.f || ctm.e);
        svg.remove();
      }
      if (d3_mouse_bug44083) {
        point.x = e.pageX;
        point.y = e.pageY;
      } else {
        point.x = e.clientX;
        point.y = e.clientY;
      }
      point = point.matrixTransform(container.getScreenCTM().inverse());
      return [ point.x, point.y ];
    }
    var rect = container.getBoundingClientRect();
    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
  }
  d3.touches = function(container, touches) {
    if (arguments.length < 2) touches = d3_eventSource().touches;
    return touches ? d3_array(touches).map(function(touch) {
      var point = d3_mousePoint(container, touch);
      point.identifier = touch.identifier;
      return point;
    }) : [];
  };
  function d3_noop() {}
  d3.scale = {};
  function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
  }
  function d3_scale_nice(domain, nice) {
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
    if (x1 < x0) {
      dx = i0, i0 = i1, i1 = dx;
      dx = x0, x0 = x1, x1 = dx;
    }
    if (nice = nice(x1 - x0)) {
      domain[i0] = nice.floor(x0);
      domain[i1] = nice.ceil(x1);
    }
    return domain;
  }
  function d3_scale_niceDefault() {
    return Math;
  }
  d3.scale.linear = function() {
    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3.interpolate, false);
  };
  function d3_scale_linear(domain, range, interpolate, clamp) {
    var output, input;
    function rescale() {
      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, d3.interpolate);
      return scale;
    }
    function scale(x) {
      return output(x);
    }
    scale.invert = function(y) {
      return input(y);
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(Number);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(d3.interpolateRound);
    };
    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };
    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m) {
      return d3_scale_linearTickFormat(domain, m);
    };
    scale.nice = function() {
      d3_scale_nice(domain, d3_scale_linearNice);
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_linear(domain, range, interpolate, clamp);
    };
    return rescale();
  }
  function d3_scale_linearRebind(scale, linear) {
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_scale_linearNice(dx) {
    dx = Math.pow(10, Math.round(Math.log(dx) / Math.LN10) - 1);
    return dx && {
      floor: function(x) {
        return Math.floor(x / dx) * dx;
      },
      ceil: function(x) {
        return Math.ceil(x / dx) * dx;
      }
    };
  }
  function d3_scale_linearTickRange(domain, m) {
    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
    extent[2] = step;
    return extent;
  }
  function d3_scale_linearTicks(domain, m) {
    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
  }
  function d3_scale_linearTickFormat(domain, m) {
    return d3.format(",." + Math.max(0, -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + .01)) + "f");
  }
  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }
  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
    if (domain[k] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++j <= k) {
      u.push(uninterpolate(domain[j - 1], domain[j]));
      i.push(interpolate(range[j - 1], range[j]));
    }
    return function(x) {
      var j = d3.bisect(domain, x, 1, k) - 1;
      return i[j](u[j](x));
    };
  }
  d3.scale.log = function() {
    return d3_scale_log(d3.scale.linear(), d3_scale_logp);
  };
  function d3_scale_log(linear, log) {
    var pow = log.pow;
    function scale(x) {
      return linear(log(x));
    }
    scale.invert = function(x) {
      return pow(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(pow);
      log = x[0] < 0 ? d3_scale_logn : d3_scale_logp;
      pow = log.pow;
      linear.domain(x.map(log));
      return scale;
    };
    scale.nice = function() {
      linear.domain(d3_scale_nice(linear.domain(), d3_scale_niceDefault));
      return scale;
    };
    scale.ticks = function() {
      var extent = d3_scaleExtent(linear.domain()), ticks = [];
      if (extent.every(isFinite)) {
        var i = Math.floor(extent[0]), j = Math.ceil(extent[1]), u = pow(extent[0]), v = pow(extent[1]);
        if (log === d3_scale_logn) {
          ticks.push(pow(i));
          for (;i++ < j; ) for (var k = 9; k > 0; k--) ticks.push(pow(i) * k);
        } else {
          for (;i < j; i++) for (var k = 1; k < 10; k++) ticks.push(pow(i) * k);
          ticks.push(pow(i));
        }
        for (i = 0; ticks[i] < u; i++) {}
        for (j = ticks.length; ticks[j - 1] > v; j--) {}
        ticks = ticks.slice(i, j);
      }
      return ticks;
    };
    scale.tickFormat = function(n, format) {
      if (arguments.length < 2) format = d3_scale_logFormat;
      if (!arguments.length) return format;
      var k = Math.max(.1, n / scale.ticks().length), f = log === d3_scale_logn ? (e = -1e-12, 
      Math.floor) : (e = 1e-12, Math.ceil), e;
      return function(d) {
        return d / pow(f(log(d) + e)) <= k ? format(d) : "";
      };
    };
    scale.copy = function() {
      return d3_scale_log(linear.copy(), log);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  var d3_scale_logFormat = d3.format(".0e");
  function d3_scale_logp(x) {
    return Math.log(x < 0 ? 0 : x) / Math.LN10;
  }
  function d3_scale_logn(x) {
    return -Math.log(x > 0 ? 0 : -x) / Math.LN10;
  }
  d3_scale_logp.pow = function(x) {
    return Math.pow(10, x);
  };
  d3_scale_logn.pow = function(x) {
    return -Math.pow(10, -x);
  };
  d3.scale.pow = function() {
    return d3_scale_pow(d3.scale.linear(), 1);
  };
  function d3_scale_pow(linear, exponent) {
    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
    function scale(x) {
      return linear(powp(x));
    }
    scale.invert = function(x) {
      return powb(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(powb);
      linear.domain(x.map(powp));
      return scale;
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(scale.domain(), m);
    };
    scale.tickFormat = function(m) {
      return d3_scale_linearTickFormat(scale.domain(), m);
    };
    scale.nice = function() {
      return scale.domain(d3_scale_nice(scale.domain(), d3_scale_linearNice));
    };
    scale.exponent = function(x) {
      if (!arguments.length) return exponent;
      var domain = scale.domain();
      powp = d3_scale_powPow(exponent = x);
      powb = d3_scale_powPow(1 / exponent);
      return scale.domain(domain);
    };
    scale.copy = function() {
      return d3_scale_pow(linear.copy(), exponent);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_scale_powPow(e) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
    };
  }
  d3.scale.sqrt = function() {
    return d3.scale.pow().exponent(.5);
  };
  d3.scale.ordinal = function() {
    return d3_scale_ordinal([], {
      t: "range",
      a: [ [] ]
    });
  };
  function d3_scale_ordinal(domain, ranger) {
    var index, range, rangeBand;
    function scale(x) {
      return range[((index.get(x) || index.set(x, domain.push(x))) - 1) % range.length];
    }
    function steps(start, step) {
      return d3.range(domain.length).map(function(i) {
        return start + step * i;
      });
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      index = new d3_Map();
      var i = -1, n = x.length, xi;
      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
      return scale[ranger.t].apply(scale, ranger.a);
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      rangeBand = 0;
      ranger = {
        t: "range",
        a: arguments
      };
      return scale;
    };
    scale.rangePoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
      range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
      rangeBand = 0;
      ranger = {
        t: "rangePoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
      range = steps(start + step * outerPadding, step);
      if (reverse) range.reverse();
      rangeBand = step * (1 - padding);
      ranger = {
        t: "rangeBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)), error = stop - start - (domain.length - padding) * step;
      range = steps(start + Math.round(error / 2), step);
      if (reverse) range.reverse();
      rangeBand = Math.round(step * (1 - padding));
      ranger = {
        t: "rangeRoundBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeBand = function() {
      return rangeBand;
    };
    scale.rangeExtent = function() {
      return d3_scaleExtent(ranger.a[0]);
    };
    scale.copy = function() {
      return d3_scale_ordinal(domain, ranger);
    };
    return scale.domain(domain);
  }
  d3.scale.category10 = function() {
    return d3.scale.ordinal().range(d3_category10);
  };
  d3.scale.category20 = function() {
    return d3.scale.ordinal().range(d3_category20);
  };
  d3.scale.category20b = function() {
    return d3.scale.ordinal().range(d3_category20b);
  };
  d3.scale.category20c = function() {
    return d3.scale.ordinal().range(d3_category20c);
  };
  var d3_category10 = [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ];
  var d3_category20 = [ "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5" ];
  var d3_category20b = [ "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6" ];
  var d3_category20c = [ "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9" ];
  d3.scale.quantile = function() {
    return d3_scale_quantile([], []);
  };
  function d3_scale_quantile(domain, range) {
    var thresholds;
    function rescale() {
      var k = 0, q = range.length;
      thresholds = [];
      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
      return scale;
    }
    function scale(x) {
      if (isNaN(x = +x)) return NaN;
      return range[d3.bisect(thresholds, x)];
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.filter(function(d) {
        return !isNaN(d);
      }).sort(d3.ascending);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.quantiles = function() {
      return thresholds;
    };
    scale.copy = function() {
      return d3_scale_quantile(domain, range);
    };
    return rescale();
  }
  d3.scale.quantize = function() {
    return d3_scale_quantize(0, 1, [ 0, 1 ]);
  };
  function d3_scale_quantize(x0, x1, range) {
    var kx, i;
    function scale(x) {
      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
    }
    function rescale() {
      kx = range.length / (x1 - x0);
      i = range.length - 1;
      return scale;
    }
    scale.domain = function(x) {
      if (!arguments.length) return [ x0, x1 ];
      x0 = +x[0];
      x1 = +x[x.length - 1];
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_quantize(x0, x1, range);
    };
    return rescale();
  }
  d3.scale.threshold = function() {
    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
  };
  function d3_scale_threshold(domain, range) {
    function scale(x) {
      return range[d3.bisect(domain, x)];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain;
      domain = _;
      return scale;
    };
    scale.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return scale;
    };
    scale.copy = function() {
      return d3_scale_threshold(domain, range);
    };
    return scale;
  }
  d3.scale.identity = function() {
    return d3_scale_identity([ 0, 1 ]);
  };
  function d3_scale_identity(domain) {
    function identity(x) {
      return +x;
    }
    identity.invert = identity;
    identity.domain = identity.range = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(identity);
      return identity;
    };
    identity.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    identity.tickFormat = function(m) {
      return d3_scale_linearTickFormat(domain, m);
    };
    identity.copy = function() {
      return d3_scale_identity(domain);
    };
    return identity;
  }
  d3.svg = {};
  d3.svg.arc = function() {
    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function arc() {
      var r0 = innerRadius.apply(this, arguments), r1 = outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) + d3_svg_arcOffset, a1 = endAngle.apply(this, arguments) + d3_svg_arcOffset, da = (a1 < a0 && (da = a0, 
      a0 = a1, a1 = da), a1 - a0), df = da < π ? "0" : "1", c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      return da >= d3_svg_arcMax ? r0 ? "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "M0," + r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + -r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + r0 + "Z" : "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "Z" : r0 ? "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L" + r0 * c1 + "," + r0 * s1 + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0 + "Z" : "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L0,0" + "Z";
    }
    arc.innerRadius = function(v) {
      if (!arguments.length) return innerRadius;
      innerRadius = d3_functor(v);
      return arc;
    };
    arc.outerRadius = function(v) {
      if (!arguments.length) return outerRadius;
      outerRadius = d3_functor(v);
      return arc;
    };
    arc.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return arc;
    };
    arc.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return arc;
    };
    arc.centroid = function() {
      var r = (innerRadius.apply(this, arguments) + outerRadius.apply(this, arguments)) / 2, a = (startAngle.apply(this, arguments) + endAngle.apply(this, arguments)) / 2 + d3_svg_arcOffset;
      return [ Math.cos(a) * r, Math.sin(a) * r ];
    };
    return arc;
  };
  var d3_svg_arcOffset = -π / 2, d3_svg_arcMax = 2 * π - 1e-6;
  function d3_svg_arcInnerRadius(d) {
    return d.innerRadius;
  }
  function d3_svg_arcOuterRadius(d) {
    return d.outerRadius;
  }
  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }
  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }
  function d3_svg_line(projection) {
    var x = d3_svg_lineX, y = d3_svg_lineY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
    function line(data) {
      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
      function segment() {
        segments.push("M", interpolate(projection(points), tension));
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
        } else if (points.length) {
          segment();
          points = [];
        }
      }
      if (points.length) segment();
      return segments.length ? segments.join("") : null;
    }
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
  }
  d3.svg.line = function() {
    return d3_svg_line(d3_identity);
  };
  function d3_svg_lineX(d) {
    return d[0];
  }
  function d3_svg_lineY(d) {
    return d[1];
  }
  var d3_svg_lineInterpolators = d3.map({
    linear: d3_svg_lineLinear,
    "linear-closed": d3_svg_lineLinearClosed,
    "step-before": d3_svg_lineStepBefore,
    "step-after": d3_svg_lineStepAfter,
    basis: d3_svg_lineBasis,
    "basis-open": d3_svg_lineBasisOpen,
    "basis-closed": d3_svg_lineBasisClosed,
    bundle: d3_svg_lineBundle,
    cardinal: d3_svg_lineCardinal,
    "cardinal-open": d3_svg_lineCardinalOpen,
    "cardinal-closed": d3_svg_lineCardinalClosed,
    monotone: d3_svg_lineMonotone
  });
  d3_svg_lineInterpolators.forEach(function(key, value) {
    value.key = key;
    value.closed = /-closed$/.test(key);
  });
  function d3_svg_lineLinear(points) {
    return points.join("L");
  }
  function d3_svg_lineLinearClosed(points) {
    return d3_svg_lineLinear(points) + "Z";
  }
  function d3_svg_lineStepBefore(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepAfter(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
    return path.join("");
  }
  function d3_svg_lineCardinalOpen(points, tension) {
    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1), d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineCardinalClosed(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
  }
  function d3_svg_lineCardinal(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineHermite(points, tangents) {
    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
      return d3_svg_lineLinear(points);
    }
    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
    if (quad) {
      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
      p0 = points[1];
      pi = 2;
    }
    if (tangents.length > 1) {
      t = tangents[1];
      p = points[pi];
      pi++;
      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      for (var i = 2; i < tangents.length; i++, pi++) {
        p = points[pi];
        t = tangents[i];
        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      }
    }
    if (quad) {
      var lp = points[pi];
      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }
    return path;
  }
  function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
    while (++i < n) {
      p0 = p1;
      p1 = p2;
      p2 = points[i];
      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
    }
    return tangents;
  }
  function d3_svg_lineBasis(points) {
    if (points.length < 3) return d3_svg_lineLinear(points);
    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0 ];
    d3_svg_lineBasisBezier(path, px, py);
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    i = -1;
    while (++i < 2) {
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisOpen(points) {
    if (points.length < 4) return d3_svg_lineLinear(points);
    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
    while (++i < 3) {
      pi = points[i];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
    --i;
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisClosed(points) {
    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
    while (++i < 4) {
      pi = points[i % n];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    --i;
    while (++i < m) {
      pi = points[i % n];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBundle(points, tension) {
    var n = points.length - 1;
    if (n) {
      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
      while (++i <= n) {
        p = points[i];
        t = i / n;
        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
      }
    }
    return d3_svg_lineBasis(points);
  }
  function d3_svg_lineDot4(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
  function d3_svg_lineBasisBezier(path, x, y) {
    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
  }
  function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
  }
  function d3_svg_lineFiniteDifferences(points) {
    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
  }
  function d3_svg_lineMonotoneTangents(points) {
    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
    while (++i < j) {
      d = d3_svg_lineSlope(points[i], points[i + 1]);
      if (Math.abs(d) < 1e-6) {
        m[i] = m[i + 1] = 0;
      } else {
        a = m[i] / d;
        b = m[i + 1] / d;
        s = a * a + b * b;
        if (s > 9) {
          s = d * 3 / Math.sqrt(s);
          m[i] = s * a;
          m[i + 1] = s * b;
        }
      }
    }
    i = -1;
    while (++i <= j) {
      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
      tangents.push([ s || 0, m[i] * s || 0 ]);
    }
    return tangents;
  }
  function d3_svg_lineMonotone(points) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
  }
  d3.svg.line.radial = function() {
    var line = d3_svg_line(d3_svg_lineRadial);
    line.radius = line.x, delete line.x;
    line.angle = line.y, delete line.y;
    return line;
  };
  function d3_svg_lineRadial(points) {
    var point, i = -1, n = points.length, r, a;
    while (++i < n) {
      point = points[i];
      r = point[0];
      a = point[1] + d3_svg_arcOffset;
      point[0] = r * Math.cos(a);
      point[1] = r * Math.sin(a);
    }
    return points;
  }
  function d3_svg_area(projection) {
    var x0 = d3_svg_lineX, x1 = d3_svg_lineX, y0 = 0, y1 = d3_svg_lineY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
    function area(data) {
      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
        return x;
      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
        return y;
      } : d3_functor(y1), x, y;
      function segment() {
        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
        } else if (points0.length) {
          segment();
          points0 = [];
          points1 = [];
        }
      }
      if (points0.length) segment();
      return segments.length ? segments.join("") : null;
    }
    area.x = function(_) {
      if (!arguments.length) return x1;
      x0 = x1 = _;
      return area;
    };
    area.x0 = function(_) {
      if (!arguments.length) return x0;
      x0 = _;
      return area;
    };
    area.x1 = function(_) {
      if (!arguments.length) return x1;
      x1 = _;
      return area;
    };
    area.y = function(_) {
      if (!arguments.length) return y1;
      y0 = y1 = _;
      return area;
    };
    area.y0 = function(_) {
      if (!arguments.length) return y0;
      y0 = _;
      return area;
    };
    area.y1 = function(_) {
      if (!arguments.length) return y1;
      y1 = _;
      return area;
    };
    area.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return area;
    };
    area.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      interpolateReverse = interpolate.reverse || interpolate;
      L = interpolate.closed ? "M" : "L";
      return area;
    };
    area.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return area;
    };
    return area;
  }
  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
  d3.svg.area = function() {
    return d3_svg_area(d3_identity);
  };
  d3.svg.area.radial = function() {
    var area = d3_svg_area(d3_svg_lineRadial);
    area.radius = area.x, delete area.x;
    area.innerRadius = area.x0, delete area.x0;
    area.outerRadius = area.x1, delete area.x1;
    area.angle = area.y, delete area.y;
    area.startAngle = area.y0, delete area.y0;
    area.endAngle = area.y1, delete area.y1;
    return area;
  };
  d3.svg.chord = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
    }
    function subgroup(self, f, d, i) {
      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset, a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
      return {
        r: r,
        a0: a0,
        a1: a1,
        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
      };
    }
    function equals(a, b) {
      return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
    }
    function curve(r0, p0, r1, p1) {
      return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
    return chord;
  };
  function d3_svg_chordRadius(d) {
    return d.radius;
  }
  d3.svg.diagonal = function() {
    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
    function diagonal(d, i) {
      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
        x: p0.x,
        y: m
      }, {
        x: p3.x,
        y: m
      }, p3 ];
      p = p.map(projection);
      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
    }
    diagonal.source = function(x) {
      if (!arguments.length) return source;
      source = d3_functor(x);
      return diagonal;
    };
    diagonal.target = function(x) {
      if (!arguments.length) return target;
      target = d3_functor(x);
      return diagonal;
    };
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    return diagonal;
  };
  function d3_svg_diagonalProjection(d) {
    return [ d.x, d.y ];
  }
  d3.svg.diagonal.radial = function() {
    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
    diagonal.projection = function(x) {
      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
    };
    return diagonal;
  };
  function d3_svg_diagonalRadialProjection(projection) {
    return function() {
      var d = projection.apply(this, arguments), r = d[0], a = d[1] + d3_svg_arcOffset;
      return [ r * Math.cos(a), r * Math.sin(a) ];
    };
  }
  d3.svg.symbol = function() {
    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
    function symbol(d, i) {
      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
    }
    symbol.type = function(x) {
      if (!arguments.length) return type;
      type = d3_functor(x);
      return symbol;
    };
    symbol.size = function(x) {
      if (!arguments.length) return size;
      size = d3_functor(x);
      return symbol;
    };
    return symbol;
  };
  function d3_svg_symbolSize() {
    return 64;
  }
  function d3_svg_symbolType() {
    return "circle";
  }
  function d3_svg_symbolCircle(size) {
    var r = Math.sqrt(size / π);
    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
  }
  var d3_svg_symbols = d3.map({
    circle: d3_svg_symbolCircle,
    cross: function(size) {
      var r = Math.sqrt(size / 5) / 2;
      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
    },
    diamond: function(size) {
      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
    },
    square: function(size) {
      var r = Math.sqrt(size) / 2;
      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
    },
    "triangle-down": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
    },
    "triangle-up": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
    }
  });
  d3.svg.symbolTypes = d3_svg_symbols.keys();
  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
  d3.svg.axis = function() {
    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, tickMajorSize = 6, tickMinorSize = 6, tickEndSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_, tickSubdivide = 0;
    function axis(g) {
      g.each(function() {
        var g = d3.select(this);
        var ticks = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain() : tickValues, tickFormat = tickFormat_ == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String : tickFormat_;
        var subticks = d3_svg_axisSubdivide(scale, ticks, tickSubdivide), subtick = g.selectAll(".tick.minor").data(subticks, String), subtickEnter = subtick.enter().insert("line", ".tick").attr("class", "tick minor").style("opacity", 1e-6), subtickExit = d3.transition(subtick.exit()).style("opacity", 1e-6).remove(), subtickUpdate = d3.transition(subtick).style("opacity", 1);
        var tick = g.selectAll(".tick.major").data(ticks, String), tickEnter = tick.enter().insert("g", "path").attr("class", "tick major").style("opacity", 1e-6), tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(), tickUpdate = d3.transition(tick).style("opacity", 1), tickTransform;
        var range = d3_scaleRange(scale), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
        d3.transition(path));
        var scale1 = scale.copy(), scale0 = this.__chart__ || scale1;
        this.__chart__ = scale1;
        tickEnter.append("line");
        tickEnter.append("text");
        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text");
        switch (orient) {
         case "bottom":
          {
            tickTransform = d3_svg_axisX;
            subtickEnter.attr("y2", tickMinorSize);
            subtickUpdate.attr("x2", 0).attr("y2", tickMinorSize);
            lineEnter.attr("y2", tickMajorSize);
            textEnter.attr("y", Math.max(tickMajorSize, 0) + tickPadding);
            lineUpdate.attr("x2", 0).attr("y2", tickMajorSize);
            textUpdate.attr("x", 0).attr("y", Math.max(tickMajorSize, 0) + tickPadding);
            text.attr("dy", ".71em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize + "V0H" + range[1] + "V" + tickEndSize);
            break;
          }

         case "top":
          {
            tickTransform = d3_svg_axisX;
            subtickEnter.attr("y2", -tickMinorSize);
            subtickUpdate.attr("x2", 0).attr("y2", -tickMinorSize);
            lineEnter.attr("y2", -tickMajorSize);
            textEnter.attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
            lineUpdate.attr("x2", 0).attr("y2", -tickMajorSize);
            textUpdate.attr("x", 0).attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
            text.attr("dy", "0em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize + "V0H" + range[1] + "V" + -tickEndSize);
            break;
          }

         case "left":
          {
            tickTransform = d3_svg_axisY;
            subtickEnter.attr("x2", -tickMinorSize);
            subtickUpdate.attr("x2", -tickMinorSize).attr("y2", 0);
            lineEnter.attr("x2", -tickMajorSize);
            textEnter.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding));
            lineUpdate.attr("x2", -tickMajorSize).attr("y2", 0);
            textUpdate.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding)).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "end");
            pathUpdate.attr("d", "M" + -tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize);
            break;
          }

         case "right":
          {
            tickTransform = d3_svg_axisY;
            subtickEnter.attr("x2", tickMinorSize);
            subtickUpdate.attr("x2", tickMinorSize).attr("y2", 0);
            lineEnter.attr("x2", tickMajorSize);
            textEnter.attr("x", Math.max(tickMajorSize, 0) + tickPadding);
            lineUpdate.attr("x2", tickMajorSize).attr("y2", 0);
            textUpdate.attr("x", Math.max(tickMajorSize, 0) + tickPadding).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "start");
            pathUpdate.attr("d", "M" + tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize);
            break;
          }
        }
        if (scale.ticks) {
          tickEnter.call(tickTransform, scale0);
          tickUpdate.call(tickTransform, scale1);
          tickExit.call(tickTransform, scale1);
          subtickEnter.call(tickTransform, scale0);
          subtickUpdate.call(tickTransform, scale1);
          subtickExit.call(tickTransform, scale1);
        } else {
          var dx = scale1.rangeBand() / 2, x = function(d) {
            return scale1(d) + dx;
          };
          tickEnter.call(tickTransform, x);
          tickUpdate.call(tickTransform, x);
        }
      });
    }
    axis.scale = function(x) {
      if (!arguments.length) return scale;
      scale = x;
      return axis;
    };
    axis.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
      return axis;
    };
    axis.ticks = function() {
      if (!arguments.length) return tickArguments_;
      tickArguments_ = arguments;
      return axis;
    };
    axis.tickValues = function(x) {
      if (!arguments.length) return tickValues;
      tickValues = x;
      return axis;
    };
    axis.tickFormat = function(x) {
      if (!arguments.length) return tickFormat_;
      tickFormat_ = x;
      return axis;
    };
    axis.tickSize = function(x, y) {
      if (!arguments.length) return tickMajorSize;
      var n = arguments.length - 1;
      tickMajorSize = +x;
      tickMinorSize = n > 1 ? +y : tickMajorSize;
      tickEndSize = n > 0 ? +arguments[n] : tickMajorSize;
      return axis;
    };
    axis.tickPadding = function(x) {
      if (!arguments.length) return tickPadding;
      tickPadding = +x;
      return axis;
    };
    axis.tickSubdivide = function(x) {
      if (!arguments.length) return tickSubdivide;
      tickSubdivide = +x;
      return axis;
    };
    return axis;
  };
  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };
  function d3_svg_axisX(selection, x) {
    selection.attr("transform", function(d) {
      return "translate(" + x(d) + ",0)";
    });
  }
  function d3_svg_axisY(selection, y) {
    selection.attr("transform", function(d) {
      return "translate(0," + y(d) + ")";
    });
  }
  function d3_svg_axisSubdivide(scale, ticks, m) {
    subticks = [];
    if (m && ticks.length > 1) {
      var extent = d3_scaleExtent(scale.domain()), subticks, i = -1, n = ticks.length, d = (ticks[1] - ticks[0]) / ++m, j, v;
      while (++i < n) {
        for (j = m; --j > 0; ) {
          if ((v = +ticks[i] - j * d) >= extent[0]) {
            subticks.push(v);
          }
        }
      }
      for (--i, j = 0; ++j < m && (v = +ticks[i] + j * d) < extent[1]; ) {
        subticks.push(v);
      }
    }
    return subticks;
  }
  d3.svg.brush = function() {
    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, resizes = d3_svg_brushResizes[0], extent = [ [ 0, 0 ], [ 0, 0 ] ], extentDomain;
    function brush(g) {
      g.each(function() {
        var g = d3.select(this), bg = g.selectAll(".background").data([ 0 ]), fg = g.selectAll(".extent").data([ 0 ]), tz = g.selectAll(".resize").data(resizes, String), e;
        g.style("pointer-events", "all").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
        bg.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        fg.enter().append("rect").attr("class", "extent").style("cursor", "move");
        tz.enter().append("g").attr("class", function(d) {
          return "resize " + d;
        }).style("cursor", function(d) {
          return d3_svg_brushCursor[d];
        }).append("rect").attr("x", function(d) {
          return /[ew]$/.test(d) ? -3 : null;
        }).attr("y", function(d) {
          return /^[ns]/.test(d) ? -3 : null;
        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
        tz.style("display", brush.empty() ? "none" : null);
        tz.exit().remove();
        if (x) {
          e = d3_scaleRange(x);
          bg.attr("x", e[0]).attr("width", e[1] - e[0]);
          redrawX(g);
        }
        if (y) {
          e = d3_scaleRange(y);
          bg.attr("y", e[0]).attr("height", e[1] - e[0]);
          redrawY(g);
        }
        redraw(g);
      });
    }
    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + extent[+/e$/.test(d)][0] + "," + extent[+/^s/.test(d)][1] + ")";
      });
    }
    function redrawX(g) {
      g.select(".extent").attr("x", extent[0][0]);
      g.selectAll(".extent,.n>rect,.s>rect").attr("width", extent[1][0] - extent[0][0]);
    }
    function redrawY(g) {
      g.select(".extent").attr("y", extent[0][1]);
      g.selectAll(".extent,.e>rect,.w>rect").attr("height", extent[1][1] - extent[0][1]);
    }
    function brushstart() {
      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), center, origin = mouse(), offset;
      var w = d3.select(d3_window).on("mousemove.brush", brushmove).on("mouseup.brush", brushend).on("touchmove.brush", brushmove).on("touchend.brush", brushend).on("keydown.brush", keydown).on("keyup.brush", keyup);
      if (dragging) {
        origin[0] = extent[0][0] - origin[0];
        origin[1] = extent[0][1] - origin[1];
      } else if (resizing) {
        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
        offset = [ extent[1 - ex][0] - origin[0], extent[1 - ey][1] - origin[1] ];
        origin[0] = extent[ex][0];
        origin[1] = extent[ey][1];
      } else if (d3.event.altKey) center = origin.slice();
      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
      d3.select("body").style("cursor", eventTarget.style("cursor"));
      event_({
        type: "brushstart"
      });
      brushmove();
      d3_eventCancel();
      function mouse() {
        var touches = d3.event.changedTouches;
        return touches ? d3.touches(target, touches)[0] : d3.mouse(target);
      }
      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= extent[1][0];
            origin[1] -= extent[1][1];
            dragging = 2;
          }
          d3_eventCancel();
        }
      }
      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += extent[1][0];
          origin[1] += extent[1][1];
          dragging = 0;
          d3_eventCancel();
        }
      }
      function brushmove() {
        var point = mouse(), moved = false;
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }
        if (!dragging) {
          if (d3.event.altKey) {
            if (!center) center = [ (extent[0][0] + extent[1][0]) / 2, (extent[0][1] + extent[1][1]) / 2 ];
            origin[0] = extent[+(point[0] < center[0])][0];
            origin[1] = extent[+(point[1] < center[1])][1];
          } else center = null;
        }
        if (resizingX && move1(point, x, 0)) {
          redrawX(g);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g);
          moved = true;
        }
        if (moved) {
          redraw(g);
          event_({
            type: "brush",
            mode: dragging ? "move" : "resize"
          });
        }
      }
      function move1(point, scale, i) {
        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], size = extent[1][i] - extent[0][i], min, max;
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }
        min = Math.max(r0, Math.min(r1, point[i]));
        if (dragging) {
          max = (min += position) + size;
        } else {
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }
        if (extent[0][i] !== min || extent[1][i] !== max) {
          extentDomain = null;
          extent[0][i] = min;
          extent[1][i] = max;
          return true;
        }
      }
      function brushend() {
        brushmove();
        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
        d3.select("body").style("cursor", null);
        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
        event_({
          type: "brushend"
        });
        d3_eventCancel();
      }
    }
    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      if (!arguments.length) {
        z = extentDomain || extent;
        if (x) {
          x0 = z[0][0], x1 = z[1][0];
          if (!extentDomain) {
            x0 = extent[0][0], x1 = extent[1][0];
            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
            if (x1 < x0) t = x0, x0 = x1, x1 = t;
          }
        }
        if (y) {
          y0 = z[0][1], y1 = z[1][1];
          if (!extentDomain) {
            y0 = extent[0][1], y1 = extent[1][1];
            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
            if (y1 < y0) t = y0, y0 = y1, y1 = t;
          }
        }
        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
      }
      extentDomain = [ [ 0, 0 ], [ 0, 0 ] ];
      if (x) {
        x0 = z[0], x1 = z[1];
        if (y) x0 = x0[0], x1 = x1[0];
        extentDomain[0][0] = x0, extentDomain[1][0] = x1;
        if (x.invert) x0 = x(x0), x1 = x(x1);
        if (x1 < x0) t = x0, x0 = x1, x1 = t;
        extent[0][0] = x0 | 0, extent[1][0] = x1 | 0;
      }
      if (y) {
        y0 = z[0], y1 = z[1];
        if (x) y0 = y0[1], y1 = y1[1];
        extentDomain[0][1] = y0, extentDomain[1][1] = y1;
        if (y.invert) y0 = y(y0), y1 = y(y1);
        if (y1 < y0) t = y0, y0 = y1, y1 = t;
        extent[0][1] = y0 | 0, extent[1][1] = y1 | 0;
      }
      return brush;
    };
    brush.clear = function() {
      extentDomain = null;
      extent[0][0] = extent[0][1] = extent[1][0] = extent[1][1] = 0;
      return brush;
    };
    brush.empty = function() {
      return x && extent[0][0] === extent[1][0] || y && extent[0][1] === extent[1][1];
    };
    return d3.rebind(brush, event, "on");
  };
  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
  d3.behavior = {};
  d3.behavior.drag = function() {
    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null;
    function drag() {
      this.on("mousedown.drag", mousedown).on("touchstart.drag", mousedown);
    }
    function mousedown() {
      var target = this, event_ = event.of(target, arguments), eventTarget = d3.event.target, touchId = d3.event.touches ? d3.event.changedTouches[0].identifier : null, offset, origin_ = point(), moved = 0;
      var w = d3.select(d3_window).on(touchId != null ? "touchmove.drag-" + touchId : "mousemove.drag", dragmove).on(touchId != null ? "touchend.drag-" + touchId : "mouseup.drag", dragend, true);
      if (origin) {
        offset = origin.apply(target, arguments);
        offset = [ offset.x - origin_[0], offset.y - origin_[1] ];
      } else {
        offset = [ 0, 0 ];
      }
      if (touchId == null) d3_eventCancel();
      event_({
        type: "dragstart"
      });
      function point() {
        var p = target.parentNode;
        return touchId != null ? d3.touches(p).filter(function(p) {
          return p.identifier === touchId;
        })[0] : d3.mouse(p);
      }
      function dragmove() {
        if (!target.parentNode) return dragend();
        var p = point(), dx = p[0] - origin_[0], dy = p[1] - origin_[1];
        moved |= dx | dy;
        origin_ = p;
        d3_eventCancel();
        event_({
          type: "drag",
          x: p[0] + offset[0],
          y: p[1] + offset[1],
          dx: dx,
          dy: dy
        });
      }
      function dragend() {
        event_({
          type: "dragend"
        });
        if (moved) {
          d3_eventCancel();
          if (d3.event.target === eventTarget) w.on("click.drag", click, true);
        }
        w.on(touchId != null ? "touchmove.drag-" + touchId : "mousemove.drag", null).on(touchId != null ? "touchend.drag-" + touchId : "mouseup.drag", null);
      }
      function click() {
        d3_eventCancel();
        w.on("click.drag", null);
      }
    }
    drag.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return drag;
    };
    return d3.rebind(drag, event, "on");
  };
  d3.behavior.zoom = function() {
    var translate = [ 0, 0 ], translate0, scale = 1, scale0, scaleExtent = d3_behavior_zoomInfinity, event = d3_eventDispatch(zoom, "zoom"), x0, x1, y0, y1, touchtime;
    function zoom() {
      this.on("mousedown.zoom", mousedown).on("mousemove.zoom", mousemove).on(d3_behavior_zoomWheel + ".zoom", mousewheel).on("dblclick.zoom", dblclick).on("touchstart.zoom", touchstart).on("touchmove.zoom", touchmove).on("touchend.zoom", touchstart);
    }
    zoom.translate = function(x) {
      if (!arguments.length) return translate;
      translate = x.map(Number);
      rescale();
      return zoom;
    };
    zoom.scale = function(x) {
      if (!arguments.length) return scale;
      scale = +x;
      rescale();
      return zoom;
    };
    zoom.scaleExtent = function(x) {
      if (!arguments.length) return scaleExtent;
      scaleExtent = x == null ? d3_behavior_zoomInfinity : x.map(Number);
      return zoom;
    };
    zoom.x = function(z) {
      if (!arguments.length) return x1;
      x1 = z;
      x0 = z.copy();
      translate = [ 0, 0 ];
      scale = 1;
      return zoom;
    };
    zoom.y = function(z) {
      if (!arguments.length) return y1;
      y1 = z;
      y0 = z.copy();
      translate = [ 0, 0 ];
      scale = 1;
      return zoom;
    };
    function location(p) {
      return [ (p[0] - translate[0]) / scale, (p[1] - translate[1]) / scale ];
    }
    function point(l) {
      return [ l[0] * scale + translate[0], l[1] * scale + translate[1] ];
    }
    function scaleTo(s) {
      scale = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
    }
    function translateTo(p, l) {
      l = point(l);
      translate[0] += p[0] - l[0];
      translate[1] += p[1] - l[1];
    }
    function rescale() {
      if (x1) x1.domain(x0.range().map(function(x) {
        return (x - translate[0]) / scale;
      }).map(x0.invert));
      if (y1) y1.domain(y0.range().map(function(y) {
        return (y - translate[1]) / scale;
      }).map(y0.invert));
    }
    function dispatch(event) {
      rescale();
      d3.event.preventDefault();
      event({
        type: "zoom",
        scale: scale,
        translate: translate
      });
    }
    function mousedown() {
      var target = this, event_ = event.of(target, arguments), eventTarget = d3.event.target, moved = 0, w = d3.select(d3_window).on("mousemove.zoom", mousemove).on("mouseup.zoom", mouseup), l = location(d3.mouse(target));
      d3_window.focus();
      d3_eventCancel();
      function mousemove() {
        moved = 1;
        translateTo(d3.mouse(target), l);
        dispatch(event_);
      }
      function mouseup() {
        if (moved) d3_eventCancel();
        w.on("mousemove.zoom", null).on("mouseup.zoom", null);
        if (moved && d3.event.target === eventTarget) w.on("click.zoom", click, true);
      }
      function click() {
        d3_eventCancel();
        w.on("click.zoom", null);
      }
    }
    function mousewheel() {
      if (!translate0) translate0 = location(d3.mouse(this));
      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * scale);
      translateTo(d3.mouse(this), translate0);
      dispatch(event.of(this, arguments));
    }
    function mousemove() {
      translate0 = null;
    }
    function dblclick() {
      var p = d3.mouse(this), l = location(p), k = Math.log(scale) / Math.LN2;
      scaleTo(Math.pow(2, d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1));
      translateTo(p, l);
      dispatch(event.of(this, arguments));
    }
    function touchstart() {
      var touches = d3.touches(this), now = Date.now();
      scale0 = scale;
      translate0 = {};
      touches.forEach(function(t) {
        translate0[t.identifier] = location(t);
      });
      d3_eventCancel();
      if (touches.length === 1) {
        if (now - touchtime < 500) {
          var p = touches[0], l = location(touches[0]);
          scaleTo(scale * 2);
          translateTo(p, l);
          dispatch(event.of(this, arguments));
        }
        touchtime = now;
      }
    }
    function touchmove() {
      var touches = d3.touches(this), p0 = touches[0], l0 = translate0[p0.identifier];
      if (p1 = touches[1]) {
        var p1, l1 = translate0[p1.identifier];
        p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
        l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
        scaleTo(d3.event.scale * scale0);
      }
      translateTo(p0, l0);
      touchtime = null;
      dispatch(event.of(this, arguments));
    }
    return d3.rebind(zoom, event, "on");
  };
  var d3_behavior_zoomInfinity = [ 0, Infinity ];
  var d3_behavior_zoomDelta, d3_behavior_zoomWheel = "onwheel" in document ? (d3_behavior_zoomDelta = function() {
    return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
  }, "wheel") : "onmousewheel" in document ? (d3_behavior_zoomDelta = function() {
    return d3.event.wheelDelta;
  }, "mousewheel") : (d3_behavior_zoomDelta = function() {
    return -d3.event.detail;
  }, "MozMousePixelScroll");
  d3.layout = {};
  d3.layout.bundle = function() {
    return function(links) {
      var paths = [], i = -1, n = links.length;
      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
      return paths;
    };
  };
  function d3_layout_bundlePath(link) {
    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
    while (start !== lca) {
      start = start.parent;
      points.push(start);
    }
    var k = points.length;
    while (end !== lca) {
      points.splice(k, 0, end);
      end = end.parent;
    }
    return points;
  }
  function d3_layout_bundleAncestors(node) {
    var ancestors = [], parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }
  function d3_layout_bundleLeastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    return sharedNode;
  }
  d3.layout.chord = function() {
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
      chords = [];
      groups = [];
      k = 0, i = -1;
      while (++i < n) {
        x = 0, j = -1;
        while (++j < n) {
          x += matrix[i][j];
        }
        groupSums.push(x);
        subgroupIndex.push(d3.range(n));
        k += x;
      }
      if (sortGroups) {
        groupIndex.sort(function(a, b) {
          return sortGroups(groupSums[a], groupSums[b]);
        });
      }
      if (sortSubgroups) {
        subgroupIndex.forEach(function(d, i) {
          d.sort(function(a, b) {
            return sortSubgroups(matrix[i][a], matrix[i][b]);
          });
        });
      }
      k = (2 * π - padding * n) / k;
      x = 0, i = -1;
      while (++i < n) {
        x0 = x, j = -1;
        while (++j < n) {
          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
          subgroups[di + "-" + dj] = {
            index: di,
            subindex: dj,
            startAngle: a0,
            endAngle: a1,
            value: v
          };
        }
        groups[di] = {
          index: di,
          startAngle: x0,
          endAngle: x,
          value: (x - x0) / k
        };
        x += padding;
      }
      i = -1;
      while (++i < n) {
        j = i - 1;
        while (++j < n) {
          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
          if (source.value || target.value) {
            chords.push(source.value < target.value ? {
              source: target,
              target: source
            } : {
              source: source,
              target: target
            });
          }
        }
      }
      if (sortChords) resort();
    }
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
  };
  d3.layout.force = function() {
    var force = {}, event = d3.dispatch("start", "tick", "end"), size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, gravity = .1, theta = .8, nodes = [], links = [], distances, strengths, charges;
    function repulse(node) {
      return function(quad, x1, _, x2) {
        if (quad.point !== node) {
          var dx = quad.cx - node.x, dy = quad.cy - node.y, dn = 1 / Math.sqrt(dx * dx + dy * dy);
          if ((x2 - x1) * dn < theta) {
            var k = quad.charge * dn * dn;
            node.px -= dx * k;
            node.py -= dy * k;
            return true;
          }
          if (quad.point && isFinite(dn)) {
            var k = quad.pointCharge * dn * dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
        }
        return !quad.charge;
      };
    }
    force.tick = function() {
      if ((alpha *= .99) < .005) {
        event.end({
          type: "end",
          alpha: alpha = 0
        });
        return true;
      }
      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
      for (i = 0; i < m; ++i) {
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = x * x + y * y) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1;
        if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1;
        while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }
      event.tick({
        type: "tick",
        alpha: alpha
      });
    };
    force.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return force;
    };
    force.links = function(x) {
      if (!arguments.length) return links;
      links = x;
      return force;
    };
    force.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return force;
    };
    force.linkDistance = function(x) {
      if (!arguments.length) return linkDistance;
      linkDistance = typeof x === "function" ? x : +x;
      return force;
    };
    force.distance = force.linkDistance;
    force.linkStrength = function(x) {
      if (!arguments.length) return linkStrength;
      linkStrength = typeof x === "function" ? x : +x;
      return force;
    };
    force.friction = function(x) {
      if (!arguments.length) return friction;
      friction = +x;
      return force;
    };
    force.charge = function(x) {
      if (!arguments.length) return charge;
      charge = typeof x === "function" ? x : +x;
      return force;
    };
    force.gravity = function(x) {
      if (!arguments.length) return gravity;
      gravity = +x;
      return force;
    };
    force.theta = function(x) {
      if (!arguments.length) return theta;
      theta = +x;
      return force;
    };
    force.alpha = function(x) {
      if (!arguments.length) return alpha;
      x = +x;
      if (alpha) {
        if (x > 0) alpha = x; else alpha = 0;
      } else if (x > 0) {
        event.start({
          type: "start",
          alpha: alpha = x
        });
        d3.timer(force.tick);
      }
      return force;
    };
    force.start = function() {
      var i, j, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
      for (i = 0; i < n; ++i) {
        (o = nodes[i]).index = i;
        o.weight = 0;
      }
      for (i = 0; i < m; ++i) {
        o = links[i];
        if (typeof o.source == "number") o.source = nodes[o.source];
        if (typeof o.target == "number") o.target = nodes[o.target];
        ++o.source.weight;
        ++o.target.weight;
      }
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (isNaN(o.x)) o.x = position("x", w);
        if (isNaN(o.y)) o.y = position("y", h);
        if (isNaN(o.px)) o.px = o.x;
        if (isNaN(o.py)) o.py = o.y;
      }
      distances = [];
      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
      strengths = [];
      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
      charges = [];
      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
      function position(dimension, size) {
        var neighbors = neighbor(i), j = -1, m = neighbors.length, x;
        while (++j < m) if (!isNaN(x = neighbors[j][dimension])) return x;
        return Math.random() * size;
      }
      function neighbor() {
        if (!neighbors) {
          neighbors = [];
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
        }
        return neighbors[i];
      }
      return force.resume();
    };
    force.resume = function() {
      return force.alpha(.1);
    };
    force.stop = function() {
      return force.alpha(0);
    };
    force.drag = function() {
      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
      if (!arguments.length) return drag;
      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
    };
    function dragmove(d) {
      d.px = d3.event.x, d.py = d3.event.y;
      force.resume();
    }
    return d3.rebind(force, event, "on");
  };
  function d3_layout_forceDragstart(d) {
    d.fixed |= 2;
  }
  function d3_layout_forceDragend(d) {
    d.fixed &= ~6;
  }
  function d3_layout_forceMouseover(d) {
    d.fixed |= 4;
    d.px = d.x, d.py = d.y;
  }
  function d3_layout_forceMouseout(d) {
    d.fixed &= ~4;
  }
  function d3_layout_forceAccumulate(quad, alpha, charges) {
    var cx = 0, cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      var nodes = quad.nodes, n = nodes.length, i = -1, c;
      while (++i < n) {
        c = nodes[i];
        if (c == null) continue;
        d3_layout_forceAccumulate(c, alpha, charges);
        quad.charge += c.charge;
        cx += c.charge * c.cx;
        cy += c.charge * c.cy;
      }
    }
    if (quad.point) {
      if (!quad.leaf) {
        quad.point.x += Math.random() - .5;
        quad.point.y += Math.random() - .5;
      }
      var k = alpha * charges[quad.point.index];
      quad.charge += quad.pointCharge = k;
      cx += k * quad.point.x;
      cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }
  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1;
  d3.layout.partition = function() {
    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
    function position(node, x, dx, dy) {
      var children = node.children;
      node.x = x;
      node.y = node.depth * dy;
      node.dx = dx;
      node.dy = dy;
      if (children && (n = children.length)) {
        var i = -1, n, c, d;
        dx = node.value ? dx / node.value : 0;
        while (++i < n) {
          position(c = children[i], x, d = c.value * dx, dy);
          x += d;
        }
      }
    }
    function depth(node) {
      var children = node.children, d = 0;
      if (children && (n = children.length)) {
        var i = -1, n;
        while (++i < n) d = Math.max(d, depth(children[i]));
      }
      return 1 + d;
    }
    function partition(d, i) {
      var nodes = hierarchy.call(this, d, i);
      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
      return nodes;
    }
    partition.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return partition;
    };
    return d3_layout_hierarchyRebind(partition, hierarchy);
  };
  d3.layout.pie = function() {
    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = 2 * π;
    function pie(data) {
      var values = data.map(function(d, i) {
        return +value.call(pie, d, i);
      });
      var a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle);
      var k = ((typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - startAngle) / d3.sum(values);
      var index = d3.range(data.length);
      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
        return values[j] - values[i];
      } : function(i, j) {
        return sort(data[i], data[j]);
      });
      var arcs = [];
      index.forEach(function(i) {
        var d;
        arcs[i] = {
          data: data[i],
          value: d = values[i],
          startAngle: a,
          endAngle: a += d * k
        };
      });
      return arcs;
    }
    pie.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return pie;
    };
    pie.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return pie;
    };
    pie.startAngle = function(x) {
      if (!arguments.length) return startAngle;
      startAngle = x;
      return pie;
    };
    pie.endAngle = function(x) {
      if (!arguments.length) return endAngle;
      endAngle = x;
      return pie;
    };
    return pie;
  };
  var d3_layout_pieSortByValue = {};
  d3.layout.stack = function() {
    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
    function stack(data, index) {
      var series = data.map(function(d, i) {
        return values.call(stack, d, i);
      });
      var points = series.map(function(d) {
        return d.map(function(v, i) {
          return [ x.call(stack, v, i), y.call(stack, v, i) ];
        });
      });
      var orders = order.call(stack, points, index);
      series = d3.permute(series, orders);
      points = d3.permute(points, orders);
      var offsets = offset.call(stack, points, index);
      var n = series.length, m = series[0].length, i, j, o;
      for (j = 0; j < m; ++j) {
        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
        for (i = 1; i < n; ++i) {
          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
        }
      }
      return data;
    }
    stack.values = function(x) {
      if (!arguments.length) return values;
      values = x;
      return stack;
    };
    stack.order = function(x) {
      if (!arguments.length) return order;
      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
      return stack;
    };
    stack.offset = function(x) {
      if (!arguments.length) return offset;
      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
      return stack;
    };
    stack.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      return stack;
    };
    stack.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      return stack;
    };
    stack.out = function(z) {
      if (!arguments.length) return out;
      out = z;
      return stack;
    };
    return stack;
  };
  function d3_layout_stackX(d) {
    return d.x;
  }
  function d3_layout_stackY(d) {
    return d.y;
  }
  function d3_layout_stackOut(d, y0, y) {
    d.y0 = y0;
    d.y = y;
  }
  var d3_layout_stackOrders = d3.map({
    "inside-out": function(data) {
      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
        return max[a] - max[b];
      }), top = 0, bottom = 0, tops = [], bottoms = [];
      for (i = 0; i < n; ++i) {
        j = index[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }
      return bottoms.reverse().concat(tops);
    },
    reverse: function(data) {
      return d3.range(data.length).reverse();
    },
    "default": d3_layout_stackOrderDefault
  });
  var d3_layout_stackOffsets = d3.map({
    silhouette: function(data) {
      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o > max) max = o;
        sums.push(o);
      }
      for (j = 0; j < m; ++j) {
        y0[j] = (max - sums[j]) / 2;
      }
      return y0;
    },
    wiggle: function(data) {
      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
      y0[0] = o = o0 = 0;
      for (j = 1; j < m; ++j) {
        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
          }
          s2 += s3 * data[i][j][1];
        }
        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
        if (o < o0) o0 = o;
      }
      for (j = 0; j < m; ++j) y0[j] -= o0;
      return y0;
    },
    expand: function(data) {
      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
      }
      for (j = 0; j < m; ++j) y0[j] = 0;
      return y0;
    },
    zero: d3_layout_stackOffsetZero
  });
  function d3_layout_stackOrderDefault(data) {
    return d3.range(data.length);
  }
  function d3_layout_stackOffsetZero(data) {
    var j = -1, m = data[0].length, y0 = [];
    while (++j < m) y0[j] = 0;
    return y0;
  }
  function d3_layout_stackMaxIndex(array) {
    var i = 1, j = 0, v = array[0][1], k, n = array.length;
    for (;i < n; ++i) {
      if ((k = array[i][1]) > v) {
        j = i;
        v = k;
      }
    }
    return j;
  }
  function d3_layout_stackReduceSum(d) {
    return d.reduce(d3_layout_stackSum, 0);
  }
  function d3_layout_stackSum(p, d) {
    return p + d[1];
  }
  d3.layout.histogram = function() {
    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
    function histogram(data, i) {
      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
      while (++i < m) {
        bin = bins[i] = [];
        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
        bin.y = 0;
      }
      if (m > 0) {
        i = -1;
        while (++i < n) {
          x = values[i];
          if (x >= range[0] && x <= range[1]) {
            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
            bin.y += k;
            bin.push(data[i]);
          }
        }
      }
      return bins;
    }
    histogram.value = function(x) {
      if (!arguments.length) return valuer;
      valuer = x;
      return histogram;
    };
    histogram.range = function(x) {
      if (!arguments.length) return ranger;
      ranger = d3_functor(x);
      return histogram;
    };
    histogram.bins = function(x) {
      if (!arguments.length) return binner;
      binner = typeof x === "number" ? function(range) {
        return d3_layout_histogramBinFixed(range, x);
      } : d3_functor(x);
      return histogram;
    };
    histogram.frequency = function(x) {
      if (!arguments.length) return frequency;
      frequency = !!x;
      return histogram;
    };
    return histogram;
  };
  function d3_layout_histogramBinSturges(range, values) {
    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
  }
  function d3_layout_histogramBinFixed(range, n) {
    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
    while (++x <= n) f[x] = m * x + b;
    return f;
  }
  function d3_layout_histogramRange(values) {
    return [ d3.min(values), d3.max(values) ];
  }
  d3.layout.hierarchy = function() {
    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
    function recurse(node, depth, nodes) {
      var childs = children.call(hierarchy, node, depth);
      node.depth = depth;
      nodes.push(node);
      if (childs && (n = childs.length)) {
        var i = -1, n, c = node.children = [], v = 0, j = depth + 1, d;
        while (++i < n) {
          d = recurse(childs[i], j, nodes);
          d.parent = node;
          c.push(d);
          v += d.value;
        }
        if (sort) c.sort(sort);
        if (value) node.value = v;
      } else if (value) {
        node.value = +value.call(hierarchy, node, depth) || 0;
      }
      return node;
    }
    function revalue(node, depth) {
      var children = node.children, v = 0;
      if (children && (n = children.length)) {
        var i = -1, n, j = depth + 1;
        while (++i < n) v += revalue(children[i], j);
      } else if (value) {
        v = +value.call(hierarchy, node, depth) || 0;
      }
      if (value) node.value = v;
      return v;
    }
    function hierarchy(d) {
      var nodes = [];
      recurse(d, 0, nodes);
      return nodes;
    }
    hierarchy.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return hierarchy;
    };
    hierarchy.children = function(x) {
      if (!arguments.length) return children;
      children = x;
      return hierarchy;
    };
    hierarchy.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return hierarchy;
    };
    hierarchy.revalue = function(root) {
      revalue(root, 0);
      return root;
    };
    return hierarchy;
  };
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyChildren(d) {
    return d.children;
  }
  function d3_layout_hierarchyValue(d) {
    return d.value;
  }
  function d3_layout_hierarchySort(a, b) {
    return b.value - a.value;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  d3.layout.pack = function() {
    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ];
    function pack(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0];
      root.x = 0;
      root.y = 0;
      d3_layout_treeVisitAfter(root, function(d) {
        d.r = Math.sqrt(d.value);
      });
      d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
      var w = size[0], h = size[1], k = Math.max(2 * root.r / w, 2 * root.r / h);
      if (padding > 0) {
        var dr = padding * k / 2;
        d3_layout_treeVisitAfter(root, function(d) {
          d.r += dr;
        });
        d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
        d3_layout_treeVisitAfter(root, function(d) {
          d.r -= dr;
        });
        k = Math.max(2 * root.r / w, 2 * root.r / h);
      }
      d3_layout_packTransform(root, w / 2, h / 2, 1 / k);
      return nodes;
    }
    pack.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return pack;
    };
    pack.padding = function(_) {
      if (!arguments.length) return padding;
      padding = +_;
      return pack;
    };
    return d3_layout_hierarchyRebind(pack, hierarchy);
  };
  function d3_layout_packSort(a, b) {
    return a.value - b.value;
  }
  function d3_layout_packInsert(a, b) {
    var c = a._pack_next;
    a._pack_next = b;
    b._pack_prev = a;
    b._pack_next = c;
    c._pack_prev = b;
  }
  function d3_layout_packSplice(a, b) {
    a._pack_next = b;
    b._pack_prev = a;
  }
  function d3_layout_packIntersects(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
    return dr * dr - dx * dx - dy * dy > .001;
  }
  function d3_layout_packSiblings(node) {
    if (!(nodes = node.children) || !(n = nodes.length)) return;
    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
    function bound(node) {
      xMin = Math.min(node.x - node.r, xMin);
      xMax = Math.max(node.x + node.r, xMax);
      yMin = Math.min(node.y - node.r, yMin);
      yMax = Math.max(node.y + node.r, yMax);
    }
    nodes.forEach(d3_layout_packLink);
    a = nodes[0];
    a.x = -a.r;
    a.y = 0;
    bound(a);
    if (n > 1) {
      b = nodes[1];
      b.x = b.r;
      b.y = 0;
      bound(b);
      if (n > 2) {
        c = nodes[2];
        d3_layout_packPlace(a, b, c);
        bound(c);
        d3_layout_packInsert(a, c);
        a._pack_prev = c;
        d3_layout_packInsert(c, b);
        b = a._pack_next;
        for (i = 3; i < n; i++) {
          d3_layout_packPlace(a, b, c = nodes[i]);
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
            if (d3_layout_packIntersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
              if (d3_layout_packIntersects(k, c)) {
                break;
              }
            }
          }
          if (isect) {
            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
            i--;
          } else {
            d3_layout_packInsert(a, c);
            b = c;
            bound(c);
          }
        }
      }
    }
    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
    for (i = 0; i < n; i++) {
      c = nodes[i];
      c.x -= cx;
      c.y -= cy;
      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
    }
    node.r = cr;
    nodes.forEach(d3_layout_packUnlink);
  }
  function d3_layout_packLink(node) {
    node._pack_next = node._pack_prev = node;
  }
  function d3_layout_packUnlink(node) {
    delete node._pack_next;
    delete node._pack_prev;
  }
  function d3_layout_packTransform(node, x, y, k) {
    var children = node.children;
    node.x = x += k * node.x;
    node.y = y += k * node.y;
    node.r *= k;
    if (children) {
      var i = -1, n = children.length;
      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
    }
  }
  function d3_layout_packPlace(a, b, c) {
    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
    if (db && (dx || dy)) {
      var da = b.r + c.r, dc = dx * dx + dy * dy;
      da *= da;
      db *= db;
      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
      c.x = a.x + x * dx + y * dy;
      c.y = a.y + x * dy - y * dx;
    } else {
      c.x = a.x + db;
      c.y = a.y;
    }
  }
  d3.layout.cluster = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ];
    function cluster(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
      d3_layout_treeVisitAfter(root, function(node) {
        var children = node.children;
        if (children && children.length) {
          node.x = d3_layout_clusterX(children);
          node.y = d3_layout_clusterY(children);
        } else {
          node.x = previousNode ? x += separation(node, previousNode) : 0;
          node.y = 0;
          previousNode = node;
        }
      });
      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
      d3_layout_treeVisitAfter(root, function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
      });
      return nodes;
    }
    cluster.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return cluster;
    };
    cluster.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return cluster;
    };
    return d3_layout_hierarchyRebind(cluster, hierarchy);
  };
  function d3_layout_clusterY(children) {
    return 1 + d3.max(children, function(child) {
      return child.y;
    });
  }
  function d3_layout_clusterX(children) {
    return children.reduce(function(x, child) {
      return x + child.x;
    }, 0) / children.length;
  }
  function d3_layout_clusterLeft(node) {
    var children = node.children;
    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
  }
  function d3_layout_clusterRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
  }
  d3.layout.tree = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ];
    function tree(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0];
      function firstWalk(node, previousSibling) {
        var children = node.children, layout = node._tree;
        if (children && (n = children.length)) {
          var n, firstChild = children[0], previousChild, ancestor = firstChild, child, i = -1;
          while (++i < n) {
            child = children[i];
            firstWalk(child, previousChild);
            ancestor = apportion(child, previousChild, ancestor);
            previousChild = child;
          }
          d3_layout_treeShift(node);
          var midpoint = .5 * (firstChild._tree.prelim + child._tree.prelim);
          if (previousSibling) {
            layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
            layout.mod = layout.prelim - midpoint;
          } else {
            layout.prelim = midpoint;
          }
        } else {
          if (previousSibling) {
            layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
          }
        }
      }
      function secondWalk(node, x) {
        node.x = node._tree.prelim + x;
        var children = node.children;
        if (children && (n = children.length)) {
          var i = -1, n;
          x += node._tree.mod;
          while (++i < n) {
            secondWalk(children[i], x);
          }
        }
      }
      function apportion(node, previousSibling, ancestor) {
        if (previousSibling) {
          var vip = node, vop = node, vim = previousSibling, vom = node.parent.children[0], sip = vip._tree.mod, sop = vop._tree.mod, sim = vim._tree.mod, som = vom._tree.mod, shift;
          while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
            vom = d3_layout_treeLeft(vom);
            vop = d3_layout_treeRight(vop);
            vop._tree.ancestor = node;
            shift = vim._tree.prelim + sim - vip._tree.prelim - sip + separation(vim, vip);
            if (shift > 0) {
              d3_layout_treeMove(d3_layout_treeAncestor(vim, node, ancestor), node, shift);
              sip += shift;
              sop += shift;
            }
            sim += vim._tree.mod;
            sip += vip._tree.mod;
            som += vom._tree.mod;
            sop += vop._tree.mod;
          }
          if (vim && !d3_layout_treeRight(vop)) {
            vop._tree.thread = vim;
            vop._tree.mod += sim - sop;
          }
          if (vip && !d3_layout_treeLeft(vom)) {
            vom._tree.thread = vip;
            vom._tree.mod += sip - som;
            ancestor = node;
          }
        }
        return ancestor;
      }
      d3_layout_treeVisitAfter(root, function(node, previousSibling) {
        node._tree = {
          ancestor: node,
          prelim: 0,
          mod: 0,
          change: 0,
          shift: 0,
          number: previousSibling ? previousSibling._tree.number + 1 : 0
        };
      });
      firstWalk(root);
      secondWalk(root, -root._tree.prelim);
      var left = d3_layout_treeSearch(root, d3_layout_treeLeftmost), right = d3_layout_treeSearch(root, d3_layout_treeRightmost), deep = d3_layout_treeSearch(root, d3_layout_treeDeepest), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2, y1 = deep.depth || 1;
      d3_layout_treeVisitAfter(root, function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = node.depth / y1 * size[1];
        delete node._tree;
      });
      return nodes;
    }
    tree.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return tree;
    };
    tree.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return tree;
    };
    return d3_layout_hierarchyRebind(tree, hierarchy);
  };
  function d3_layout_treeSeparation(a, b) {
    return a.parent == b.parent ? 1 : 2;
  }
  function d3_layout_treeLeft(node) {
    var children = node.children;
    return children && children.length ? children[0] : node._tree.thread;
  }
  function d3_layout_treeRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? children[n - 1] : node._tree.thread;
  }
  function d3_layout_treeSearch(node, compare) {
    var children = node.children;
    if (children && (n = children.length)) {
      var child, n, i = -1;
      while (++i < n) {
        if (compare(child = d3_layout_treeSearch(children[i], compare), node) > 0) {
          node = child;
        }
      }
    }
    return node;
  }
  function d3_layout_treeRightmost(a, b) {
    return a.x - b.x;
  }
  function d3_layout_treeLeftmost(a, b) {
    return b.x - a.x;
  }
  function d3_layout_treeDeepest(a, b) {
    return a.depth - b.depth;
  }
  function d3_layout_treeVisitAfter(node, callback) {
    function visit(node, previousSibling) {
      var children = node.children;
      if (children && (n = children.length)) {
        var child, previousChild = null, i = -1, n;
        while (++i < n) {
          child = children[i];
          visit(child, previousChild);
          previousChild = child;
        }
      }
      callback(node, previousSibling);
    }
    visit(node, null);
  }
  function d3_layout_treeShift(node) {
    var shift = 0, change = 0, children = node.children, i = children.length, child;
    while (--i >= 0) {
      child = children[i]._tree;
      child.prelim += shift;
      child.mod += shift;
      shift += child.shift + (change += child.change);
    }
  }
  function d3_layout_treeMove(ancestor, node, shift) {
    ancestor = ancestor._tree;
    node = node._tree;
    var change = shift / (node.number - ancestor.number);
    ancestor.change += change;
    node.change -= change;
    node.shift += shift;
    node.prelim += shift;
    node.mod += shift;
  }
  function d3_layout_treeAncestor(vim, node, ancestor) {
    return vim._tree.ancestor.parent == node.parent ? vim._tree.ancestor : ancestor;
  }
  d3.layout.treemap = function() {
    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
    function scale(children, k) {
      var i = -1, n = children.length, child, area;
      while (++i < n) {
        area = (child = children[i]).value * (k < 0 ? 0 : k);
        child.area = isNaN(area) || area <= 0 ? 0 : area;
      }
    }
    function squarify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while ((n = remaining.length) > 0) {
          row.push(child = remaining[n - 1]);
          row.area += child.area;
          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
            remaining.pop();
            best = score;
          } else {
            row.area -= row.pop().area;
            position(row, u, rect, false);
            u = Math.min(rect.dx, rect.dy);
            row.length = row.area = 0;
            best = Infinity;
          }
        }
        if (row.length) {
          position(row, u, rect, true);
          row.length = row.area = 0;
        }
        children.forEach(squarify);
      }
    }
    function stickify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), remaining = children.slice(), child, row = [];
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while (child = remaining.pop()) {
          row.push(child);
          row.area += child.area;
          if (child.z != null) {
            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
            row.length = row.area = 0;
          }
        }
        children.forEach(stickify);
      }
    }
    function worst(row, u) {
      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
      while (++i < n) {
        if (!(r = row[i].area)) continue;
        if (r < rmin) rmin = r;
        if (r > rmax) rmax = r;
      }
      s *= s;
      u *= u;
      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
    }
    function position(row, u, rect, flush) {
      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
      if (u == rect.dx) {
        if (flush || v > rect.dy) v = rect.dy;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dy = v;
          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
        }
        o.z = true;
        o.dx += rect.x + rect.dx - x;
        rect.y += v;
        rect.dy -= v;
      } else {
        if (flush || v > rect.dx) v = rect.dx;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dx = v;
          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
        }
        o.z = false;
        o.dy += rect.y + rect.dy - y;
        rect.x += v;
        rect.dx -= v;
      }
    }
    function treemap(d) {
      var nodes = stickies || hierarchy(d), root = nodes[0];
      root.x = 0;
      root.y = 0;
      root.dx = size[0];
      root.dy = size[1];
      if (stickies) hierarchy.revalue(root);
      scale([ root ], root.dx * root.dy / root.value);
      (stickies ? stickify : squarify)(root);
      if (sticky) stickies = nodes;
      return nodes;
    }
    treemap.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return treemap;
    };
    treemap.padding = function(x) {
      if (!arguments.length) return padding;
      function padFunction(node) {
        var p = x.call(treemap, node, node.depth);
        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
      }
      function padConstant(node) {
        return d3_layout_treemapPad(node, x);
      }
      var type;
      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
      padConstant) : padConstant;
      return treemap;
    };
    treemap.round = function(x) {
      if (!arguments.length) return round != Number;
      round = x ? Math.round : Number;
      return treemap;
    };
    treemap.sticky = function(x) {
      if (!arguments.length) return sticky;
      sticky = x;
      stickies = null;
      return treemap;
    };
    treemap.ratio = function(x) {
      if (!arguments.length) return ratio;
      ratio = x;
      return treemap;
    };
    treemap.mode = function(x) {
      if (!arguments.length) return mode;
      mode = x + "";
      return treemap;
    };
    return d3_layout_hierarchyRebind(treemap, hierarchy);
  };
  function d3_layout_treemapPadNull(node) {
    return {
      x: node.x,
      y: node.y,
      dx: node.dx,
      dy: node.dy
    };
  }
  function d3_layout_treemapPad(node, padding) {
    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
    if (dx < 0) {
      x += dx / 2;
      dx = 0;
    }
    if (dy < 0) {
      y += dy / 2;
      dy = 0;
    }
    return {
      x: x,
      y: y,
      dx: dx,
      dy: dy
    };
  }
  function d3_dsv(delimiter, mimeType) {
    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
    function dsv(url, callback) {
      return d3.xhr(url, mimeType, callback).response(response);
    }
    function response(request) {
      return dsv.parse(request.responseText);
    }
    dsv.parse = function(text) {
      var o;
      return dsv.parseRows(text, function(row) {
        if (o) return o(row);
        o = new Function("d", "return {" + row.map(function(name, i) {
          return JSON.stringify(name) + ": d[" + i + "]";
        }).join(",") + "}");
      });
    };
    dsv.parseRows = function(text, f) {
      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
      function token() {
        if (I >= N) return EOF;
        if (eol) return eol = false, EOL;
        var j = I;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          var c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.substring(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
          var c = text.charCodeAt(I++), k = 1;
          if (c === 10) eol = true; else if (c === 13) {
            eol = true;
            if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
          return text.substring(j, I - k);
        }
        return text.substring(j);
      }
      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && !(a = f(a, n++))) continue;
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }
    function formatValue(text) {
      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
    }
    return dsv;
  }
  d3.csv = d3_dsv(",", "text/csv");
  d3.tsv = d3_dsv("	", "text/tab-separated-values");
  d3.geo = {};
  d3.geo.stream = function(object, listener) {
    if (d3_geo_streamObjectType.hasOwnProperty(object.type)) {
      d3_geo_streamObjectType[object.type](object, listener);
    } else {
      d3_geo_streamGeometry(object, listener);
    }
  };
  function d3_geo_streamGeometry(geometry, listener) {
    if (d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
      d3_geo_streamGeometryType[geometry.type](geometry, listener);
    }
  }
  var d3_geo_streamObjectType = {
    Feature: function(feature, listener) {
      d3_geo_streamGeometry(feature.geometry, listener);
    },
    FeatureCollection: function(object, listener) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
    }
  };
  var d3_geo_streamGeometryType = {
    Sphere: function(object, listener) {
      listener.sphere();
    },
    Point: function(object, listener) {
      var coordinate = object.coordinates;
      listener.point(coordinate[0], coordinate[1]);
    },
    MultiPoint: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length, coordinate;
      while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1]);
    },
    LineString: function(object, listener) {
      d3_geo_streamLine(object.coordinates, listener, 0);
    },
    MultiLineString: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
    },
    Polygon: function(object, listener) {
      d3_geo_streamPolygon(object.coordinates, listener);
    },
    MultiPolygon: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
    },
    GeometryCollection: function(object, listener) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
    }
  };
  function d3_geo_streamLine(coordinates, listener, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    listener.lineStart();
    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1]);
    listener.lineEnd();
  }
  function d3_geo_streamPolygon(coordinates, listener) {
    var i = -1, n = coordinates.length;
    listener.polygonStart();
    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
    listener.polygonEnd();
  }
  function d3_geo_spherical(cartesian) {
    return [ Math.atan2(cartesian[1], cartesian[0]), Math.asin(Math.max(-1, Math.min(1, cartesian[2]))) ];
  }
  function d3_geo_sphericalEqual(a, b) {
    return Math.abs(a[0] - b[0]) < ε && Math.abs(a[1] - b[1]) < ε;
  }
  function d3_geo_cartesian(spherical) {
    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
  }
  function d3_geo_cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function d3_geo_cartesianCross(a, b) {
    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
  }
  function d3_geo_cartesianAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
  }
  function d3_geo_cartesianScale(vector, k) {
    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
  }
  function d3_geo_cartesianNormalize(d) {
    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l;
    d[1] /= l;
    d[2] /= l;
  }
  function d3_geo_resample(project) {
    var δ2 = .5, maxDepth = 16;
    function resample(stream) {
      var λ0, x0, y0, a0, b0, c0;
      var resample = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resample.lineStart = polygonLineStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resample.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x0 = NaN;
        resample.point = linePoint;
        stream.lineStart();
      }
      function linePoint(λ, φ) {
        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }
      function lineEnd() {
        resample.point = point;
        stream.lineEnd();
      }
      function polygonLineStart() {
        var λ00, φ00, x00, y00, a00, b00, c00;
        lineStart();
        resample.point = function(λ, φ) {
          linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resample.point = linePoint;
        };
        resample.lineEnd = function() {
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
          resample.lineEnd = lineEnd;
          lineEnd();
        };
      }
      return resample;
    }
    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
      if (d2 > 4 * δ2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = Math.abs(Math.abs(c) - 1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > δ2 || Math.abs((dx * dx2 + dy * dy2) / d2 - .5) > .3) {
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
        }
      }
    }
    resample.precision = function(_) {
      if (!arguments.length) return Math.sqrt(δ2);
      maxDepth = (δ2 = _ * _) > 0 && 16;
      return resample;
    };
    return resample;
  }
  d3.geo.albersUsa = function() {
    var lower48 = d3.geo.albers();
    var alaska = d3.geo.albers().rotate([ 160, 0 ]).center([ 0, 60 ]).parallels([ 55, 65 ]);
    var hawaii = d3.geo.albers().rotate([ 160, 0 ]).center([ 0, 20 ]).parallels([ 8, 18 ]);
    var puertoRico = d3.geo.albers().rotate([ 60, 0 ]).center([ 0, 10 ]).parallels([ 8, 18 ]);
    function albersUsa(coordinates) {
      return projection(coordinates)(coordinates);
    }
    function projection(point) {
      var lon = point[0], lat = point[1];
      return lat > 50 ? alaska : lon < -140 ? hawaii : lat < 21 ? puertoRico : lower48;
    }
    albersUsa.scale = function(x) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(x);
      alaska.scale(x * .6);
      hawaii.scale(x);
      puertoRico.scale(x * 1.5);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(x) {
      if (!arguments.length) return lower48.translate();
      var dz = lower48.scale(), dx = x[0], dy = x[1];
      lower48.translate(x);
      alaska.translate([ dx - .4 * dz, dy + .17 * dz ]);
      hawaii.translate([ dx - .19 * dz, dy + .2 * dz ]);
      puertoRico.translate([ dx + .58 * dz, dy + .43 * dz ]);
      return albersUsa;
    };
    return albersUsa.scale(lower48.scale());
  };
  function d3_geo_albers(φ0, φ1) {
    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
    function albers(λ, φ) {
      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
    }
    albers.invert = function(x, y) {
      var ρ0_y = ρ0 - y;
      return [ Math.atan2(x, ρ0_y) / n, Math.asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
    };
    return albers;
  }
  (d3.geo.albers = function() {
    var φ0 = 29.5 * d3_radians, φ1 = 45.5 * d3_radians, m = d3_geo_projectionMutator(d3_geo_albers), p = m(φ0, φ1);
    p.parallels = function(_) {
      if (!arguments.length) return [ φ0 * d3_degrees, φ1 * d3_degrees ];
      return m(φ0 = _[0] * d3_radians, φ1 = _[1] * d3_radians);
    };
    return p.rotate([ 98, 0 ]).center([ 0, 38 ]).scale(1e3);
  }).raw = d3_geo_albers;
  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
    return Math.sqrt(2 / (1 + cosλcosφ));
  }, function(ρ) {
    return 2 * Math.asin(ρ / 2);
  });
  (d3.geo.azimuthalEqualArea = function() {
    return d3_geo_projection(d3_geo_azimuthalEqualArea);
  }).raw = d3_geo_azimuthalEqualArea;
  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
    var c = Math.acos(cosλcosφ);
    return c && c / Math.sin(c);
  }, d3_identity);
  (d3.geo.azimuthalEquidistant = function() {
    return d3_geo_projection(d3_geo_azimuthalEquidistant);
  }).raw = d3_geo_azimuthalEquidistant;
  d3.geo.bounds = d3_geo_bounds(d3_identity);
  function d3_geo_bounds(projectStream) {
    var x0, y0, x1, y1;
    var bound = {
      point: boundPoint,
      lineStart: d3_noop,
      lineEnd: d3_noop,
      polygonStart: function() {
        bound.lineEnd = boundPolygonLineEnd;
      },
      polygonEnd: function() {
        bound.point = boundPoint;
      }
    };
    function boundPoint(x, y) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    function boundPolygonLineEnd() {
      bound.point = bound.lineEnd = d3_noop;
    }
    return function(feature) {
      y1 = x1 = -(x0 = y0 = Infinity);
      d3.geo.stream(feature, projectStream(bound));
      return [ [ x0, y0 ], [ x1, y1 ] ];
    };
  }
  d3.geo.centroid = function(object) {
    d3_geo_centroidDimension = d3_geo_centroidW = d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
    d3.geo.stream(object, d3_geo_centroid);
    var m;
    if (d3_geo_centroidW && Math.abs(m = Math.sqrt(d3_geo_centroidX * d3_geo_centroidX + d3_geo_centroidY * d3_geo_centroidY + d3_geo_centroidZ * d3_geo_centroidZ)) > ε) {
      return [ Math.atan2(d3_geo_centroidY, d3_geo_centroidX) * d3_degrees, Math.asin(Math.max(-1, Math.min(1, d3_geo_centroidZ / m))) * d3_degrees ];
    }
  };
  var d3_geo_centroidDimension, d3_geo_centroidW, d3_geo_centroidX, d3_geo_centroidY, d3_geo_centroidZ;
  var d3_geo_centroid = {
    sphere: function() {
      if (d3_geo_centroidDimension < 2) {
        d3_geo_centroidDimension = 2;
        d3_geo_centroidW = d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
      }
    },
    point: d3_geo_centroidPoint,
    lineStart: d3_geo_centroidLineStart,
    lineEnd: d3_geo_centroidLineEnd,
    polygonStart: function() {
      if (d3_geo_centroidDimension < 2) {
        d3_geo_centroidDimension = 2;
        d3_geo_centroidW = d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
      }
      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
    }
  };
  function d3_geo_centroidPoint(λ, φ) {
    if (d3_geo_centroidDimension) return;
    ++d3_geo_centroidW;
    λ *= d3_radians;
    var cosφ = Math.cos(φ *= d3_radians);
    d3_geo_centroidX += (cosφ * Math.cos(λ) - d3_geo_centroidX) / d3_geo_centroidW;
    d3_geo_centroidY += (cosφ * Math.sin(λ) - d3_geo_centroidY) / d3_geo_centroidW;
    d3_geo_centroidZ += (Math.sin(φ) - d3_geo_centroidZ) / d3_geo_centroidW;
  }
  function d3_geo_centroidRingStart() {
    var λ00, φ00;
    d3_geo_centroidDimension = 1;
    d3_geo_centroidLineStart();
    d3_geo_centroidDimension = 2;
    var linePoint = d3_geo_centroid.point;
    d3_geo_centroid.point = function(λ, φ) {
      linePoint(λ00 = λ, φ00 = φ);
    };
    d3_geo_centroid.lineEnd = function() {
      d3_geo_centroid.point(λ00, φ00);
      d3_geo_centroidLineEnd();
      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
    };
  }
  function d3_geo_centroidLineStart() {
    var x0, y0, z0;
    if (d3_geo_centroidDimension > 1) return;
    if (d3_geo_centroidDimension < 1) {
      d3_geo_centroidDimension = 1;
      d3_geo_centroidW = d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
    }
    d3_geo_centroid.point = function(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroid.point = nextPoint;
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      d3_geo_centroidW += w;
      d3_geo_centroidX += w * (x0 + (x0 = x));
      d3_geo_centroidY += w * (y0 + (y0 = y));
      d3_geo_centroidZ += w * (z0 + (z0 = z));
    }
  }
  function d3_geo_centroidLineEnd() {
    d3_geo_centroid.point = d3_geo_centroidPoint;
  }
  d3.geo.circle = function() {
    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
    function circle() {
      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
      interpolate(null, null, 1, {
        point: function(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= d3_degrees, x[1] *= d3_degrees;
        }
      });
      return {
        type: "Polygon",
        coordinates: [ ring ]
      };
    }
    circle.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return circle;
    };
    circle.angle = function(x) {
      if (!arguments.length) return angle;
      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
      return circle;
    };
    circle.precision = function(_) {
      if (!arguments.length) return precision;
      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
      return circle;
    };
    return circle.angle(90);
  };
  function d3_geo_circleInterpolate(radians, precision) {
    var cr = Math.cos(radians), sr = Math.sin(radians);
    return function(from, to, direction, listener) {
      if (from != null) {
        from = d3_geo_circleAngle(cr, from);
        to = d3_geo_circleAngle(cr, to);
        if (direction > 0 ? from < to : from > to) from += direction * 2 * π;
      } else {
        from = radians + direction * 2 * π;
        to = radians;
      }
      var point;
      for (var step = direction * precision, t = from; direction > 0 ? t > to : t < to; t -= step) {
        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
      }
    };
  }
  function d3_geo_circleAngle(cr, point) {
    var a = d3_geo_cartesian(point);
    a[0] -= cr;
    d3_geo_cartesianNormalize(a);
    var angle = Math.acos(Math.max(-1, Math.min(1, -a[1])));
    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
  }
  function d3_geo_clip(pointVisible, clipLine, interpolate) {
    return function(listener) {
      var line = clipLine(listener);
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          invisible = false;
          invisibleArea = visibleArea = 0;
          segments = [];
          listener.polygonStart();
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = d3.merge(segments);
          if (segments.length) {
            d3_geo_clipPolygon(segments, interpolate, listener);
          } else if (visibleArea < -ε || invisible && invisibleArea < -ε) {
            listener.lineStart();
            interpolate(null, null, 1, listener);
            listener.lineEnd();
          }
          listener.polygonEnd();
          segments = null;
        },
        sphere: function() {
          listener.polygonStart();
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
          listener.polygonEnd();
        }
      };
      function point(λ, φ) {
        if (pointVisible(λ, φ)) listener.point(λ, φ);
      }
      function pointLine(λ, φ) {
        line.point(λ, φ);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      var segments, visibleArea, invisibleArea, invisible;
      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), ring;
      function pointRing(λ, φ) {
        ringListener.point(λ, φ);
        ring.push([ λ, φ ]);
      }
      function ringStart() {
        ringListener.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringListener.lineEnd();
        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
        if (!n) {
          invisible = true;
          invisibleArea += d3_geo_clipAreaRing(ring, -1);
          ring = null;
          return;
        }
        ring = null;
        if (clean & 1) {
          segment = ringSegments[0];
          visibleArea += d3_geo_clipAreaRing(segment, 1);
          var n = segment.length - 1, i = -1, point;
          listener.lineStart();
          while (++i < n) listener.point((point = segment[i])[0], point[1]);
          listener.lineEnd();
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
      }
      return clip;
    };
  }
  function d3_geo_clipPolygon(segments, interpolate, listener) {
    var subject = [], clip = [];
    segments.forEach(function(segment) {
      var n = segment.length;
      if (n <= 1) return;
      var p0 = segment[0], p1 = segment[n - 1], a = {
        point: p0,
        points: segment,
        other: null,
        visited: false,
        entry: true,
        subject: true
      }, b = {
        point: p0,
        points: [ p0 ],
        other: a,
        visited: false,
        entry: false,
        subject: false
      };
      a.other = b;
      subject.push(a);
      clip.push(b);
      a = {
        point: p1,
        points: [ p1 ],
        other: null,
        visited: false,
        entry: false,
        subject: true
      };
      b = {
        point: p1,
        points: [ p1 ],
        other: a,
        visited: false,
        entry: true,
        subject: false
      };
      a.other = b;
      subject.push(a);
      clip.push(b);
    });
    clip.sort(d3_geo_clipSort);
    d3_geo_clipLinkCircular(subject);
    d3_geo_clipLinkCircular(clip);
    if (!subject.length) return;
    var start = subject[0], current, points, point;
    while (1) {
      current = start;
      while (current.visited) if ((current = current.next) === start) return;
      points = current.points;
      listener.lineStart();
      do {
        current.visited = current.other.visited = true;
        if (current.entry) {
          if (current.subject) {
            for (var i = 0; i < points.length; i++) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.point, current.next.point, 1, listener);
          }
          current = current.next;
        } else {
          if (current.subject) {
            points = current.prev.points;
            for (var i = points.length; --i >= 0; ) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.point, current.prev.point, -1, listener);
          }
          current = current.prev;
        }
        current = current.other;
        points = current.points;
      } while (!current.visited);
      listener.lineEnd();
    }
  }
  function d3_geo_clipLinkCircular(array) {
    if (!(n = array.length)) return;
    var n, i = 0, a = array[0], b;
    while (++i < n) {
      a.next = b = array[i];
      b.prev = a;
      a = b;
    }
    a.next = b = array[0];
    b.prev = a;
  }
  function d3_geo_clipSort(a, b) {
    return ((a = a.point)[0] < 0 ? a[1] - π / 2 - ε : π / 2 - a[1]) - ((b = b.point)[0] < 0 ? b[1] - π / 2 - ε : π / 2 - b[1]);
  }
  function d3_geo_clipSegmentLength1(segment) {
    return segment.length > 1;
  }
  function d3_geo_clipBufferListener() {
    var lines = [], line;
    return {
      lineStart: function() {
        lines.push(line = []);
      },
      point: function(λ, φ) {
        line.push([ λ, φ ]);
      },
      lineEnd: d3_noop,
      buffer: function() {
        var buffer = lines;
        lines = [];
        line = null;
        return buffer;
      }
    };
  }
  function d3_geo_clipAreaRing(ring, invisible) {
    if (!(n = ring.length)) return 0;
    var n, i = 0, area = 0, p = ring[0], λ = p[0], φ = p[1], cosφ = Math.cos(φ), x0 = Math.atan2(invisible * Math.sin(λ) * cosφ, Math.sin(φ)), y0 = 1 - invisible * Math.cos(λ) * cosφ, x1 = x0, x, y;
    while (++i < n) {
      p = ring[i];
      cosφ = Math.cos(φ = p[1]);
      x = Math.atan2(invisible * Math.sin(λ = p[0]) * cosφ, Math.sin(φ));
      y = 1 - invisible * Math.cos(λ) * cosφ;
      if (Math.abs(y0 - 2) < ε && Math.abs(y - 2) < ε) continue;
      if (Math.abs(y) < ε || Math.abs(y0) < ε) {} else if (Math.abs(Math.abs(x - x0) - π) < ε) {
        if (y + y0 > 2) area += 4 * (x - x0);
      } else if (Math.abs(y0 - 2) < ε) area += 4 * (x - x1); else area += ((3 * π + x - x0) % (2 * π) - π) * (y0 + y);
      x1 = x0, x0 = x, y0 = y;
    }
    return area;
  }
  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate);
  function d3_geo_clipAntimeridianLine(listener) {
    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
    return {
      lineStart: function() {
        listener.lineStart();
        clean = 1;
      },
      point: function(λ1, φ1) {
        var sλ1 = λ1 > 0 ? π : -π, dλ = Math.abs(λ1 - λ0);
        if (Math.abs(dλ - π) < ε) {
          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? π / 2 : -π / 2);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          listener.point(λ1, φ0);
          clean = 0;
        } else if (sλ0 !== sλ1 && dλ >= π) {
          if (Math.abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
          if (Math.abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          clean = 0;
        }
        listener.point(λ0 = λ1, φ0 = φ1);
        sλ0 = sλ1;
      },
      lineEnd: function() {
        listener.lineEnd();
        λ0 = φ0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
    return Math.abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
  }
  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
    var φ;
    if (from == null) {
      φ = direction * π / 2;
      listener.point(-π, φ);
      listener.point(0, φ);
      listener.point(π, φ);
      listener.point(π, 0);
      listener.point(π, -φ);
      listener.point(0, -φ);
      listener.point(-π, -φ);
      listener.point(-π, 0);
      listener.point(-π, φ);
    } else if (Math.abs(from[0] - to[0]) > ε) {
      var s = (from[0] < to[0] ? 1 : -1) * π;
      φ = direction * s / 2;
      listener.point(-s, φ);
      listener.point(0, φ);
      listener.point(s, φ);
    } else {
      listener.point(to[0], to[1]);
    }
  }
  function d3_geo_clipCircle(degrees) {
    var radians = degrees * d3_radians, cr = Math.cos(radians), interpolate = d3_geo_circleInterpolate(radians, 6 * d3_radians);
    return d3_geo_clip(visible, clipLine, interpolate);
    function visible(λ, φ) {
      return Math.cos(λ) * Math.cos(φ) > cr;
    }
    function clipLine(listener) {
      var point0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(λ, φ) {
          var point1 = [ λ, φ ], point2, v = visible(λ, φ);
          if (!point0 && (v00 = v0 = v)) listener.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
              point1[0] += ε;
              point1[1] += ε;
              v = visible(point1[0], point1[1]);
            }
          }
          if (v !== v0) {
            clean = 0;
            if (v0 = v) {
              listener.lineStart();
              point2 = intersect(point1, point0);
              listener.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              listener.point(point2[0], point2[1]);
              listener.lineEnd();
            }
            point0 = point2;
          }
          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) listener.point(point1[0], point1[1]);
          point0 = point1;
        },
        lineEnd: function() {
          if (v0) listener.lineEnd();
          point0 = null;
        },
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b) {
      var pa = d3_geo_cartesian(a, 0), pb = d3_geo_cartesian(b, 0);
      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
      d3_geo_cartesianAdd(A, B);
      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t = Math.sqrt(w * w - uu * (d3_geo_cartesianDot(A, A) - 1)), q = d3_geo_cartesianScale(u, (-w - t) / uu);
      d3_geo_cartesianAdd(q, A);
      return d3_geo_spherical(q);
    }
  }
  function d3_geo_compose(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }
  function d3_geo_equirectangular(λ, φ) {
    return [ λ, φ ];
  }
  (d3.geo.equirectangular = function() {
    return d3_geo_projection(d3_geo_equirectangular).scale(250 / π);
  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / cosλcosφ;
  }, Math.atan);
  (d3.geo.gnomonic = function() {
    return d3_geo_projection(d3_geo_gnomonic);
  }).raw = d3_geo_gnomonic;
  d3.geo.graticule = function() {
    var x1, x0, y1, y0, dx = 22.5, dy = dx, x, y, precision = 2.5;
    function graticule() {
      return {
        type: "MultiLineString",
        coordinates: lines()
      };
    }
    function lines() {
      return d3.range(Math.ceil(x0 / dx) * dx, x1, dx).map(x).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).map(y));
    }
    graticule.lines = function() {
      return lines().map(function(coordinates) {
        return {
          type: "LineString",
          coordinates: coordinates
        };
      });
    };
    graticule.outline = function() {
      return {
        type: "Polygon",
        coordinates: [ x(x0).concat(y(y1).slice(1), x(x1).reverse().slice(1), y(y0).reverse().slice(1)) ]
      };
    };
    graticule.extent = function(_) {
      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
      x0 = +_[0][0], x1 = +_[1][0];
      y0 = +_[0][1], y1 = +_[1][1];
      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
      return graticule.precision(precision);
    };
    graticule.step = function(_) {
      if (!arguments.length) return [ dx, dy ];
      dx = +_[0], dy = +_[1];
      return graticule;
    };
    graticule.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = d3_geo_graticuleX(y0, y1, precision);
      y = d3_geo_graticuleY(x0, x1, precision);
      return graticule;
    };
    return graticule.extent([ [ -180 + ε, -90 + ε ], [ 180 - ε, 90 - ε ] ]);
  };
  function d3_geo_graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - ε, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [ x, y ];
      });
    };
  }
  function d3_geo_graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - ε, dx).concat(x1);
    return function(y) {
      return x.map(function(x) {
        return [ x, y ];
      });
    };
  }
  d3.geo.interpolate = function(source, target) {
    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
  };
  function d3_geo_interpolate(x0, y0, x1, y1) {
    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = Math.acos(Math.max(-1, Math.min(1, sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0)))), k = 1 / Math.sin(d);
    function interpolate(t) {
      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
      return [ Math.atan2(y, x) / d3_radians, Math.atan2(z, Math.sqrt(x * x + y * y)) / d3_radians ];
    }
    interpolate.distance = d;
    return interpolate;
  }
  d3.geo.greatArc = function() {
    var source = d3_source, source_, target = d3_target, target_, precision = 6 * d3_radians, interpolate;
    function greatArc() {
      var p0 = source_ || source.apply(this, arguments), p1 = target_ || target.apply(this, arguments), i = interpolate || d3.geo.interpolate(p0, p1), t = 0, dt = precision / i.distance, coordinates = [ p0 ];
      while ((t += dt) < 1) coordinates.push(i(t));
      coordinates.push(p1);
      return {
        type: "LineString",
        coordinates: coordinates
      };
    }
    greatArc.distance = function() {
      return (interpolate || d3.geo.interpolate(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments))).distance;
    };
    greatArc.source = function(_) {
      if (!arguments.length) return source;
      source = _, source_ = typeof _ === "function" ? null : _;
      interpolate = source_ && target_ ? d3.geo.interpolate(source_, target_) : null;
      return greatArc;
    };
    greatArc.target = function(_) {
      if (!arguments.length) return target;
      target = _, target_ = typeof _ === "function" ? null : _;
      interpolate = source_ && target_ ? d3.geo.interpolate(source_, target_) : null;
      return greatArc;
    };
    greatArc.precision = function(_) {
      if (!arguments.length) return precision / d3_radians;
      precision = _ * d3_radians;
      return greatArc;
    };
    return greatArc;
  };
  function d3_geo_mercator(λ, φ) {
    return [ λ / (2 * π), Math.max(-.5, Math.min(+.5, Math.log(Math.tan(π / 4 + φ / 2)) / (2 * π))) ];
  }
  d3_geo_mercator.invert = function(x, y) {
    return [ 2 * π * x, 2 * Math.atan(Math.exp(2 * π * y)) - π / 2 ];
  };
  (d3.geo.mercator = function() {
    return d3_geo_projection(d3_geo_mercator).scale(500);
  }).raw = d3_geo_mercator;
  var d3_geo_orthographic = d3_geo_azimuthal(function() {
    return 1;
  }, Math.asin);
  (d3.geo.orthographic = function() {
    return d3_geo_projection(d3_geo_orthographic);
  }).raw = d3_geo_orthographic;
  d3.geo.path = function() {
    var pointRadius = 4.5, projection, context, projectStream, contextStream;
    function path(object) {
      if (object) d3.geo.stream(object, projectStream(contextStream.pointRadius(typeof pointRadius === "function" ? +pointRadius.apply(this, arguments) : pointRadius)));
      return contextStream.result();
    }
    path.area = function(object) {
      d3_geo_pathAreaSum = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathArea));
      return d3_geo_pathAreaSum;
    };
    path.centroid = function(object) {
      d3_geo_centroidDimension = d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
      return d3_geo_centroidZ ? [ d3_geo_centroidX / d3_geo_centroidZ, d3_geo_centroidY / d3_geo_centroidZ ] : undefined;
    };
    path.bounds = function(object) {
      return d3_geo_bounds(projectStream)(object);
    };
    path.projection = function(_) {
      if (!arguments.length) return projection;
      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
      return path;
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
      return path;
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : +_;
      return path;
    };
    return path.projection(d3.geo.albersUsa()).context(null);
  };
  function d3_geo_pathCircle(radius) {
    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + +2 * radius + "z";
  }
  function d3_geo_pathProjectStream(project) {
    var resample = d3_geo_resample(function(λ, φ) {
      return project([ λ * d3_degrees, φ * d3_degrees ]);
    });
    return function(stream) {
      stream = resample(stream);
      return {
        point: function(λ, φ) {
          stream.point(λ * d3_radians, φ * d3_radians);
        },
        sphere: function() {
          stream.sphere();
        },
        lineStart: function() {
          stream.lineStart();
        },
        lineEnd: function() {
          stream.lineEnd();
        },
        polygonStart: function() {
          stream.polygonStart();
        },
        polygonEnd: function() {
          stream.polygonEnd();
        }
      };
    };
  }
  function d3_geo_pathBuffer() {
    var pointCircle = d3_geo_pathCircle(4.5), buffer = [];
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointCircle = d3_geo_pathCircle(_);
        return stream;
      },
      result: function() {
        if (buffer.length) {
          var result = buffer.join("");
          buffer = [];
          return result;
        }
      }
    };
    function point(x, y) {
      buffer.push("M", x, ",", y, pointCircle);
    }
    function pointLineStart(x, y) {
      buffer.push("M", x, ",", y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      buffer.push("L", x, ",", y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      buffer.push("Z");
    }
    return stream;
  }
  function d3_geo_pathContext(context) {
    var pointRadius = 4.5;
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointRadius = _;
        return stream;
      },
      result: d3_noop
    };
    function point(x, y) {
      context.moveTo(x, y);
      context.arc(x, y, pointRadius, 0, 2 * π);
    }
    function pointLineStart(x, y) {
      context.moveTo(x, y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      context.lineTo(x, y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      context.closePath();
    }
    return stream;
  }
  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathAreaPolygon = 0;
      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
      d3_geo_pathAreaSum += Math.abs(d3_geo_pathAreaPolygon / 2);
    }
  };
  function d3_geo_pathAreaRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathArea.point = function(x, y) {
      d3_geo_pathArea.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
      x0 = x, y0 = y;
    }
    d3_geo_pathArea.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  var d3_geo_pathCentroid = {
    point: d3_geo_pathCentroidPoint,
    lineStart: d3_geo_pathCentroidLineStart,
    lineEnd: d3_geo_pathCentroidLineEnd,
    polygonStart: function() {
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
    }
  };
  function d3_geo_pathCentroidPoint(x, y) {
    if (d3_geo_centroidDimension) return;
    d3_geo_centroidX += x;
    d3_geo_centroidY += y;
    ++d3_geo_centroidZ;
  }
  function d3_geo_pathCentroidLineStart() {
    var x0, y0;
    if (d3_geo_centroidDimension !== 1) {
      if (d3_geo_centroidDimension < 1) {
        d3_geo_centroidDimension = 1;
        d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
      } else return;
    }
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      x0 = x, y0 = y;
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX += z * (x0 + x) / 2;
      d3_geo_centroidY += z * (y0 + y) / 2;
      d3_geo_centroidZ += z;
      x0 = x, y0 = y;
    }
  }
  function d3_geo_pathCentroidLineEnd() {
    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
  }
  function d3_geo_pathCentroidRingStart() {
    var x00, y00, x0, y0;
    if (d3_geo_centroidDimension < 2) {
      d3_geo_centroidDimension = 2;
      d3_geo_centroidX = d3_geo_centroidY = d3_geo_centroidZ = 0;
    }
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      var z = y0 * x - x0 * y;
      d3_geo_centroidX += z * (x0 + x);
      d3_geo_centroidY += z * (y0 + y);
      d3_geo_centroidZ += z * 3;
      x0 = x, y0 = y;
    }
    d3_geo_pathCentroid.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  d3.geo.area = function(object) {
    d3_geo_areaSum = 0;
    d3.geo.stream(object, d3_geo_area);
    return d3_geo_areaSum;
  };
  var d3_geo_areaSum, d3_geo_areaRingU, d3_geo_areaRingV;
  var d3_geo_area = {
    sphere: function() {
      d3_geo_areaSum += 4 * π;
    },
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_areaRingU = 1, d3_geo_areaRingV = 0;
      d3_geo_area.lineStart = d3_geo_areaRingStart;
    },
    polygonEnd: function() {
      var area = 2 * Math.atan2(d3_geo_areaRingV, d3_geo_areaRingU);
      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
    }
  };
  function d3_geo_areaRingStart() {
    var λ00, φ00, λ0, cosφ0, sinφ0;
    d3_geo_area.point = function(λ, φ) {
      d3_geo_area.point = nextPoint;
      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
      sinφ0 = Math.sin(φ);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      φ = φ * d3_radians / 2 + π / 4;
      var dλ = λ - λ0, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u0 = d3_geo_areaRingU, v0 = d3_geo_areaRingV, u = cosφ0 * cosφ + k * Math.cos(dλ), v = k * Math.sin(dλ);
      d3_geo_areaRingU = u0 * u - v0 * v;
      d3_geo_areaRingV = v0 * u + u0 * v;
      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
    }
    d3_geo_area.lineEnd = function() {
      nextPoint(λ00, φ00);
    };
  }
  d3.geo.projection = d3_geo_projection;
  d3.geo.projectionMutator = d3_geo_projectionMutator;
  function d3_geo_projection(project) {
    return d3_geo_projectionMutator(function() {
      return project;
    })();
  }
  function d3_geo_projectionMutator(projectAt) {
    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
      x = project(x, y);
      return [ x[0] * k + δx, δy - x[1] * k ];
    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, clip = d3_geo_clipAntimeridian, clipAngle = null;
    function projection(point) {
      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
      return [ point[0] * k + δx, δy - point[1] * k ];
    }
    function invert(point) {
      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
    }
    projection.stream = function(stream) {
      return d3_geo_projectionRadiansRotate(rotate, clip(projectResample(stream)));
    };
    projection.clipAngle = function(_) {
      if (!arguments.length) return clipAngle;
      clip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle(clipAngle = +_);
      return projection;
    };
    projection.scale = function(_) {
      if (!arguments.length) return k;
      k = +_;
      return reset();
    };
    projection.translate = function(_) {
      if (!arguments.length) return [ x, y ];
      x = +_[0];
      y = +_[1];
      return reset();
    };
    projection.center = function(_) {
      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
      λ = _[0] % 360 * d3_radians;
      φ = _[1] % 360 * d3_radians;
      return reset();
    };
    projection.rotate = function(_) {
      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
      δλ = _[0] % 360 * d3_radians;
      δφ = _[1] % 360 * d3_radians;
      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
      return reset();
    };
    d3.rebind(projection, projectResample, "precision");
    function reset() {
      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
      var center = project(λ, φ);
      δx = x - center[0] * k;
      δy = y + center[1] * k;
      return projection;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return reset();
    };
  }
  function d3_geo_projectionRadiansRotate(rotate, stream) {
    return {
      point: function(x, y) {
        y = rotate(x * d3_radians, y * d3_radians), x = y[0];
        stream.point(x > π ? x - 2 * π : x < -π ? x + 2 * π : x, y[1]);
      },
      sphere: function() {
        stream.sphere();
      },
      lineStart: function() {
        stream.lineStart();
      },
      lineEnd: function() {
        stream.lineEnd();
      },
      polygonStart: function() {
        stream.polygonStart();
      },
      polygonEnd: function() {
        stream.polygonEnd();
      }
    };
  }
  function d3_geo_rotation(δλ, δφ, δγ) {
    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_equirectangular;
  }
  function d3_geo_forwardRotationλ(δλ) {
    return function(λ, φ) {
      return λ += δλ, [ λ > π ? λ - 2 * π : λ < -π ? λ + 2 * π : λ, φ ];
    };
  }
  function d3_geo_rotationλ(δλ) {
    var rotation = d3_geo_forwardRotationλ(δλ);
    rotation.invert = d3_geo_forwardRotationλ(-δλ);
    return rotation;
  }
  function d3_geo_rotationφγ(δφ, δγ) {
    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
    function rotation(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), Math.asin(Math.max(-1, Math.min(1, k * cosδγ + y * sinδγ))) ];
    }
    rotation.invert = function(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), Math.asin(Math.max(-1, Math.min(1, k * cosδφ - x * sinδφ))) ];
    };
    return rotation;
  }
  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / (1 + cosλcosφ);
  }, function(ρ) {
    return 2 * Math.atan(ρ);
  });
  (d3.geo.stereographic = function() {
    return d3_geo_projection(d3_geo_stereographic);
  }).raw = d3_geo_stereographic;
  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(λ, φ) {
      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
    }
    azimuthal.invert = function(x, y) {
      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
    };
    return azimuthal;
  }
  d3.geom = {};
  d3.geom.hull = function(vertices) {
    if (vertices.length < 3) return [];
    var len = vertices.length, plen = len - 1, points = [], stack = [], i, j, h = 0, x1, y1, x2, y2, u, v, a, sp;
    for (i = 1; i < len; ++i) {
      if (vertices[i][1] < vertices[h][1]) {
        h = i;
      } else if (vertices[i][1] == vertices[h][1]) {
        h = vertices[i][0] < vertices[h][0] ? i : h;
      }
    }
    for (i = 0; i < len; ++i) {
      if (i === h) continue;
      y1 = vertices[i][1] - vertices[h][1];
      x1 = vertices[i][0] - vertices[h][0];
      points.push({
        angle: Math.atan2(y1, x1),
        index: i
      });
    }
    points.sort(function(a, b) {
      return a.angle - b.angle;
    });
    a = points[0].angle;
    v = points[0].index;
    u = 0;
    for (i = 1; i < plen; ++i) {
      j = points[i].index;
      if (a == points[i].angle) {
        x1 = vertices[v][0] - vertices[h][0];
        y1 = vertices[v][1] - vertices[h][1];
        x2 = vertices[j][0] - vertices[h][0];
        y2 = vertices[j][1] - vertices[h][1];
        if (x1 * x1 + y1 * y1 >= x2 * x2 + y2 * y2) {
          points[i].index = -1;
        } else {
          points[u].index = -1;
          a = points[i].angle;
          u = i;
          v = j;
        }
      } else {
        a = points[i].angle;
        u = i;
        v = j;
      }
    }
    stack.push(h);
    for (i = 0, j = 0; i < 2; ++j) {
      if (points[j].index !== -1) {
        stack.push(points[j].index);
        i++;
      }
    }
    sp = stack.length;
    for (;j < plen; ++j) {
      if (points[j].index === -1) continue;
      while (!d3_geom_hullCCW(stack[sp - 2], stack[sp - 1], points[j].index, vertices)) {
        --sp;
      }
      stack[sp++] = points[j].index;
    }
    var poly = [];
    for (i = 0; i < sp; ++i) {
      poly.push(vertices[stack[i]]);
    }
    return poly;
  };
  function d3_geom_hullCCW(i1, i2, i3, v) {
    var t, a, b, c, d, e, f;
    t = v[i1];
    a = t[0];
    b = t[1];
    t = v[i2];
    c = t[0];
    d = t[1];
    t = v[i3];
    e = t[0];
    f = t[1];
    return (f - b) * (c - a) - (d - b) * (e - a) > 0;
  }
  d3.geom.polygon = function(coordinates) {
    coordinates.area = function() {
      var i = 0, n = coordinates.length, area = coordinates[n - 1][1] * coordinates[0][0] - coordinates[n - 1][0] * coordinates[0][1];
      while (++i < n) {
        area += coordinates[i - 1][1] * coordinates[i][0] - coordinates[i - 1][0] * coordinates[i][1];
      }
      return area * .5;
    };
    coordinates.centroid = function(k) {
      var i = -1, n = coordinates.length, x = 0, y = 0, a, b = coordinates[n - 1], c;
      if (!arguments.length) k = -1 / (6 * coordinates.area());
      while (++i < n) {
        a = b;
        b = coordinates[i];
        c = a[0] * b[1] - b[0] * a[1];
        x += (a[0] + b[0]) * c;
        y += (a[1] + b[1]) * c;
      }
      return [ x * k, y * k ];
    };
    coordinates.clip = function(subject) {
      var input, i = -1, n = coordinates.length, j, m, a = coordinates[n - 1], b, c, d;
      while (++i < n) {
        input = subject.slice();
        subject.length = 0;
        b = coordinates[i];
        c = input[(m = input.length) - 1];
        j = -1;
        while (++j < m) {
          d = input[j];
          if (d3_geom_polygonInside(d, a, b)) {
            if (!d3_geom_polygonInside(c, a, b)) {
              subject.push(d3_geom_polygonIntersect(c, d, a, b));
            }
            subject.push(d);
          } else if (d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          c = d;
        }
        a = b;
      }
      return subject;
    };
    return coordinates;
  };
  function d3_geom_polygonInside(p, a, b) {
    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  }
  function d3_geom_polygonIntersect(c, d, a, b) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [ x1 + ua * x21, y1 + ua * y21 ];
  }
  d3.geom.voronoi = function(vertices) {
    var polygons = vertices.map(function() {
      return [];
    }), Z = 1e6;
    d3_voronoi_tessellate(vertices, function(e) {
      var s1, s2, x1, x2, y1, y2;
      if (e.a === 1 && e.b >= 0) {
        s1 = e.ep.r;
        s2 = e.ep.l;
      } else {
        s1 = e.ep.l;
        s2 = e.ep.r;
      }
      if (e.a === 1) {
        y1 = s1 ? s1.y : -Z;
        x1 = e.c - e.b * y1;
        y2 = s2 ? s2.y : Z;
        x2 = e.c - e.b * y2;
      } else {
        x1 = s1 ? s1.x : -Z;
        y1 = e.c - e.a * x1;
        x2 = s2 ? s2.x : Z;
        y2 = e.c - e.a * x2;
      }
      var v1 = [ x1, y1 ], v2 = [ x2, y2 ];
      polygons[e.region.l.index].push(v1, v2);
      polygons[e.region.r.index].push(v1, v2);
    });
    polygons = polygons.map(function(polygon, i) {
      var cx = vertices[i][0], cy = vertices[i][1], angle = polygon.map(function(v) {
        return Math.atan2(v[0] - cx, v[1] - cy);
      }), order = d3.range(polygon.length).sort(function(a, b) {
        return angle[a] - angle[b];
      });
      return order.filter(function(d, i) {
        return !i || angle[d] - angle[order[i - 1]] > ε;
      }).map(function(d) {
        return polygon[d];
      });
    });
    polygons.forEach(function(polygon, i) {
      var n = polygon.length;
      if (!n) return polygon.push([ -Z, -Z ], [ -Z, Z ], [ Z, Z ], [ Z, -Z ]);
      if (n > 2) return;
      var p0 = vertices[i], p1 = polygon[0], p2 = polygon[1], x0 = p0[0], y0 = p0[1], x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1], dx = Math.abs(x2 - x1), dy = y2 - y1;
      if (Math.abs(dy) < ε) {
        var y = y0 < y1 ? -Z : Z;
        polygon.push([ -Z, y ], [ Z, y ]);
      } else if (dx < ε) {
        var x = x0 < x1 ? -Z : Z;
        polygon.push([ x, -Z ], [ x, Z ]);
      } else {
        var y = (x2 - x1) * (y1 - y0) < (x1 - x0) * (y2 - y1) ? Z : -Z, z = Math.abs(dy) - dx;
        if (Math.abs(z) < ε) {
          polygon.push([ dy < 0 ? y : -y, y ]);
        } else {
          if (z > 0) y *= -1;
          polygon.push([ -Z, y ], [ Z, y ]);
        }
      }
    });
    return polygons;
  };
  var d3_voronoi_opposite = {
    l: "r",
    r: "l"
  };
  function d3_voronoi_tessellate(vertices, callback) {
    var Sites = {
      list: vertices.map(function(v, i) {
        return {
          index: i,
          x: v[0],
          y: v[1]
        };
      }).sort(function(a, b) {
        return a.y < b.y ? -1 : a.y > b.y ? 1 : a.x < b.x ? -1 : a.x > b.x ? 1 : 0;
      }),
      bottomSite: null
    };
    var EdgeList = {
      list: [],
      leftEnd: null,
      rightEnd: null,
      init: function() {
        EdgeList.leftEnd = EdgeList.createHalfEdge(null, "l");
        EdgeList.rightEnd = EdgeList.createHalfEdge(null, "l");
        EdgeList.leftEnd.r = EdgeList.rightEnd;
        EdgeList.rightEnd.l = EdgeList.leftEnd;
        EdgeList.list.unshift(EdgeList.leftEnd, EdgeList.rightEnd);
      },
      createHalfEdge: function(edge, side) {
        return {
          edge: edge,
          side: side,
          vertex: null,
          l: null,
          r: null
        };
      },
      insert: function(lb, he) {
        he.l = lb;
        he.r = lb.r;
        lb.r.l = he;
        lb.r = he;
      },
      leftBound: function(p) {
        var he = EdgeList.leftEnd;
        do {
          he = he.r;
        } while (he != EdgeList.rightEnd && Geom.rightOf(he, p));
        he = he.l;
        return he;
      },
      del: function(he) {
        he.l.r = he.r;
        he.r.l = he.l;
        he.edge = null;
      },
      right: function(he) {
        return he.r;
      },
      left: function(he) {
        return he.l;
      },
      leftRegion: function(he) {
        return he.edge == null ? Sites.bottomSite : he.edge.region[he.side];
      },
      rightRegion: function(he) {
        return he.edge == null ? Sites.bottomSite : he.edge.region[d3_voronoi_opposite[he.side]];
      }
    };
    var Geom = {
      bisect: function(s1, s2) {
        var newEdge = {
          region: {
            l: s1,
            r: s2
          },
          ep: {
            l: null,
            r: null
          }
        };
        var dx = s2.x - s1.x, dy = s2.y - s1.y, adx = dx > 0 ? dx : -dx, ady = dy > 0 ? dy : -dy;
        newEdge.c = s1.x * dx + s1.y * dy + (dx * dx + dy * dy) * .5;
        if (adx > ady) {
          newEdge.a = 1;
          newEdge.b = dy / dx;
          newEdge.c /= dx;
        } else {
          newEdge.b = 1;
          newEdge.a = dx / dy;
          newEdge.c /= dy;
        }
        return newEdge;
      },
      intersect: function(el1, el2) {
        var e1 = el1.edge, e2 = el2.edge;
        if (!e1 || !e2 || e1.region.r == e2.region.r) {
          return null;
        }
        var d = e1.a * e2.b - e1.b * e2.a;
        if (Math.abs(d) < 1e-10) {
          return null;
        }
        var xint = (e1.c * e2.b - e2.c * e1.b) / d, yint = (e2.c * e1.a - e1.c * e2.a) / d, e1r = e1.region.r, e2r = e2.region.r, el, e;
        if (e1r.y < e2r.y || e1r.y == e2r.y && e1r.x < e2r.x) {
          el = el1;
          e = e1;
        } else {
          el = el2;
          e = e2;
        }
        var rightOfSite = xint >= e.region.r.x;
        if (rightOfSite && el.side === "l" || !rightOfSite && el.side === "r") {
          return null;
        }
        return {
          x: xint,
          y: yint
        };
      },
      rightOf: function(he, p) {
        var e = he.edge, topsite = e.region.r, rightOfSite = p.x > topsite.x;
        if (rightOfSite && he.side === "l") {
          return 1;
        }
        if (!rightOfSite && he.side === "r") {
          return 0;
        }
        if (e.a === 1) {
          var dyp = p.y - topsite.y, dxp = p.x - topsite.x, fast = 0, above = 0;
          if (!rightOfSite && e.b < 0 || rightOfSite && e.b >= 0) {
            above = fast = dyp >= e.b * dxp;
          } else {
            above = p.x + p.y * e.b > e.c;
            if (e.b < 0) {
              above = !above;
            }
            if (!above) {
              fast = 1;
            }
          }
          if (!fast) {
            var dxs = topsite.x - e.region.l.x;
            above = e.b * (dxp * dxp - dyp * dyp) < dxs * dyp * (1 + 2 * dxp / dxs + e.b * e.b);
            if (e.b < 0) {
              above = !above;
            }
          }
        } else {
          var yl = e.c - e.a * p.x, t1 = p.y - yl, t2 = p.x - topsite.x, t3 = yl - topsite.y;
          above = t1 * t1 > t2 * t2 + t3 * t3;
        }
        return he.side === "l" ? above : !above;
      },
      endPoint: function(edge, side, site) {
        edge.ep[side] = site;
        if (!edge.ep[d3_voronoi_opposite[side]]) return;
        callback(edge);
      },
      distance: function(s, t) {
        var dx = s.x - t.x, dy = s.y - t.y;
        return Math.sqrt(dx * dx + dy * dy);
      }
    };
    var EventQueue = {
      list: [],
      insert: function(he, site, offset) {
        he.vertex = site;
        he.ystar = site.y + offset;
        for (var i = 0, list = EventQueue.list, l = list.length; i < l; i++) {
          var next = list[i];
          if (he.ystar > next.ystar || he.ystar == next.ystar && site.x > next.vertex.x) {
            continue;
          } else {
            break;
          }
        }
        list.splice(i, 0, he);
      },
      del: function(he) {
        for (var i = 0, ls = EventQueue.list, l = ls.length; i < l && ls[i] != he; ++i) {}
        ls.splice(i, 1);
      },
      empty: function() {
        return EventQueue.list.length === 0;
      },
      nextEvent: function(he) {
        for (var i = 0, ls = EventQueue.list, l = ls.length; i < l; ++i) {
          if (ls[i] == he) return ls[i + 1];
        }
        return null;
      },
      min: function() {
        var elem = EventQueue.list[0];
        return {
          x: elem.vertex.x,
          y: elem.ystar
        };
      },
      extractMin: function() {
        return EventQueue.list.shift();
      }
    };
    EdgeList.init();
    Sites.bottomSite = Sites.list.shift();
    var newSite = Sites.list.shift(), newIntStar;
    var lbnd, rbnd, llbnd, rrbnd, bisector;
    var bot, top, temp, p, v;
    var e, pm;
    while (true) {
      if (!EventQueue.empty()) {
        newIntStar = EventQueue.min();
      }
      if (newSite && (EventQueue.empty() || newSite.y < newIntStar.y || newSite.y == newIntStar.y && newSite.x < newIntStar.x)) {
        lbnd = EdgeList.leftBound(newSite);
        rbnd = EdgeList.right(lbnd);
        bot = EdgeList.rightRegion(lbnd);
        e = Geom.bisect(bot, newSite);
        bisector = EdgeList.createHalfEdge(e, "l");
        EdgeList.insert(lbnd, bisector);
        p = Geom.intersect(lbnd, bisector);
        if (p) {
          EventQueue.del(lbnd);
          EventQueue.insert(lbnd, p, Geom.distance(p, newSite));
        }
        lbnd = bisector;
        bisector = EdgeList.createHalfEdge(e, "r");
        EdgeList.insert(lbnd, bisector);
        p = Geom.intersect(bisector, rbnd);
        if (p) {
          EventQueue.insert(bisector, p, Geom.distance(p, newSite));
        }
        newSite = Sites.list.shift();
      } else if (!EventQueue.empty()) {
        lbnd = EventQueue.extractMin();
        llbnd = EdgeList.left(lbnd);
        rbnd = EdgeList.right(lbnd);
        rrbnd = EdgeList.right(rbnd);
        bot = EdgeList.leftRegion(lbnd);
        top = EdgeList.rightRegion(rbnd);
        v = lbnd.vertex;
        Geom.endPoint(lbnd.edge, lbnd.side, v);
        Geom.endPoint(rbnd.edge, rbnd.side, v);
        EdgeList.del(lbnd);
        EventQueue.del(rbnd);
        EdgeList.del(rbnd);
        pm = "l";
        if (bot.y > top.y) {
          temp = bot;
          bot = top;
          top = temp;
          pm = "r";
        }
        e = Geom.bisect(bot, top);
        bisector = EdgeList.createHalfEdge(e, pm);
        EdgeList.insert(llbnd, bisector);
        Geom.endPoint(e, d3_voronoi_opposite[pm], v);
        p = Geom.intersect(llbnd, bisector);
        if (p) {
          EventQueue.del(llbnd);
          EventQueue.insert(llbnd, p, Geom.distance(p, bot));
        }
        p = Geom.intersect(bisector, rrbnd);
        if (p) {
          EventQueue.insert(bisector, p, Geom.distance(p, bot));
        }
      } else {
        break;
      }
    }
    for (lbnd = EdgeList.right(EdgeList.leftEnd); lbnd != EdgeList.rightEnd; lbnd = EdgeList.right(lbnd)) {
      callback(lbnd.edge);
    }
  }
  d3.geom.delaunay = function(vertices) {
    var edges = vertices.map(function() {
      return [];
    }), triangles = [];
    d3_voronoi_tessellate(vertices, function(e) {
      edges[e.region.l.index].push(vertices[e.region.r.index]);
    });
    edges.forEach(function(edge, i) {
      var v = vertices[i], cx = v[0], cy = v[1];
      edge.forEach(function(v) {
        v.angle = Math.atan2(v[0] - cx, v[1] - cy);
      });
      edge.sort(function(a, b) {
        return a.angle - b.angle;
      });
      for (var j = 0, m = edge.length - 1; j < m; j++) {
        triangles.push([ v, edge[j], edge[j + 1] ]);
      }
    });
    return triangles;
  };
  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
    var p, i = -1, n = points.length;
    if (arguments.length < 5) {
      if (arguments.length === 3) {
        y2 = y1;
        x2 = x1;
        y1 = x1 = 0;
      } else {
        x1 = y1 = Infinity;
        x2 = y2 = -Infinity;
        while (++i < n) {
          p = points[i];
          if (p.x < x1) x1 = p.x;
          if (p.y < y1) y1 = p.y;
          if (p.x > x2) x2 = p.x;
          if (p.y > y2) y2 = p.y;
        }
      }
    }
    var dx = x2 - x1, dy = y2 - y1;
    if (dx > dy) y2 = y1 + dx; else x2 = x1 + dy;
    function insert(n, p, x1, y1, x2, y2) {
      if (isNaN(p.x) || isNaN(p.y)) return;
      if (n.leaf) {
        var v = n.point;
        if (v) {
          if (Math.abs(v.x - p.x) + Math.abs(v.y - p.y) < .01) {
            insertChild(n, p, x1, y1, x2, y2);
          } else {
            n.point = null;
            insertChild(n, v, x1, y1, x2, y2);
            insertChild(n, p, x1, y1, x2, y2);
          }
        } else {
          n.point = p;
        }
      } else {
        insertChild(n, p, x1, y1, x2, y2);
      }
    }
    function insertChild(n, p, x1, y1, x2, y2) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, right = p.x >= sx, bottom = p.y >= sy, i = (bottom << 1) + right;
      n.leaf = false;
      n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
      if (right) x1 = sx; else x2 = sx;
      if (bottom) y1 = sy; else y2 = sy;
      insert(n, p, x1, y1, x2, y2);
    }
    var root = d3_geom_quadtreeNode();
    root.add = function(p) {
      insert(root, p, x1, y1, x2, y2);
    };
    root.visit = function(f) {
      d3_geom_quadtreeVisit(f, root, x1, y1, x2, y2);
    };
    points.forEach(root.add);
    return root;
  };
  function d3_geom_quadtreeNode() {
    return {
      leaf: true,
      nodes: [],
      point: null
    };
  }
  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
    if (!f(node, x1, y1, x2, y2)) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
    }
  }
  d3.time = {};
  var d3_time = Date, d3_time_daySymbols = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
  function d3_time_utc() {
    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
  }
  d3_time_utc.prototype = {
    getDate: function() {
      return this._.getUTCDate();
    },
    getDay: function() {
      return this._.getUTCDay();
    },
    getFullYear: function() {
      return this._.getUTCFullYear();
    },
    getHours: function() {
      return this._.getUTCHours();
    },
    getMilliseconds: function() {
      return this._.getUTCMilliseconds();
    },
    getMinutes: function() {
      return this._.getUTCMinutes();
    },
    getMonth: function() {
      return this._.getUTCMonth();
    },
    getSeconds: function() {
      return this._.getUTCSeconds();
    },
    getTime: function() {
      return this._.getTime();
    },
    getTimezoneOffset: function() {
      return 0;
    },
    valueOf: function() {
      return this._.valueOf();
    },
    setDate: function() {
      d3_time_prototype.setUTCDate.apply(this._, arguments);
    },
    setDay: function() {
      d3_time_prototype.setUTCDay.apply(this._, arguments);
    },
    setFullYear: function() {
      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
    },
    setHours: function() {
      d3_time_prototype.setUTCHours.apply(this._, arguments);
    },
    setMilliseconds: function() {
      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
    },
    setMinutes: function() {
      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
    },
    setMonth: function() {
      d3_time_prototype.setUTCMonth.apply(this._, arguments);
    },
    setSeconds: function() {
      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
    },
    setTime: function() {
      d3_time_prototype.setTime.apply(this._, arguments);
    }
  };
  var d3_time_prototype = Date.prototype;
  var d3_time_formatDateTime = "%a %b %e %X %Y", d3_time_formatDate = "%m/%d/%Y", d3_time_formatTime = "%H:%M:%S";
  var d3_time_days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ], d3_time_dayAbbreviations = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ], d3_time_months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ], d3_time_monthAbbreviations = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  d3.time.format = function(template) {
    var n = template.length;
    function format(date) {
      var string = [], i = -1, j = 0, c, p, f;
      while (++i < n) {
        if (template.charCodeAt(i) === 37) {
          string.push(template.substring(j, i));
          if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
          if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
          string.push(c);
          j = i + 1;
        }
      }
      string.push(template.substring(j, i));
      return string.join("");
    }
    format.parse = function(string) {
      var d = {
        y: 1900,
        m: 0,
        d: 1,
        H: 0,
        M: 0,
        S: 0,
        L: 0
      }, i = d3_time_parse(d, template, string, 0);
      if (i != string.length) return null;
      if ("p" in d) d.H = d.H % 12 + d.p * 12;
      var date = new d3_time();
      date.setFullYear(d.y, d.m, d.d);
      date.setHours(d.H, d.M, d.S, d.L);
      return date;
    };
    format.toString = function() {
      return template;
    };
    return format;
  };
  function d3_time_parse(date, template, string, j) {
    var c, p, i = 0, n = template.length, m = string.length;
    while (i < n) {
      if (j >= m) return -1;
      c = template.charCodeAt(i++);
      if (c === 37) {
        p = d3_time_parsers[template.charAt(i++)];
        if (!p || (j = p(date, string, j)) < 0) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function d3_time_formatRe(names) {
    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
  }
  function d3_time_formatLookup(names) {
    var map = new d3_Map(), i = -1, n = names.length;
    while (++i < n) map.set(names[i].toLowerCase(), i);
    return map;
  }
  function d3_time_formatPad(value, fill, width) {
    value += "";
    var length = value.length;
    return length < width ? new Array(width - length + 1).join(fill) + value : value;
  }
  var d3_time_dayRe = d3_time_formatRe(d3_time_days), d3_time_dayAbbrevRe = d3_time_formatRe(d3_time_dayAbbreviations), d3_time_monthRe = d3_time_formatRe(d3_time_months), d3_time_monthLookup = d3_time_formatLookup(d3_time_months), d3_time_monthAbbrevRe = d3_time_formatRe(d3_time_monthAbbreviations), d3_time_monthAbbrevLookup = d3_time_formatLookup(d3_time_monthAbbreviations);
  var d3_time_formatPads = {
    "-": "",
    _: " ",
    "0": "0"
  };
  var d3_time_formats = {
    a: function(d) {
      return d3_time_dayAbbreviations[d.getDay()];
    },
    A: function(d) {
      return d3_time_days[d.getDay()];
    },
    b: function(d) {
      return d3_time_monthAbbreviations[d.getMonth()];
    },
    B: function(d) {
      return d3_time_months[d.getMonth()];
    },
    c: d3.time.format(d3_time_formatDateTime),
    d: function(d, p) {
      return d3_time_formatPad(d.getDate(), p, 2);
    },
    e: function(d, p) {
      return d3_time_formatPad(d.getDate(), p, 2);
    },
    H: function(d, p) {
      return d3_time_formatPad(d.getHours(), p, 2);
    },
    I: function(d, p) {
      return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
    },
    j: function(d, p) {
      return d3_time_formatPad(1 + d3.time.dayOfYear(d), p, 3);
    },
    L: function(d, p) {
      return d3_time_formatPad(d.getMilliseconds(), p, 3);
    },
    m: function(d, p) {
      return d3_time_formatPad(d.getMonth() + 1, p, 2);
    },
    M: function(d, p) {
      return d3_time_formatPad(d.getMinutes(), p, 2);
    },
    p: function(d) {
      return d.getHours() >= 12 ? "PM" : "AM";
    },
    S: function(d, p) {
      return d3_time_formatPad(d.getSeconds(), p, 2);
    },
    U: function(d, p) {
      return d3_time_formatPad(d3.time.sundayOfYear(d), p, 2);
    },
    w: function(d) {
      return d.getDay();
    },
    W: function(d, p) {
      return d3_time_formatPad(d3.time.mondayOfYear(d), p, 2);
    },
    x: d3.time.format(d3_time_formatDate),
    X: d3.time.format(d3_time_formatTime),
    y: function(d, p) {
      return d3_time_formatPad(d.getFullYear() % 100, p, 2);
    },
    Y: function(d, p) {
      return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
    },
    Z: d3_time_zone,
    "%": function() {
      return "%";
    }
  };
  var d3_time_parsers = {
    a: d3_time_parseWeekdayAbbrev,
    A: d3_time_parseWeekday,
    b: d3_time_parseMonthAbbrev,
    B: d3_time_parseMonth,
    c: d3_time_parseLocaleFull,
    d: d3_time_parseDay,
    e: d3_time_parseDay,
    H: d3_time_parseHour24,
    I: d3_time_parseHour24,
    L: d3_time_parseMilliseconds,
    m: d3_time_parseMonthNumber,
    M: d3_time_parseMinutes,
    p: d3_time_parseAmPm,
    S: d3_time_parseSeconds,
    x: d3_time_parseLocaleDate,
    X: d3_time_parseLocaleTime,
    y: d3_time_parseYear,
    Y: d3_time_parseFullYear
  };
  function d3_time_parseWeekdayAbbrev(date, string, i) {
    d3_time_dayAbbrevRe.lastIndex = 0;
    var n = d3_time_dayAbbrevRe.exec(string.substring(i));
    return n ? i += n[0].length : -1;
  }
  function d3_time_parseWeekday(date, string, i) {
    d3_time_dayRe.lastIndex = 0;
    var n = d3_time_dayRe.exec(string.substring(i));
    return n ? i += n[0].length : -1;
  }
  function d3_time_parseMonthAbbrev(date, string, i) {
    d3_time_monthAbbrevRe.lastIndex = 0;
    var n = d3_time_monthAbbrevRe.exec(string.substring(i));
    return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i += n[0].length) : -1;
  }
  function d3_time_parseMonth(date, string, i) {
    d3_time_monthRe.lastIndex = 0;
    var n = d3_time_monthRe.exec(string.substring(i));
    return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i += n[0].length) : -1;
  }
  function d3_time_parseLocaleFull(date, string, i) {
    return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
  }
  function d3_time_parseLocaleDate(date, string, i) {
    return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
  }
  function d3_time_parseLocaleTime(date, string, i) {
    return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
  }
  function d3_time_parseFullYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 4));
    return n ? (date.y = +n[0], i += n[0].length) : -1;
  }
  function d3_time_parseYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.y = d3_time_expandYear(+n[0]), i += n[0].length) : -1;
  }
  function d3_time_expandYear(d) {
    return d + (d > 68 ? 1900 : 2e3);
  }
  function d3_time_parseMonthNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.m = n[0] - 1, i += n[0].length) : -1;
  }
  function d3_time_parseDay(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.d = +n[0], i += n[0].length) : -1;
  }
  function d3_time_parseHour24(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.H = +n[0], i += n[0].length) : -1;
  }
  function d3_time_parseMinutes(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.M = +n[0], i += n[0].length) : -1;
  }
  function d3_time_parseSeconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.S = +n[0], i += n[0].length) : -1;
  }
  function d3_time_parseMilliseconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 3));
    return n ? (date.L = +n[0], i += n[0].length) : -1;
  }
  var d3_time_numberRe = /^\s*\d+/;
  function d3_time_parseAmPm(date, string, i) {
    var n = d3_time_amPmLookup.get(string.substring(i, i += 2).toLowerCase());
    return n == null ? -1 : (date.p = n, i);
  }
  var d3_time_amPmLookup = d3.map({
    am: 0,
    pm: 1
  });
  function d3_time_zone(d) {
    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = ~~(Math.abs(z) / 60), zm = Math.abs(z) % 60;
    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
  }
  d3.time.format.utc = function(template) {
    var local = d3.time.format(template);
    function format(date) {
      try {
        d3_time = d3_time_utc;
        var utc = new d3_time();
        utc._ = date;
        return local(utc);
      } finally {
        d3_time = Date;
      }
    }
    format.parse = function(string) {
      try {
        d3_time = d3_time_utc;
        var date = local.parse(string);
        return date && date._;
      } finally {
        d3_time = Date;
      }
    };
    format.toString = local.toString;
    return format;
  };
  var d3_time_formatIso = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");
  d3.time.format.iso = Date.prototype.toISOString ? d3_time_formatIsoNative : d3_time_formatIso;
  function d3_time_formatIsoNative(date) {
    return date.toISOString();
  }
  d3_time_formatIsoNative.parse = function(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  };
  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
  function d3_time_interval(local, step, number) {
    function round(date) {
      var d0 = local(date), d1 = offset(d0, 1);
      return date - d0 < d1 - date ? d0 : d1;
    }
    function ceil(date) {
      step(date = local(new d3_time(date - 1)), 1);
      return date;
    }
    function offset(date, k) {
      step(date = new d3_time(+date), k);
      return date;
    }
    function range(t0, t1, dt) {
      var time = ceil(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          if (!(number(time) % dt)) times.push(new Date(+time));
          step(time, 1);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time, 1);
      }
      return times;
    }
    function range_utc(t0, t1, dt) {
      try {
        d3_time = d3_time_utc;
        var utc = new d3_time_utc();
        utc._ = t0;
        return range(utc, t1, dt);
      } finally {
        d3_time = Date;
      }
    }
    local.floor = local;
    local.round = round;
    local.ceil = ceil;
    local.offset = offset;
    local.range = range;
    var utc = local.utc = d3_time_interval_utc(local);
    utc.floor = utc;
    utc.round = d3_time_interval_utc(round);
    utc.ceil = d3_time_interval_utc(ceil);
    utc.offset = d3_time_interval_utc(offset);
    utc.range = range_utc;
    return local;
  }
  function d3_time_interval_utc(method) {
    return function(date, k) {
      try {
        d3_time = d3_time_utc;
        var utc = new d3_time_utc();
        utc._ = date;
        return method(utc, k)._;
      } finally {
        d3_time = Date;
      }
    };
  }
  d3.time.second = d3_time_interval(function(date) {
    return new d3_time(Math.floor(date / 1e3) * 1e3);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
  }, function(date) {
    return date.getSeconds();
  });
  d3.time.seconds = d3.time.second.range;
  d3.time.seconds.utc = d3.time.second.utc.range;
  d3.time.minute = d3_time_interval(function(date) {
    return new d3_time(Math.floor(date / 6e4) * 6e4);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
  }, function(date) {
    return date.getMinutes();
  });
  d3.time.minutes = d3.time.minute.range;
  d3.time.minutes.utc = d3.time.minute.utc.range;
  d3.time.hour = d3_time_interval(function(date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new d3_time((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
  }, function(date) {
    return date.getHours();
  });
  d3.time.hours = d3.time.hour.range;
  d3.time.hours.utc = d3.time.hour.utc.range;
  d3.time.day = d3_time_interval(function(date) {
    var day = new d3_time(1970, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
  }, function(date, offset) {
    date.setDate(date.getDate() + offset);
  }, function(date) {
    return date.getDate() - 1;
  });
  d3.time.days = d3.time.day.range;
  d3.time.days.utc = d3.time.day.utc.range;
  d3.time.dayOfYear = function(date) {
    var year = d3.time.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
  };
  d3_time_daySymbols.forEach(function(day, i) {
    day = day.toLowerCase();
    i = 7 - i;
    var interval = d3.time[day] = d3_time_interval(function(date) {
      (date = d3.time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
      return date;
    }, function(date, offset) {
      date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
      var day = d3.time.year(date).getDay();
      return Math.floor((d3.time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
    });
    d3.time[day + "s"] = interval.range;
    d3.time[day + "s"].utc = interval.utc.range;
    d3.time[day + "OfYear"] = function(date) {
      var day = d3.time.year(date).getDay();
      return Math.floor((d3.time.dayOfYear(date) + (day + i) % 7) / 7);
    };
  });
  d3.time.week = d3.time.sunday;
  d3.time.weeks = d3.time.sunday.range;
  d3.time.weeks.utc = d3.time.sunday.utc.range;
  d3.time.weekOfYear = d3.time.sundayOfYear;
  d3.time.month = d3_time_interval(function(date) {
    date = d3.time.day(date);
    date.setDate(1);
    return date;
  }, function(date, offset) {
    date.setMonth(date.getMonth() + offset);
  }, function(date) {
    return date.getMonth();
  });
  d3.time.months = d3.time.month.range;
  d3.time.months.utc = d3.time.month.utc.range;
  d3.time.year = d3_time_interval(function(date) {
    date = d3.time.day(date);
    date.setMonth(0, 1);
    return date;
  }, function(date, offset) {
    date.setFullYear(date.getFullYear() + offset);
  }, function(date) {
    return date.getFullYear();
  });
  d3.time.years = d3.time.year.range;
  d3.time.years.utc = d3.time.year.utc.range;
  function d3_time_scale(linear, methods, format) {
    function scale(x) {
      return linear(x);
    }
    scale.invert = function(x) {
      return d3_time_scaleDate(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
      linear.domain(x);
      return scale;
    };
    scale.nice = function(m) {
      return scale.domain(d3_scale_nice(scale.domain(), function() {
        return m;
      }));
    };
    scale.ticks = function(m, k) {
      var extent = d3_time_scaleExtent(scale.domain());
      if (typeof m !== "function") {
        var span = extent[1] - extent[0], target = span / m, i = d3.bisect(d3_time_scaleSteps, target);
        if (i == d3_time_scaleSteps.length) return methods.year(extent, m);
        if (!i) return linear.ticks(m).map(d3_time_scaleDate);
        if (Math.log(target / d3_time_scaleSteps[i - 1]) < Math.log(d3_time_scaleSteps[i] / target)) --i;
        m = methods[i];
        k = m[1];
        m = m[0].range;
      }
      return m(extent[0], new Date(+extent[1] + 1), k);
    };
    scale.tickFormat = function() {
      return format;
    };
    scale.copy = function() {
      return d3_time_scale(linear.copy(), methods, format);
    };
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_time_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_time_scaleDate(t) {
    return new Date(t);
  }
  function d3_time_scaleFormat(formats) {
    return function(date) {
      var i = formats.length - 1, f = formats[i];
      while (!f[1](date)) f = formats[--i];
      return f[0](date);
    };
  }
  function d3_time_scaleSetYear(y) {
    var d = new Date(y, 0, 1);
    d.setFullYear(y);
    return d;
  }
  function d3_time_scaleGetYear(d) {
    var y = d.getFullYear(), d0 = d3_time_scaleSetYear(y), d1 = d3_time_scaleSetYear(y + 1);
    return y + (d - d0) / (d1 - d0);
  }
  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
  var d3_time_scaleLocalMethods = [ [ d3.time.second, 1 ], [ d3.time.second, 5 ], [ d3.time.second, 15 ], [ d3.time.second, 30 ], [ d3.time.minute, 1 ], [ d3.time.minute, 5 ], [ d3.time.minute, 15 ], [ d3.time.minute, 30 ], [ d3.time.hour, 1 ], [ d3.time.hour, 3 ], [ d3.time.hour, 6 ], [ d3.time.hour, 12 ], [ d3.time.day, 1 ], [ d3.time.day, 2 ], [ d3.time.week, 1 ], [ d3.time.month, 1 ], [ d3.time.month, 3 ], [ d3.time.year, 1 ] ];
  var d3_time_scaleLocalFormats = [ [ d3.time.format("%Y"), d3_true ], [ d3.time.format("%B"), function(d) {
    return d.getMonth();
  } ], [ d3.time.format("%b %d"), function(d) {
    return d.getDate() != 1;
  } ], [ d3.time.format("%a %d"), function(d) {
    return d.getDay() && d.getDate() != 1;
  } ], [ d3.time.format("%I %p"), function(d) {
    return d.getHours();
  } ], [ d3.time.format("%I:%M"), function(d) {
    return d.getMinutes();
  } ], [ d3.time.format(":%S"), function(d) {
    return d.getSeconds();
  } ], [ d3.time.format(".%L"), function(d) {
    return d.getMilliseconds();
  } ] ];
  var d3_time_scaleLinear = d3.scale.linear(), d3_time_scaleLocalFormat = d3_time_scaleFormat(d3_time_scaleLocalFormats);
  d3_time_scaleLocalMethods.year = function(extent, m) {
    return d3_time_scaleLinear.domain(extent.map(d3_time_scaleGetYear)).ticks(m).map(d3_time_scaleSetYear);
  };
  d3.time.scale = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
  };
  var d3_time_scaleUTCMethods = d3_time_scaleLocalMethods.map(function(m) {
    return [ m[0].utc, m[1] ];
  });
  var d3_time_scaleUTCFormats = [ [ d3.time.format.utc("%Y"), d3_true ], [ d3.time.format.utc("%B"), function(d) {
    return d.getUTCMonth();
  } ], [ d3.time.format.utc("%b %d"), function(d) {
    return d.getUTCDate() != 1;
  } ], [ d3.time.format.utc("%a %d"), function(d) {
    return d.getUTCDay() && d.getUTCDate() != 1;
  } ], [ d3.time.format.utc("%I %p"), function(d) {
    return d.getUTCHours();
  } ], [ d3.time.format.utc("%I:%M"), function(d) {
    return d.getUTCMinutes();
  } ], [ d3.time.format.utc(":%S"), function(d) {
    return d.getUTCSeconds();
  } ], [ d3.time.format.utc(".%L"), function(d) {
    return d.getUTCMilliseconds();
  } ] ];
  var d3_time_scaleUTCFormat = d3_time_scaleFormat(d3_time_scaleUTCFormats);
  function d3_time_scaleUTCSetYear(y) {
    var d = new Date(Date.UTC(y, 0, 1));
    d.setUTCFullYear(y);
    return d;
  }
  function d3_time_scaleUTCGetYear(d) {
    var y = d.getUTCFullYear(), d0 = d3_time_scaleUTCSetYear(y), d1 = d3_time_scaleUTCSetYear(y + 1);
    return y + (d - d0) / (d1 - d0);
  }
  d3_time_scaleUTCMethods.year = function(extent, m) {
    return d3_time_scaleLinear.domain(extent.map(d3_time_scaleUTCGetYear)).ticks(m).map(d3_time_scaleUTCSetYear);
  };
  d3.time.scale.utc = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleUTCMethods, d3_time_scaleUTCFormat);
  };
  return d3;
}();;

