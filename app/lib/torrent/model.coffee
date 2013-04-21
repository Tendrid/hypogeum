Model = require 'lib/base/model'

module.exports = class Torrent extends Model

  readFile: (file) ->
    reader = new FileReader()
    
    # closure to capture the file information.
    reader.onload = ((theFile, cls) ->
      (e) ->
        console.log cls
        cls.set
          name: theFile.name
          file: e.target.result
  
    )(file, this)
    
    # Read in the image file as a data URL.
    reader.readAsDataURL file
    #@set('file',reader.result)
