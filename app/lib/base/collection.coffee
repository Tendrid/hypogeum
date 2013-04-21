application = require 'application'

module.exports = class Collection extends Backbone.Collection
  
  _filter:{}
  
  url: =>
    _url = '/rest/'+@getName()+'/' +'?where=' + JSON.stringify(@_filter)

  filter:(filter)=>
    @_filter = filter

  fetch:(options={})=>
    options = _.extend(options, {headers: application.headers()})
    super(options)

  getName: =>
    funcNameRegex = /function (.{1,})\(/
    results = (funcNameRegex).exec(@constructor.toString())
    (if (results and results.length > 1) then results[1].toLowerCase() else "")

  parse: (response) =>
    if !_.isEmpty response.__errors
      for i,eset of response.__errors
        for err in eset
          console.info i, err
    delete response['__errors']
    return response.results
