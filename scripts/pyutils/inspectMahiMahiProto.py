
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

def main(args):

    mahimahiUrls = []
    pairs = []
    rtiUrls = {}
    # extract js Urls
    http_response_orig = http_record_pb2.RequestResponse()
    http_response_mod = http_record_pb2.RequestResponse()
    count = 0
    listOfJS = {}
    for root, folder, files in os.walk(args.original):
        url = root.split('/')[-1]
        listOfJS[url] = []
        count = count+1
        for file in files:
            try:
                f_orig = open(os.path.join(root,file), "rb")
                # print f_orig.name
                http_response_orig.ParseFromString(f_orig.read())
                f_orig.close()

                reqUrl = http_response_orig.request.first_line.split()[1]
                print reqUrl, http_response_orig.request.first_line
                # if reqUrl in args.url:
                #     # body = getPlainText(http_response_orig)
                #     print len(http_response_orig.response.body)
                # if isJS(http_response_orig.response.header):
                # print http_response_orig.response.first_line.split()[1], http_response_orig.request.first_line.split()[1]
                # print http_response_orig.response.first_line
            except Exception as e:
                print "error while processing file",e



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('original', help='path to input directory')
    parser.add_argument('url',help='url to be matched against')
    # parser.add_argument('modified', help='path to input directory')
    # parser.add_argument('url',help='path to output directory')
    args = parser.parse_args()
    main(args)