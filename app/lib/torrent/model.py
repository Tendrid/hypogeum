from app.lib.base.model import Base
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Binary
from sqlalchemy.orm import relationship

#import bencode
#import hashlib
import base64

from rtorrentrpc import RPCMixin
#import xmlrpc2scgi as xmlrpc
#import xmlrpclib

class Torrent(Base, RPCMixin):
    __tablename__ = 'torrent'
    #columns
    id = Column(Integer, primary_key=True)
    state = Column(Integer, default=0)
    hash = Column(String(64), nullable=False)
    owner_id = Column(Integer, ForeignKey("user.id"), autoincrement=False, nullable=True, default=0)
    name = Column(String(128), nullable=False)
    path = Column(String(128), default='')
    file = Column(Binary(), nullable=False)
    #references
    owner = relationship("User", foreign_keys=[owner_id])

    states = ["tStop","tStart","tCheckHash","tDelete"]

    def __init__(self, params=dict()):
        #conn = xmlrpc.RTorrentXMLRPCClient(socket)
        #print conn.get_ip()
        pass

    def __repr__(self):
        return "<Torrent('%s')>" % (self.name)

    def readFields(self,user):
        #all_downloads = self.rtorrent.download_list()
        #print conn.d.get_tied_to_file(self.hash)
        #print conn.d.get_size_chunks(self.hash) * conn.d.get_chunk_size(self.hash)
        #print conn.d.get_size_bytes(self.hash)
        #print self.rtorrent.d.views()
        torrentData = self.rtorrent.d.multicall(
            "",
            "d.get_size_bytes=",
        )
        print torrentData
        #print conn.d.get_base_path(self.hash)
        return ["id","name","hash","owner","state","path"]

    def post (self, *args, **kwargs):
        #print kwargs['postdata']['file']
        f = kwargs['postdata']['file'].split(',')[1]
        kwargs['postdata']['file'] = base64.b64decode(f)
        kwargs['postdata']['hash'] = self.calcHash(kwargs['postdata']['file'])
        retVal = super(Base, self).post(*args, **kwargs)
        if retVal and self.state == 1:
            self.tStart()
        else:
            self.tStop()
        return retVal

    def put (self, *args, **kwargs):
        _state = self.state
        retVal = super(Base, self).put(*args, **kwargs)
        if retVal and self.state != _state:
            print "calling {}".format(self.states[self.state])
            getattr(self,self.states[self.state])()
            #self.tStart()
        return retVal

    def createFields(self,user):
        return ["name","file","hash"]
    
    def writeFields(self,user):
        if self.owner_id:
            if self.owner_id == user.id:
                return ["name","state","owner"]
            else:
                return None
        else:
            if user:
                return ["name","state"]
            else:
                return None

        