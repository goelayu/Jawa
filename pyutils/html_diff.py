import difflib
import logging
import argparse
import os


def diff(args):
    html1 = open(args.input1,'r').readlines()
    html2 = open(args.input2,'r').readlines()
    diffHTML = difflib.HtmlDiff()
    htmldiffs = diffHTML.make_file(html1,html2)
    print htmldiffs 

def init_logger():
    log_level = getattr(logging, os.environ.get('LOGLEVEL') or 'INFO')
    logging.basicConfig(level=log_level)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('input1', help="path to the input mahimahi directory")
    parser.add_argument('input2', help="path to the output mahimahi directory")
    parser.add_argument('output', help='path to the DOM snapshot')
    args = parser.parse_args()
    init_logger()
    diff(args)