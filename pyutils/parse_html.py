# This module parses html files

from bs4 import BeautifulSoup as bs
import argparse
import json

def get_async_scripts(html, network):
    # unescaped_src = src[1:-1].decode('string_escape')
    # print unescaped_src
    soup = bs(html,'html.parser')
    script_tags = soup.find_all('script')
    # urls = [img['src'] for img in img_tags]

    count=0
    for s in script_tags:
        src = s.get("src")
        if src == None:
            continue
        src = src.decode('string_escape').replace('"','')
        # if "analytics" not in src:
        #     continue

        # print network
        # print src

        # for n in network:
        #     print n,src
        #     print n == src
        #     print src in n

        entry = [n for n in network if src in n]
        if len(entry) and (s.get('async') != None or s.get('defer') != None ) :
            count +=1 

    print count


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('input', help="path to the input mahimahi directory")
    parser.add_argument('urls', help='file containing network urlss')
    # parser.add_argument('output', help="path to the output mahimahi directory")
    args = parser.parse_args()
    # init_logger()
    html = open("{}/DOM".format(args.input),'r').read()
    network = json.loads(open(args.urls,'r').read())
    get_async_scripts(html, network)