
# This module compares files across different captures

import os
import argparse
from stat import S_ISREG, ST_CTIME, ST_MODE
import sys
import logging
import multiprocessing as mp

from .mahimahi import Mahimahi


def extractCriticalFiles(mfiles):
    return list(filter(lambda x: (x.isCriticalFile() and x.getStatus() == '200'), mfiles))


def parseDir(dir):
    objs = []
    for root, folder, files in os.walk(dir):
        for file in files:
            http_obj = Mahimahi(os.path.join(root, file))
            objs.append(http_obj)
    return extractCriticalFiles(objs)


def getFirstDir(dir):
    entries = [os.path.join(dir, file_name) for file_name in os.listdir(dir)]
    # Get their stats
    entries = [(os.stat(path), path) for path in entries]
    # print entries
    # leave only regular files, insert creation date
    entries = [(stat[ST_CTIME], path)
               for stat, path in entries]
    entries.sort(key=lambda x: x[0])
    return entries[0][1]


def getSourceDir(dir):
    '''
    Returns the very first timestamp capture of
    the very first url
    '''
    first_url = getFirstDir(dir)
    first_ts = getFirstDir(first_url)
    return first_ts


def _compare(srcFile, dstObjs):
    for d in dstObjs:
        logging.debug('Comparing srcFile {} with dstFile {}'.format(srcFile.getUrl(), d.getUrl()))
        if srcFile == d:
            logging.info('{} matched with  {}'.format(srcFile.getUrl(), d.getUrl()))
            return True

    return False


def compare(args):
    src_dir = getSourceDir(args.directory)
    files_matched = []
    src_files = parseDir(src_dir)
    count = 0
    for root, folder, files in os.walk(args.directory):
        if count == 5:
            break
        if len(files) != 0:
            logging.info('total files: {} and matched files:{}'.format(len(src_files), len(files_matched)))
            # count=count+1
            dst_dir = root
            dst_objs = parseDir(dst_dir)
            logging.info("Comparing {} with {}".format(len(src_files), len(dst_objs)))
            for file in src_files:
                if file not in files_matched:
                    match = _compare(file, dst_objs)
                    match and files_matched.append(file)

    logging.info('total files: {} and matched files:{}'.format(len(src_files), len(files_matched)))


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
