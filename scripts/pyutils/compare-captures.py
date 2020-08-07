
# This module compares files across different captures

import http_record_pb2
import os
import argparse
from stat import S_ISREG, ST_CTIME, ST_MODE
import sys
import logging

def readProtobuf(file):
    http_obj = http_record_pb2.RequestResponse()
    f = open(file,'rb').read() 
    http_obj.ParseFromString(f)
    return http_obj

def parseDir(dir):
    file_to_content = {}
    for root, folder, files in os.walk(dir):
        for file in files:
            http_obj = readProtobuf(os.path.join(root,file))
            file_to_content[http_obj] = file
    return file_to_content

def getFirstDir(dir):
    entries = [os.path.join(dir, file_name) for file_name in os.listdir(dir)]
    # Get their stats
    entries = [(os.stat(path), path) for path in entries]
    # print entries
    # leave only regular files, insert creation date
    entries = [(stat[ST_CTIME], path)
           for stat, path in entries]
    entries.sort(key=lambda x : x[0])
    return entries[0][1]

def getSourceDir(dir):
    '''
    Returns the very first timestamp capture of
    the very first url
    '''
    first_url = getFirstDir(dir)
    first_ts = getFirstDir(first_url)
    return first_ts

def compare(args):
    src_dir = getSourceDir(args.directory)
    for root,folder, files in os.walk(args.directory):
        if len(files) != 0:
            print "Comparing {} with {}".format(src_dir, root)

def init_logger():
    log_level = getattr(logging, os.environ.get('LOGLEVEL') or 'INFO')
    logging.basicConfig(level=log_level)

if __name__ ==  "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('directory',help="path to the captures directory")
    parser.add_argument('--url', help='url of the site')
    args = parser.parse_args()
    init_logger()
    compare(args)