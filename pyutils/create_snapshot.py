# This module takes in the original mahimahi
# directory and a serialized snapshot of the DOM
# and creates a modified mahimahi directory

import os
import argparse
from stat import S_ISREG, ST_CTIME, ST_MODE
import sys
import subprocess
import logging
from HTMLParser import HTMLParser
import lxml
from lxml.html.clean import Cleaner
from lxml import etree
from bs4 import BeautifulSoup as bs
from pyutils.mahimahi import Mahimahi

def get_time_sorted_files(dir):
    cmd="ls -tr {}".format(dir)
    r = subprocess.Popen(cmd,stdout=subprocess.PIPE, shell=True)
    files = r.stdout.read().split('\n')
    return [f for f in files if f]

def get_first_html(dir,idx=0):
    entries = [os.path.join(dir,path) for path in get_time_sorted_files(dir)]
    # Get their stats
    files = [(path, Mahimahi(path)) for path in entries]

    for f in files:
        # print f
        type = f[1].getHeader('content-type')
        logging.info('checking for file {}'.format(f[0]))
        if f[1].getStatus() == '200' and type and 'html' in type :
            return f
    raise NameError('First HTML file not found')

def create_new_body(body):
    unescaped_body = body[1:-1].decode('string_escape')
    # tree = etree.fromstring(body[1:-1])
    # etree.strip_elements(tree, 'script')
    soup = bs(unescaped_body,'lxml')
    for s in soup(['script','style','link']):
        if s.name != 'link' or \
            ('as' in s.attrs and s.attrs['as'] == 'script') or\
            ('rel' in s.attrs and 'stylesheet' in s.attrs['rel'] ):
            s.extract()
    return str(soup)
    # cl = Cleaner()
    # cl.scripts = True
    # no_script_body = lxml.html.tostring(cl.clean_html(lxml.html.fromstring(unescaped_body)))
    # return etree.tostring(tree)

def decode_html_body(body):
    return body[1:-1].decode('string_escape')
    new_body = escape(body[1:5000])
    new_body = new_body.decode('utf-8')
    parser = HTMLParser()
    new_body = parser.unescape(new_body)
    return new_body.encode('utf-8')

def cp(src, dst):
    #check if the directory doesn't exist
    if not os.path.exists(dst):
        os.makedirs(dst)

    files = [os.path.join(src, f) for f in os.listdir(src)]
    for f in files:
        cmd="cp -p {} {}".format(f, dst)
        subprocess.call(cmd, shell=True)
    logging.debug('Copied {} files to directory {}'.format(len(files), dst))

def create_snapshot(args):
    # copy all files to the dst
    cp(args.input, args.output)
    main_file, main_mahimahi = get_first_html(args.output)
    logging.info('Updating file with url {}'.format(main_mahimahi.getUrl()))
    new_body = open(args.snapshot,'r').read()
    main_mahimahi.updateResponseBody(create_new_body(new_body))
    with open(main_file, 'w') as m:
        m.write(main_mahimahi.getHTTPObj().SerializeToString())
    logging.info('Updated main html with the new snapshot')

def init_logger():
    log_level = getattr(logging, os.environ.get('LOGLEVEL') or 'INFO')
    logging.basicConfig(level=log_level)




if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('input', help="path to the input mahimahi directory")
    parser.add_argument('output', help="path to the output mahimahi directory")
    parser.add_argument('snapshot', help='path to the DOM snapshot')
    args = parser.parse_args()
    init_logger()
    create_snapshot(args)