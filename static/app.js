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

window.require.define({"application": function(exports, require, module) {
  var Application;

  module.exports = Application = {
    _errorLevels: {
      DEBUG: 10,
      INFO: 20,
      WARN: 30,
      ERROR: 40,
      CRITICAL: 50
    },
    headers: function() {
      return {
        'X-Xsrftoken': $.cookie('_xsrf'),
        'X-Errorlevel': this._errorLevels[this.errorLevel]
      };
    },
    initialize: function(attributes, options) {
      if (attributes == null) {
        attributes = {};
      }
      if (options == null) {
        options = {};
      }
      this.errorLevel = attributes.errorLevel || 'CRITICAL';
      return this.makeTorrent();
    },
    getTorrents: function() {
      var TorrentCollection;
      TorrentCollection = require('lib/torrent/collection');
      this.torrentcollection = new TorrentCollection();
      this.torrentcollection.filter({
        "and": [
          {
            "and": ["state>=0", "state<=3"]
          }
        ]
      });
      return this.torrentcollection.fetch({
        success: this.torrentcollection.draw
      });
    },
    makeTorrent: function() {
      var TorrentCollection, TorrentView;
      TorrentView = require('lib/torrent/view');
      TorrentCollection = require('lib/torrent/collection');
      this.torrentcollection = new TorrentCollection();
      this.torrentview = new TorrentView({
        collection: this.torrentcollection
      });
      this.torrentview.template = require('lib/torrent/templates/create');
      return this.torrentview.render();
    },
    runTests: function() {
      var Torrent,
        _this = this;
      Torrent = require('lib/torrent/model');
      this.torrent = new Torrent({
        id: 5
      });
      return this.torrent.fetch().then(function() {
        var TorrentView;
        TorrentView = require('lib/torrent/view');
        _this.torrentview = new TorrentView({
          model: _this.torrent
        });
        _this.torrentview.template = require('lib/torrent/templates/row');
        return _this.torrentview.render();
      });
    }
  };
  
}});

window.require.define({"helpers/view_helper": function(exports, require, module) {
  
  Handlebars.registerHelper('if_logged_in', function(options) {
    if (mediator.user) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('with', function(context, options) {
    if (!context || Handlebars.Utils.isEmpty(context)) {
      return options.inverse(this);
    } else {
      return options.fn(context);
    }
  });

  Handlebars.registerHelper('without', function(context, options) {
    var inverse;
    inverse = options.inverse;
    options.inverse = options.fn;
    options.fn = inverse;
    return Handlebars.helpers["with"].call(this, context, options);
  });

  Handlebars.registerHelper('with_user', function(options) {
    var context;
    context = mediator.user || {};
    return Handlebars.helpers["with"].call(this, context, options);
  });
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var Application;

  Application = require('application');

  $(document).on('ready', function() {
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };
    window.app = Application;
    return window.app.initialize({
      errorLevel: 'DEBUG'
    });
  });
  
}});

window.require.define({"lib/base/collection": function(exports, require, module) {
  var Collection, application,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  application = require('application');

  module.exports = Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      this.parse = __bind(this.parse, this);

      this.getName = __bind(this.getName, this);

      this.fetch = __bind(this.fetch, this);

      this.filter = __bind(this.filter, this);

      this.url = __bind(this.url, this);
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype._filter = {};

    Collection.prototype.url = function() {
      var _url;
      return _url = '/rest/' + this.getName() + '/' + '?where=' + JSON.stringify(this._filter);
    };

    Collection.prototype.filter = function(filter) {
      return this._filter = filter;
    };

    Collection.prototype.fetch = function(options) {
      if (options == null) {
        options = {};
      }
      options = _.extend(options, {
        headers: application.headers()
      });
      return Collection.__super__.fetch.call(this, options);
    };

    Collection.prototype.getName = function() {
      var funcNameRegex, results;
      funcNameRegex = /function (.{1,})\(/;
      results = funcNameRegex.exec(this.constructor.toString());
      if (results && results.length > 1) {
        return results[1].toLowerCase();
      } else {
        return "";
      }
    };

    Collection.prototype.parse = function(response) {
      var err, eset, i, _i, _len, _ref;
      if (!_.isEmpty(response.__errors)) {
        _ref = response.__errors;
        for (i in _ref) {
          eset = _ref[i];
          for (_i = 0, _len = eset.length; _i < _len; _i++) {
            err = eset[_i];
            console.info(i, err);
          }
        }
      }
      delete response['__errors'];
      return response.results;
    };

    return Collection;

  })(Backbone.Collection);
  
}});

window.require.define({"lib/base/model": function(exports, require, module) {
  var Model, application,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  application = require('application');

  module.exports = Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      this.getPermissions = __bind(this.getPermissions, this);

      this.save = __bind(this.save, this);

      this.toJson = __bind(this.toJson, this);

      this.castObjects = __bind(this.castObjects, this);

      this.parse = __bind(this.parse, this);

      this.getName = __bind(this.getName, this);

      this.fetch = __bind(this.fetch, this);

      this.initialize = __bind(this.initialize, this);

      this.url = __bind(this.url, this);

      this.urlRoot = __bind(this.urlRoot, this);
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.withMeta = false;

    Model.prototype.urlRoot = function() {
      var _url;
      return _url = '/rest/' + this.getName() + '/';
    };

    Model.prototype.url = function() {
      var _url;
      _url = Model.__super__.url.call(this);
      if (this.withMeta) {
        _url += '/withMeta';
      }
      return _url;
    };

    Model.prototype.initialize = function(attributes, options) {
      if (attributes == null) {
        attributes = {};
      }
      if (options == null) {
        options = {};
      }
      if (options.withMeta != null) {
        return this.withMeta = options.withMeta;
      }
    };

    Model.prototype.fetch = function(options) {
      if (options == null) {
        options = {};
      }
      options = _.extend(options, {
        headers: application.headers()
      });
      return Model.__super__.fetch.call(this, options);
    };

    Model.prototype.getName = function() {
      var funcNameRegex, results;
      funcNameRegex = /function (.{1,})\(/;
      results = funcNameRegex.exec(this.constructor.toString());
      if (results && results.length > 1) {
        return results[1].toLowerCase();
      } else {
        return "";
      }
    };

    Model.prototype.parse = function(response) {
      var err, eset, i, _i, _len, _ref;
      if (!_.isEmpty(response.__errors)) {
        _ref = response.__errors;
        for (i in _ref) {
          eset = _ref[i];
          for (_i = 0, _len = eset.length; _i < _len; _i++) {
            err = eset[_i];
            console.info(i, err);
          }
        }
      }
      delete response['__errors'];
      return this.castObjects(response, true);
    };

    Model.prototype.castObjects = function(data, root) {
      var i, lib, o, __model;
      if (root == null) {
        root = false;
      }
      this.attributes = {};
      for (i in data) {
        o = data[i];
        if (i === '__model') {
          __model = o;
          if (root && __model !== this.getName()) {
            throw "mismatch object type " + __model + " != " + this.getName();
          }
          delete data[i];
        }
        if (typeof o === 'object') {
          data[i] = this.castObjects(o);
        }
      }
      if (__model != null) {
        lib = require("lib/" + __model + "/model");
        return new lib(data);
      } else {
        return data;
      }
    };

    Model.prototype.toJson = function() {
      var i, o, _attr, _ref;
      _attr = {
        '__model': this.getName()
      };
      _ref = this.attributes;
      for (i in _ref) {
        o = _ref[i];
        if ((o != null) && (o.getName != null)) {
          _attr[i] = o.toJson();
        } else {
          _attr[i] = o;
        }
      }
      return _attr;
    };

    Model.prototype.save = function(attributes, options) {
      if (attributes == null) {
        attributes = {};
      }
      if (options == null) {
        options = {};
      }
      options = _.extend(options, {
        headers: application.headers()
      });
      this.attributes = this.toJson();
      return Model.__super__.save.call(this, attributes, options);
    };

    Model.prototype.getPermissions = function() {};

    return Model;

  })(Backbone.Model);
  
}});

window.require.define({"lib/base/templates/default": function(exports, require, module) {
  module.exports = function(context){ return Jinja.render('', context); };
}});

window.require.define({"lib/base/view": function(exports, require, module) {
  var View, defaultTemplate,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require('helpers/view_helper');

  defaultTemplate = require('./templates/default');

  module.exports = View = (function(_super) {

    __extends(View, _super);

    function View() {
      this.render = __bind(this.render, this);

      this.initialize = __bind(this.initialize, this);
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.template = defaultTemplate;

    View.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      if (options.template != null) {
        this.template = options.template;
      }
      return View.__super__.initialize.call(this, options);
    };

    View.prototype.render = function() {
      return $('#body').html(this.$el.html(this.template({
        model: this.model,
        collection: this.collection
      })));
    };

    return View;

  })(Backbone.View);
  
}});

window.require.define({"lib/server/model": function(exports, require, module) {
  var Model, Server,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('lib/base/model');

  module.exports = Server = (function(_super) {

    __extends(Server, _super);

    function Server() {
      return Server.__super__.constructor.apply(this, arguments);
    }

    return Server;

  })(Model);
  
}});

window.require.define({"lib/server/templates/system": function(exports, require, module) {
  module.exports = function(context){ return Jinja.render('', context); };
}});

window.require.define({"lib/server/view": function(exports, require, module) {
  var Server, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('lib/base/view');

  module.exports = Server = (function(_super) {

    __extends(Server, _super);

    function Server() {
      return Server.__super__.constructor.apply(this, arguments);
    }

    return Server;

  })(View);
  
}});

window.require.define({"lib/torrent/collection": function(exports, require, module) {
  var Collection, Torrent,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Collection = require('lib/base/collection');

  module.exports = Torrent = (function(_super) {

    __extends(Torrent, _super);

    function Torrent() {
      this.draw = __bind(this.draw, this);

      this.readFiles = __bind(this.readFiles, this);

      this.saveEach = __bind(this.saveEach, this);
      return Torrent.__super__.constructor.apply(this, arguments);
    }

    Torrent.prototype.model = require("./model");

    Torrent.prototype.saveEach = function(callback) {
      var o, _i, _len, _ref,
        _this = this;
      if (callback == null) {
        callback = function() {};
      }
      _ref = this.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        o.save().then(function(dataMeats) {
          return callback(dataMeats);
        });
      }
    };

    Torrent.prototype.readFiles = function(files) {
      var f, m, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        f = files[_i];
        if (!f.type.match('torrent.*')) {
          continue;
        }
        m = new this.model();
        m.readFile(f);
        _results.push(this.add(m));
      }
      return _results;
    };

    Torrent.prototype.draw = function() {
      var o, row, v, _i, _len, _ref, _results;
      row = require('./templates/row');
      _ref = this.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        v = new this.view({
          model: o,
          template: row
        });
        _results.push(v.render());
      }
      return _results;
    };

    return Torrent;

  })(Collection);
  
}});

window.require.define({"lib/torrent/model": function(exports, require, module) {
  var Model, Torrent,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('lib/base/model');

  module.exports = Torrent = (function(_super) {

    __extends(Torrent, _super);

    function Torrent() {
      return Torrent.__super__.constructor.apply(this, arguments);
    }

    Torrent.prototype.states = ["stop", "start", "checkHash", "delete"];

    Torrent.prototype.readFile = function(file) {
      var reader;
      reader = new FileReader();
      reader.onload = (function(theFile, cls) {
        return function(e) {
          return cls.set({
            name: theFile.name.replace('.torrent', ''),
            file: e.target.result
          });
        };
      })(file, this);
      return reader.readAsDataURL(file);
    };

    return Torrent;

  })(Model);
  
}});

window.require.define({"lib/torrent/templates/create": function(exports, require, module) {
  module.exports = function(context){ return Jinja.render('<input type="file" id="files" name="files[]" multiple />', context); };
}});

window.require.define({"lib/torrent/templates/row": function(exports, require, module) {
  module.exports = function(context){ return Jinja.render('{{model.id}}\
  {{model.hash}}\
  {{model.path}}\
  {{model.name}}\
  <a href="#" class="action" data-action="stop">Stop</a>\
  <a href="#" class="action" data-action="start">Start</a>\
  <a href="#" class="action" data-action="delete">Delete</a>', context); };
}});

window.require.define({"lib/torrent/view": function(exports, require, module) {
  var Torrent, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('lib/base/view');

  module.exports = Torrent = (function(_super) {

    __extends(Torrent, _super);

    function Torrent() {
      this.action = __bind(this.action, this);

      this.update = __bind(this.update, this);

      this.upload = __bind(this.upload, this);

      this.events = __bind(this.events, this);
      return Torrent.__super__.constructor.apply(this, arguments);
    }

    Torrent.prototype.events = function() {
      return {
        "change #files": "upload",
        "click .action": "action"
      };
    };

    Torrent.prototype.upload = function(evt) {
      var files;
      if (this.collection != null) {
        files = evt.target.files;
        this.collection.readFiles(files);
        return this.collection.saveEach(this.update);
      }
    };

    Torrent.prototype.update = function(response) {
      return console.log(response);
    };

    Torrent.prototype.action = function(evt) {
      var action, state;
      if (this.model != null) {
        action = $(evt.target).data('action');
        state = this.model.states.indexOf(action);
        this.model.set('state', state);
        return this.model.save();
      }
    };

    return Torrent;

  })(View);
  
}});

window.require.define({"lib/user/model": function(exports, require, module) {
  var Model, user,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('lib/base/model');

  module.exports = user = (function(_super) {

    __extends(user, _super);

    function user() {
      return user.__super__.constructor.apply(this, arguments);
    }

    return user;

  })(Model);
  
}});

