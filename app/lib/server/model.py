from app.lib.base.model import Base
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

import xmlrpc2scgi as xmlrpc
import xmlrpclib

class Server(Base):
    __tablename__ = 'server'
    id = Column(Integer, primary_key=True)
    socket = Column(String(64), nullable=False)
    hostname = Column(String(128), nullable=False)

    def __init__(self, params):
        conn = xmlrpc.RTorrentXMLRPCClient(socket)
        print conn.get_ip()
            
    def __repr__(self):
        return "<Server('%s')>" % (self.hostname)

    def readFields(self,user):
        conn = xmlrpc.RTorrentXMLRPCClient(self.socket)
        self.ip =  conn.get_ip()

        #filepath = "/data/apps/pyrt/torrents/test.torrent"
        #conn.load_start_verbose(filepath)
        #conn.load_verbose(filepath)
        alldownloads = conn.download_list()
        for id in alldownloads:
            print id, conn.d.get_tied_to_file(id)

        return ["id","hostname","ip"]
