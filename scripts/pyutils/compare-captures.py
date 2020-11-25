
# This module compares files across different captures

import os
import argparse
from stat import S_ISREG, ST_CTIME, ST_MODE
import sys
import logging
import copy
import multiprocessing as mp

from pyutils.mahimahi import Mahimahi


def extractCriticalFiles(mfiles):
    return list(filter(lambda x: (x.isCriticalFile() and x.getStatus() == '200'), mfiles))


def parseDir(dir):
    objs = []
    for root, folder, files in os.walk(dir):
        for file in files:
            try:
                http_obj = Mahimahi(os.path.join(root, file))
                objs.append(http_obj)
            except:
                pass
    return extractCriticalFiles(objs)


def getFirstDir(dir,idx=0):
    entries = [os.path.join(dir, file_name) for file_name in os.listdir(dir)]
    # Get their stats
    entries = [(os.stat(path), path) for path in entries]
    # print entries
    # leave only regular files, insert creation date
    entries = [(stat[ST_CTIME], path)
               for stat, path in entries]
    entries.sort(key=lambda x: x[0])
    return entries[idx][1]

def isValidDir(dir):
    if len(dir) == 0:
        return False
    return True

def getSourceDir(dir, idx):
    '''
    Returns the very first timestamp capture of
    the very first url
    '''
    first_url = getFirstDir(dir)
    first_ts = getFirstDir(first_url,idx)
    logging.info('src directory is {}'.format(first_ts))
    return first_ts

def fileName(url):
    return url.split('/')[-1]

def _compare(srcFile, dstObjs):
    potentialDsts = [d for d in dstObjs if fileName(d.getUrl()) == fileName(srcFile.getUrl())]
    for d in potentialDsts:
        logging.debug('Comparing srcFile {} with dstFile {}'.format(srcFile.getUrl(), d.getUrl()))
        if srcFile == d:
            logging.info('{} matched with {} with type {} {}'.format(srcFile.getUrl(), d.getUrl(), \
                getType(srcFile.getHeader('content-type')), len(srcFile.getBody()) ))
            return True

    return False

def getTotalSize(files):
    sizes = [len(i.getBody()) for i in files]
    return sum(sizes)

def getDedupRatio(origFiles, matchedFiles):
    logging.info('dedup files: {} , all files: {}'.format(len(matchedFiles), len(origFiles) ))
    origSizes = [len(i.getBody()) for i in origFiles]
    matchSizes = [len(i.getBody()) for i in matchedFiles]
    origSize = sum(origSizes)
    matchSize = sum(matchSizes)
    logging.info('dedup size : {} , all size :{}'.format(matchSize, origSize));
    return matchSize*1.0/origSize

def getType(longType):
    if not longType:
        return
    types = ['javascript', 'html', 'image', 'css']
    for t in types:
        if t in longType:
            return t

def compare(args):
    # src_idx_count = 0
    # src_dir = getSourceDir(args.directory, src_idx_count)
    # while not isValidDir(src_dir):
    #     src_idx_count=src_idx_count+1
    #     src_dir = getSourceDir(args.directory, src_idx_count)
    # src_files = parseDir(src_dir)

    # all_files = copy.deepcopy(src_files)
    # dedup_files = copy.deepcopy(src_files)
    all_files = []
    dedup_files = []
    type_to_files = {'javascript':[], 'html':[], 'image':[], 'css':[], None:[]}
    # logging.info('DedupRatio: {}'.format(getDedupRatio(all_files, dedup_files)))
    for root, folder, files in os.walk(args.directory):
        # if root == src_dir:
        #     continue
        if len(files) != 0:
            # logging.info('total files: {} and matched files:{}'.format(len(src_files), len(files_matched)))
            # count=count+1
            dst_dir = root
            dst_objs = parseDir(dst_dir)
            if not isValidDir(dst_objs):
                continue
            all_files.extend(dst_objs)
            logging.info('{}/{}'.format(root,folder))
            logging.info("Comparing {} with {} with url {}".format(len(dedup_files), len(dst_objs), dst_dir ))
            matches = []
            unmatches = []
            for file in dst_objs:
                type = getType(file.getHeader('content-type'))
                # logging.info('type is {}'.format(type))
                match = _compare(file, dedup_files)
                match and matches.append(file)
                if not match:
                    unmatches.append(file)
                    type_to_files[type].append(file)
            dedup_files.extend(unmatches)   
            logging.info('Status: {} {} {} {}'.format(len(dedup_files), len(type_to_files['javascript']), getTotalSize(dedup_files), getTotalSize(type_to_files['javascript'])))


def init_logger():
    log_level = getattr(logging, os.environ.get('LOGLEVEL') or 'INFO')
    logging.basicConfig(level=log_level)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', help="path to the captures directory")
    parser.add_argument('--url', help='url of the site')
    args = parser.parse_args()
    init_logger()
    compare(args)
