# This module parses html files

from bs4 import BeautifulSoup as bs
import argparse

def extract_images(file):
    src = open(file,'r').read()
    unescaped_src = src[1:-1].decode('string_escape')
    # print unescaped_src
    soup = bs(unescaped_src,'html.parser')
    img_tags = soup.find_all('img')
    urls = [img['src'] for img in img_tags]

    for url in urls:
        print url


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('input', help="path to the input mahimahi directory")
    # parser.add_argument('output', help="path to the output mahimahi directory")
    args = parser.parse_args()
    # init_logger()
    extract_images(args.input)