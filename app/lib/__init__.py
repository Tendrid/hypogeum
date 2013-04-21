from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from settings import DBURL, RTORRENT_SOCKET
import xmlrpc2scgi as xmlrpc
#import xmlrpclib

engine = create_engine(DBURL, echo=False)
#session = sessionmaker(bind=engine)
db = scoped_session(sessionmaker(bind=engine))
rtorrent = xmlrpc.RTorrentXMLRPCClient(RTORRENT_SOCKET)
from app.lib.user.model import User
from app.lib.server.model import Server
from app.lib.torrent.model import Torrent

apiModels = {
             "user":User,
             "server":Server,
             "torrent":Torrent,
             }


def initServer(socket):
    try:
        print "Connecting to rTorrent running on {} pid:{} on socket:{}".format( rtorrent.system.hostname() ,rtorrent.system.pid(),socket)
    except IOError as e:
        print "rTorrent connection failure on socket {}.  Exiting.".format(socket)
        exit()
    query = db.query(Torrent).filter(Torrent.state!=4)
    tDB = query.all()
    tRT = rtorrent.download_list()
    for t in tDB:
        print "checking {}".format(t.hash)
        if t.hash not in tRT:
            print "loading {}".format(t.hash)
            t.tReload()
        rtorrent.d.set_directory(t.hash,'/home/tendrid/Downloads')
        print rtorrent.d.get_directory(t.hash)

initServer(RTORRENT_SOCKET)
