Collection = require 'lib/base/collection'
View = require './view'

module.exports = class Torrent extends Collection
  model: require "./model"

  draw:=>
    row = require './templates/row'
    for o in @models
      v = new View({model:o,template:row})
      v.render()
