
# This is a small module just to inspect
# the contents of the protobuf files
# to debug content

import brotli
import http_record_pb2
import argparse
import zlib
import os
import re
import subprocess
import sys
from copy import deepcopy
from Naked.toolshed.shell import execute_js
import json
import unicodedata
import hashlib

from pyutils.mahimahi import Mahimahi


def matchRtiWithMahimahi(rtiUrls, mahimahiUrls):
    unmatched = []
    for rtiUrl in rtiUrls:
        # print rtiUrl, len(rtiUrls[rtiUrl])
        foundMatch = False
        for mahimahiUrl in mahimahiUrls:
            if rtiUrl.endswith(mahimahiUrl):
                foundMatch = True
        if not foundMatch:
            unmatched.append(rtiUrl)
    if len(rtiUrls) != 0:
        sys.stdout.write(str(len(unmatched)*100.0/len(rtiUrls)) + " ")
        sys.stdout.flush()

def unchunk(body):
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

def isJS(headers):
    for header in headers:
        if header.key.lower() == "content-type" and "javascript" in header.value.lower():
            return True

    return False

def removeHeader(headers, key):
    for header in headers:
        if header.key.lower() == key:
            headers.remove(header)

def isChunked(headers):
    for header in headers:
        if header.key.lower() == "transfer-encoding" and header.value == "chunked":
            return True

    return False

def isZipped(headers):
    for header in headers:
        if header.key.lower() == "content-encoding":
            return header.value
    return False

def createOutputProtoFile(data, file):
    f = open(file,'w')
    f.write(data.SerializeToString())
    f.close()

def getPlainText(msg):
    orig_body = msg.response.body
    if isChunked(msg.response.header):
        orig_body = unchunk(orig_body)

    isCompressed = isZipped(msg.response.header)
    if isCompressed == "br":
        orig_body = brotli.decompress(orig_body)
    elif isCompressed != False:
        orig_body = zlib.decompress(bytes(bytearray(orig_body)), zlib.MAX_WBITS|32)

    return orig_body

def get_mm_header(mm_obj, key):
    for header in mm_obj.request.header:
        if header.key.lower() == key:
            return header.value

    return None
def main(args):

    count = 0
    for root, folder, files in os.walk(args.original):
        url = root.split('/')[-1]
        cookie_len = 0
        for file in files:
            try:
                mm = Mahimahi(os.path.join(root,file))
                type = mm.getHeader('content-type')
                if 'javascript' not in type:
                    continue
                fullurl = "http://{}{}".format(mm.getRequestHeader('host'),mm.getUrl())
                print mm.getUrl()
                print mm.http_obj.response.first_line
                print mm.http_obj.request.first_line
                # if 'cookie' in fullurl:
                #     cookie_len += len(mm._plainText)
                # print reqUrl, http_response_orig.request.first_line, http_response_orig.response.first_line, file, host
                # print fullurl, len(mm._plainText)
            except Exception as e:
                pass
    # print cookie_len
            # removeHeader(http_response_orig.response.header, 'link')
            # createOutputProtoFile(http_response_orig, os.path.join(args.modified,file))
            # print http_response_orig.request.header
            # print http_response_orig.response.header
            # for h in http_response_orig.response.header:
            #     if h.key.lower() == 'content-type':
            #         print h.value
                # if reqUrl in args.url:
                #     # body = getPlainText(http_response_orig)
                #     print len(http_response_orig.response.body)
                # if isJS(http_response_orig.response.header):
                # print http_response_orig.response.first_line.split()[1], http_response_orig.request.first_line.split()[1]
                # print http_response_orig.response.first_line
            # except Exception as e:
            #     print "error while processing file",e



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('original', help='path to input directory')
    # parser.add_argument('modified', help='path to input directory')
    # parser.add_argument('url',help='path to output directory')
    args = parser.parse_args()
    main(args)