
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



def getFileWithMatchingURL(url, args):
    http_data = http_record_pb2.RequestResponse()
    for root, folder, files in os.walk(args.original):
        for file in files:
            f = open(os.path.join(root,file), "rb")
            http_data.ParseFromString(f.read())
            f.close()

            curUrl = removeTrailingSlash(http_data.request.first_line.split()[1])
            # print "Comparing ", curUrl ," with ", url
            if curUrl == url:
                # Make sure it's not the exact same http_data by checking the response status
                status = http_data.response.first_line.split()[1]
                if "30" not in status:
                    print "Found matching file", curUrl, url
                    return http_data

    return


def patchHttpData(origData, targetData):
    origData.response.first_line = targetData.response.first_line

    # header_keys = ["Content-Type","Content-Encoding","Transfer-Encoding","Content-Length",""]
    for th in targetData.response.header:
        k = th.key
        v = th.value
        headerFound = False
        for oh in origData.response.header:
            if oh.key == k:
                oh.value = v
                headerFound = True
        if not headerFound:
            newHeader = origData.response.header.add()
            newHeader.key = k
            newHeader.value = v

    #delete the Location header if it exists
    for oh in origData.response.header:
        if oh.key.lower() == "location":
            origData.response.header.remove(oh)

    #Update the body with the target body
    origData.response.body = targetData.response.body

def removeTrailingSlash(url):
    if url[-1] == '/':
        return url[:-1]
    else:
        return url

def createOutputFile(data, file):
    f = open(file,'w')
    f.write(data.SerializeToString())
    f.close()

def main(args):

    http_orig_data = http_record_pb2.RequestResponse()
    urlMapData = open(args.urlMap,'r').read()

    urlMap = json.loads(urlMapData)
    # print urlMap
    for root, folder, files in os.walk(args.original):
        for file in files:
            try:
                f_orig = open(os.path.join(root,file), "rb")
                # print f_orig.name
                http_orig_data.ParseFromString(f_orig.read())
                f_orig.close()

                curUrl = removeTrailingSlash(http_orig_data.request.first_line.split()[1])

                if curUrl in urlMap:
                    redirectUrl = urlMap[curUrl]
                    print "match for ", curUrl, " is ", redirectUrl
                    redirectData = getFileWithMatchingURL(redirectUrl, args)
                    if not redirectData:
                        print "No matching file found for ", redirectUrl
                        return
                    orig_data_copy = deepcopy(http_orig_data)
                    patchHttpData(orig_data_copy, redirectData)

                    try:
                        os.mkdir(args.output)
                    except OSError as e:
                        pass
                    dst_f = os.path.join(args.output,file)
                    createOutputFile(orig_data_copy, dst_f)
                else:
                    dst_f = os.path.join(args.output,file)
                    createOutputFile(http_orig_data, dst_f)

                # if isJS(http_response_orig.response.header):
                # print http_response_orig.response.first_line.split()[1], http_response_orig.request.first_line.split()[1]
                # print http_response_orig.response.header
            except Exception as e:
                print "error while processing file",e



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('original', help='path to input directory')
    parser.add_argument('output', help='output directory for modified protobufs')
    parser.add_argument('urlMap',help='path to the url map')
    args = parser.parse_args()
    main(args)