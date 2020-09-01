"""
This is a helper module to process mahimahi protobuf files
"""

import http_record_pb2
import brotli
import zlib
import re
import hashlib

class Mahimahi:
    """ Represents a mahimahi protobuf file"""

    def __init__(self, file):
        self.http_obj = http_record_pb2.RequestResponse()
        f = open(file,'rb').read() 
        self.http_obj.ParseFromString(f)
        self._src = file

    def unchunk(self,body):
        new_body = ""
        # iterate through chunks until we hit the last chunk
        crlf_loc = body.find('\r\n')
        chunk_size = int( body[:crlf_loc], 16 )
        body = body[crlf_loc+2:]
        while( chunk_size != 0 ):
            # add chunk content to new body and remove from old body
            new_body += body[0:chunk_size]
            body = body[chunk_size:]

            # remove CRLF trailing chunk
            body = body[2:]

            # get chunk size
            crlf_loc = body.find('\r\n')
            chunk_size = int( body[:crlf_loc], 16 )
            body = body[crlf_loc+2:]

        # on the last chunk
        body = body[crlf_loc+2:]

        return new_body

    def isType(self,type):
        for header in self.http_obj.header:
            if header.key.lower() == "content-type" and type in header.value.lower():
                return True

        return False

    def getHeader(self, key):
        for header in self.http_obj.response.header:
            if header.key.lower() == key:
                return header.value

        return None


    def isChunked(self):
        for header in self.http_obj.response.header:
            if header.key.lower() == "transfer-encoding" and header.value == "chunked":
                return True

        return False

    def isZipped(self):
        for header in self.http_obj.response.header:
            if header.key.lower() == "content-encoding":
                return header.value
        return False;

    def getStatus(self):
        return self.http_obj.response.first_line.split()[1]

    def getBody(self):
        return self.http_obj.response.body

    def getUrl(self):
        if not self.http_obj.request.first_line.split():
            return None
        return self.http_obj.request.first_line.split()[1]

    def getSrcHash(self):
        msg = self.getPlainText()
        m = hashlib.sha256()
        m.update(msg)
        return m.digest()

    def isCriticalFile(self):
        _u = self.getUrl()
        if not _u:
            return False
        # ts = [i for i in _u if i.isdigit()]
        ts = re.findall(r'\d+',_u)
        if len(ts) and len(ts[0]) == 14:
            return True

        return False


    def getPlainText(self):
        orig_body = self.http_obj.response.body
        if self.isChunked():
            orig_body = self.unchunk(orig_body)

        isCompressed = self.isZipped()
        if isCompressed == "br":
            orig_body = brotli.decompress(orig_body)
        elif isCompressed != False:
            orig_body = zlib.decompress(bytes(bytearray(orig_body)), zlib.MAX_WBITS|32)

        return orig_body


    def __eq__(self, other): 
        match_headers = ['content-type', 'content-length']
        for h in match_headers:
            if self.getHeader(h) != other.getHeader(h):
                return False
        if self.getSrcHash() == other.getSrcHash():
            return True

        return False