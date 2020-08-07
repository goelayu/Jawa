
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
import multiprocessing as mp
from functools import partial
import traceback



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

def isChunked(headers,del_header):
    for header in headers:
        if header.key.lower() == "transfer-encoding" and header.value == "chunked":
            if del_header:
                headers.remove(header)
            return True

    return False

def isZipped(headers):
    for header in headers:
        if header.key.lower() == "content-encoding":
            return header.value.lower()
    return False;


def getPlainText(msg, del_header):
    orig_body = msg.response.body
    if isChunked(msg.response.header, del_header):
        orig_body = unchunk(orig_body)

    isCompressed = isZipped(msg.response.header)
    if isCompressed == "br":
        orig_body = brotli.decompress(orig_body)
    elif isCompressed != False:
        orig_body = zlib.decompress(bytes(bytearray(orig_body)), zlib.MAX_WBITS|32)

    return orig_body

def getZippedData(msg):
    orig_body = msg.response.body

    isCompressed = isZipped(msg.response.header)

    if not isCompressed:
        return orig_body

    zipInput = '/tmp/_z1'
    zipOutput = '/tmp/_z2'

    f = open(zipInput,'w')
    f.write(orig_body)
    f.close()

    if isCompressed != "br":
            zipUtil = "gzip"
    else: zipUtil = "brotli"

    zipCommand = "{} -c {} > {}".format(zipUtil, zipInput, zipOutput)
    subprocess.call(zipCommand, shell=True)

    orig_body = open(zipOutput,'rb').read()
    # if isCompressed == "br":
    #     orig_body = brotli.compress(orig_body)
    # elif isCompressed != False:
    #     orig_body = zlib.compress(orig_body)

    return orig_body


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
                # continue
                # Make sure it's not the exact same http_data by checking the response status
                status = http_data.response.first_line.split()[1]
                if "30" not in status:
                    # print "Found matching file", curUrl, url
                    return http_data
                else:
                    print 'Wrongfully entered else, match should always be a direct response'
    return


def isToolbarRes(url):
    '''
    If no timestamp in url, it is a toolbar resource
    '''
    ts = [i for i in url if i.isdigit()]
    ts = re.findall(r'\d+',url)
    if not len(ts) or len(ts[0]) != 14:
        return True

    return False


def _patchRedirects(origData, targetData):
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

def updateHeader(proto):
    len_header = False
    for header in proto.response.header:
        if header.key.lower() == "content-length":
            header.value = bytes(len(proto.response.body))
            len_header = True
    if not len_header:
        length_header = proto.response.header.add()
        length_header.key = "Content-Length"
        length_header.value = bytes(len(proto.response.body))
    return

def removeToolBar(proto):
    msg = getPlainText(proto, True)
    toolbarstart = '<!-- BEGIN WAYBACK TOOLBAR INSERT -->'
    toolbarend = '<!-- END WAYBACK TOOLBAR INSERT -->'

    if re.search(toolbarstart, msg) is None:
        return False

    sInd = re.finditer(toolbarstart, msg).next().start()
    eInd = re.finditer(toolbarend,msg).next().end()
    print sInd, eInd
    msg_notoolbar = msg[:sInd] + msg[eInd:]
    proto.response.body = msg_notoolbar
    # proto.response.body =  getZippedData(proto)
    # updateHeader(proto)
    return True

def insertPreloadHeader(proto, links):
    msg = proto.response.body
    # msg = getPlainText(proto, True)
    linkTemplate="<link rel='preload' href='{url}' as='{type}'>"
    print "Inserting", len(links)
    _linkStr = [linkTemplate.format(url=l[0], type=l[1]) for l in links]
    linkStr = "\n".join(_linkStr)
    # print linkStr
    insertLoc = getPreloadLoc(msg)
    newbody = insertAtInd(msg, insertLoc, linkStr)
    proto.response.body = newbody
    proto.response.body = getZippedData(proto)
    updateHeader(proto)
    return 

def getPreloadType(type):
    typeDict = { "Document":"document", "Font":"font", "Image":"image","Script":"script","StyleSheet":"style","XHR":"fetch"}
    return typeDict[type] if type in typeDict else None 


def getPreloadLoc(domStr):
    e='<head.+>'
    loc = re.search(e,domStr)
    if not loc:
        return 0
        # raise Exception('No header tag found in the document')
    # print 'Location of header', loc.end()
    return loc.end()

def insertAtInd(src, idx, str):
    return src[:idx]+ str + src[idx:]


def isMainFile(first_line, url):
    rts = removeTrailingSlash
    _url = "".join(url.split('www.'))
    return rts(first_line).endswith(rts(_url))

def patchHttpData(root, http_orig_data, urlMap, patches, url, allUrls, file):
        try:
            f_orig = open(os.path.join(root,file), "rb")
            # print f_orig.name
            http_orig_data.ParseFromString(f_orig.read())
            f_orig.close()

            curUrl = removeTrailingSlash(http_orig_data.request.first_line.split()[1])
            orig_data_copy = deepcopy(http_orig_data)

            if "noredirect" in patches:
                if curUrl in urlMap and "30" in http_orig_data.response.first_line:
                    redirectUrl = urlMap[curUrl]

                    # print "match for ", curUrl, " is ", redirectUrl
                    redirectData = getFileWithMatchingURL(redirectUrl, args)
                    if not redirectData:
                        print "No matching file found for ", redirectUrl
                        return
                    # if redirectData
                    _patchRedirects(orig_data_copy, redirectData)
                    # removeToolBar(orig_data_copy)

                    if "toolbar" in patches and isMainFile(curUrl, url):
                        try:
                            removeToolBar(orig_data_copy)
                        except:
                            print 'Exception while removing toolbar'
                        # print orig_data_copy
                    
                    if "sp" in patches and isMainFile(curUrl, url):
                        if not allUrls:
                            raise Exception('Missing --allUrls flags with the server push patch')
                        # try:
                        urls = json.loads(open(allUrls,'r').read())
                        insertPreloadHeader(orig_data_copy, urls)
                        # except :
                            # print "Exception while inserting link preloads"
                    # try:
                    #     os.mkdir(args.output)
                    # except OSError as e:
                    #     pass
                    dst_f = os.path.join(args.output,file)
                    createOutputFile(orig_data_copy, dst_f)
                else:
                    dst_f = os.path.join(args.output,file)
                    createOutputFile(http_orig_data, dst_f)

            # if "toolbar" in patches:
            #     # print curUrl, http_orig_data.response.first_line
            #     if isMainFile(curUrl, url):
            #         # print curUrl, url
            #         removeToolBar(orig_data_copy)

            # #     # if isToolbarRes(curUrl):
            # #     #     NOTFOUND='HTTP/1.1 404 NOT FOUND'
            # #     #     http_orig_data.response.first_line=NOTFOUND
            #         dst_f = os.path.join(args.output,file)
            #         createOutputFile(http_orig_data, dst_f)

            #     elif "noredirect" not in patches:
            #         dst_f = os.path.join(args.output,file)
            #         createOutputFile(http_orig_data, dst_f)




            # if isJS(http_response_orig.response.header):
            # print http_response_orig.response.first_line.split()[1], http_response_orig.request.first_line.split()[1]
            # print http_response_orig.response.header
        except Exception as e:
            print "error while processing file",e
            track = traceback.format_exc()
            print(track)

def removeTrailingSlash(url):
    return url
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
        # pool = mp.Pool(mp.cpu_count())

        # patch_singleton = partial(patchHttpData, root, http_orig_data, urlMap, args.patches, args.url)
            
        # pool.map(patch_singleton, files)
        # pool.close()
        # pool.join()
        for file in files:
            patchHttpData(root, http_orig_data, urlMap, args.patches, args.url ,args.allUrls,file)

        



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('original', help='path to input directory')
    parser.add_argument('output', help='output directory for modified protobufs')
    parser.add_argument('urlMap',help='path to the url map')
    parser.add_argument('--allUrls',help='path to the all urls for link preload')
    parser.add_argument('url',help='url of the site')
    parser.add_argument('--patches', help='types of patches to apply -- noredirect, notoolbar')
    args = parser.parse_args()
    main(args)