# This module crawls wayback machine
# by issuing multiple crawls in parallel
import os
import argparse
import multiprocessing as mp
from random import randint
from time import sleep
import subprocess

ADDRESS_FILE=os.getcwd()+'/../../proxy/addresses.ini'

class Crawler:
    ''' Crawls a specific url
        Is tied to a specific forward proxy
    '''
    next_available_address = 0
    addresses = []

    @classmethod
    def init_addresses(cls):
        with open(ADDRESS_FILE,'r') as f:
            a = f.readlines()
            cls.addresses = [i.strip() for i in a]

    def __init__(self, logDir):
        # self.address = Crawler.addresses[Crawler.next_available_address]
        self._log_file = '{}/crawler_{}'.format(logDir,str(Crawler.next_available_address))
        Crawler.next_available_address+=1

    def run(self, url, output, mmpath):
        print 'currently processing site', url
        cmd='node ../crawlWayBack.dedup.js -u {} -o {} -m record -p {}'.format(url, output, mmpath)
        print 'Running', cmd
        log_file = open(self._log_file,'a')
        subprocess.call(cmd, stdout=log_file, shell=True)

def init_crawlers(count, logDir):
    crawlers = []
    for i in range(count):
        c = Crawler(logDir)
        crawlers.append(c)
    return crawlers

def read_sites(f):
    sites = []
    with open(f,'r') as fd:
        a = fd.readlines()
        sites = [i.strip() for i in a]
    return sites

def crawl(sites, idx, crawler, out, mmpath):
    len_sites = len(sites)
    while idx.value < len_sites:
        with idx.get_lock():
            cur_site = sites[idx.value]
            idx.value+=1
        crawler.run(cur_site, out, mmpath )
        # sleep(randint(10,20))
    print 'crawler finished'

def distribute(args):
    # Crawler.init_addresses()
    crawlers = init_crawlers(int(args.count), args.logDir)
    idx = mp.Value('i',0)
    sites = read_sites(args.sites)
    pool = mp.Pool(mp.cpu_count())
    procs = [mp.Process(target=crawl, args=(sites, idx, c, args.outputDir, args.mmpath)) for c in crawlers]
    for ps in procs: ps.start()
    for ps in procs: ps.join()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('sites',help='sites to crawl')
    parser.add_argument('count', help='number of crawlers to instantiate')
    parser.add_argument('outputDir', help='path to the output directory')
    parser.add_argument('mmpath',help='path to the mahimahi directory')
    parser.add_argument('logDir', help='path to the log directory')
    args = parser.parse_args()
    distribute(args)
