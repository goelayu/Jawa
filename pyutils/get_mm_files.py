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
    return url.split('/')[-1]

def dump_file_contents(file):
    src = file._plainText
    output_file = '{}/{}'.format(TEMP_FILE_DIR,filename(file.getUrl()))
    open(output_file,'w').write(src)

def extract_imp_files(all_files, imp_file_names):
    for a in all_files:
        for i in imp_file_names:
            if a.getUrl() in i:
                dump_file_contents(a)

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
    extract_imp_files(all_files, imp_files)
