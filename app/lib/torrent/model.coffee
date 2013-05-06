Model = require 'lib/base/model'

module.exports = class Torrent extends Model

  states: ["stop","start","checkHash","delete"]

  readFile: (file, callback) ->
    reader = new FileReader()
    
    # closure to capture the file information.
    reader.onload = ((theFile, cls) ->
      (e) ->
        cls.set
          name: theFile.name.replace('.torrent','')
          file: e.target.result
        callback(cls)
    )(file, this, callback)
    
    # Read in the image file as a data URL.
    reader.readAsDataURL file
    #@set('file',reader.result)
