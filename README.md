hypogeum
========

restful rTorrent web front end
Tornado, Backbone, SQL Alchemy, CRUD


SETUP:

sudo apt-get install rtorrent

create ~/.rtorrent.rc
http://libtorrent.rakshasa.no/browser/trunk/rtorrent/doc/rtorrent.rc?rev=latest

add the following line to ~line 5
scgi_local = /path/to/file/rpc.socket

set the following in your settings.py:
RTORRENT_SOCKET = '/path/to/file/rpc.socket'

make sure /path/to/file/ is a valid directory

start rtorrent

start python app