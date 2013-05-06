module.exports = Application =
  _errorLevels:
    DEBUG:10
    INFO:20
    WARN:30
    ERROR:40
    CRITICAL:50
  headers: ->
    'X-Xsrftoken' :$.cookie('_xsrf')
    'X-Errorlevel':@_errorLevels[@errorLevel]

  initialize:(attributes={}, options={}) ->
    @errorLevel = attributes.errorLevel || 'CRITICAL'
    @makeTorrent()
    #@getTorrents()

  getTorrents: ->
    TorrentCollection = require 'lib/torrent/collection'
    @torrentcollection = new TorrentCollection()
    #@torrentcollection.filter({"and":[{"and":["id>=0","id=3"]},{"or":["hash=335990D615594B9BE409CCFEB95864E24EC702C7","hash=doo"]}]})
    @torrentcollection.filter("and":[{"and":["state>=0","state<=3"]}])
    @torrentcollection.fetch({success:@torrentcollection.draw})
    

  makeTorrent: ->
    #Torrent = require 'lib/torrent/model'
    TorrentView = require 'lib/torrent/view'
    TorrentCollection = require 'lib/torrent/collection'
    #@torrent = new Torrent()
    @torrentcollection = new TorrentCollection()
    #@torrentview = new TorrentView({model:@torrent})
    @torrentview = new TorrentView({collection:@torrentcollection})
    @torrentview.template = require 'lib/torrent/templates/create'
    @torrentview.render()
    
  runTests: ->
    Torrent = require 'lib/torrent/model'
    @torrent = new Torrent({id:5})
    @torrent.fetch().then =>
      TorrentView = require 'lib/torrent/view'
      @torrentview = new TorrentView({model:@torrent})
      @torrentview.template = require 'lib/torrent/templates/row'
      @torrentview.render()
