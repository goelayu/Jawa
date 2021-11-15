

import urllib2
import argparse
import random
import re
from bs4 import BeautifulSoup as bp


def extract_links(url):
    links = []
    hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
       'Accept-Encoding': 'none',
       'Accept-Language': 'en-US,en;q=0.8',
       'Connection': 'keep-alive'}

    req = urllib2.Request(url, headers=hdr)
    try:
        page = urllib2.urlopen(req,timeout=5)
        soup = bp(page,'lxml')
        for link in soup.findAll('a', attrs={'href': re.compile("^https://")}):
            links.append(link.get('href'))
        
        site_token = url.split('.')[1]
        links_first_party = [l for l in links if site_token in l]
        return links_first_party
    except Exception as e:
        # print e
        return []

def get_pages(args):
    links = extract_links(args.url)
    if args.number > len(links):
        pages = links
    else: pages = random.sample(links, args.number)
    print args.url
    for p in pages:
        print p

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('url',help='url to find pages on')
    parser.add_argument('number',type=int,help='number of pages per url')
    # parser.add_argument('output', help='output file to dump list of urls found')
    args = parser.parse_args()
    get_pages(args)