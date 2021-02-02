# this script extracts files from mahimahi directory


import logging
import argparse
import os
from pyutils.mahimahi import Mahimahi
import json
import subprocess

TEMP_FILE_DIR="JS_FILES/"

def init_output_directory():
    cmd='mkdir -p {}'.format(TEMP_FILE_DIR)
    subprocess.Popen(cmd, shell=True)

def parse_files(f):
    files = open(f,'r').read()
    return json.loads(files)

def parse_dir(dir):
    objs = []
    for root, folder, files in os.walk(dir):
        for file in files:
            try:
                http_obj = Mahimahi(os.path.join(root, file))
                objs.append(http_obj)
            except:
                pass
    return objs
def filename(url):
    if len(url) > 50:
        url = url[-50:]
    return url.replace('/',';;');

def dump_file_contents(file,name):
    src = file._plainText
    output_file = '{}/{}'.format(TEMP_FILE_DIR,filename(name))
    open(output_file,'w').write(src)

def extract_imp_files(all_files, imp_file_names):
    # print 'imp files', imp_file_names
    for i in imp_file_names:
        found = False
        for a in all_files:
            if i in a.getUrl():
                found = True
                dump_file_contents(a,i)
                break
        if not found:
            raise Exception('file {} not found'.format(i))

def extract_all_files(all_files):
    for a in all_files:
        type = a.getHeader('content-type');
        if type and 'javascript' in type:
            dump_file_contents(a,a.getUrl())
        
def init_logger():
    log_level = getattr(logging, os.environ.get('LOGLEVEL') or 'INFO')
    logging.basicConfig(level=log_level)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('mm', help="path to the mahimahi directory")
    parser.add_argument('evt_file', help="path to event handler files")
    args = parser.parse_args()
    init_logger()
    init_output_directory()
    all_files = parse_dir(args.mm)
    imp_files = parse_files(args.evt_file)
    # extract_imp_files(all_files, imp_files)
    extract_all_files(all_files)
