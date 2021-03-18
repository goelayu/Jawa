"""
This is a helper module to process mahimahi protobuf files
"""

import http_record_pb2
import brotli
import zlib
import re
import hashlib
import subprocess
import os
import difflib

def _zipContent(body, zip_type):
        TEMP_FILE_I='tmp_i'
        TEMP_FILE_O='tmp_o'
        with open(TEMP_FILE_I,'w') as f:
            f.write(body)
        zip_util = None
        if zip_type.lower() != "br":
            zip_util = "gzip"
        else: zip_util = "brotli"
        zipCommand = "{} -c {} > {}".format(zip_util, TEMP_FILE_I, TEMP_FILE_O)
        subprocess.call(zipCommand, shell=True)
        result = None
        with open(TEMP_FILE_O,'r') as f:
            result = f.read()
        return result

class Mahimahi:
    """ Represents a mahimahi protobuf file"""

    def __init__(self, file):
        self.http_obj = http_record_pb2.RequestResponse()
        f = open(file,'rb').read() 
        self.http_obj.ParseFromString(f)
        self._src = file
        self._plainText = self.getPlainText()

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

    def getRequestHeader(self, key):
        for header in self.http_obj.request.header:
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
    
    def getHTTPObj(self):
        return self.http_obj

    def getStatus(self):
        return self.http_obj.response.first_line.split()[1]

    def getBody(self):
        return self.http_obj.response.body

    def getUrl(self):
        if not self.http_obj.request.first_line.split():
            return None
        return self.http_obj.request.first_line.split()[1]

    def getSrcHash(self):
        msg = self._plainText
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

    def updateHeader(self, h, v):
        for header in self.http_obj.response.header:
            if header.key.lower() == h:
                header.value = v
    
    def deleteHeader(self, h):
        for header in self.http_obj.response.header:
            if header.key.lower() == h:
                self.http_obj.response.header.remove(header)

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

    def updateResponseBody(self, new_body):
        if self.isChunked():
            self.deleteHeader('transfer-encoding')
        
        zip_type = self.isZipped()
        new_body_zip = _zipContent(new_body, zip_type) if zip_type else new_body
        self.http_obj.response.body = new_body_zip
        self.updateHeader('content-length', str(len(new_body_zip)))

    def getDiffSize(self, dst):
        TEMP_FILE = str(os.getpid())

        srcMesg = self._plainText
        dstMesg = dst._plainText

        with open(TEMP_FILE+'_src','w') as f:
            f.write(srcMesg)

        with open(TEMP_FILE+'_dst','w') as f:
            f.write(dstMesg)



        diffCmd = 'diff {} {}'.format(TEMP_FILE+'_src', TEMP_FILE+'_dst')
        diffOut = subprocess.Popen(diffCmd, shell=True, stdout=subprocess.PIPE)
        diffStr = diffOut.stdout.read()

        return len(diffStr)

    def getDiffSize_inmem(self, dst, logger):
        # TEMP_FILE = str(os.getpid())

        logger.info('splitting input data')
        srcMesg = self._plainText.splitlines()
        dstMesg = dst._plainText.splitlines()

        logger.info('Compute diff between data')
        diff = difflib.ndiff(srcMesg, dstMesg)
        logger.info('Compute precise delta')        
        # delta = ''.join(x for x in diff if x.startswith('- ') or x.startswith('+ '))
        delta = ''.join(diff)
        logger.info('Done')   
        return len(delta)


    
        
    def __eq__(self, other): 
        if self.getUrl() == other.getUrl():
            return True
        match_headers = ['content-type', 'content-length']
        for h in match_headers:
            if self.getHeader(h) != other.getHeader(h):
                return False
        if self.getSrcHash() == other.getSrcHash():
            return True

        return False