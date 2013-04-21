application = require 'application'

module.exports = class Model extends Backbone.Model
  withMeta:false
  urlRoot: =>
    _url = '/rest/'+@getName()+'/'

  url: =>
    _url = super()
    if @withMeta
      _url+='/withMeta'
    return _url

  initialize:(attributes={}, options={}) =>
    if options.withMeta?
      @withMeta = options.withMeta

  fetch:(options={})=>
    options = _.extend(options, {headers: application.headers()})
    super(options)

  getName: =>
    funcNameRegex = /function (.{1,})\(/
    results = (funcNameRegex).exec(@constructor.toString())
    (if (results and results.length > 1) then results[1].toLowerCase() else "")

  parse:(response) =>
    if !_.isEmpty response.__errors
      for i,eset of response.__errors
        for err in eset
          console.info i, err
    delete response['__errors']
    return @castObjects response, true

  castObjects: (data,root=false) =>
    @attributes = {}
    for i,o of data
      if i == '__model'
        __model = o
        if root and __model != @getName()
            throw "mismatch object type "+__model+" != "+@getName()          
        delete data[i]
      if typeof o == 'object'
        data[i] = @castObjects o
    if __model?
      lib = require "lib/"+__model+"/model"
      return new lib data
    else
      return data
  
  toJson:=>
    _attr = {'__model':@getName()}
    for i,o of @attributes
      if o? and o.getName?
        _attr[i] = o.toJson()
      else
        _attr[i]=o
    return _attr    
  
  save:(attributes={}, options={})=>
    options = _.extend(options, {headers: application.headers()})
    @attributes = @toJson()
    return super(attributes, options)
  
  getPermissions:=>
    #post to @url+/permissions