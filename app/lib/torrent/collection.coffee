Collection = require 'lib/base/collection'
#View = require './view'

module.exports = class Torrent extends Collection
  model: require "./model"

  saveEach: () =>
    for o in @models
      console.log o.name
      #o.save().then (dataMeats)=> callback(dataMeats)
    return

  readFiles: (files, callback = =>) =>
    for f in files
      if !f.type.match('torrent.*')
        continue
      m = new @model()
      m.readFile f, callback
      @add(m)

  draw: =>
    row = require './templates/row'
    for o in @models
      v = new @view({model:o,template:row})
      v.render()
